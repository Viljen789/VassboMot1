// vassbo-mot-1-backend/controllers/gameController.js

const Game = require('../models/Game');
const {generateGameCode} = require('../utils/gameUtils');

// Existing controller functions...

const createGame = async (req, res) => {
    const {title} = req.body;
    let gameCode = generateGameCode();

    console.log(`Creating game with title: ${title} and gameCode: ${gameCode}`);

    try {
        let existingGame = await Game.loadGame(gameCode);
        while (existingGame) {
            gameCode = generateGameCode();
            console.log(`Duplicate gameCode generated: ${gameCode}. Regenerating...`);
            existingGame = await Game.loadGame(gameCode);
        }

        const newGame = await Game.createGame(title, gameCode);

        console.log(`Game created successfully with gameCode: ${gameCode}`);

        res.json(newGame);

        req.app.get('io').to(gameCode).emit('updateGame', newGame);
    } catch (err) {
        console.error('Error creating game:', err);
        res.status(500).json({error: 'An error occurred while creating the game.'});
    }
};

const joinGame = async (req, res) => {
    const {gameCode, playerName} = req.body;

    console.log(`Attempting to join game: ${gameCode} with playerName: ${playerName}`);

    if (!gameCode || !playerName) {
        console.error('Missing gameCode or playerName in request body.');
        return res.status(400).json({error: 'Game code and player name are required.'});
    }

    try {
        const game = await Game.loadGame(gameCode);
        if (!game) {
            console.error(`Game not found: ${gameCode}`);
            return res.status(404).json({error: 'Game not found.'});
        }

        const isDuplicate = game.players.some(player => player.name.toLowerCase() === playerName.toLowerCase());
        if (isDuplicate) {
            console.error(`Player name already taken: ${playerName}`);
            return res.status(400).json({error: 'Player name already taken.'});
        }

        game.addPlayer(playerName);
        await Game.saveGame(gameCode, game);

        console.log(`Player ${playerName} added successfully to game ${gameCode}`);

        req.app.get('io').to(gameCode).emit('updateGame', game);

        res.json({player: {name: playerName, score: 0}});
    } catch (error) {
        console.error('Error adding player:', error);
        res.status(500).json({error: 'An error occurred while adding the player.'});
    }
};

const addQuestion = async (req, res) => {
    const {gameCode, question} = req.body;

    console.log(`Adding question to game: ${gameCode}. Question: ${question.text}`);

    try {
        const game = await Game.loadGame(gameCode);
        if (!game) {
            console.error(`Game not found: ${gameCode}`);
            return res.status(404).json({error: 'Game not found.'});
        }

        game.addQuestion(question);
        await Game.saveGame(gameCode, game);

        console.log(`Question added successfully to game: ${gameCode}`);

        res.json({message: 'Question added.', questions: game.questions});

        req.app.get('io').to(gameCode).emit('updateGame', game);
    } catch (error) {
        console.error('Error adding question:', error);
        res.status(500).json({error: 'An error occurred while adding the question.'});
    }
};

const startGame = async (req, res) => {
    const {gameCode} = req.body;
    const io = req.app.get('io');

    console.log(`Starting game: ${gameCode}`);

    try {
        const game = await Game.loadGame(gameCode);
        if (!game) {
            console.error(`Game not found: ${gameCode}`);
            return res.status(404).json({error: 'Game not found.'});
        }

        game.startGame(io);
        await Game.saveGame(gameCode, game);

        console.log(`Game started: ${gameCode}`);

        res.json({message: 'Game started.', game});

        req.app.get('io').to(gameCode).emit('updateGame', game);
    } catch (err) {
        console.error('Error starting game:', err.message);
        res.status(400).json({error: err.message});
    }
};

const openGuessing = async (req, res) => {
    const {gameCode} = req.body;
    const io = req.app.get('io');

    console.log(`Opening guessing phase for game: ${gameCode}`);

    try {
        const game = await Game.loadGame(gameCode);
        if (!game) {
            console.error(`Game not found: ${gameCode}`);
            return res.status(404).json({error: 'Game not found.'});
        }

        game.startRound(io);
        await Game.saveGame(gameCode, game);

        console.log(`Guessing phase started for game: ${gameCode}`);

        res.json({message: 'Guessing phase started.', game});

        io.to(gameCode).emit('updateGame', game);
    } catch (err) {
        console.error('Error starting round:', err.message);
        res.status(400).json({error: err.message});
    }
};

const setCorrectAnswer = async (req, res) => {
    const {gameCode, correctAnswer} = req.body;
    const io = req.app.get('io');

    console.log(`Setting correct answer for game: ${gameCode}. Correct Answer: ${correctAnswer}`);

    try {
        const game = await Game.loadGame(gameCode);
        if (!game) {
            console.error(`Game not found: ${gameCode}`);
            return res.status(404).json({error: 'Game not found.'});
        }

        game.setCorrectAnswer(correctAnswer, io);
        await Game.saveGame(gameCode, game);

        console.log(`Correct answer set and scores calculated for game: ${gameCode}`);

        res.json({message: 'Correct answer set and scores calculated.', game});

        req.app.get('io').to(gameCode).emit('updateGame', game);
    } catch (err) {
        console.error('Error setting correct answer:', err.message);
        res.status(400).json({error: err.message});
    }
};

const submitGuess = async (req, res) => {
    const {gameCode, playerName, guess} = req.body;

    console.log(`Player ${playerName} submitting guess: ${guess} for game: ${gameCode}`);

    try {
        const game = await Game.loadGame(gameCode);
        if (!game) {
            console.error(`Game not found: ${gameCode}`);
            return res.status(404).json({error: 'Game not found.'});
        }

        game.submitGuess(playerName, guess);
        await Game.saveGame(gameCode, game);

        console.log(`Guess submitted successfully by ${playerName} for game ${gameCode}`);

        res.json({message: 'Guess received.'});

        req.app.get('io').to(gameCode).emit('updateGame', game);
    } catch (err) {
        console.error('Error submitting guess:', err.message);
        res.status(400).json({error: err.message});
    }
};

const updatePhase = async (req, res) => {
    const {gameCode, phase} = req.body;
    const io = req.app.get('io');

    console.log(`Updating phase to ${phase} for game: ${gameCode}`);

    try {
        const game = await Game.loadGame(gameCode);
        if (!game) {
            console.error(`Game not found: ${gameCode}`);
            return res.status(404).json({error: 'Game not found.'});
        }

        game.setPhase(phase);
        await Game.saveGame(gameCode, game);

        console.log(`Phase updated to ${phase} for game: ${gameCode}`);

        req.app.get('io').to(gameCode).emit('updatePhase', {phase, gameCode});

        res.json({message: `Phase set to ${phase}.`});
    } catch (error) {
        console.error('Error updating phase:', error);
        res.status(500).json({error: 'Error updating phase.'});
    }
};

const setNextPhase = async (req, res) => {
    const {gameCode} = req.body;
    const io = req.app.get('io');

    console.log(`Setting next phase for game: ${gameCode}`);

    try {
        const game = await Game.loadGame(gameCode);
        if (!game) {
            console.error(`Game not found: ${gameCode}`);
            return res.status(404).json({error: 'Game not found.'});
        }

        game.setNextPhase();
        await Game.saveGame(gameCode, game);

        console.log(`Next phase set for game: ${gameCode}`);

        req.app.get('io').to(gameCode).emit('updateGame', game);

        res.json({message: 'Phase updated.', game});
    } catch (err) {
        console.error('Error setting next phase:', err.message);
        res.status(400).json({error: err.message});
    }
};

const updateQuestion = async (req, res) => {
    const {gameCode, index} = req.params;
    const {text, rangeMin, rangeMax} = req.body;
    const io = req.app.get('io');

    console.log(`Updating question at index ${index} for game: ${gameCode}`);

    try {
        const game = await Game.loadGame(gameCode);
        if (!game) {
            console.error(`Game not found: ${gameCode}`);
            return res.status(404).json({error: 'Game not found.'});
        }

        const questionIndex = Number(index);
        if (isNaN(questionIndex) || questionIndex < 0 || questionIndex >= game.questions.length) {
            console.error(`Invalid question index: ${index}`);
            return res.status(400).json({error: 'Invalid question index.'});
        }

        const min = Number(rangeMin);
        const max = Number(rangeMax);
        if (isNaN(min) || isNaN(max) || min >= max) {
            console.error(`Invalid range values: min=${rangeMin}, max=${rangeMax}`);
            return res.status(400).json({error: 'Invalid range values.'});
        }

        game.questions[questionIndex].text = text;
        game.questions[questionIndex].rangeMin = min;
        game.questions[questionIndex].rangeMax = max;

        await Game.saveGame(gameCode, game);

        console.log(`Question at index ${index} updated successfully for game: ${gameCode}`);

        res.json({message: 'Question updated.', question: game.questions[questionIndex]});

        req.app.get('io').to(gameCode).emit('updateGame', game);
    } catch (error) {
        console.error('Error updating question:', error);
        res.status(500).json({error: 'Error updating question.'});
    }
};

// **New Controller Function**
const getGame = async (req, res) => {
    const {gameCode} = req.params;

    try {
        const game = await Game.loadGame(gameCode);
        if (!game) {
            return res.status(404).json({error: 'Game not found.'});
        }
        res.json(game);
    } catch (err) {
        console.error('Error fetching game:', err);
        res.status(500).json({error: 'An error occurred while fetching the game.'});
    }
};

// **New Controller Function**
const validateGameCode = async (req, res) => {
    const {gameCode} = req.params;

    try {
        const game = await Game.loadGame(gameCode);
        res.json({isValid: !!game});
    } catch (err) {
        console.error('Error validating game code:', err);
        res.status(500).json({error: 'Error validating game code.'});
    }
};

// Export all controller functions
module.exports = {
    createGame,
    joinGame,
    addQuestion,
    startGame,
    openGuessing,
    setCorrectAnswer,
    submitGuess,
    updatePhase,
    setNextPhase,
    updateQuestion,
    validateGameCode, // Now properly defined
    getGame, // Ensure getGame is exported
};

// vassbo-mot-1-backend/controllers/gameController.js

const Game = require('../models/game');
const {generateGameCode} = require('../utils/gameUtils');

const games = {};

const updatePhase = (req, res) => {
	const {gameCode, phase} = req.body;
	const game = games[gameCode];

	if (!game) {
		return res.status(404).json({error: 'Spill ikke funnet.'});
	}

	game.phase = phase;
	req.app.get('io').to(gameCode).emit('updatePhase', {phase}); // Broadcast phase

	res.json({message: `Phase set to ${phase}.`});
};
const createGame = (req, res) => {
	const {title} = req.body;
	console.log('Received create-game request with title:', title);
	let gameCode = generateGameCode();

	// Sørg for at koden er unik
	while (games[gameCode]) {
		console.log('Generated gameCode already exists:', gameCode);
		gameCode = generateGameCode();
	}

	const newGame = new Game(title, gameCode);
	games[gameCode] = newGame;

	console.log('Game created with gameCode:', gameCode);

	res.json(newGame);

	// Emit til alle tilkoblede klienter
	req.app.get('io').emit('updateGame', newGame);
};

const joinGame = (req, res) => {
	const {gameCode, playerName} = req.body;
	console.log('Received join-game request:', {gameCode, playerName});

	const game = games[gameCode];
	if (!game) {
		console.log('Game not found:', gameCode);
		return res.status(404).json({error: 'Spill ikke funnet.'});
	}

	try {
		// Verify playerName is not duplicated in this game
		const isDuplicateName = game.players.some((player) => player.name === playerName);
		if (isDuplicateName) {
			console.error(`Duplicate player name attempted: ${playerName}`);
			return res.status(400).json({error: 'Spillernavn er allerede tatt.'});
		}

		game.addPlayer(playerName);
	} catch (err) {
		console.error('Error adding player:', err.message);
		return res.status(400).json({error: err.message});
	}

	console.log('Player added:', playerName, 'to game:', gameCode);

	res.json({message: 'Spiller lagt til.', player: {name: playerName, score: 0}});

	// Emit updated game state to all clients
	req.app.get('io').emit('updateGame', game);
};

const addQuestion = (req, res) => {
	const {gameCode, question} = req.body;
	console.log('Received add-question request for gameCode:', gameCode, 'Question:', question);

	const game = games[gameCode];
	if (!game) {
		console.log('Game not found:', gameCode);
		return res.status(404).json({error: 'Spill ikke funnet.'});
	}

	game.addQuestion(question);
	console.log('Question added to game:', gameCode, 'Question:', question);

	res.json({message: 'Spørsmål lagt til.', questions: game.questions});

	// Emit til alle tilkoblede klienter
	req.app.get('io').emit('updateGame', game);
};

const startGame = (req, res) => {
	const {gameCode} = req.body;
	const io = req.app.get('io'); // Hent io fra Express app

	console.log('Starting game for gameCode:', gameCode);
	console.log('Available games:', games);

	const game = games[gameCode];
	if (!game) {
		console.error('Game not found:', gameCode);
		return res.status(404).json({error: 'Spill ikke funnet.'});
	}

	try {
		console.log('Starting game logic for gameCode:', gameCode);
		game.startGame(io); // Send io til modellen
		res.json({message: 'Spill startet.', game});
	} catch (err) {
		console.error('Error starting game:', err.message);
		res.status(400).json({error: err.message});
	}
};


const validateGameCode = (req, res) => {
	const {gameCode} = req.params;
	console.log('Received validateGameCode request for:', gameCode);

	const game = games[gameCode];
	if (game) {
		res.json({isValid: true});
	} else {
		res.json({isValid: false});
	}
};

const startRound = (req, res) => {
	const {gameCode} = req.body;
	console.log('Received start-round request for gameCode:', gameCode);

	const game = games[gameCode];
	if (!game) {
		console.log('Game not found:', gameCode);
		return res.status(404).json({error: 'Spill ikke funnet.'});
	}

	try {
		game.startRound(req.app.get('io')); // Sender `io` korrekt
	} catch (err) {
		console.log('Error starting round:', err.message);
		return res.status(400).json({error: err.message});
	}

	console.log('Round started for gameCode:', gameCode);

	res.json({message: 'Runde startet.', game});

	// Emit til alle tilkoblede klienter
	req.app.get('io').emit('updateGame', game);
};

const setCorrectAnswer = (req, res) => {
	const {gameCode, correctAnswer} = req.body;
	console.log('Received set-correct-answer request for gameCode:', gameCode, 'Correct Answer:', correctAnswer);

	const game = games[gameCode];
	if (!game) {
		console.log('Game not found:', gameCode);
		return res.status(404).json({error: 'Spill ikke funnet.'});
	}

	try {
		game.setCorrectAnswer(correctAnswer, req.app.get('io'));
	} catch (err) {
		console.log('Error setting correct answer:', err.message);
		return res.status(400).json({error: err.message});
	}

	res.json({message: 'Riktig svar satt og poeng beregnet.', game});

	// Emit til alle tilkoblede klienter
	req.app.get('io').emit('updateGame', game);
};

const submitGuess = (req, res) => {
	const {gameCode, playerName, guess} = req.body;
	console.log('Received submit-guess request:', {gameCode, playerName, guess});

	const game = games[gameCode];
	if (!game) {
		console.log('Game not found:', gameCode);
		return res.status(404).json({error: 'Spill ikke funnet.'});
	}

	try {
		game.submitGuess(playerName, guess, req.app.get('io'));
	} catch (err) {
		console.log('Error submitting guess:', err.message);
		return res.status(400).json({error: err.message});
	}

	res.json({message: 'Gjetning mottatt.'});

	// Emit til alle tilkoblede klienter
	req.app.get('io').emit('updateGame', game);
};
const updateQuestion = (req, res) => {
	const {gameCode, index} = req.params; // Get gameCode and question index from URL parameters
	const {text, range} = req.body; // Get updated question data

	console.log(`Received update-question request for gameCode: ${gameCode} and index: ${index}`);

	const game = games[gameCode];
	if (!game) {
		console.log('Game not found:', gameCode);
		return res.status(404).json({error: 'Spill ikke funnet.'});
	}

	try {
		// Use the Game class's method to handle the validation and question update
		game.updateQuestion(index, {text, range});

		console.log(`Question at index ${index} in gameCode ${gameCode} updated successfully.`);
		res.json({message: 'Spørsmålet ble oppdatert.', question: game.questions[index]});

		// Emit change to all connected clients
		req.app.get('io').emit('updateGame', game);
	} catch (err) {
		console.log('Error updating question:', err.message);
		res.status(400).json({error: err.message});
	}
};

module.exports = {
	createGame,
	joinGame,
	addQuestion,
	startGame,
	validateGameCode,
	startRound,
	setCorrectAnswer,
	submitGuess,
	updateQuestion
};

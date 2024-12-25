// vassbo-mot-1-backend/controllers/gameController.js

const Game = require('../models/game');
const {generateGameCode} = require('../utils/gameUtils');

const games = {};

// Controller funksjoner

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
		game.addPlayer(playerName);
	} catch (err) {
		console.log('Error adding player:', err.message);
		return res.status(400).json({error: err.message});
	}

	console.log('Player added:', playerName, 'to game:', gameCode);

	res.json({message: 'Spiller lagt til.', player: {name: playerName, score: 0}});

	// Emit til alle tilkoblede klienter
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
	console.log('Received start-game request for gameCode:', gameCode);

	const game = games[gameCode];
	if (!game) {
		console.log('Game not found:', gameCode);
		return res.status(404).json({error: 'Spill ikke funnet.'});
	}

	try {
		game.startGame();
	} catch (err) {
		console.log('Error starting game:', err.message);
		return res.status(400).json({error: err.message});
	}

	console.log('Game started:', gameCode);

	res.json({message: 'Spill startet.', game});

	// Emit til alle tilkoblede klienter
	req.app.get('io').emit('updateGame', game);
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

module.exports = {
	createGame,
	joinGame,
	addQuestion,
	startGame,
	validateGameCode,
	startRound,
	setCorrectAnswer,
	submitGuess
};

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

// ... resten av kontrollerne

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

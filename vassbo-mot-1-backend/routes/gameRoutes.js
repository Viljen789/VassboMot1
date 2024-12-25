// vassbo-mot-1-backend/routes/gameRoutes.js

const express = require('express');
const router = express.Router();
const Game = require('../models/game');

// En enkel måte å holde spill på. I en ekte applikasjon bør dette være i en database.
const games = {};

// Opprett et nytt spill
router.post('/create-game', (req, res) => {
	const io = req.app.get('io');
	const {title} = req.body;
	const gameCode = Math.floor(100000 + Math.random() * 900000).toString(); // Generer en 6-sifret kode
	const game = new Game(title, gameCode);
	games[gameCode] = game;
	console.log(`Spill opprettet med gameCode: ${gameCode}`);
	res.status(201).json({gameCode, title});
});

// Bli med i et spill
router.post('/join-game', (req, res) => {
	const io = req.app.get('io');
	const {gameCode, playerName} = req.body;
	const game = games[gameCode];

	console.log(`Join-game request for gameCode: ${gameCode}, playerName: ${playerName}`);

	if (!game) {
		return res.status(404).json({error: 'Spill ikke funnet.'});
	}

	try {
		game.addPlayer(playerName);
		io.to(gameCode).emit('updateGame', game);
		console.log(`Spiller ${playerName} har blitt med i spill ${gameCode}`);
		res.status(200).json({message: 'Bli med i spillet.', gameCode, playerName});
	} catch (error) {
		console.error('Error joining game:', error);
		res.status(400).json({error: error.message});
	}
});

// Start spillet
router.post('/start-game', (req, res) => {
	const io = req.app.get('io');
	const {gameCode} = req.body;
	console.log(`Received start-game request for gameCode: ${gameCode}`);
	console.log('io:', io);
	const game = games[gameCode];

	if (!game) {
		return res.status(404).json({error: 'Spill ikke funnet.'});
	}

	try {
		game.startGame(io);
		console.log(`Spillet ${gameCode} er startet.`);
		res.status(200).json({message: 'Spillet er startet.'});
	} catch (error) {
		console.error('Error starting game:', error);
		res.status(400).json({error: error.message});
	}
});

// Legg til et spørsmål
router.post('/add-question', (req, res) => {
	const io = req.app.get('io');
	const {gameCode, question} = req.body;
	const game = games[gameCode];

	console.log(`Add-question request for gameCode: ${gameCode}, question: ${question.text}`);

	if (!game) {
		return res.status(404).json({error: 'Spill ikke funnet.'});
	}

	try {
		game.addQuestion(question);
		io.to(gameCode).emit('updateGame', game);
		console.log(`Spørsmål lagt til i spill ${gameCode}: ${question.text}`);
		res.status(200).json({message: 'Spørsmål lagt til.'});
	} catch (error) {
		console.error('Error adding question:', error);
		res.status(400).json({error: error.message});
	}
});

// Start en runde
router.post('/start-round', (req, res) => {
	const io = req.app.get('io');
	const {gameCode} = req.body;
	const game = games[gameCode];

	console.log(`Start-round request for gameCode: ${gameCode}`);

	if (!game) {
		return res.status(404).json({error: 'Spill ikke funnet.'});
	}

	try {
		game.startRound(io);
		console.log(`Runde startet for spill ${gameCode}`);
		res.status(200).json({message: 'Runde startet.'});
	} catch (error) {
		console.error('Error starting round:', error);
		res.status(400).json({error: error.message});
	}
});

// Sett riktig svar
router.post('/set-correct-answer', (req, res) => {
	const io = req.app.get('io');
	const {gameCode, correctAnswer} = req.body;
	const game = games[gameCode];

	console.log(`Set-correct-answer request for gameCode: ${gameCode}, correctAnswer: ${correctAnswer}`);

	if (!game) {
		return res.status(404).json({error: 'Spill ikke funnet.'});
	}

	try {
		game.setCorrectAnswer(correctAnswer, io);
		console.log(`Riktig svar satt for spill ${gameCode}: ${correctAnswer}`);
		res.status(200).json({message: 'Riktig svar satt.'});
	} catch (error) {
		console.error('Error setting correct answer:', error);
		res.status(400).json({error: error.message});
	}
});

// Submit guess
router.post('/submit-guess', (req, res) => {
	const io = req.app.get('io');
	const {gameCode, playerName, guess} = req.body;
	const game = games[gameCode];

	console.log(`Submit-guess request for gameCode: ${gameCode}, playerName: ${playerName}, guess: ${guess}`);

	if (!game) {
		return res.status(404).json({error: 'Spill ikke funnet.'});
	}

	try {
		game.submitGuess(playerName, guess, io);
		console.log(`Spiller ${playerName} sendte inn gjetning ${guess} i spill ${gameCode}`);
		res.status(200).json({message: 'Gjetning mottatt.'});
	} catch (error) {
		console.error('Error submitting guess:', error);
		res.status(400).json({error: error.message});
	}
});

module.exports = router;

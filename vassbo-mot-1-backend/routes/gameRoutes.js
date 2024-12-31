// vassbo-mot-1-backend/routes/gameRoutes.js

const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');

// Route to create a new game
router.post('/create-game', gameController.createGame);

// Route to join an existing game
router.post('/join-game', gameController.joinGame);

// Route to add a question to a game
router.post('/add-question', gameController.addQuestion);

// Route to start a game
router.post('/start-game', gameController.startGame);

// Route to validate a game code
router.get('/validateGameCode/:gameCode', gameController.validateGameCode);

// Route to start a round
router.post('/start-round', gameController.startRound);

// Route to set the correct answer
router.post('/set-correct-answer', gameController.setCorrectAnswer);

// Route to submit a guess
router.post('/submit-guess', gameController.submitGuess);

// Route to update a question
router.put('/games/:gameCode/questions/:index', gameController.updateQuestion);

// Route to get game details
router.get('/games/:gameCode', (req, res) => {
	const {gameCode} = req.params;
	const game = gameController.games[gameCode];

	if (!game) {
		console.error(`Game not found for gameCode: ${gameCode}`);
		return res.status(404).json({error: 'Game not found.'});
	}

	res.json(game);
});

module.exports = router;

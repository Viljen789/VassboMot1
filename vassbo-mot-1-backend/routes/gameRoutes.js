// vassbo-mot-1-backend/routes/gameRoutes.js

const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const Game = require('../models/game');

const games = {}; // Assuming this is where you store the games in memory

// Update a specific question for a game
router.put('/api/games/:gameCode/questions/:index', (req, res) => {
	const {gameCode, index} = req.params;
	const {text, range} = req.body;

	const game = games[gameCode];
	if (!game) {
		console.log('Game not found:', gameCode);
		return res.status(404).json({error: 'Spill ikke funnet.'});
	}

	try {
		game.updateQuestion(index, {text, range}); // Use the Game method
		res.json(game.questions[index]); // Respond with the updated question
	} catch (error) {
		res.status(400).json({error: error.message});
	}
});
// Definer ruter
router.post('/create-game', gameController.createGame);
router.post('/join-game', gameController.joinGame);
router.post('/add-question', gameController.addQuestion);
router.post('/start-game', gameController.startGame);
router.get('/validateGameCode/:gameCode', gameController.validateGameCode);
router.post('/start-round', gameController.startRound);
router.post('/set-correct-answer', gameController.setCorrectAnswer);
router.post('/submit-guess', gameController.submitGuess);

module.exports = router;

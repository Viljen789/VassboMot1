const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');

// Route to create a new game
router.post('/create-game', gameController.createGame);

// Route to join a game
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

module.exports = router;
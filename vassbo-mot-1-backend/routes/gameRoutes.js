// vassbo-mot-1-backend/routes/gameRoutes.js

const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');

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

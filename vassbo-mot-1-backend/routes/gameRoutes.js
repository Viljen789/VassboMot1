// vassbo-mot-1-backend/routes/gameRoutes.js

const express = require("express");
const router = express.Router();
const gameController = require("../controllers/gameController");

// **GET** /api/games/:gameCode - Fetch a game by gameCode
router.get("/games/:gameCode", gameController.getGame);

// **POST** /api/create-game - Create a new game
router.post("/create-game", gameController.createGame);

// **POST** /api/join-game - Join a game
router.post("/join-game", gameController.joinGame);

// **POST** /api/add-question - Add a question to a game
router.post("/add-question", gameController.addQuestion);

// **POST** /api/start-game - Start a game
router.post("/start-game", gameController.startGame);

// **POST** /api/open-guessing - Open the guessing phase
router.post("/open-guessing", gameController.openGuessing);

// **POST** /api/set-correct-answer - Set the correct answer
router.post("/set-correct-answer", gameController.setCorrectAnswer);

// **POST** /api/submit-guess - Submit a guess
router.post("/submit-guess", gameController.submitGuess);

// **POST** /api/updatePhase - Update phase
router.post("/updatePhase", gameController.updatePhase);

// **POST** /api/set-next-phase - Set the next phase
router.post("/set-next-phase", gameController.setNextPhase);

// **PUT** /api/games/:gameCode/questions/:index - Update a specific question
router.put("/games/:gameCode/questions/:index", gameController.updateQuestion);

// **GET** /api/validateGameCode/:gameCode - Validate game code
router.get("/validateGameCode/:gameCode", gameController.validateGameCode);

router.post("/games/:gameCode/nextQuestion", gameController.nextQuestion);

module.exports = router;

// vassbo-mot-1-backend/tests/gameFlowTest.js

const axios = require("axios");
const { io } = require("socket.io-client");

const backendUrl = "http://localhost:3001/api";
const gameCode = "TEST123"; // Use a fixed game code for testing

const testGameFlow = async () => {
  try {
    // Create a new game
    await axios.post(`${backendUrl}/create-game`, { title: "Test Game" });

    // Add players
    await axios.post(`${backendUrl}/join-game`, {
      gameCode,
      playerName: "Player1",
    });
    await axios.post(`${backendUrl}/join-game`, {
      gameCode,
      playerName: "Player2",
    });

    // Add questions
    await axios.post(`${backendUrl}/add-question`, {
      gameCode,
      question: { text: "Question1", rangeMin: 0, rangeMax: 10 },
    });

    // Start the game
    await axios.post(`${backendUrl}/start-game`, { gameCode });

    // Open guessing phase
    await axios.post(`${backendUrl}/open-guessing`, { gameCode });

    // Submit guesses
    await axios.post(`${backendUrl}/submit-guess`, {
      gameCode,
      playerName: "Player1",
      guess: 5,
    });
    await axios.post(`${backendUrl}/submit-guess`, {
      gameCode,
      playerName: "Player2",
      guess: 7,
    });

    // Set correct answer
    await axios.post(`${backendUrl}/set-correct-answer`, {
      gameCode,
      correctAnswer: 6,
    });

    console.log("Test completed successfully");
  } catch (err) {
    console.error("Test failed:", err.message);
  }
};

testGameFlow();

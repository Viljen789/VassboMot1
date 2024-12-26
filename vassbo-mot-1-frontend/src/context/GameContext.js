// src/context/GameContext.js

import React, {createContext, useState, useEffect} from 'react';
import axios from 'axios';
import {io} from 'socket.io-client';

// Opprett konteksten
export const GameContext = createContext();

// Opprett GameProvider-komponenten
export const GameProvider = ({children}) => {
	const [games, setGames] = useState({});

	// Initialiser Socket.io klient
	useEffect(() => {
		const socket = io('http://localhost:3001'); // Backend URL

		// Lytt etter 'updateGame' hendelser
		socket.on('updateGame', (updatedGame) => {
			setGames(prevGames => ({
				...prevGames,
				[updatedGame.gameCode]: updatedGame
			}));
		});

		// Rydd opp ved komponentavlasting
		return () => {
			socket.disconnect();
		};
	}, []);
	useEffect(() => {
		const socket = io("http://localhost:3000");

		socket.on('gameEnded', ({leaderboard}) => {
			console.log('Game ended - Final leaderboard:', leaderboard);
			// Handle any other state updates relevant to the context here if needed
		});

		return () => socket.disconnect(); // Cleanup
	}, []);
	// Definer funksjonene
	const createGame = async (title) => {
		try {
			const response = await axios.post('http://localhost:3001/create-game', {title});
			return response.data;
		} catch (error) {
			console.error('Error creating game:', error);
			throw error;
		}
	};

	const joinGame = (req, res) => {
		const {gameCode, playerName} = req.body;
		console.log('Received join-game request:', {gameCode, playerName});

		const game = games[gameCode];
		if (!game) {
			console.log('Game not found:', gameCode);
			return res.status(404).json({error: 'Spill ikke funnet.'});
		}

		let uniquePlayerName = playerName || `Player_${Math.random().toString(36).substring(7)}`;
		let counter = 1;

		// Ensure player name is unique
		while (game.players.some((player) => player.name === uniquePlayerName)) {
			uniquePlayerName = `${playerName || "Player"}_${counter}`;
			counter++;
		}

		try {
			game.addPlayer(uniquePlayerName);
		} catch (err) {
			console.error('Error adding player:', err);
			return res.status(400).json({error: err.message});
		}

		console.log('Player added:', uniquePlayerName, 'to game:', gameCode);

		// Send back the unique player name assigned
		res.json({message: 'Spiller lagt til.', player: {name: uniquePlayerName, score: 0}});

		// Emit updated game state to all clients
		req.app.get('io').emit('updateGame', game);
	};

	const addQuestion = async (gameCode, question) => {
		try {
			const response = await axios.post('http://localhost:3001/add-question', {gameCode, question});
			return response.data;
		} catch (error) {
			console.error('Error adding question:', error);
			throw error;
		}
	};

	const startGame = async (gameCode) => {
		try {
			const response = await axios.post('http://localhost:3001/start-game', {gameCode});
			return response.data;
		} catch (error) {
			console.error('Error starting game:', error);
			throw error;
		}
	};

	const validateGameCode = async (gameCode) => {
		try {
			console.log(`Validating game code: ${gameCode}`);
			const response = await axios.get(`http://localhost:3001/validateGameCode/${gameCode}`);
			console.log('Validate game code response:', response.data);
			return response.data.isValid;
		} catch (error) {
			console.error('Error validating game code:', error);
			throw error;
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
	};

	const setCorrectAnswer = async (gameCode, correctAnswer) => {
		try {
			const response = await axios.post('http://localhost:3001/set-correct-answer', {gameCode, correctAnswer});
			return response.data;
		} catch (error) {
			console.error('Error setting correct answer:', error);
			throw error;
		}
	};

	const submitGuess = async (gameCode, playerName, guess) => {
		try {
			const response = await axios.post('http://localhost:3001/submit-guess', {gameCode, playerName, guess});
			return response.data;
		} catch (error) {
			console.error('Error submitting guess:', error);
			throw error;
		}
	};
	const updateQuestion = async (gameCode, index, updatedQuestion) => {
		try {
			// Call the backend API to update the question
			const response = await axios.put(`/api/games/${gameCode}/questions/${index}`, updatedQuestion);

			// Update the local games state with the updated question
			setGames((prevGames) => {
				const updatedGames = {...prevGames};
				if (!updatedGames[gameCode] || !updatedGames[gameCode].questions) {
					throw new Error('Game data is missing or corrupted.');
				}
				updatedGames[gameCode].questions[index] = response.data; // Update the specific question
				return updatedGames;
			});

			console.log('Question successfully updated:', response.data);
			return response.data;
		} catch (error) {
			console.error('Error updating question:', error);
			throw error; // Allow the caller to handle the error
		}
	};

	return (
		<GameContext.Provider value={{
			games,
			createGame,
			joinGame,
			addQuestion,
			startGame,
			validateGameCode,
			startRound,
			setCorrectAnswer,
			submitGuess,
			updateQuestion
		}}>
			{children}
		</GameContext.Provider>
	);
};

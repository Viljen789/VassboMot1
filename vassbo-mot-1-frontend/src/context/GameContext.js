// src/context/GameContext.js

import React, {createContext, useState, useEffect} from 'react';
import axios from 'axios';
import {io} from 'socket.io-client';

// Create the context
export const GameContext = createContext();

// Create the GameProvider component
export const GameProvider = ({children}) => {
	const [games, setGames] = useState({});

	// Initialize Socket.io client
	useEffect(() => {
		const backendUrl = `${window.location.protocol}//${window.location.hostname}:3001`;
		const socket = io(backendUrl);

		// Listen for 'updateGame' events
		socket.on('updateGame', (updatedGame) => {
			console.log('Received updated game state:', updatedGame);
			setGames((prevGames) => ({
				...prevGames,
				[updatedGame.gameCode]: updatedGame,
			}));
		});

		// Optionally, handle other Socket.io events like 'updatePhase'
		socket.on('updatePhase', ({phase}) => {
			console.log('Received phase update:', phase);
			// Implement phase handling logic if necessary
		});

		// Clean up the socket connection on unmount
		return () => {
			socket.disconnect();
		};
	}, []);

	// Define the API functions with '/api' prefix
	const createGame = async (title) => {
		try {
			const backendUrl = `${window.location.protocol}//${window.location.hostname}:3001/api`;
			const response = await axios.post(`${backendUrl}/create-game`, {title});
			return response.data;
		} catch (error) {
			console.error('Error creating game:', error);
			throw error;
		}
	};

	const joinGame = async (gameCode, playerName) => {
		try {
			const backendUrl = `${window.location.protocol}//${window.location.hostname}:3001/api`;
			const response = await axios.post(`${backendUrl}/join-game`, {
				gameCode,
				playerName,
			});

			console.log('Response from backend joinGame:', response.data); // Debug the response
			return response.data; // Return only the `data` property
		} catch (error) {
			console.error('Error in joinGame API call:', error.response || error.message || error);
			throw error;
		}
	};

	const addQuestion = async (gameCode, question) => {
		try {
			const backendUrl = `${window.location.protocol}//${window.location.hostname}:3001/api`;
			const response = await axios.post(`${backendUrl}/add-question`, {
				gameCode,
				question,
			});

			setGames((prevGames) => ({
				...prevGames,
				[gameCode]: {
					...prevGames[gameCode],
					questions: response.data.questions, // Use the updated array
				},
			}));

			return response.data;
		} catch (error) {
			console.error('Error adding question:', error);
			throw error;
		}
	};

	const startGame = async (gameCode) => {
		try {
			const backendUrl = `${window.location.protocol}//${window.location.hostname}:3001/api`;
			const response = await axios.post(`${backendUrl}/start-game`, {
				gameCode,
			});

			return response.data;
		} catch (error) {
			console.error('Error starting game:', error);
			throw error;
		}
	};

	const validateGameCode = async (gameCode) => {
		try {
			console.log(`Validating game code: ${gameCode}`);
			const backendUrl = `${window.location.protocol}//${window.location.hostname}:3001/api`;
			const response = await axios.get(`${backendUrl}/validateGameCode/${gameCode}`);

			console.log('Validate game code response:', response.data);
			return response.data.isValid;
		} catch (error) {
			console.error('Error validating game code:', error);
			throw error;
		}
	};

	const startRound = async (gameCode) => {
		try {
			const backendUrl = `${window.location.protocol}//${window.location.hostname}:3001/api`;
			const response = await axios.post(`${backendUrl}/start-round`, {
				gameCode,
			});

			return response.data;
		} catch (error) {
			console.error('Error starting round:', error);
			throw error;
		}
	};

	const setCorrectAnswer = async (gameCode, correctAnswer) => {
		try {
			const backendUrl = `${window.location.protocol}//${window.location.hostname}:3001/api`;
			const response = await axios.post(`${backendUrl}/set-correct-answer`, {
				gameCode,
				correctAnswer,
			});

			return response.data;
		} catch (error) {
			console.error('Error setting correct answer:', error);
			throw error;
		}
	};

	const submitGuess = async (gameCode, playerName, guess) => {
		try {
			const backendUrl = `${window.location.protocol}//${window.location.hostname}:3001/api`;
			const response = await axios.post(`${backendUrl}/submit-guess`, {
				gameCode,
				playerName,
				guess,
			});

			return response.data;
		} catch (error) {
			console.error('Error submitting guess:', error);
			throw error;
		}
	};

	const updateQuestion = async (gameCode, index, updatedQuestion) => {
		try {
			const backendUrl = `${window.location.protocol}//${window.location.hostname}:3001/api`;
			const response = await axios.put(`${backendUrl}/games/${gameCode}/questions/${index}`, updatedQuestion);

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
			updateQuestion,
			setGames
		}}>
			{children}
		</GameContext.Provider>
	);
};

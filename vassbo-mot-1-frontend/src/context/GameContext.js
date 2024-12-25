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

	const joinGame = async (gameCode, playerName) => {
		try {
			console.log(`Joining game: ${gameCode} as ${playerName}`);
			const response = await axios.post('http://localhost:3001/join-game', {gameCode, playerName});
			console.log('Join game response:', response.data);
			return response.data;
		} catch (error) {
			console.error('Error joining game:', error);
			throw error;
		}
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

	const startRound = async (gameCode) => {
		try {
			const response = await axios.post('http://localhost:3001/start-round', {gameCode});
			return response.data;
		} catch (error) {
			console.error('Error starting round:', error);
			throw error;
		}
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
			submitGuess
		}}>
			{children}
		</GameContext.Provider>
	);
};

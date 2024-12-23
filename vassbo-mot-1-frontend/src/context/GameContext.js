// vassbo-mot-1-frontend/src/context/GameContext.js

import React, {createContext, useState, useEffect} from 'react';
import axios from 'axios';
import {io} from 'socket.io-client';

export const GameContext = createContext();

export const GameProvider = ({children}) => {
	const [games, setGames] = useState({});

	useEffect(() => {
		// Koble til Socket.io-serveren
		const socket = io('http://localhost:3001'); // Juster URL om nødvendig

		// Lytt etter 'updateGame' hendelser
		socket.on('updateGame', (updatedGame) => {
			console.log('Received updateGame:', updatedGame);
			setGames((prevGames) => ({
				...prevGames,
				[updatedGame.gameCode]: updatedGame,
			}));
		});

		// Rydde opp ved unmount
		return () => {
			socket.disconnect();
		};
	}, []);

	const createGame = async (title) => {
		try {
			const response = await axios.post('http://localhost:3001/create-game', {title});
			console.log('createGame response:', response.data);
			return response.data;
		} catch (error) {
			console.error('Error creating game:', error);
			throw error;
		}
	};

	const joinGame = async (gameCode, playerName) => {
		try {
			const response = await axios.post('http://localhost:3001/join-game', {gameCode, playerName});
			console.log('joinGame response:', response.data);
			return response.data;
		} catch (error) {
			console.error('Error joining game:', error);
			throw error;
		}
	};

	const addQuestion = async (gameCode, question) => {
		try {
			const response = await axios.post('http://localhost:3001/add-question', {gameCode, question});
			console.log('addQuestion response:', response.data);
			return response.data;
		} catch (error) {
			console.error('Error adding question:', error);
			throw error;
		}
	};

	const startGame = async (gameCode) => {
		try {
			const response = await axios.post('http://localhost:3001/start-game', {gameCode});
			console.log('startGame response:', response.data);
			return response.data;
		} catch (error) {
			console.error('Error starting game:', error);
			throw error;
		}
	};

	const validateGameCode = async (gameCode) => {
		try {
			const response = await axios.get(`http://localhost:3001/validateGameCode/${gameCode}`);
			console.log('validateGameCode response:', response.data);
			return response.data.isValid;
		} catch (error) {
			console.error('Error validating game code:', error);
			return false;
		}
	};

	return (
		<GameContext.Provider value={{createGame, joinGame, addQuestion, startGame, games, validateGameCode}}>
			{children}
		</GameContext.Provider>
	);
};

// src/context/GameContext.js

import React, {createContext, useState, useEffect} from 'react';
import {io} from 'socket.io-client';
import axios from 'axios';

// Create the context
export const GameContext = createContext();

// Create the GameProvider component
export const GameProvider = ({children}) => {
    const [games, setGames] = useState({});
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const backendUrl = `${window.location.protocol}//${window.location.hostname}:3001`;
        const newSocket = io(backendUrl);
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Connected to Socket.IO server');
        });

        newSocket.on('updateGame', (updatedGame) => {
            console.log('Received updateGame:', updatedGame);
            setGames((prevGames) => ({
                ...prevGames,
                [updatedGame.gameCode]: updatedGame,
            }));
        });

        newSocket.on('updatePhase', ({phase, gameCode}) => {
            console.log(`Received updatePhase for ${gameCode}: ${phase}`);
            setGames((prevGames) => ({
                ...prevGames,
                [gameCode]: {
                    ...prevGames[gameCode],
                    phase,
                },
            }));
        });

        newSocket.on('gameEnded', ({leaderboard, gameCode}) => {
            console.log(`Game ended for ${gameCode}. Leaderboard:`, leaderboard);
            setGames((prevGames) => ({
                ...prevGames,
                [gameCode]: {
                    ...prevGames[gameCode],
                    phase: 5, // Phase 5: Game Ended
                    leaderboard,
                },
            }));
        });

        return () => {
            newSocket.disconnect();
        };
    }, []);

    // Function to join a room
    const joinRoom = (gameCode) => {
        if (socket) {
            socket.emit('joinRoom', gameCode);
            console.log(`Joining room: ${gameCode}`);
        }
    };

    // Function to validate a game code
    const validateGameCodeAPI = async (gameCode) => {
        try {
            const backendUrl = `${window.location.protocol}//${window.location.hostname}:3001/api`;
            const response = await axios.get(`${backendUrl}/validateGameCode/${gameCode}`);
            console.log(`Validation response for ${gameCode}:`, response.data);
            return response.data.isValid;
        } catch (error) {
            console.error('Error validating game code:', error);
            return false;
        }
    };

    // Define the API functions with '/api' prefix
    const createGame = async (title) => {
        try {
            const backendUrl = `${window.location.protocol}//${window.location.hostname}:3001/api`;
            const response = await axios.post(`${backendUrl}/create-game`, {title});
            console.log('Create game response:', response.data);
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
            console.log('Response from backend joinGame:', response.data);
            return response.data; // Return only the `data` property
        } catch (error) {
            console.error('Error in joinGame API call:', error.response || error.message || error);
            if (error.response && error.response.data && error.response.data.error) {
                throw new Error(error.response.data.error);
            }
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
            console.log('Add question response:', response.data);
            setGames((prevGames) => ({
                ...prevGames,
                [gameCode]: {
                    ...prevGames[gameCode],
                    questions: response.data.questions,
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
            console.log('Start game response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error starting game:', error);
            throw error;
        }
    };

    const openGuessing = async (gameCode) => {
        try {
            const backendUrl = `${window.location.protocol}//${window.location.hostname}:3001/api`;
            const response = await axios.post(`${backendUrl}/open-guessing`, {gameCode});
            console.log('Open guessing phase response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error opening guessing phase:', error);
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
            console.log('Set correct answer response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error setting correct answer:', error);
            throw error;
        }
    };

    const setNextPhase = async (gameCode) => {
        try {
            const backendUrl = `${window.location.protocol}//${window.location.hostname}:3001/api`;
            const response = await axios.post(`${backendUrl}/set-next-phase`, {
                gameCode,
            });
            console.log('Set next phase response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error setting next phase:', error);
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
            console.log('Submit guess response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error submitting guess:', error);
            if (error.response && error.response.data && error.response.data.error) {
                throw new Error(error.response.data.error);
            }
            throw error;
        }
    };

    const updateQuestion = async (gameCode, index, updatedQuestion) => {
        try {
            const backendUrl = `${window.location.protocol}//${window.location.hostname}:3001/api`;
            const response = await axios.put(`${backendUrl}/games/${gameCode}/questions/${index}`, updatedQuestion);
            setGames((prevGames) => {
                const updatedGames = {...prevGames};
                updatedGames[gameCode].questions[index] = response.data.question;
                return updatedGames;
            });
            console.log('Question successfully updated:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error updating question:', error);
            throw error;
        }
    };

    const updatePhase = async (gameCode, phase) => {
        try {
            const backendUrl = `${window.location.protocol}//${window.location.hostname}:3001/api`;
            const response = await axios.post(`${backendUrl}/updatePhase`, {gameCode, phase});
            setGames((prevGames) => {
                const updatedGames = {...prevGames};
                if (updatedGames[gameCode]) {
                    updatedGames[gameCode].phase = phase;
                }
                return updatedGames;
            });
            console.log('Update phase response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error updating phase:', error);
            throw error;
        }
    };

    return (
        <GameContext.Provider
            value={{
                games,
                setGames,
                joinRoom,
                validateGameCode: validateGameCodeAPI,
                createGame,
                joinGame,
                addQuestion,
                startGame,
                openGuessing,
                setCorrectAnswer,
                setNextPhase,
                submitGuess,
                updateQuestion,
                updatePhase,
            }}
        >
            {children}
        </GameContext.Provider>
    );
};

export default GameProvider;

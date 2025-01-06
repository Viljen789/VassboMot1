// src/components/PlayerGameViewTest.js

import React, {useState, useEffect} from 'react';
import PlayerGameView from './PlayerGameView';
import {GameContext} from '../context/GameContext';

// Mock submitGuess function
const mockSubmitGuess = async (gameCode, playerName, guess) => {
	console.log(`Mock submitGuess called with gameCode: ${gameCode}, playerName: ${playerName}, guess: ${guess}`);
	return Promise.resolve();
};

// Define mockGame objects for different phases
const mockGames = {
	// Phase 0: Waiting for host to start the game
	phase0: null, // currentGame is null, phase should be 0

	// Phase 1: Waiting for admin to open guessing
	phase1: {
		status: 'started',
		roundActive: false,
		correctAnswer: null,
		questions: [
			{text: 'What is 2 + 2?', range: [0, 10]},
		],
		currentQuestionIndex: 0,
		roundStartedAt: null,
	},

	// Phase 2: Guessing phase
	phase2: {
		status: 'started',
		roundActive: true,
		correctAnswer: null,
		questions: [
			{text: 'What is 2 + 2?', range: [0, 10]},
		],
		currentQuestionIndex: 0,
		roundStartedAt: Date.now(),
	},

	// Phase 3: Calculating scores
	phase3: {
		status: 'started',
		roundActive: false,
		correctAnswer: 4,
		questions: [
			{text: 'What is 2 + 2?', range: [0, 10]},
		],
		currentQuestionIndex: 0,
		roundStartedAt: Date.now() - 300000, // assuming round ended 30 seconds ago
	},
};

const PlayerGameViewTest = () => {
	const [selectedPhase, setSelectedPhase] = useState('phase0');
	const [games, setGames] = useState({GAME123: mockGames['phase0']});

	const handlePhaseChange = (e) => {
		const newPhase = e.target.value;
		setSelectedPhase(newPhase);
		setGames({GAME123: mockGames[newPhase]});
	};

	const mockGame = mockGames[selectedPhase];

	// Set playerName in sessionStorage for testing
	useEffect(() => {
		sessionStorage.setItem('playerName', 'TestPlayer');
	}, []);

	return (
		<GameContext.Provider value={{games: games, submitGuess: mockSubmitGuess, setGames: setGames}}>
			<div style={{padding: '20px', fontFamily: 'Arial, sans-serif'}}>
				<h2>PlayerGameView Test</h2>
				<div style={{marginBottom: '20px'}}>
					<label htmlFor="phase-select" style={{marginRight: '10px'}}>Select Phase:</label>
					<select id="phase-select" value={selectedPhase} onChange={handlePhaseChange}>
						<option value="phase0">Phase 0 - Waiting to Start</option>
						<option value="phase1">Phase 1 - Waiting for Guessing</option>
						<option value="phase2">Phase 2 - Guessing</option>
						<option value="phase3">Phase 3 - Calculating Scores</option>
					</select>
				</div>
				<hr/>
				<PlayerGameView gameCode="GAME123" mockGame={mockGame}/>
			</div>
		</GameContext.Provider>
	);
};

export default PlayerGameViewTest;

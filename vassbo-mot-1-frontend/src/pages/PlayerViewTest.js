// src/pages/PlayerViewTest.js

import React, {useState, useEffect} from 'react';
import PlayerGameView from './PlayerGameView';
import {GameContext} from '../context/GameContext';

// Mock submitGuess function
const mockSubmitGuess = async (gameCode, playerName, guess) => {
    console.log(`Mock submitGuess called with gameCode: ${gameCode}, playerName: ${playerName}, guess: ${guess}`);
    return Promise.resolve();
};

// Define mockGame objects for different phases with 'phase' property
const mockGames = {
    phase0: null,
    phase1: {
        status: 'started',
        phase: 1, // Added phase
        roundActive: false,
        correctAnswer: null,
        questions: [{text: 'What is 2 + 2?', rangeMin: 0, rangeMax: 10}],
        currentQuestionIndex: 0,
        roundStartedAt: null,
    },
    phase2: {
        status: 'started',
        phase: 2, // Added phase
        roundActive: true,
        correctAnswer: null,
        questions: [{text: 'What is 2 + 2?', rangeMin: 0, rangeMax: 10}],
        currentQuestionIndex: 0,
        roundStartedAt: Date.now(),
    },
    phase3: {
        status: 'started',
        phase: 3, // Added phase
        roundActive: false,
        correctAnswer: 4,
        questions: [{text: 'What is 2 + 2?', rangeMin: 0, rangeMax: 10}],
        currentQuestionIndex: 0,
        roundStartedAt: Date.now() - 30000,
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

    useEffect(() => {
        sessionStorage.setItem('playerName', 'TestPlayer');
    }, []);

    return (
        <GameContext.Provider value={{games, submitGuess: mockSubmitGuess, setGames}}>
            <div>
                <h2>PlayerGameView Test</h2>
                <div>
                    <label>Select Phase:</label>
                    <select id="phase-select" value={selectedPhase} onChange={handlePhaseChange}>
                        <option value="phase0">Phase 0 - Waiting to Start</option>
                        <option value="phase1">Phase 1 - Waiting for Guessing</option>
                        <option value="phase2">Phase 2 - Guessing</option>
                        <option value="phase3">Phase 3 - Calculating Scores</option>
                    </select>
                </div>
                <hr/>
                <PlayerGameView gameCode="GAME123" mockGame={mockGames[selectedPhase]}/>
            </div>
        </GameContext.Provider>
    );
};

export default PlayerGameViewTest;

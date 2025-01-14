// src/pages/AdminFlowTest.js

import React, {useState} from 'react';
import {GameContext} from '../context/GameContext';
import StartGamePhase from '../components/StartGamePhase';
import PresentQuestionPhase from '../components/PresentQuestionPhase';
import GuessingPhase from '../components/GuessingPhase';
import SetAnswerPhase from '../components/SetAnswerPhase';
import Leaderboard from '../components/Leaderboard';

const mockSetCorrectAnswer = async (gameCode, answer) => {
    console.log(`Mock set correct answer for game ${gameCode}: ${answer}`);
};

const mockStartRound = async (gameCode) => {
    console.log(`Mock start round for game ${gameCode}`);
};

const mockGames = {
    phase0: {
        gameCode: 'GAME123',
        title: 'Test Game',
        players: [],
        questions: [],
        currentQuestionIndex: 0,
        status: 'waiting',
        phase: 0,
    },
    phase1: {
        gameCode: 'GAME123',
        title: 'Test Game',
        players: [{name: 'Player1', score: 0}],
        questions: [{text: 'What is 5 + 3?', rangeMin: 0, rangeMax: 20}],
        currentQuestionIndex: 0,
        status: 'started',
        phase: 1,
    },
    phase2: {
        gameCode: 'GAME123',
        title: 'Test Game',
        players: [{name: 'Player1', score: 0}],
        questions: [{text: 'What is 5 + 3?', rangeMin: 0, rangeMax: 20}],
        currentQuestionIndex: 0,
        status: 'started',
        phase: 2,
    },
    phase3: {
        gameCode: 'GAME123',
        title: 'Test Game',
        players: [{name: 'Player1', score: 0}],
        questions: [{text: 'What is 5 + 3?', rangeMin: 0, rangeMax: 20}],
        currentQuestionIndex: 0,
        status: 'started',
        phase: 3,
    },
    phase4: {
        gameCode: 'GAME123',
        title: 'Test Game',
        players: [
            {name: 'Player1', score: 10},
            {name: 'Player2', score: 5},
        ],
        questions: [{text: 'What is 5 + 3?', rangeMin: 0, rangeMax: 20}],
        currentQuestionIndex: 0,
        status: 'started',
        phase: 4,
    },
};

const AdminFlowTest = () => {
    const [selectedPhase, setSelectedPhase] = useState('phase0');
    const [games, setGames] = useState({GAME123: mockGames['phase0']});

    const handlePhaseChange = (e) => {
        const phase = e.target.value;
        setSelectedPhase(phase);
        setGames({GAME123: mockGames[phase]});
    };

    const currentGame = games['GAME123'];
    const currentQuestion = currentGame.questions[currentGame.currentQuestionIndex];

    return (
        <GameContext.Provider
            value={{
                games,
                setCorrectAnswer: mockSetCorrectAnswer,
                startRound: mockStartRound,
            }}
        >
            <div>
                <select value={selectedPhase} onChange={handlePhaseChange}>
                    <option value="phase0">Phase 0</option>
                    <option value="phase1">Phase 1</option>
                    <option value="phase2">Phase 2</option>
                    <option value="phase3">Phase 3</option>
                    <option value="phase4">Phase 4</option>
                </select>
                {currentGame.phase === 0 && <StartGamePhase/>}
                {currentGame.phase === 1 && (
                    <PresentQuestionPhase
                        question={currentQuestion.text}
                        questionNumber={currentGame.currentQuestionIndex + 1}
                        questionRange={{
                            min: currentQuestion.rangeMin,
                            max: currentQuestion.rangeMax,
                        }}
                    />
                )}
                {currentGame.phase === 2 && <GuessingPhase question={currentQuestion.text}/>}
                {currentGame.phase === 3 && <SetAnswerPhase/>}
                {currentGame.phase === 4 && <Leaderboard game={currentGame}/>}
            </div>
        </GameContext.Provider>
    );
};

export default AdminFlowTest;
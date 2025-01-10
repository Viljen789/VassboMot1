import React, {useState, useEffect} from 'react';
import {GameContext} from '../context/GameContext';
import StartGamePhase from '../pages/StartGamePhase';
import PresentQuestionPhase from '../pages/PresentQuestionPhase';
import GuessingPhase from '../pages/GuessingPhase';
import SetAnswerPhase from '../pages/SetAnswerPhase';
import Leaderboard from '../pages/Leaderboard';

// Mock startRound and setCorrectAnswer functions
const mockStartRound = async (gameCode) => {
	console.log(`Mock startRound called with gameCode: ${gameCode}`);
	return Promise.resolve();
};

const mockSetCorrectAnswer = async (gameCode, answer) => {
	console.log(`Mock setCorrectAnswer called with gameCode: ${gameCode}, answer: ${answer}`);
	return Promise.resolve();
};

// Mock game states for different phases
const mockGames = {
	phase0: null,
	phase1: {
		status: 'started',
		roundActive: false,
		currentQuestionIndex: 0,
		questions: [{text: 'What is 5 + 3?', range: [0, 20]}],
	},
	phase2: {
		status: 'started',
		roundActive: true,
		currentQuestionIndex: 0,
		questions: [{text: 'What is 5 + 3?', range: [0, 20]}],
		players: [
			{name: 'Player1', score: 0},
			{name: 'Player2', score: 0},
		],
		answers: {
			Player1: true,
			Player2: false,
		},
	},
	phase3: {
		status: 'started',
		roundActive: false,
		currentQuestionIndex: 0,
		questions: [{text: 'What is 5 + 3?', range: [0, 20]}],
		correctAnswer: 8,
	},
	phase4: {
		status: 'ended',
		players: [
			{name: 'Player1', score: 10},
			{name: 'Player2', score: 5},
		],
		questions: [{text: 'What is 5 + 3?', range: [0, 20]}],
	},
};

const AdminFlowTest = () => {
	const [selectedPhase, setSelectedPhase] = useState('phase0');
	const [games, setGames] = useState({GAME123: mockGames['phase0']});

	const handlePhaseChange = (e) => {
		const newPhase = e.target.value;
		setSelectedPhase(newPhase);
		setGames({GAME123: mockGames[newPhase]});
	};

	const currentGame = games['GAME123'];

	return (
		<GameContext.Provider
			value={{
				games,
				startRound: mockStartRound,
				setCorrectAnswer: mockSetCorrectAnswer,
				setGames,
			}}
		>
			<div style={{padding: '20px', fontFamily: 'Arial, sans-serif'}}>
				<h2>AdminFlow Test</h2>
				<div style={{marginBottom: '20px'}}>
					<label htmlFor="phase-select" style={{marginRight: '10px'}}>
						Select Phase:
					</label>
					<select
						id="phase-select"
						value={selectedPhase}
						onChange={handlePhaseChange}
					>
						<option value="phase0">Phase 0 - Start Game</option>
						<option value="phase1">Phase 1 - Present Question</option>
						<option value="phase2">Phase 2 - Guessing Phase</option>
						<option value="phase3">Phase 3 - Set Answer</option>
						<option value="phase4">Phase 4 - Leaderboard</option>
					</select>
				</div>
				<hr/>
				{selectedPhase === 'phase0' && (
					<StartGamePhase handleStartGame={mockStartRound}/>
				)}
				{selectedPhase === 'phase1' && currentGame && (
					<PresentQuestionPhase
						question={currentGame.questions[0].text}
						questionNumber={1}
						onOpenGuessing={() => console.log('Opening Guessing Phase')}
						questionRange={currentGame.questions[0].range}
					/>
				)}
				{selectedPhase === 'phase2' && currentGame && (
					<GuessingPhase
						question={currentGame.questions[0].text}
						timeLeft={30}
						game={currentGame}
					/>
				)}
				{selectedPhase === 'phase3' && currentGame && (
					<SetAnswerPhase
						question={currentGame.questions[0].text}
						correctAnswer={currentGame.correctAnswer || ''}
						setCorrectAnswer={(answer) =>
							console.log(`Setting correct answer: ${answer}`)
						}
						onSetCorrectAnswer={() =>
							console.log('Correct answer submitted')
						}
					/>
				)}
				{selectedPhase === 'phase4' && currentGame && (
					<Leaderboard
						game={currentGame}
						onNextQuestion={() => console.log('Next Question')}
						isFinal={true}
					/>
				)}
			</div>
		</GameContext.Provider>
	);
};

export default AdminFlowTest;

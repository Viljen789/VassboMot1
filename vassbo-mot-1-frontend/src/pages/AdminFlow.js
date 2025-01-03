// vassbo-mot-1-frontend/src/pages/AdminFlow.js
import React, {useContext, useState, useEffect, useRef} from 'react';
import {useParams} from 'react-router-dom';
import {GameContext} from '../context/GameContext';
import PresentQuestionPhase from './PresentQuestionPhase';
import GuessingPhase from './GuessingPhase';
import SetAnswerPhase from './SetAnswerPhase';
import Leaderboard from './Leaderboard';
import {io} from 'socket.io-client';
import axios from 'axios';
import '../components/AdminFlow.css';

const AdminFlow = () => {
	useEffect(() => {
		const backendUrl = `${window.location.protocol}//${window.location.hostname}:3001/api`;
		const socket = io(backendUrl);


		socket.on('gameEnded', ({leaderboard}) => {
			setPhase(4); // Go to final leaderboard phase
			console.log('Final leaderboard received:', leaderboard);
		});

		return () => socket.disconnect(); // Cleanup on unmount
	}, []);
	const timerIdRef = useRef(null);
	useEffect(() => {
		const backendUrl = `${window.location.protocol}//${window.location.hostname}:3001/api`;
		const socket = io(backendUrl);

		socket.on('updatePhase', ({phase}) => setPhase(phase));

		return () => socket.disconnect(); // Clean up listener
	}, []);
	const {gameCode} = useParams();
	const {games, startRound, setCorrectAnswer} = useContext(GameContext);

	const [phase, setPhase] = useState(1);
	// Fase 1 = Presentasjon av spm
	// Fase 2 = 30 sek gjetting
	// Fase 3 = Admin skriver inn fasit
	// Fase 4 = Viser leaderboard

	const [timeLeft, setTimeLeft] = useState(0);    // For 30 sek timer
	const [correctAnswer, setCorrectAnswerInput] = useState('');
	const [error, setError] = useState('');
	const [successMessage, setSuccessMessage] = useState('');

	const currentGame = games[gameCode];
	const currentQuestionIndex = currentGame?.currentQuestionIndex ?? 0;
	const currentQuestion = currentGame?.questions?.[currentQuestionIndex] || null;

	// Hjelpefunksjon for å starte timer (fase 2)
	const startTimer = (seconds) => {
		setTimeLeft(seconds);
		timerIdRef.current = setInterval(() => { // Use the ref here
			setTimeLeft((prev) => {
				if (prev <= 1) {
					clearInterval(timerIdRef.current); // Clear the interval using the ref

					// Inform backend about phase change
					setPhase(3); // Move Admin's UI to phase 3
					axios.post('/api/game/updatePhase', {gameCode, phase: 3})
						.catch(err => console.error('Error updating phase:', err));

					return 0;
				}
				return prev - 1;
			});
		}, 1000);
	};

	const handleTimerEnd = () => {
		clearInterval(timerIdRef.current); // Use the ref here
		try {
			setPhase(3);
			axios.post('/api/game/updatePhase', {gameCode, phase: 3})
				.catch(err => console.error('Error updating game phase:', err));
		} catch (err) {
			console.error('Error:', err);
		}
	};

	// 1) Admin presenterer spm -> klikk "Åpne gjetting"
	const handleOpenGuessing = async () => {
		try {
			await startRound(gameCode); // Calls frontend API method
			setPhase(2); // Switch phase to guessing
			startTimer(30); // 30 seconds countdown
			setError('');
		} catch (err) {
			setError(err.response?.data?.error || 'Feil ved start av runde.');
		}
	};

	// 3) Admin skriver inn fasit
	const handleSetCorrectAnswer = async () => {
		if (!correctAnswer.trim()) {
			setError('Riktig svar kan ikke være tomt.');
			return;
		}
		try {
			await setCorrectAnswer(gameCode, Number(correctAnswer));
			setCorrectAnswerInput('');
			setPhase(4); // Gå til leaderboard
			setError('');
			setSuccessMessage('Riktig svar satt og poeng beregnet.');
		} catch (err) {
			setError(err.response?.data?.error || 'Feil ved å sette riktig svar.');
			setSuccessMessage('');
		}
	};

	// 4) Admin ser leaderboard -> klikk "Neste spørsmål"
	const handleNextQuestion = () => {
		if (currentGame?.currentQuestionIndex >= currentGame.questions.length) {
			setError('Ingen flere spørsmål igjen – spillet er ferdig.');
			setPhase(4); // Ensure Leaderboard phase is triggered
			return;
		}

		setPhase(1);
		setError('');
		setSuccessMessage('');
	};

	// Render basert på fasen vi er i
	if (!currentGame) return <p>Spill ikke funnet.</p>;

	return (
		<div className="admin-flow-container">
			<h2 className="game-title">{currentGame.title}</h2>

			{phase === 1 && currentQuestion && (
				<PresentQuestionPhase
					question={currentQuestion.text}
					questionNumber={currentQuestionIndex + 1}
					onOpenGuessing={handleOpenGuessing}
					questionRange={currentQuestion.range}
				/>
			)}

			{phase === 2 && (
				<GuessingPhase
					question={currentQuestion.text}
					timeLeft={timeLeft}
				/>
			)}

			{phase === 3 && (
				<SetAnswerPhase
					question={currentQuestion.text}
					correctAnswer={correctAnswer}
					setCorrectAnswer={setCorrectAnswerInput}
					onSetCorrectAnswer={handleSetCorrectAnswer}
				/>
			)}

			{phase === 4 && (
				<Leaderboard
					game={currentGame}
					onNextQuestion={handleNextQuestion}
					isFinal={currentGame?.currentQuestionIndex >= currentGame.questions.length}
				/>
			)}

			{/* Feil og suksessmeldinger */}
			{error && <p className="error-message">{error}</p>}
			{successMessage && <p className="success-message">{successMessage}</p>}
		</div>
	);
};

export default AdminFlow;

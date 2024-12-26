// vassbo-mot-1-frontend/src/pages/AdminFlow.js

import React, {useContext, useState, useEffect, useRef} from 'react'; // Add `useRef`
import {useParams} from 'react-router-dom';
import {GameContext} from '../context/GameContext';
import PresentQuestionPhase from '../components/PresentQuestionPhase';
import GuessingPhase from '../components/GuessingPhase';
import SetAnswerPhase from '../components/SetAnswerPhase';
import Leaderboard from '../components/Leaderboard';
import {io} from 'socket.io-client';
import axios from 'axios';


const AdminFlow = () => {
	useEffect(() => {
		const socket = io("http://localhost:3000");

		socket.on('gameEnded', ({leaderboard}) => {
			setPhase(4); // Go to final leaderboard phase
			console.log('Final leaderboard received:', leaderboard);
		});

		return () => socket.disconnect(); // Cleanup on unmount
	}, []);
	const timerIdRef = useRef(null);
	useEffect(() => {
		const socket = io("http://localhost:3000");
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
			// Ensure the game is started before starting the round
			if (currentGame.status !== 'started') {
				console.log('Starting the game:', gameCode);
				const response = await axios.post('/api/game/start', {gameCode});

				console.log('Game start response:', response.data);
			}

			console.log('Starting round for game:', gameCode);
			await startRound(gameCode);
			setPhase(2);
			startTimer(30); // Start countdown timer
			setError('');
		} catch (err) {
			console.error('Error starting game or round:', err.response?.data || err);
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
	if (!currentQuestion) return <p>Ingen spørsmål tilgjengelig.</p>;

	return (
		<div className="admin-flow-container">
			<h2>{currentGame.title}</h2>

			{phase === 1 && (
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

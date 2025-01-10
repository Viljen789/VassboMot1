// src/pages/AdminFlow.js

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
import {toast, ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminFlow = () => {
	useEffect(() => {
		const backendUrl = `${window.location.protocol}//${window.location.hostname}:3001/api`;
		const socket = io(backendUrl);

		socket.on('gameEnded', ({leaderboard}) => {
			setPhase(4); // Go to final leaderboard phase
			toast.success('Final leaderboard received.');
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
	const [timeLeft, setTimeLeft] = useState(0);    // For 30 sec timer
	const [correctAnswer, setCorrectAnswerInput] = useState('');
	const [error, setError] = useState('');
	const [successMessage, setSuccessMessage] = useState('');

	const currentGame = games[gameCode];
	const currentQuestionIndex = currentGame?.currentQuestionIndex ?? 0;
	const currentQuestion = currentGame?.questions?.[currentQuestionIndex] || null;

	// Helper function to start timer (phase 2)
	const startTimer = (seconds) => {
		setTimeLeft(seconds);
		timerIdRef.current = setInterval(() => { // Use the ref here
			setTimeLeft((prev) => {
				if (prev <= 1) {
					clearInterval(timerIdRef.current); // Clear the interval using the ref

					// Inform backend about phase change
					setPhase(3); // Move Admin's UI to phase 3
					toast.success('Moving to phase 3: Setting correct answer.');
					axios.post('/api/game/updatePhase', {gameCode, phase: 3})
						.catch(err => {
							console.error('Error updating phase:', err);
							toast.error('Feil ved oppdatering av fase.');
						});

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
			toast.success('Moving to phase 3: Setting correct answer.');
			axios.post('/api/game/updatePhase', {gameCode, phase: 3})
				.catch(err => {
					console.error('Error updating phase:', err);
					toast.error('Feil ved oppdatering av fase.');
				});
		} catch (err) {
			console.error('Error:', err);
			toast.error('Feil ved oppdatering av fase.');
		}
	};

	// 1) Admin presents question -> click "Open Guessing"
	const handleOpenGuessing = async () => {
		try {
			await startRound(gameCode); // Calls frontend API method
			setPhase(2); // Switch phase to guessing
			startTimer(30); // 30 seconds countdown
			toast.dismiss(); // Optionally dismiss all toasts

			// Inform backend about phase change
			axios.post('/api/game/updatePhase', {gameCode, phase: 2})
				.catch(err => {
					console.error('Error updating phase:', err);
					toast.error('Feil ved oppdatering av fase.');
				});
		} catch (err) {
			const errorMessage = err.response?.data?.error || 'Feil ved start av runde.';
			toast.error(errorMessage);
		}
	};

	// 3) Admin sets correct answer
	const handleSetCorrectAnswer = async () => {
		if (!correctAnswer.trim()) {
			toast.error('Riktig svar kan ikke være tomt.');
			return;
		}
		try {
			await setCorrectAnswer(gameCode, Number(correctAnswer));
			setCorrectAnswerInput('');
			setPhase(4); // Go to leaderboard
			toast.success('Riktig svar satt og poeng beregnet.');
			toast.dismiss();
		} catch (err) {
			const errorMessage = err.response?.data?.error || 'Feil ved å sette riktig svar.';
			toast.error(errorMessage);
			toast.dismiss();
		}
	};

	// 4) Admin sees leaderboard -> click "Next Question"
	const handleNextQuestion = () => {
		const currentGame = games[gameCode];
		if (!currentGame) {
			toast.error('Spill ikke funnet.');
			return;
		}

		if (currentGame.currentQuestionIndex >= currentGame.questions.length - 1) {
			toast.error('Ingen flere spørsmål igjen – spillet er ferdig.');
			setPhase(4); // Ensure Leaderboard phase is triggered
			return;
		}

		setPhase(1);
		toast.dismiss();
	};

	if (!currentGame) {
		return <div>Loading...</div>;
	}

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
					isFinal={currentGame.currentQuestionIndex >= currentGame.questions.length - 1}
				/>
			)}

			<ToastContainer closeButton={false} autoClose={3000}/>
		</div>
	);
};

export default AdminFlow;
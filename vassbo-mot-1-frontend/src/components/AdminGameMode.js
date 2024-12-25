// vassbo-mot-1-frontend/src/components/AdminGameMode.js

import React, {useContext, useState, useEffect} from 'react';
import {GameContext} from '../context/GameContext';
import {io} from 'socket.io-client';

const AdminGameMode = ({gameCode}) => {
	const {startRound, setCorrectAnswer, games} = useContext(GameContext);
	const [correctAnswer, setCorrectAnswerInput] = useState('');
	const [error, setError] = useState('');
	const [successMessage, setSuccessMessage] = useState('');

	const currentGame = games[gameCode];
	const socket = io('http://localhost:3001');

	useEffect(() => {
		// Lytt til 'roundEnded' hendelsen
		socket.on('roundEnded', ({gameCode: endedGameCode, currentQuestion}) => {
			if (endedGameCode === gameCode) {
				setError('');
				setSuccessMessage('Runden er avsluttet! Sett det riktige svaret.');
			}
		});

		return () => {
			socket.disconnect();
		};
	}, [gameCode, socket]);

	const handleStartRound = async () => {
		try {
			await startRound(gameCode);
			setError('');
			setSuccessMessage('Runde startet! Spillere har 30 sekunder til å svare.');
		} catch (err) {
			setError(err.response?.data?.error || 'Feil ved start av runde.');
			setSuccessMessage('');
		}
	};

	const handleSetCorrectAnswer = async () => {
		if (correctAnswer === '') {
			setError('Riktig svar kan ikke være tomt.');
			return;
		}

		try {
			await setCorrectAnswer(gameCode, Number(correctAnswer));
			setError('');
			setSuccessMessage('Riktig svar satt og poeng beregnet.');
			setCorrectAnswerInput('');
		} catch (err) {
			setError(err.response?.data?.error || 'Feil ved å sette riktig svar.');
			setSuccessMessage('');
		}
	};

	if (!currentGame) {
		return <p>Spill ikke funnet.</p>;
	}

	return (
		<div className="admin-game-mode">

			{/* Start Runde Knapp */}
			{currentGame.status === 'in-progress' && !currentGame.roundActive && (
				<button onClick={handleStartRound}>Start Ny Runde</button>
			)}

			{/* Sett Riktig Svar */}

			{/* Feilmeldinger og suksessmeldinger */}
			{error && <p className="error-message">{error}</p>}
			{successMessage && <p className="success-message">{successMessage}</p>}
		</div>
	);
};

export default AdminGameMode;

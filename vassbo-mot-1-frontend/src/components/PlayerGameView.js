// src/components/PlayerGameView.js
import React, {useContext, useState, useEffect} from 'react';
import {GameContext} from '../context/GameContext';
import Timer from './Timer'; // Importer Timer-komponenten

const PlayerGameView = ({gameCode, playerName}) => {
	const {games, submitGuess} = useContext(GameContext);
	const [guess, setGuess] = useState(null); // Initialiser til null
	const [error, setError] = useState('');
	const [successMessage, setSuccessMessage] = useState('');
	const [canSubmit, setCanSubmit] = useState(false);
	const [deadline, setDeadline] = useState(null); // Ny state for "deadline"
	const [phase, setPhase] = useState(0); // Lokal fase-state

	const currentGame = games[gameCode];

	// Logging for feilsøking
	useEffect(() => {
		console.log('PlayerGameView - currentGame:', currentGame);
		console.log('PlayerGameView - phase:', phase);
	}, [currentGame, phase]);

	useEffect(() => {
		if (!currentGame) {
			setPhase(0); // Fase 0: Venter på at spilleren skal bli med
			return;
		}

		const currentQuestion = currentGame.questions?.[currentGame.currentQuestionIndex] || null;

		if (currentGame.status === 'started') {
			if (currentGame.roundActive && currentQuestion && currentQuestion.range) {
				// Fase 2: 30 sek gjetting
				setPhase(2);
				setCanSubmit(true);

				// Sett startverdi for guess til min-verdi fra range
				const minGuess = currentQuestion.range[0];
				setGuess(minGuess);

				// Nullstill evt. meldinger
				setSuccessMessage('');
				setError('');

				// Beregn deadline basert på roundStartedAt
				if (currentGame.roundStartedAt) {
					const computedDeadline = currentGame.roundStartedAt + 30000; // 30 sekunder
					setDeadline(computedDeadline);
					console.log(`Spiller ${playerName} - Deadline satt til: ${computedDeadline}`);
				} else {
					// Dersom serveren ikke har roundStartedAt, fallback til "nå + 30 sek"
					const fallbackDeadline = Date.now() + 30000;
					setDeadline(fallbackDeadline);
					console.log(`Spiller ${playerName} - Fallback Deadline satt til: ${fallbackDeadline}`);
				}
			} else if (!currentGame.roundActive && currentGame.correctAnswer === null) {
				// Fase 1: Venter på at admin skal åpne gjetting
				setPhase(1);
				setCanSubmit(false);
				setDeadline(null);
				setGuess(null);
			} else if (!currentGame.roundActive && currentGame.correctAnswer !== null) {
				// Fase 3: Regner ut poeng
				setPhase(3);
				setCanSubmit(false);
				setDeadline(null);
				setGuess(null);
			}
		} else {
			// Spill ikke startet ennå
			setPhase(0);
			setCanSubmit(false);
			setDeadline(null);
			setGuess(null);
		}
	}, [
		currentGame?.status,
		currentGame?.roundActive,
		currentGame?.currentQuestionIndex,
		currentGame?.questions,
		currentGame?.roundStartedAt,
		currentGame?.correctAnswer
	]);

	// Håndter når Timer når 0
	const handleTimeUp = () => {
		setPhase(3); // Gå videre til fase 3 når tiden er ute
		setCanSubmit(false);
		setDeadline(null);
		console.log(`Spiller ${playerName} - Timer gikk ut`);
	};

	const handleSubmitGuess = async () => {
		if (guess === null) {
			setError('Svar kan ikke være tomt.');
			return;
		}
		try {
			await submitGuess(gameCode, playerName, guess);
			setError('');
			setSuccessMessage('Svar sendt inn!');
			setCanSubmit(false); // Én innsending per spiller
			console.log(`Spiller ${playerName} - Svar sendt inn: ${guess}`);
		} catch (err) {
			console.error('Error submitting guess:', err);
			if (err.response?.data?.error) {
				setError(err.response.data.error);
			} else {
				setError('Feil ved innsending av svar.');
			}
			setSuccessMessage('');
		}
	};

	if (!currentGame) {
		return <p>Venter på at host skal starte spillet...</p>;
	}

	const currentQuestion = currentGame.questions?.[currentGame.currentQuestionIndex] || null;
	if (!currentQuestion) {
		return <p>Ingen spørsmål tilgjengelig.</p>;
	}

	return (
		<div className="player-game-view">
			<h3>Nåværende Spørsmål:</h3>
			<p>{currentQuestion.text}</p>

			{phase === 0 && (
				<div>
					<p>Venter på at host skal starte spillet...</p>
				</div>
			)}

			{phase === 1 && (
				<div>
					<p>Venter på at admin skal åpne gjetting...</p>
				</div>
			)}

			{phase === 2 && (
				<div className="answer-section">
					{/* Bruk Timer-komponenten med deadline */}
					{deadline && (
						<Timer
							deadline={deadline}
							onTimeUp={handleTimeUp}
						/>
					)}
					<div className="slider-input">
						<input
							type="range"
							min={currentQuestion.range[0]}
							max={currentQuestion.range[1]}
							value={guess !== null ? guess : currentQuestion.range[0]} // Sikre at value er et tall
							onChange={(e) => setGuess(Number(e.target.value))} // Konverter til tall
							disabled={!canSubmit}
						/>
						<span>{guess !== null ? guess : currentQuestion.range[0]}</span>
					</div>
					<button onClick={handleSubmitGuess} disabled={!canSubmit}>
						{canSubmit ? 'Send Inn Svar' : 'Svar Ikke Mulig'}
					</button>
					<p>Spillere sender inn svar nå ...</p>
					{error && <p className="error-message">{error}</p>}
					{successMessage && <p className="success-message">{successMessage}</p>}
				</div>
			)}

			{phase === 3 && (
				<div>
					<p>Regner ut poeng...</p>
				</div>
			)}

			{phase === 4 && (
				<div>
					<p>Venter på neste spørsmål...</p>
				</div>
			)}
		</div>
	);
};

export default PlayerGameView;

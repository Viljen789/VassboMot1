// vassbo-mot-1-frontend/src/components/PlayerGameView.js

import React, {useContext, useState, useEffect} from 'react';
import {GameContext} from '../context/GameContext';
import Timer from './Timer'; // Importer Timer-komponenten

const PlayerGameView = ({gameCode, playerName}) => {
	const {games, submitGuess} = useContext(GameContext);
	const [guess, setGuess] = useState('');
	const [error, setError] = useState('');
	const [successMessage, setSuccessMessage] = useState('');
	const [canSubmit, setCanSubmit] = useState(false);
	const [timeLeft, setTimeLeft] = useState(30); // Starter alltid på 30 sekunder

	const currentGame = games[gameCode];

	useEffect(() => {
		if (!currentGame) return;

		if (currentGame.roundActive) {
			setCanSubmit(true);
			setTimeLeft(30); // Reset timer for ny runde
			setGuess('');
			setSuccessMessage('');
			setError('');

			const timer = setInterval(() => {
				setTimeLeft((prev) => {
					if (prev <= 1) {
						clearInterval(timer);
						setCanSubmit(false);
						return 0;
					}
					return prev - 1;
				});
			}, 1000);

			return () => clearInterval(timer);
		} else {
			setCanSubmit(false);
			setTimeLeft(0);
		}
	}, [currentGame?.roundActive]);

	const handleSubmitGuess = async () => {
		if (guess === '') {
			setError('Svar kan ikke være tomt.');
			return;
		}

		try {
			await submitGuess(gameCode, playerName, guess);
			setError('');
			setSuccessMessage('Svar sendt inn!');
			setCanSubmit(false); // Forhindrer flere innsendinger
		} catch (err) {
			setError(err.response?.data?.error || 'Feil ved innsending av svar.');
			setSuccessMessage('');
		}
	};

	if (!currentGame) {
		return <p>Spill ikke funnet.</p>;
	}

	const currentQuestion = currentGame.questions[currentGame.currentQuestionIndex];

	if (!currentQuestion) {
		return <p>Ingen spørsmål tilgjengelig.</p>;
	}

	return (
		<div className="player-game-view">
			<h3>Nåværende Spørsmål:</h3>
			<p>{currentQuestion.text}</p>

			{currentGame.roundActive ? (
				<div className="answer-section">
					<Timer initialTime={timeLeft} onTimeUp={() => setCanSubmit(false)}/> {/* Bruke Timer */}
					<div className="slider-input">
						<input
							type="range"
							min={currentQuestion.range[0]}
							max={currentQuestion.range[1]}
							value={guess}
							onChange={(e) => setGuess(e.target.value)}
							disabled={!canSubmit}
						/>
						<span>{guess}</span>
					</div>
					<button onClick={handleSubmitGuess} disabled={!canSubmit}>
						{canSubmit ? 'Send Inn Svar' : 'Svar Ikke Mulig'}
					</button>
				</div>
			) : (
				<p>Runden er avsluttet. Vent på riktig svar fra admin.</p>
			)}

			{/* Feilmeldinger og suksessmeldinger */}
			{error && <p className="error-message">{error}</p>}
			{successMessage && <p className="success-message">{successMessage}</p>}
		</div>
	);
};

export default PlayerGameView;

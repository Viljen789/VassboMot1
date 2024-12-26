// src/pages/Game.js

import React, {useContext, useState} from 'react';
import {useParams} from 'react-router-dom';
import {GameContext} from '../context/GameContext';
import './Game.css';

const Game = () => {
	const {gameCode} = useParams();
	const {games, submitGuess} = useContext(GameContext);
	const currentGame = games[gameCode];
	const playerName = sessionStorage.getItem('playerName');
	console.log('playerName from sessionStorage:', playerName)// Retrieve unique player name for this session
	const [guess, setGuess] = useState('');
	const [error, setError] = useState('');
	const [successMessage, setSuccessMessage] = useState('');
	// Unique player name logic
	if (!sessionStorage.getItem('playerName')) {
		const uniquePlayerName = `Player_${Math.random().toString(36).substring(7)}`;
		sessionStorage.setItem('playerName', uniquePlayerName);
	}
	const player = this.players.find((p) => p.name.toLowerCase() === playerName.toLowerCase());
	if (!player) {
		throw new Error('Spiller ikke funnet.');
	}
	const handleSubmitGuess = async () => {
		if (!guess.trim()) {
			setError('Gjetning kan ikke være tom.');
			return;
		}

		// Ensure each player gets a unique name for the current session
		if (!sessionStorage.getItem('playerName')) {
			const uniquePlayerName = `Player_${Math.random().toString(36).substring(7)}`;
			sessionStorage.setItem('playerName', uniquePlayerName);
		}
		const playerName = sessionStorage.getItem('playerName');
		console.log('Submitting guess for player:', playerName); // Debugging line

		try {
			await submitGuess(gameCode, playerName, guess);
			setError('');
			setSuccessMessage('Gjetning sendt!');
			setGuess('');
		} catch (err) {
			console.error('Error submitting guess:', err);
			setError(err.response?.data?.error || 'Feil ved å sende gjetning.');
			setSuccessMessage('');
		}
	};

	if (!currentGame) {
		return <p>Laster spilldata...</p>;
	}

	const currentQuestion = currentGame.questions[currentGame.currentQuestionIndex];

	return (
		<div className="game-container">
			{/*<h4>Spiller {sessionStorage.getItem('playerName')}</h4>*/}
			<h2>Venter på spørsmål...</h2>

			{currentGame.status === 'started' && currentGame.roundActive && currentQuestion && (
				<div className="question-section">
					<h3>Spørsmål:</h3>
					<p>{currentQuestion.text}</p>
					{currentQuestion.useSlider && currentQuestion.range ? (
						<div>
							<input
								type="range"
								min={currentQuestion.range[0]}
								max={currentQuestion.range[1]}
								value={guess}
								onChange={(e) => setGuess(e.target.value)}
							/>
							<p>Gjetning: {guess}</p>
						</div>
					) : (
						<input
							type="number"
							placeholder="Skriv din gjetning"
							value={guess}
							onChange={(e) => setGuess(e.target.value)}
						/>
					)}
					<button onClick={handleSubmitGuess}>Send Gjetning</button>
				</div>
			)}

			{/* Feilmelding og suksessmelding */}
			{error && <p className="error-message">{error}</p>}
			{successMessage && <p className="success-message">{successMessage}</p>}
		</div>
	);
};

export default Game;

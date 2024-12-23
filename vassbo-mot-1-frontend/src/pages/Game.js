// vassbo-mot-1-frontend/src/pages/Game.js

import React, {useContext, useState, useEffect} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {GameContext} from '../context/GameContext';
import './Game.css'; // Valgfritt: For styling

const Game = () => {
	const {gameCode} = useParams();
	const {games, submitGuess} = useContext(GameContext);
	const navigate = useNavigate();
	const [currentQuestion, setCurrentQuestion] = useState(null);
	const [guess, setGuess] = useState('');
	const [submitted, setSubmitted] = useState(false);
	const [error, setError] = useState('');

	// Hent spillernavnet fra localStorage
	const playerName = localStorage.getItem('playerName') || 'Spiller1'; // Standardverdi hvis ikke satt

	const game = games[gameCode];

	useEffect(() => {
		if (!game) {
			setError('Spill ikke funnet.');
			return;
		}

		if (game.status === 'ended') {
			navigate(`/leaderboard/${gameCode}`);
		}

		if (game.status === 'in-progress' && game.questions.length > 0) {
			const qIndex = game.currentQuestionIndex;
			setCurrentQuestion(game.questions[qIndex]);
		}
	}, [game, gameCode, navigate]);

	const handleSubmitGuess = async () => {
		if (!guess.trim()) {
			setError('Gjetning kan ikke være tom.');
			return;
		}

		try {
			await submitGuess(gameCode, playerName, guess);
			setSubmitted(true);
			setError('');
		} catch (err) {
			if (err.response && err.response.data && err.response.data.error) {
				setError(err.response.data.error);
			} else {
				setError('Feil ved å sende inn gjetning.');
			}
		}
	};

	if (error) {
		return <div className="game-container"><p className="error-message">{error}</p></div>;
	}

	if (!game) {
		return <div className="game-container"><p>Laster...</p></div>;
	}

	if (game.status === 'created') {
		return <div className="game-container"><p>Venter på at spillet skal starte...</p></div>;
	}

	if (game.status === 'in-progress' && !currentQuestion) {
		return <div className="game-container"><p>Laster spørsmål...</p></div>;
	}

	return (
		<div className="game-container">
			<h2>{game.title}</h2>
			<p><strong>Status:</strong> {game.status}</p>
			{currentQuestion && (
				<div className="question-section">
					<h3>Spørsmål:</h3>
					<p>{currentQuestion.text}</p>
					{currentQuestion.useSlider && currentQuestion.range ? (
						<div className="slider-input">
							<input
								type="range"
								min={currentQuestion.range[0]}
								max={currentQuestion.range[1]}
								value={guess}
								onChange={(e) => setGuess(e.target.value)}
							/>
							<span>{guess}</span>
						</div>
					) : (
						<input
							type="text"
							placeholder="Skriv inn ditt svar"
							value={guess}
							onChange={(e) => setGuess(e.target.value)}
						/>
					)}
					<button onClick={handleSubmitGuess} disabled={submitted}>
						{submitted ? 'Gjetning sendt!' : 'Send Gjetning'}
					</button>
					{error && <p className="error-message">{error}</p>}
				</div>
			)}

			{/* Liste over deltakere */}
			<div className="participants-section">
				<h3>Deltakere</h3>
				<ul>
					{game.players.map((player, index) => (
						<li key={index}>{player.name} - {player.score} poeng</li>
					))}
				</ul>
			</div>
		</div>
	);
};

export default Game;

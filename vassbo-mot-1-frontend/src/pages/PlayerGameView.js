// src/components/PlayerGameView.js

import React, {useContext, useState, useEffect} from 'react';
import {useParams} from 'react-router-dom';
import {GameContext} from '../context/GameContext';
import Timer from './Timer';
import {io} from 'socket.io-client';
import axios from 'axios';
import '../components/PlayerGameView.css';

const PlayerGameView = ({mockGame}) => {
	const {gameCode} = useParams();
	const {games, submitGuess, setGames} = useContext(GameContext);

	// Toggle between slider input or text input
	const [useTextInput, setUseTextInput] = useState(false);

	// Store the user’s guess (numeric value or empty string)
	const [guess, setGuess] = useState(null);

	const [error, setError] = useState('');
	const [successMessage, setSuccessMessage] = useState('');
	const [canSubmit, setCanSubmit] = useState(false);
	const [deadline, setDeadline] = useState(null);
	const [phase, setPhase] = useState(0);
	const [isLoading, setIsLoading] = useState(true);
	const [gameEnded, setGameEnded] = useState(false); // New state variable

	// Retrieve the player name from session storage
	const playerName = sessionStorage.getItem('playerName')?.trim();

	// Helper function to calculate the midpoint
	const calculateMidpoint = (min, max) => Math.floor((min + max) / 2);

	// Fetch game data from backend or use mock data
	const fetchGame = async () => {
		try {
			const backendUrl = `${window.location.protocol}//${window.location.hostname}:3001`;
			const response = await axios.get(`${backendUrl}/games/${gameCode}`);
			setGames((prev) => ({
				...prev,
				[gameCode]: response.data,
			}));
		} catch (err) {
			console.error('Error fetching game:', err);
			setError(`Fant ikke spillet med kode ${gameCode}.`);
		} finally {
			setIsLoading(false);
		}
	};

	// Fetch game data on component mount or when gameCode/mockGame changes
	useEffect(() => {
		if (!mockGame && !games[gameCode]) {
			fetchGame();
		} else {
			setIsLoading(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [gameCode, mockGame]);

	// If mock data is provided, set it directly
	useEffect(() => {
		if (mockGame) {
			setGames((prev) => ({
				...prev,
				[gameCode]: mockGame,
			}));
			setIsLoading(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [mockGame]);

	// Handle Socket.IO connection (when not using mock data)
	useEffect(() => {
		if (!mockGame) {
			const backendUrl = `${window.location.protocol}//${window.location.hostname}:3001`;
			const socket = io(backendUrl);

			socket.on('updatePhase', ({phase}) => setPhase(phase));
			socket.emit('joinRoom', gameCode);

			socket.on('updateGame', (updatedGame) => {
				console.log('Received updated game state:', updatedGame);
				setGames((prev) => ({
					...prev,
					[gameCode]: updatedGame,
				}));
			});

			socket.on('gameEnded', () => {
				setGameEnded(true); // Set gameEnded to true when the game ends
			});

			return () => socket.disconnect();
		}
	}, [gameCode, mockGame, setGames]);

	// Decide which phase to display and initialize guess
	useEffect(() => {
		if (isLoading) return;

		const currentGame = mockGame || games[gameCode];
		if (!currentGame) {
			setPhase(0);
			return;
		}

		const currentQuestion = currentGame.questions?.[currentGame.currentQuestionIndex] || null;
		if (!currentQuestion) {
			setPhase(0);
			return;
		}

		if (currentGame.status === 'started') {
			if (currentGame.roundActive && currentQuestion.range) {
				setPhase(2); // Guessing Phase

				const userAlreadyGuessed = currentGame.answers?.[playerName] !== undefined;
				setCanSubmit(!userAlreadyGuessed);

				if (userAlreadyGuessed) {
					setGuess(currentGame.answers[playerName]);
				} else {
					const [minVal, maxVal] = currentQuestion.range;
					setGuess((prevGuess) => (prevGuess === null ? calculateMidpoint(minVal, maxVal) : prevGuess));
				}

				setError('');
				setSuccessMessage('');

				if (currentGame.roundStartedAt) {
					const computedDeadline = currentGame.roundStartedAt + 30000; // 30 seconds
					setDeadline(computedDeadline);
				} else {
					setDeadline(Date.now() + 30000); // 30 seconds
				}
			} else if (!currentGame.roundActive && currentGame.correctAnswer === null) {
				setPhase(1); // Waiting for Admin to Open Guessing
				setCanSubmit(false);
				setDeadline(null);
				setGuess(null);
			} else if (!currentGame.roundActive && currentGame.correctAnswer !== null) {
				setPhase(3); // Computing Points
				setCanSubmit(false);
				setDeadline(null);
				setGuess(null);
			} else {
				setPhase(0); // Fallback to Phase 0
				setCanSubmit(false);
				setDeadline(null);
				setGuess(null);
			}
		} else {
			// Game not started
			setPhase(0);
			setCanSubmit(false);
			setDeadline(null);
			setGuess(null);
		}
	}, [isLoading, games, gameCode, mockGame, setGames, playerName]);

	// Timer callback
	const handleTimeUp = () => {
		setPhase(3); // Move to Computing Points
		setCanSubmit(false);
		setDeadline(null);
	};

	// Handle text input changes (only numeric, clamped within range)
	const handleTextInputChange = (e, min, max) => {
		const val = e.target.value;

		// If empty, let the user clear the field
		if (val === '') {
			setGuess('');
			setError('');
			return;
		}

		// Convert to number
		const numericVal = Number(val);
		if (isNaN(numericVal)) {
			setError('Input må være et tall.');
			return;
		}

		// Clamp value within [min, max]
		const clampedVal = Math.min(Math.max(numericVal, min), max);
		if (clampedVal !== numericVal) {
			setError(`Input må være mellom ${min} og ${max}.`);
		} else {
			setError('');
		}
		setGuess(clampedVal);
	};

	// Submit the guess
	const handleSubmitGuess = async () => {
		if (!playerName) {
			setError('Spiller ikke definert.');
			return;
		}
		if (guess === null || guess === '') {
			setError('Svar kan ikke være tomt.');
			return;
		}

		const trimmedPlayerName = playerName.trim();
		if (!trimmedPlayerName) {
			setError('Ugyldig spiller navn.');
			return;
		}

		try {
			await submitGuess(gameCode, trimmedPlayerName, guess);
			setError('');
			setSuccessMessage('Svar sendt inn!');
			setCanSubmit(false);
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

	// Loading state
	if (isLoading) {
		return <p>Laster spilldata...</p>;
	}

	// Validate the current game
	const currentGame = mockGame || games[gameCode];

	// Display welcome message if the game hasn't started yet
	if (!currentGame || currentGame.status !== 'started') {
		return (
			<div className="player-game-view">
				<h2>Velkommen {playerName}!</h2>
				<p>Vennligst vent mens spillet settes opp.</p>
			</div>
		);
	}

	const currentQuestion = currentGame.questions?.[currentGame.currentQuestionIndex];
	const [minVal, maxVal] = currentQuestion.range || [0, 100];

	// Calculate the fill percentage for the slider
	const fillPercent =
		((Number(guess) || calculateMidpoint(minVal, maxVal)) - minVal) / (maxVal - minVal) * 100;

	return (
		<div className="player-game-view">
			{gameEnded ? (
				<div>
					<h2>Spillet er over!</h2>
					<p>Bra jobba! Sjekk leaderboardet for å se om du er på pallen.</p>
				</div>
			) : (
				<>
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
							<Timer deadline={deadline} onTimeUp={handleTimeUp}/>
							<div className="custom-checkbox-container">
								<label htmlFor="useTextInput" style={{marginRight: '8px'}}>
									Foretrekker tekst-input?
								</label>
								<label className="custom-checkbox">
									<input
										type="checkbox"
										id="useTextInput"
										checked={useTextInput}
										disabled={!canSubmit}
										onChange={(e) => {
											setUseTextInput(e.target.checked);
											// Do not reset guess when toggling input modes
										}}
									/>
									<span className="checkmark"></span>
								</label>
							</div>

							{useTextInput ? (
								<div className="text-input">
									<input
										type="number"
										min={minVal}
										max={maxVal}
										value={guess === null ? '' : guess}
										onChange={(e) => handleTextInputChange(e, minVal, maxVal)}
										disabled={!canSubmit}
										placeholder={`Skriv et tall mellom ${minVal} og ${maxVal}`}
									/>
								</div>
							) : (
								<div className="slider-input">
									<input
										type="range"
										min={minVal}
										max={maxVal}
										value={guess !== null ? guess : calculateMidpoint(minVal, maxVal)}
										onChange={(e) => {
											const v = Number(e.target.value);
											setGuess(v);
										}}
										disabled={!canSubmit}
										style={{
											background: `linear-gradient(
												to right,
												var(--primary-color) ${fillPercent}%,
												#ccc ${fillPercent}%
											)`,
										}}
										aria-label="Guess Slider"
									/>
									<span>{guess !== null ? guess : calculateMidpoint(minVal, maxVal)}</span>
								</div>
							)}

							<button onClick={handleSubmitGuess} disabled={!canSubmit}>
								{canSubmit ? 'Send Inn Svar' : 'Svar sendt!'}
							</button>

							{error && <p className="error-message">{error}</p>}
							{successMessage && <p className="success-message">{successMessage}</p>}
						</div>
					)}

					{phase === 3 && (
						<div>
							<p>Regner ut poeng...</p>
							<span className={"updated-score"}>
							<p>+ {mockGame ? 10 : currentGame.player.newScoreç}</p>
							</span>
						</div>
					)}

					{phase === 4 && (
						<div>
							<p>Venter på neste spørsmål...</p>
						</div>
					)}
				</>
			)}
		</div>
	);
};

export default PlayerGameView;
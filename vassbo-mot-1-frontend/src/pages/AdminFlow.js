// vassbo-mot-1-frontend/src/pages/AdminFlow.js
import React, {useContext, useState, useEffect} from 'react';
import {useParams} from 'react-router-dom';
import {GameContext} from '../context/GameContext';
import Leaderboard from './Leaderboard';

const AdminFlow = () => {
	const {gameCode} = useParams();
	const {games, startRound, setCorrectAnswer} = useContext(GameContext);
	const {joinGame} = useContext(GameContext);

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

	// --------------------
	// Hjelpefunksjon for å starte timer (fase 2)
	const startTimer = (seconds) => {
		setTimeLeft(seconds);
		const timerId = setInterval(() => {
			setTimeLeft((prev) => {
				if (prev <= 1) {
					clearInterval(timerId);
					// Timeren er ferdig, gå videre til fase 3
					setPhase(3);
					return 0;
				}
				return prev - 1;
			});
		}, 1000);
	};

	// --------------------
	// 1) Admin presenterer spm -> klikk "Åpne gjetting"
	const handleOpenGuessing = async () => {
		try {
			// Kall startRound fra GameContext (som i ditt oppsett)
			await startRound(gameCode);
			setPhase(2);
			startTimer(30); // 30 sekunder
			setError('');
		} catch (err) {
			setError(err.response?.data?.error || 'Feil ved start av runde.');
		}
	};

	// --------------------
	// 3) Admin skriver inn fasit
	const handleSetCorrectAnswer = async () => {
		if (!correctAnswer.trim()) {
			setError('Riktig svar kan ikke være tomt.');
			return;
		}
		try {
			await setCorrectAnswer(gameCode, Number(correctAnswer));
			setCorrectAnswerInput('');
			setPhase(4); // Gå til scoreboard
			setError('');
			setSuccessMessage('Riktig svar satt og poeng beregnet.');
		} catch (err) {
			setError(err.response?.data?.error || 'Feil ved å sette riktig svar.');
			setSuccessMessage('');
		}
	};

	// --------------------
	// 4) Admin ser scoreboard -> klikk "Neste spørsmål"
	const handleNextQuestion = () => {
		// Sjekk om vi har flere spørsmål
		if (currentGame && currentGame.currentQuestionIndex < currentGame.questions.length) {
			// Start neste syklus
			setPhase(1);
			setError('');
			setSuccessMessage('');
		} else {
			// Ingen flere spørsmål
			setError('Ingen flere spørsmål igjen – spillet er ferdig.');
		}
	};

	// --------------------
	// Render basert på fasen vi er i
	if (!currentGame) return <p>Spill ikke funnet.</p>;
	if (!currentQuestion) return <p>Ingen spørsmål tilgjengelig.</p>;

	return (
		<div className="admin-flow-container">
			<h2>Admin Spillflyt for {currentGame.title}</h2>

			{phase === 1 && (
				<div>
					<h3>Fase 1: Presentasjon av spørsmål</h3>
					<p><strong>Spørsmål:</strong> {currentQuestion.text}</p>
					<button onClick={handleOpenGuessing}>Åpne gjetting (30 sek)</button>
				</div>
			)}

			{phase === 2 && (
				<div>
					<h3>Fase 2: 30 sek gjetting</h3>
					<p><strong>Spørsmål:</strong> {currentQuestion.text}</p>
					<p>Tid igjen: {timeLeft} sekunder</p>
					<p>Spillere sender inn svar nå ...</p>
					{/* Her venter vi på at timer skal gå til 0 -> fase 3 */}
				</div>
			)}

			{phase === 3 && (
				<div>
					<h3>Fase 3: Sett riktig svar</h3>
					<p><strong>Spørsmål:</strong> {currentQuestion.text}</p>

					<input
						type="number"
						placeholder="Riktig Svar"
						value={correctAnswer}
						onChange={(e) => setCorrectAnswerInput(e.target.value)}
					/>
					<button onClick={handleSetCorrectAnswer}>Sett Svar</button>
				</div>
			)}

			{phase === 4 && (
				<div>
					<h3>Fase 4: Leaderboard</h3>
					<p>Se hvem som fikk flest poeng for dette spørsmålet.</p>
					{/* Gjenbruk Leaderboard-komponent eller vis info direkte */}
					<Leaderboard game={currentGame}/>
					<button onClick={handleNextQuestion}>Neste spørsmål</button>
				</div>
			)}

			{/* Feil og suksessmeldinger */}
			{error && <p className="error-message">{error}</p>}
			{successMessage && <p className="success-message">{successMessage}</p>}
		</div>
	);
};

export default AdminFlow;

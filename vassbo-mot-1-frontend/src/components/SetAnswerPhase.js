// src/components/SetAnswerPhase.js
import React from 'react';
import Leaderboard from './Leaderboard';

const SetAnswerPhase = ({
	                        currentQuestion,
	                        correctAnswer,
	                        setCorrectAnswerInput,
	                        handleSetCorrectAnswer,
	                        handleNextQuestion,
	                        error,
	                        successMessage
                        }) => {
	return (
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
			{error && <p className="error-message">{error}</p>}
			{successMessage && <p className="success-message">{successMessage}</p>}

			<h3>Fase 4: Leaderboard</h3>
			<p>Se hvem som fikk flest poeng for dette spørsmålet.</p>
			<Leaderboard/>
			<button onClick={handleNextQuestion}>Neste spørsmål</button>
		</div>
	);
};

export default SetAnswerPhase;

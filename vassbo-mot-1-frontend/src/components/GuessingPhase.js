// src/components/GuessingPhase.js
import React from 'react';
import Timer from './Timer';

const GuessingPhase = ({currentQuestion, deadline, handleTimeUp, error, successMessage}) => {
	return (
		<div>
			<h3>Fase 2: 30 sek gjetting</h3>
			<p><strong>Spørsmål:</strong> {currentQuestion.text}</p>
			{/* Timer-komponenten */}
			{deadline && (
				<Timer
					deadline={deadline}
					onTimeUp={handleTimeUp}
				/>
			)}
			<p>Spillere sender inn svar nå ...</p>
			{error && <p className="error-message">{error}</p>}
			{successMessage && <p className="success-message">{successMessage}</p>}
		</div>
	);
};

export default GuessingPhase;

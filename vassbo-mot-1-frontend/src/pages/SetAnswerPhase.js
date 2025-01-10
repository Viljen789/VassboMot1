// vassbo-mot-1-frontend/src/components/SetAnswerPhase.js

import React from 'react';
import '../components/SetAnswerPhase.css';

const SetAnswerPhase = ({question, correctAnswer, setCorrectAnswer, onSetCorrectAnswer}) => {
	return (
		<div className="set-answer-phase">
			<h3>Fase 3: Sett riktig svar</h3>
			<p><strong>Spørsmål:</strong> {question}</p>

			<input
				className={"answer-input"}
				type="number"
				placeholder="Riktig Svar"
				value={correctAnswer}
				onChange={(e) => setCorrectAnswer(e.target.value)}
			/>
			<button onClick={onSetCorrectAnswer}>Sett Svar</button>
		</div>
	);
};

export default SetAnswerPhase;

// src/components/PresentQuestionPhase.js
import React from 'react';

const PresentQuestionPhase = ({currentQuestion, handleOpenGuessing, error, successMessage}) => {
	return (
		<div>
			<h3>Fase 1: Presentasjon av spørsmål</h3>
			<p><strong>Spørsmål:</strong> {currentQuestion.text}</p>
			<button onClick={handleOpenGuessing}>Åpne gjetting (30 sek)</button>
			{error && <p className="error-message">{error}</p>}
			{successMessage && <p className="success-message">{successMessage}</p>}
		</div>
	);
};

export default PresentQuestionPhase;

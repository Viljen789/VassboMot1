import React from 'react';

const PresentQuestionPhase = ({question, questionNumber, onOpenGuessing, questionRange}) => {
	return (
		<div>
			<h3>Spørsmål {questionNumber}:</h3> {/* Use questionNumber here */}
			<p><strong>Spørsmål:</strong> {question} (fra {questionRange[0]} til {questionRange[1]})</p>
			<button onClick={onOpenGuessing}>Åpne gjetting (30 sek)</button>
		</div>
	);
};

export default PresentQuestionPhase;
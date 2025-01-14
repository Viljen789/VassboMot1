import React from 'react';
import '../styles/PresentQuestionPhase.css';

const PresentQuestionPhase = ({question, questionNumber, onOpenGuessing, questionRange}) => {
    return (
        <div className="present-question-phase">
            <h3>Spørsmål {questionNumber}:</h3> {/* Use questionNumber here */}
            <p><strong>Spørsmål:</strong> {question} (fra {questionRange[0]} til {questionRange[1]})</p>
            <button onClick={onOpenGuessing}>Åpne gjetting (30 sek)</button>
        </div>
    );
};

export default PresentQuestionPhase;
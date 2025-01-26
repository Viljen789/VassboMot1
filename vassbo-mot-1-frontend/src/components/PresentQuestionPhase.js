import React from "react";
import "../styles/PresentQuestionPhase.css";

const PresentQuestionPhase = ({
  question,
  questionNumber,
  onOpenGuessing,
  questionRange,
}) => {
  return (
    <div className="present-question-phase">
      <h3>Spørsmål {questionNumber}:</h3>
      <p>
        <strong>Spørsmål:</strong> {question} (fra {questionRange.min} til{" "}
        {questionRange.max})
      </p>
      <button onClick={onOpenGuessing}>Åpne gjetting (30 sek)</button>
    </div>
  );
};

export default PresentQuestionPhase;

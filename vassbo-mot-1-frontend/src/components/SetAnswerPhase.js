import React from "react";
import "../styles/SetAnswerPhase.css";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";

const SetAnswerPhase = ({
  question,
  correctAnswer,
  setCorrectAnswer,
  onSetCorrectAnswer,
  questionRange,
  onNextPhase, // New prop for navigating to the next phase
}) => {
  const handleInputChange = (e) => {
    const val = e.target.value;
    setCorrectAnswer(val); // Update state with the raw value as a string
  };

  const handleInputBlur = (e) => {
    const val = Number(e.target.value);
    if (questionRange && (val < questionRange.min || val > questionRange.max)) {
      setCorrectAnswer(""); // Clear the input if the value is out of range
      toast.error(
        `Tallet må vere mellom ${questionRange.min} og ${questionRange.max}`,
      );
    }
  };

  const handleTextInputChange = (e, min, max) => {
    const val = e.target.value;

    if (val === "") {
      setCorrectAnswer("");
      return;
    }

    const numericVal = Number(val);
    if (isNaN(numericVal)) {
      toast.error("Inndata må være et tall.");
      return;
    }

    const clampedVal = Math.min(Math.max(numericVal, min), max);
    if (clampedVal !== numericVal) {
      toast.error(`Svaret må være mellom ${min} og ${max}.`);
    }
    setCorrectAnswer(clampedVal);
  };

  return (
    <div className="set-answer-phase">
      <h3>Fase 3: Sett riktig svar</h3>
      <p>
        <strong>Spørsmål:</strong> {question ? question : "Loading..."}
      </p>
      <input
        className="answer-input"
        type="number"
        placeholder={
          questionRange
            ? `${questionRange.min} - ${questionRange.max}`
            : "Enter a number"
        }
        value={correctAnswer}
        onChange={(e) =>
          handleTextInputChange(e, questionRange.min, questionRange.max)
        }
        onBlur={handleInputBlur}
      />
      <button onClick={onSetCorrectAnswer}>Sett Svar</button>
      <ToastContainer />
    </div>
  );
};

export default SetAnswerPhase;

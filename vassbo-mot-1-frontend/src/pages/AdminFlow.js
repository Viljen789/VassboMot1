// src/pages/AdminFlow.js

import React, { useContext, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { GameContext } from "../context/GameContext";
import PresentQuestionPhase from "../components/PresentQuestionPhase";
import GuessingPhase from "../components/GuessingPhase";
import SetAnswerPhase from "../components/SetAnswerPhase";
import Leaderboard from "../components/Leaderboard";
import axios from "axios";
import "../styles/AdminFlow.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminFlow = () => {
  const { gameCode } = useParams();
  const { games, openGuessing, setCorrectAnswer } = useContext(GameContext);

  const [phase, setPhase] = useState(1);
  const [timeLeft, setTimeLeft] = useState(0);
  const [correctAnswer, setCorrectAnswerInput] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const currentGame = games[gameCode];
  const currentQuestionIndex = currentGame?.currentQuestionIndex ?? 0;
  const currentQuestion =
    currentGame?.questions?.[currentQuestionIndex] || null;

  // Helper function to start timer (phase 2)
  const startTimer = (seconds) => {
    setTimeLeft(seconds);
    const timerId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerId);
          setPhase(3);
          toast.success("Moving to phase 3: Setting correct answer.");
          axios
            .post("/api/updatePhase", { gameCode, phase: 3 })
            .catch((err) => {
              console.error("Error updating phase:", err);
              toast.error("Feil ved oppdatering av fase.");
            });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleOpenGuessing = async () => {
    try {
      await openGuessing(gameCode);
      setPhase(2);
      startTimer(30);
      toast.dismiss();
      axios.post("/api/updatePhase", { gameCode, phase: 2 }).catch((err) => {
        console.error("Error updating phase:", err);
        toast.error("Feil ved oppdatering av fase.");
      });
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || "Feil ved start av runde.";
      toast.error(errorMessage);
    }
  };

  // src/pages/AdminFlow.js

  const handleSetCorrectAnswer = async () => {
    const correctAnswerStr = correctAnswer.toString().trim();
    if (!correctAnswerStr) {
      toast.error("Riktig svar kan ikke være tomt.");
      return;
    }
    const numericAnswer = Number(correctAnswerStr);
    if (isNaN(numericAnswer)) {
      toast.error("Riktig svar må være et tall.");
      return;
    }
    try {
      await setCorrectAnswer(gameCode, numericAnswer);
      setCorrectAnswerInput("");
      setPhase(4);
      toast.success("Riktig svar satt og poeng beregnet.");
      toast.dismiss();
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || "Feil ved å sette riktig svar.";
      toast.error(errorMessage);
      toast.dismiss();
    }
  };
  const handleNextQuestion = () => {
    const currentGame = games[gameCode];
    if (!currentGame) {
      toast.error("Spill ikke funnet.");
      return;
    }

    if (currentGame.currentQuestionIndex >= currentGame.questions.length - 1) {
      toast.error("Ingen flere spørsmål igjen – spillet er ferdig.");
      setPhase(4);
      return;
    }

    currentGame.currentQuestionIndex += 1;
    setPhase(1);
    toast.dismiss();
  };

  useEffect(() => {
    if (phase === 2 && currentGame) {
      const allAnswersSubmitted = currentGame.players.every(
        (player) => currentGame.answers[player.name] !== undefined,
      );
      if (allAnswersSubmitted) {
        setPhase(3);
        toast.success("All answers submitted. Moving to phase 3.");
        axios.post("/api/updatePhase", { gameCode, phase: 3 }).catch((err) => {
          console.error("Error updating phase:", err);
          toast.error("Feil ved oppdatering av fase.");
        });
      }
    }
  }, [phase, currentGame, gameCode]);

  if (!currentGame) {
    return <div>Loading...</div>;
  }

  return (
    <div className="admin-flow-container">
      <h2 className="game-title">{currentGame.title}</h2>

      {phase === 1 && currentQuestion && (
        <PresentQuestionPhase
          question={currentQuestion.text}
          questionNumber={currentQuestionIndex + 1}
          onOpenGuessing={handleOpenGuessing}
          questionRange={{
            min: currentQuestion.rangeMin,
            max: currentQuestion.rangeMax,
          }}
        />
      )}

      {phase === 2 && (
        <GuessingPhase question={currentQuestion.text} timeLeft={timeLeft} />
      )}

      {phase === 3 && (
        <SetAnswerPhase
          question={currentQuestion.text}
          correctAnswer={correctAnswer}
          setCorrectAnswer={setCorrectAnswerInput}
          onSetCorrectAnswer={handleSetCorrectAnswer}
          questionRange={{
            min: currentQuestion.rangeMin,
            max: currentQuestion.rangeMax,
          }}
        />
      )}

      {phase === 4 && (
        <Leaderboard
          game={currentGame}
          onNextQuestion={handleNextQuestion}
          isFinal={
            currentGame.currentQuestionIndex >= currentGame.questions.length - 1
          }
        />
      )}

      <ToastContainer closeButton={false} autoClose={3000} />
    </div>
  );
};

export default AdminFlow;

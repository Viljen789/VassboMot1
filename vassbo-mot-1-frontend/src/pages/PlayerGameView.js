// src/components/PlayerGameView.js

import React, {useContext, useState, useEffect} from 'react';
import {useParams} from 'react-router-dom';
import {GameContext} from '../context/GameContext';
import Timer from '../components/Timer';
import {io} from 'socket.io-client';
import axios from 'axios';
import '../styles/PlayerGameView.css';
import CountUp from 'react-countup';
import {toast, ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PlayerGameView = ({gameCode: propGameCode, mockGame}) => {
    // Bruk propGameCode hvis tilgjengelig, ellers bruk gameCode fra URL-parametere
    const {gameCode: paramGameCode} = useParams();
    const gameCode = propGameCode || paramGameCode;

    const {games, submitGuess, setGames} = useContext(GameContext);

    const [useTextInput, setUseTextInput] = useState(false);
    const [guess, setGuess] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [canSubmit, setCanSubmit] = useState(false);
    const [deadline, setDeadline] = useState(null);
    const [phase, setPhase] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [gameEnded, setGameEnded] = useState(false);

    const playerName = sessionStorage.getItem('playerName')?.trim();

    const calculateMidpoint = (min, max) => Math.floor((min + max) / 2);

    const fetchGame = async () => {
        try {
            const backendUrl = `${window.location.protocol}//${window.location.hostname}:3001`;
            const response = await axios.get(`${backendUrl}/api/games/${gameCode}`);
            setGames((prev) => ({
                ...prev,
                [gameCode]: response.data,
            }));
        } catch (err) {
            toast.error(`Fant ikke spillet med kode ${gameCode}.`);
            console.error('Feil ved henting av spill:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!mockGame && !games[gameCode]) {
            fetchGame();
        } else {
            setIsLoading(false);
        }
    }, [gameCode, mockGame]);

    useEffect(() => {
        if (mockGame) {
            setGames((prev) => ({
                ...prev,
                [gameCode]: mockGame,
            }));
            setIsLoading(false);
        }
    }, [mockGame, gameCode, setGames]);

    useEffect(() => {
        if (!mockGame) {
            const backendUrl = `${window.location.protocol}//${window.location.hostname}:3001`;
            const socket = io(backendUrl);

            socket.on('updateGame', (updatedGame) => {
                setGames((prev) => ({
                    ...prev,
                    [updatedGame.gameCode]: updatedGame,
                }));
            });

            socket.on('updatePhase', ({phase: updatedPhase, gameCode: updatedGameCode}) => {
                setGames((prevGames) => ({
                    ...prevGames,
                    [updatedGameCode]: {
                        ...prevGames[updatedGameCode],
                        phase: updatedPhase,
                    },
                }));
            });

            socket.on('gameEnded', ({leaderboard, gameCode: endedGameCode}) => {
                setGames((prevGames) => ({
                    ...prevGames,
                    [endedGameCode]: {
                        ...prevGames[endedGameCode],
                        phase: 5,
                        leaderboard,
                    },
                }));
                setGameEnded(true);
            });

            socket.emit('joinRoom', gameCode);

            return () => socket.disconnect();
        }
    }, [gameCode, mockGame, setGames]);

    useEffect(() => {
        if (isLoading) return;

        const currentGame = mockGame || games[gameCode];
        if (!currentGame) {
            setPhase(0);
            return;
        }

        const currentQuestion = currentGame.questions?.[currentGame.currentQuestionIndex] || null;
        if (!currentQuestion) {
            setPhase(0);
            return;
        }

        if (currentGame.status === 'started') {
            // Sjekk om 'phase' finnes og er et gyldig tall
            if (typeof currentGame.phase === 'number') {
                setPhase(currentGame.phase);
                console.log(`Fase satt til: ${currentGame.phase}`); // Logg lagt til

                if (currentGame.phase === 2) {
                    const userAlreadyGuessed = currentGame.answers?.[playerName] !== undefined;
                    setCanSubmit(!userAlreadyGuessed);

                    if (userAlreadyGuessed) {
                        setGuess(currentGame.answers[playerName]);
                    } else {
                        const {rangeMin, rangeMax} = currentQuestion;
                        setGuess((prevGuess) => (prevGuess === null ? calculateMidpoint(rangeMin, rangeMax) : prevGuess));
                    }

                    if (currentGame.roundStartedAt) {
                        const computedDeadline = currentGame.roundStartedAt + 30000; // 30 sekunder
                        setDeadline(computedDeadline);
                    } else {
                        setDeadline(Date.now() + 30000);
                    }
                } else if (currentGame.phase === 1) {
                    setCanSubmit(false);
                    setDeadline(null);
                    setGuess(null);
                } else if (currentGame.phase === 3) {
                    setCanSubmit(false);
                    setDeadline(null);
                    setGuess(null);
                } else if (currentGame.phase === 4) {
                    setCanSubmit(false);
                    setDeadline(null);
                    setGuess(null);
                } else if (currentGame.phase === 5) {
                    setGameEnded(true);
                } else {
                    setCanSubmit(false);
                    setDeadline(null);
                    setGuess(null);
                }
            } else {
                // Hvis 'phase' mangler eller er ugyldig, sett til fase 0
                setPhase(0);
                console.log(`Fase er udefinert eller ugyldig, standardiserer til: 0`); // Logg lagt til
                setCanSubmit(false);
                setDeadline(null);
                setGuess(null);
            }
        } else {
            setPhase(0);
            console.log(`Spillstatus ikke startet, standardiserer til: 0`); // Logg lagt til
            setCanSubmit(false);
            setDeadline(null);
            setGuess(null);
        }
    }, [isLoading, games, gameCode, mockGame, setGames, playerName]);

    const handleTimeUp = () => {
        setPhase(3);
        setCanSubmit(false);
        setDeadline(null);
    };

    const handleTextInputChange = (e, min, max) => {
        const val = e.target.value;

        if (val === '') {
            setGuess('');
            return;
        }

        const numericVal = Number(val);
        if (isNaN(numericVal)) {
            toast.error('Inndata må være et tall.');
            return;
        }

        const clampedVal = Math.min(Math.max(numericVal, min), max);
        if (clampedVal !== numericVal) {
            toast.error(`Inndata må være mellom ${min} og ${max}.`);
        }
        setGuess(clampedVal);
    };

    const handleSubmitGuess = async () => {
        if (!playerName) {
            toast.error('Spiller er ikke definert.');
            return;
        }
        if (guess === null || guess === '') {
            toast.error('Svar kan ikke være tomt.');
            return;
        }

        const trimmedPlayerName = playerName.trim();
        if (!trimmedPlayerName) {
            toast.error('Ugyldig spillernavn.');
            return;
        }

        try {
            await submitGuess(gameCode, trimmedPlayerName, guess);
            setSuccessMessage('Svar sendt!');
            setCanSubmit(false);
        } catch (err) {
            console.error('Feil ved innsending av svar:', err);
            if (err.message) {
                toast.error(err.message);
            } else {
                toast.error('Feil ved innsending av svar.');
            }
            setSuccessMessage('');
        }
    };

    if (isLoading) {
        return (
            <div className="player-game-view">
                <ToastContainer/>
                <p>Laster spilldata...</p>
            </div>
        );
    }

    const currentGame = mockGame || games[gameCode];

    if (!currentGame || currentGame.status !== 'started') {
        return (
            <div className="player-game-view">
                <ToastContainer/>
                <h2>Velkommen {playerName}!</h2>
                <p>Vennligst vent mens spillet settes opp.</p>
            </div>
        );
    }

    const currentQuestion = currentGame.questions?.[currentGame.currentQuestionIndex];
    const {rangeMin: minVal, rangeMax: maxVal} = currentQuestion || {};

    const fillPercent = ((Number(guess) || calculateMidpoint(minVal, maxVal)) - minVal) / (maxVal - minVal) * 100;

    return (
        <div className="player-game-view">
            <ToastContainer/>
            {gameEnded ? (
                <div>
                    <h2>Spillet er over!</h2>
                    <p>Flott jobbet! Sjekk resultatlister for å se om du nådde podiet.</p>
                </div>
            ) : (
                <>
                    <h3>Nåværende spørsmål:</h3>
                    <p>{currentQuestion.text}</p>

                    {phase === 0 && (
                        <div>
                            <p>Venter på at verten skal starte spillet...</p>
                        </div>
                    )}

                    {phase === 1 && (
                        <div>
                            <p>Venter på at admin åpner for gjettninger...</p>
                        </div>
                    )}

                    {phase === 2 && (
                        <div className="answer-section">
                            <Timer deadline={deadline} onTimeUp={handleTimeUp}/>
                            <div className="custom-checkbox-container">
                                <label htmlFor="useTextInput" style={{marginRight: '8px'}}>
                                    Foretrekker tekstinndata?
                                </label>
                                <label className="custom-checkbox">
                                    <input
                                        type="checkbox"
                                        id="useTextInput"
                                        checked={useTextInput}
                                        disabled={!canSubmit}
                                        onChange={(e) => {
                                            setUseTextInput(e.target.checked);
                                        }}
                                    />
                                    <span className="checkmark"></span>
                                </label>
                            </div>

                            {useTextInput ? (
                                <div className="text-input">
                                    <input
                                        type="number"
                                        min={minVal}
                                        max={maxVal}
                                        value={guess === null ? '' : guess}
                                        onChange={(e) => handleTextInputChange(e, minVal, maxVal)}
                                        disabled={!canSubmit}
                                        placeholder={`Skriv inn et tall mellom ${minVal} og ${maxVal}`}
                                    />
                                </div>
                            ) : (
                                <div className="slider-input">
                                    <input
                                        type="range"
                                        min={minVal}
                                        max={maxVal}
                                        value={guess !== null ? guess : calculateMidpoint(minVal, maxVal)}
                                        onChange={(e) => {
                                            const v = Number(e.target.value);
                                            setGuess(v);
                                        }}
                                        disabled={!canSubmit}
                                        style={{
                                            background: `linear-gradient(
                                                to right,
                                                var(--primary-color) ${fillPercent}%,
                                                #ccc ${fillPercent}%
                                            )`,
                                        }}
                                        aria-label="Gjett slider"
                                    />
                                    <span>{guess !== null ? guess : calculateMidpoint(minVal, maxVal)}</span>
                                </div>
                            )}

                            <button onClick={handleSubmitGuess} disabled={!canSubmit}>
                                {canSubmit ? 'Send inn svar' : 'Svar sendt!'}
                            </button>

                            {successMessage && <p className="success-message">{successMessage}</p>}
                        </div>
                    )}

                    {phase === 3 && (
                        <div>
                            <p>Regner ut poeng...</p>
                            {currentGame.players && currentGame.players.find((p) => p.name === playerName)?.score > 0 && (
                                <span className="updated-score">
                                    <p>
                                        +{' '}
                                        <CountUp
                                            end={
                                                mockGame
                                                    ? 10
                                                    : currentGame.players.find((p) => p.name === playerName)?.score || 0
                                            }
                                            duration={2}
                                        />
                                    </p>
                                </span>
                            )}
                        </div>
                    )}

                    {phase === 4 && (
                        <div>
                            <p>Venter på neste spørsmål...</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );

};

export default PlayerGameView;

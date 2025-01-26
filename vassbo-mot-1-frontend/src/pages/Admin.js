// src/pages/Admin.js

import React, {useState, useContext, useEffect} from 'react';
import {GameContext} from '../context/GameContext';
import '../styles/Admin.css';
import {useNavigate} from 'react-router-dom';
import {toast, ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Admin = () => {
    const {
        createGame,
        addQuestion,
        startGame,
        games,
        updateQuestion,
        setGames,
        joinRoom,
        openGuessingPhase
    } = useContext(GameContext);
    const [title, setTitle] = useState('');
    const [gameCode, setGameCode] = useState('');
    const [question, setQuestion] = useState('');
    const [rangeMin, setRangeMin] = useState('');
    const [rangeMax, setRangeMax] = useState('');
    const [editIndex, setEditIndex] = useState(null);
    const [editedQuestion, setEditedQuestion] = useState({text: '', rangeMin: '', rangeMax: ''});
    const navigate = useNavigate();
    const [showWarning, setShowWarning] = useState(false);
    const [showQuestions, setShowQuestions] = useState(true);

    useEffect(() => {
        // If there's an existing game in the state, set the gameCode
        const existingGames = Object.keys(games);
        if (existingGames.length > 0) {
            setGameCode(existingGames[0]);
        }
    }, [games]);

    // Join room when gameCode is set
    useEffect(() => {
        if (gameCode) {
            joinRoom(gameCode);
            console.log(`Admin joined room: ${gameCode}`);
        }
    }, [gameCode, joinRoom]);

    const handleCreateGame = async () => {
        if (!title.trim()) {
            toast.error('Konkurransenavn kan ikke være tomt.');
            return;
        }
        try {
            const newGame = await createGame(title);
            setGameCode(newGame.gameCode);
            setTitle('');
            toast.success(`Spill "${newGame.title}" opprettet! Spillkoden er ${newGame.gameCode}.`);
            setGames((prevGames) => ({
                ...prevGames,
                [newGame.gameCode]: newGame,
            }));
        } catch (err) {
            toast.error('Feil ved opprettelse av spill.');
        }
    };

    const handleAddQuestion = async () => {
        if (!question.trim()) {
            toast.error('Spørsmål kan ikke være tomt.');
            return;
        }
        const min = Number(rangeMin);
        const max = Number(rangeMax);
        if (isNaN(min) || isNaN(max) || min >= max) {
            toast.error('Ugyldig range (min < max).');
            return;
        }

        const newQuestion = {
            text: question,
            rangeMin: min,
            rangeMax: max,
        };

        try {
            await addQuestion(gameCode, newQuestion);
            setQuestion('');
            setRangeMin('');
            setRangeMax('');
            toast.success('Spørsmål lagt til!');
        } catch (err) {
            toast.error('Feil ved tillegg av spørsmål.');
        }
    };
    const handleOpenGuessing = async () => {
        try {
            await openGuessingPhase(gameCode);
            toast.success('Gjetting er åpnet!');
        } catch (err) {
            toast.error('Feil ved start av runde.');
        }
    };

    const handleStartGame = async () => {
        const currentGame = games[gameCode];
        if (!currentGame || currentGame.players.length < 2 || currentGame.questions.length < 1) {
            toast.error('Spillet må ha minst to spillere og ett spørsmål.');
        }
        try {
            await startGame(gameCode);
            toast.success('Spillet har startet! Navigerer til spillmodus...');
            setTimeout(() => {
                navigate(`/admin/flow/${gameCode}`);
            }, 1500);
        } catch (err) {
            toast.error('Feil ved oppstart av spill.');
        }
    };

    const handleEditQuestion = (index) => {
        const currentGame = games[gameCode];
        if (!currentGame || !currentGame.questions || !currentGame.questions[index]) {
            toast.error('Spørsmålet ble ikke funnet.');
            return;
        }
        const questionToEdit = currentGame.questions[index];
        setEditIndex(index);
        setEditedQuestion({
            text: questionToEdit.text,
            rangeMin: questionToEdit.rangeMin,
            rangeMax: questionToEdit.rangeMax,
        });
    };

    const handleSaveEditedQuestion = async () => {
        if (!editedQuestion.text.trim()) {
            toast.error('Spørsmål kan ikke være tomt.');
            return;
        }

        const min = Number(editedQuestion.rangeMin);
        const max = Number(editedQuestion.rangeMax);
        if (isNaN(min) || isNaN(max) || min >= max) {
            toast.error('Vennligst oppgi gyldig range (min < max).');
            return;
        }

        const updatedQuestion = {
            text: editedQuestion.text,
            rangeMin: min,
            rangeMax: max,
        };

        try {
            const response = await updateQuestion(gameCode, editIndex, updatedQuestion);
            setGames((prevGames) => {
                const updatedGames = {...prevGames};
                updatedGames[gameCode].questions[editIndex] = response.question;
                return updatedGames;
            });
            setEditIndex(null);
            setEditedQuestion({text: '', rangeMin: '', rangeMax: ''});
            toast.success('Spørsmål oppdatert!');
        } catch (err) {
            toast.error('Feil ved oppdatering av spørsmål.');
        }
    };

    const currentGame = games[gameCode];

    return (
        <div className="admin-container">
            <h2 className="admin-title">Admin Dashboard</h2>
            <div className="create-game-section">
                {!gameCode ? (
                    <>
                        <input
                            type="text"
                            placeholder="Konkurransenavn"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="admin-input"
                        />
                        <button onClick={handleCreateGame} className="create-button">Opprett Spill</button>
                    </>
                ) : (
                    currentGame ? (
                        <div className="game-details">
                            <h3 className="game-name">{currentGame.title}</h3>
                            <p className="game-code"><strong>Spillkode:</strong> {gameCode}</p>
                        </div>
                    ) : (
                        <p className="loading-message"><strong>Spillnavn:</strong> Laster...</p>
                    )
                )}
            </div>

            {/* Questions Section */}
            {gameCode && currentGame && currentGame.questions && (
                <div className="questions-section">
                    <h3 className="section-title">Spørsmål ({currentGame.questions.length})</h3>
                    <button onClick={() => setShowQuestions((prev) => !prev)} className="toggle-questions-button">
                        {showQuestions ? 'Skjul Spørsmål' : 'Vis Spørsmål'}
                    </button>

                    {showQuestions && (
                        <div className="questions-content">
                            {/* Questions List */}
                            <ul className="questions-list">
                                {currentGame.questions.map((q, index) => (
                                    <li key={index} className="question-item">
                                        {editIndex === index ? (
                                            <div className="edit-question">
                                                <input
                                                    type="text"
                                                    value={editedQuestion.text}
                                                    onChange={(e) =>
                                                        setEditedQuestion({
                                                            ...editedQuestion,
                                                            text: e.target.value
                                                        })
                                                    }
                                                    placeholder="Oppdatert spørsmålstekst"
                                                    className="edit-input"
                                                />
                                                <div className="range-inputs">
                                                    <input
                                                        type="number"
                                                        value={editedQuestion.rangeMin}
                                                        onChange={(e) =>
                                                            setEditedQuestion({
                                                                ...editedQuestion,
                                                                rangeMin: e.target.value
                                                            })
                                                        }
                                                        placeholder="Min verdi"
                                                        className="range-input"
                                                    />
                                                    <input
                                                        type="number"
                                                        value={editedQuestion.rangeMax}
                                                        onChange={(e) =>
                                                            setEditedQuestion({
                                                                ...editedQuestion,
                                                                rangeMax: e.target.value
                                                            })
                                                        }
                                                        placeholder="Max verdi"
                                                        className="range-input"
                                                    />
                                                </div>
                                                <div className="button-container">
                                                    <button onClick={handleSaveEditedQuestion}
                                                            className="save-button">Lagre
                                                    </button>
                                                    <button onClick={() => setEditIndex(null)}
                                                            className="cancel-button">Avbryt
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="question-item-content">
                                                <span className="question-text">
                                                    {q.text} {q.rangeMin !== undefined && q.rangeMax !== undefined ? `(${q.rangeMin} - ${q.rangeMax})` : ''}
                                                </span>
                                                <button onClick={() => handleEditQuestion(index)}
                                                        className="edit-button">Rediger
                                                </button>
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>

                            {/* Add Question Section */}
                            <div className="add-question-section">
                                <h4 className="add-question-title">Legg til Spørsmål</h4>
                                <input
                                    type="text"
                                    placeholder="Spørsmål"
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                    className="add-question-input"
                                />
                                <div className="range-inputs">
                                    <input
                                        type="number"
                                        placeholder="Min verdi"
                                        value={rangeMin}
                                        onChange={(e) => setRangeMin(e.target.value)}
                                        className="range-input"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max verdi"
                                        value={rangeMax}
                                        onChange={(e) => setRangeMax(e.target.value)}
                                        className="range-input"
                                    />
                                </div>
                                <button onClick={handleAddQuestion} className="add-question-button">Legg til Spørsmål
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {gameCode && currentGame && currentGame.players && (
                <div className="players-section">
                    <h3 className="section-title">Spillere ({currentGame.players.length})</h3>
                    {currentGame.players.length === 0 ? (
                        <p className="no-players-message">Ingen spillere har blitt med enda.</p>
                    ) : (
                        <ul className="players-list">
                            {currentGame.players.map((player, index) => (
                                <li key={index} className="player-item">
                                    {player.name}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {/* Start Game Section */}
            {gameCode && currentGame && (
                <div className="start-game-section">
                    <div
                        className="start-game-wrapper"
                        onMouseEnter={() => {
                            if (currentGame.players.length < 2 || currentGame.questions.length < 1) {
                                setShowWarning(true);
                            }
                        }}
                        onMouseLeave={() => setShowWarning(false)}
                    >
                        <button
                            onClick={(e) => {
                                if (currentGame.players.length < 2 || currentGame.questions.length < 1) {
                                    e.preventDefault();
                                    setShowWarning(true);
                                } else {
                                    handleStartGame();
                                }
                            }}
                            disabled={currentGame.players.length < 2 || currentGame.questions.length < 1}
                            className="start-game-button"
                        >
                            Start Spill
                        </button>
                    </div>
                    {showWarning && (currentGame.players.length < 2 ? (
                        <p className="warning-message">Minst to spillere må bli med før spillet kan startes.</p>
                    ) : (
                        <p className="warning-message">Spillet må minst ha ett spørsmål for å kunne starte.</p>
                    ))}
                </div>
            )}

            <ToastContainer closeButton={false} autoClose={3000}/>
        </div>
    );
};

export default Admin;

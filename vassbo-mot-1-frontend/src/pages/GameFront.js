// vassbo-mot-1-frontend/src/pages/GameFront.js

import React, {useContext, useState, useEffect} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {GameContext} from '../context/GameContext';
import PlayerGameView from '../components/PlayerGameView';
import './Game.css'; // Valgfritt: For styling

const GameFront = () => {
	const {gameCode} = useParams();
	const {games, joinGame} = useContext(GameContext);
	const navigate = useNavigate();
	const [playerName, setPlayerName] = useState('');
	const [joined, setJoined] = useState(false);
	const [error, setError] = useState('');

	// Hent spillernavnet fra localStorage hvis tilgjengelig
	useEffect(() => {
		const storedName = localStorage.getItem('playerName');
		if (storedName) {
			setPlayerName(storedName);
			setJoined(true);
		}
	}, []);

	const handleJoin = async () => {
		if (!playerName.trim()) {
			setError('Navn kan ikke være tomt.');
			return;
		}

		try {
			// Forsøk å bli med i spillet ved å bruke joinGame-funksjonen
			await joinGame(gameCode, playerName);
			setError('');
			setJoined(true);
			localStorage.setItem('playerName', playerName);
		} catch (err) {
			setError(err.response?.data?.error || 'Feil ved å bli med i spill.');
		}
	};

	const currentGame = games[gameCode];

	if (!currentGame) {
		return <div className="game-container"><p>Venter på at spillet skal starte.</p></div>;
	}

	return (
		<div className="game-container">
			<h2>Spill: {currentGame.title}</h2>

			{!joined ? (
				<div className="join-game">
					<input
						type="text"
						placeholder="Ditt navn"
						value={playerName}
						onChange={(e) => setPlayerName(e.target.value)}
					/>
					<button onClick={handleJoin}>Bli Med</button>
					{error && <p className="error-message">{error}</p>}
				</div>
			) : (
				<PlayerGameView gameCode={gameCode} playerName={playerName}/>
			)}
		</div>
	);
};

export default GameFront;

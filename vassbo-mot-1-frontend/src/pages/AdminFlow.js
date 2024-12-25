// src/pages/AdminFlow.js

import React, {useContext} from 'react';
import {useParams} from 'react-router-dom';
import {GameContext} from '../context/GameContext';
/*import './AdminFlow.css';*/

const AdminFlow = () => {
	const {gameCode} = useParams();
	const {games, startRound, setCorrectAnswer} = useContext(GameContext);
	const currentGame = games[gameCode];

	if (!currentGame) {
		return <p>Laster spilldata...</p>;
	}

	const handleStartRound = async () => {
		try {
			await startRound(gameCode);
			// Sett riktig svar etter at runden er startet
			// Dette kan implementeres etter behov
		} catch (error) {
			console.error('Error starting round:', error);
		}
	};

	return (
		<div className="admin-flow-container">
			<h2>Admin Flow for Spill: {currentGame.title}</h2>
			<p>Spillkode: {gameCode}</p>

			{/* Legg til knapp for å starte runde */}
			{currentGame.status === 'started' && !currentGame.roundActive && (
				<button onClick={handleStartRound}>Start Runde</button>
			)}

			{/* Vis rundeinformasjon */}
			{currentGame.roundActive && (
				<div>
					<h3>Aktiv Runde:</h3>
					<p>Spørsmål: {currentGame.questions[currentGame.currentQuestionIndex].text}</p>
					{/* Legg til input for riktig svar */}
					<input
						type="text"
						placeholder="Riktig svar"
						onBlur={(e) => setCorrectAnswer(gameCode, e.target.value)}
					/>
				</div>
			)}

			{/* Vis leaderboard */}
			<div className="leaderboard">
				<h3>Leaderboard:</h3>
				<ul>
					{currentGame.players.sort((a, b) => b.score - a.score).map((player, index) => (
						<li key={index}>{player.name}: {player.score} poeng</li>
					))}
				</ul>
			</div>
		</div>
	);
};

export default AdminFlow;

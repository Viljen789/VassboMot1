// vassbo-mot-1-frontend/src/pages/AdminGame.js

import React, {useContext, useEffect} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {GameContext} from '../context/GameContext';
import AdminGameMode from '../components/AdminGameMode';
/*import './AdminGame.css'; // Valgfritt: For styling*/

const AdminGame = () => {
	const {gameCode} = useParams();
	const {games, startGame} = useContext(GameContext);
	const navigate = useNavigate();

	const currentGame = games[gameCode];

	useEffect(() => {
		if (!currentGame) {
			// Hvis spillet ikke finnes, naviger tilbake til admin-dashbordet eller vis en feilmelding
			navigate('/admin');
		}
	}, [currentGame, navigate]);

	if (!currentGame) {
		return <p>Spill ikke funnet.</p>;
	}

	return (
		<div className="admin-game-container">
			<h2>Admin - {currentGame.title}</h2>

			{currentGame.status === 'created' && (
				<div className="start-game-section">
					<button
						onClick={() => {
							startGame(gameCode).catch((err) => {
								console.error('Error starting game:', err);
							});
						}}
						disabled={
							currentGame.players.length < 2 || // Minimum antall spillere
							currentGame.questions.length < 1 // Minimum antall spørsmål
						}
					>
						Start Spill
					</button>
				</div>
			)}

			{currentGame.status === 'in-progress' && (
				<AdminGameMode gameCode={gameCode}/>
			)}

			{/* Liste over deltakere */}
			<div className="participants-section">
				<h3>Deltakere</h3>
				<ul>
					{currentGame.players.map((player, index) => (
						<li key={index}>{player.name} - {player.score} poeng</li>
					))}
				</ul>
			</div>
		</div>
	);
};

export default AdminGame;

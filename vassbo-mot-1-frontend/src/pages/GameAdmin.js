// vassbo-mot-1-frontend/src/pages/GameAdmin.js

import React, {useContext, useEffect} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {GameContext} from '../context/GameContext';
import AdminGameMode from '../components/AdminGameMode';
/*import './GameAdmin.css'; // Valgfritt: For styling*/

const GameAdmin = () => {
	const {gameCode} = useParams();
	const {games} = useContext(GameContext);
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
		<div className="game-admin-container">
			<h2>Admin - {currentGame.title}</h2>

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

			{/* Liste over spørsmål */}
			<div className="questions-list">
				<h3>Spørsmål</h3>
				<ul>
					{currentGame.questions.map((q, index) => (
						<li key={index}>
							{q.text} {q.useSlider && q.range ? `(Range: ${q.range[0]} - ${q.range[1]})` : ''}
						</li>
					))}
				</ul>
			</div>

			{/* Feilmeldinger og suksessmeldinger */}
			{currentGame.error && <p className="error-message">{currentGame.error}</p>}
			{currentGame.successMessage && <p className="success-message">{currentGame.successMessage}</p>}
		</div>
	);
};

export default GameAdmin;

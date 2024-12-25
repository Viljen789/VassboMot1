// src/pages/Leaderboard.js
import React, {useContext} from 'react';
import {useParams} from 'react-router-dom';
import {GameContext} from '../context/GameContext';

const Leaderboard = () => {
	const {gameCode} = useParams();
	const {games} = useContext(GameContext);
	const game = games[gameCode];

	if (!game) {
		return <div>Spillet finnes ikke.</div>;
	}

	// Sort players by score descending
	const sortedPlayers = [...game.players].sort((a, b) => b.score - a.score);

	return (
		<div>
			<h1>Leaderboard for Spillkode: {gameCode}</h1>
			<h2>Tittel: {game.title}</h2>
			<ul>
				{sortedPlayers.map((player, index) => (
					<li key={index}>
						{index + 1}. {player.name} - Poeng: {player.score}
					</li>
				))}
			</ul>
			<button onClick={() => window.location.href = '/'}>Tilbake til Hjem</button>
		</div>
	);
};

export default Leaderboard;
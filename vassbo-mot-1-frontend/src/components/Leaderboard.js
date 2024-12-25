// src/components/Leaderboard.js
import React from 'react';

const Leaderboard = ({game}) => {
	if (!game || !game.leaderboard) {
		return <p>Ingen leaderboard tilgjengelig.</p>;
	}

	return (
		<div className="leaderboard">
			<h3>Leaderboard</h3>
			<ul>
				{game.leaderboard.map((player, index) => (
					<li key={index}>
						{player.name}: {player.score} poeng
					</li>
				))}
			</ul>
		</div>
	);
};

export default Leaderboard;

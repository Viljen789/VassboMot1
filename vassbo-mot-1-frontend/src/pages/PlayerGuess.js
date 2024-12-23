// src/components/PlayerGuess.js.js
import React, {useState, useContext} from 'react';
import {GameContext} from '../contexts/GameContext';

const PlayerGuess = ({gameCode, playerName}) => {
	const [guess, setGuess] = useState('');
	const [message, setMessage] = useState('');
	const {games} = useContext(GameContext);

	const handleSubmit = (e) => {
		e.preventDefault();
		const game = games[gameCode];

		if (!game || game.status !== 'guessing') {
			setMessage('Du kan ikke gjette akkurat nå.');
			return;
		}

		// Her må du implementere en funksjon i GameContext for å oppdatere spillerens gjetning
		// For enkelhets skyld kan vi anta at det finnes en funksjon `submitGuess`

		// submitGuess(gameCode, playerName, guess);
		setMessage('Gjetning sendt!');
		setGuess('');
	};

	return (
		<div>
			<form onSubmit={handleSubmit}>
				<label>
					Din gjetning:
					<input
						type="number"
						value={guess}
						onChange={(e) => setGuess(e.target.value)}
						required
					/>
				</label>
				<button type="submit">Send inn gjetning</button>
			</form>
			{message && <p>{message}</p>}
		</div>
	);
};

export default PlayerGuess;
// src/components/PlayerGuess.js
import React, {useState, useContext} from 'react';
import {GameContext} from '../context/GameContext';

const PlayerGuess = ({gameCode, playerName}) => {
	const [guess, setGuess] = useState('');
	const [message, setMessage] = useState('');
	const {submitGuess} = useContext(GameContext);

	const handleSubmit = async (e) => {
		e.preventDefault();
		const guessNumber = Number(guess);
		if (isNaN(guessNumber) || guessNumber < 0 || guessNumber > 100) {
			setMessage('Gjetningen må være et tall mellom 0 og 100.');
			return;
		}
		const result = await submitGuess(gameCode, playerName, guessNumber);
		if (result.success) {
			setMessage('Gjetning sendt!');
			setGuess('');
		} else {
			setMessage(result.error || 'Noe gikk galt. Vennligst prøv igjen.');
		}
	};

	return (
		<div>
			<form onSubmit={handleSubmit}>
				<label>
					Din gjetning (0-100):
					<input
						type="number"
						min="0"
						max="100"
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
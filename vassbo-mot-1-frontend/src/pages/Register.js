import React, {useState, useContext} from 'react';
import {useNavigate} from 'react-router-dom';
import {GameContext} from '../context/GameContext';
import './Register.css';

const Register = () => {
	const {joinGame, validateGameCode} = useContext(GameContext);

	const [gameCode, setGameCode] = useState('');
	const [playerName, setPlayerName] = useState('');
	const [error, setError] = useState('');
	const [isCodeLocked, setIsCodeLocked] = useState(false);
	const [isGameValid, setIsGameValid] = useState(false);
	const navigate = useNavigate();

	const handleValidateCode = async () => {
		if (!gameCode.trim()) {
			setError('Spillkode kan ikke være tom.');
			return;
		}

		try {
			const isValid = await validateGameCode(gameCode);
			if (isValid) {
				setError('');
				setIsGameValid(true);
				setIsCodeLocked(true);
			} else {
				setError('Ugyldig spillkode.');
			}
		} catch (err) {
			console.error('Error during game code validation:', err);
			setError('Feil ved validering av spillkode.');
		}
	};

	const handleJoinGame = async () => {
		if (!gameCode.trim()) {
			setError('Spillkode kan ikke være tom.');
			return;
		}

		try {
			const response = await joinGame(gameCode, playerName); // Send playerName to the backend
			sessionStorage.setItem('playerName', response.data.player.name); // Save assigned name
			navigate(`/game/${gameCode}`);
		} catch (err) {
			console.error('Error joining game:', err);
			setError('Feil ved å bli med i spillet.');
		}
	};

	return (
		<div className="register-container">
			<h2>Bli med i Spill</h2>

			<input
				type="text"
				placeholder="Spillkode (6 siffer)"
				value={gameCode}
				disabled={isCodeLocked}
				onChange={(e) => setGameCode(e.target.value)}
			/>

			{!isGameValid && <button onClick={handleValidateCode}>Finn Spill</button>}

			{isGameValid && (
				<>
					<input
						type="text"
						placeholder="Ditt navn"
						value={playerName}
						onChange={(e) => setPlayerName(e.target.value)}
					/>
					<button onClick={handleJoinGame}>Bli Med</button>
				</>
			)}

			{error && <p className="error-message">{error}</p>}
		</div>
	);
};

export default Register;
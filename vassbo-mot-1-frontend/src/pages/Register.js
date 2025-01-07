// src/pages/Register.js

import React, {useState, useContext} from 'react';
import {useNavigate} from 'react-router-dom';
import {GameContext} from '../context/GameContext';
import '../components/Register.css';
import {toast, ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
			/*setError('Spillkode kan ikke være tom.');*/
			toast.error('Spillkode kan ikke være tom.');
			return;
		}

		try {
			const isValid = await validateGameCode(gameCode);
			if (isValid) {
				/*setError('');*/
				toast.dismiss(); // Optionally dismiss all toasts
				setIsGameValid(true);
				setIsCodeLocked(true);
			} else {
				/*setError('Ugyldig spillkode.');*/
				toast.error('Ugyldig spillkode.');
			}
		} catch (err) {
			console.error('Error during game code validation:', err);
			/*setError('Feil ved validering av spillkode.');*/
			toast.error('Feil ved validering av spillkode.');
		}
	};

	const handleJoinGame = async () => {
		if (!gameCode.trim()) {
			/*setError('Spillkode kan ikke være tomt.');*/
			toast.error('Spillkode kan ikke være tomt.');
			return;
		}

		if (!playerName.trim()) {
			/*setError('Navn kan ikke være tomt.');*/
			toast.error('Navn kan ikke være tomt.');
			return;
		}

		try {
			const response = await joinGame(gameCode.trim(), playerName.trim());
			sessionStorage.setItem('playerName', playerName.trim()); // Set playerName in sessionStorage
			// Navigate directly to PlayerGameView
			navigate(`/game/${gameCode}`, {state: {gameCode, playerName: response.player.name}});
			/*setError('');*/
			toast.dismiss();
			/*setSuccessMessage('Bli med i spillet vellykket!');*/
			toast.success('Bli med i spillet vellykket!');
		} catch (err) {
			console.error('Error joining game:', err.response || err.message || err);
			/*const errorMessage = err.response?.data?.error || 'Feil ved å bli med i spillet.';*/
			const errorMessage = err.response?.data?.error || 'Feil ved å bli med i spillet.';
			/*setError(errorMessage);*/
			toast.error(errorMessage);
			/*setSuccessMessage('');*/
		}
	};

	return (
		<div className="register-container">
			<h2 className="register-title">Bli med i Spill</h2>

			<input
				type="text"
				placeholder="Spillkode (6 siffer)"
				value={gameCode}
				disabled={isCodeLocked}
				onChange={(e) => setGameCode(e.target.value)}
				className="register-input"
			/>

			{!isGameValid && (
				<button onClick={handleValidateCode} className="validate-button">
					Finn Spill
				</button>
			)}

			{isGameValid && (
				<>
					<input
						type="text"
						placeholder="Ditt navn"
						value={playerName}
						onChange={(e) => setPlayerName(e.target.value)}
						className="register-input"
					/>
					<button onClick={handleJoinGame} className="join-button">
						Bli Med
					</button>
				</>
			)}

			{/*{error && <p className="error-message">{error}</p>}*/}
			{/*{successMessage && <p className="success-message">{successMessage}</p>}*/}
			<ToastContainer closeButton={false} autoClose={3000}/>
		</div>
	);
};

export default Register;

// vassbo-mot-1-frontend/src/App.js

import React from 'react';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Register from './pages/Register';
import Game from './pages/Game';
import Leaderboard from './pages/Leaderboard';
import {GameProvider} from './context/GameContext';

const App = () => {
	return (
		<GameProvider>
			<Router>
				<Routes>
					<Route path="/" element={<Home/>}/>
					<Route path="/admin" element={<Admin/>}/>
					<Route path="/register" element={<Register/>}/>
					<Route path="/game/:gameCode" element={<Game/>}/>
					<Route path="/leaderboard/:gameCode" element={<Leaderboard/>}/>
				</Routes>
			</Router>
		</GameProvider>
	);
};

export default App;

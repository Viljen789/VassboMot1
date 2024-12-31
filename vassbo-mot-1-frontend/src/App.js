// src/App.js

import React from 'react';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Register from './pages/Register';
import Admin from './pages/Admin';
import AdminFlow from './pages/AdminFlow';
import Home from "./pages/Home";
import GuessingPhaseTest from "./pages/GuessingPhaseTest";
import PlayerViewTest from './pages/PlayerViewTest';
import PlayerGameView from "./pages/PlayerGameView";

function App() {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<Home/>}/>
				<Route path="/admin" element={<Admin/>}/>
				<Route path="/register" element={<Register/>}/>
				<Route path="/admin/flow/:gameCode" element={<AdminFlow/>}/>
				<Route path="/game/:gameCode" element={<PlayerGameView/>}/>
				{/* Remove the following route if GameFront is no longer needed */}
				{/* <Route path="/game" element={<GameFront/>}/> */}
				<Route path="/test/guessing-phase" element={<GuessingPhaseTest/>}/>
				<Route path="/test/player-view-test" element={<PlayerViewTest/>}/>
			</Routes>
		</Router>
	);
}

export default App;

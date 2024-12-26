// src/App.js

import React from 'react';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Register from './pages/Register';
import Admin from './pages/Admin';
import GameFront from './pages/GameFront';
import AdminFlow from './pages/AdminFlow';
import Home from "./pages/Home";

function App() {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<Home/>}/>
				<Route path="/admin" element={<Admin/>}/>
				<Route path="/register" element={<Register/>}/>
				<Route path="/admin/flow/:gameCode" element={<AdminFlow/>}/>
				<Route path="/game/:gameCode" element={<GameFront/>}/>
				<Route path="/game" element={<GameFront/>}/>
			</Routes>
		</Router>
	);
}

export default App;

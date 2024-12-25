// src/App.js
import React from 'react';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Register from './pages/Register';
import Admin from './pages/Admin';
import Game from './pages/Game';
import AdminFlow from './pages/AdminFlow';  // ny side
import Home from "./pages/Home";  // Sørg for at Home ligger i src/pages/Home.js

function App() {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<Home/>}/>
				<Route path="/admin" element={<Admin/>}/>
				<Route path="/register" element={<Register/>}/>
				<Route path="/admin/flow/:gameCode" element={<AdminFlow/>}/>
				<Route path="/game/:gameCode" element={<Game/>}/>
			</Routes>
		</Router>
	);
}

export default App;

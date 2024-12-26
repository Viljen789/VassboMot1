// src/pages/Home.js

import React from 'react';
import {Link} from 'react-router-dom';
import './Home.css';

const Home = () => {
	return (
		<div className="home-container">
			<h1>Velkommen til VassbøMot1</h1>
			<div className="button-group">
				<Link to="/admin">
					<button className="home-button">Admin</button>
				</Link>
				<Link to="/register">
					<button className="home-button">Spiller</button>
				</Link>
			</div>
		</div>
	);
};

export default Home;

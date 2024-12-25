// vassbo-mot-1-backend/utils/gameUtils.js

const generateGameCode = () => {
	return Math.floor(100000 + Math.random() * 900000).toString();
};

module.exports = {
	generateGameCode
};

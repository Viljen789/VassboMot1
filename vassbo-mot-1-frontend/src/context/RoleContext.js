// contexts/RoleContext.js
import React, {createContext, useState} from 'react';

export const RoleContext = createContext({
	role: 'guest',
	setRole: () => {
	}
});

export const RoleProvider = ({children}) => {
	const [role, setRole] = useState('guest');

	return (
		<RoleContext.Provider value={{role, setRole}}>
			{children}
		</RoleContext.Provider>
	);
};
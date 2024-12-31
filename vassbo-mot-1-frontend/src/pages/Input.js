// src/components/Input.js

import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const Input = ({label, type, value, onChange, placeholder, name}) => {
	// Split the label into individual characters for animation
	const labelLetters = label.split('');

	return (
		<StyledWrapper>
			<div className="form-control">
				<input
					type={type}
					required
					value={value}
					onChange={onChange}
					placeholder={placeholder}
					name={name}
				/>
				<label>
					{labelLetters.map((char, index) => (
						<span key={index} style={{transitionDelay: `${index * 50}ms`}}>
              {char}
            </span>
					))}
				</label>
			</div>
		</StyledWrapper>
	);
};

Input.propTypes = {
	label: PropTypes.string.isRequired,
	type: PropTypes.string,
	value: PropTypes.string.isRequired,
	onChange: PropTypes.func.isRequired,
	placeholder: PropTypes.string,
	name: PropTypes.string,
};

Input.defaultProps = {
	type: 'text',
	placeholder: '',
	name: '',
};

const StyledWrapper = styled.div`
    .form-control {
        position: relative;
        margin: 20px 0 40px;
        width: 100%;
    }

    .form-control input {
        background-color: transparent;
        border: 0;
        border-bottom: 2px #ccc solid;
        display: block;
        width: 100%;
        padding: 15px 0;
        font-size: 18px;
        color: #333;
        transition: border-bottom-color 0.3s ease;
    }

    .form-control input::placeholder {
        color: transparent;
    }

    .form-control input:focus,
    .form-control input:valid {
        outline: 0;
        border-bottom-color: var(--primary-color);
    }

    .form-control label {
        position: absolute;
        top: 15px;
        left: 0;
        pointer-events: none;
        display: flex;
    }

    .form-control label span {
        display: inline-block;
        font-size: 18px;
        min-width: 5px;
        color: #aaa;
        transition: 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }

    .form-control input:focus + label span,
    .form-control input:valid + label span {
        color: var(--primary-color);
        transform: translateY(-30px);
    }
`;

export default Input;

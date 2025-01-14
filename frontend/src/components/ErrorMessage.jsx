// ErrorMessage.jsx
import React from 'react';

const ErrorMessage = ({ message }) => {
    if (!message) return null;

    return (
        <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: 'red',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            zIndex: 1000,
        }}>
            {message}
        </div>
    );
};

export default ErrorMessage;

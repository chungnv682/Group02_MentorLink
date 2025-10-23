import React from 'react';
import { useTheme } from '../../../contexts';
import { Button } from 'react-bootstrap';
import '../../../styles/components/ThemeToggle.css';

const ThemeToggle = () => {
    const { isDarkMode, toggleTheme } = useTheme();

    return (
        <Button
            onClick={toggleTheme}
            variant={isDarkMode ? 'light' : 'dark'}
            size="sm"
            className="theme-toggle-btn"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            {isDarkMode ? (
                <i className="bi bi-sun-fill"></i>
            ) : (
                <i className="bi bi-moon-fill"></i>
            )}
            <span className="ms-2 d-none d-sm-inline">
                {isDarkMode ? 'Chế độ sáng' : 'Chế độ tối'}
            </span>
        </Button>
    );
};

export default ThemeToggle;
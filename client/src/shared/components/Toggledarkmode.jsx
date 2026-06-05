import React from 'react';
import { FaMoon, FaSun } from 'react-icons/fa';
import { useDarkMode } from './Darkmodecontext';

export default function DarkModeToggle() {
  const { darkMode, toggleDarkMode } = useDarkMode();

  const toggleStyle = {
    padding: '10px',
    borderRadius: '50%',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '44px',
    height: '44px',
    fontSize: '18px',
    backgroundColor: darkMode ? '#333' : '#f0f0f0',
    color: darkMode ? '#fff' : '#333',
    border: darkMode ? '1px solid #555' : '1px solid #ddd',
  };

  return (
    <button onClick={toggleDarkMode} style={toggleStyle} title={darkMode ? 'Light Mode' : 'Dark Mode'}>
      {darkMode ? <FaSun /> : <FaMoon />}
    </button>
  );
}

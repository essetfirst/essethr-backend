import React, { createContext, useState } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';

export const ThemeContext = createContext({} as any);

export const ThemeProvider = ({ children }: any) => {
    const [darkMode, setDarkMode] = useState(false);
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

    React.useEffect(() => {
        const isDarkMode = localStorage.getItem('theme');
        const isDarkModeBoolean = prefersDarkMode

        if (isDarkMode === 'dark') {
            setDarkMode(true);
        }

        if (isDarkMode === 'light') {
            setDarkMode(false);
        }

        if (isDarkMode === null) {
            setDarkMode(isDarkModeBoolean);
        }

    }, [prefersDarkMode]);

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        localStorage.setItem('theme', !darkMode ? 'dark' : 'light');
    }

    return (
        <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
            {children}
        </ThemeContext.Provider>
    );
};


export const useTheme = () => React.useContext(ThemeContext);

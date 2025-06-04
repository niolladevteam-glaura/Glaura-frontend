'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState('system');
    const [resolvedTheme, setResolvedTheme] = useState('light');

    useEffect(() => {
        // Set initial theme from localStorage or system preference
        const savedTheme = localStorage.getItem('theme');
        const initialTheme = savedTheme || 'system';
        setTheme(initialTheme);
        applyTheme(initialTheme);
    }, []);

    useEffect(() => {
        applyTheme(theme);
    }, [theme]);

    const applyTheme = (selectedTheme) => {
        let newResolvedTheme;

        if (selectedTheme === 'system') {
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            newResolvedTheme = systemPrefersDark ? 'dark' : 'light';
        } else {
            newResolvedTheme = selectedTheme;
        }

        // Update the DOM
        if (newResolvedTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        setResolvedTheme(newResolvedTheme);
        localStorage.setItem('theme', selectedTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
import React from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Laptop } from 'lucide-react';

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  const themes = [
    { name: 'light', icon: <Sun size={16} /> },
    { name: 'dark', icon: <Moon size={16} /> },
    { name: 'system', icon: <Laptop size={16} /> },
  ];

  return (
    <div className="theme-toggle-container">
      {themes.map((t) => (
        <button
          key={t.name}
          onClick={() => setTheme(t.name)}
          className={`theme-toggle-button ${theme === t.name ? 'active' : ''}`}
          aria-label={`Switch to ${t.name} theme`}
        >
          {t.icon}
        </button>
      ))}
    </div>
  );
};

export default ThemeToggle;
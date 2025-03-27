import { useState, useEffect } from 'react';
import styles from './ThemeToggle.module.css';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Set initial theme
    document.documentElement.classList.toggle('dark-mode', isDark);
    
    // Update theme when changed
    const updateTheme = (dark: boolean) => {
      document.documentElement.classList.toggle('dark-mode', dark);
      document.documentElement.classList.toggle('light-mode', !dark);
    };

    updateTheme(isDark);
  }, [isDark]);

  return (
    <button
      className={styles.toggle}
      onClick={() => setIsDark(!isDark)}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
}

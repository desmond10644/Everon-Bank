import { useState, useEffect } from "react";
import "./ThemeToggle.css";

const THEME_KEY = "theme";

export default function ThemeToggle() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const t = saved || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', t);
  }, []);

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(THEME_KEY, next);
  }

  return (
    <button aria-label={`Toggle theme, current ${theme}`} className="theme-toggle-ui" onClick={toggle}>
      {theme === 'dark' ? '🌙' : '☀️'}
    </button>
  );
}

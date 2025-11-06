import { useEffect, useState } from 'react';

const getInitialTheme = () => {
  const stored = localStorage.getItem('theme');
  if (stored === 'dark' || stored === 'light') return stored;
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
};

const applyTheme = (theme) => {
  if (theme === 'dark') {
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
  }
};

const ThemeToggle = () => {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    // keep in sync if OS preference changes and user hasn't explicitly chosen
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => {
      const stored = localStorage.getItem('theme');
      if (!stored) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, []);

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  const label = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
  const icon = theme === 'dark' ? '☀️' : '🌙';

  return (
    <div className="theme-toggle">
      <button type="button" aria-label={label} title={label} onClick={toggle}>
        {icon}
      </button>
    </div>
  );
};

export default ThemeToggle;



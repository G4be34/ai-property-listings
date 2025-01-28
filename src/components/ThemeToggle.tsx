import { useEffect, useState } from "react";
import { BsMoonStars } from "react-icons/bs";
import { IoSunnyOutline } from "react-icons/io5";

function ThemeToggle() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.body.setAttribute('data-theme', 'dark');
    } else {
      document.body.setAttribute('data-theme', 'light');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode ? 'dark' : 'light';
    setIsDarkMode(!isDarkMode);
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <div className="theme-toggle">
      <label className="switch">
        <input
          type="checkbox"
          checked={isDarkMode}
          onChange={toggleTheme}
        />
        <span className="slider">
          {isDarkMode ? <BsMoonStars className="slider-icon" /> : <IoSunnyOutline className="slider-icon" />}
        </span>
      </label>
    </div>
  );
};

export default ThemeToggle;
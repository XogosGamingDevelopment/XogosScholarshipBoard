import { useTheme } from '../contexts/ThemeContext';

function SettingsPage() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="settings-page">
      <h1>Settings</h1>

      <div className="settings-section">
        <h2>Appearance</h2>
        <div className="settings-card">
          <div className="setting-row">
            <div className="setting-info">
              <h3>Theme</h3>
              <p>Choose between dark and light mode for the dashboard.</p>
            </div>
            <div className="setting-control">
              <button
                className={`theme-option ${isDarkMode ? 'active' : ''}`}
                onClick={() => !isDarkMode && toggleTheme()}
              >
                🌙 Dark
              </button>
              <button
                className={`theme-option ${!isDarkMode ? 'active' : ''}`}
                onClick={() => isDarkMode && toggleTheme()}
              >
                ☀️ Light
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h2>About</h2>
        <div className="settings-card">
          <div className="setting-row">
            <div className="setting-info">
              <h3>Xogos Scholarship Board</h3>
              <p>Version 1.0.0</p>
              <p className="text-muted">
                A platform for managing scholarship distributions to Xogos students.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;

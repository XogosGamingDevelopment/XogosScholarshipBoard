import { NavLink } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

function Sidebar({ isOpen, onClose }) {
  const { isDarkMode, toggleTheme } = useTheme();

  const navItems = [
    { path: '/dashboard', label: 'Home', icon: '🏠' },
    { path: '/history', label: 'History', icon: '📜' },
    { path: '/students', label: 'Students', icon: '🎓' },
    { path: '/comments', label: 'Comments', icon: '💬' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}

      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <img src="/xogos-logo.png" alt="Xogos" className="sidebar-logo" />
          <h2>Scholarship Board</h2>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="theme-toggle" onClick={toggleTheme}>
            <span className="sidebar-icon">{isDarkMode ? '☀️' : '🌙'}</span>
            <span className="sidebar-label">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;

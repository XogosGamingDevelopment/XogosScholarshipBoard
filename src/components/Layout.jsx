import { useState } from 'react';
import Sidebar from './Sidebar';

function Layout({ children, boardMember, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="layout-main">
        <header className="layout-header">
          <button
            className="menu-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle menu"
          >
            ☰
          </button>

          <div className="header-spacer" />

          {boardMember && (
            <div className="header-user">
              {boardMember.img && (
                <img
                  src={boardMember.img}
                  alt={boardMember.firstname}
                  className="header-avatar"
                />
              )}
              <span className="header-name">
                {boardMember.firstname} {boardMember.lastname}
                {boardMember.is_admin && <span className="admin-badge">Admin</span>}
              </span>
              <button className="logout-btn" onClick={onLogout}>
                Logout
              </button>
            </div>
          )}
        </header>

        <main className="layout-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;

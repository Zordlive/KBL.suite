import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';
import logoKLB from '../../img/logoKLB.png';
import './NavBar.css';

const NavBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isAdmin = user?.roles?.some((role) => role.name === 'administrator');

  const navItems = [
    { name: 'Accueil', path: '/environment', icon: '🏠' },
    { name: 'Stock', path: '/stock-management', icon: '📦' },
    { name: 'Remise & Repris', path: '/remise-repris', icon: '💰' },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
    logout();
  };

  const handleNavigate = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const getUserRole = () => {
    if (user?.roles?.length > 0) {
      const role = user.roles[0].name;
      if (role === 'administrator') return '👑 Administrateur';
      if (role === 'super_agent') return '⭐ Super Agent';
      return '👤 Agent';
    }
    return '👤 Utilisateur';
  };

  return (
    <nav className="navbar-container">
      <div className="navbar-wrapper">
        {/* Logo Section */}
        <div className="navbar-logo-section">
          <div
            className="navbar-logo-click"
            onClick={() => handleNavigate('/environment')}
          >
            <img src={logoKLB} alt="KLB Logo" className="navbar-logo-img" />
            <div className="navbar-logo-text">
              <h1 className="navbar-brand-name">KLB.suite</h1>
              <p className="navbar-brand-subtitle">Gestion Intégrée</p>
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="navbar-nav-desktop">
          <div className="navbar-nav-items">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                className={`navbar-nav-item ${isActive(item.path) ? 'navbar-nav-item-active' : ''}`}
              >
                <span className="navbar-nav-icon">{item.icon}</span>
                <span className="navbar-nav-text">{item.name}</span>
                {isActive(item.path) && <div className="navbar-nav-indicator"></div>}
              </button>
            ))}
          </div>
        </div>

        {/* Right Section - User Profile & Actions */}
        <div className="navbar-right-section">
          {/* Desktop Profile */}
          <div className="navbar-profile-desktop">
            <div className="navbar-user-info">
              <div className="navbar-user-avatar">
                <svg className="navbar-user-icon" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
              <div className="navbar-user-details">
                <p className="navbar-user-name">{user?.name || 'Utilisateur'}</p>
                <p className="navbar-user-role">{getUserRole()}</p>
              </div>
            </div>
          </div>

          {/* Profile Dropdown */}
          <div className="navbar-profile-dropdown">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="navbar-profile-btn"
            >
              <div className="navbar-profile-avatar-btn">
                <svg className="navbar-profile-icon" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
              <svg
                className={`navbar-dropdown-arrow ${isProfileOpen ? 'navbar-dropdown-arrow-open' : ''}`}
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M7 10l5 5 5-5z" />
              </svg>
            </button>

            {isProfileOpen && (
              <div className="navbar-dropdown-menu">
                <div className="navbar-dropdown-header">
                  <p className="navbar-dropdown-username">{user?.name || 'Utilisateur'}</p>
                  <p className="navbar-dropdown-role">{getUserRole()}</p>
                </div>
                <div className="navbar-dropdown-divider"></div>

                {isAdmin && (
                  <>
                    <button
                      onClick={() => {
                        handleNavigate('/admin');
                        setIsProfileOpen(false);
                      }}
                      className="navbar-dropdown-item navbar-dropdown-admin"
                    >
                      <span className="navbar-dropdown-item-icon">⚙️</span>
                      <span>Panel Admin</span>
                    </button>
                    <div className="navbar-dropdown-divider"></div>
                  </>
                )}

                <button
                  onClick={handleLogout}
                  className="navbar-dropdown-item navbar-dropdown-logout"
                >
                  <span className="navbar-dropdown-item-icon">🚪</span>
                  <span>Déconnexion</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="navbar-mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg className="navbar-menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="navbar-mobile-menu">
          <div className="navbar-mobile-menu-items">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                className={`navbar-mobile-item ${isActive(item.path) ? 'navbar-mobile-item-active' : ''}`}
              >
                <span className="navbar-mobile-item-icon">{item.icon}</span>
                <span>{item.name}</span>
                {isActive(item.path) && <div className="navbar-mobile-indicator"></div>}
              </button>
            ))}

            {isAdmin && (
              <>
                <div className="navbar-mobile-divider"></div>
                <button
                  onClick={() => {
                    handleNavigate('/admin');
                    setIsMobileMenuOpen(false);
                  }}
                  className="navbar-mobile-item navbar-mobile-admin"
                >
                  <span className="navbar-mobile-item-icon">⚙️</span>
                  <span>Panel Admin</span>
                </button>
              </>
            )}

            <div className="navbar-mobile-divider"></div>
            <button
              onClick={handleLogout}
              className="navbar-mobile-item navbar-mobile-logout"
            >
              <span className="navbar-mobile-item-icon">🚪</span>
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;

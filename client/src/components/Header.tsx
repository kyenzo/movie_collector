import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    navigate('/');
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to={isAuthenticated ? "/movies" : "/"} className="logo">
          <h1>MovieCollector</h1>
        </Link>
        <nav className="nav">
          {isAuthenticated ? (
            <>
              <Link to="/movies" className="nav-link">Movies</Link>
              <Link to="/watchlist" className="nav-link">Watchlist</Link>
              <div className="user-menu" ref={dropdownRef}>
                <button 
                  className="user-button" 
                  onClick={toggleDropdown}
                  aria-expanded={isDropdownOpen}
                >
                  {user?.username}
                  <span className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}>
                    ▼
                  </span>
                </button>
                {isDropdownOpen && (
                  <div className="user-dropdown">
                    <div className="user-info">
                      <div className="username">{user?.username}</div>
                      <div className="email">{user?.email}</div>
                    </div>
                    <hr className="dropdown-divider" />
                    <button className="dropdown-item logout-button" onClick={handleLogout}>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </nav>
      </div>
    </header>
  );
};

export default Header;
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiLogOut, FiCreditCard, FiMessageSquare } from "react-icons/fi";
import NotificationBell from "./NotificationBell";
import { FaUserCircle, FaRobot } from "react-icons/fa";
import "./styles/header.css";

const Header = ({ toggleBot }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userString = localStorage.getItem("user");

    setIsLoggedIn(!!token);

    if (userString) {
      const user = JSON.parse(userString);
      setUserName(user.firstname || user.fullName || "User");
    }

    setDropdownOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    navigate("/");
  };

  const handleGetStarted = () => {
    if (isLoggedIn) {
      navigate("/wallet");
    } else {
      navigate("/auth");
    }
  };

  const isHome = location.pathname === "/";

  return (
    <header className="header">
      <div className="container header-inner">
        <div className="branding-text" onClick={() => navigate("/")}>
          <span className="logo-dot"></span>
          <h1>
            Merit <span>Swipe</span>
          </h1>
        </div>

        <nav className="nav-links">
          <Link to="/">Home</Link>
          {isLoggedIn && (
            <>
              <Link to="/search">Search</Link>
              <Link to="/my-deals">My Wallet</Link>
              <Link to="/transactions">Transactions</Link>
              <Link to="/recommendations">Card Recommendations</Link>
            </>
          )}
        </nav>

        <div className="header-right">
          {/* Replaced standard chat icon with Animated Robot Logo */}
          {isLoggedIn && (
            <>
              <button
                className="mbot-animated-btn"
                onClick={toggleBot}
                title="Ask MBot"
              >
                <div className="mbot-icon-wrapper">
                  <FaRobot size={20} className="robot-icon" />
                  <span className="mbot-pulse-ring"></span>
                </div>
              </button>
              <NotificationBell />
            </>
          )}

          {isHome || !isLoggedIn ? (
            <button
              className="get-started-btn"
              onClick={handleGetStarted}
            >
              {isLoggedIn ? "Dashboard" : "Get Started"}
            </button>
          ) : (
            <div className="profile-menu-container" ref={dropdownRef}>
              <button
                className="profile-icon-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <FaUserCircle size={28} />
              </button>

              {dropdownOpen && (
                <div className="profile-dropdown">
                  <div className="dropdown-header">
                    <p style={{ textTransform: 'none', fontSize: '0.85rem' }}>
                      Hello, <span style={{ color: '#fff' }}>{userName}</span>
                    </p>
                  </div>
                  <button onClick={() => navigate("/wallet")} className="dropdown-item">
                    <FiCreditCard /> My Wallet
                  </button>
                  <button onClick={handleLogout} className="dropdown-item logout">
                    <FiLogOut /> Log Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
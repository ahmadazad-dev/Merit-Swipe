import { Link, useNavigate } from "react-router-dom";
import "./styles/header.css";

const Header = () => {
  const navigate = useNavigate();

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
          <Link to="/search">Search</Link>
          <Link to="/wallet">My Wallet</Link>
        </nav>

        <div className="header-right">
          <button 
            className="get-started-btn" 
            onClick={() => navigate("/auth")}
          >
            Get Started
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
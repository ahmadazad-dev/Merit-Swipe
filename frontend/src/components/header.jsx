import "./styles/header.css";

const Header = () => {
  return (
    <header className="header">
      <div className="container">
        <nav className="nav">
          {/* Just the Branding */}
          <div className="branding-text">
            <h1>
              Merit <span>Swipe</span>
            </h1>
          </div>

          {/* Right side can be empty or have a simple 'Deals' text */}
          <div className="header-right">
            <span className="tagline">Home</span>
            <span className="tagline"> Search Deals</span>
            <span className="tagline"> My wallet</span>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;

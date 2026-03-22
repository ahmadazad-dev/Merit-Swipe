import { useState } from "react";
import dealsData from "../extras/data.json";
import "./styles/search.css";

const Searchbar = () => {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Offers");

  const categories = [
    "All Offers",
    "Dining",
    "Apparel",
    "Grocery",
    "Electronics",
  ];

  const filteredData = dealsData.filter((deal) => {
    const searchTerm = query.toLowerCase();
    const restaurantName = deal.targetEntityName?.toLowerCase() || "";
    const bankName = deal.sourceEntityName?.toLowerCase() || "";
    const cardNames =
      deal.associations?.map((a) => a.name.toLowerCase()).join(" ") || "";

    return (
      restaurantName.includes(searchTerm) ||
      bankName.includes(searchTerm) ||
      cardNames.includes(searchTerm)
    );
  });

  return (
    <div className="merit-swipe-container">
      <div className="hero-section">
        <h1>
          Discover <span className="highlight">Premium</span> Rewards
        </h1>
        <p className="subtitle">
          Search 500+ restaurants, stores, and services for exclusive card
          discounts.
        </p>

        <div className="search-wrapper">
          <input
            type="text"
            placeholder="Search by Restaurant (e.g., Kolachi) or Bank..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
        <div className="category-tabs">
          {categories.map((cat) => (
            <button
              key={cat}
              className={activeCategory === cat ? "active" : ""}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="deals-grid">
        {filteredData.length > 0 ? (
          filteredData.map((deal) => (
            <div key={deal.dealId} className="merit-card">
              <div className="card-image-wrapper">
                <img
                  src={deal.targetEntityLogo}
                  alt={deal.targetEntityName}
                  className="main-image"
                />
                <div className="discount-badge">
                  {deal.percentageValue}% OFF
                </div>
                <div className="category-tag">FINE DINING</div>
              </div>

              <div className="card-content">
                <h3>{deal.targetEntityName}</h3>
                <p className="description">{deal.title}</p>

                <div className="card-footer">
                  <div className="bank-info">
                    <img
                      src={deal.sourceEntityLogo}
                      alt="Bank"
                      className="mini-bank-logo"
                    />
                    <span className="card-type">
                      {deal.associations?.[0]?.name || "Standard Card"}
                    </span>
                  </div>
                  <span className="expiry">Valid Daily</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="no-results">No matches found for "{query}"</p>
        )}
      </div>
    </div>
  );
};

export default Searchbar;

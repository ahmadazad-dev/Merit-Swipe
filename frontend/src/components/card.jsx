import { useState } from "react";
import "./styles/card.css";

const Card = ({ restaurant, extractDiscount }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="merit-card">
      <div className="card-header" onClick={() => setIsOpen(!isOpen)}>
        <img
          src={restaurant.restaurant_url_logo}
          alt={restaurant.restaurant_name}
          className="main-image"
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
        <h3>{restaurant.restaurant_name}</h3>
        <span className="toggle-icon">{isOpen ? "▲" : "▼"}</span>
      </div>

      {isOpen && (
        <div className="card-deals-list">
          {restaurant.deals.map((deal, index) => {
            const discount = extractDiscount(deal.deal_title);
            return (
              <div key={index} className="deal-item">
                <div className="deal-header">
                  <p className="description">{deal.deal_title}</p>
                  {discount && (
                    <div className="discount-badge">{discount}% OFF</div>
                  )}
                </div>
                <div className="card-footer">
                  <div className="bank-info">
                    <span className="bank-dot" />
                    <span className="card-type">{deal.bank_name}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Card;
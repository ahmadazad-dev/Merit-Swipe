import { useState, useEffect } from "react";
import dealsService from "../../services/dealsService";
import "./styles/search.css";

const DISCOUNT_OPTIONS = ["Any Discount", "10%+", "20%+", "30%+", "40%+"];

const Searchbar = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [banks, setBanks] = useState([]);
  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDiscount, setSelectedDiscount] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [bankOpen, setBankOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [discountOpen, setDiscountOpen] = useState(false);

  useEffect(() => {
    dealsService.getFilters().then((res) => {
      setBanks(res.data.banks);
      setCategories(res.data.categories);
    });
  }, []);

  useEffect(() => {
    fetchDeals();
  }, [search, selectedBank, selectedCategory, page]);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = { page, limit: 20 };
      if (search) params.search = search;
      if (selectedBank) params.bank = selectedBank;
      if (selectedCategory) params.category = selectedCategory;

      const res = await dealsService.getDeals(params);
      setDeals(res.data.data);
      setTotalPages(res.data.pagination.totalPages);
      setTotal(res.data.pagination.total);
    } catch (err) {
      setError("Failed to load deals. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (val) => {
    setSearch(val);
    setPage(1);
  };

  const handleBank = (val) => {
    setSelectedBank(val === "All Banks" ? "" : val);
    setPage(1);
    setBankOpen(false);
  };

  const handleCategory = (val) => {
    setSelectedCategory(val === "All Categories" ? "" : val);
    setPage(1);
    setCategoryOpen(false);
  };

  const handleDiscount = (val) => {
    setSelectedDiscount(val === "Any Discount" ? "" : val);
    setDiscountOpen(false);
  };

  const clearAll = () => {
    setSearch("");
    setSelectedBank("");
    setSelectedCategory("");
    setSelectedDiscount("");
    setPage(1);
  };

  const closeAllDropdowns = () => {
    setBankOpen(false);
    setCategoryOpen(false);
    setDiscountOpen(false);
  };

  const hasFilters =
    search || selectedBank || selectedCategory || selectedDiscount;

  const extractDiscount = (title) => {
    const match = title?.match(/(\d+)%/);
    return match ? match[1] : null;
  };

  const visibleDeals = selectedDiscount
    ? deals.filter((deal) => {
        const pct = parseInt(extractDiscount(deal.deal_title) || "0");
        const min = parseInt(selectedDiscount);
        return pct >= min;
      })
    : deals;

  const buildPageNumbers = () => {
    const pages = [];
    const delta = 2;
    const left = Math.max(2, page - delta);
    const right = Math.min(totalPages - 1, page + delta);
    pages.push(1);
    if (left > 2) pages.push("...");
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages - 1) pages.push("...");
    if (totalPages > 1) pages.push(totalPages);
    return pages;
  };

  return (
    <div className="merit-swipe-container" onClick={closeAllDropdowns}>
      <div className="hero-section">
        <div className="hero-glow" />
        <div className="hero-inner">
          <p className="hero-eyebrow">Exclusive Card Deals</p>
          <h1>
            Find Your Best <span className="highlight">Discount</span>
          </h1>
          <p className="subtitle">
            Browse deals across restaurants, stores and services — filtered to
            your bank and card.
          </p>

          <div className="search-wrapper">
            <span className="search-icon-left">🔍</span>
            <input
              type="text"
              placeholder="Search restaurant, bank, or offer..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
            {search && (
              <button
                className="search-clear-btn"
                onClick={() => handleSearch("")}
              >
                ✕
              </button>
            )}
          </div>

          <div className="filters-row" onClick={(e) => e.stopPropagation()}>
            <div className="dropdown-wrap">
              <button
                className={`filter-btn ${selectedBank ? "filter-active" : ""}`}
                onClick={() => {
                  setBankOpen((o) => !o);
                  setCategoryOpen(false);
                  setDiscountOpen(false);
                }}
              >
                🏦 {selectedBank || "All Banks"}{" "}
                <span className="chevron">{bankOpen ? "▲" : "▼"}</span>
              </button>
              {bankOpen && (
                <div className="dropdown-menu">
                  <div
                    className="dropdown-option"
                    onClick={() => handleBank("All Banks")}
                  >
                    All Banks
                  </div>

                  {banks.map((b) => (
                    <div
                      key={b}
                      className={`dropdown-option ${selectedBank === b ? "selected" : ""}`}
                      onClick={() => handleBank(b)}
                    >
                      {b}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="dropdown-wrap">
              <button
                className={`filter-btn ${selectedCategory ? "filter-active" : ""}`}
                onClick={() => {
                  setCategoryOpen((o) => !o);
                  setBankOpen(false);
                  setDiscountOpen(false);
                }}
              >
                🏷 {selectedCategory || "All Categories"}{" "}
                <span className="chevron">{categoryOpen ? "▲" : "▼"}</span>
              </button>
              {categoryOpen && (
                <div className="dropdown-menu">
                  <div
                    className="dropdown-option"
                    onClick={() => handleCategory("All Categories")}
                  >
                    All Categories
                  </div>
                  {categories.map((c) => (
                    <div
                      key={c}
                      className={`dropdown-option ${selectedCategory === c ? "selected" : ""}`}
                      onClick={() => handleCategory(c)}
                    >
                      {c}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="dropdown-wrap">
              <button
                className={`filter-btn ${selectedDiscount ? "filter-active" : ""}`}
                onClick={() => {
                  setDiscountOpen((o) => !o);
                  setBankOpen(false);
                  setCategoryOpen(false);
                }}
              >
                🎯 {selectedDiscount || "Any Discount"}{" "}
                <span className="chevron">{discountOpen ? "▲" : "▼"}</span>
              </button>
              {discountOpen && (
                <div className="dropdown-menu">
                  {DISCOUNT_OPTIONS.map((d) => (
                    <div
                      key={d}
                      className={`dropdown-option ${(selectedDiscount || "Any Discount") === d ? "selected" : ""}`}
                      onClick={() => handleDiscount(d)}
                    >
                      {d}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {hasFilters && (
              <button className="clear-btn" onClick={clearAll}>
                Clear all
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="deals-body">
        {!loading && !error && (
          <div className="results-meta">
            <span>
              {total} deal{total !== 1 ? "s" : ""} found
            </span>
            {totalPages > 1 && (
              <span>
                Page {page} of {totalPages}
              </span>
            )}
          </div>
        )}

        {loading && (
          <div className="loading-state">
            <div className="spinner" />
            <p>Loading deals...</p>
          </div>
        )}

        {error && <p className="error-message">{error}</p>}

        {!loading && !error && visibleDeals.length === 0 && (
          <div className="empty-state">
            <p className="empty-icon">🔍</p>
            <h3>No deals found</h3>
            <p>Try adjusting your filters</p>
            <button className="empty-btn" onClick={clearAll}>
              Clear filters
            </button>
          </div>
        )}

        {!loading && !error && visibleDeals.length > 0 && (
          <div className="deals-grid">
            {visibleDeals.map((deal, index) => {
              const discount = extractDiscount(deal.deal_title);
              return (
                <div key={index} className="merit-card">
                  <div className="card-image-wrapper">
                    <img
                      src={deal.restaurant_url_logo}
                      alt={deal.restaurant_name}
                      className="main-image"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                    {discount && (
                      <div className="discount-badge">{discount}% OFF</div>
                    )}
                  </div>
                  <div className="card-content">
                    <h3>{deal.restaurant_name}</h3>
                    <p className="description">{deal.deal_title}</p>
                    <div className="card-footer">
                      <div className="bank-info">
                        <span className="bank-dot" />
                        <span className="card-type">{deal.bank_name}</span>
                      </div>
                      <span className="expiry">View Deal →</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="page-btn"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              ‹
            </button>
            {buildPageNumbers().map((p, i) =>
              p === "..." ? (
                <span key={`d${i}`} className="page-dots">
                  ···
                </span>
              ) : (
                <button
                  key={p}
                  className={`page-btn ${page === p ? "active" : ""}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ),
            )}
            <button
              className="page-btn"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              ›
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Searchbar;

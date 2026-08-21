import { useState, useEffect, useRef } from "react";
import dealsService from "../../services/dealsService";
import {
  FiSearch,
  FiX,
  FiChevronDown,
  FiChevronUp,
  FiTag,
  FiTarget,
  FiChevronLeft,
  FiChevronRight,
  FiPercent,
  FiSliders,
  FiGrid,
  FiList,
} from "react-icons/fi";
import { BsBank } from "react-icons/bs";
import { MdLocalOffer } from "react-icons/md";
import styles from "./styles/Searchbar.module.css";
import RestaurantCard from "./RestaurantCard";

const DISCOUNT_OPTIONS = ["Any Discount", "10%+", "20%+", "30%+", "40%+"];
const RESTAURANTS_PER_PAGE = 12;

const BACKEND_CLASSIFIED_CATEGORIES = [
  "Dining & Restaurants",
  "Clothing",
  "Health"
];

/* ─── Deal Row inside expanded restaurant card ─── */
const DealRow = ({ deal, extractDiscount }) => {
  const pct = extractDiscount(deal.deal_title);
  return (
    <div className={styles.dealRow}>
      <div className={styles.dealInfo}>
        <span className={styles.dealTitle}>{deal.deal_title}</span>
        {deal.deal_description && (
          <span className={styles.dealDesc}>{deal.deal_description}</span>
        )}
        <div className={styles.dealMeta}>
          <span className={styles.bankChip}>
            <BsBank size={10} />
            {deal.bank_name}
          </span>
          {deal.card_type && (
            <span className={styles.cardChip}>{deal.card_type}</span>
          )}
          {deal.expiry_date && (
            <span className={styles.expiryChip}>Until {deal.expiry_date}</span>
          )}
        </div>
      </div>
      {pct && (
        <div className={styles.pctBadge}>
          <span className={styles.pctNum}>{pct}</span>
          <span className={styles.pctSign}>%</span>
        </div>
      )}
    </div>
  );
};

/* ─── Dropdown ─── */
const Dropdown = ({ icon, label, value, options, onSelect, active }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className={styles.dropWrap} ref={ref}>
      <button
        className={`${styles.filterBtn} ${active ? styles.filterActive : ""}`}
        onClick={() => setOpen((o) => !o)}
      >
        {icon}
        <span>{value || label}</span>
        <span className={styles.chevronSmall}>
          {open ? <FiChevronUp size={13} /> : <FiChevronDown size={13} />}
        </span>
      </button>
      {open && (
        <div className={styles.dropMenu}>
          {options.map((opt) => (
            <button
              key={opt}
              className={`${styles.dropOpt} ${(value || label) === opt ? styles.dropOptActive : ""}`}
              onClick={() => {
                onSelect(opt);
                setOpen(false);
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── Main Component ─── */
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

  const [restaurantPage, setRestaurantPage] = useState(1);

  useEffect(() => {
    dealsService.getFilters().then((res) => {
      setBanks(res.data.banks);
      const fetchedCategories = res.data.categories || [];
      const combined = Array.from(new Set([...BACKEND_CLASSIFIED_CATEGORIES, ...fetchedCategories]));
      setCategories(combined);
    });
  }, []);

  useEffect(() => {
    fetchDeals();
  }, [search, selectedBank, selectedCategory, page]);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { page, limit: 100 };
      if (search) params.search = search;
      if (selectedBank) params.bank = selectedBank;
      if (selectedCategory) params.category = selectedCategory;
      const res = await dealsService.getDeals(params);
      setDeals(res.data.data);
      setTotalPages(res.data.pagination.totalPages);
      setTotal(res.data.pagination.total);
    } catch {
      setError("Failed to load deals. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (val) => {
    setSearch(val);
    setPage(1);
    setRestaurantPage(1);
  };
  const handleCategory = (val) => {
    setSelectedCategory(val === "All Categories" ? "" : val);
    setPage(1);
    setRestaurantPage(1);
  };
  const handleDiscount = (val) => {
    setSelectedDiscount(val === "Any Discount" ? "" : val);
    setRestaurantPage(1);
  };

  const clearAll = () => {
    setSearch("");
    setSelectedBank("");
    setSelectedCategory("");
    setSelectedDiscount("");
    setPage(1);
    setRestaurantPage(1);
  };

  const hasFilters =
    search || selectedBank || selectedCategory || selectedDiscount;

  const extractDiscount = (title) => {
    const match = title?.match(/(\d+)%/);
    return match ? match[1] : null;
  };

  const visibleDeals = selectedDiscount
    ? deals.filter(
      (d) =>
        parseInt(extractDiscount(d.deal_title) || "0") >=
        parseInt(selectedDiscount),
    )
    : deals;

  const groupedDeals = visibleDeals.reduce((acc, deal) => {
    if (!acc[deal.restaurant_name]) {
      acc[deal.restaurant_name] = {
        restaurant_name: deal.restaurant_name,
        restaurant_url_logo: deal.restaurant_url_logo,
        deals: [],
      };
    }
    acc[deal.restaurant_name].deals.push(deal);
    return acc;
  }, {});

  const allRestaurants = Object.values(groupedDeals);
  const totalRestaurantPages = Math.ceil(
    allRestaurants.length / RESTAURANTS_PER_PAGE,
  );
  const pagedRestaurants = allRestaurants.slice(
    (restaurantPage - 1) * RESTAURANTS_PER_PAGE,
    restaurantPage * RESTAURANTS_PER_PAGE,
  );

  const buildPages = (current, total) => {
    const pages = [];
    const delta = 2;
    const left = Math.max(2, current - delta);
    const right = Math.min(total - 1, current + delta);
    pages.push(1);
    if (left > 2) pages.push("...");
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < total - 1) pages.push("...");
    if (total > 1) pages.push(total);
    return pages;
  };

  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroNoise} />
        <div className={styles.heroInner}>
          <h1 className={styles.heroTitle}>
            <span className={styles.accent2}> Find Your Best</span>
            <span className={styles.accent}> Discount</span>
          </h1>
          <p className={styles.heroSub}>
            Browse deals across restaurants, stores and services — filtered to
            your bank and card.
          </p>

          {/* Search */}
          <div className={styles.searchBar}>
            <FiSearch className={styles.searchIcon} size={18} />
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Search restaurant, bank, or offer..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
            {search && (
              <button
                className={styles.searchClear}
                onClick={() => handleSearch("")}
              >
                <FiX size={14} />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className={styles.filtersRow}>
            <Dropdown
              icon={<FiTag size={13} />}
              label="All Categories"
              value={selectedCategory}
              options={["All Categories", ...categories]}
              onSelect={handleCategory}
              active={!!selectedCategory}
            />
            <Dropdown
              icon={<FiTarget size={13} />}
              label="Any Discount"
              value={selectedDiscount}
              options={DISCOUNT_OPTIONS}
              onSelect={handleDiscount}
              active={!!selectedDiscount}
            />
            {hasFilters && (
              <button className={styles.clearBtn} onClick={clearAll}>
                <FiX size={13} /> Clear all
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className={styles.body}>
        {/* Meta */}
        {!loading && !error && (
          <div className={styles.meta}>
            <span className={styles.metaCount}>
              <strong>{allRestaurants.length}</strong> restaurant
              {allRestaurants.length !== 1 ? "s" : ""} ·{" "}
              <strong>{total}</strong> deals
            </span>
            {totalRestaurantPages > 1 && (
              <span className={styles.metaPage}>
                Page {restaurantPage} of {totalRestaurantPages}
              </span>
            )}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className={styles.loadState}>
            <div className={styles.spinner} />
            <p>Loading deals…</p>
          </div>
        )}

        {/* Error */}
        {error && <p className={styles.errorMsg}>{error}</p>}

        {/* Empty */}
        {!loading && !error && allRestaurants.length === 0 && (
          <div className={styles.emptyState}>
            <FiSearch size={44} className={styles.emptyIcon} />
            <h3>No deals found</h3>
            <p>Try adjusting your search or filters</p>
            <button className={styles.emptyBtn} onClick={clearAll}>
              Clear filters
            </button>
          </div>
        )}

        {/* Cards Grid */}
        {!loading && !error && pagedRestaurants.length > 0 && (
          <div className={styles.grid}>
            {pagedRestaurants.map((r, i) => (
              <RestaurantCard
                key={i}
                restaurant={r}
                extractDiscount={extractDiscount}
              />
            ))}
          </div>
        )}

        {/* Restaurant Pagination */}
        {totalRestaurantPages > 1 && (
          <div className={styles.pagination}>
            <button
              className={styles.pageBtn}
              disabled={restaurantPage === 1}
              onClick={() => setRestaurantPage((p) => p - 1)}
            >
              <FiChevronLeft size={16} />
            </button>
            {buildPages(restaurantPage, totalRestaurantPages).map((p, i) =>
              p === "..." ? (
                <span key={`e${i}`} className={styles.pageDots}>
                  ···
                </span>
              ) : (
                <button
                  key={p}
                  className={`${styles.pageBtn} ${restaurantPage === p ? styles.pageBtnActive : ""}`}
                  onClick={() => setRestaurantPage(p)}
                >
                  {p}
                </button>
              ),
            )}
            <button
              className={styles.pageBtn}
              disabled={restaurantPage === totalRestaurantPages}
              onClick={() => setRestaurantPage((p) => p + 1)}
            >
              <FiChevronRight size={16} />
            </button>
          </div>
        )}

        {/* API Pagination */}
        {totalPages > 1 && (
          <div className={styles.apiPagination}>
            <span className={styles.apiPageLabel}>Load more results</span>
            <div className={styles.pagination}>
              <button
                className={styles.pageBtn}
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <FiChevronLeft size={16} />
              </button>
              {buildPages(page, totalPages).map((p, i) =>
                p === "..." ? (
                  <span key={`a${i}`} className={styles.pageDots}>
                    ···
                  </span>
                ) : (
                  <button
                    key={p}
                    className={`${styles.pageBtn} ${page === p ? styles.pageBtnActive : ""}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                ),
              )}
              <button
                className={styles.pageBtn}
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <FiChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Searchbar;
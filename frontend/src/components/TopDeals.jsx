import React, { useEffect, useState, memo } from "react";
import axios from "axios";
import styles from "./styles/TopDeals.module.css";

const truncate = (str, max = 80) => {
  if (!str) return null;
  return str.length > max ? str.slice(0, max).trimEnd() + "…" : str;
};

// Memoized to prevent re-rendering cards unnecessarily
const ImageWithFallback = memo(({ src, alt }) => {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div className={styles.logoFallback}>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
          <path d="M7 2v20" />
          <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
        </svg>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={styles.logoImage}
      onError={() => setError(true)}
      loading="lazy"
    />
  );
});

const MainDiscountDisplay = memo(({ deal }) => {
  if (deal.discount_type === "percentage" && deal.percentage_value) {
    return (
      <div className={styles.discountValueWrapper}>
        <span className={styles.valueNumber}>
          {parseFloat(deal.percentage_value).toFixed(0)}
          <span className={styles.valueSymbol}>%</span>
        </span>
        <span className={styles.valueText}>OFF</span>
      </div>
    );
  }
  if (deal.discount_type === "flat" && deal.flat_value) {
    return (
      <div className={styles.discountValueWrapper}>
        <span className={styles.valueCurrency}>PKR</span>
        <span className={styles.valueNumber}>
          {parseFloat(deal.flat_value).toLocaleString()}
        </span>
        <span className={styles.valueText}>OFF</span>
      </div>
    );
  }
  return (
    <div className={styles.discountValueWrapper}>
      <span className={styles.valueNumber} style={{ fontSize: "2.5rem" }}>
        SPECIAL
      </span>
      <span className={styles.valueText}>DEAL</span>
    </div>
  );
});

const ExpiryIndicator = memo(({ endDate }) => {
  const now = new Date();
  const end = new Date(endDate);
  const daysLeft = Math.ceil((end - now) / (1000 * 60 * 60 * 24));

  if (end < now)
    return (
      <span className={`${styles.badge} ${styles.badgeExpired}`}>Expired</span>
    );
  if (daysLeft <= 3)
    return (
      <span className={`${styles.badge} ${styles.badgeUrgent}`}>
        ⏳ {daysLeft === 0 ? "Ends Today" : `${daysLeft} Days Left`}
      </span>
    );
  return (
    <span className={`${styles.badge} ${styles.badgeActive}`}>
      {daysLeft} Days Left
    </span>
  );
});

const DealCard = memo(({ deal, index }) => (
  <div
    className={`${styles.card} ${deal.is_featured ? styles.cardFeatured : ""}`}
    style={{ animationDelay: `${index * 50}ms` }} // Reduced delay slightly for snappier load
  >
    <div className={styles.rankWatermark}>
      {String(index + 1).padStart(2, "0")}
    </div>

    <div className={styles.cardInner}>
      <div className={styles.cardHeader}>
        <div className={styles.logoContainer}>
          <ImageWithFallback src={deal.url_logo} alt={deal.title} />
        </div>
        <div className={styles.headerBadges}>
          {deal.is_featured && (
            <span className={`${styles.badge} ${styles.badgeFeatured}`}>
              ★ Featured
            </span>
          )}
          <ExpiryIndicator endDate={deal.end_date} />
        </div>
      </div>

      <div className={styles.cardBody}>
        <MainDiscountDisplay deal={deal} />
        <div className={styles.textContent}>
          <h3 className={styles.title} title={deal.title}>
            {deal.title}
          </h3>
          <p className={styles.description}>{truncate(deal.description)}</p>
        </div>
      </div>

      <div className={styles.cardFooter}>
        <div className={styles.validityGroup}>
          {deal.valid_outlet && <span className={styles.tag}>Outlet</span>}
          {deal.valid_delivery && <span className={styles.tag}>Delivery</span>}
          {deal.valid_takeaway && <span className={styles.tag}>Takeaway</span>}
        </div>
        {deal.cap_amount && (
          <div className={styles.capAmount}>
            Cap: <span>PKR {parseFloat(deal.cap_amount).toLocaleString()}</span>
          </div>
        )}
      </div>
    </div>
    <div className={styles.hoverGlow}></div>
  </div>
));

const SkeletonCard = memo(({ index }) => (
  <div
    className={`${styles.card} ${styles.skeleton}`}
    style={{ animationDelay: `${index * 40}ms` }}
  >
    <div className={styles.cardInner}>
      <div className={styles.cardHeader}>
        <div className={styles.skCircle}></div>
        <div className={styles.skPill}></div>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.skTitleHuge}></div>
        <div className={styles.skTextLine} style={{ width: "80%" }}></div>
        <div className={styles.skTextLine} style={{ width: "60%" }}></div>
      </div>
      <div className={styles.cardFooter}>
        <div style={{ display: "flex", gap: "8px" }}>
          <div className={styles.skPillSmall}></div>
          <div className={styles.skPillSmall}></div>
        </div>
      </div>
    </div>
  </div>
));

export default function TopDeals() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    axios
      .get("http://localhost:5000/api/deals/top", { signal: controller.signal })
      .then((res) => {
        const fetchedDeals = (res.data.data || res.data).slice(0, 10);
        setDeals(fetchedDeals);
        setLoading(false);
      })
      .catch((err) => {
        if (!axios.isCancel(err)) {
          setError("Failed to load exclusive deals. Please refresh.");
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, []);

  return (
    <section className={styles.section}>
      {/* Highly Optimized Noise Layer */}
      <div className={styles.bgNoise}></div>
      <div className={styles.bgGradientLayer}></div>

      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <div className={styles.titleWrapper}>
            <h2 className={styles.mainHeading}>
              Trending <span className={styles.gradientText}>Offers</span>
            </h2>
            <p className={styles.subHeading}>
              Discover the top 10 handpicked deals to maximize your savings
              across our partner network today.
            </p>
          </div>
        </div>

        {error && (
          <div className={styles.errorMessage}>
            <span>⚠️</span> {error}
          </div>
        )}

        {!loading && !error && deals.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>✦</div>
            <h3>No active deals found</h3>
            <p>Check back later for new exclusive offers.</p>
          </div>
        )}

        <div className={styles.grid}>
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} index={i} />
              ))
            : deals.map((deal, i) => (
                <DealCard key={deal.id} deal={deal} index={i} />
              ))}
        </div>
      </div>
    </section>
  );
}

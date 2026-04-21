import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./styles/TopDeals.module.css";

const truncate = (str, max = 72) => {
    if (!str) return null;
    return str.length > max ? str.slice(0, max).trimEnd() + "…" : str;
};

const DiscountBadge = ({ deal }) => {
    if (deal.discount_type === "percentage" && deal.percentage_value) {
        return (
            <div className={styles.discountStamp}>
                <span className={styles.discountValue}>
                    {parseFloat(deal.percentage_value).toFixed(0)}%
                </span>
                <span className={styles.discountLabel}>OFF</span>
            </div>
        );
    }
    if (deal.discount_type === "flat" && deal.flat_value) {
        return (
            <div className={`${styles.discountStamp} ${styles.discountFlat}`}>
                <span className={styles.discountValue}>
                    PKR {parseFloat(deal.flat_value).toLocaleString()}
                </span>
                <span className={styles.discountLabel}>OFF</span>
            </div>
        );
    }
    return (
        <div className={`${styles.discountStamp} ${styles.discountSpecial}`}>
            <span className={styles.discountValue}>SPECIAL</span>
            <span className={styles.discountLabel}>DEAL</span>
        </div>
    );
};

const ExpiryChip = ({ endDate }) => {
    const now = new Date();
    const end = new Date(endDate);
    const daysLeft = Math.ceil((end - now) / (1000 * 60 * 60 * 24));

    if (end < now)
        return <span className={`${styles.chip} ${styles.chipDead}`}>Expired</span>;
    if (daysLeft <= 3)
        return (
            <span className={`${styles.chip} ${styles.chipUrgent}`}>
                ⚡ {daysLeft === 0 ? "Today" : `${daysLeft}d left`}
            </span>
        );
    return (
        <span className={`${styles.chip} ${styles.chipActive}`}>
            {daysLeft}d left
        </span>
    );
};

const ValidityRow = ({ deal }) => (
    <div className={styles.validity}>
        {deal.valid_outlet && <span className={styles.validTag}>Outlet</span>}
        {deal.valid_delivery && <span className={styles.validTag}>Delivery</span>}
        {deal.valid_takeaway && <span className={styles.validTag}>Takeaway</span>}
    </div>
);

const DealCard = ({ deal, index }) => (
    <div
        className={`${styles.card} ${deal.is_featured ? styles.cardFeatured : ""}`}
        style={{ animationDelay: `${index * 65}ms` }}
    >
        <div className={styles.cardHeader}>
            <div className={styles.rankBubble}>
                {String(index + 1).padStart(2, "0")}
            </div>
            <div className={styles.headerRight}>
                {deal.is_featured && (
                    <span className={styles.featuredTag}>★ Featured</span>
                )}
                <ExpiryChip endDate={deal.end_date} />
            </div>
        </div>

        <div className={styles.cardCenter}>
            <DiscountBadge deal={deal} />
        </div>

        <div className={styles.cardContent}>
            <h3 className={styles.dealTitle}>{deal.title}</h3>
            {deal.description && (
                <p className={styles.dealDesc}>{truncate(deal.description)}</p>
            )}
        </div>

        <div className={styles.cardFooter}>
            <ValidityRow deal={deal} />
            {deal.cap_amount && (
                <span className={styles.cap}>
                    Cap: PKR {parseFloat(deal.cap_amount).toLocaleString()}
                </span>
            )}
        </div>

        <div className={styles.cardShine} />
    </div>
);

const SkeletonCard = ({ index }) => (
    <div
        className={`${styles.card} ${styles.skeletonCard}`}
        style={{ animationDelay: `${index * 50}ms` }}
    >
        <div className={styles.cardHeader}>
            <div
                className={styles.skBlock}
                style={{ width: 36, height: 36, borderRadius: "50%" }}
            />
            <div
                className={styles.skBlock}
                style={{ width: 60, height: 22, borderRadius: 20 }}
            />
        </div>
        <div className={styles.cardCenter}>
            <div
                className={styles.skBlock}
                style={{ width: 90, height: 70, borderRadius: 12 }}
            />
        </div>
        <div className={styles.cardContent}>
            <div
                className={styles.skBlock}
                style={{ width: "75%", height: 18, marginBottom: 10 }}
            />
            <div
                className={styles.skBlock}
                style={{ width: "95%", height: 13, marginBottom: 6 }}
            />
            <div className={styles.skBlock} style={{ width: "60%", height: 13 }} />
        </div>
        <div className={styles.cardFooter}>
            <div style={{ display: "flex", gap: 6 }}>
                <div
                    className={styles.skBlock}
                    style={{ width: 52, height: 22, borderRadius: 20 }}
                />
                <div
                    className={styles.skBlock}
                    style={{ width: 64, height: 22, borderRadius: 20 }}
                />
            </div>
        </div>
    </div>
);

export default function TopDeals() {
    const [deals, setDeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const controller = new AbortController();
        axios
            .get("http://localhost:5000/api/deals/top", { signal: controller.signal })
            .then((res) => {
                setDeals(res.data.data || res.data);
                setLoading(false);
            })
            .catch((err) => {
                if (!axios.isCancel(err)) {
                    setError("Failed to load deals. Please try again.");
                    setLoading(false);
                }
            });
        return () => controller.abort();
    }, []);

    return (
        <section className={styles.section}>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <span className={styles.eyebrow}>
                        <span className={styles.eyebrowDot} />
                        EXCLUSIVE OFFERS
                    </span>
                    <h2 className={styles.heading}>
                        Top <span className={styles.accent}>10</span> Deals
                    </h2>
                    <p className={styles.subheading}>
                        Handpicked rewards to maximize every swipe.
                    </p>
                </div>
                <div className={styles.orbWrap}>
                    <div className={styles.orb} />
                    <div className={styles.orbInner} />
                </div>
            </div>

            {error && (
                <div className={styles.errorBox}>
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {error}
                </div>
            )}

            {!loading && !error && deals.length === 0 && (
                <div className={styles.empty}>No active deals at the moment.</div>
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
        </section>
    );
}
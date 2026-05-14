import { useState, useEffect, useCallback, useRef } from "react";
import { BsBank } from "react-icons/bs";
import { MdLocalOffer } from "react-icons/md";
import {
  FiX,
  FiPercent,
  FiCreditCard,
  FiCalendar,
  FiChevronRight,
  FiTag,
} from "react-icons/fi";
import styles from "./styles/RestaurantCard.module.css";

/* ─── helpers ─── */
const extractDiscount = (title) => {
  const m = title?.match(/(\d+)%/);
  return m ? m[1] : null;
};

const topDiscount = (deals) =>
  deals.reduce((max, d) => {
    const p = parseInt(extractDiscount(d.deal_title) || "0");
    return p > max ? p : max;
  }, 0);

const uniqueBanks = (deals) => [
  ...new Set(deals.map((d) => d.bank_name).filter(Boolean)),
];

/* ─── Deal Item inside modal ─── */
const DealItem = ({ deal, index }) => {
  const pct = extractDiscount(deal.deal_title);

  return (
    <div className={styles.dealItem} style={{ "--i": index }}>
      <div className={styles.dealItemLeft}>
        {pct && (
          <div className={styles.dealPctRing}>
            <span className={styles.dealPctVal}>{pct}</span>
            <span className={styles.dealPctSymbol}>%</span>
          </div>
        )}
        <div className={styles.dealItemBody}>
          <p className={styles.dealItemTitle}>{deal.deal_title}</p>
          {deal.deal_description && (
            <p className={styles.dealItemDesc}>{deal.deal_description}</p>
          )}
          <div className={styles.dealItemChips}>
            {deal.bank_name && (
              <span className={styles.chip}>
                <BsBank size={9} /> {deal.bank_name}
              </span>
            )}
            {deal.card_type && (
              <span className={`${styles.chip} ${styles.chipCard}`}>
                <FiCreditCard size={9} /> {deal.card_type}
              </span>
            )}
            {deal.expiry_date && (
              <span className={`${styles.chip} ${styles.chipExpiry}`}>
                <FiCalendar size={9} /> Until {deal.expiry_date}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Modal ─── */
const DealsModal = ({ restaurant, onClose }) => {
  const overlayRef = useRef(null);
  const banks = uniqueBanks(restaurant.deals);
  const top = topDiscount(restaurant.deals);

  // close on Escape
  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const handleOverlayClick = useCallback(
    (e) => {
      if (e.target === overlayRef.current) onClose();
    },
    [onClose],
  );

  return (
    <div
      className={styles.overlay}
      ref={overlayRef}
      onClick={handleOverlayClick}
    >
      <div className={styles.modal}>
        {/* Modal Header */}
        <div className={styles.modalHeader}>
          <div className={styles.modalHeroGlow} />

          <div className={styles.modalHeaderTop}>
            <div className={styles.modalLogoWrap}>
              {restaurant.restaurant_url_logo ? (
                <img
                  src={restaurant.restaurant_url_logo}
                  alt={restaurant.restaurant_name}
                  className={styles.modalLogo}
                />
              ) : (
                <div className={styles.modalLogoFallback}>
                  {restaurant.restaurant_name?.charAt(0)?.toUpperCase()}
                </div>
              )}
            </div>

            <div className={styles.modalHeaderInfo}>
              <h2 className={styles.modalRestName}>
                {restaurant.restaurant_name}
              </h2>
              <div className={styles.modalBankList}>
                {banks.slice(0, 4).map((b) => (
                  <span key={b} className={styles.modalBankChip}>
                    <BsBank size={9} /> {b}
                  </span>
                ))}
                {banks.length > 4 && (
                  <span className={styles.modalBankMore}>
                    +{banks.length - 4} more
                  </span>
                )}
              </div>
            </div>

            <button className={styles.closeBtn} onClick={onClose}>
              <FiX size={18} />
            </button>
          </div>

          {/* Stats bar */}
          <div className={styles.modalStats}>
            <div className={styles.statPill}>
              <MdLocalOffer size={13} />
              <span>
                <strong>{restaurant.deals.length}</strong> deals available
              </span>
            </div>
            {top > 0 && (
              <div className={`${styles.statPill} ${styles.statPillAccent}`}>
                <FiPercent size={12} />
                <span>
                  Up to <strong>{top}%</strong> off
                </span>
              </div>
            )}
            <div className={styles.statPill}>
              <BsBank size={12} />
              <span>
                <strong>{banks.length}</strong> bank
                {banks.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Deals List */}
        <div className={styles.modalBody}>
          <p className={styles.dealsSectionLabel}>
            <FiTag size={11} /> All Deals
          </p>
          <div className={styles.dealsList}>
            {restaurant.deals.map((deal, i) => (
              <DealItem key={i} deal={deal} index={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Restaurant Card ─── */
const RestaurantCard = ({ restaurant }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const { restaurant_name, restaurant_url_logo, deals } = restaurant;
  const banks = uniqueBanks(deals);
  const top = topDiscount(deals);

  return (
    <>
      <div
        className={styles.card}
        onClick={() => setModalOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && setModalOpen(true)}
      >
        {/* Glow blob */}
        <div className={styles.cardGlow} />

        {/* Logo */}
        <div className={styles.cardLogoArea}>
          <div className={styles.cardLogoWrap}>
            {restaurant_url_logo ? (
              <img
                src={restaurant_url_logo}
                alt={restaurant_name}
                className={styles.cardLogo}
              />
            ) : (
              <div className={styles.cardLogoFallback}>
                {restaurant_name?.charAt(0)?.toUpperCase()}
              </div>
            )}
          </div>
          {top > 0 && (
            <div className={styles.cardTopBadge}>
              <span className={styles.cardTopNum}>{top}</span>
              <span className={styles.cardTopPct}>%</span>
              <span className={styles.cardTopOff}>OFF</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className={styles.cardInfo}>
          <h3 className={styles.cardName}>{restaurant_name}</h3>

          <div className={styles.cardBanks}>
            {banks.slice(0, 3).map((b) => (
              <span key={b} className={styles.cardBankChip}>
                {b}
              </span>
            ))}
            {banks.length > 3 && (
              <span className={styles.cardBankMore}>+{banks.length - 3}</span>
            )}
          </div>

          <div className={styles.cardFooter}>
            <span className={styles.cardDealsCount}>
              <MdLocalOffer size={12} />
              {deals.length} deal{deals.length !== 1 ? "s" : ""}
            </span>
            <span className={styles.cardCta}>
              View deals <FiChevronRight size={13} />
            </span>
          </div>
        </div>
      </div>

      {modalOpen && (
        <DealsModal
          restaurant={restaurant}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
};

export default RestaurantCard;

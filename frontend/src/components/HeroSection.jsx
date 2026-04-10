import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./styles/HeroSection.module.css";

export default function HeroSection() {
  const navigate = useNavigate();

  useEffect(() => {
    const animateCount = (el, target, prefix = "", suffix = "") => {
      let start = null;
      const duration = 1800;
      const step = (ts) => {
        if (!start) start = ts;
        const progress = Math.min((ts - start) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        el.textContent = prefix + Math.floor(ease * target) + suffix;
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const statsRow = document.querySelector(`.${styles.statsRow}`);
    let observed = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !observed) {
          observed = true;
          const nums = document.querySelectorAll(`.${styles.statNumber}`);
          if (nums[0]) animateCount(nums[0], 48, "", "K+");
          if (nums[1]) animateCount(nums[1], 12, "$", "M");
          if (nums[2]) animateCount(nums[2], 200, "", "+");
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    if (statsRow) observer.observe(statsRow);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section className={styles.hero}>
      <div className={styles.bgGradient}></div>
      <div className={styles.bgNoise}></div>
      <div className={styles.gridLines}></div>
      <div className={styles.arc}></div>
      <div className={styles.topBar}></div>

      <div className={styles.cardScene}>
        <div className={`${styles.card} ${styles.cardLight} ${styles.card1}`}>
          <div className={styles.cardInner}>
            <div className={styles.cardTop}>
              <div className={styles.chip}></div>
              <span className={styles.cardBrand}>Merit</span>
            </div>
            <div className={styles.cardNumber}>•••• •••• •••• 4291</div>
            <div className={styles.cardFooter}>
              <div className={styles.cardHolder}>Alex Morgan</div>
              <div className={styles.cardWaves}></div>
            </div>
          </div>
        </div>

        <div className={`${styles.card} ${styles.cardDark} ${styles.card2}`}>
          <div className={styles.cardInner}>
            <div className={styles.cardTop}>
              <div className={styles.chip}></div>
              <span className={styles.cardBrand}>Merit</span>
            </div>
            <div className={styles.cardNumber}>•••• •••• •••• 8834</div>
            <div className={styles.cardFooter}>
              <div className={styles.cardHolder}>Sam Rivera</div>
              <div className={styles.cardWaves}></div>
            </div>
          </div>
        </div>

        <div className={`${styles.card} ${styles.cardGold} ${styles.card3}`}>
          <div className={styles.cardInner}>
            <div className={styles.cardTop}>
              <div className={styles.chip}></div>
              <span className={`${styles.cardBrand} ${styles.cardBrandGold}`}>
                Gold
              </span>
            </div>
            <div className={styles.cardNumber}>•••• •••• •••• 7701</div>
            <div className={styles.cardFooter}>
              <div className={styles.cardHolder}>J. Chen</div>
              <div className={styles.cardWaves}></div>
            </div>
          </div>
        </div>

        <div className={`${styles.card} ${styles.cardDark} ${styles.card4}`}>
          <div className={styles.cardInner}>
            <div className={styles.cardTop}>
              <div className={styles.chip}></div>
              <span className={styles.cardBrand}>Merit+</span>
            </div>
            <div className={styles.cardNumber}>•••• •••• •••• 3357</div>
            <div className={styles.cardFooter}>
              <div className={styles.cardHolder}>R. Patel</div>
              <div className={styles.cardWaves}></div>
            </div>
          </div>
        </div>

        <div className={`${styles.card} ${styles.cardLight} ${styles.card5}`}>
          <div className={`${styles.cardInner} ${styles.cardInnerSm}`}>
            <div className={`${styles.chip} ${styles.chipSm}`}></div>
          </div>
        </div>
      </div>

      <div className={`${styles.badge} ${styles.badge1}`}>
        <div className={styles.badgeInner}>
          <div className={`${styles.badgeIcon} ${styles.badgeIconOrange}`}>
            🎁
          </div>
          <span>5× cashback active</span>
        </div>
      </div>
      <div className={`${styles.badge} ${styles.badge2}`}>
        <div className={styles.badgeInner}>
          <div className={`${styles.badgeIcon} ${styles.badgeIconGold}`}>✦</div>
          <span>2,840 pts earned today</span>
        </div>
      </div>
      <div className={`${styles.badge} ${styles.badge3}`}>
        <div className={styles.badgeInner}>
          <div className={`${styles.badgeIcon} ${styles.badgeIconGreen}`}>
            ↑
          </div>
          <span className={styles.badgeTextGreen}>Savings up 34%</span>
        </div>
      </div>

      <div className={styles.heroContent}>
        <div className={styles.eyebrow}>
          <span className={styles.eyebrowDot}></span>
          Smart Rewards Platform
        </div>
        <h1 className={styles.heroTitle}>
          <span className={styles.titleAccent}>Merit</span> Swipe
        </h1>
        <p className={styles.heroTagline}>Your wallet, maximized.</p>
        <p className={styles.heroDescription}>
          Unlock exclusive rewards and maximize your savings. The ultimate
          platform for managing credit card discounts and discovering premium
          offers tailored just for you.
        </p>
        <div className={styles.ctaGroup}>
          <button
            className={styles.btnPrimary}
            onClick={() => navigate("/search")}
          >
            Get Started Free
            <span className={styles.btnArrow}>→</span>
          </button>
          <a href="#" className={styles.btnGhost}>
            See how it works
          </a>
        </div>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statItem}>
          <div className={styles.statNumber}>
            48<span>K+</span>
          </div>
          <div className={styles.statLabel}>Active Users</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statNumber}>
            $<span>12M</span>
          </div>
          <div className={styles.statLabel}>Rewards Unlocked</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statNumber}>
            200<span>+</span>
          </div>
          <div className={styles.statLabel}>Partner Brands</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statNumber}>
            4.9<span>★</span>
          </div>
          <div className={styles.statLabel}>App Rating</div>
        </div>
      </div>

      <div className={styles.scrollHint}>
        <span className={styles.scrollText}>Scroll</span>
        <div className={styles.scrollPill}>
          <div className={styles.scrollDot}></div>
        </div>
      </div>
    </section>
  );
}
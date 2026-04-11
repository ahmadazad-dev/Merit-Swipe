import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./styles/HeroSection.module.css";
import Contact from "./contact";

export default function HeroSection() {
  const navigate = useNavigate();
  const contactRef = useRef(null);

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

  const scrollToContact = () => {
    contactRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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
            </div>
          </div>
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
          <button className={styles.btnPrimary} onClick={() => navigate("/search")}>
            Get Started Free <span className={styles.btnArrow}>→</span>
          </button>
          <button
            className={styles.btnGhost}
            onClick={() => navigate("/about")}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
          >
            See how it works
          </button>
        </div>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statItem}>
          <div className={styles.statNumber}>0</div>
          <div className={styles.statLabel}>Active Users</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statNumber}>0</div>
          <div className={styles.statLabel}>Rewards Unlocked</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statNumber}>0</div>
          <div className={styles.statLabel}>Partner Brands</div>
        </div>
      </div>

      <div
        className={styles.scrollHint}
        onClick={scrollToContact}
        style={{ cursor: "pointer" }}
      >
        <span className={styles.scrollText}>Contact</span>
        <div className={styles.scrollPill}>
          <div className={styles.scrollDot}></div>
        </div>
      </div>

      <div ref={contactRef} style={{ marginTop: '150px', width: '100%', position: 'relative', zIndex: '10' }}>
        <Contact />
      </div>
    </section>
  );
}
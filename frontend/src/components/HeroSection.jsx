import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaRobot, FaMicrophone } from "react-icons/fa";
import { FiCreditCard, FiZap } from "react-icons/fi";
import styles from "./styles/HeroSection.module.css";
import TopDeals from "./TopDeals";
import Contact from "./contact";
import About from "./about";

// Accept toggleBot as a prop
export default function HeroSection({ toggleBot }) {
  const navigate = useNavigate();
  const statsRowRef = useRef(null);
  const numRefs = useRef([]);

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

    let observed = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !observed) {
          observed = true;
          if (numRefs.current[0])
            animateCount(numRefs.current[0], 48, "", "K+");
          if (numRefs.current[1])
            animateCount(numRefs.current[1], 12, "$", "M");
          if (numRefs.current[2])
            animateCount(numRefs.current[2], 200, "", "+");
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );

    if (statsRowRef.current) observer.observe(statsRowRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <main className={styles.pageWrapper}>
      {/* HERO SECTION ONLY */}
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
            <div className={`${styles.badgeIcon} ${styles.badgeIconGold}`}>
              ✦
            </div>
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
            <button
              className={styles.btnGhost}
              onClick={() => navigate("/about")}
            >
              See how it works
            </button>
          </div>
        </div>

        <div className={styles.statsRow} ref={statsRowRef}>
          <div className={styles.statItem}>
            <div
              className={styles.statNumber}
              ref={(el) => (numRefs.current[0] = el)}
            >
              48<span>K+</span>
            </div>
            <div className={styles.statLabel}>Active Users</div>
          </div>
          <div className={styles.statItem}>
            <div
              className={styles.statNumber}
              ref={(el) => (numRefs.current[2] = el)}
            >
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
      </section>

      {/* ─── NEW: Premium MBot Promotional Banner ─── */}
      <section className={styles.mbotPromoSection}>
        {/* Subtle background glow for the section */}
        <div className={styles.mbotBgGlow}></div>

        <div className={styles.mbotPromoContainer}>
          <div className={styles.mbotPromoContent}>
            <div className={styles.eyebrow}>
              <div className={styles.eyebrowDot}></div>
              AI Assistant
            </div>

            <h2 className={styles.mbotPromoTitle}>
              Meet <span className={styles.titleAccent}>MBot</span>. Your AI <br /> Deal Assistant.
            </h2>

            <p className={styles.mbotPromoDesc}>
              Tired of scrolling? Just ask. Use your voice or type to instantly uncover hidden card discounts, manage your wallet, and optimize your spending in real-time.
            </p>

            <div className={styles.mbotFeatureList}>
              <span className={styles.mbotFeature}><FaMicrophone className={styles.mbotIconAccent} /> Voice Enabled</span>
              <span className={styles.mbotFeature}><FiCreditCard className={styles.mbotIconAccent} /> Auto-Wallet Sync</span>
              <span className={styles.mbotFeature}><FaRobot className={styles.mbotIconAccent} /> Context Aware</span>
            </div>

            {/* Update the onClick handler to navigate */}
            <button className={styles.btnPrimary} onClick={() => navigate("/chat")}>
              <FaRobot size={18} style={{ marginRight: '8px' }} /> Chat with MBot
              <span className={styles.btnArrow}>→</span>
            </button>
          </div>

          <div className={styles.mbotPromoVisual}>
            <div className={styles.mbotHologram}>
              <div className={styles.mbotHologramAvatar}>
                <FaRobot size={64} color="var(--ms-white)" />
              </div>
              <div className={`${styles.hologramRing} ${styles.ring1}`}></div>
              <div className={`${styles.hologramRing} ${styles.ring2}`}></div>
              <div className={styles.hologramBase}></div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTIONS MOVED OUTSIDE OF THE HERO */}
      <TopDeals />
      <section className={styles.aboutSection} id="about">
        <About />
      </section>
      <section className={styles.contactSection} id="contact">
        <Contact />
      </section>
    </main>
  );
}
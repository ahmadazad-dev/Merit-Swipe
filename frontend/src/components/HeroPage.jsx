import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./styles/HeroPage.module.css";

export default function HeroPage() {
  const cursorRef = useRef(null);
  const ringRef = useRef(null);
  const mx = useRef(0);
  const my = useRef(0);
  const rx = useRef(0);
  const ry = useRef(0);
  const navigate = useNavigate();

  useEffect(() => {
    const cursor = cursorRef.current;
    const ring = ringRef.current;

    const onMouseMove = (e) => {
      mx.current = e.clientX;
      my.current = e.clientY;
      cursor.style.left = e.clientX + "px";
      cursor.style.top = e.clientY + "px";
    };
    document.addEventListener("mousemove", onMouseMove);

    let animId;
    const loop = () => {
      rx.current += (mx.current - rx.current) * 0.12;
      ry.current += (my.current - ry.current) * 0.12;
      ring.style.left = rx.current + "px";
      ring.style.top = ry.current + "px";
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);

    const hoverEls = document.querySelectorAll("a, button");
    const onEnter = () => {
      cursor.style.width = "20px";
      cursor.style.height = "20px";
      ring.style.width = "52px";
      ring.style.height = "52px";
      ring.style.opacity = "0.3";
    };
    const onLeave = () => {
      cursor.style.width = "12px";
      cursor.style.height = "12px";
      ring.style.width = "38px";
      ring.style.height = "38px";
      ring.style.opacity = "0.5";
    };
    hoverEls.forEach((el) => {
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
    });

    // Parallax cards
    const cards = document.querySelectorAll(`.${styles.card}`);
    const onMove = (e) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = (e.clientX - cx) / cx;
      const dy = (e.clientY - cy) / cy;
      cards.forEach((card, i) => {
        const factor = i % 2 === 0 ? 1 : -1;
        const shift = (i + 1) * 3;
        card.style.marginLeft = `${dx * shift * factor}px`;
        card.style.marginTop = `${dy * shift * factor}px`;
      });
    };
    document.addEventListener("mousemove", onMove);

    // Stats counter
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
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(animId);
      hoverEls.forEach((el) => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
      });
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <div className={styles.cursor} ref={cursorRef}></div>
      <div className={styles.cursorRing} ref={ringRef}></div>

      <section className={styles.hero}>
        {/* Background layers */}
        <div className={styles.bgGradient}></div>
        <div className={styles.bgNoise}></div>
        <div className={styles.gridLines}></div>
        <div className={styles.arc}></div>
        <div className={styles.topBar}></div>

        {/* Orbit rings */}
        <div className={`${styles.orbitRing} ${styles.orbitRing1}`}></div>
        <div className={`${styles.orbitRing} ${styles.orbitRing2}`}></div>
        <div className={`${styles.orbitRing} ${styles.orbitRing3}`}></div>

        {/* Navigation */}
        <nav className={styles.nav}>
          <a href="#" className={styles.navLogo}>
            <span className={styles.logoDot}></span>
            Merit<span style={{ color: "var(--ms-pumpkin)" }}>Swipe</span>
          </a>
          <ul className={styles.navLinks}>
            <li>
              <a href="#">Features</a>
            </li>
            <li>
              <a href="#">Rewards</a>
            </li>
            <li>
              <a href="#">Pricing</a>
            </li>
            <li>
              <a href="#">About</a>
            </li>
          </ul>
          <a href="#" className={styles.navCta}>
            Get Started
          </a>
        </nav>

        {/* Floating Cards */}
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

        {/* Floating Badges */}
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

        {/* Hero Content */}
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

        {/* Stats */}
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

        {/* Scroll hint */}
        <div className={styles.scrollHint}>
          <span className={styles.scrollText}>Scroll</span>
          <div className={styles.scrollPill}>
            <div className={styles.scrollDot}></div>
          </div>
        </div>
      </section>
    </>
  );
}

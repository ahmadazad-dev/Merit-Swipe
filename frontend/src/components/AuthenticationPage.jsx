import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Login from "./Login";
import SignUp from "./SignUp";
import styles from "./styles/AuthenticationPage.module.css";

function Logo({ onClick }) {
  return (
    <button
      className={styles.logo}
      onClick={onClick}
      style={{ background: "none", border: "none", cursor: "pointer" }}
    >
      <span className={styles.logoDot} />
      <span className={styles.logoText}>
        Merit <span>Swipe</span>
      </span>
    </button>
  );
}

export default function AuthenticationPage() {
  const [view, setView] = useState("login");
  const [animClass, setAnimClass] = useState(styles.viewEnter);
  const navigate = useNavigate();
  const isTransitioning = useRef(false);
  const switchView = useCallback((nextView, direction = "forward") => {
    if (isTransitioning.current) return;
    isTransitioning.current = true;

    setAnimClass(styles.viewExit);

    setTimeout(() => {
      setView(nextView);
      setAnimClass(
        direction === "forward" ? styles.viewEnter : styles.viewEnterReverse,
      );
      isTransitioning.current = false;
    }, 260);
  }, []);

  const goToSignUp = useCallback(
    () => switchView("signup", "forward"),
    [switchView],
  );
  const goToLogin = useCallback(
    () => switchView("login", "back"),
    [switchView],
  );

  const handleLogoClick = () => navigate("/");

  return (
    <div className={styles.page}>
      <div className={styles.dotGrid} aria-hidden="true" />

      <div className={styles.inner}>
        <Logo onClick={handleLogoClick} />
        <div className={styles.slideWrapper}>
          <div className={animClass}>
            {view === "login" ? (
              <Login onSwitchToSignUp={goToSignUp} />
            ) : (
              <SignUp onSwitchToLogin={goToLogin} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

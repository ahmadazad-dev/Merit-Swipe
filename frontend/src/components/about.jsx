import { FiCreditCard, FiTrendingUp, FiShield } from "react-icons/fi";
import styles from "./styles/about.module.css";

export default function About() {
    return (
        <div className={styles.page}>
            <div className={styles.container}>

                <section className={styles.hero}>
                    <h1>About <span>Merit Swipe</span></h1>
                    <p>
                        We believe that every swipe of your card should bring you value.
                        Merit Swipe is your ultimate companion for discovering, tracking, and maximizing
                        the discounts hidden inside your wallet.
                    </p>
                </section>

                <section className={styles.missionSection}>
                    <div className={styles.missionContent}>
                        <h2>Our Mission</h2>
                        <p>
                            Navigating bank discounts can be overwhelming. Between rotating categories,
                            flash sales, and specific restaurant tie-ups, millions of rupees in savings
                            go unclaimed every year.
                        </p>
                        <p>
                            Merit Swipe bridges the gap between your bank cards and your favorite lifestyle brands.
                            We track the deals so you don't have to, ensuring you never pay full price when a
                            discount is sitting right in your pocket.
                        </p>
                    </div>
                </section>

                <section className={styles.featuresGrid}>
                    <div className={styles.featureCard}>
                        <div className={styles.iconWrapper}>
                            <FiCreditCard className={styles.icon} />
                        </div>
                        <h3>Smart Wallet</h3>
                        <p>Add your cards once, and we will instantly filter thousands of deals to show you exactly what you are eligible for.</p>
                    </div>

                    <div className={styles.featureCard}>
                        <div className={styles.iconWrapper}>
                            <FiTrendingUp className={styles.icon} />
                        </div>
                        <h3>Maximize Savings</h3>
                        <p>From dining to shopping, we calculate the best possible card to use at checkout to ensure maximum cash retention.</p>
                    </div>

                    <div className={styles.featureCard}>
                        <div className={styles.iconWrapper}>
                            <FiShield className={styles.icon} />
                        </div>
                        <h3>Secure & Private</h3>
                        <p>We only ask for your card tier and network—never your sensitive card numbers. Your financial privacy is our top priority.</p>
                    </div>
                </section>

            </div>
        </div>
    );
}
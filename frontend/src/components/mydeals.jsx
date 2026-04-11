import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiTag, FiAlertCircle } from "react-icons/fi";
import styles from "./styles/mydeals.module.css";

export default function MyDeals() {
    const navigate = useNavigate();
    const [deals, setDeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user] = useState(() => {
        const userString = localStorage.getItem("user");
        return userString ? JSON.parse(userString) : null;
    });

    useEffect(() => {
        if (!user) {
            navigate("/auth");
            return;
        }

        const fetchMyDeals = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/deals/my-wallet/${user.id}`);
                const data = await response.json();
                setDeals(data);
            } catch (err) {
                console.error("Error fetching deals:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchMyDeals();
    }, [user?.id, navigate]);

    const formatDiscount = (deal) => {
        if (deal.discount_type === 'PERCENTAGE') return `${deal.percentage_value}% OFF`;
        if (deal.discount_type === 'FLAT') return `Rs. ${deal.flat_value} OFF`;
        if (deal.discount_type === 'BOGO') return 'Buy 1 Get 1 Free';
        return 'Special Offer';
    };

    if (loading) {
        return <div className={styles.loading}>Finding your deals...</div>;
    }

    return (
        <div className={styles.page}>
            <div className={styles.container}>

                <div className={styles.header}>
                    <h2>Just For You</h2>
                    <p>Exclusive deals unlocked by the cards in your wallet.</p>
                </div>

                {deals.length === 0 ? (
                    <div className={styles.emptyState}>
                        <FiAlertCircle size={48} />
                        <h3>No deals found right now</h3>
                        <p>Try adding more cards to your wallet to unlock discounts!</p>
                        <button onClick={() => navigate("/wallet")} className={styles.walletBtn}>
                            Go to My Wallet
                        </button>
                    </div>
                ) : (
                    <div className={styles.grid}>
                        {deals.map((deal) => (
                            <div key={deal.id} className={styles.dealCard}>
                                <div className={styles.dealTop}>
                                    {deal.restaurant_logo ? (
                                        <img src={deal.restaurant_logo} alt={deal.restaurant_name} className={styles.logo} />
                                    ) : (
                                        <div className={styles.logoPlaceholder}>{deal.restaurant_name.charAt(0)}</div>
                                    )}
                                    <span className={styles.discountBadge}>
                                        {formatDiscount(deal)}
                                    </span>
                                </div>

                                <div className={styles.dealBody}>
                                    <h3 className={styles.restaurantName}>{deal.restaurant_name}</h3>
                                    <p className={styles.dealTitle}>{deal.title}</p>
                                </div>

                                <div className={styles.dealFooter}>
                                    <div className={styles.bankTag}>
                                        <FiTag /> {deal.bank_name}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
}
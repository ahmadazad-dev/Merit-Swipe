import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiAlertCircle } from "react-icons/fi";
import styles from "./styles/mydeals.module.css";
// Adjust this path if RestaurantCard is located in a different folder!
import RestaurantCard from "./RestaurantCard";

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

    // Helper function to pull the percentage out of the title for the discount badge
    const extractDiscount = (title) => {
        const match = title?.match(/(\d+)%/);
        return match ? match[1] : null;
    };

    // Group the raw database deals by restaurant so the RestaurantCard can read them
    const groupedDeals = deals.reduce((acc, deal) => {
        if (!acc[deal.restaurant_name]) {
            acc[deal.restaurant_name] = {
                restaurant_name: deal.restaurant_name,
                restaurant_url_logo: deal.restaurant_logo, // Map database column to expected prop
                deals: [],
            };
        }

        // Map the columns from the 'my-wallet' API endpoint to match what the card expects
        acc[deal.restaurant_name].deals.push({
            ...deal,
            deal_title: deal.title,       // Rename title to deal_title
            expiry_date: deal.end_date    // Rename end_date to expiry_date
        });

        return acc;
    }, {});

    // Convert the grouped object back into a standard array
    const groupedRestaurants = Object.values(groupedDeals);

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

                {groupedRestaurants.length === 0 ? (
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
                        {/* Map through the grouped restaurants and render the shared component */}
                        {groupedRestaurants.map((restaurant, index) => (
                            <RestaurantCard
                                key={index}
                                restaurant={restaurant}
                                extractDiscount={extractDiscount}
                            />
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
}
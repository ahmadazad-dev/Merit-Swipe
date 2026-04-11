import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { FaCcVisa, FaCcMastercard, FaCcAmex, FaCreditCard } from "react-icons/fa";
import styles from "./styles/wallet.module.css";

export default function Wallet() {
    const navigate = useNavigate();
    const [allCards, setAllCards] = useState([]);
    const [myCards, setMyCards] = useState([]);
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

        const fetchData = async () => {
            try {
                setLoading(true);
                const allRes = await fetch("http://localhost:5000/api/cards");
                const allData = await allRes.json();

                const myRes = await fetch(`http://localhost:5000/api/wallet/${user.id}`);
                const myData = await myRes.json();

                setAllCards(allData);
                setMyCards(myData);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user?.id, navigate]);

    const handleAddCard = async (card) => {
        try {
            await fetch("http://localhost:5000/api/wallet", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user.id, cardId: card.id })
            });
            setMyCards([...myCards, card]);
        } catch (err) {
            console.error(err);
        }
    };

    const handleRemoveCard = async (cardId) => {
        try {
            await fetch("http://localhost:5000/api/wallet", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user.id, cardId })
            });
            setMyCards(myCards.filter(c => c.id !== cardId));
        } catch (err) {
            console.error(err);
        }
    };

    const getCardIcon = (network) => {
        if (!network) return <FaCreditCard className={styles.cardIcon} />;
        const net = network.toLowerCase();
        if (net.includes("visa")) return <FaCcVisa className={styles.cardIcon} />;
        if (net.includes("mastercard")) return <FaCcMastercard className={styles.cardIcon} />;
        if (net.includes("amex") || net.includes("american express")) return <FaCcAmex className={styles.cardIcon} />;
        return <FaCreditCard className={styles.cardIcon} />;
    };

    const availableCards = allCards.filter(ac => !myCards.some(mc => mc.id === ac.id));

    if (loading) {
        return <div className={styles.loading}>Loading your wallet...</div>;
    }

    return (
        <div className={styles.page}>
            <div className={styles.container}>

                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2>My Wallet</h2>
                        <p>Cards you are using to track discounts.</p>
                    </div>

                    {myCards.length === 0 ? (
                        <div className={styles.emptyState}>
                            <FaCreditCard size={40} />
                            <p>Your wallet is empty. Add a card from below to get started!</p>
                        </div>
                    ) : (
                        <div className={styles.grid}>
                            {myCards.map((card) => (
                                <div key={`my-${card.id}`} className={`${styles.card} ${styles.myCard}`}>
                                    <div className={styles.cardLeft}>
                                        {/* LOGO UPDATE HERE */}
                                        {card.url_logo ? (
                                            <img src={card.url_logo} alt={card.name} className={styles.cardLogo} />
                                        ) : (
                                            getCardIcon(card.card_network)
                                        )}
                                        <div className={styles.cardDetails}>
                                            <h3>{card.name}</h3>
                                            <div className={styles.cardMeta}>
                                                {card.card_type && <span className={styles.badge}>{card.card_type}</span>}
                                                {card.card_tier && <span className={styles.badgeTier}>{card.card_tier}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        className={styles.removeBtn}
                                        onClick={() => handleRemoveCard(card.id)}
                                    >
                                        <FiTrash2 />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <div className={styles.divider}></div>

                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2>Available Cards</h2>
                        <p>Select cards to add them to your wallet.</p>
                    </div>

                    <div className={styles.grid}>
                        {availableCards.map((card) => (
                            <div key={`avail-${card.id}`} className={`${styles.card} ${styles.availableCard}`}>
                                <div className={styles.cardLeft}>
                                    {/* LOGO UPDATE HERE */}
                                    {card.url_logo ? (
                                        <img src={card.url_logo} alt={card.name} className={styles.cardLogo} />
                                    ) : (
                                        getCardIcon(card.card_network)
                                    )}
                                    <div className={styles.cardDetails}>
                                        <h3>{card.name}</h3>
                                        <div className={styles.cardMeta}>
                                            {card.card_type && <span className={styles.badge}>{card.card_type}</span>}
                                            {card.card_tier && <span className={styles.badgeTier}>{card.card_tier}</span>}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    className={styles.addBtn}
                                    onClick={() => handleAddCard(card)}
                                >
                                    <FiPlus /> Add
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

            </div>
        </div>
    );
}
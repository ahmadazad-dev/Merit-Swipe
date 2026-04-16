import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiTrash2, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { FaCcVisa, FaCcMastercard, FaCcAmex, FaCreditCard } from "react-icons/fa";
import styles from "./styles/wallet.module.css";

export default function Wallet() {
    const navigate = useNavigate();
    const [allCards, setAllCards] = useState([]);
    const [myCards, setMyCards] = useState([]);
    const [loading, setLoading] = useState(true);

    // Track which bank accordion is open (null = none open)
    const [expandedBank, setExpandedBank] = useState(null);

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

    const toggleBankExpand = (bankName) => {
        setExpandedBank(expandedBank === bankName ? null : bankName);
    };

    // Filter out cards already in the wallet
    const availableCards = allCards.filter(ac => !myCards.some(mc => mc.id === ac.id));

    // Group the available cards by Bank Name
    const groupedAvailableCards = availableCards.reduce((groups, card) => {
        const bank = card.bank_name || 'Other Banks';
        if (!groups[bank]) {
            groups[bank] = [];
        }
        groups[bank].push(card);
        return groups;
    }, {});

    if (loading) {
        return <div className={styles.loading}>Loading your wallet...</div>;
    }

    return (
        <div className={styles.page}>
            <div className={styles.container}>

                {/* MY WALLET SECTION */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2>My Wallet</h2>
                        <p>Cards you are using to track discounts.</p>
                    </div>

                    {myCards.length === 0 ? (
                        <div className={styles.emptyState}>
                            <FaCreditCard size={40} className={styles.emptyIcon} />
                            <p>Your wallet is empty. Add a card from below to get started!</p>
                        </div>
                    ) : (
                        <div className={styles.grid}>
                            {myCards.map((card) => (
                                <div key={`my-${card.id}`} className={`${styles.card} ${styles.myCard}`}>
                                    <div className={styles.cardLeft}>
                                        {card.url_logo ? (
                                            <img src={card.url_logo} alt={card.name} className={styles.cardLogo} />
                                        ) : (
                                            getCardIcon(card.card_network)
                                        )}
                                        <div className={styles.cardDetails}>
                                            <h3>{card.name}</h3>
                                        </div>
                                    </div>
                                    <button
                                        className={styles.removeBtn}
                                        onClick={() => handleRemoveCard(card.id)}
                                        title="Remove Card"
                                    >
                                        <FiTrash2 />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <div className={styles.divider}></div>

                {/* AVAILABLE CARDS ACCORDION SECTION */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2>Available Cards</h2>
                        <p>Select cards to add them to your wallet.</p>
                    </div>

                    <div className={styles.accordionContainer}>
                        {Object.keys(groupedAvailableCards).map((bankName, index) => {
                            const isExpanded = expandedBank === bankName;
                            // Optionally auto-expand the very first bank if none is clicked yet
                            // const isExpanded = expandedBank === null && index === 0 ? true : expandedBank === bankName;

                            return (
                                <div key={bankName} className={`${styles.bankAccordion} ${isExpanded ? styles.expanded : ''}`}>

                                    {/* Bank Header (Clickable) */}
                                    <div
                                        className={styles.accordionHeader}
                                        onClick={() => toggleBankExpand(bankName)}
                                    >
                                        <div className={styles.headerLeft}>
                                            {/* Generic bank building icon or dot */}
                                            <span className={styles.orangeDot}></span>
                                            <h3 className={styles.bankName}>{bankName}</h3>
                                            <span className={styles.cardCount}>
                                                ({groupedAvailableCards[bankName].length})
                                            </span>
                                        </div>
                                        <div className={styles.headerRight}>
                                            {isExpanded ? (
                                                <FiChevronUp className={styles.chevronIcon} />
                                            ) : (
                                                <FiChevronDown className={styles.chevronIcon} />
                                            )}
                                        </div>
                                    </div>

                                    {/* Expanded Cards Grid */}
                                    {isExpanded && (
                                        <div className={styles.accordionContent}>
                                            <div className={styles.grid}>
                                                {groupedAvailableCards[bankName].map((card) => (
                                                    <div key={`avail-${card.id}`} className={`${styles.card} ${styles.availableCard}`}>
                                                        <div className={styles.cardLeft}>
                                                            {card.url_logo ? (
                                                                <img src={card.url_logo} alt={card.name} className={styles.cardLogo} />
                                                            ) : (
                                                                getCardIcon(card.card_network)
                                                            )}
                                                            <div className={styles.cardDetails}>
                                                                <h3>{card.name}</h3>
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
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>

            </div>
        </div>
    );
}
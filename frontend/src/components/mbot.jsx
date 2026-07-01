import React, { useState, useRef, useEffect } from "react";
import { FiX } from "react-icons/fi"; // Added close icon
import styles from "./styles/mbot.module.css";

const MBot = ({ onClose }) => {
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "Hi! I'm MBot, your Merit-Swipe assistant. Ask me about card discounts, managing your wallet, or optimizing your expenses!",
            sender: "bot",
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = {
            id: Date.now(),
            text: input.trim(),
            sender: "user",
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch("http://localhost:8080/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMessage.text }),
            });

            // FIX: Explicitly check for HTTP errors (like 500 or 404)
            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }

            const data = await response.json();

            // FIX: Fallback just in case data.reply is empty
            const botReply = data.reply || data.response || "Sorry, I received an empty response.";

            setMessages((prev) => [
                ...prev,
                { id: Date.now() + 1, text: botReply, sender: "bot" },
            ]);
        } catch (error) {
            console.error("Chatbot API Error:", error);
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now() + 1,
                    text: "Sorry, I'm having trouble connecting to the server. Please check the backend terminal for errors.",
                    sender: "bot",
                    isError: true,
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.chatContainer}>
            <div className={styles.chatHeader}>
                <div className={styles.headerLeft}>
                    <div className={styles.avatarContainer}>
                        <div className={styles.avatar}>M</div>
                        <span className={styles.onlineStatus}></span>
                    </div>
                    <div>
                        <h3 className={styles.botName}>MBot</h3>
                        <p className={styles.botSubtitle}>Merit-Swipe Smart Agent</p>
                    </div>
                </div>

                {/* ADDED: Close Button */}
                <button className={styles.closeButton} onClick={onClose} aria-label="Close chat">
                    <FiX size={20} />
                </button>
            </div>

            <div className={styles.messageArea}>
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`${styles.messageWrapper} ${msg.sender === "user" ? styles.userWrapper : styles.botWrapper
                            }`}
                    >
                        <div
                            className={`${styles.messageBubble} ${msg.sender === "user" ? styles.userBubble : styles.botBubble
                                } ${msg.isError ? styles.errorBubble : ""}`}
                        >
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className={`${styles.messageWrapper} ${styles.botWrapper}`}>
                        <div className={`${styles.messageBubble} ${styles.botBubble}`}>
                            <div className={styles.typingIndicator}>
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className={styles.inputArea}>
                <input
                    type="text"
                    className={styles.inputField}
                    placeholder="Ask about deals, banks, or adding cards..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    className={styles.sendButton}
                    disabled={!input.trim() || isLoading}
                >
                    Send
                </button>
            </form>
        </div>
    );
};

export default MBot;
import React, { useState, useRef, useEffect } from "react";
import { FiVolume2, FiVolumeX, FiSend, FiUser, FiZap, FiCreditCard, FiCompass, FiBell, FiPaperclip, FiX } from "react-icons/fi";
import { FaMicrophone, FaMicrophoneSlash, FaRobot, FaMagic } from "react-icons/fa";
import styles from "./styles/mbot.module.css";

const QUICK_ACTIONS = [
    { text: "Top Deals Today", icon: <FiZap size={18} style={{ marginRight: "10px", color: "#fd802e" }} /> },
    { text: "Analyze My Wallet", icon: <FiCreditCard size={18} style={{ marginRight: "10px", color: "#fd802e" }} /> },
    { text: "Best Travel Cards", icon: <FiCompass size={18} style={{ marginRight: "10px", color: "#fd802e" }} /> },
    { text: "Unread Alerts", icon: <FiBell size={18} style={{ marginRight: "10px", color: "#fd802e" }} /> }
];

const MBot = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    const messagesEndRef = useRef(null);
    const recognitionRef = useRef(null);
    const fileInputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = "en-US";

            recognitionRef.current.onresult = (event) => {
                let currentTranscript = "";
                let isFinal = false;
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    currentTranscript += event.results[i][0].transcript;
                    if (event.results[i].isFinal) isFinal = true;
                }
                setInput(currentTranscript);

                if (isFinal) handleInteraction(currentTranscript, true);
            };

            recognitionRef.current.onerror = () => setIsListening(false);
            recognitionRef.current.onend = () => setIsListening(false);
        }
        return () => { if (window.speechSynthesis) window.speechSynthesis.cancel(); };
    }, []);

    const toggleListening = () => {
        if (!recognitionRef.current) return alert("Speech recognition unsupported.");
        if (isListening) {
            recognitionRef.current.stop();
        } else {
            if (window.speechSynthesis) window.speechSynthesis.cancel();
            setInput("");
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    const speakText = (text) => {
        if (!window.speechSynthesis || isMuted) return;
        window.speechSynthesis.cancel();
        const cleanText = text.replace(/\*/g, "");
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.pitch = 1.05;
        utterance.rate = 1.05;
        window.speechSynthesis.speak(utterance);
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const clearFile = () => {
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleTextSubmit = (e) => {
        e.preventDefault();
        handleInteraction(input, false);
    };

    const handleInteraction = async (textMessage, isVoicePrompt = false) => {
        const trimmedText = textMessage.trim();
        if ((!trimmedText && !selectedFile) || isLoading) return;

        const displayMessage = selectedFile ? (trimmedText || `Uploaded file: ${selectedFile.name}`) : trimmedText;

        setMessages((prev) => [...prev, { id: Date.now(), text: displayMessage, sender: "user" }]);
        setInput("");
        setIsLoading(true);

        const fileToSend = selectedFile;
        clearFile();

        try {
            const userString = localStorage.getItem("user");
            let currentUserId = "";
            if (userString) {
                try {
                    const userObj = JSON.parse(userString);
                    if (userObj.id) currentUserId = userObj.id.toString();
                } catch (e) {
                    console.error("Error parsing user data");
                }
            }

            // Construct FormData payload
            const formData = new FormData();
            formData.append("message", trimmedText || "Please analyze this statement.");
            if (currentUserId) formData.append("user_id", currentUserId);
            if (fileToSend) formData.append("file", fileToSend);

            const response = await fetch("http://localhost:8080/api/chat", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) throw new Error();
            const data = await response.json();
            const botReplyText = data.reply || "No structured response received.";

            setMessages((prev) => [...prev, { id: Date.now() + 1, text: botReplyText, sender: "bot" }]);

            if (isVoicePrompt) speakText(botReplyText);

        } catch {
            const errorText = "Connection lost with the database agent.";
            setMessages((prev) => [...prev, { id: Date.now() + 1, text: errorText, sender: "bot", isError: true }]);
            if (isVoicePrompt) speakText(errorText);
        } finally {
            setIsListening(false);
            setIsLoading(false);
        }
    };

    const toggleMute = () => {
        if (!isMuted && window.speechSynthesis) window.speechSynthesis.cancel();
        setIsMuted(!isMuted);
    };

    const formatText = (text) => {
        return text.split('\n').map((str, index) => {
            let formatted = str.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            if (str.trim().startsWith('* ')) {
                return <li key={index} dangerouslySetInnerHTML={{ __html: formatted.replace('* ', '') }} className={styles.listItem} />;
            }
            return <p key={index} dangerouslySetInnerHTML={{ __html: formatted }} className={styles.paragraph} />;
        });
    };

    return (
        <div className={styles.chatContainer}>

            <div className={styles.messageArea}>
                {/* Welcome Screen */}
                {messages.length === 0 && (
                    <div className={styles.welcomeScreen}>
                        <div className={styles.welcomeIcon}>
                            <FaMagic size={32} color="#fd802e" />
                        </div>
                        <h1 className={styles.welcomeTitle}>How can I help you today?</h1>
                        <div className={styles.suggestionsGrid}>
                            {QUICK_ACTIONS.map((action, index) => (
                                <button
                                    key={index}
                                    className={styles.suggestionCard}
                                    onClick={() => handleInteraction(action.text, false)}
                                >
                                    {action.icon}
                                    {action.text}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Chat Messages */}
                {messages.map((msg) => (
                    <div key={msg.id} className={`${styles.messageRow} ${msg.sender === "user" ? styles.userRow : styles.botRow}`}>
                        <div className={`${styles.avatar} ${msg.sender === "user" ? styles.userAvatar : styles.botAvatar}`}>
                            {msg.sender === "user" ? <FiUser size={18} /> : <FaRobot size={20} />}
                        </div>
                        <div className={`${styles.messageContent} ${msg.isError ? styles.errorContent : ""}`}>
                            <div className={styles.messageName}>{msg.sender === "user" ? "You" : "MBot"}</div>
                            <div className={styles.messageText}>
                                {formatText(msg.text)}
                            </div>
                        </div>
                    </div>
                ))}

                {/* Loading Indicator */}
                {isLoading && (
                    <div className={`${styles.messageRow} ${styles.botRow}`}>
                        <div className={`${styles.avatar} ${styles.botAvatar}`}>
                            <FaRobot size={20} />
                        </div>
                        <div className={styles.messageContent}>
                            <div className={styles.messageName}>MBot</div>
                            <div className={styles.typingIndicator}><span></span><span></span><span></span></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} className={styles.bottomSpacer} />
            </div>

            {/* Floating Input Area */}
            <div className={styles.inputWrapper}>

                {/* Visual indicator for attached file */}
                {selectedFile && (
                    <div style={{ padding: "8px 12px", fontSize: "12px", color: "#fd802e", display: "flex", alignItems: "center", gap: "8px" }}>
                        <span>📎 {selectedFile.name}</span>
                        <button type="button" onClick={clearFile} style={{ background: "none", border: "none", cursor: "pointer", color: "#666" }}>
                            <FiX size={14} />
                        </button>
                    </div>
                )}

                <form onSubmit={handleTextSubmit} className={styles.inputForm}>

                    <button type="button" onClick={toggleMute} className={styles.iconButton} title={isMuted ? "Unmute Bot" : "Mute Bot"}>
                        {isMuted ? <FiVolumeX size={18} /> : <FiVolume2 size={18} />}
                    </button>

                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className={styles.iconButton}
                        title="Upload Statement"
                    >
                        <FiPaperclip size={18} />
                    </button>
                    <input
                        type="file"
                        accept=".csv"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        style={{ display: "none" }}
                    />

                    <input
                        type="text"
                        className={styles.inputField}
                        placeholder={isListening ? "Listening..." : "Message MBot..."}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isLoading || isListening}
                    />

                    <button type="button" onClick={toggleListening} className={`${styles.iconButton} ${isListening ? styles.listening : ""}`} disabled={isLoading}>
                        {isListening ? <FaMicrophoneSlash size={18} /> : <FaMicrophone size={18} />}
                    </button>

                    <button type="submit" className={styles.sendButton} disabled={(!input.trim() && !selectedFile) || isLoading || isListening}>
                        <FiSend size={16} />
                    </button>
                </form>
                <p className={styles.disclaimer}>MBot can make mistakes. Verify important financial information.</p>
            </div>
        </div>
    );
};

export default MBot;
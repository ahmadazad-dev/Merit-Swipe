import React, { useState } from 'react';
import axios from 'axios';
import { FiZap, FiTrendingUp, FiPieChart, FiAlertCircle, FiLoader } from 'react-icons/fi';
import './styles/cardrecommendations.css';

function CardRecommendations() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorText, setErrorText] = useState('');
    const [hasSearched, setHasSearched] = useState(false);

    const handleFileChange = (event) => {
        if (event.target.files && event.target.files.length > 0) {
            setSelectedFile(event.target.files[0]);
            setErrorText('');
            setHasSearched(false);
        }
    };

    const getRecommendations = async () => {
        if (!selectedFile) {
            setErrorText('Please select a CSV file first.');
            return;
        }

        setIsLoading(true);
        setErrorText('');
        setHasSearched(false);

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await axios.post('http://localhost:8000/api/transactions/recommend', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setRecommendations(response.data.recommendations);
            setHasSearched(true);

        } catch (error) {
            setErrorText(error.response?.data?.detail || 'An error occurred while generating recommendations.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="recommendations-wrapper">

            {/* Premium Header Section */}
            <header className="hero-header">
                <h1 className="hero-title">
                    Find your <br />
                    <span className="text-orange">perfect card</span>
                </h1>
                <p className="hero-subtitle">
                    Drop your bank's CSV export and we'll instantly analyze your spending patterns
                    to surface the credit and debit cards that maximize your savings.
                </p>

                <div className="feature-tags">
                    <span className="tag"><FiZap className="tag-icon" /> Smart Matching</span>
                    <span className="tag"><FiTrendingUp className="tag-icon" /> Maximized Savings</span>
                    <span className="tag"><FiPieChart className="tag-icon" /> Spend Analysis</span>
                </div>
            </header>

            {/* Styled Dropzone Section */}
            <div className="upload-section">
                <div className="dropzone-container">
                    <div className="corner top-left"></div>
                    <div className="corner top-right"></div>
                    <div className="corner bottom-left"></div>
                    <div className="corner bottom-right"></div>

                    <div className="dropzone-content">
                        <div className="csv-icon-wrapper">
                            <div className="csv-card-icon">CSV</div>
                            <div className="csv-card-shadow"></div>
                        </div>

                        <h3>Drag & drop your CSV here</h3>
                        <p className="browse-text">
                            or <label htmlFor="file-upload" className="browse-link">browse files</label> — .csv only, up to 10 MB
                        </p>

                        <input
                            id="file-upload"
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            className="hidden-input"
                        />

                        {selectedFile && (
                            <div className="selected-file-action">
                                <p className="file-name">Selected: <strong>{selectedFile.name}</strong></p>
                                <button
                                    className="analyze-btn"
                                    onClick={getRecommendations}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <span className="btn-content">
                                            <FiLoader className="spin-icon" /> Analyzing...
                                        </span>
                                    ) : (
                                        'Get Recommendations'
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {errorText && (
                <p className="error-message">
                    <FiAlertCircle /> {errorText}
                </p>
            )}

            {/* Empty State UI */}
            {hasSearched && recommendations.length === 0 && !isLoading && (
                <div className="empty-state-box">
                    <h3>No perfect matches right now</h3>
                    <p>
                        Based on this specific bank statement, there aren't any cards in our database that offer significant savings for your current spending habits. Try uploading a statement with more dining or shopping transactions!
                    </p>
                </div>
            )}

            {/* Results Grid */}
            {recommendations.length > 0 && (
                <div className="results-container">
                    <h3 className="results-title">Your Top Matches</h3>
                    <div className="card-grid">
                        {recommendations.map((card, index) => (
                            <div key={index} className="recommendation-card">
                                <div className="image-wrapper">
                                    <img src={card.cardImage} alt={card.cardName} />
                                </div>
                                <div className="card-info">
                                    <h4>{card.cardName}</h4>
                                    <span className="bank-label">{card.bankName}</span>

                                    <div className="savings-box">
                                        <span className="savings-title">Potential Savings</span>
                                        <span className="savings-value">PKR {card.totalEstimatedSavings.toLocaleString()}</span>
                                    </div>

                                    <p className="category-highlight">
                                        Best for: <strong>{card.bestCategory}</strong>
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default CardRecommendations;
import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/header";
import HeroSection from "./components/HeroSection";
import SearchPage from "./components/SearchPage";
import AuthenticationPage from "./components/AuthenticationPage";
import Transactions from "./components/Transactions";
import Wallet from "./components/wallet";
import MyDeals from "./components/mydeals";
import Contact from "./components/contact";
import About from "./components/about";
import CardRecommendations from "./components/cardrecommendations";
import MBot from "./components/mbot"; // Import the new bot component
import "./App.css";

function App() {
  const [isBotOpen, setIsBotOpen] = useState(false);

  const toggleBot = () => setIsBotOpen((prev) => !prev);

  return (
    <BrowserRouter>
      <Header toggleBot={toggleBot} />

      <Routes>
        <Route path="/" element={<HeroSection />} />
        <Route path="/auth" element={<AuthenticationPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/my-deals" element={<MyDeals />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/recommendations" element={<CardRecommendations />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Floating MBot Widget */}
      {isBotOpen && (
        <div className="mbot-overlay">
          {/* Pass toggleBot to handle closing */}
          <MBot onClose={toggleBot} />
        </div>
      )}
    </BrowserRouter>
  );
}

export default App;
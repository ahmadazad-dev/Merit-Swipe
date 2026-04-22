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
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Header />
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
    </BrowserRouter>
  );
}

export default App;
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/header";
import HeroSection from "./components/HeroSection";
import SearchPage from "./components/SearchPage";
import AuthenticationPage from "./components/AuthenticationPage";
import Transactions from "./components/Transactions";
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HeroSection from "./components/HeroSection";
import SearchPage from "./components/SearchPage"; // your existing search page
import AuthenticationPage from "./components/AuthenticationPage";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HeroSection />} />
        <Route path="/auth" element={<AuthenticationPage />} />
        <Route path="/search" element={<SearchPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

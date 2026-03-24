import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HeroPage from "./components/HeroPage";
import SearchPage from "./components/SearchPage"; // your existing search page
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default route → Hero landing page */}
        <Route path="/" element={<HeroPage />} />

        {/* Search page (your existing App content) */}
        <Route path="/search" element={<SearchPage />} />

        {/* Catch-all → redirect to hero */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

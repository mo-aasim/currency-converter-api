import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Converter from "./pages/Converter";
import Currencies from "./pages/Currencies";
import Trends from "./pages/Trends";

export default function App() {
  const location = useLocation();
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Converter />} />
            <Route path="/currencies" element={<Currencies />} />
            <Route path="/trends" element={<Trends />} />
            <Route path="*" element={<Converter />} />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}

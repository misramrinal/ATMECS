import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import FeaturePage from './pages/FeaturePage';
import Nexus from './pages/Nexus';

function App() {
  return (
    <Router>
      <Header />
      <main className="bg-gray-900 min-h-screen">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/features" element={<FeaturePage />} />
          <Route path="/nexus" element={<Nexus />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;

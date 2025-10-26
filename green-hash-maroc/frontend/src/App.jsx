import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Vision from './pages/Vision';
import MiningPool from './pages/MiningPool';
import Exchange from './pages/Exchange';
import Simulator from './pages/Simulator';
import Invest from './pages/Invest';
import Community from './pages/Community';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-100 via-dark-200 to-dark-300">
      <Navbar />
      <main className="pt-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/vision" element={<Vision />} />
          <Route path="/mining-pool" element={<MiningPool />} />
          <Route path="/exchange" element={<Exchange />} />
          <Route path="/simulator" element={<Simulator />} />
          <Route path="/invest" element={<Invest />} />
          <Route path="/community" element={<Community />} />
        </Routes>
      </main>
      <Footer />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
}

export default App;
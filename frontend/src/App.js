import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Home from './pages/Home/home';
import Dash from './pages/dashboard/dash.jsx';
import About from './pages/about/About.jsx';
import GovtSchemes from './pages/govt/govtS.jsx';
import Login from './pages/login/login.jsx';
import OTPLogin from './pages/login/OTPLogin.jsx';
import SignUp from './pages/signup/sign.jsx';
import ContactPage from './pages/contacts/contact.jsx';
import Ecommerce from './pages/shopping/ecommerce.jsx';
import MarketPriceDashboard from './pages/market&loan/ml.jsx';
import Navbar from './components/Navbar/Navbar';
import AgrifarmForm from './pages/agrifarm/agrifarm'; // <-- Import the form
import './i18n/i18n'; // Initialize i18n

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/dashboard" element={<Dash />} />
            <Route path="/market-prices" element={<MarketPriceDashboard />} />
            <Route path="/marketplace" element={<Ecommerce />} />
            <Route path="/about" element={<About />} />
            <Route path="/government-schemes" element={<GovtSchemes />} />
            <Route path="/login" element={<Login />} />
            <Route path="/otp-login" element={<OTPLogin />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/contacts" element={<ContactPage />} />
            <Route path="/agrifarm" element={<AgrifarmForm />} /> {/* <-- Add route */}
          </Routes>
        </Router>
      </div>
    </AuthProvider>
  );
}

export default App;
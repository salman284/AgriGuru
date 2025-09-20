import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { MarketplaceProvider } from './contexts/MarketplaceContext';
import Home from './pages/Home/home';
import Dash from './pages/dashboard/dash.jsx';
import About from './pages/about/About.jsx';
import GovtSchemes from './pages/govt/govtS.jsx';
import Login from './pages/login/login.jsx';
import OTPLogin from './pages/login/OTPLogin.jsx';
import SignUp from './pages/signup/sign.jsx';
import Profile from './pages/profile';
import Settings from './pages/settings/Settings.jsx';
import ContactPage from './pages/contacts/contact.jsx';
import Ecommerce from './pages/shopping/ecommerce.jsx';
import Cart from './pages/shopping/Cart.jsx';
import Favorites from './pages/shopping/Favorites.jsx';
import Checkout from './pages/shopping/Checkout.jsx';
import MarketPriceDashboard from './pages/market&loan/ml.jsx';
import AgriContractForm from './pages/agrifarm/agrifarm.jsx';
import ContractAdmin from './pages/agrifarm/ContractAdmin.jsx';
import KhetiSaath from './pages/khetisaath/KhetiSaath.jsx';
import Navbar from './components/Navbar/Navbar';
import FloatingActions from './components/FloatingActions/FloatingActions';
import './i18n/i18n'; // Initialize i18n

function App() {
  return (
    <AuthProvider>
      <MarketplaceProvider>
        <div className="App">
          <Router>
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/home" element={<Home />} />
              <Route path="/dashboard" element={<Dash />} />
              <Route path="/market-prices" element={<MarketPriceDashboard />} />
              <Route path="/marketplace" element={<Ecommerce />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/agrifarm" element={<AgriContractForm />} />
              <Route path="/contract-admin" element={<ContractAdmin />} />
              <Route path="/kheti-saath" element={<KhetiSaath />} />
              <Route path="/about" element={<About />} />
              <Route path="/government-schemes" element={<GovtSchemes />} />
              <Route path="/login" element={<Login />} />
              <Route path="/otp-login" element={<OTPLogin />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/contacts" element={<ContactPage />} />
             
            </Routes>
          </Router>
          <FloatingActions />
        </div>
      </MarketplaceProvider>
    </AuthProvider>
  );
}

export default App;
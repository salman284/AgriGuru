import React from 'react';
import './App.css';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
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
import KhetiSaathFavorites from './pages/khetisaath/KhetiSaathFavorites.jsx';
import Navbar from './components/Navbar/Navbar';
import FloatingActions from './components/FloatingActions/FloatingActions';
import './i18n/i18n'; // Initialize i18n

// Layout component that includes Navbar and FloatingActions
function Layout() {
  return (
    <div className="App">
      <Navbar />
      <Outlet />
      <FloatingActions />
    </div>
  );
}

// Create router using the new v7 API
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Home />
      },
      {
        path: "/home",
        element: <Home />
      },
      {
        path: "/dashboard",
        element: <Dash />
      },
      {
        path: "/market-prices",
        element: <MarketPriceDashboard />
      },
      {
        path: "/marketplace",
        element: <Ecommerce />
      },
      {
        path: "/cart",
        element: <Cart />
      },
      {
        path: "/favorites",
        element: <Favorites />
      },
      {
        path: "/checkout",
        element: <Checkout />
      },
      {
        path: "/agrifarm",
        element: <AgriContractForm />
      },
      {
        path: "/contract-admin",
        element: <ContractAdmin />
      },
      {
        path: "/kheti-saath",
        element: <KhetiSaath />
      },
      {
        path: "/kheti-saath/favorites",
        element: <KhetiSaathFavorites />
      },
      {
        path: "/about",
        element: <About />
      },
      {
        path: "/government-schemes",
        element: <GovtSchemes />
      },
      {
        path: "/login",
        element: <Login />
      },
      {
        path: "/otp-login",
        element: <OTPLogin />
      },
      {
        path: "/signup",
        element: <SignUp />
      },
      {
        path: "/profile",
        element: <Profile />
      },
      {
        path: "/settings",
        element: <Settings />
      },
      {
        path: "/contacts",
        element: <ContactPage />
      }
    ]
  }
]);

function App() {
  return (
    <AuthProvider>
      <MarketplaceProvider>
        <RouterProvider router={router} />
      </MarketplaceProvider>
    </AuthProvider>
  );
}

export default App;
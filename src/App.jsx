import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import HomePage from './pages/HomePage';
import SignupUser from './pages/SignupUser';
import SignupSeller from './pages/SignupSeller';
import LoginUser from './pages/LoginUser';
import LoginSeller from './pages/LoginSeller';
import UserDashboard from './pages/UserDashboard';
import SellerDashboard from './pages/SellerDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup-user" element={<SignupUser />} />
        <Route path="/signup-seller" element={<SignupSeller />} />
        <Route path="/login-user" element={<LoginUser />} />
        <Route path="/login-seller" element={<LoginSeller />} />
        <Route path="/dashboard/user" element={<UserDashboard />} />
        <Route path="/dashboard/seller" element={<SellerDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

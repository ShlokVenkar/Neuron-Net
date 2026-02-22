import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import HomePage from './pages/HomePage';
import HeroDemo from './pages/HeroDemo';
import Signup from './pages/Signup';
import Login from './pages/Login';
import UserDashboard from './pages/UserDashboard';
import SellerDashboard from './pages/SellerDashboard';
import TeamDashboard from './pages/TeamDashboard';
import UserSettings from './pages/UserSettings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/hero-demo" element={<HeroDemo />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard/user" element={<UserDashboard />} />
        <Route path="/dashboard/seller" element={<SellerDashboard />} />
        <Route path="/dashboard/team" element={<TeamDashboard />} />
        <Route path="/settings" element={<UserSettings />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import PropertyDetail from './pages/PropertyDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import UploadPage from './pages/UploadPage';
import AdminBoundaryApproval from './pages/AdminBoundaryApproval';
import AdminUserManagement from './pages/AdminUserManagement';
import PropertyForm from './pages/PropertyForm';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminDashboard from './pages/AdminDashboard';
import SellerDashboard from './pages/SellerDashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import Dashboard from './pages/Dashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

function App() {
  return (
  
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/list-new" element={<PropertyForm />} />
            <Route path="/property/:id" element={<PropertyDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/register" element={<Register />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/admin/boundaries" element={<AdminBoundaryApproval />} />
            <Route path="/admin/users" element={<AdminUserManagement />} />
            <Route path="/seller-dashboard" element={<SellerDashboard />} />
            <Route path="/buyer-dashboard" element={<BuyerDashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Routes>
        </main>
        <Footer />
      </div>
  );
}

export default App;
// src/pages/Dashboard.jsx
import { useAuth } from '../context/AuthContext';
import BuyerDashboard from './BuyerDashboard';
import SellerDashboard from './SellerDashboard';

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) return <div>Redirecting...</div>;
  if (user.role === 'buyer') return <BuyerDashboard />;
  if (user.role === 'seller') return <SellerDashboard />;
  return <div className="p-8 text-center">Unknown role or access denied.</div>;
}
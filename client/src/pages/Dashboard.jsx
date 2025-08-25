import React from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserIcon, ShoppingBagIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="text-center py-20">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const navigation = [
    { name: 'Profile', href: '/dashboard', icon: UserIcon },
    { name: 'My Bookings', href: '/dashboard/bookings', icon: CalendarDaysIcon },
    { name: 'My Purchases', href: '/dashboard/purchases', icon: ShoppingBagIcon },
  ];

  const isActive = (href) => location.pathname === href;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="lg:grid lg:grid-cols-12 lg:gap-x-5">
        <aside className="py-6 px-2 sm:px-6 lg:py-0 lg:px-0 lg:col-span-3">
          <nav className="space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group rounded-md px-3 py-2 flex items-center text-sm font-medium ${
                  isActive(item.href)
                    ? 'bg-secondary-100 text-primary-600'
                    : 'text-secondary-900 hover:bg-secondary-50'
                }`}
              >
                <item.icon className={`mr-3 h-6 w-6 ${isActive(item.href) ? 'text-primary-600' : 'text-secondary-400 group-hover:text-secondary-500'}`} />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </aside>

        <main className="space-y-6 sm:px-6 lg:px-0 lg:col-span-9">
          <Routes>
            <Route path="/" element={<ProfileSection user={user} />} />
            <Route path="/bookings" element={<BookingsSection />} />
            <Route path="/purchases" element={<PurchasesSection />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

// Placeholder components for dashboard sections
const ProfileSection = ({ user }) => (
  <div className="card p-6">
    <h2 className="text-2xl font-bold">Profile</h2>
    <p className="mt-4"><strong>Name:</strong> {user.name}</p>
    <p><strong>Email:</strong> {user.email}</p>
    <p className="mt-6 text-sm text-secondary-500">Profile editing functionality is under construction.</p>
  </div>
);

const BookingsSection = () => {
  // Add useQuery logic here to fetch from '/api/bookings/my-bookings'
  return (
    <div className="card p-6">
      <h2 className="text-2xl font-bold">My Bookings</h2>
      <p className="mt-4 text-sm text-secondary-500">This section will show your past and upcoming service bookings. Feature under construction.</p>
    </div>
  );
};

const PurchasesSection = () => {
  // Add useQuery logic here to fetch from '/api/payments/purchases'
  return (
    <div className="card p-6">
      <h2 className="text-2xl font-bold">My Purchases</h2>
      <p className="mt-4 text-sm text-secondary-500">This section will show all the resources you've purchased. Feature under construction.</p>
    </div>
  );
};

export default Dashboard;
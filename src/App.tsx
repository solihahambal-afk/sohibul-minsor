import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/ServicesPage';
import HajjUmrahPage from './pages/HajjUmrahPage';
import ScholarshipsPage from './pages/ScholarshipsPage';
import ContactPage from './pages/ContactPage';
import NewsPage from './pages/NewsPage';
import NewsDetailsPage from './pages/NewsDetailsPage';
import { AdminAuthProvider, useAdminAuth } from './contexts/AdminAuthContext';
import AdminLayout from './pages/admin/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminNews from './pages/admin/AdminNews';
import AdminServices from './pages/admin/AdminServices';
import AdminHajjUmrah from './pages/admin/AdminHajjUmrah';
import AdminScholarships from './pages/admin/AdminScholarships';
import AdminTestimonials from './pages/admin/AdminTestimonials';
import AdminHealth from './pages/admin/AdminHealth';
import AdminSubscribers from './pages/admin/AdminSubscribers';
import AdminMessages from './pages/admin/AdminMessages';
import AdminProfile from './pages/admin/AdminProfile';
import AdminUsers from './pages/admin/AdminUsers';
import ResetPassword from './pages/ResetPassword';

const SuperAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAdminAuth();
  if (user?.role !== 'Super Admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return children;
};

export default function App() {
  return (
    <AdminAuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="hajj-umrah" element={<HajjUmrahPage />} />
            <Route path="scholarships" element={<ScholarshipsPage />} />
            <Route path="news" element={<NewsPage />} />
            <Route path="news/:slug" element={<NewsDetailsPage />} />
            <Route path="contact" element={<ContactPage />} />
          </Route>

          <Route path="/smc-dashboard" element={<AdminLogin />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="news" element={<AdminNews />} />
            <Route path="services" element={<AdminServices />} />
            <Route path="hajj-umrah" element={<AdminHajjUmrah />} />
            <Route path="scholarships" element={<AdminScholarships />} />
            <Route path="gallery" element={
              <SuperAdminRoute>
                <div className="p-8">Gallery Management Coming Soon</div>
              </SuperAdminRoute>
            } />
            <Route path="testimonials" element={<AdminTestimonials />} />
            <Route path="health" element={<AdminHealth />} />
            <Route path="subscribers" element={<AdminSubscribers />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="settings" element={
              <SuperAdminRoute>
                <div className="p-8">System Settings Coming Soon</div>
              </SuperAdminRoute>
            } />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="users" element={<SuperAdminRoute><AdminUsers /></SuperAdminRoute>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AdminAuthProvider>
  );
}

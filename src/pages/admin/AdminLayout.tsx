import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../../components/admin/Sidebar';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { Toaster, toast } from 'react-hot-toast';
import { Search, Sun, Moon, Menu, X, User, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminLayout() {
  const { user, isLoading, logout } = useAdminAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('adminTheme') === 'dark';
  });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('adminTheme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('adminTheme', 'light');
    }
  }, [isDarkMode]);

  const handleLogout = async () => {
    navigate('/');
    // Use a small timeout to allow navigation to complete before clearing auth state
    // This prevents the AdminLayout from catching the unauthenticated state and redirecting to /smc-dashboard
    setTimeout(async () => {
      await logout();
      toast.success('Logged out successfully');
    }, 50);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/smc-dashboard" replace />;
  }

  return (
    <div className={`flex h-screen overflow-hidden ${isDarkMode ? 'dark' : ''}`}>
      <Toaster position="top-right" />
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-primary-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        {/* Top Navigation */}
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 transition-colors duration-300 z-30">
          <div className="flex items-center flex-1">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 mr-4 text-gray-500 hover:text-primary-900 dark:text-gray-400 dark:hover:text-white lg:hidden rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Menu size={24} />
            </button>
            <div className="relative w-full max-w-md hidden sm:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-primary-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:bg-white dark:focus:bg-gray-600 transition-colors text-sm"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 text-gray-500 hover:text-primary-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button 
              onClick={handleLogout}
              className="p-2 ml-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-2"
              title="Log Out"
            >
              <LogOut size={20} />
            </button>
            <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold ml-2 overflow-hidden border border-gray-200 dark:border-gray-700">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <User size={18} />
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="w-full h-full"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

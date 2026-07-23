import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import FloatingWhatsApp from './FloatingWhatsApp';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster } from 'react-hot-toast';

export default function Layout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50">
      <Navbar />
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="w-full h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <FloatingWhatsApp />
      <Toaster position="bottom-right" />
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAdminAuth } from '../contexts/AdminAuthContext';

export default function LoadingScreen({ children }: { children: React.ReactNode }) {
  const [isResourcesLoaded, setIsResourcesLoaded] = useState(false);
  // Ensure we show the loading screen for a minimum duration to avoid flickering
  const [isMinimumTimeMet, setIsMinimumTimeMet] = useState(false);
  const { isLoading: isAuthLoading } = useAdminAuth();
  
  useEffect(() => {
    const handleLoad = () => {
      setIsResourcesLoaded(true);
    };
    
    if (document.readyState === 'complete') {
      setIsResourcesLoaded(true);
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, []);

  useEffect(() => {
    // Show loading screen for at least 800ms
    const timer = setTimeout(() => {
      setIsMinimumTimeMet(true);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Show loading screen until resources are loaded AND auth is initialized AND min time met
  const isAppLoading = !isResourcesLoaded || isAuthLoading || !isMinimumTimeMet;

  return (
    <>
      <AnimatePresence mode="wait">
        {isAppLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center"
          >
            <div className="relative flex items-center justify-center w-40 h-40">
              {/* Rotating Gold Ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                  ease: "linear"
                }}
                className="absolute inset-0 rounded-full border-2 border-transparent border-t-gold-500 border-r-gold-500 shadow-[0_0_15px_rgba(204,163,82,0.4)]"
              />
              
              {/* Inner subtle ring */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{
                  repeat: Infinity,
                  duration: 2.5,
                  ease: "linear"
                }}
                className="absolute inset-[6px] rounded-full border border-gray-100 border-b-gray-200 border-l-gray-200"
              />
              
              {/* Logo */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 bg-white rounded-full flex items-center justify-center overflow-hidden z-10 p-3">
                <img 
                  src="/new_logo.png" 
                  alt="Sohibul Minsor Classic Loading" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mt-8 text-primary-900 font-serif font-medium tracking-widest uppercase text-sm"
            >
              Loading Portal...
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 
        Render children only when auth is done loading so routes don't 
        prematurely redirect, but render them *underneath* the loading screen 
        while resources or minimum time is still finishing to prevent layout flash.
      */}
      {!isAuthLoading && children}
    </>
  );
}

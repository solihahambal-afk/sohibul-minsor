import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { auth } from '../../lib/firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (userCredential.user) {
        toast.success('Login successful');
        window.location.href = '/admin/dashboard';
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email first');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset email');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="z-50 relative"><Toaster position="top-right" /></div>
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-primary-900/5 dark:bg-primary-900/20 blur-3xl rounded-b-full"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="flex items-center justify-center bg-white p-2 rounded-2xl shadow-xl border border-gray-100">
            <img src="/new_logo.png?v=3" alt="Sohibulminsor Classic Logo" className="h-16 w-auto object-contain" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-serif font-bold tracking-tight text-gray-900 dark:text-white">
          Admin Portal
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Sign in to manage Sohibul Minsor Classic
        </p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-gray-100 dark:border-gray-700">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email address
              </label>
              <div className="mt-2 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all text-gray-900 dark:text-white sm:text-sm"
                  placeholder="admin@sohibulminsorclassic.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="mt-2 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all text-gray-900 dark:text-white sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-gold-500 focus:ring-gold-500 border-gray-300 rounded bg-gray-50 dark:bg-gray-900"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <button type="button" onClick={handleResetPassword} className="font-medium text-gold-600 hover:text-gold-500 transition-colors">
                  Forgot your password?
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-primary-900 bg-gold-500 hover:bg-gold-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <>
                    Sign in <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

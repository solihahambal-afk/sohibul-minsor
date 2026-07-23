import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Lock, Eye, EyeOff, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { auth } from '../lib/firebase';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [oobCode, setOobCode] = useState<string | null>(null);
  
  const navigate = useNavigate();

  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const isStrong = hasMinLength && hasUpper && hasLower && hasNumber && hasSpecial;
  const passwordsMatch = password === confirmPassword && password.length > 0;

  useEffect(() => {
    // Get the action code from the URL (Firebase uses 'oobCode' in URL)
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('oobCode');

    if (code) {
      setOobCode(code);
      verifyPasswordResetCode(auth, code).catch((error) => {
        setSessionError("Invalid or expired password reset link.");
      });
    } else {
      setSessionError("No reset code found in URL.");
    }
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isStrong) {
      toast.error('Please ensure your password meets all requirements.');
      return;
    }
    
    if (!passwordsMatch) {
      toast.error('Passwords do not match.');
      return;
    }

    if (!oobCode) {
      toast.error('Missing reset code.');
      return;
    }

    setIsLoading(true);
    
    try {
      await confirmPasswordReset(auth, oobCode, password);
      toast.success('Password updated successfully.');
      
      setTimeout(() => {
        navigate('/smc-dashboard');
      }, 3000);
      
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast.error(error.message || 'Failed to update password. Your link may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  const RequirementItem = ({ met, text }: { met: boolean, text: string }) => (
    <div className={`flex items-center text-sm ${met ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
      {met ? <Check className="w-4 h-4 mr-2" /> : <X className="w-4 h-4 mr-2" />}
      {text}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="z-50 relative"><Toaster position="top-right" /></div>
      
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
          Reset Your Password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Enter your new strong password below to regain access to your account.
        </p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-gray-100 dark:border-gray-700">
          
          {sessionError ? (
            <div className="rounded-md bg-red-50 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <X className="h-5 w-5 text-red-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Session Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{sessionError}</p>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => navigate('/smc-dashboard')}
                      className="text-sm font-medium text-red-800 hover:text-red-700 underline"
                    >
                      Return to login
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleResetPassword}>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  New Password
                </label>
                <div className="mt-2 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all text-gray-900 dark:text-white sm:text-sm"
                    placeholder="New password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirm Password
                </label>
                <div className="mt-2 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all text-gray-900 dark:text-white sm:text-sm"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Password Requirements:</p>
                <RequirementItem met={hasMinLength} text="Minimum 8 characters" />
                <RequirementItem met={hasUpper} text="One uppercase letter" />
                <RequirementItem met={hasLower} text="One lowercase letter" />
                <RequirementItem met={hasNumber} text="One number" />
                <RequirementItem met={hasSpecial} text="One special character" />
                <RequirementItem met={passwordsMatch} text="Passwords match" />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading || !isStrong || !passwordsMatch}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-primary-900 bg-gold-500 hover:bg-gold-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    "Reset Password"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}

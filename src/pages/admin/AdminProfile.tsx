import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Save, Upload, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { apiClient, hasApiConfig } from '../../lib/apiClient';
import { auth } from '../../lib/firebase';
import { updatePassword, updateEmail } from 'firebase/auth';

export default function AdminProfile() {
  const { user, checkAuth } = useAdminAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatarUrl: user?.avatarUrl || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        avatarUrl: user.avatarUrl || ''
      }));
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    
    try {
      if (formData.email !== auth.currentUser.email) {
        await updateEmail(auth.currentUser, formData.email);
      }
      
      const { error } = await apiClient.from('users').update({
        full_name: formData.name,
        avatar_url: formData.avatarUrl,
        email: formData.email
      }).eq('uid', auth.currentUser.uid).select().single();

      if (error) throw error;
      await checkAuth();
      toast.success('Profile updated successfully');
    } catch (err: any) {
      console.error('Error updating profile:', err);
      toast.error(err.message || 'Failed to update profile');
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      await updatePassword(auth.currentUser, formData.newPassword);
      
      toast.success('Password updated successfully');
      setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });

      // Send confirmation email via backend
      try {
        await apiClient.functions.invoke('send-mail', {
          body: {
            type: 'password_change',
            email: user?.email || formData.email,
            subject: 'Security Alert: Password Changed',
            html: '<p>Your Sohibul Minsor Classic admin account password was recently changed. If this was not you, please contact support immediately.</p>'
          }
        });
      } catch (err) {
        console.error('Failed to trigger confirmation email', err);
      }
    } catch (err: any) {
      console.error('Error updating password:', err);
      toast.error(err.message || 'Failed to update password');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image is too large. Max 5MB allowed.');
      return;
    }

    const toastId = toast.loading('Uploading profile picture...');
    try {
      const { uploadImage } = await import('../../lib/firebase');
      
      // Compress
      const compress = (f: File): Promise<File> => new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(f);
        reader.onload = (event) => {
          const img = new Image();
          img.src = event.target?.result as string;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            let w = img.width, h = img.height;
            if (w > h && w > 500) { h *= 500 / w; w = 500; }
            else if (h > 500) { w *= 500 / h; h = 500; }
            canvas.width = w; canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, w, h);
            canvas.toBlob(blob => {
              resolve(blob ? new File([blob], f.name, { type: f.type }) : f);
            }, f.type || 'image/jpeg', 0.85);
          };
        };
      });
      
      const compressed = await compress(file);
      const url = await uploadImage(compressed, 'avatars');
      
      setFormData({ ...formData, avatarUrl: url });
      toast.success('Profile picture loaded. Click Save Changes to apply.', { id: toastId });
    } catch (err) {
      toast.error('Failed to upload image.', { id: toastId });
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary-900 dark:text-white mb-2">My Profile</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage your account settings and preferences.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
            <div className="w-32 h-32 mx-auto rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 border-4 border-white dark:border-gray-800 shadow-md mb-4 flex items-center justify-center">
              {formData.avatarUrl ? (
                <img src={formData.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={48} className="text-gray-400" />
              )}
            </div>
            <h3 className="text-lg font-bold text-primary-900 dark:text-white">{user?.name}</h3>
            <p className="text-sm text-gold-600 font-medium">{user?.role}</p>
            
            <button 
              type="button"
              onClick={() => {
                fileInputRef.current?.click();
              }}
              className="mt-6 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 w-full flex items-center justify-center"
            >
              <Upload size={16} className="mr-2" />
              Change Picture
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange} 
            />
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <form onSubmit={handleSaveProfile} className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-bold text-primary-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">Personal Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gold-500 text-primary-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gold-500 text-primary-900 dark:text-white"
                />
              </div>
              <div className="pt-4 text-right">
                <button type="submit" className="px-6 py-2 bg-gold-500 text-primary-900 rounded-xl font-bold hover:bg-gold-400">
                  Save Changes
                </button>
              </div>
            </div>
          </form>

          <form onSubmit={handleSavePassword} className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-bold text-primary-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">Change Password</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
                <input
                  type="password"
                  value={formData.currentPassword}
                  onChange={e => setFormData({ ...formData, currentPassword: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gold-500 text-primary-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                <input
                  type="password"
                  value={formData.newPassword}
                  onChange={e => setFormData({ ...formData, newPassword: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gold-500 text-primary-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gold-500 text-primary-900 dark:text-white"
                />
              </div>
              <div className="pt-4 text-right">
                <button 
                  type="submit" 
                  disabled={!formData.currentPassword || !formData.newPassword || !formData.confirmPassword}
                  className="px-6 py-2 bg-primary-900 text-white rounded-xl font-bold hover:bg-primary-800 disabled:opacity-50"
                >
                  Update Password
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

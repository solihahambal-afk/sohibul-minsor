import React, { useState, useEffect } from 'react';
import { apiClient } from '../../lib/apiClient';
import { Toaster, toast } from 'react-hot-toast';
import { UserCircle, Shield, ShieldAlert, Trash2 } from 'lucide-react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

export default function AdminUsers() {
  const { user } = useAdminAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await apiClient.from('users').select('*');
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, currentRole: string) => {
    if (userId === user?.id) {
      toast.error("You cannot change your own role.");
      return;
    }
    
    const newRole = currentRole === 'Super Admin' ? 'Admin' : 'Super Admin';
    
    try {
      const { error } = await apiClient.from('users').update({ role: newRole }).eq('id', userId);
      if (error) throw error;
      toast.success(`Role updated to ${newRole}`);
      fetchUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update role');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Users</h2>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                      {u.avatar_url || u.avatarUrl ? (
                        <img src={u.avatar_url || u.avatarUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <UserCircle className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {u.name || u.full_name || 'Admin User'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500 dark:text-gray-400">{u.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    u.role === 'Super Admin' 
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                      : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  }`}>
                    {u.role === 'Super Admin' ? <ShieldAlert className="w-3 h-3 mr-1" /> : <Shield className="w-3 h-3 mr-1" />}
                    {u.role || 'Admin'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleRoleChange(u.id, u.role)}
                    disabled={u.id === user?.id}
                    className="text-gold-600 hover:text-gold-700 dark:text-gold-500 dark:hover:text-gold-400 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Toggle Role
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

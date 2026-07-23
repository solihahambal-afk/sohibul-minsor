import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Trash2, Download, Users, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiClient, hasApiConfig, getErrorMessage } from '../../lib/apiClient';

interface Subscriber {
  id: string;
  email: string;
  name: string;
  created_at: string;
  status: 'Active' | 'Unsubscribed';
}


export default function AdminSubscribers() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
  const fetchSubscribers = async () => {
    setIsLoading(true);

    try {
      const { data, error } = await apiClient
        .from("subscribers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setSubscribers((data as Subscriber[]) || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load subscribers");
    } finally {
      setIsLoading(false);
    }
  };

  fetchSubscribers();
}, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this subscriber?')) {
      if (true) {
        try {
          const { error } = await apiClient.from('subscribers').delete().eq('id', id);
          if (error) throw error;
        } catch (error: any) {
          console.error('Error deleting subscriber:', error);
          toast.error('Failed to delete subscriber from database.');
          return;
        }
      }
      
      toast.success('Subscriber deleted successfully');
    }
  };

  const handleExportCSV = () => {
    if (subscribers.length === 0) {
      toast.error('No subscribers to export.');
      return;
    }
    
    const headers = ['Name', 'Email', 'Status', 'Date Subscribed'];
    const csvData = subscribers.map(sub => [
      sub.name || 'N/A',
      sub.email,
      sub.status,
      new Date(sub.created_at).toLocaleDateString()
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `subscribers_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Exporting CSV...');
  };

  const filteredSubscribers = subscribers.filter(s => 
    (s.email || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
    (s.name && s.name.toLowerCase().includes((searchTerm || '').toLowerCase()))
  );

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary-900 dark:text-white mb-2">Subscribers</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage newsletter subscribers.</p>
        </div>
        <div className="flex space-x-3">
          <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-xl flex items-center font-bold">
            <Users size={18} className="mr-2" />
            Total: {subscribers.length}
          </div>
          <button 
            onClick={handleExportCSV}
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium text-gray-700 dark:text-gray-300"
          >
            <Download size={18} className="mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="relative max-w-md w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by email or name..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-gold-500 text-primary-900 dark:text-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400 uppercase text-xs">
                <th className="px-6 py-4 font-semibold">Subscriber</th>
                <th className="px-6 py-4 font-semibold">Date Subscribed</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {filteredSubscribers.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No records found.
                  </td>
                </tr>
              ) : (
                filteredSubscribers.map(sub  => (
                  <tr key={sub.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 text-gray-400">
                        <Mail size={18} />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-bold text-primary-900 dark:text-white">{sub.email}</div>
                        <div className="text-xs text-gray-500">{sub.name || 'No Name Provided'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{sub.created_at}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${
                      sub.status === 'Active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30'
                    }`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDelete(sub.id)} className="text-gray-400 hover:text-red-600 p-2">
                      <Trash2 size={18} />
                    </button>
                  </td>
                
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

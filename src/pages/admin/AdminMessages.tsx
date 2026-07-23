import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Trash2, Mail, CheckCircle, X, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiClient, hasApiConfig, getErrorMessage } from '../../lib/apiClient';

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
  status: 'Unread' | 'Read' | 'Replied';
}


export default function AdminMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = apiClient.from('messages').select('*').order('created_at', { ascending: false })
      .subscribe(({ data, error }) => {
        setIsLoading(false);
        if (error) {
          console.error('Error fetching data:', error);
          // toast.error('Database connection error');
        } else if (data) {
          setMessages(data);
        }
      });
    return () => { if (unsubscribe) unsubscribe(); };
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      if (true) {
        try {
          const { error } = await apiClient.from('messages').delete().eq('id', id);
          if (error) throw error;
        } catch (error: any) {
          console.error('Error deleting message:', error);
          toast.error('Failed to delete message from database.');
          return;
        }
      }
      
      if (selectedMessage?.id === id) {
        setSelectedMessage(null);
      }
      toast.success('Message deleted successfully');
    }
  };

  const handleToggleStatus = async (id: string, newStatus: 'Unread' | 'Read' | 'Replied') => {
    if (true) {
      try {
        const { error } = await apiClient.from('messages').update({ status: newStatus }).eq('id', id);
        if (error) throw error;
      } catch (error: any) {
        console.error('Error updating message status:', error);
        toast.error('Failed to update message status.');
        return;
      }
    }
    
    setMessages(messages.map(m => m.id === id ? { ...m, status: newStatus } : m));
    if (selectedMessage?.id === id) {
      setSelectedMessage({ ...selectedMessage, status: newStatus });
    }
    toast.success(`Message marked as ${newStatus}`);
  };

  const handleViewMessage = (msg: Message) => {
    setSelectedMessage(msg);
    if (msg.status === 'Unread') {
      handleToggleStatus(msg.id, 'Read');
    }
  };

  const filteredMessages = messages.filter(m => 
    (m.name && m.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (m.email && m.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (m.subject && m.subject.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (selectedMessage) {
    return (
      <div className="space-y-6 pb-12">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setSelectedMessage(null)}
            className="flex items-center text-gray-500 hover:text-primary-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Messages
          </button>
          <div className="flex space-x-2">
            <button 
              onClick={() => handleToggleStatus(selectedMessage.id, selectedMessage.status === 'Unread' ? 'Read' : 'Unread')}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Mark as {selectedMessage.status === 'Unread' ? 'Read' : 'Unread'}
            </button>
            <button 
              onClick={() => handleToggleStatus(selectedMessage.id, 'Replied')}
              className="px-4 py-2 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 rounded-xl hover:bg-blue-100 transition-colors text-sm font-medium"
            >
              Mark as Replied
            </button>
            <button 
              onClick={() => handleDelete(selectedMessage.id)}
              className="px-4 py-2 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-xl hover:bg-red-100 transition-colors text-sm font-medium"
            >
              Delete
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row justify-between sm:items-start border-b border-gray-100 dark:border-gray-700 pb-6 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-primary-900 dark:text-white mb-2">{selectedMessage.subject}</h2>
              <div className="flex items-center text-sm">
                <span className="font-bold text-gray-900 dark:text-white mr-2">{selectedMessage.name}</span>
                <span className="text-gray-500 dark:text-gray-400">&lt;{selectedMessage.email}&gt;</span>
              </div>
            </div>
            <div className="mt-4 sm:mt-0 flex flex-col items-start sm:items-end">
              <span className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                {new Date(selectedMessage.date).toLocaleString()}
              </span>
              <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${
                selectedMessage.status === 'Unread' ? 'bg-red-100 text-red-800 dark:bg-red-900/30' :
                selectedMessage.status === 'Replied' ? 'bg-green-100 text-green-800 dark:bg-green-900/30' :
                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
              }`}>
                {selectedMessage.status}
              </span>
            </div>
          </div>
          
          <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {selectedMessage.message}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary-900 dark:text-white mb-2">Contact Messages</h1>
          <p className="text-gray-500 dark:text-gray-400">View and manage inquiries from the website.</p>
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
              placeholder="Search messages..."
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
                <th className="px-6 py-4 font-semibold">Sender</th>
                <th className="px-6 py-4 font-semibold">Subject</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {filteredMessages.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No records found.
                  </td>
                </tr>
              ) : (
                filteredMessages.map(msg  => (
                  <tr 
                  key={msg.id} 
                  className={`hover:bg-gray-50/50 dark:hover:bg-gray-700/50 cursor-pointer ${msg.status === 'Unread' ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
                  onClick={() => handleViewMessage(msg)}
                >
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-primary-900 dark:text-white">{msg.name}</div>
                    <div className="text-xs text-gray-500">{msg.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`text-sm ${msg.status === 'Unread' ? 'font-bold text-primary-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                      {msg.subject}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    {new Date(msg.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${
                      msg.status === 'Unread' ? 'bg-red-100 text-red-800 dark:bg-red-900/30' :
                      msg.status === 'Replied' ? 'bg-green-100 text-green-800 dark:bg-green-900/30' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {msg.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(msg.id); }} 
                      className="text-gray-400 hover:text-red-600 p-2"
                    >
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

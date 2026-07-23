import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Search, Edit2, Trash2, GraduationCap, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiClient, hasApiConfig, getErrorMessage } from '../../lib/apiClient';
import ImageUpload from '../../components/ImageUpload';
import { sendNewsletterIfPublished } from '../../lib/sendNewsletter';

interface Scholarship {
  id: string;
  title: string;
  featuredImage: string;
  country: string;
  institution: string;
  degreeLevel: string;
  deadline: string;
  eligibility: string;
  applicationLink: string;
  shortDescription: string;
  fullDescription: string;
  status: 'Open' | 'Closed';
}


export default function AdminScholarships() {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingItem, setEditingItem] = useState<Scholarship | null>(null);
  const [items, setItems] = useState<Scholarship[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<Partial<Scholarship>>({});

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = apiClient.from('scholarships').select('*').order('deadline', { ascending: true })
      .subscribe(({ data, error }) => {
        setIsLoading(false);
        if (error) {
          console.error('Error fetching data:', error);
          // toast.error('Database connection error');
        } else if (data) {
          setItems(data);
        }
      });
    return () => { if (unsubscribe) unsubscribe(); };
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this scholarship?')) {
      if (true) {
        try {
          const { error } = await apiClient.from('scholarships').delete().eq('id', id);
          if (error) throw error;
        } catch (error: any) {
          console.error('Error deleting scholarship:', error);
          toast.error('Failed to delete scholarship from database.');
          return;
        }
      }
      
      toast.success('Scholarship deleted successfully');
      if (view === 'form') setView('list');
    }
  };

  const handleDuplicate = async (item: Scholarship) => {
    const newItem: Partial<Scholarship> = {
      ...item,
      id: undefined,
      title: `${item.title} (Copy)`,
      status: 'Closed'
    };

    if (true) {
      try {
        const { data, error } = await apiClient.from('scholarships').insert([newItem]).select().single();
        if (error) throw error;
        
        toast.success('Scholarship duplicated');
      } catch (error: any) {
        console.error('Error duplicating scholarship:', error);
        toast.error('Failed to duplicate scholarship');
      }
    } else {
      const duplicated = { ...newItem, id: Math.random().toString(36).substr(2, 9) } as Scholarship;
      
      toast.success('Scholarship duplicated');
    }
  };

  const handleEdit = (item: Scholarship) => {
    setEditingItem(item);
    setFormData(item);
    setView('form');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const dataToSave = { ...formData, title: formData.title || 'Untitled Scholarship' };
    let savedItem = { ...dataToSave } as Scholarship;
    
    if (true) {
      try {
        if (editingItem) {
          const { data, error } = await apiClient.from('scholarships').update(dataToSave).eq('id', editingItem.id).select().single();
          if (error) throw error;
          savedItem = data;
        } else {
          const { data, error } = await apiClient.from('scholarships').insert([dataToSave]).select().single();
          if (error) throw error;
          savedItem = data;
        }
      } catch (error: any) {
        console.error('Error saving scholarship:', error);
        toast.error(getErrorMessage(error, 'Database connection error.'));
        return;
      }
    } else {
      if (!editingItem) {
        savedItem.id = Math.random().toString(36).substr(2, 9);
      }
    }

    if (editingItem) {
      
      toast.success('Scholarship updated successfully');
    } else {
      
      toast.success('Scholarship added successfully');
    }
    
    if (savedItem) {
      sendNewsletterIfPublished('newsletter', savedItem.title, savedItem.shortDescription || savedItem.title, savedItem.status, editingItem?.status, savedItem?.featuredImage);
    }
    setView('list');
    setEditingItem(null);
  };

  const filteredItems = items.filter(p => 
    (p.title || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
    (p.country || '').toLowerCase().includes((searchTerm || '').toLowerCase())
  );

  if (view === 'form') {
    return (
      <div className="space-y-6 pb-12">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-primary-900 dark:text-white">
            {editingItem ? 'Edit Scholarship' : 'Add New Scholarship'}
          </h2>
          <div className="flex space-x-3">
            {editingItem && (
              <button 
                onClick={() => handleDelete(editingItem.id)}
                className="px-4 py-2 border border-red-200 dark:border-red-800/30 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 font-medium transition-colors flex items-center"
              >
                <Trash2 size={18} className="mr-2" />
                Delete
              </button>
            )}
            <button 
              onClick={() => setView('list')}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="px-4 py-2 bg-gold-500 text-primary-900 rounded-xl font-bold hover:bg-gold-400"
            >
              Save Scholarship
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Scholarship Title *</label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={e => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gold-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select
                value={formData.status || 'Open'}
                onChange={e => setFormData({...formData, status: e.target.value as 'Open' | 'Closed'})}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gold-500"
              >
                <option value="Open">Open</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Country</label>
              <input
                type="text"
                value={formData.country || ''}
                onChange={e => setFormData({...formData, country: e.target.value})}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gold-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Institution</label>
              <input
                type="text"
                value={formData.institution || ''}
                onChange={e => setFormData({...formData, institution: e.target.value})}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gold-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Degree Level</label>
              <input
                type="text"
                value={formData.degreeLevel || ''}
                onChange={e => setFormData({...formData, degreeLevel: e.target.value})}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gold-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deadline</label>
              <input
                type="date"
                value={formData.deadline || ''}
                onChange={e => setFormData({...formData, deadline: e.target.value})}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gold-500"
              />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Application Link</label>
              <input
                type="text"
                value={formData.applicationLink || ''}
                onChange={e => setFormData({...formData, applicationLink: e.target.value})}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gold-500"
              />
            </div>
            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Featured Image</label>
              <ImageUpload value={formData.featuredImage || ''} onChange={url => setFormData({...formData, featuredImage: url})} folder="scholarships" />
            </div>
            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Eligibility</label>
              <textarea
                value={formData.eligibility || ''}
                onChange={e => setFormData({...formData, eligibility: e.target.value})}
                rows={2}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gold-500"
              />
            </div>
            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Short Description</label>
              <textarea
                value={formData.shortDescription || ''}
                onChange={e => setFormData({...formData, shortDescription: e.target.value})}
                rows={2}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gold-500"
              />
            </div>
            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Description</label>
              <textarea
                value={formData.fullDescription || ''}
                onChange={e => setFormData({...formData, fullDescription: e.target.value})}
                rows={6}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gold-500"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary-900 dark:text-white mb-2">Scholarships Management</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage global scholarship opportunities.</p>
        </div>
        <button 
          onClick={() => { setFormData({ status: 'Open' }); setView('form'); }}
          className="inline-flex items-center justify-center px-6 py-3 bg-gold-500 text-primary-900 font-bold rounded-xl hover:bg-gold-400"
        >
          <Plus size={20} className="mr-2" />
          Add Scholarship
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="relative max-w-md w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search scholarships..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-gold-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400 uppercase text-xs">
                <th className="px-6 py-4 font-semibold">Scholarship</th>
                <th className="px-6 py-4 font-semibold">Location</th>
                <th className="px-6 py-4 font-semibold">Deadline</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No records found.
                  </td>
                </tr>
              ) : (
                filteredItems.map(item  => (
                  <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                        {item.featuredImage ? (
                          <img src={item.featuredImage} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <GraduationCap className="h-full w-full p-2 text-gray-400" />
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-bold text-primary-900 dark:text-white">{item.title}</div>
                        <div className="text-xs text-gray-500">{item.degreeLevel}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="font-medium text-primary-900 dark:text-white">{item.institution}</div>
                    <div>{item.country}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{item.deadline}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${
                      item.status === 'Open' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDuplicate(item)} 
                      className="text-gray-400 hover:text-indigo-600 p-2"
                      title="Duplicate"
                    >
                      <Copy size={18} />
                    </button>
                    <button onClick={() => handleEdit(item)} className="text-gray-400 hover:text-blue-600 p-2">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="text-gray-400 hover:text-red-600 p-2">
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

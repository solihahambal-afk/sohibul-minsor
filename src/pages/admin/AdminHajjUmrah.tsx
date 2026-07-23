import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Search, Edit2, Trash2, Compass, Users, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import ImageUpload from '../../components/ImageUpload';
import { apiClient, hasApiConfig, getErrorMessage } from '../../lib/apiClient';
import { sendNewsletterIfPublished } from '../../lib/sendNewsletter';

interface Package {
  id: string;
  name: string;
  featuredImage: string;
  type: 'Hajj' | 'Umrah';
  duration: string;
  price: number;
  departureDate: string;
  returnDate: string;
  availableSlots: number;
  shortDescription: string;
  fullDescription: string;
  status: 'Open' | 'Closed';
}


export default function AdminHajjUmrah() {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<Partial<Package>>({});

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = apiClient.from('hajj_umrah_packages').select('*').order('departureDate', { ascending: true })
      .subscribe(({ data, error }) => {
        setIsLoading(false);
        if (error) {
          console.error('Error fetching data:', error);
          // toast.error('Database connection error');
        } else if (data) {
          setPackages(data);
        }
      });
    return () => { if (unsubscribe) unsubscribe(); };
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this package?')) {
      if (true) {
        try {
          const { error } = await apiClient.from('hajj_umrah_packages').delete().eq('id', id);
          if (error) throw error;
        } catch (error: any) {
          console.error('Error deleting package:', error);
          toast.error('Failed to delete package from database.');
          return;
        }
      }
      
      toast.success('Package deleted successfully');
      if (view === 'form') setView('list');
    }
  };

  const handleDuplicate = async (pkg: Package) => {
    const newPkg: Partial<Package> = {
      ...pkg,
      id: undefined,
      name: `${pkg.name} (Copy)`,
      status: 'Closed'
    };

    if (true) {
      try {
        const { data, error } = await apiClient.from('hajj_umrah_packages').insert([newPkg]).select().single();
        if (error) throw error;
        
        toast.success('Package duplicated');
      } catch (error: any) {
        console.error('Error duplicating package:', error);
        toast.error('Failed to duplicate package');
      }
    } else {
      const duplicated = { ...newPkg, id: Math.random().toString(36).substr(2, 9) } as Package;
      
      toast.success('Package duplicated');
    }
  };

  const handleEdit = (pkg: Package) => {
    setEditingPackage(pkg);
    setFormData(pkg);
    setView('form');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure title is populated since it's required in the schema
    const dataToSave = { ...formData, title: formData.name || 'Untitled Package' };
    let savedPackage = { ...dataToSave } as Package;
    
    if (true) {
      try {
        if (editingPackage) {
          const { data, error } = await apiClient.from('hajj_umrah_packages').update(dataToSave).eq('id', editingPackage.id).select().single();
          if (error) throw error;
          savedPackage = data;
        } else {
          const { data, error } = await apiClient.from('hajj_umrah_packages').insert([dataToSave]).select().single();
          if (error) throw error;
          savedPackage = data;
        }
      } catch (error: any) {
        console.error('Error saving package:', error);
        toast.error(getErrorMessage(error, 'Database connection error.'));
        return;
      }
    } else {
      if (!editingPackage) {
        savedPackage.id = Math.random().toString(36).substr(2, 9);
      }
    }

    if (editingPackage) {
      
      toast.success('Package updated successfully');
    } else {
      
      toast.success('Package added successfully');
    }
    
    if (savedPackage) {
      sendNewsletterIfPublished('newsletter', savedPackage.name, savedPackage.shortDescription || savedPackage.name, savedPackage.status, editingPackage?.status, savedPackage?.featuredImage);
    }
    setView('list');
    setEditingPackage(null);
  };

  const filteredPackages = packages.filter(p => 
    (p.name || '').toLowerCase().includes((searchTerm || '').toLowerCase())
  );

  if (view === 'form') {
    return (
      <div className="space-y-6 pb-12">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-primary-900 dark:text-white">
            {editingPackage ? 'Edit Package' : 'Add New Package'}
          </h2>
          <div className="flex space-x-3">
            {editingPackage && (
              <button 
                onClick={() => handleDelete(editingPackage.id)}
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
              Save Package
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Package Name *</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gold-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
              <select
                value={formData.type || 'Umrah'}
                onChange={e => setFormData({...formData, type: e.target.value as 'Hajj' | 'Umrah'})}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gold-500"
              >
                <option value="Hajj">Hajj</option>
                <option value="Umrah">Umrah</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration</label>
              <input
                type="text"
                placeholder="e.g., 14 Days"
                value={formData.duration || ''}
                onChange={e => setFormData({...formData, duration: e.target.value})}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gold-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (₦)</label>
              <input
                type="number"
                value={formData.price || 0}
                onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gold-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Available Slots</label>
              <input
                type="number"
                value={formData.availableSlots || 0}
                onChange={e => setFormData({...formData, availableSlots: Number(e.target.value)})}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gold-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Departure Date</label>
              <input
                type="date"
                value={formData.departureDate || ''}
                onChange={e => setFormData({...formData, departureDate: e.target.value})}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gold-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Return Date</label>
              <input
                type="date"
                value={formData.returnDate || ''}
                onChange={e => setFormData({...formData, returnDate: e.target.value})}
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
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Featured Image</label>
            <ImageUpload value={formData.featuredImage || ''} onChange={url => setFormData({ ...formData, featuredImage: url })} folder="hajj-umrah" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Short Description</label>
            <textarea
              value={formData.shortDescription || ''}
              onChange={e => setFormData({...formData, shortDescription: e.target.value})}
              rows={2}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gold-500"
            />
          </div>
          <div>
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
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary-900 dark:text-white mb-2">Hajj & Umrah Management</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage pilgrimage packages and availability.</p>
        </div>
        <button 
          onClick={() => { setFormData({ type: 'Umrah', status: 'Open' }); setView('form'); }}
          className="inline-flex items-center justify-center px-6 py-3 bg-gold-500 text-primary-900 font-bold rounded-xl hover:bg-gold-400"
        >
          <Plus size={20} className="mr-2" />
          Add Package
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
              placeholder="Search packages..."
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
                <th className="px-6 py-4 font-semibold">Package</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Price</th>
                <th className="px-6 py-4 font-semibold">Dates</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {filteredPackages.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No records found.
                  </td>
                </tr>
              ) : (
                filteredPackages.map(pkg  => (
                  <tr key={pkg.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                        {pkg.featuredImage ? (
                          <img src={pkg.featuredImage} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <Compass className="h-full w-full p-2 text-gray-400" />
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-bold text-primary-900 dark:text-white">{pkg.name}</div>
                        <div className="text-xs text-gray-500">{pkg.duration} • {pkg.availableSlots} slots left</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{pkg.type}</td>
                  <td className="px-6 py-4 text-sm font-bold text-primary-900 dark:text-white">₦{pkg.price}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {pkg.departureDate} <br />
                    <span className="text-xs">to {pkg.returnDate}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${
                      pkg.status === 'Open' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30'
                    }`}>
                      {pkg.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDuplicate(pkg)} 
                      className="text-gray-400 hover:text-indigo-600 p-2"
                      title="Duplicate"
                    >
                      <Copy size={18} />
                    </button>
                    <button onClick={() => handleEdit(pkg)} className="text-gray-400 hover:text-blue-600 p-2">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(pkg.id)} className="text-gray-400 hover:text-red-600 p-2">
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

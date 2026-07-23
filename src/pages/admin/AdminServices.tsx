import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Search, Edit2, Trash2, Briefcase, CheckCircle, XCircle, Copy } from 'lucide-react';
import ImageUpload from '../../components/ImageUpload';
import toast from 'react-hot-toast';
import { apiClient, hasApiConfig, getErrorMessage } from '../../lib/apiClient';
import { sendNewsletterIfPublished } from '../../lib/sendNewsletter';

interface Service {
  id: string;
  title: string;
  iconImage: string;
  shortDescription: string;
  fullDescription: string;
  displayOrder: number;
  status: 'Active' | 'Inactive';
}


export default function AdminServices() {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<Service>>({});

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = apiClient.from('services').select('*').order('displayOrder', { ascending: true })
      .subscribe(({ data, error }) => {
        setIsLoading(false);
        if (error) {
          console.error('Error fetching data:', error);
          // toast.error('Database connection error');
        } else if (data) {
          setServices(data);
        }
      });
    return () => { if (unsubscribe) unsubscribe(); };
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      if (true) {
        try {
          const { error } = await apiClient.from('services').delete().eq('id', id);
          if (error) throw error;
        } catch (error: any) {
          console.error('Error deleting service:', error);
          toast.error('Failed to delete service from database.');
          return;
        }
      }
      
      toast.success('Service deleted successfully');
      if (view === 'form') setView('list');
    }
  };

  const handleDuplicate = async (service: Service) => {
    const newService: Partial<Service> = {
      ...service,
      id: undefined,
      title: `${service.title} (Copy)`,
      status: 'Inactive'
    };

    if (true) {
      try {
        const { data, error } = await apiClient.from('services').insert([newService]).select().single();
        if (error) throw error;
        
        toast.success('Service duplicated');
      } catch (error: any) {
        console.error('Error duplicating service:', error);
        toast.error('Failed to duplicate service');
      }
    } else {
      const duplicated = { ...newService, id: Math.random().toString(36).substr(2, 9) } as Service;
      
      toast.success('Service duplicated');
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData(service);
    setView('form');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const dataToSave = { ...formData, title: formData.title || 'Untitled Service' };
    let savedService = { ...dataToSave } as Service;
    
    if (true) {
      try {
        if (editingService) {
          const { data, error } = await apiClient.from('services').update(dataToSave).eq('id', editingService.id).select().single();
          if (error) throw error;
          savedService = data;
        } else {
          // New service without an explicit ID to let DB generate it, but we can also supply a UUID
          const { data, error } = await apiClient.from('services').insert([dataToSave]).select().single();
          if (error) throw error;
          savedService = data;
        }
      } catch (error: any) {
        console.error('Error saving service:', error);
        toast.error(getErrorMessage(error, 'Database connection error.'));
        return;
      }
    } else {
      if (!editingService) {
        savedService.id = Math.random().toString(36).substr(2, 9);
      }
    }

    if (editingService) {
      
      toast.success('Service updated successfully');
    } else {
      
      toast.success('Service added successfully');
    }
    
    if (savedService) {
      sendNewsletterIfPublished('newsletter', savedService.title, savedService.shortDescription || savedService.title, savedService.status, editingService?.status, savedService?.iconImage);
    }
    
    setView('list');
    setEditingService(null);
  };


  const filteredServices = services.filter(s => 
    (s.title || '').toLowerCase().includes((searchTerm || '').toLowerCase())
  );

  if (view === 'form') {
    return (
      <div className="space-y-6 pb-12">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-primary-900 dark:text-white">
            {editingService ? 'Edit Service' : 'Add New Service'}
          </h2>
          <div className="flex space-x-3">
            {editingService && (
              <button 
                onClick={() => handleDelete(editingService.id)}
                className="px-4 py-2 border border-red-200 dark:border-red-800/30 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 font-medium transition-colors flex items-center"
              >
                <Trash2 size={18} className="mr-2" />
                Delete
              </button>
            )}
            <button 
              onClick={() => setView('list')}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="px-4 py-2 bg-gold-500 text-primary-900 rounded-xl font-bold hover:bg-gold-400"
            >
              Save Service
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Service Title *</label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={e => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gold-500 text-primary-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select
                value={formData.status || 'Active'}
                onChange={e => setFormData({...formData, status: e.target.value as 'Active' | 'Inactive'})}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gold-500 text-primary-900 dark:text-white"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Display Order</label>
              <input
                type="number"
                value={formData.displayOrder || 0}
                onChange={e => setFormData({...formData, displayOrder: parseInt(e.target.value)})}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gold-500 text-primary-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Icon/Image</label>
              <ImageUpload value={formData.iconImage || ''} onChange={url => setFormData({ ...formData, iconImage: url })} folder="services" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Short Description</label>
            <textarea
              value={formData.shortDescription || ''}
              onChange={e => setFormData({...formData, shortDescription: e.target.value})}
              rows={2}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gold-500 text-primary-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Description</label>
            <textarea
              value={formData.fullDescription || ''}
              onChange={e => setFormData({...formData, fullDescription: e.target.value})}
              rows={6}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gold-500 text-primary-900 dark:text-white"
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
          <h1 className="text-3xl font-bold text-primary-900 dark:text-white mb-2">Services Management</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage all services offered on the website.</p>
        </div>
        <button 
          onClick={() => { setFormData({ status: 'Active', displayOrder: 0 }); setView('form'); }}
          className="inline-flex items-center justify-center px-6 py-3 bg-gold-500 text-primary-900 font-bold rounded-xl hover:bg-gold-400"
        >
          <Plus size={20} className="mr-2" />
          Add Service
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
              placeholder="Search services..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-primary-900 dark:text-white focus:ring-2 focus:ring-gold-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Service</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Order</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {filteredServices.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No records found.
                  </td>
                </tr>
              ) : (
                filteredServices.map(service  => (
                  <tr key={service.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                        {service.iconImage ? (
                          <img src={service.iconImage} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <Briefcase className="h-full w-full p-2 text-gray-400" />
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-bold text-primary-900 dark:text-white">{service.title}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 max-w-xs truncate">{service.shortDescription}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{service.displayOrder}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${
                      service.status === 'Active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {service.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDuplicate(service)}
                      className="text-gray-400 hover:text-indigo-600 p-2"
                      title="Duplicate"
                    >
                      <Copy size={18} />
                    </button>
                    <button 
                      onClick={() => handleEdit(service)}
                      className="text-gray-400 hover:text-blue-600 p-2"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(service.id)}
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

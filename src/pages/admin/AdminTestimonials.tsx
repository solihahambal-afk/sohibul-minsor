import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Search, Edit2, Trash2, Quote, Star, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import ImageUpload from '../../components/ImageUpload';
import { apiClient } from '../../lib/apiClient';

interface Testimonial {
  id: string;
  author: string;
  role: string | null;
  content: string;
  rating: string;
  avatarUrl: string | null;
  isPublished: boolean;
  createdAt: string;
}

export default function AdminTestimonials() {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
  const [items, setItems] = useState<Testimonial[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Testimonial>>({
    rating: '5',
    isPublished: true,
  });

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = apiClient.from('testimonials').select('*').order('created_at', { ascending: false })
      .subscribe(({ data, error }) => {
        setIsLoading(false);
        if (error) {
          console.error('Error fetching data:', error);
          // toast.error('Database connection error');
        } else if (data) {
          setTestimonials(data);
        }
      });
    return () => { if (unsubscribe) unsubscribe(); };
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) return;
    try {
      const { error } = await apiClient.from('testimonials').delete().eq('id', id);
      if (error) throw error;
      toast.success('Testimonial deleted successfully');
      fetchTestimonials();
    } catch (err: any) {
      toast.error('Failed to delete testimonial');
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await apiClient.from('testimonials').update({ isPublished: !currentStatus }).eq('id', id);
      if (error) throw error;
      toast.success(currentStatus ? 'Testimonial unpublished' : 'Testimonial published');
      fetchTestimonials();
    } catch (err: any) {
      toast.error('Failed to update status');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.author || !formData.content) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const dataToSave = {
        author: formData.author,
        role: formData.role || null,
        content: formData.content,
        rating: formData.rating || '5',
        avatarUrl: formData.avatarUrl || null,
        isPublished: formData.isPublished ?? true,
      };

      if (editingItem) {
        const { error } = await apiClient.from('testimonials').update(dataToSave).eq('id', editingItem.id);
        if (error) throw error;
        toast.success('Testimonial updated successfully');
      } else {
        const { error } = await apiClient.from('testimonials').insert([dataToSave]);
        if (error) throw error;
        toast.success('Testimonial added successfully');
      }

      setView('list');
      setEditingItem(null);
      setFormData({ rating: '5', isPublished: true });
      fetchTestimonials();
    } catch (err: any) {
      toast.error('Failed to save testimonial');
      console.error(err);
    }
  };

  const filteredItems = items.filter(item => 
    item.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary-900 dark:text-white font-serif mb-2">Testimonials Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage client reviews and feedback</p>
        </div>
        {view === 'list' ? (
          <button
            onClick={() => {
              setEditingItem(null);
              setFormData({ rating: '5', isPublished: true });
              setView('form');
            }}
            className="flex items-center px-6 py-3 bg-gold-500 text-white rounded-xl hover:bg-gold-600 transition-colors shadow-lg hover:shadow-xl"
          >
            <Plus size={20} className="mr-2" />
            Add Testimonial
          </button>
        ) : (
          <button
            onClick={() => setView('list')}
            className="px-6 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300"
          >
            Cancel
          </button>
        )}
      </div>

      {view === 'list' ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search testimonials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gold-500 text-primary-900 dark:text-white"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Author</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Content</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Rating</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Status</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500"></div>
                      </div>
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No testimonials found
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      key={item.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {item.avatarUrl ? (
                            <img src={item.avatarUrl} alt={item.author} className="w-10 h-10 rounded-full object-cover mr-3" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center mr-3">
                              <span className="text-primary-700 dark:text-primary-300 font-medium text-sm">
                                {item.author.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-primary-900 dark:text-white">{item.author}</div>
                            {item.role && <div className="text-sm text-gray-500">{item.role}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 max-w-md">
                          {item.content}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-gold-500">
                          <Star size={16} className="fill-current mr-1" />
                          <span className="text-sm font-medium">{item.rating}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          item.isPublished 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {item.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleTogglePublish(item.id, item.isPublished)}
                            className="p-2 text-gray-400 hover:text-primary-600 bg-gray-50 dark:bg-gray-800 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-colors"
                            title={item.isPublished ? "Unpublish" : "Publish"}
                          >
                            {item.isPublished ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                          <button
                            onClick={() => {
                              setEditingItem(item);
                              setFormData({
                                author: item.author,
                                role: item.role,
                                content: item.content,
                                rating: item.rating,
                                avatarUrl: item.avatarUrl,
                                isPublished: item.isPublished,
                              });
                              setView('form');
                            }}
                            className="p-2 text-gray-400 hover:text-gold-600 bg-gray-50 dark:bg-gray-800 hover:bg-gold-50 dark:hover:bg-gold-900/30 rounded-lg transition-colors"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-gray-400 hover:text-red-600 bg-gray-50 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700"
        >
          <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Author Name *</label>
                <input
                  type="text"
                  required
                  value={formData.author || ''}
                  onChange={e => setFormData({ ...formData, author: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gold-500 text-primary-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role / Designation</label>
                <input
                  type="text"
                  value={formData.role || ''}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                  placeholder="e.g. Hajj Pilgrim 2023"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gold-500 text-primary-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Avatar Image</label>
                <ImageUpload value={formData.avatarUrl || ''} onChange={url => setFormData({ ...formData, avatarUrl: url })} folder="avatars" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rating</label>
                <select
                  value={formData.rating || '5'}
                  onChange={e => setFormData({ ...formData, rating: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gold-500 text-primary-900 dark:text-white"
                >
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Testimonial Content *</label>
              <textarea
                required
                rows={4}
                value={formData.content || ''}
                onChange={e => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gold-500 text-primary-900 dark:text-white resize-none"
              ></textarea>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPublished"
                checked={formData.isPublished !== false}
                onChange={e => setFormData({ ...formData, isPublished: e.target.checked })}
                className="w-4 h-4 text-gold-500 bg-gray-100 border-gray-300 rounded focus:ring-gold-500 dark:focus:ring-gold-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label htmlFor="isPublished" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                Publish immediately
              </label>
            </div>

            <div className="flex justify-end pt-6 border-t border-gray-100 dark:border-gray-700">
              <button
                type="submit"
                className="px-8 py-3 bg-gold-500 text-white font-medium rounded-xl hover:bg-gold-600 transition-colors shadow-lg shadow-gold-500/30"
              >
                {editingItem ? 'Update Testimonial' : 'Save Testimonial'}
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </div>
  );
}

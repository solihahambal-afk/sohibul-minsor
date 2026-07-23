import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Save, Upload, Plus, X, Image as ImageIcon, Trash2 } from 'lucide-react';
import ImageUpload from '../../components/ImageUpload';
import RichTextEditor from '../../components/admin/RichTextEditor';
import { NewsPost, NewsCategory } from '../../types/news';
import toast from 'react-hot-toast';

interface AdminNewsFormProps {
  initialData: NewsPost | null;
  onSave: (data: Partial<NewsPost>) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export default function AdminNewsForm({ initialData, onSave, onCancel, onDelete }: AdminNewsFormProps) {
  const isEditing = !!initialData;
  
  const [formData, setFormData] = useState<Partial<NewsPost>>({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    category: initialData?.category || 'News',
    featuredImage: initialData?.featuredImage || '',
    shortDescription: initialData?.shortDescription || '',
    fullContent: initialData?.fullContent || '',
    author: initialData?.author || 'Sohibulminsor Classic',
    datePublished: initialData?.datePublished || new Date().toISOString().slice(0, 16),
    featured: initialData?.featured || false,
    status: initialData?.status || 'Draft',
    gallery: initialData?.gallery || [],
  });

  const [notifySubscribers, setNotifySubscribers] = useState(false);

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData({
      ...formData,
      title,
      slug: isEditing ? formData.slug : generateSlug(title)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    if (notifySubscribers && formData.status === 'Published') {
      toast.success('Subscribers have been notified via email.');
    }
  };

  const addGalleryImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image is too large. Max 5MB allowed.');
      return;
    }
    const toastId = toast.loading('Uploading image...');
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
            if (w > h && w > 1920) { h *= 1920 / w; w = 1920; }
            else if (h > 1080) { w *= 1080 / h; h = 1080; }
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
      const url = await uploadImage(compressed, 'gallery');

      setFormData({
        ...formData,
        gallery: [...(formData.gallery || []), url]
      });
      toast.success('Image added to gallery', { id: toastId });
    } catch (err) {
      toast.error('Failed to upload image', { id: toastId });
    }
  };

  const removeGalleryImage = (index: number) => {
    const newGallery = [...(formData.gallery || [])];
    newGallery.splice(index, 1);
    setFormData({ ...formData, gallery: newGallery });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-12"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button 
            onClick={onCancel}
            className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-primary-900 dark:text-white">
              {isEditing ? 'Edit News Article' : 'Add New Article'}
            </h2>
          </div>
        </div>
        <div className="flex space-x-3">
          {isEditing && onDelete && (
            <button 
              type="button"
              onClick={onDelete}
              className="px-4 py-2 border border-red-200 dark:border-red-800/30 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 font-medium transition-colors flex items-center"
            >
              <Trash2 size={18} className="mr-2" />
              Delete
            </button>
          )}
          <button 
            onClick={onCancel}
            className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            className="px-4 py-2 bg-gold-500 text-primary-900 rounded-xl font-bold hover:bg-gold-400 transition-colors shadow-sm flex items-center"
          >
            <Save size={18} className="mr-2" />
            {isEditing ? 'Update Article' : 'Publish Article'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-bold text-primary-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">Basic Information</h3>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">News Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={handleTitleChange}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent text-primary-900 dark:text-white"
                  placeholder="Enter article title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent text-gray-500 dark:text-gray-400 font-mono text-sm"
                  placeholder="auto-generated-slug"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Short Summary</label>
                <textarea
                  rows={3}
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent text-primary-900 dark:text-white"
                  placeholder="Brief description for the news listing page (2-3 lines)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Content *</label>
                <RichTextEditor 
                  value={formData.fullContent || ''} 
                  onChange={(val) => setFormData({ ...formData, fullContent: val })}
                />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
              <h3 className="text-lg font-bold text-primary-900 dark:text-white">Gallery Images (Optional)</h3>
              <label className="text-sm text-gold-600 hover:text-gold-700 font-medium flex items-center cursor-pointer">
                <Plus size={16} className="mr-1" /> Add Image
                <input type="file" className="hidden" accept="image/*" onChange={addGalleryImage} />
              </label>
            </div>
            
            {(!formData.gallery || formData.gallery.length === 0) ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
                <ImageIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No additional images added.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {formData.gallery.map((img, index) => (
                  <div key={index} className="relative group rounded-xl overflow-hidden aspect-video bg-gray-100 dark:bg-gray-900">
                    <img src={img} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        type="button" 
                        onClick={() => removeGalleryImage(index)}
                        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Options */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-bold text-primary-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-700 pb-4">Publishing Options</h3>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Published' | 'Draft' })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gold-500 text-primary-900 dark:text-white"
                >
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as NewsCategory })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gold-500 text-primary-900 dark:text-white"
                >
                  <option value="Visa">Visa</option>
                  <option value="Hajj & Umrah">Hajj & Umrah</option>
                  <option value="Scholarships">Scholarships</option>
                  <option value="Promotions">Promotions</option>
                  <option value="Announcements">Announcements</option>
                  <option value="Success Stories">Success Stories</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Publish Date</label>
                <input
                  type="datetime-local"
                  value={formData.datePublished?.slice(0, 16)}
                  onChange={(e) => setFormData({ ...formData, datePublished: new Date(e.target.value).toISOString() })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gold-500 text-primary-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Author</label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gold-500 text-primary-900 dark:text-white"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      className="sr-only" 
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    />
                    <div className={`block w-10 h-6 rounded-full transition-colors ${formData.featured ? 'bg-gold-500' : 'bg-gray-200 dark:bg-gray-600'}`}></div>
                    <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.featured ? 'transform translate-x-4' : ''}`}></div>
                  </div>
                  <div className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Mark as Featured News
                  </div>
                </label>
              </div>

              {formData.status === 'Published' && (
                <div className="pt-2 pb-2 mt-2 border-t border-gray-100 dark:border-gray-700">
                  <label className="flex items-start cursor-pointer mt-2 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-100 dark:border-blue-900/30">
                    <input 
                      type="checkbox" 
                      className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 bg-white border-gray-300"
                      checked={notifySubscribers}
                      onChange={(e) => setNotifySubscribers(e.target.checked)}
                    />
                    <div className="ml-3 text-sm">
                      <span className="font-bold text-blue-900 dark:text-blue-300 block mb-0.5">Notify Subscribers by Email</span>
                      <span className="text-blue-700 dark:text-blue-400 text-xs">Send the article title, summary, and Read More link to all active subscribers.</span>
                    </div>
                  </label>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-bold text-primary-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-700 pb-4">Featured Image</h3>
            <div className="space-y-4">
              <ImageUpload value={formData.featuredImage || ''} onChange={(url) => setFormData({ ...formData, featuredImage: url })} folder="news" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Loader2, Upload } from 'lucide-react';
import { apiClient } from '../../lib/apiClient';
import toast from 'react-hot-toast';

interface GalleryImage {
  id: string;
  url: string;
  title: string;
  created_at: string;
  isUploading?: boolean;
}

export default function AdminGallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    setIsLoading(true);
    const { data, error } = await apiClient.from('gallery').select('*').execute();
    if (data) {
      setImages([...data].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()));
    }
    setIsLoading(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // 16. Validate and 17. Limit
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const validFiles: File[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!validTypes.includes(file.type)) {
        toast.error(`${file.name} is invalid. Only JPG, PNG, WEBP allowed.`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max 5MB allowed.`);
        continue;
      }
      // 18. Prevent duplicate uploads
      const isDuplicate = images.some(img => img.title === file.name);
      if (isDuplicate) {
        toast.error(`${file.name} is already in the gallery.`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) {
       if (fileInputRef.current) fileInputRef.current.value = '';
       return;
    }
    
    setIsUploading(true);
    const toastId = toast.loading(`Uploading ${validFiles.length} image(s)...`);
    
    // Optimistic previews
    const newPreviews = validFiles.map((file, i) => ({
      id: `temp-${Date.now()}-${i}`,
      title: file.name,
      url: URL.createObjectURL(file),
      created_at: new Date().toISOString(),
      isUploading: true
    }));
    setImages(prev => [...newPreviews, ...prev]);

    try {
      const { uploadImage, compressImage } = await import('../../lib/firebase');
      
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        
        const compressed = await compressImage(file);
        const url = await uploadImage(compressed, 'gallery');
        
        await apiClient.from('gallery').insert({
          title: file.name,
          url: url
        }).execute();
      }
      
      toast.success('Upload complete', { id: toastId });
      fetchImages();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to upload images.', { id: toastId });
      fetchImages(); // Refresh to remove failed temp images
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (false) return;
    
    const imageToDelete = images.find(img => img.id === id);
    if (imageToDelete?.url) {
      try {
        const { deleteImage } = await import('../../lib/firebase');
        await deleteImage(imageToDelete.url);
      } catch (e) { console.error(e); }
    }
    
    const toastId = toast.loading('Deleting image...');
    try {
      await apiClient.from('gallery').delete().eq('id', id).execute();
      toast.success('Image deleted', { id: toastId });
      setImages(images.filter(img => img.id !== id));
    } catch (err) {
      toast.error('Failed to delete image', { id: toastId });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-900 dark:text-white">Gallery Management</h1>
          <p className="text-gray-500 dark:text-gray-400">Upload and manage images for the website gallery.</p>
        </div>
        
        <div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleUpload} 
            accept="image/jpeg, image/png, image/webp" 
            multiple 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center px-4 py-2 bg-gold-600 text-white rounded-lg hover:bg-gold-700 transition-colors disabled:opacity-50"
          >
            {isUploading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Upload className="w-5 h-5 mr-2" />}
            Upload Images
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-gold-500" />
        </div>
      ) : images.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 text-center shadow-sm border border-gray-100 dark:border-gray-700">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-primary-900 dark:text-white mb-2">No Images Found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Upload images to populate the gallery.</p>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-2 bg-primary-900 text-white rounded-xl hover:bg-primary-800 transition-colors inline-flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" /> Upload First Image
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {images.map(img => (
            <div key={img.id} className="group relative rounded-xl overflow-hidden aspect-square bg-gray-100 dark:bg-gray-800">
              <img src={img.url} alt={img.title} className="w-full h-full object-cover" />
              
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                <p className="text-white text-xs truncate mb-2">{img.title}</p>
                <button 
                  onClick={() => handleDelete(img.id)}
                  className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 self-start transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

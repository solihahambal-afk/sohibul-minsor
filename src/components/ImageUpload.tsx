import React, { useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { uploadImage, compressImage, deleteImage } from '../lib/firebase';
import toast from 'react-hot-toast';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
}




export default function ImageUpload({ value, onChange, folder = 'uploads' }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [lastUploadedFile, setLastUploadedFile] = useState<{name: string, size: number} | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    // 16. Validate JPG, JPEG, PNG and WEBP
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload a JPG, PNG, or WEBP image.');
      if (e.target) e.target.value = '';
      return;
    }
    
    // 17. Limit uploads to 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image is too large. Max 5MB allowed.');
      if (e.target) e.target.value = '';
      return;
    }

    // 18. Prevent duplicate uploads
    if (lastUploadedFile && lastUploadedFile.name === file.name && lastUploadedFile.size === file.size) {
      toast.error('This image has already been uploaded.');
      if (e.target) e.target.value = '';
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setLocalPreview(previewUrl);
    setIsUploading(true);
    // 13. Add upload progress (simulated UI state)
    const toastId = toast.loading('Uploading image...');

    try {
      const compressedFile = await compressImage(file);
      const url = await uploadImage(compressedFile, folder);
      onChange(url);
      setLastUploadedFile({ name: file.name, size: file.size });
      // 14. Add success notifications
      toast.success('Image uploaded successfully', { id: toastId });
    } catch (error: any) {
      console.error('Upload error:', error);
      // 15. Display the real upload error instead of generic errors
      toast.error(error.message || 'Failed to upload image.', { id: toastId });
    } finally {
      setIsUploading(false);
      setLocalPreview(null);
      URL.revokeObjectURL(previewUrl);
      if (e.target) e.target.value = '';
    }
  };

  const displayUrl = localPreview || value;

  return (
    <div className="space-y-3">
      {displayUrl ? (
        <div className="relative inline-block border rounded-xl overflow-hidden bg-gray-100">
          <img src={displayUrl} alt="Uploaded preview" className="h-32 w-auto object-cover" />
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          )}
          {!isUploading && (
            <button type="button" onClick={() => {
              onChange('');
              setLastUploadedFile(null);
            }}
              className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-red-500 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {isUploading ? (
                <Loader2 className="w-8 h-8 mb-3 text-gold-500 animate-spin" />
              ) : (
                <Upload className="w-8 h-8 mb-3 text-gray-400" />
              )}
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-semibold">{isUploading ? 'Uploading...' : 'Click to upload'}</span>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">JPG, PNG, WEBP (Max 5MB)</p>
            </div>
            <input type="file" className="hidden" accept="image/jpeg, image/png, image/webp" onChange={handleFileChange} disabled={isUploading} />
          </label>
        </div>
      )}
      
      <div className="flex items-center space-x-2">
        <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">OR</span>
      </div>
      <input
        type="url"
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder="Paste image URL here"
        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gold-500 text-primary-900 dark:text-white text-sm"
      />
    </div>
  );
}
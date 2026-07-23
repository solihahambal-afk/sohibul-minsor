import React, { useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { uploadImage } from '../lib/firebase';
import toast from 'react-hot-toast';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
}


const compressImage = async (file: File): Promise<File> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1920;
        const MAX_HEIGHT = 1080;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const newFile = new File([blob], file.name, {
              type: file.type || 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(newFile);
          } else {
            resolve(file);
          }
        }, file.type || 'image/jpeg', 0.85);
      };
    };
  });
};

export default function ImageUpload({ value, onChange, folder = 'uploads' }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    // Validate size (e.g. max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image is too large. Max 5MB allowed.');
      return;
    }

    try {
      setIsUploading(true);
      const compressedFile = await compressImage(file);
      const url = await uploadImage(compressedFile, folder);
      onChange(url);
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image. You can also paste an image URL directly.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      {value ? (
        <div className="relative inline-block border rounded-xl overflow-hidden bg-gray-100">
          <img src={value} alt="Uploaded preview" className="h-32 w-auto object-cover" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-red-500 transition-colors"
          >
            <X size={16} />
          </button>
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
              <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, WEBP (Max 5MB)</p>
            </div>
            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={isUploading} />
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

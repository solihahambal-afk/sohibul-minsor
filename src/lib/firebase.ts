import imageCompression from 'browser-image-compression';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {}, (firebaseConfig as any).firestoreDatabaseId || '(default)');


export const uploadImage = async (file: File, folder: string = 'uploads'): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

export const deleteImage = async (url: string) => {
  // No-op for base64 images as they are deleted with the database record
  return Promise.resolve();
};

export const compressImage = async (file: File): Promise<File> => {
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') return file;
  if (file.size < 500 * 1024) return file;
  const options = {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 800,
    useWebWorker: true,
    fileType: 'image/webp'
  };
  try {
    const compressedBlob = await imageCompression(file, options);
    return new File([compressedBlob], file.name, { type: compressedBlob.type });
  } catch (error) {
    console.error('Compression error:', error);
    return file; // Fallback to original
  }
};

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {}, (firebaseConfig as any).firestoreDatabaseId || '(default)');
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const storage = getStorage(app);

export const uploadImage = async (file: File, folder: string = 'uploads') => {
  const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
  const storageRef = ref(storage, `${folder}/${fileName}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
};

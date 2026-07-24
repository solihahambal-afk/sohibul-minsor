import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

import serviceAccount from "../../credentials/sohibul-minsor-classic-firebase-adminsdk-fbsvc-47cb56270d.json";

const app =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp({
        credential: cert(serviceAccount as any),
      });

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import {getStorage} from 'firebase/storage';

// This is a special file that is only available on the server
// It is used to initialize the Firebase Admin SDK
let app: FirebaseApp;
if (!getApps().length) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApp();
}


const firestore = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export function getFirebase() {
    return { firestore, auth, storage, app };
}

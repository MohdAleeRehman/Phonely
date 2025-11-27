import admin from 'firebase-admin';

// Check if Firebase credentials are available
const hasFirebaseCredentials = 
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_STORAGE_BUCKET;

let firebaseApp = null;
let auth = null;
let storage = null;
let bucket = null;

if (hasFirebaseCredentials) {
  try {
    // Initialize Firebase Admin SDK
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    };

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });

    auth = admin.auth();
    storage = admin.storage();
    bucket = storage.bucket();

    console.log('✅ Firebase Admin initialized');
  } catch (error) {
    console.error('❌ Firebase initialization error:', error.message);
    console.log('ℹ️  Firebase features will be unavailable');
  }
} else {
  console.log('ℹ️  Firebase credentials not configured - using Cloudinary for storage');
}

export { auth, storage, bucket };
export default firebaseApp;

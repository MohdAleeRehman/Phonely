import admin from 'firebase-admin';

// Check if Firebase credentials are available
const hasFirebaseCredentials = 
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_STORAGE_BUCKET;

let firebaseApp = null;
let auth = null;
let storage = null;
let bucket = null;
let initError = null;

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
  } catch (error) {
    initError = error.message;
  }
}

// Export function to check Firebase status
export const checkFirebaseStatus = () => {
  if (initError) {
    console.error('❌ Firebase initialization error:', initError);
    console.log('ℹ️  Firebase features will be unavailable');
    return false;
  } else if (!hasFirebaseCredentials) {
    console.log('ℹ️  Firebase credentials not configured - using Cloudinary for storage');
    return false;
  } else {
    console.log('✅ Firebase Admin initialized');
    return true;
  }
};

export { auth, storage, bucket };
export default firebaseApp;

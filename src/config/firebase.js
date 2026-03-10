// src/config/firebase.js
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import {
  initializeAuth,
  getAuth,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  deleteUser
} from 'firebase/auth';
import { Capacitor } from '@capacitor/core';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// VAPID key for web push
export const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

// Export config for use in other files
export { firebaseConfig };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging
let messaging = null;

// Only initialize messaging in browser environment with service worker support
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.error('Failed to initialize Firebase Messaging:', error);
  }
}

// Initialize Firebase Auth with appropriate persistence for platform
// On iOS/Android, use browserLocalPersistence to avoid IndexedDB issues in WKWebView
let auth;
if (Capacitor.isNativePlatform()) {
  auth = initializeAuth(app, {
    persistence: browserLocalPersistence
  });
} else {
  auth = getAuth(app);
}

export {
  app,
  auth,
  messaging,
  getToken,
  onMessage,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  deleteUser
};
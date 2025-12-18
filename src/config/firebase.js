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

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyByYH4FwC9R6hQGSuK52s5LaHFIAm2yqWU",
  authDomain: "imasala-37b4d.firebaseapp.com",
  projectId: "imasala-37b4d",
  storageBucket: "imasala-37b4d.firebasestorage.app",
  messagingSenderId: "483793848610",
  appId: "1:483793848610:web:c0560b717161fc644c3d7b",
  measurementId: "G-ZW43QH5VD5"
};

// VAPID key for web push
export const VAPID_KEY = 'BAYiphZs1LM-QbQZeCPmJMnD2iUyLQJICexnaOcHfgVccCM8TlcgEVPuk82ClqtcBjQoE7Xu4z6XS75AYqbpZG0';

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
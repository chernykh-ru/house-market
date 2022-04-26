import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAa7QN1jt_sMYI1ZQJk-0eoFQdq5pYnMoo',
  authDomain: 'house-marketplace-app-4c980.firebaseapp.com',
  projectId: 'house-marketplace-app-4c980',
  storageBucket: 'house-marketplace-app-4c980.appspot.com',
  messagingSenderId: '167733449571',
  appId: '1:167733449571:web:04ac2ac801f1a5f1d0b956',
};

// const app = initializeApp(firebaseConfig);
initializeApp(firebaseConfig);
export const db = getFirestore()
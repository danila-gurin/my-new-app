import { getApp, getApps, initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCcruItc8pcgZDt86havWvULJ4lTStuIV0',
  authDomain: 'hairmax-386c3.firebaseapp.com',
  databaseURL: 'https://hairmax-386c3-default-rtdb.firebaseio.com',
  projectId: 'hairmax-386c3',
  storageBucket: 'hairmax-386c3.firebasestorage.app',
  messagingSenderId: '91669462935',
  appId: '1:91669462935:web:d575f7f73125248b21ced2',
  measurementId: 'G-T8X3X1RWG7',
};

console.log('Firebase Config:', firebaseConfig); // Add this line
console.log('Project ID:', firebaseConfig.projectId); // Add this line

const app = initializeApp(firebaseConfig);
console.log('Firebase App:', app); // Add this line

const db = getFirestore(app);

export { db };

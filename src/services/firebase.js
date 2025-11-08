
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDjgrbzsCeCeEzFLP0OMNSnfSqNyYzoRB8",
  authDomain: "proyectonoticiasikerharnisch.firebaseapp.com",
  projectId: "proyectonoticiasikerharnisch",
  storageBucket: "proyectonoticiasikerharnisch.firebasestorage.app",
  messagingSenderId: "519230577591",
  appId: "1:519230577591:web:6c026333d68465ba31e632"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
import { initializeApp } from 'firebase/app';
// importamos unicamente firestore (ya no usamos storage por el cobro)
import { getFirestore } from 'firebase/firestore';

// =========================================================
// reto 1: credenciales de firebase
// =========================================================
const firebaseConfig = {
  apiKey: "AIzaSyDdrllcu0_RUnG_GTgUtNA2kTf5ZOLjNAs",
  authDomain: "practica13-perfil-5189f.firebaseapp.com",
  projectId: "practica13-perfil-5189f",
  storageBucket: "practica13-perfil-5189f.firebasestorage.app",
  messagingSenderId: "1004167458975",
  appId: "1:1004167458975:web:71764cd5a9d6912e73f2aa"
};
// =========================================================

const app = initializeApp(firebaseConfig);

// inicializamos y exportamos firestore
export const db = getFirestore(app);
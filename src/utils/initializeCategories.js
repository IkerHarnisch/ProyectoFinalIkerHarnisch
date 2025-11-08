import { collection, query, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

/**
 * Categorías predefinidas del sistema
 */
const CATEGORIAS_INICIALES = [
  {
    nombre: 'Informativo',
    descripcion: 'Noticias y comunicados informativos'
  },
  {
    nombre: 'Nacional',
    descripcion: 'Noticias a nivel nacional'
  },
  {
    nombre: 'Entretenimiento',
    descripcion: 'Noticias de entretenimiento y cultura'
  },
  {
    nombre: 'Deportes',
    descripcion: 'Noticias deportivas'
  },
  {
    nombre: 'Tecnología',
    descripcion: 'Noticias de tecnología e innovación'
  },
  {
    nombre: 'Negocios',
    descripcion: 'Noticias de negocios y economía'
  }
];

/**
 * Inicializa las categorías en Firestore si no existen
 */
export const initializeCategories = async () => {
  try {
    // Verificar si ya existen secciones
    const q = query(collection(db, 'secciones'));
    const querySnapshot = await getDocs(q);

    // Si ya hay secciones, no hacer nada
    if (querySnapshot.size > 0) {
      console.log('✅ Las categorías ya existen en Firestore');
      return;
    }

    // Agregar las categorías iniciales
    console.log('📝 Agregando categorías iniciales...');
    for (const categoria of CATEGORIAS_INICIALES) {
      await addDoc(collection(db, 'secciones'), {
        ...categoria,
        fechaCreacion: new Date().toISOString()
      });
    }

    console.log('✅ Categorías iniciales agregadas correctamente');
  } catch (error) {
    console.error('❌ Error al inicializar categorías:', error);
  }
};

import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs,
  query,
  orderBy 
} from 'firebase/firestore';
import { db } from './firebase';


//Servicio para gestionar secciones/categorías de noticias


/**
 * Crea una nueva sección
 * @param {Object} seccion - Datos de la sección {nombre, descripcion}
 */
export const crearSeccion = async (seccion) => {
  try {
    const seccionData = {
      ...seccion,
      fechaCreacion: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, 'secciones'), seccionData);
    return { id: docRef.id, ...seccionData };
  } catch (error) {
    console.error('Error al crear sección:', error);
    throw error;
  }
};

/**
 * Actualiza una sección existente
 * @param {string} id - ID de la sección
 * @param {Object} seccion - Datos actualizados
 */
export const actualizarSeccion = async (id, seccion) => {
  try {
    const docRef = doc(db, 'secciones', id);
    await updateDoc(docRef, seccion);
    return { id, ...seccion };
  } catch (error) {
    console.error('Error al actualizar sección:', error);
    throw error;
  }
};

/**
 * Elimina una sección
 * @param {string} id - ID de la sección
 */
export const eliminarSeccion = async (id) => {
  try {
    await deleteDoc(doc(db, 'secciones', id));
  } catch (error) {
    console.error('Error al eliminar sección:', error);
    throw error;
  }
};

// Obtiene todas las secciones

export const obtenerSecciones = async () => {
  try {
    const q = query(collection(db, 'secciones'), orderBy('nombre', 'asc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener secciones:', error);
    throw error;
  }
};

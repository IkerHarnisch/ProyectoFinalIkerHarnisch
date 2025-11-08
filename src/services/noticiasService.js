import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { db } from './firebase';
import { CLOUDINARY_API_URL, CLOUDINARY_CONFIG } from './cloudinaryConfig';

/**
 * Crea una nueva noticia en Firestore
 * @param {Object} noticia - Datos de la noticia
 * @param {File} imagen - Archivo de imagen
 * @param {string} autorId - ID del autor
 * @param {string} autorNombre - Nombre del autor
 */
export const crearNoticia = async (noticia, imagen, autorId, autorNombre) => {
  try {
    let imagenUrl = '';
    
    // Subir imagen a Cloudinary si existe
    if (imagen) {
      imagenUrl = await subirImagenCloudinary(imagen);
    }

    // Crear documento de noticia
    const noticiaData = {
      ...noticia,
      imagenUrl,
      autorId,
      autorNombre,
      estado: 'Edición', // Estado inicial
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, 'noticias'), noticiaData);
    return { id: docRef.id, ...noticiaData };
  } catch (error) {
    console.error('Error al crear noticia:', error);
    throw error;
  }
};

/**
 * Actualiza una noticia existente
 * @param {string} id - ID de la noticia
 * @param {Object} noticia - Datos actualizados
 * @param {File} nuevaImagen - Nueva imagen (opcional)
 */
export const actualizarNoticia = async (id, noticia, nuevaImagen = null) => {
  try {
    let imagenUrl = noticia.imagenUrl;

    if (nuevaImagen) {
      imagenUrl = await subirImagenCloudinary(nuevaImagen);

    }

    const noticiaActualizada = {
      ...noticia,
      imagenUrl,
      fechaActualizacion: new Date().toISOString()
    };

    const docRef = doc(db, 'noticias', id);
    await updateDoc(docRef, noticiaActualizada);
    
    return { id, ...noticiaActualizada };
  } catch (error) {
    console.error('Error al actualizar noticia:', error);
    throw error;
  }
};

/**
 * Elimina una noticia
 * @param {string} id - ID de la noticia
 * @param {string} imagenUrl - URL de la imagen (no usada con Cloudinary)
 */
export const eliminarNoticia = async (id, imagenUrl) => {
  try {

    await deleteDoc(doc(db, 'noticias', id));
  } catch (error) {
    console.error('Error al eliminar noticia:', error);
    throw error;
  }
};

/**
 * Obtiene una noticia por su ID
 * @param {string} id - ID de la noticia
 */
export const obtenerNoticia = async (id) => {
  try {
    const docRef = doc(db, 'noticias', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error al obtener noticia:', error);
    throw error;
  }
};

export const obtenerTodasNoticias = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'noticias'));
    
    const noticias = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Ordenar por fecha de creación
    return noticias.sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));
  } catch (error) {
    console.error('Error al obtener noticias:', error);
    throw error;
  }
};

/**
 * Obtiene noticias de un autor especfico (para Reportero)
 * @param {string} autorId - ID del autor
 */
export const obtenerNoticiasPorAutor = async (autorId) => {
  try {
    const querySnapshot = await getDocs(collection(db, 'noticias'));
    
    const noticias = querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter(noticia => noticia.autorId === autorId);
    
    // Ordenar por fecha de creación
    return noticias.sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));
  } catch (error) {
    console.error('Error al obtener noticias por autor:', error);
    throw error;
  }
};

/**
 * Obtiene noticias publicadas (para frontend pblico)
 * @param {string} categoria - Categora opcional para filtrar
 */
export const obtenerNoticiasPublicadas = async (categoria = null) => {
  try {
    const querySnapshot = await getDocs(collection(db, 'noticias'));
    
    let noticias = querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter(noticia => noticia.estado === 'Publicado');
    
    // Filtrar por categora si se proporciona
    if (categoria) {
      noticias = noticias.filter(noticia => noticia.categoria === categoria);
    }
    
    // Ordenar por fecha de actualización
    return noticias.sort((a, b) => new Date(b.fechaActualizacion) - new Date(a.fechaActualizacion));
  } catch (error) {
    console.error('Error al obtener noticias publicadas:', error);
    throw error;
  }
};

/**
 * Cambia el estado de una noticia
 * @param {string} id - ID de la noticia
 * @param {string} nuevoEstado - Nuevo estado (Edición, Terminado, Publicado, Desactivado)
 */
export const cambiarEstadoNoticia = async (id, nuevoEstado) => {
  try {
    const docRef = doc(db, 'noticias', id);
    await updateDoc(docRef, {
      estado: nuevoEstado,
      fechaActualizacion: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error al cambiar estado de noticia:', error);
    throw error;
  }
};

/**
 * Sube una imagen a Cloudinary
 * @param {File} imagen - Archivo de imagen
 * @returns {string} URL de la imagen subida
 */
const subirImagenCloudinary = async (imagen) => {
  try {
    const formData = new FormData();
    formData.append('file', imagen);
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);

    const response = await fetch(CLOUDINARY_API_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Error al subir la imagen a Cloudinary');
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Error al subir imagen a Cloudinary:', error);
    throw error;
  }
};

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

const AuthContext = createContext();

/**
 * Hook personalizado para acceder al contexto de autenticación
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};

/**
 * Proveedor de contexto de autenticación
 * Gestiona el estado de autenticación del usuario y sus roles
 */
export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  /**
   * Registra un nuevo usuario con email, contraseña y rol
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña del usuario
   * @param {string} nombre - Nombre del usuario
   * @param {string} rol - Rol del usuario (Reportero o Editor)
   */
  const registrar = async (email, password, nombre, rol) => {
    try {
      const credenciales = await createUserWithEmailAndPassword(auth, email, password);
      
      // Guardar información adicional del usuario en Firestore
      await setDoc(doc(db, 'usuarios', credenciales.user.uid), {
        nombre,
        email,
        rol,
        fechaCreacion: new Date().toISOString()
      });

      return credenciales;
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      throw error;
    }
  };

  /**
   * Inicia sesión con email y contraseña
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña del usuario
   */
  const iniciarSesion = async (email, password) => {
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      throw error;
    }
  };

  /**
   * Cierra la sesión del usuario actual
   */
  const cerrarSesion = async () => {
    try {
      return await signOut(auth);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      throw error;
    }
  };

  /**
   * Obtiene la información adicional del usuario desde Firestore
   * @param {string} uid - ID del usuario
   */
  const obtenerDatosUsuario = async (uid) => {
    try {
      const docRef = doc(db, 'usuarios', uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return null;
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
      return null;
    }
  };

  // Observar cambios en el estado de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (usuarioAuth) => {
      if (usuarioAuth) {
        // Obtener datos adicionales del usuario
        const datosUsuario = await obtenerDatosUsuario(usuarioAuth.uid);
        setUsuario({
          uid: usuarioAuth.uid,
          email: usuarioAuth.email,
          ...datosUsuario
        });
      } else {
        setUsuario(null);
      }
      setCargando(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    usuario,
    registrar,
    iniciarSesion,
    cerrarSesion,
    cargando
  };

  return (
    <AuthContext.Provider value={value}>
      {!cargando && children}
    </AuthContext.Provider>
  );
};

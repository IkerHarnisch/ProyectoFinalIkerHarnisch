import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Componente para proteger rutas que requieren autenticación
 * Redirige a /login si el usuario no está autenticado
 * @param {Object} props - Props del componente
 * @param {React.ReactNode} props.children - Componentes hijos a renderizar si está autenticado
 */
const RutaProtegida = ({ children }) => {
  const { usuario } = useAuth();

  if (!usuario) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default RutaProtegida;

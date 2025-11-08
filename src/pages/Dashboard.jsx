import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  obtenerNoticiasPorAutor, 
  obtenerTodasNoticias,
  cambiarEstadoNoticia,
  eliminarNoticia 
} from '../services/noticiasService';

/*
 Dashboard principal que muestra diferentes vistas según el rol del usuario
 Reportero: ve sus propias noticias
 Editor: ve todas las noticias y puede gestionar su estado
 */
const Dashboard = () => {
  const { usuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [noticias, setNoticias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [refrescar, setRefrescar] = useState(0);

  // Cargar noticias según el rol del usuario y cuando se navega al dashboard
  useEffect(() => {
    if (usuario && usuario.uid) {
      cargarNoticias();
    }
  }, [usuario, refrescar, location.pathname]);

  const cargarNoticias = async () => {
    try {
      setCargando(true);
      setError('');
      
      let noticiasObtenidas;
      if (usuario.rol === 'Editor') {
        noticiasObtenidas = await obtenerTodasNoticias();
      } else {
        noticiasObtenidas = await obtenerNoticiasPorAutor(usuario.uid);
      }
      
      setNoticias(noticiasObtenidas);
    } catch (error) {
      console.error('Error al cargar noticias:', error);
      setError('Error al cargar las noticias');
    } finally {
      setCargando(false);
    }
  };

  const handleCerrarSesion = async () => {
    try {
      await cerrarSesion();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleCambiarEstado = async (noticiaId, nuevoEstado) => {
    try {
      await cambiarEstadoNoticia(noticiaId, nuevoEstado);
      await cargarNoticias();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      alert('Error al cambiar el estado de la noticia');
    }
  };

  const handleEliminar = async (noticiaId, imagenUrl) => {
    if (!window.confirm('¿Estás seguro de eliminar esta noticia?')) {
      return;
    }

    try {
      await eliminarNoticia(noticiaId, imagenUrl);
      await cargarNoticias();
    } catch (error) {
      console.error('Error al eliminar noticia:', error);
      alert('Error al eliminar la noticia');
    }
  };

  const obtenerEstiloEstado = (estado) => {
    const estilos = {
      'Edición': 'estado-edicion',
      'Terminado': 'estado-terminado',
      'Publicado': 'estado-publicado',
      'Desactivado': 'estado-desactivado'
    };
    return estilos[estado] || '';
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Panel de Administración</h1>
          <div className="user-info">
            <span>{usuario.nombre} ({usuario.rol})</span>
            <button onClick={handleCerrarSesion} className="btn-secondary">
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="dashboard-nav">
        <button onClick={() => navigate('/dashboard')} className="nav-link active">
          Mis Noticias
        </button>
        {usuario.rol === 'Reportero' && (
          <button onClick={() => navigate('/dashboard/nueva-noticia')} className="nav-link">
            Nueva Noticia
          </button>
        )}
        {usuario.rol === 'Editor' && (
          <button onClick={() => navigate('/dashboard/secciones')} className="nav-link">
            Gestionar Secciones
          </button>
        )}
        <button onClick={() => navigate('/')} className="nav-link">
          Ver Sitio Público
        </button>
      </nav>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-content">
          <h2>
            {usuario.rol === 'Editor' ? 'Todas las Noticias' : 'Mis Noticias'}
          </h2>

          {error && <div className="error-message">{error}</div>}

          {cargando ? (
            <div className="loading">Cargando noticias...</div>
          ) : noticias.length === 0 ? (
            <div className="empty-state">
              <p>No hay noticias disponibles.</p>
              <button 
                onClick={() => navigate('/dashboard/nueva-noticia')}
                className="btn-primary"
              >
                Crear Primera Noticia
              </button>
            </div>
          ) : (
            <div className="noticias-grid">
              {noticias.map((noticia) => (
                <div key={noticia.id} className="noticia-card">
                  {noticia.imagenUrl && (
                    <img 
                      src={noticia.imagenUrl} 
                      alt={noticia.titulo} 
                      className="noticia-imagen"
                    />
                  )}
                  
                  <div className="noticia-content">
                    <h3>{noticia.titulo}</h3>
                    <p className="noticia-subtitulo">{noticia.subtitulo}</p>
                    
                    <div className="noticia-meta">
                      <span className="categoria">{noticia.categoria}</span>
                      <span className={`estado ${obtenerEstiloEstado(noticia.estado)}`}>
                        {noticia.estado}
                      </span>
                    </div>

                    <p className="noticia-autor">
                      Por: {noticia.autorNombre}
                    </p>

                    {/* Acciones */}
                    <div className="noticia-actions">
                      <button
                        onClick={() => navigate(`/dashboard/editar-noticia/${noticia.id}`)}
                        className="btn-edit"
                      >
                        Editar
                      </button>

                      {/* Acciones del Reportero */}
                      {usuario.rol === 'Reportero' && noticia.estado === 'Edición' && (
                        <button
                          onClick={() => handleCambiarEstado(noticia.id, 'Terminado')}
                          className="btn-success"
                        >
                          Marcar como Terminado
                        </button>
                      )}

                      {/* Acciones del Editor */}
                      {usuario.rol === 'Editor' && (
                        <>
                          {noticia.estado === 'Terminado' && (
                            <button
                              onClick={() => handleCambiarEstado(noticia.id, 'Publicado')}
                              className="btn-success"
                            >
                              Publicar
                            </button>
                          )}
                          
                          {noticia.estado === 'Publicado' && (
                            <button
                              onClick={() => handleCambiarEstado(noticia.id, 'Desactivado')}
                              className="btn-warning"
                            >
                              Desactivar
                            </button>
                          )}
                          
                          {noticia.estado === 'Desactivado' && (
                            <button
                              onClick={() => handleCambiarEstado(noticia.id, 'Publicado')}
                              className="btn-success"
                            >
                              Reactivar
                            </button>
                          )}
                        </>
                      )}

                      <button
                        onClick={() => handleEliminar(noticia.id, noticia.imagenUrl)}
                        className="btn-delete"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

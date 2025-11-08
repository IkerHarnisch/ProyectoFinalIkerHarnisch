import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { obtenerNoticiasPublicadas } from '../services/noticiasService';
import { obtenerSecciones } from '../services/seccionesService';
import { useAuth } from '../context/AuthContext';

/*
 Página principal pública que muestra las noticias publicadas
 Accesible sin autenticación
 */
const Home = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [noticias, setNoticias] = useState([]);
  const [secciones, setSecciones] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, [categoriaSeleccionada]);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [noticiasObtenidas, seccionesObtenidas] = await Promise.all([
        obtenerNoticiasPublicadas(categoriaSeleccionada),
        obtenerSecciones()
      ]);
      
      setNoticias(noticiasObtenidas);
      setSecciones(seccionesObtenidas);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setCargando(false);
    }
  };

  const formatearFecha = (fechaISO) => {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="home">
      {/* Header */}
      <header className="home-header">
        <div className="header-content">
          <h1>Portal de Noticias Corporativas</h1>
          <nav className="header-nav">
            {usuario ? (
              <button 
                onClick={() => navigate('/dashboard')}
                className="btn-primary"
              >
                Ir al Dashboard
              </button>
            ) : (
              <>
                <Link to="/login" className="btn-secondary">
                  Iniciar Sesión
                </Link>
                <Link to="/registro" className="btn-primary">
                  Registrarse
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Filtro por categorías */}
      <section className="categorias-section">
        <div className="categorias-container">
          <button
            className={`categoria-btn ${!categoriaSeleccionada ? 'active' : ''}`}
            onClick={() => setCategoriaSeleccionada(null)}
          >
            Todas
          </button>
          {secciones.map((seccion) => (
            <button
              key={seccion.id}
              className={`categoria-btn ${categoriaSeleccionada === seccion.nombre ? 'active' : ''}`}
              onClick={() => setCategoriaSeleccionada(seccion.nombre)}
            >
              {seccion.nombre}
            </button>
          ))}
        </div>
      </section>

      {/* Noticias */}
      <main className="home-main">
        <div className="noticias-container">
          {cargando ? (
            <div className="loading">Cargando noticias...</div>
          ) : noticias.length === 0 ? (
            <div className="empty-state">
              <h2>No hay noticias publicadas</h2>
              <p>Vuelve pronto para ver las últimas novedades</p>
            </div>
          ) : (
            <div className="noticias-publicas-grid">
              {noticias.map((noticia) => (
                <article key={noticia.id} className="noticia-publica-card">
                  <Link to={`/noticia/${noticia.id}`} className="noticia-link">
                    {noticia.imagenUrl && (
                      <div className="noticia-imagen-container">
                        <img 
                          src={noticia.imagenUrl} 
                          alt={noticia.titulo}
                          className="noticia-imagen"
                        />
                      </div>
                    )}
                    
                    <div className="noticia-info">
                      <span className="noticia-categoria">{noticia.categoria}</span>
                      <h2 className="noticia-titulo">{noticia.titulo}</h2>
                      <p className="noticia-subtitulo">{noticia.subtitulo}</p>
                      
                      <div className="noticia-footer">
                        <span className="noticia-autor">Por {noticia.autorNombre}</span>
                        <span className="noticia-fecha">
                          {formatearFecha(noticia.fechaActualizacion)}
                        </span>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="home-footer">
        <p>&copy; 2025 Portal de Noticias Corporativas. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default Home;

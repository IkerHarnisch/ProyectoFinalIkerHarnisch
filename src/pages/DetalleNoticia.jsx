import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { obtenerNoticia } from '../services/noticiasService';


 //Página de detalle de una noticia individual

const DetalleNoticia = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [noticia, setNoticia] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarNoticia();
  }, [id]);

  const cargarNoticia = async () => {
    try {
      setCargando(true);
      const noticiaObtenida = await obtenerNoticia(id);
      
      if (!noticiaObtenida) {
        setError('Noticia no encontrada');
      } else if (noticiaObtenida.estado !== 'Publicado') {
        setError('Esta noticia no está disponible públicamente');
      } else {
        setNoticia(noticiaObtenida);
      }
    } catch (error) {
      console.error('Error al cargar noticia:', error);
      setError('Error al cargar la noticia');
    } finally {
      setCargando(false);
    }
  };

  const formatearFecha = (fechaISO) => {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (cargando) {
    return (
      <div className="detalle-noticia">
        <div className="loading">Cargando noticia...</div>
      </div>
    );
  }

  if (error || !noticia) {
    return (
      <div className="detalle-noticia">
        <div className="error-container">
          <h2>{error || 'Noticia no encontrada'}</h2>
          <Link to="/" className="btn-primary">
            Volver al Inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="detalle-noticia">
      {/* Header */}
      <header className="detalle-header">
        <div className="header-content">
          <button 
            onClick={() => navigate('/')}
            className="btn-back"
          >
            ← Volver
          </button>
          <Link to="/" className="logo-link">
            Portal de Noticias
          </Link>
        </div>
      </header>

      {/* Contenido de la noticia */}
      <article className="noticia-detalle">
        <div className="noticia-detalle-container">
          {/* Categoría */}
          <div className="noticia-categoria-tag">
            {noticia.categoria}
          </div>

          {/* Título y subtítulo */}
          <h1 className="noticia-detalle-titulo">{noticia.titulo}</h1>
          <h2 className="noticia-detalle-subtitulo">{noticia.subtitulo}</h2>

          {/* Meta información */}
          <div className="noticia-detalle-meta">
            <div className="meta-info">
              <span className="autor">Por <strong>{noticia.autorNombre}</strong></span>
              <span className="separador">•</span>
              <span className="fecha">{formatearFecha(noticia.fechaActualizacion)}</span>
            </div>
          </div>

          {/* Imagen */}
          {noticia.imagenUrl && (
            <div className="noticia-detalle-imagen">
              <img src={noticia.imagenUrl} alt={noticia.titulo} />
            </div>
          )}

          {/* Contenido */}
          <div className="noticia-detalle-contenido">
            {noticia.contenido.split('\n').map((parrafo, index) => (
              parrafo.trim() && <p key={index}>{parrafo}</p>
            ))}
          </div>

          {/* Footer */}
          <div className="noticia-detalle-footer">
            <button 
              onClick={() => navigate('/')}
              className="btn-primary"
            >
              Ver más noticias
            </button>
          </div>
        </div>
      </article>
    </div>
  );
};

export default DetalleNoticia;

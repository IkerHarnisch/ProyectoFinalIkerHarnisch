import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  crearNoticia, 
  actualizarNoticia, 
  obtenerNoticia 
} from '../services/noticiasService';
import { obtenerSecciones } from '../services/seccionesService';

/**
 * Formulario para crear y editar noticias
 */
const FormularioNoticia = () => {
  const { id } = useParams(); // Si hay ID, es edición
  const { usuario } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    titulo: '',
    subtitulo: '',
    contenido: '',
    categoria: ''
  });
  const [imagen, setImagen] = useState(null);
  const [imagenPreview, setImagenPreview] = useState('');
  const [secciones, setSecciones] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  // Cargar secciones y noticia si es edición
  useEffect(() => {
    cargarSecciones();
    if (id) {
      cargarNoticia();
    }
  }, [id]);

  const cargarSecciones = async () => {
    try {
      const seccionesObtenidas = await obtenerSecciones();
      setSecciones(seccionesObtenidas);
      
      // Establecer categoría por defecto si hay secciones
      if (seccionesObtenidas.length > 0 && !formData.categoria) {
        setFormData(prev => ({
          ...prev,
          categoria: seccionesObtenidas[0].nombre
        }));
      }
    } catch (error) {
      console.error('Error al cargar secciones:', error);
    }
  };

  const cargarNoticia = async () => {
    try {
      const noticia = await obtenerNoticia(id);
      if (noticia) {
        setFormData({
          titulo: noticia.titulo,
          subtitulo: noticia.subtitulo,
          contenido: noticia.contenido,
          categoria: noticia.categoria
        });
        setImagenPreview(noticia.imagenUrl);
      }
    } catch (error) {
      console.error('Error al cargar noticia:', error);
      setError('Error al cargar la noticia');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImagenChange = (e) => {
    const archivo = e.target.files[0];
    if (archivo) {
      setImagen(archivo);
      
      // Crear preview de la imagen
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagenPreview(reader.result);
      };
      reader.readAsDataURL(archivo);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.titulo || !formData.subtitulo || !formData.contenido || !formData.categoria) {
      setError('Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      setCargando(true);
      setError('');

      if (id) {
        // Actualizar noticia existente
        const noticiaActual = await obtenerNoticia(id);
        await actualizarNoticia(id, {
          ...formData,
          imagenUrl: noticiaActual.imagenUrl
        }, imagen);
      } else {
        // Crear nueva noticia
        await crearNoticia(
          formData,
          imagen,
          usuario.uid,
          usuario.nombre
        );
      }

      navigate('/dashboard');
    } catch (error) {
      console.error('Error al guardar noticia:', error);
      setError('Error al guardar la noticia. Intenta nuevamente.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="formulario-container">
      <div className="formulario-header">
        <h1>{id ? 'Editar Noticia' : 'Nueva Noticia'}</h1>
        <button 
          onClick={() => navigate('/dashboard')} 
          className="btn-secondary"
        >
          Volver
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="formulario-noticia">
        <div className="form-group">
          <label htmlFor="titulo">Título *</label>
          <input
            type="text"
            id="titulo"
            name="titulo"
            value={formData.titulo}
            onChange={handleChange}
            placeholder="Título de la noticia"
            disabled={cargando}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="subtitulo">Subtítulo *</label>
          <input
            type="text"
            id="subtitulo"
            name="subtitulo"
            value={formData.subtitulo}
            onChange={handleChange}
            placeholder="Subtítulo o bajante"
            disabled={cargando}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="categoria">Categoría *</label>
          <select
            id="categoria"
            name="categoria"
            value={formData.categoria}
            onChange={handleChange}
            disabled={cargando}
            required
          >
            <option value="">Selecciona una categoría</option>
            {secciones.map((seccion) => (
              <option key={seccion.id} value={seccion.nombre}>
                {seccion.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="contenido">Contenido *</label>
          <textarea
            id="contenido"
            name="contenido"
            value={formData.contenido}
            onChange={handleChange}
            placeholder="Escribe el contenido de la noticia..."
            rows="10"
            disabled={cargando}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="imagen">Imagen (Opcional)</label>
          <input
            type="file"
            id="imagen"
            accept="image/*"
            onChange={handleImagenChange}
            disabled={cargando}
          />
          {imagenPreview && (
            <div className="imagen-preview">
              <img src={imagenPreview} alt="Preview" />
            </div>
          )}
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="btn-primary"
            disabled={cargando}
          >
            {cargando ? 'Guardando...' : (id ? 'Actualizar Noticia' : 'Crear Noticia')}
          </button>
          <button 
            type="button"
            onClick={() => navigate('/dashboard')} 
            className="btn-secondary"
            disabled={cargando}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormularioNoticia;

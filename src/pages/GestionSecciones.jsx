import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  obtenerSecciones, 
  crearSeccion, 
  actualizarSeccion,
  eliminarSeccion 
} from '../services/seccionesService';


 //Página para gestionar secciones/categorías de noticias
 //Solo accesible para usuarios con rol Editor

const GestionSecciones = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [secciones, setSecciones] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [seccionEditando, setSeccionEditando] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: ''
  });
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  // Verificar que el usuario sea Editor
  useEffect(() => {
    if (usuario.rol !== 'Editor') {
      navigate('/dashboard');
    }
    cargarSecciones();
  }, [usuario, navigate]);

  const cargarSecciones = async () => {
    try {
      const seccionesObtenidas = await obtenerSecciones();
      setSecciones(seccionesObtenidas);
    } catch (error) {
      console.error('Error al cargar secciones:', error);
      setError('Error al cargar las secciones');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nombre) {
      setError('El nombre de la sección es obligatorio');
      return;
    }

    try {
      setCargando(true);
      setError('');

      if (seccionEditando) {
        await actualizarSeccion(seccionEditando.id, formData);
      } else {
        await crearSeccion(formData);
      }

      setFormData({ nombre: '', descripcion: '' });
      setSeccionEditando(null);
      setMostrarFormulario(false);
      await cargarSecciones();
    } catch (error) {
      console.error('Error al guardar sección:', error);
      setError('Error al guardar la sección');
    } finally {
      setCargando(false);
    }
  };

  const handleEditar = (seccion) => {
    setSeccionEditando(seccion);
    setFormData({
      nombre: seccion.nombre,
      descripcion: seccion.descripcion || ''
    });
    setMostrarFormulario(true);
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta sección?')) {
      return;
    }

    try {
      await eliminarSeccion(id);
      await cargarSecciones();
    } catch (error) {
      console.error('Error al eliminar sección:', error);
      alert('Error al eliminar la sección');
    }
  };

  const handleCancelar = () => {
    setFormData({ nombre: '', descripcion: '' });
    setSeccionEditando(null);
    setMostrarFormulario(false);
    setError('');
  };

  return (
    <div className="gestion-secciones">
      <div className="formulario-header">
        <h1>Gestión de Secciones</h1>
        <button 
          onClick={() => navigate('/dashboard')} 
          className="btn-secondary"
        >
          Volver al Dashboard
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {!mostrarFormulario ? (
        <button 
          onClick={() => setMostrarFormulario(true)} 
          className="btn-primary"
        >
          Nueva Sección
        </button>
      ) : (
        <div className="formulario-seccion">
          <h2>{seccionEditando ? 'Editar Sección' : 'Nueva Sección'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="nombre">Nombre *</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej: Tecnología, Deportes, Política"
                disabled={cargando}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="descripcion">Descripción</label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                placeholder="Descripción opcional de la sección"
                rows="3"
                disabled={cargando}
              />
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="btn-primary"
                disabled={cargando}
              >
                {cargando ? 'Guardando...' : (seccionEditando ? 'Actualizar' : 'Crear')}
              </button>
              <button 
                type="button"
                onClick={handleCancelar} 
                className="btn-secondary"
                disabled={cargando}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="secciones-lista">
        <h2>Secciones Existentes</h2>
        {secciones.length === 0 ? (
          <p>No hay secciones creadas aún.</p>
        ) : (
          <div className="secciones-grid">
            {secciones.map((seccion) => (
              <div key={seccion.id} className="seccion-card">
                <h3>{seccion.nombre}</h3>
                {seccion.descripcion && (
                  <p className="seccion-descripcion">{seccion.descripcion}</p>
                )}
                <div className="seccion-actions">
                  <button
                    onClick={() => handleEditar(seccion)}
                    className="btn-edit"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleEliminar(seccion.id)}
                    className="btn-delete"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GestionSecciones;

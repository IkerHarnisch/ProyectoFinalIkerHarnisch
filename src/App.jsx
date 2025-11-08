import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import RutaProtegida from './components/RutaProtegida';
import { initializeCategories } from './utils/initializeCategories';

// Páginas públicas
import Home from './pages/Home';
import DetalleNoticia from './pages/DetalleNoticia';
import Login from './pages/Login';
import Registro from './pages/Registro';

// Páginas privadas (requieren autenticación)
import Dashboard from './pages/Dashboard';
import FormularioNoticia from './pages/FormularioNoticia';
import GestionSecciones from './pages/GestionSecciones';

import './App.css';

/*
 Componente principal de la aplicación
 Configura las rutas y el contexto de autenticación
 */
function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}


// Componente de rutas que inicializa categorías

function AppRouter() {
  useEffect(() => {
    initializeCategories();
  }, []);

  return (
    <Router>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/noticia/:id" element={<DetalleNoticia />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />

          {/* Rutas protegidas (requieren autenticación) */}
          <Route 
            path="/dashboard" 
            element={
              <RutaProtegida>
                <Dashboard />
              </RutaProtegida>
            } 
          />
          <Route 
            path="/dashboard/nueva-noticia" 
            element={
              <RutaProtegida>
                <FormularioNoticia />
              </RutaProtegida>
            } 
          />
          <Route 
            path="/dashboard/editar-noticia/:id" 
            element={
              <RutaProtegida>
                <FormularioNoticia />
              </RutaProtegida>
            } 
          />
          <Route 
            path="/dashboard/secciones" 
            element={
              <RutaProtegida>
                <GestionSecciones />
              </RutaProtegida>
            } 
          />

          {/* Ruta por defecto (redirige a home) */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    );
}

export default App;

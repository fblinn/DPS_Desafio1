'use client';

import { useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { eliminarPelicula, cambiarEstadoPelicula } from '@/redux/slices/peliculasSlice'; 
import { Pelicula } from '@/types/pelicula';
import Buscador from '@/components/Buscador';
import Filtros, { FiltrosState, FILTROS_INICIALES, TODOS } from '@/components/Filtros';
import TablaPeliculas from '@/components/TablaPeliculas';
import FormularioPelicula from '@/components/FormularioPelicula';

export default function Home() {
  const dispatch = useAppDispatch();
  const peliculas = useAppSelector((state) => state.peliculas.lista);  // Obtiene la lista de pelis almacenadas en Redux

  const [busqueda, setBusqueda] = useState(''); // Estado para el texto ingresado en el buscador
  const [filtros, setFiltros] = useState<FiltrosState>(FILTROS_INICIALES); 
  const [modalAbierto, setModalAbierto] = useState(false);
  const [peliculaEditar, setPeliculaEditar] = useState<Pelicula | null>(null);

  // Filtra las películas según la búsqueda y los filtros 
  const peliculasFiltradas = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();

    return peliculas.filter((p) => {
      const coincideBusqueda =
        termino === '' ||
        p.nombre.toLowerCase().includes(termino) ||
        p.genero.toLowerCase().includes(termino) ||
        p.salaAsignada.toLowerCase().includes(termino);

      const coincideGenero = filtros.genero === TODOS || p.genero === filtros.genero;
      const coincideClasificacion =
        filtros.clasificacion === TODOS || p.clasificacion === filtros.clasificacion;
      const coincideSala = filtros.sala === TODOS || p.salaAsignada === filtros.sala;
      const coincideEstado = filtros.estado === TODOS || p.estado === filtros.estado;

      return (
        coincideBusqueda &&
        coincideGenero &&
        coincideClasificacion &&
        coincideSala &&
        coincideEstado
      );
    });
  }, [peliculas, busqueda, filtros]);

  // Abre el form para registrar peli
  const abrirAgregar = () => {
    setPeliculaEditar(null);
    setModalAbierto(true);
  };

  // Abre el form para editar peli
  const abrirEditar = (pelicula: Pelicula) => {
    setPeliculaEditar(pelicula);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setPeliculaEditar(null);
  };

  // Elimina una peli
  const handleEliminar = (id: string) => {
    if (confirm('¿Eliminar esta película?')) {
      dispatch(eliminarPelicula(id));
    }
  };

  return (
    <div className="app-shell">
      <nav className="navbar">
        <div className="navbar-left">
          <span className="brand">CINEFLIX</span>
          <ul className="nav-links">
            <li>Inicio</li>
            <li className="active">Películas</li>          
            <li>Ventas</li>
            <li>Configuración</li>
          </ul>
        </div>
      </nav>

      {/* Muestra cuántas pelis cumplen los filtros */}
      <main className="main-content">
        <h1 className="page-title">Gestión de Películas</h1>
        <p className="page-subtitle">
          {peliculasFiltradas.length} de {peliculas.length} películas
        </p>

        <div className="toolbar">
          <div className="toolbar-filters">
            <Buscador valor={busqueda} onChange={setBusqueda} />
            <Filtros peliculas={peliculas} filtros={filtros} onChange={setFiltros} />
          </div>
          <button className="btn-primary" onClick={abrirAgregar}>
            + Agregar película
          </button>
        </div>

        <TablaPeliculas
          peliculas={peliculasFiltradas}
          onEditar={abrirEditar}
          onEliminar={handleEliminar}
          onToggleEstado={(id) => dispatch(cambiarEstadoPelicula(id))}
        />
      </main>

      {modalAbierto && (
        <FormularioPelicula peliculaEditar={peliculaEditar} onClose={cerrarModal} />
      )}
    </div>
  );
}

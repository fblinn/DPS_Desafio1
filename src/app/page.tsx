'use client';

import { useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { eliminarPelicula, cambiarEstadoPelicula } from '@/redux/slices/peliculasSlice';
import { Pelicula } from '@/types/pelicula';
import Buscador from '@/components/Buscador';
import Filtros, { FiltrosState, FILTROS_INICIALES, TODOS } from '@/components/Filtros';
import TablaPeliculas from '@/components/TablaPeliculas';
import FormularioPelicula from '@/components/FormularioPelicula';
import Dashboard from '@/components/Dashboard';
import ModalSeleccionPelicula from '@/components/ModalSeleccionPelicula';
import ModalDetallePelicula from '@/components/ModalDetallePelicula';
import { FuncionConSala } from '@/redux/slices/salasSlice';
import { abrirModal } from '@/redux/slices/asientoSlice';
import MapaAsientos from '@/components/MapaAsientos';
import HistorialVentas from '@/components/HistorialVentas';

// Vistas en el nav. "ventas", "inicio" y "configuracion" son
// placeholders por ahora cada una va llenando la suya.
type Vista = 'inicio' | 'peliculas' | 'ventas' | 'configuracion';

export default function Home() {
  const dispatch = useAppDispatch();
  const peliculas = useAppSelector((state) => state.peliculas.lista); // Obtiene la lista de pelis almacenadas en Redux

  const [vista, setVista] = useState<Vista>('peliculas'); // Controla qué sección del nav se muestra

  const [busqueda, setBusqueda] = useState(''); // Estado para el texto ingresado en el buscador
  const [filtros, setFiltros] = useState<FiltrosState>(FILTROS_INICIALES);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [peliculaEditar, setPeliculaEditar] = useState<Pelicula | null>(null);
  const [pasoVenta, setPasoVenta] = useState<'cerrado' | 'peliculas' | 'detalle'>('cerrado');
  const [peliculaSeleccionada, setPeliculaSeleccionada] = useState<Pelicula | null>(null);

  // Filtra las películas según la búsqueda y los filtros
  const peliculasFiltradas = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();

    return peliculas.filter((p: { nombre: string; genero: string; salaAsignada: string; clasificacion: string; estado: string; }) => {
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

  //Funciones para el flujo de venta
  const handleNuevaVenta = () => {
    setPasoVenta('peliculas');
  };
  const cerrarFlujoVenta = () => {
    setPasoVenta('cerrado');
    setPeliculaSeleccionada(null);
  };

  const handleSeleccionarFuncion = (funcion: FuncionConSala) => {
    // Antes se descartaba la función elegida (abrirModal() sin payload).
    // Ahora se le pasa toda la info que MapaAsientos necesita para poder
    // armar la Reserva completa al confirmar la compra.
    dispatch(
      abrirModal({
        peliculaId: funcion.peliculaId,
        salaId: funcion.salaId,
        salaNombre: funcion.salaNombre,
        fecha: funcion.fecha,
        hora: funcion.hora,
      })
    );

    cerrarFlujoVenta();
  };


  return (
    <div className="app-shell">
      <nav className="navbar">
        <div className="navbar-left">
          <span className="brand">CINEFLIX</span>
          <ul className="nav-links">
            <li className={vista === 'inicio' ? 'active' : ''} onClick={() => setVista('inicio')}>
              Inicio
            </li>
            <li
              className={vista === 'peliculas' ? 'active' : ''}
              onClick={() => setVista('peliculas')}
            >
              Películas
            </li>
            <li className={vista === 'ventas' ? 'active' : ''} onClick={() => setVista('ventas')}>
              Ventas
            </li>
            <li
              className={vista === 'configuracion' ? 'active' : ''}
              onClick={() => setVista('configuracion')}
            >
              Configuración
            </li>
          </ul>
        </div>
      </nav>

      <main className="main-content">
        {/* ---------- Vista: Películas ---------- */}
        {vista === 'peliculas' && (
          <>
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
          </>
        )}

        {/* ---------- Vista: Inicio (aqui pondremos algun carrousel) ---------- */}
        {vista === 'inicio' && (
          <>
            <h1 className="page-title">Inicio</h1>
          </>
        )}

        {/* ---------- Vista: Ventas */}
        {vista === 'ventas' && <Dashboard onNuevaVenta={handleNuevaVenta} />}

        {/* ---------- Vista: Configuración (aquí vive el historial de ventas) ---------- */}
        {vista === 'configuracion' && <HistorialVentas />}
      </main>

      {modalAbierto && (
        <FormularioPelicula peliculaEditar={peliculaEditar} onClose={cerrarModal} />
      )}

      {pasoVenta === 'peliculas' && (
        <ModalSeleccionPelicula
          peliculas={peliculas}
          onSeleccionar={(pelicula) => {
            setPeliculaSeleccionada(pelicula);
            setPasoVenta('detalle');
          }}
          onClose={() => setPasoVenta('cerrado')}
        />
      )}

      {pasoVenta === 'detalle' && peliculaSeleccionada && (
        <ModalDetallePelicula
          pelicula={peliculaSeleccionada}
          onSeleccionarFuncion={handleSeleccionarFuncion}
          onVolver={() => setPasoVenta('peliculas')}
          onClose={cerrarFlujoVenta}
        />
      )}

      <MapaAsientos onCompraConfirmada={() => setVista('configuracion')} />
    </div>

  );
}
"use client";

import { useSelector } from "react-redux";
import { Pelicula } from "@/types/pelicula";
import { selectFuncionesPorPelicula, FuncionConSala } from "@/redux/slices/salasSlice";

interface ModalDetallePeliculaProps {
  pelicula: Pelicula;
  onSeleccionarFuncion: (funcion: FuncionConSala) => void;
  onVolver: () => void;
  onClose: () => void;
}

export default function ModalDetallePelicula({
  pelicula,
  onSeleccionarFuncion,
  onVolver,
  onClose,
}: ModalDetallePeliculaProps) {
  const funciones = useSelector(selectFuncionesPorPelicula(pelicula.id));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card modal-card-ancho"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title">Detalle Película y Funciones</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="detalle-pelicula-info">
          <div className="pelicula-card-poster detalle-poster">🎬</div>
          <div>
            <h3 className="detalle-pelicula-nombre">{pelicula.nombre}</h3>
            <p className="detalle-pelicula-meta">
              {pelicula.genero}
              {/* TODO: si tu Pelicula tiene "clasificacion" y quieres mostrarla aquí:
                  {" "}· {pelicula.clasificacion} */}
            </p>
          </div>
        </div>

        <h4 className="detalle-funciones-titulo">Funciones</h4>

        {funciones.length === 0 ? (
          <p className="dashboard-sin-datos">
            Esta película no tiene funciones programadas todavía.
          </p>
        ) : (
          <div className="table-wrapper">
            <table className="peliculas-table">
              <thead>
                <tr>
                  <th>Sala</th>
                  <th>Formato</th>
                  <th>Idioma</th>
                  <th>Hora</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {funciones.map((funcion) => (
                  <tr key={funcion.id}>
                    <td>{funcion.salaNombre}</td>
                    <td>{funcion.formato}</td>
                    <td>{funcion.idioma}</td>
                    <td>{funcion.hora}</td>
                    <td>
                      <button
                        className="btn-primary btn-seleccionar-funcion"
                        onClick={() => onSeleccionarFuncion(funcion)}
                      >
                        Seleccionar Función
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="form-actions">
          <button className="btn-secondary" onClick={onVolver}>
            ← Volver
          </button>
        </div>
      </div>
    </div>
  );
}
"use client";

import { Pelicula } from "@/types/pelicula";

interface ModalSeleccionarPeliculaProps {
  peliculas: Pelicula[];
  onSeleccionar: (pelicula: Pelicula) => void;
  onClose: () => void;
}

export default function ModalSeleccionarPelicula({
  peliculas,
  onSeleccionar,
  onClose,
}: ModalSeleccionarPeliculaProps) {
  // Solo mostramos películas disponibles para vender entradas
  const peliculasDisponibles = peliculas.filter((p) => p.estado === "disponible");

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card modal-card-ancho"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title">Seleccionar Película</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {peliculasDisponibles.length === 0 ? (
          <p className="dashboard-sin-datos">No hay películas disponibles.</p>
        ) : (
          <div className="peliculas-grid">
            {peliculasDisponibles.map((pelicula) => (
              <button
                key={pelicula.id}
                className="pelicula-card"
                onClick={() => onSeleccionar(pelicula)}
              >
                <div className="pelicula-card-poster">
                  {pelicula.posterImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={pelicula.posterImage}
                      alt={pelicula.nombre}
                      className="pelicula-card-poster-img"
                    />
                  ) : (
                    "🎬"
                  )}
                </div>
                <span className="pelicula-card-nombre">{pelicula.nombre}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
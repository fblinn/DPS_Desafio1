'use client';

import { Pelicula } from '@/types/pelicula';

interface PeliculaFilaProps {
  pelicula: Pelicula;
  onEditar: (pelicula: Pelicula) => void;
  onEliminar: (id: string) => void;
  onToggleEstado: (id: string) => void;
}

// representa una fila de la tabla de películas
export default function PeliculaFila({
  pelicula,
  onEditar,
  onEliminar,
  onToggleEstado,
}: PeliculaFilaProps) {
  // Obtiene inicial del nombre para mostrarla como póster
  const inicial = pelicula.nombre.charAt(0).toUpperCase();

  return (
    <tr>
      <td>
        <div
          className="poster-swatch"
          style={{ background: pelicula.posterColor || '#333' }}
        >
          {inicial}
        </div>
      </td>
      <td>
        <div className="movie-name">{pelicula.nombre}</div>
        <div className="movie-code">{pelicula.codigo}</div>
      </td>
       {/* Información */}
      <td>{pelicula.genero}</td>
      <td>{pelicula.duracion} min</td>
      <td>{pelicula.clasificacion}</td>
      <td>{pelicula.salaAsignada}</td>
      <td>${pelicula.precio.toFixed(2)}</td>
      <td>
        {/* Botón para cambiar el estado de la peli */}
        <button
          className={`badge badge-clickable ${
            pelicula.estado === 'disponible' ? 'disponible' : 'no-disponible'
          }`}
          onClick={() => onToggleEstado(pelicula.id)}
          title="Cambiar estado"
        >
          <span className="badge-dot" />
          {pelicula.estado === 'disponible' ? 'Disponible' : 'No disponible'}
        </button>
      </td>

       {/* Acciones disponibles para la película */}
      <td>
        <div className="row-actions">
          <button className="btn-icon" onClick={() => onEditar(pelicula)} title="Editar">
            ✎
          </button>
          <button
            className="btn-icon danger"
            onClick={() => onEliminar(pelicula.id)}
            title="Eliminar"
          >
            🗑
          </button>
        </div>
      </td>
    </tr>
  );
}

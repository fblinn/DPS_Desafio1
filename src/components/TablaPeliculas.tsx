'use client';

import { Pelicula } from '@/types/pelicula';
import PeliculaFila from './PeliculaFila';

interface TablaPeliculasProps {
  peliculas: Pelicula[];
  onEditar: (pelicula: Pelicula) => void;
  onEliminar: (id: string) => void;
  onToggleEstado: (id: string) => void;
}

// muestra la tabla con todas las pelis
export default function TablaPeliculas({
  peliculas,
  onEditar,
  onEliminar,
  onToggleEstado,
}: TablaPeliculasProps) {
  return (
    <div className="table-wrapper">

       {/* Tabla principal de películas */}
      <table className="peliculas-table">
        <thead>
          <tr>
            <th>Póster</th>
            <th>Título</th>
            <th>Género</th>
            <th>Duración</th>
            <th>Clasificación</th>
            <th>Sala</th>
            <th>Precio</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>

           {/* Recorre la lista y crea una fila por cada una */}
          {peliculas.map((pelicula) => (
            <PeliculaFila
              key={pelicula.id}
              pelicula={pelicula}
              onEditar={onEditar}
              onEliminar={onEliminar}
              onToggleEstado={onToggleEstado}
            />
          ))}
        </tbody>
      </table>

       {/* Mensaje mostrado cuando no existen pelis */}
      {peliculas.length === 0 && (
        <div className="empty-state">
          <strong>No hay películas que coincidan</strong>
          Ajusta la búsqueda o los filtros, o agrega una nueva película.
        </div>
      )}
    </div>
  );
}

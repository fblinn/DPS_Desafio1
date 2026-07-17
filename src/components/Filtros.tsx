'use client';

import { Pelicula } from '@/types/pelicula';

// almacena los filtros seleccionados
export interface FiltrosState {
  genero: string;
  clasificacion: string;
  sala: string;
  estado: string;
}

interface FiltrosProps {
  peliculas: Pelicula[];
  filtros: FiltrosState;
  // actualiza los filtros
  onChange: (filtros: FiltrosState) => void;
}

const TODOS = 'Todos';

// Componente que muestra los filtros 
export default function Filtros({ peliculas, filtros, onChange }: FiltrosProps) {
  const generos = Array.from(new Set(peliculas.map((p) => p.genero))).sort();
  const clasificaciones = Array.from(new Set(peliculas.map((p) => p.clasificacion))).sort();
  const salas = Array.from(new Set(peliculas.map((p) => p.salaAsignada))).sort();

  // actualiza el filtro que user modifica
  const actualizar = (campo: keyof FiltrosState, valor: string) => {
    onChange({ ...filtros, [campo]: valor });
  };

  // filtros
  return (
    <>
      <select
        className="filter-select"
        value={filtros.genero}
        onChange={(e) => actualizar('genero', e.target.value)}
      >
        <option value={TODOS}>Género</option>
        {generos.map((g) => (
          <option key={g} value={g}>
            {g}
          </option>
        ))}
      </select>

      <select
        className="filter-select"
        value={filtros.clasificacion}
        onChange={(e) => actualizar('clasificacion', e.target.value)}
      >
        <option value={TODOS}>Clasificación</option>
        {clasificaciones.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <select
        className="filter-select"
        value={filtros.sala}
        onChange={(e) => actualizar('sala', e.target.value)}
      >
        <option value={TODOS}>Sala</option>
        {salas.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <select
        className="filter-select"
        value={filtros.estado}
        onChange={(e) => actualizar('estado', e.target.value)}
      >
        <option value={TODOS}>Estado</option>
        <option value="disponible">Disponible</option>
        <option value="no disponible">No disponible</option>
      </select>
    </>
  );
}

// valores iniciales de filtros
export const FILTROS_INICIALES: FiltrosState = {
  genero: TODOS,
  clasificacion: TODOS,
  sala: TODOS,
  estado: TODOS,
};

export { TODOS };

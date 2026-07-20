import { Funcion } from '@/types/funcion';
import { peliculas } from './peliculas';

// Fecha de hoy en formato "YYYY-MM-DD", para que las funciones de ejemplo
// siempre cuenten como "de hoy" sin importar cuándo se corra el proyecto.
const hoy = new Date().toISOString().split('T')[0];

// Helper: busca el id real de una película por su nombre exacto.
// Si no la encuentra, regresa null y esa función se omite (ver filter abajo).
function idPorNombre(nombre: string): string | null {
  return peliculas.find((p) => p.nombre === nombre)?.id ?? null;
}

// IDs fijos de las salas que ya precargamos en salasSlice.ts
const SALA_1 = 'sala-1';
const SALA_2 = 'sala-2';
const SALA_3 = 'sala-3';
const SALA_4 = 'sala-4';

interface FuncionSemilla {
  peliculaNombre: string;
  salaId: string;
  hora: string; // "HH:MM" 24h
  formato: Funcion['formato'];
  idioma: Funcion['idioma'];
}

//Datos de funciones precargadas
//idealmente deberian de trabajar con el ID pero por practicidad mejor
//usaremos solo el nombre de las pelis
const funcionesSemilla: FuncionSemilla[] = [
  { peliculaNombre: 'Avengers: Endgame', salaId: SALA_2, hora: '15:00', formato: '2D', idioma: 'Sub' },
  { peliculaNombre: 'Avengers: Endgame', salaId: SALA_3, hora: '19:00', formato: '3D', idioma: 'Dob' },
  { peliculaNombre: 'Titanic', salaId: SALA_1, hora: '20:00', formato: '2D', idioma: 'Sub' },
  { peliculaNombre: 'Oppenheimer', salaId: SALA_1, hora: '20:00', formato: '2D', idioma: 'Dob' },
  { peliculaNombre: 'Avatar: El camino del agua', salaId: SALA_4, hora: '18:00', formato: '3D', idioma: 'Sub' },
];

export const funciones: Funcion[] = funcionesSemilla
  .map((f, index) => {
    const peliculaId = idPorNombre(f.peliculaNombre);
    if (!peliculaId) return null; // la película no existe con ese nombre exacto

    return {
      id: `funcion-semilla-${index + 1}`,
      peliculaId,
      salaId: f.salaId,
      fecha: hoy,
      hora: f.hora,
      formato: f.formato,
      idioma: f.idioma,
    };
  })
  .filter((f): f is Funcion => f !== null);
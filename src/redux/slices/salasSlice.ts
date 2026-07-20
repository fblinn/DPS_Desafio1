import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Sala, SalaFormData, Funcion, FuncionFormData } from "@/types/sala"; // TODO: ajusta la ruta real
import type { RootState } from "../store"; // TODO: ajusta la ruta si tu store no está en src/redux/store.ts

interface SalasState {
  salas: Sala[];
  funciones: Funcion[];
}

const initialState: SalasState = {
  salas: [],
  funciones: [],
};

const salasSlice = createSlice({
  name: "salas",
  initialState,
  reducers: {
    // ---- Salas ----
    agregarSala: {
      reducer: (state, action: PayloadAction<Sala>) => {
        state.salas.push(action.payload);
      },
      prepare: (data: SalaFormData) => ({
        payload: { ...data, id: crypto.randomUUID() },
      }),
    },

    editarSala: (state, action: PayloadAction<Sala>) => {
      const index = state.salas.findIndex((s) => s.id === action.payload.id);
      if (index !== -1) {
        state.salas[index] = action.payload;
      }
    },

    eliminarSala: (state, action: PayloadAction<string>) => {
      state.salas = state.salas.filter((s) => s.id !== action.payload);
    },

    // ---- Funciones ----
    agregarFuncion: {
      reducer: (state, action: PayloadAction<Funcion>) => {
        state.funciones.push(action.payload);
      },
      prepare: (data: FuncionFormData) => ({
        payload: { ...data, id: crypto.randomUUID() },
      }),
    },

    editarFuncion: (state, action: PayloadAction<Funcion>) => {
      const index = state.funciones.findIndex((f) => f.id === action.payload.id);
      if (index !== -1) {
        state.funciones[index] = action.payload;
      }
    },

    eliminarFuncion: (state, action: PayloadAction<string>) => {
      state.funciones = state.funciones.filter((f) => f.id !== action.payload);
    },
  },
});

export const {
  agregarSala,
  editarSala,
  eliminarSala,
  agregarFuncion,
  editarFuncion,
  eliminarFuncion,
} = salasSlice.actions;

export default salasSlice.reducer;

// ----------------------------------------------------------------
// Selectores
// NOTA: asumo "fecha" como string "YYYY-MM-DD", igual que en reservasSlice.
// ----------------------------------------------------------------

export const selectSalas = (state: RootState) => state.salas.salas;
export const selectFunciones = (state: RootState) => state.salas.funciones;

// Funciones disponibles hoy (para la tarjeta "Funciones Disponibles")
export const selectFuncionesHoy = (state: RootState) => {
  const hoy = new Date().toISOString().split("T")[0];
  return state.salas.funciones.filter((f) => f.fecha === hoy);
};

export const selectTotalFuncionesDisponibles = (state: RootState) =>
  selectFuncionesHoy(state).length;

// Funciones a iniciar: las de hoy, ordenadas por hora, ya combinadas con
// el nombre de la película y el nombre de la sala (para pintar directo en la UI)
export interface FuncionConDetalle {
  id: string;
  peliculaNombre: string;
  sala: string;
  hora: string;
}

export const selectFuncionesAIniciar = (state: RootState): FuncionConDetalle[] => {
  const hoy = new Date().toISOString().split("T")[0];

  return state.salas.funciones
    .filter((f) => f.fecha === hoy)
    .map((f) => {
      const pelicula = state.peliculas.lista.find((p) => p.id === f.peliculaId);
      const sala = state.salas.salas.find((s) => s.id === f.salaId);
      return {
        id: f.id,
        peliculaNombre: pelicula?.nombre ?? "Película desconocida",
        sala: sala?.nombre ?? "Sala desconocida",
        hora: f.hora,
      };
    })
    // TODO: si quieres ordenarlas cronológicamente de verdad, "hora" como
    // string "3:00 pm" no ordena bien alfabéticamente. Considera guardar
    // la hora en formato 24h (ej. "15:00") para poder hacer sort() correcto.
    .sort((a, b) => a.hora.localeCompare(b.hora));
};
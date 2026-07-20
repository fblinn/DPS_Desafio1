import { createSlice, PayloadAction, createSelector } from "@reduxjs/toolkit";
import { Sala, SalaFormData } from "@/types/sala";
import { Funcion, FuncionFormData } from "@/types/funcion";
import type { RootState } from "../store";

interface SalasState {
  salas: Sala[];
  funciones: Funcion[];
}

const initialState: SalasState = {
  salas: [
    { id: "sala-1", nombre: "Sala 1", capacidad: 80 },
    { id: "sala-2", nombre: "Sala 2", capacidad: 80 },
    { id: "sala-3", nombre: "Sala 3", capacidad: 60 },
    { id: "sala-4", nombre: "Sala 4", capacidad: 60 },
  ],
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
// ----------------------------------------------------------------

export const selectSalas = (state: RootState) => state.salas.salas;
export const selectFunciones = (state: RootState) => state.salas.funciones;

export const selectFuncionesHoy = (state: RootState) => {
  const hoy = new Date().toISOString().split("T")[0];
  return state.salas.funciones.filter((f) => f.fecha === hoy);
};

export const selectTotalFuncionesDisponibles = (state: RootState) =>
  selectFuncionesHoy(state).length;

export interface FuncionConDetalle {
  id: string;
  peliculaNombre: string;
  sala: string;
  hora: string;
}

export const selectFuncionesAIniciar = createSelector(
  [
    (state: RootState) => state.salas.funciones,
    (state: RootState) => state.peliculas.lista,
    (state: RootState) => state.salas.salas,
  ],
  (funciones, peliculasLista, salas): FuncionConDetalle[] => {
    const hoy = new Date().toISOString().split("T")[0];

    return funciones
      .filter((f) => f.fecha === hoy)
      .map((f) => {
        const pelicula = peliculasLista.find((p) => p.id === f.peliculaId);
        const sala = salas.find((s) => s.id === f.salaId);
        return {
          id: f.id,
          peliculaNombre: pelicula?.nombre ?? "Película desconocida",
          sala: sala?.nombre ?? "Sala desconocida",
          hora: f.hora,
        };
      })
      .sort((a, b) => a.hora.localeCompare(b.hora));
  }
);

// Funciones de una película específica, con el nombre de sala ya resuelto
// (para la tabla del modal "Detalle Película y Funciones")
export interface FuncionConSala extends Funcion {
  salaNombre: string;
}

export const selectFuncionesPorPelicula =
  (peliculaId: string) =>
  (state: RootState): FuncionConSala[] => {
    return state.salas.funciones
      .filter((f) => f.peliculaId === peliculaId)
      .map((f) => {
        const sala = state.salas.salas.find((s) => s.id === f.salaId);
        return { ...f, salaNombre: sala?.nombre ?? "Sala desconocida" };
      });
  };
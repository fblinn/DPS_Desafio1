import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Pelicula } from '@/types/pelicula';
import { peliculas } from '@/data/peliculas';
import type { RootState } from '@/redux/store';

// Estado que almacena la lista de pelis
interface PeliculasState {
  lista: Pelicula[];
}

// Estado inicial cargado con los datos predefinidos
const initialState: PeliculasState = {
  lista: peliculas,
};

// Slice de Redux que administra las operaciones sobre las pelis
const peliculasSlice = createSlice({
  name: 'peliculas',
  initialState,
  reducers: {

    // Agrega una nueva peli
    agregarPelicula: (state, action: PayloadAction<Pelicula>) => {
      state.lista.push(action.payload);
    },

     // Actualiza la info de una peli existente
    editarPelicula: (state, action: PayloadAction<Pelicula>) => {
      const index = state.lista.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.lista[index] = action.payload;
      }
    },

    // Elimina una peli según su identificador
    eliminarPelicula: (state, action: PayloadAction<string>) => {
      state.lista = state.lista.filter((p) => p.id !== action.payload);
    },

    // Cambia estado (disponible, no disponible)
    cambiarEstadoPelicula: (state, action: PayloadAction<string>) => {
      const pelicula = state.lista.find((p) => p.id === action.payload);
      if (pelicula) {
        pelicula.estado = pelicula.estado === 'disponible' ? 'no disponible' : 'disponible';
      }
    },
  },
});

// Exporta las acciones para utilizarlas en los componentes
export const { agregarPelicula, editarPelicula, eliminarPelicula, cambiarEstadoPelicula } =
  peliculasSlice.actions;

// --- Selectores ---

// Devuelve la lista completa de pelis
export const selectPeliculas = (state: RootState) => state.peliculas.lista;

// Devuelve una peli puntual según su id (usado en HistorialVentas)
export const selectPeliculaPorId = (id: string) => (state: RootState) =>
  state.peliculas.lista.find((p) => p.id === id);

// Exporta el reducer para registrarlo en el store
export default peliculasSlice.reducer;
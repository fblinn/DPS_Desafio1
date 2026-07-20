import { configureStore } from '@reduxjs/toolkit';
import peliculasReducer from '@/redux/slices/peliculasSlice';
import reservasReducer from '@/redux/slices/reservasSlice';
import salasReducer from '@/redux/slices/salasSlice';
import seatsReducer from '@/redux/slices/asientoSlice';

// Configuración del store principal de Redux
export const store = configureStore({
  reducer: {
    // Reducer encargado de administrar las películas
    peliculas: peliculasReducer,
    reservas: reservasReducer,
    salas: salasReducer,
    seats: seatsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

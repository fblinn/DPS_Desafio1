import { configureStore } from '@reduxjs/toolkit';
import peliculasReducer from './slices/peliculasSlice';

// Fati: importar y agregar aquí reservasReducer y salasReducer
// import reservasReducer from './slices/reservasSlice';
// import salasReducer from './slices/salasSlice';

// Configuración del store principal de Redux
export const store = configureStore({
  reducer: {
    // Reducer encargado de administrar las películas
    peliculas: peliculasReducer,
    // reservas: reservasReducer,
    // salas: salasReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

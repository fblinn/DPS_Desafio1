import { configureStore, combineReducers } from '@reduxjs/toolkit';

import peliculasReducer from '@/redux/slices/peliculasSlice';
import reservasReducer from '@/redux/slices/reservasSlice';
import salasReducer from '@/redux/slices/salasSlice';

import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';


// Reducers principales
const rootReducer = combineReducers({
  peliculas: peliculasReducer,
  reservas: reservasReducer,
  salas: salasReducer,
});


// Configuración del persist
// Permite almacenar automáticamente el estado de Redux dentro del Local Storage
// del navegador para conservar la información aunque el usuario cierre o recargue
const persistConfig = {
  key: 'root',
  storage,
};


// Reducer con capacidad de persistencia
// se encarga de guardar y recuperar automaticamente 
const persistedReducer = persistReducer(
  persistConfig,
  rootReducer
);


// Store principal
// es el contenedor central donde se almacena todo el estado
export const store = configureStore({
  reducer: persistedReducer,

  // Configuración del middleware de Redux Toolkit.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});


// crea persistor encargado de controlar la persistencia del Store
export const persistor = persistStore(store);


// Tipos para typescript
export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

'use client';
import { configureStore, combineReducers } from "@reduxjs/toolkit";

import peliculasReducer from "@/redux/slices/peliculasSlice";
import reservasReducer from "@/redux/slices/reservasSlice";
import salasReducer from "@/redux/slices/salasSlice";
import asientosReducer from "@/redux/slices/asientoSlice";

import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";

const rootReducer = combineReducers({
  peliculas: peliculasReducer,
  reservas: reservasReducer,
  salas: salasReducer,
  asientos: asientosReducer,
});

const persistConfig = {
  key: "root",
  storage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
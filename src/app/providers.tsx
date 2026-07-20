'use client';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { store, persistor } from '@/redux/store';


// envuelve la app con los proveedores necesarios.
export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
     // Provider conecta la aplicación con el store de Redux.
    <Provider store={store}>
      {/* evita que la aplicación cargue antes de recuperar
        los datos almacenados*/}
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
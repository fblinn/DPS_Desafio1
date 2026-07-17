import type { Metadata } from 'next';
import Providers from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'CineFlix | Gestión de Cine',
  description: 'Sistema de gestión de venta de entradas para un cine',
};

// Layout que envuelve la app
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        {/* proveedor global para Redux  */}
        <Providers>{children}</Providers> 
      </body>
    </html>
  );
}
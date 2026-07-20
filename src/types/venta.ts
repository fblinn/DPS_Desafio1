export type EstadoVenta = "Completa" | "Pendiente" | "Cancelada";

export interface Venta {
  id: string;
  fechaHora: string; // ej. "03/07/2026 10:30 am"
  clienteNombre: string;
  clienteEmail?: string;
  clienteTelefono?: string;
  peliculaId: string; // referencia a la slice de peliculas
  funcion: string; // ej. "2D Sub"
  boletos: number;
  precioBoleto: number;
  monto: number;
  estado: EstadoVenta;
}

export type CriterioBusqueda = "fecha_hora" | "cliente" | "pelicula" | "estado";

export interface FiltrosVenta {
  fecha: string;
  criterio: CriterioBusqueda;
}

export interface Pelicula {
  id: string;
  titulo: string;
  posterUrl?: string;
}
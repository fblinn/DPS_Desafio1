export type EstadoAsiento = 'disponible' | 'seleccionado' | 'ocupado';

export interface Asiento {
  id: string; // ej. "A1"
  fila: string;
  numero: number;
  estado: EstadoAsiento;
}
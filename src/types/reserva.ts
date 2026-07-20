export type EstadoReserva = 'completa' | 'pendiente' | 'cancelada';

export interface Reserva {
  id: string;
  peliculaId: string;
  sala: string;
  fecha: string;       // ej. "2026-07-19"
  hora: string;        // ej. "3:00 pm"
  asientos: string[];  // ej. ["A1", "A2", "B3"]
  clienteNombre: string;
  clienteEmail: string;
  clienteTelefono: string;
  monto: number;       // suma total de las entradas
  estado: EstadoReserva;
}

// Payload usado por el formulario de "Confirmar y Pagar" (sin id, se genera al crear)
export type ReservaFormData = Omit<Reserva, 'id' | 'estado'>;
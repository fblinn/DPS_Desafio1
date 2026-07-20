// Sala: solo el espacio físico
export interface Sala {
  id: string;
  nombre: string; 
  capacidad: number;
}

export type SalaFormData = Omit<Sala, 'id'>;

// Funcion: conecta una película con una sala y un horario específico
export interface Funcion {
  id: string;
  peliculaId: string;
  salaId: string;
  fecha: string; // "YYYY-MM-DD", mismo formato usado en Reserva
  hora: string;  // ej. "3:00 pm"
}

export type FuncionFormData = Omit<Funcion, 'id'>;
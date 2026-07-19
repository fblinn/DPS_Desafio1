export type EstadoPelicula = 'disponible' | 'no disponible';

// modelo que representa una peli
export interface Pelicula {
  id: string;
  codigo: string;
  nombre: string;
  genero: string;
  duracion: number; // en minutos
  clasificacion: string; // ej. "A", "B", "C"
  salaAsignada: string;
  precio: number;
  estado: EstadoPelicula;
  posterColor?: string; posterImage?: string;// color para el placeholder de poster
}

// Payload usado por el formulario (sin id ya que se genera al crear)
export type PeliculaFormData = Omit<Pelicula, 'id'>;

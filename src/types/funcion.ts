export type FormatoFuncion = '2D' | '3D';
export type IdiomaFuncion = 'Sub' | 'Dob';

export interface Funcion {
  id: string;
  peliculaId: string;
  salaId: string;
  fecha: string;   // "YYYY-MM-DD"
  hora: string;    // ej. "3:00 pm"
  formato: FormatoFuncion;
  idioma: IdiomaFuncion;
}

export type FuncionFormData = Omit<Funcion, 'id'>;
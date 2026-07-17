'use client';

import { useState, FormEvent } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { agregarPelicula, editarPelicula } from '@/redux/slices/peliculasSlice';
import { Pelicula, EstadoPelicula } from '@/types/pelicula';

interface FormularioPeliculaProps {
   // Película a editar; null agrega una nueva
  peliculaEditar: Pelicula | null;
  onClose: () => void;
}

interface FormState {
  codigo: string;
  nombre: string;
  genero: string;
  duracion: string;
  clasificacion: string;
  salaAsignada: string;
  precio: string;
  estado: EstadoPelicula;
}

type Errores = Partial<Record<keyof FormState, string>>;

const COLORES_POSTER = ['#e50914', '#7b2ff7', '#00c9a7', '#f5a623', '#1f6feb', '#c2185b'];

// Genera estado inicial del formulario
function estadoInicial(pelicula: Pelicula | null): FormState {
  if (!pelicula) {
    return {
      codigo: '',
      nombre: '',
      genero: '',
      duracion: '',
      clasificacion: '',
      salaAsignada: '',
      precio: '',
      estado: 'disponible',
    };
  }
   // Si existe una peli, carga datos para editar
  return {
    codigo: pelicula.codigo,
    nombre: pelicula.nombre,
    genero: pelicula.genero,
    duracion: String(pelicula.duracion),
    clasificacion: pelicula.clasificacion,
    salaAsignada: pelicula.salaAsignada,
    precio: String(pelicula.precio),
    estado: pelicula.estado,
  };
}

// Form para agregar o editar
export default function FormularioPelicula({
  peliculaEditar,
  onClose,
}: FormularioPeliculaProps) {
  const dispatch = useAppDispatch();
  const peliculas = useAppSelector((state) => state.peliculas.lista);
  const [form, setForm] = useState<FormState>(estadoInicial(peliculaEditar));
  const [errores, setErrores] = useState<Errores>({});

  const actualizar = (campo: keyof FormState, valor: string) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  };

  const validar = (): Errores => {
    const nuevosErrores: Errores = {};

    if (!form.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es obligatorio.';
    }

    if (!form.codigo.trim()) {
      nuevosErrores.codigo = 'El código es obligatorio.';
    } else {
      const codigoDuplicado = peliculas.some(
        (p) =>
          p.codigo.toLowerCase() === form.codigo.trim().toLowerCase() &&
          p.id !== peliculaEditar?.id
      );
      if (codigoDuplicado) {
        nuevosErrores.codigo = 'Ya existe una película con este código.';
      }
    }

    const precioNum = Number(form.precio);
    if (form.precio === '' || Number.isNaN(precioNum) || precioNum <= 0) {
      nuevosErrores.precio = 'El precio debe ser un número positivo.';
    }

    const duracionNum = Number(form.duracion);
    if (form.duracion === '' || Number.isNaN(duracionNum) || duracionNum <= 0) {
      nuevosErrores.duracion = 'Ingresa una duración válida.';
    }

    if (!form.genero.trim()) nuevosErrores.genero = 'Requerido.';
    if (!form.clasificacion.trim()) nuevosErrores.clasificacion = 'Requerido.';
    if (!form.salaAsignada.trim()) nuevosErrores.salaAsignada = 'Requerido.';

    return nuevosErrores;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const nuevosErrores = validar();
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    // Construye objeto pelicula con los datos ingresados
    const payload: Pelicula = {
      id: peliculaEditar?.id ?? crypto.randomUUID(),
      codigo: form.codigo.trim(),
      nombre: form.nombre.trim(),
      genero: form.genero.trim(),
      duracion: Number(form.duracion),
      clasificacion: form.clasificacion.trim(),
      salaAsignada: form.salaAsignada.trim(),
      precio: Number(form.precio),
      estado: form.estado,
      posterColor:
        peliculaEditar?.posterColor ??
        COLORES_POSTER[Math.floor(Math.random() * COLORES_POSTER.length)],
    };

     // Decide si agrega una nueva o actualiza existente
    if (peliculaEditar) {
      dispatch(editarPelicula(payload));
    } else {
      dispatch(agregarPelicula(payload));
    }

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {peliculaEditar ? 'Editar película' : 'Agregar película'}
          </h2>
          <button className="modal-close" onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className={`form-field ${errores.codigo ? 'has-error' : ''}`}>
              <label>Código</label>
              <input
                value={form.codigo}
                onChange={(e) => actualizar('codigo', e.target.value)}
                placeholder="PEL-006"
              />
              {errores.codigo && <span className="field-error">{errores.codigo}</span>}
            </div>

            <div className={`form-field ${errores.nombre ? 'has-error' : ''}`}>
              <label>Nombre</label>
              <input
                value={form.nombre}
                onChange={(e) => actualizar('nombre', e.target.value)}
                placeholder="Título de la película"
              />
              {errores.nombre && <span className="field-error">{errores.nombre}</span>}
            </div>

            <div className={`form-field ${errores.genero ? 'has-error' : ''}`}>
              <label>Género</label>
              <input
                value={form.genero}
                onChange={(e) => actualizar('genero', e.target.value)}
                placeholder="Acción, Comedia..."
              />
              {errores.genero && <span className="field-error">{errores.genero}</span>}
            </div>

            <div className={`form-field ${errores.duracion ? 'has-error' : ''}`}>
              <label>Duración (min)</label>
              <input
                type="number"
                value={form.duracion}
                onChange={(e) => actualizar('duracion', e.target.value)}
                placeholder="120"
              />
              {errores.duracion && <span className="field-error">{errores.duracion}</span>}
            </div>

            <div className={`form-field ${errores.clasificacion ? 'has-error' : ''}`}>
              <label>Clasificación</label>
              <input
                value={form.clasificacion}
                onChange={(e) => actualizar('clasificacion', e.target.value)}
                placeholder="A, B, C"
              />
              {errores.clasificacion && (
                <span className="field-error">{errores.clasificacion}</span>
              )}
            </div>

            <div className={`form-field ${errores.salaAsignada ? 'has-error' : ''}`}>
              <label>Sala asignada</label>
              <input
                value={form.salaAsignada}
                onChange={(e) => actualizar('salaAsignada', e.target.value)}
                placeholder="Sala 1"
              />
              {errores.salaAsignada && (
                <span className="field-error">{errores.salaAsignada}</span>
              )}
            </div>

            <div className={`form-field ${errores.precio ? 'has-error' : ''}`}>
              <label>Precio ($)</label>
              <input
                type="number"
                step="0.01"
                value={form.precio}
                onChange={(e) => actualizar('precio', e.target.value)}
                placeholder="4.50"
              />
              {errores.precio && <span className="field-error">{errores.precio}</span>}
            </div>

            <div className="form-field">
              <label>Estado</label>
              <select
                value={form.estado}
                onChange={(e) => actualizar('estado', e.target.value as EstadoPelicula)}
              >
                <option value="disponible">Disponible</option>
                <option value="no disponible">No disponible</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              {peliculaEditar ? 'Guardar cambios' : 'Agregar película'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

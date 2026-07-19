'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
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
  posterImage: string; // base64, string vacío si no hay imagen
}

type CampoTexto = Exclude<keyof FormState, 'estado'>;
type Errores = Partial<Record<keyof FormState, string>>;
type Tocado = Partial<Record<keyof FormState, boolean>>;

const COLORES_POSTER = ['#e50914', '#7b2ff7', '#00c9a7', '#f5a623', '#1f6feb', '#c2185b'];
const MAX_TAMANO_IMAGEN_MB = 3;

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
      posterImage: '',
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
    posterImage: pelicula.posterImage ?? '',
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
  const [tocado, setTocado] = useState<Tocado>({});
  const [intentoEnviar, setIntentoEnviar] = useState(false);

  // Valida un solo campo y devuelve su mensaje de error (o undefined si está bien)
  const validarCampo = (campo: CampoTexto, valores: FormState): string | undefined => {
    switch (campo) {
      case 'nombre':
        return valores.nombre.trim() ? undefined : 'El nombre es obligatorio.';

      case 'codigo': {
        if (!valores.codigo.trim()) return 'El código es obligatorio.';
        const duplicado = peliculas.some(
          (p) =>
            p.codigo.trim().toLowerCase() === valores.codigo.trim().toLowerCase() &&
            p.id !== peliculaEditar?.id
        );
        return duplicado ? 'Ya existe una película registrada con este código.' : undefined;
      }

      case 'precio': {
        if (valores.precio === '') return 'El precio es obligatorio.';
        const precioNum = Number(valores.precio);
        if (Number.isNaN(precioNum)) return 'Ingresa un precio válido.';
        if (precioNum < 0) return 'El precio no puede ser negativo.';
        if (precioNum === 0) return 'El precio debe ser mayor a 0.';
        return undefined;
      }

      case 'duracion': {
        if (valores.duracion === '') return 'La duración es obligatoria.';
        const duracionNum = Number(valores.duracion);
        if (Number.isNaN(duracionNum)) return 'Ingresa una duración válida.';
        if (duracionNum < 0) return 'La duración no puede ser negativa.';
        if (duracionNum === 0) return 'La duración debe ser mayor a 0.';
        return undefined;
      }

      case 'genero':
        return valores.genero.trim() ? undefined : 'El género es obligatorio.';

      case 'clasificacion':
        return valores.clasificacion.trim() ? undefined : 'La clasificación es obligatoria.';

      case 'salaAsignada':
        return valores.salaAsignada.trim() ? undefined : 'La sala asignada es obligatoria.';

      default:
        return undefined;
    }
  };

  const CAMPOS_A_VALIDAR: CampoTexto[] = [
    'codigo',
    'nombre',
    'genero',
    'duracion',
    'clasificacion',
    'salaAsignada',
    'precio',
  ];

  // Valida todos los campos de una vez (se usa al enviar)
  const validarTodo = (valores: FormState): Errores => {
    const nuevosErrores: Errores = {};
    for (const campo of CAMPOS_A_VALIDAR) {
      const mensaje = validarCampo(campo, valores);
      if (mensaje) nuevosErrores[campo] = mensaje;
    }
    return nuevosErrores;
  };

  const actualizar = (campo: CampoTexto, valor: string) => {
    const nuevoForm = { ...form, [campo]: valor };
    setForm(nuevoForm);

    // Si el campo ya fue tocado (o ya se intentó enviar), revalida en vivo
    if (tocado[campo] || intentoEnviar) {
      setErrores((prev) => ({ ...prev, [campo]: validarCampo(campo, nuevoForm) }));
    }
  };

  const marcarTocado = (campo: CampoTexto) => {
    setTocado((prev) => ({ ...prev, [campo]: true }));
    setErrores((prev) => ({ ...prev, [campo]: validarCampo(campo, form) }));
  };

  const handleImagenSeleccionada = (e: ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    if (!archivo.type.startsWith('image/')) {
      setErrores((prev) => ({ ...prev, posterImage: 'El archivo debe ser una imagen.' }));
      return;
    }

    if (archivo.size > MAX_TAMANO_IMAGEN_MB * 1024 * 1024) {
      setErrores((prev) => ({
        ...prev,
        posterImage: `La imagen no debe superar ${MAX_TAMANO_IMAGEN_MB} MB.`,
      }));
      return;
    }

    const lector = new FileReader();
    lector.onload = () => {
      setForm((prev) => ({ ...prev, posterImage: lector.result as string }));
      setErrores((prev) => ({ ...prev, posterImage: undefined }));
    };
    lector.readAsDataURL(archivo);
  };

  const quitarImagen = () => {
    setForm((prev) => ({ ...prev, posterImage: '' }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIntentoEnviar(true);

    const nuevosErrores = validarTodo(form);
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
      posterImage: form.posterImage || undefined,
    };

    // Decide si agrega una nueva o actualiza existente
    if (peliculaEditar) {
      dispatch(editarPelicula(payload));
    } else {
      dispatch(agregarPelicula(payload));
    }

    onClose();
  };

  const hayErrores = Object.values(errores).some(Boolean);

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

        {intentoEnviar && hayErrores && (
          <div className="form-alert" role="alert">
            Revisa los campos marcados en rojo antes de continuar.
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-grid">
            <div className={`form-field ${errores.codigo ? 'has-error' : ''}`}>
              <label>Código</label>
              <input
                value={form.codigo}
                onChange={(e) => actualizar('codigo', e.target.value)}
                onBlur={() => marcarTocado('codigo')}
                placeholder="PEL-006"
                aria-invalid={Boolean(errores.codigo)}
              />
              {errores.codigo && <span className="field-error">{errores.codigo}</span>}
            </div>

            <div className={`form-field ${errores.nombre ? 'has-error' : ''}`}>
              <label>Nombre</label>
              <input
                value={form.nombre}
                onChange={(e) => actualizar('nombre', e.target.value)}
                onBlur={() => marcarTocado('nombre')}
                placeholder="Título de la película"
                aria-invalid={Boolean(errores.nombre)}
              />
              {errores.nombre && <span className="field-error">{errores.nombre}</span>}
            </div>

            <div className={`form-field ${errores.genero ? 'has-error' : ''}`}>
              <label>Género</label>
              <input
                value={form.genero}
                onChange={(e) => actualizar('genero', e.target.value)}
                onBlur={() => marcarTocado('genero')}
                placeholder="Acción, Comedia..."
                aria-invalid={Boolean(errores.genero)}
              />
              {errores.genero && <span className="field-error">{errores.genero}</span>}
            </div>

            <div className={`form-field ${errores.duracion ? 'has-error' : ''}`}>
              <label>Duración (min)</label>
              <input
                type="number"
                min="0"
                value={form.duracion}
                onChange={(e) => actualizar('duracion', e.target.value)}
                onBlur={() => marcarTocado('duracion')}
                placeholder="120"
                aria-invalid={Boolean(errores.duracion)}
              />
              {errores.duracion && <span className="field-error">{errores.duracion}</span>}
            </div>

            <div className={`form-field ${errores.clasificacion ? 'has-error' : ''}`}>
              <label>Clasificación</label>
              <input
                value={form.clasificacion}
                onChange={(e) => actualizar('clasificacion', e.target.value)}
                onBlur={() => marcarTocado('clasificacion')}
                placeholder="A, B, C"
                aria-invalid={Boolean(errores.clasificacion)}
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
                onBlur={() => marcarTocado('salaAsignada')}
                placeholder="Sala 1"
                aria-invalid={Boolean(errores.salaAsignada)}
              />
              {errores.salaAsignada && (
                <span className="field-error">{errores.salaAsignada}</span>
              )}
            </div>

            <div className={`form-field ${errores.precio ? 'has-error' : ''}`}>
              <label>Precio ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.precio}
                onChange={(e) => actualizar('precio', e.target.value)}
                onBlur={() => marcarTocado('precio')}
                placeholder="4.50"
                aria-invalid={Boolean(errores.precio)}
              />
              {errores.precio && <span className="field-error">{errores.precio}</span>}
            </div>

            <div className="form-field full">
              <label>Poster (opcional)</label>
              <div className="poster-upload">
                {form.posterImage ? (
                  <img
                    src={form.posterImage}
                    alt="Vista previa del poster"
                    className="poster-preview"
                  />
                ) : (
                  <div className="poster-preview poster-preview-empty">Sin imagen</div>
                )}
                <div className="poster-upload-actions">
                  <label className="btn-secondary poster-upload-btn">
                    {form.posterImage ? 'Cambiar imagen' : 'Subir imagen'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImagenSeleccionada}
                      hidden
                    />
                  </label>
                  {form.posterImage && (
                    <button type="button" className="btn-icon danger" onClick={quitarImagen}>
                      🗑
                    </button>
                  )}
                </div>
              </div>
              {errores.posterImage && <span className="field-error">{errores.posterImage}</span>}
            </div>

            <div className="form-field">
              <label>Estado</label>
              <select
                value={form.estado}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, estado: e.target.value as EstadoPelicula }))
                }
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
"use client";

import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectSalas, agregarFuncion } from "@/redux/slices/salasSlice";
import { FormatoFuncion, IdiomaFuncion } from "@/types/funcion";

interface FormularioFuncionProps {
  peliculaId: string;
  onClose: () => void;
  onCreada?: () => void; // opcional: por si quieres hacer algo justo después de crear
}

export default function FormularioFuncion({
  peliculaId,
  onClose,
  onCreada,
}: FormularioFuncionProps) {
  const dispatch = useDispatch();
  const salas = useSelector(selectSalas);

  const [salaId, setSalaId] = useState(salas[0]?.id ?? "");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [formato, setFormato] = useState<FormatoFuncion>("2D");
  const [idioma, setIdioma] = useState<IdiomaFuncion>("Sub");
  const [error, setError] = useState("");

  // Fecha de hoy para comparar  evitar que el usuario pueda elegir
  // un dia pasado 
  const hoy = new Date();
  const fechaHoy = hoy.toISOString().split("T")[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!salaId || !fecha || !hora) {
      setError("Completa sala, fecha y hora.");
      return;
    }

     // No permitir una fecha anterior a hoy
    if (fecha < fechaHoy) {
      setError("No puedes registrar una función en una fecha anterior a hoy.");
      return;
    }

    // Si la fecha elegida es hoy, la hora no puede ser anterior a la hora actual
    if (fecha === fechaHoy) {
      const horaActual = `${String(hoy.getHours()).padStart(2, "0")}:${String(
        hoy.getMinutes()
      ).padStart(2, "0")}`;
 
      if (hora < horaActual) {
        setError("No puedes registrar una función a una hora que ya pasó.");
        return;
      }
    }
    
    setError("");

    dispatch(
      agregarFuncion({
        peliculaId,
        salaId,
        fecha,
        hora,
        formato,
        idioma,
      })
    );

    onCreada?.();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Agregar Función</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-field full">
              <label htmlFor="funcion-sala">Sala</label>
              <select
                id="funcion-sala"
                name="sala"
                value={salaId}
                onChange={(e) => setSalaId(e.target.value)}
              >
                {salas.map((sala) => (
                  <option key={sala.id} value={sala.id}>
                    {sala.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="funcion-fecha">Fecha</label>
              <input
                id="funcion-fecha"
                name="fecha"
                type="date"
                min={fechaHoy}
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label htmlFor="funcion-hora">Hora</label>
              <input
                id="funcion-hora"
                name="hora"
                type="time"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label htmlFor="funcion-formato">Formato</label>
              <select
                id="funcion-formato"
                name="formato"
                value={formato}
                onChange={(e) => setFormato(e.target.value as FormatoFuncion)}
              >
                <option value="2D">2D</option>
                <option value="3D">3D</option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="funcion-idioma">Idioma</label>
              <select
                id="funcion-idioma"
                name="idioma"
                value={idioma}
                onChange={(e) => setIdioma(e.target.value as IdiomaFuncion)}
              >
                <option value="Sub">Subtitulada</option>
                <option value="Dob">Doblada</option>
              </select>
            </div>
          </div>

          {error && <p className="field-error">{error}</p>}

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              Guardar Función
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
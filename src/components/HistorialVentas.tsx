"use client";

import React, { useMemo, useState } from "react";
import {
  Search,
  Calendar,
  ChevronDown,
  Eye,
  Printer,
  X,
  User,
} from "lucide-react";

import "@/app/globals.css";
import { useAppSelector } from "@/redux/hooks";
import { selectReservas } from "@/redux/slices/reservasSlice";
import { selectPeliculaPorId } from "@/redux/slices/peliculasSlice";
import type { EstadoReserva, Reserva } from "@/types/reserva";

function formatMonto(monto: number) {
  return `$${monto.toFixed(2)}`;
}

function capitalizar(texto: string) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

const badgeClasePorEstado: Record<EstadoReserva, string> = {
  completa: "hv-badge-completa",
  pendiente: "hv-badge-pendiente",
  cancelada: "hv-badge-cancelada",
};



// ---------------------------------------------------------------------------
// Filtros — estado local: tu reservasSlice no guarda filtros, así que no
// hay necesidad de que vivan en Redux. Filtran el arreglo en el propio
// componente antes de pasarlo a la tabla.
// ---------------------------------------------------------------------------

type CriterioBusqueda = "fecha" | "cliente" | "pelicula" | "estado";

interface FiltrosProps {
  fecha: string;
  onFechaChange: (v: string) => void;
  criterio: CriterioBusqueda;
  onCriterioChange: (v: CriterioBusqueda) => void;
}

function Filtros({
  fecha,
  onFechaChange,
  criterio,
  onCriterioChange,
}: FiltrosProps) {
  return (
    <div className="hv-filtros">
      <label className="hv-filtro-fecha">
        <span className="sr-only">Fecha</span>
        <Calendar size={15} className="hv-filtro-icon" />
        <input
          type="date"
          className="hv-input"
          value={fecha}
          onChange={(e) => onFechaChange(e.target.value)}
        />
      </label>

      <div className="hv-select-wrapper">
        <select
          className="hv-select"
          value={criterio}
          onChange={(e) =>
            onCriterioChange(e.target.value as CriterioBusqueda)
          }
        >
          <option value="fecha">Fecha</option>
          <option value="cliente">Cliente</option>
          <option value="pelicula">Película</option>
          <option value="estado">Estado</option>
        </select>
        <ChevronDown size={14} className="hv-select-chevron" />
      </div>

      <button type="button" className="hv-buscar-btn">
        <Search size={15} />
        Buscar
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Fila de la tabla: resuelve el título de la película con
// selectPeliculaPorId a partir del peliculaId guardado en la reserva.
// ---------------------------------------------------------------------------

interface FilaReservaProps {
  reserva: Reserva;
  onVerDetalle: (reservaId: string) => void;
  onReimprimir: (reservaId: string) => void;
}

function FilaReserva({
  reserva,
  onVerDetalle,
  onReimprimir,
}: FilaReservaProps) {
  const pelicula = useAppSelector(selectPeliculaPorId(reserva.peliculaId));

  return (
    <tr>
      <td className="hv-cell-id">{reserva.id.slice(0, 8)}</td>
      <td className="hv-cell-muted">
        {reserva.fecha} {reserva.hora}
      </td>
      <td>
        <span className="hv-cliente-avatar">
          <User size={13} />
        </span>
      </td>
      <td className="hv-cell-pelicula">{pelicula?.nombre ?? "—"}</td>
      <td className="hv-cell-muted">{reserva.sala}</td>
      <td className="hv-cell-muted">{reserva.asientos.length}</td>
      <td className="hv-cell-monto">{formatMonto(reserva.monto)}</td>
      <td>
        <span className={`hv-badge ${badgeClasePorEstado[reserva.estado]}`}>
          {capitalizar(reserva.estado)}
        </span>
      </td>
      <td>
        <div className="hv-acciones">
          <button
            type="button"
            className="hv-accion-btn"
            onClick={() => onVerDetalle(reserva.id)}
            aria-label={`Ver detalle de reserva ${reserva.id}`}
          >
            <Eye size={14} />
          </button>
          <button
            type="button"
            className="hv-accion-btn"
            onClick={() => onReimprimir(reserva.id)}
            aria-label={`Reimprimir ticket de reserva ${reserva.id}`}
          >
            <Printer size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// Tabla de historial
// ---------------------------------------------------------------------------

interface TablaReservasProps {
  reservas: Reserva[];
  totalGlobal: number;
  onVerDetalle: (reservaId: string) => void;
  onReimprimir: (reservaId: string) => void;
}

function TablaReservas({
  reservas,
  totalGlobal,
  onVerDetalle,
  onReimprimir,
}: TablaReservasProps) {
  const columnas = [
    "ID Venta",
    "Fecha y Hora",
    "Cliente",
    "Película",
    "Función",
    "Boletos",
    "Monto",
    "Estado",
    "Acciones",
  ];

  return (
    <div className="hv-table-section">
      <div className="hv-table-wrapper">
        <table className="hv-table">
          <thead>
            <tr>
              {columnas.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reservas.length === 0 ? (
              <tr>
                <td className="hv-empty-row" colSpan={columnas.length}>
                  No hay ventas para mostrar.
                </td>
              </tr>
            ) : (
              reservas.map((reserva) => (
                <FilaReserva
                  key={reserva.id}
                  reserva={reserva}
                  onVerDetalle={onVerDetalle}
                  onReimprimir={onReimprimir}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="hv-table-footer">
        Mostrando {reservas.length} de {totalGlobal} ventas
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Modal de detalle
// ---------------------------------------------------------------------------

interface DetalleReservaModalProps {
  reserva: Reserva;
  onClose: () => void;
  onReimprimir: (reservaId: string) => void;
}

function DetalleReservaModal({
  reserva,
  onClose,
  onReimprimir,
}: DetalleReservaModalProps) {
  const pelicula = useAppSelector(selectPeliculaPorId(reserva.peliculaId));

  return (
    <div
      className="hv-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="hv-detalle-titulo"
      onClick={onClose}
    >
      <div className="hv-modal" onClick={(e) => e.stopPropagation()}>
        <div className="hv-modal-header">
          <h3 id="hv-detalle-titulo" className="hv-modal-title">
            Detalle de Venta
          </h3>
          <button
            type="button"
            className="hv-modal-close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <X size={16} />
          </button>
        </div>

        <div className="hv-modal-body">
          <span className="hv-modal-avatar">
            <User size={20} />
          </span>
          <div className="hv-modal-info">
            <p className="hv-modal-cliente">{reserva.clienteNombre}</p>
            <p className="hv-modal-muted">{pelicula?.nombre ?? "—"}</p>
            <p className="hv-modal-muted">
              {reserva.sala} · {reserva.asientos.length} boleto(s) (
              {reserva.asientos.join(", ")})
            </p>
            <p className="hv-modal-muted">
              {reserva.fecha} {reserva.hora}
            </p>
            <p className="hv-modal-faint">{reserva.clienteEmail}</p>
            <p className="hv-modal-total">
              Total: {formatMonto(reserva.monto)}
            </p>
          </div>
        </div>

        <button
          type="button"
          className="hv-modal-reimprimir"
          onClick={() => onReimprimir(reserva.id)}
        >
          <Printer size={15} />
          Reimprimir Ticket
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pantalla principal
// ---------------------------------------------------------------------------

export default function HistorialVentas() {
  const reservas = useAppSelector(selectReservas);

  const [fecha, setFecha] = useState("");
  const [criterio, setCriterio] = useState<CriterioBusqueda>("fecha");
  const [reservaSeleccionadaId, setReservaSeleccionadaId] = useState<
    string | null
  >(null);

  const reservasFiltradas = useMemo(() => {
    if (!fecha) return reservas;
    return reservas.filter((r) => r.fecha === fecha);
  }, [reservas, fecha]);

  const reservaSeleccionada = reservas.find(
    (r) => r.id === reservaSeleccionadaId
  );

  const handleReimprimir = (reservaId: string) => {
    // Punto de integración: llamar al endpoint de reimpresión de ticket.
    console.log("Reimprimiendo ticket de la reserva", reservaId);
  };

  return (
    <div className="main-content">
      <div className="hv-container">
        <div className="hv-header-row">
          <h1 className="page-title">HISTORIAL DE VENTAS</h1>
          
        </div>

        <div className="hv-panel">
         
          <Filtros
            fecha={fecha}
            onFechaChange={setFecha}
            criterio={criterio}
            onCriterioChange={setCriterio}
          />
          <TablaReservas
            reservas={reservasFiltradas}
            totalGlobal={reservas.length}
            onVerDetalle={setReservaSeleccionadaId}
            onReimprimir={handleReimprimir}
          />
        </div>
      </div>

      {reservaSeleccionada && (
        <DetalleReservaModal
          reserva={reservaSeleccionada}
          onClose={() => setReservaSeleccionadaId(null)}
          onReimprimir={handleReimprimir}
        />
      )}
    </div>
  );
}
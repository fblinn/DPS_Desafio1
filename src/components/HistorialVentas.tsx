import React, { useEffect } from "react";
import {
  Home,
  Film,
  Ticket,
  Settings,
  Search,
  Calendar,
  ChevronDown,
  Eye,
  Printer,
  X,
  User,
} from "lucide-react";

import "./HistorialVentas.css";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import {
  filtroCriterioCambiado,
  filtroFechaCambiado,
  seleccionLimpiada,
  selectFiltrosVenta,
  selectTotalVentas,
  selectVentaSeleccionada,
  selectVentas,
  ventaSeleccionada as ventaSeleccionadaAction,
  ventasCargadas,
} from "./store/ventaSlice";
import {
  peliculasCargadas,
  selectPeliculaPorId,
} from "./store/peliculasSlice";
import type { CriterioBusqueda, Pelicula, Venta } from "./types";

// ---------------------------------------------------------------------------
// Datos de ejemplo para poblar las slices al montar la pantalla.
// En una app real esto vendría de thunks (createAsyncThunk) que llaman
// a la API y despachan `ventasCargadas` / `peliculasCargadas`.
// ---------------------------------------------------------------------------

const PELICULAS_EJEMPLO: Pelicula[] = [
  { id: "p1", titulo: "Avengers: Endgame" },
  { id: "p2", titulo: "The Lion King" },
];

const VENTAS_EJEMPLO: Venta[] = [
  {
    id: "10001",
    fechaHora: "03/07/2026 10:30 am",
    clienteNombre: "María López",
    clienteEmail: "maria.lopez@email.com",
    clienteTelefono: "7000-0000",
    peliculaId: "p1",
    funcion: "2D Sub",
    boletos: 1,
    precioBoleto: 13.0,
    monto: 13.0,
    estado: "Completa",
  },
  {
    id: "10020",
    fechaHora: "05/07/2026 11:55 am",
    clienteNombre: "Carlos Ramírez",
    clienteEmail: "carlos.ramirez@email.com",
    clienteTelefono: "7111-1111",
    peliculaId: "p1",
    funcion: "3D Dob",
    boletos: 1,
    precioBoleto: 18.0,
    monto: 18.0,
    estado: "Completa",
  },
  {
    id: "10030",
    fechaHora: "09/07/2026 11:35 am",
    clienteNombre: "Ana Martínez",
    clienteEmail: "ana.martinez@email.com",
    clienteTelefono: "7222-2222",
    peliculaId: "p2",
    funcion: "2D Sub",
    boletos: 1,
    precioBoleto: 16.0,
    monto: 16.0,
    estado: "Pendiente",
  },
];

const TOTAL_VENTAS_EJEMPLO = 128;

function formatMonto(monto: number) {
  return `$${monto.toFixed(2)}`;
}

const badgeClasePorEstado: Record<Venta["estado"], string> = {
  Completa: "hv-badge-completa",
  Pendiente: "hv-badge-pendiente",
  Cancelada: "hv-badge-cancelada",
};

// ---------------------------------------------------------------------------
// Resumen de compra (lee de la slice `venta`)
// ---------------------------------------------------------------------------

function ResumenCompra() {
  const ventas = useAppSelector(selectVentas);
  const seleccionada = useAppSelector(selectVentaSeleccionada);
  const venta = seleccionada ?? ventas[0];

  if (!venta) {
    return null;
  }

  const total = venta.boletos * venta.precioBoleto;

  return (
    <aside className="hv-resumen">
      <h2 className="hv-resumen-title">Resumen de Compra</h2>
      <dl className="hv-resumen-list">
        <div className="hv-resumen-item">
          <dt className="hv-resumen-label">Nombre</dt>
          <dd className="hv-resumen-value">{venta.clienteNombre}</dd>
        </div>
        <div className="hv-resumen-item">
          <dt className="hv-resumen-label">Email/Tel</dt>
          <dd className="hv-resumen-value">
            {venta.clienteTelefono ?? venta.clienteEmail ?? "—"}
          </dd>
        </div>
        <div className="hv-resumen-item">
          <dt className="hv-resumen-label">Boletos ({venta.boletos})</dt>
          <dd className="hv-resumen-value">
            {formatMonto(venta.precioBoleto)}
          </dd>
        </div>
      </dl>
      <div className="hv-resumen-total">
        <span className="hv-resumen-total-label">Total a Pagar</span>
        <span className="hv-resumen-total-value">{formatMonto(total)}</span>
      </div>
    </aside>
  );
}

// ---------------------------------------------------------------------------
// Barra de navegación
// ---------------------------------------------------------------------------

type Vista = "Inicio" | "Películas" | "Ventas" | "Configuración";

interface NavBarProps {
  vistaActiva: Vista;
  onCambiarVista: (v: Vista) => void;
}

function NavBar({ vistaActiva, onCambiarVista }: NavBarProps) {
  const items: { label: Vista; icon: React.ElementType }[] = [
    { label: "Inicio", icon: Home },
    { label: "Películas", icon: Film },
    { label: "Ventas", icon: Ticket },
    { label: "Configuración", icon: Settings },
  ];

  return (
    <div className="hv-navbar">
      <div className="hv-navbar-left">
        <button type="button" className="hv-icon-btn" aria-label="Menú">
          <Home size={16} />
        </button>
        <nav className="hv-nav-links">
          {items.map(({ label, icon: Icon }) => {
            const activo = label === vistaActiva;
            return (
              <button
                key={label}
                type="button"
                onClick={() => onCambiarVista(label)}
                className={`hv-nav-link${activo ? " is-active" : ""}`}
              >
                <Icon size={15} />
                {label}
              </button>
            );
          })}
        </nav>
      </div>
      <button type="button" className="hv-avatar-btn" aria-label="Perfil">
        <User size={16} />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Filtros (leen y escriben en la slice `venta`)
// ---------------------------------------------------------------------------

function Filtros() {
  const dispatch = useAppDispatch();
  const filtros = useAppSelector(selectFiltrosVenta);

  const handleBuscar = () => {
    // Punto de integración: disparar la consulta real al backend usando
    // `filtros.fecha` y `filtros.criterio`, luego despachar `ventasCargadas`.
  };

  return (
    <div className="hv-filtros">
      <label className="hv-filtro-fecha">
        <span className="sr-only">Fecha</span>
        <Calendar size={15} className="hv-filtro-icon" />
        <input
          type="date"
          className="hv-input"
          value={filtros.fecha}
          onChange={(e) => dispatch(filtroFechaCambiado(e.target.value))}
        />
      </label>

      <div className="hv-select-wrapper">
        <select
          className="hv-select"
          value={filtros.criterio}
          onChange={(e) =>
            dispatch(
              filtroCriterioCambiado(e.target.value as CriterioBusqueda)
            )
          }
        >
          <option value="fecha_hora">Fecha y Hora</option>
          <option value="cliente">Cliente</option>
          <option value="pelicula">Película</option>
          <option value="estado">Estado</option>
        </select>
        <ChevronDown size={14} className="hv-select-chevron" />
      </div>

      <button type="button" className="hv-buscar-btn" onClick={handleBuscar}>
        <Search size={15} />
        Buscar
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Fila de la tabla: resuelve el título de la película desde la slice
// `peliculas` a partir del `peliculaId` guardado en la venta.
// ---------------------------------------------------------------------------

interface FilaVentaProps {
  venta: Venta;
  onVerDetalle: (ventaId: string) => void;
  onReimprimir: (ventaId: string) => void;
}

function FilaVenta({ venta, onVerDetalle, onReimprimir }: FilaVentaProps) {
  const pelicula = useAppSelector(selectPeliculaPorId(venta.peliculaId));

  return (
    <tr>
      <td className="hv-cell-id">{venta.id}</td>
      <td className="hv-cell-muted">{venta.fechaHora}</td>
      <td>
        <span className="hv-cliente-avatar">
          <User size={13} />
        </span>
      </td>
      <td className="hv-cell-pelicula">{pelicula?.titulo ?? "—"}</td>
      <td className="hv-cell-muted">{venta.funcion}</td>
      <td className="hv-cell-muted">{venta.boletos}</td>
      <td className="hv-cell-monto">{formatMonto(venta.monto)}</td>
      <td>
        <span className={`hv-badge ${badgeClasePorEstado[venta.estado]}`}>
          {venta.estado}
        </span>
      </td>
      <td>
        <div className="hv-acciones">
          <button
            type="button"
            className="hv-accion-btn"
            onClick={() => onVerDetalle(venta.id)}
            aria-label={`Ver detalle de venta ${venta.id}`}
          >
            <Eye size={14} />
          </button>
          <button
            type="button"
            className="hv-accion-btn"
            onClick={() => onReimprimir(venta.id)}
            aria-label={`Reimprimir ticket de venta ${venta.id}`}
          >
            <Printer size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// Tabla de historial de ventas (lee la lista desde la slice `venta`)
// ---------------------------------------------------------------------------

interface TablaVentasProps {
  onVerDetalle: (ventaId: string) => void;
  onReimprimir: (ventaId: string) => void;
}

function TablaVentas({ onVerDetalle, onReimprimir }: TablaVentasProps) {
  const ventas = useAppSelector(selectVentas);
  const totalVentas = useAppSelector(selectTotalVentas);

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
            {ventas.length === 0 ? (
              <tr>
                <td className="hv-empty-row" colSpan={columnas.length}>
                  No hay ventas para mostrar.
                </td>
              </tr>
            ) : (
              ventas.map((venta) => (
                <FilaVenta
                  key={venta.id}
                  venta={venta}
                  onVerDetalle={onVerDetalle}
                  onReimprimir={onReimprimir}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="hv-table-footer">
        Mostrando {ventas.length} de {totalVentas} ventas
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Modal de detalle (lee la venta seleccionada desde la slice `venta`)
// ---------------------------------------------------------------------------

interface DetalleVentaModalProps {
  onReimprimir: (ventaId: string) => void;
}

function DetalleVentaModal({ onReimprimir }: DetalleVentaModalProps) {
  const dispatch = useAppDispatch();
  const venta = useAppSelector(selectVentaSeleccionada);
  const pelicula = useAppSelector(
    selectPeliculaPorId(venta?.peliculaId ?? "")
  );

  if (!venta) {
    return null;
  }

  const cerrar = () => dispatch(seleccionLimpiada());

  return (
    <div
      className="hv-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="hv-detalle-titulo"
      onClick={cerrar}
    >
      <div className="hv-modal" onClick={(e) => e.stopPropagation()}>
        <div className="hv-modal-header">
          <h3 id="hv-detalle-titulo" className="hv-modal-title">
            Detalle de Venta
          </h3>
          <button
            type="button"
            className="hv-modal-close"
            onClick={cerrar}
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
            <p className="hv-modal-cliente">{venta.clienteNombre}</p>
            <p className="hv-modal-muted">{pelicula?.titulo ?? "—"}</p>
            <p className="hv-modal-muted">
              {venta.funcion} · {venta.boletos} boleto(s)
            </p>
            <p className="hv-modal-muted">{venta.fechaHora}</p>
            {venta.clienteEmail && (
              <p className="hv-modal-faint">{venta.clienteEmail}</p>
            )}
            <p className="hv-modal-total">
              Total: {formatMonto(venta.monto)}
            </p>
          </div>
        </div>

        <button
          type="button"
          className="hv-modal-reimprimir"
          onClick={() => onReimprimir(venta.id)}
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
  const dispatch = useAppDispatch();
  const [vistaActiva, setVistaActiva] = React.useState<Vista>("Ventas");
  const ventaSeleccionadaVenta = useAppSelector(selectVentaSeleccionada);

  // Simula la carga inicial desde el backend. En un proyecto real esto
  // se reemplaza por thunks (ej. createAsyncThunk) que llaman a la API
  // y despachan `ventasCargadas` / `peliculasCargadas` con la respuesta.
  useEffect(() => {
    dispatch(peliculasCargadas(PELICULAS_EJEMPLO));
    dispatch(
      ventasCargadas({ items: VENTAS_EJEMPLO, total: TOTAL_VENTAS_EJEMPLO })
    );
  }, [dispatch]);

  const handleVerDetalle = (ventaId: string) => {
    dispatch(ventaSeleccionadaAction(ventaId));
  };

  const handleReimprimir = (ventaId: string) => {
    // Punto de integración: llamar al endpoint de reimpresión de ticket.
    console.log("Reimprimiendo ticket de la venta", ventaId);
  };

  return (
    <div className="hv-page">
      <div className="hv-container">
        <div className="hv-header-row">
          <h1 className="hv-title">HISTORIAL DE VENTAS</h1>
          <ResumenCompra />
        </div>

        <div className="hv-panel">
          <NavBar vistaActiva={vistaActiva} onCambiarVista={setVistaActiva} />
          <Filtros />
          <TablaVentas
            onVerDetalle={handleVerDetalle}
            onReimprimir={handleReimprimir}
          />
        </div>
      </div>

      {ventaSeleccionadaVenta && (
        <DetalleVentaModal onReimprimir={handleReimprimir} />
      )}
    </div>
  );
}
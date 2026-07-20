import React from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectSeatsState,
  selectTotal,
  closeModal,
  toggleSeat,
  updateCliente,
  resetSeleccion,
} from "@/redux/slices/asientoSlice";
import "@/app/globals.css"; 

export default function SeatMapModal() {
  const dispatch = useDispatch();
  const { rows, leftSeats, rightSeats, seats, selected, cliente, isOpen } =
    useSelector(selectSeatsState);
  const total = useSelector(selectTotal);

  if (!isOpen) return null;

  const getSeatClass = (id: string): string => {
    if (selected.includes(id)) return "seatmap-seat seatmap-seat--seleccionado";
    return `seatmap-seat seatmap-seat--${seats[id]}`;
  };

  const handleConfirm = () => {
    if (selected.length === 0) {
      alert("Selecciona al menos un asiento.");
      return;
    }
    if (!cliente.nombre || !cliente.email) {
      alert("Completa nombre y email.");
      return;
    }

    // Aquí conectas tu llamada real a la API (thunk, RTK Query, etc.)
    console.log("Confirmando compra:", { asientos: selected, total, cliente });
    alert(`Compra confirmada: ${selected.length} asiento(s) por $${total.toFixed(2)}`);

    dispatch(resetSeleccion());
    dispatch(closeModal());
  };

  const renderSeatGroup = (row: string, from: number, to: number) => {
    const seatIds: string[] = [];
    for (let n = from; n <= to; n++) seatIds.push(`${row}-${n}`);
    return (
      <div className="seatmap-seat-group">
        {seatIds.map((id) => (
          <button
            key={id}
            title={id}
            disabled={seats[id] === "ocupado"}
            onClick={() => dispatch(toggleSeat(id))}
            className={getSeatClass(id)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="seatmap-overlay">
      <div className="seatmap-modal">
        <div className="seatmap-header">
          <h2>Mapa de asientos</h2>
          <button
            className="seatmap-close-btn"
            onClick={() => dispatch(closeModal())}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className="seatmap-body">
          <div className="seatmap-map">
            <div className="seatmap-screen">PANTALLA</div>
            <p className="seatmap-sala">Sala 1</p>

            {rows.map((row) => (
              <div key={row} className="seatmap-row">
                <span className="seatmap-row-label">{row}</span>
                {renderSeatGroup(row, 1, leftSeats)}
                <div className="seatmap-aisle" />
                {renderSeatGroup(row, leftSeats + 1, leftSeats + rightSeats)}
              </div>
            ))}

            <div className="seatmap-legend">
              <LegendItem className="seatmap-seat--disponible" label="Disponible" />
              <LegendItem className="seatmap-seat--seleccionado" label="Seleccionado" />
              <LegendItem className="seatmap-seat--ocupado" label="Ocupado" />
              <LegendItem className="seatmap-seat--preferencial" label="Preferencial" />
            </div>
          </div>

          <div className="seatmap-sidebar">
            <h3>Resumen de selección</h3>
            <div className="seatmap-summary-row">
              <span className="seatmap-summary-label">Asientos seleccionados</span>
              <span className="seatmap-summary-value">{selected.length}</span>
            </div>
            <div className="seatmap-summary-row">
              <span className="seatmap-summary-label">Total a pagar</span>
              <span className="seatmap-summary-value">${total.toFixed(2)}</span>
            </div>

            <hr className="seatmap-divider" />

            <h4>Datos del cliente</h4>

            <div className="seatmap-field">
              <label>Nombre</label>
              <input
                value={cliente.nombre}
                onChange={(e) => dispatch(updateCliente({ nombre: e.target.value }))}
              />
            </div>
            <div className="seatmap-field">
              <label>Email</label>
              <input
                type="email"
                value={cliente.email}
                onChange={(e) => dispatch(updateCliente({ email: e.target.value }))}
              />
            </div>
            <div className="seatmap-field">
              <label>Teléfono</label>
              <input
                value={cliente.telefono}
                onChange={(e) => dispatch(updateCliente({ telefono: e.target.value }))}
              />
            </div>

            <button className="seatmap-confirm-btn" onClick={handleConfirm}>
              Confirmar y pagar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface LegendItemProps {
  className: string;
  label: string;
}

function LegendItem({ className, label }: LegendItemProps) {
  return (
    <div className="seatmap-legend-item">
      <span className={`seatmap-legend-swatch ${className}`} />
      <span className="seatmap-legend-color">{label}</span>
    </div>
  );
}
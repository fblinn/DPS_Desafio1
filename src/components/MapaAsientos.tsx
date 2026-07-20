import React from "react";
import { useDispatch, useSelector } from "react-redux";
import "@/app/globals.css";

import {
  seleccionarEstadoAsientos,
  seleccionarTotal,
  cerrarModal,
  alternarAsiento,
  actualizarCliente,
  limpiarSeleccion,
} from "@/redux/slices/asientoSlice";



export default function MapaAsientos() {

  const dispatch = useDispatch();

  const {
    filas,
    asientosIzquierda,
    asientosDerecha,
    asientos,
    asientosSeleccionados,
    cliente,
    modalAbierto,
  } = useSelector(seleccionarEstadoAsientos);

  const total = useSelector(seleccionarTotal);

  if (!modalAbierto) return null;

  const obtenerClaseAsiento = (id: string): string => {

    if (asientosSeleccionados.includes(id))
      return "seatmap-seat seatmap-seat--seleccionado";

    return `seatmap-seat seatmap-seat--${asientos[id]}`;
  };

  const confirmarCompra = () => {

    if (asientosSeleccionados.length === 0) {
      alert("Selecciona al menos un asiento.");
      return;
    }

    if (!cliente.nombre || !cliente.email) {
      alert("Completa el nombre y el correo.");
      return;
    }

    console.log({
      asientos: asientosSeleccionados,
      total,
      cliente,
    });

    alert(
      `Compra confirmada: ${asientosSeleccionados.length} asiento(s) por $${total.toFixed(
        2
      )}`
    );

    dispatch(limpiarSeleccion());
    dispatch(cerrarModal());
  };

  const renderizarGrupoAsientos = (
    fila: string,
    inicio: number,
    fin: number
  ) => {

    const ids: string[] = [];

    for (let i = inicio; i <= fin; i++) {
      ids.push(`${fila}-${i}`);
    }

    return (
      <div className="seatmap-seat-group">
        {ids.map((id) => (
          <button
            key={id}
            title={id}
            disabled={asientos[id] === "ocupado"}
            onClick={() => dispatch(alternarAsiento(id))}
            className={obtenerClaseAsiento(id)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="seatmap-overlay">

      <div className="seatmap-modal">

        <div className="seatmap-header">

          <h2 className="modal-title ">Mapa de asientos</h2>

          <button
            className="seatmap-close-btn"
            onClick={() => dispatch(cerrarModal())}
          >
            ✕
          </button>

        </div>

        <div className="seatmap-body">

          <div className="seatmap-map">

            <div className="seatmap-screen">
              PANTALLA
            </div>

            <p className="seatmap-sala">
              Sala 1
            </p>

            {filas.map((fila) => (

              <div
                key={fila}
                className="seatmap-row"
              >

                <span className="seatmap-row-label">
                  {fila}
                </span>

                {renderizarGrupoAsientos(
                  fila,
                  1,
                  asientosIzquierda
                )}

                <div className="seatmap-aisle" />

                {renderizarGrupoAsientos(
                  fila,
                  asientosIzquierda + 1,
                  asientosIzquierda + asientosDerecha
                )}

              </div>

            ))}

            <div className="seatmap-legend">

              <ItemLeyenda
                className="seatmap-seat--disponible"
                label="Disponible"
              />

              <ItemLeyenda
                className="seatmap-seat--seleccionado"
                label="Seleccionado"
              />

              <ItemLeyenda
                className="seatmap-seat--ocupado"
                label="Ocupado"
              />

            </div>

          </div>

          <div className="seatmap-sidebar">

            <h3>Resumen de selección</h3>

            <div className="seatmap-summary-row">

              <span>Asientos seleccionados</span>

              <span>{asientosSeleccionados.length}</span>

            </div>

            <div className="seatmap-summary-row">

              <span>Total a pagar</span>

              <span>${total.toFixed(2)}</span>

            </div>

            <hr />

            <h4>Datos del cliente</h4>

            <input
              placeholder="Nombre"
              value={cliente.nombre}
              onChange={(e) =>
                dispatch(
                  actualizarCliente({
                    nombre: e.target.value,
                  })
                )
              }
            />

            <input
              placeholder="Correo"
              value={cliente.email}
              onChange={(e) =>
                dispatch(
                  actualizarCliente({
                    email: e.target.value,
                  })
                )
              }
            />

            <input
              placeholder="Teléfono"
              value={cliente.telefono}
              onChange={(e) =>
                dispatch(
                  actualizarCliente({
                    telefono: e.target.value,
                  })
                )
              }
            />

            <button
              className="seatmap-confirm-btn"
              onClick={confirmarCompra}
            >
              Confirmar y pagar
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

interface ItemLeyendaProps {
  className: string;
  label: string;
}

function ItemLeyenda({
  className,
  label,
}: ItemLeyendaProps) {

  return (
    <div className="seatmap-legend-item">

      <span className={`seatmap-legend-swatch ${className}`} />

      <span>{label}</span>

    </div>
  );
}
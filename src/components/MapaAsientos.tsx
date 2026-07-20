
import { useDispatch, useSelector } from "react-redux";
import React, { useState } from "react";
import "@/app/globals.css";

import {
  seleccionarEstadoAsientos,
  seleccionarTotal,
  cerrarModal,
  alternarAsiento,
  actualizarCliente,
  limpiarSeleccion,
} from "@/redux/slices/asientoSlice";

const REGEX_NOMBRE = /^[A-Za-zÀ-ÖØ-öø-ÿñÑ\s]*$/;
const REGEX_TELEFONO = /^[0-9\s]*$/;
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


interface ErroresCliente {
  nombre?: string;
  email?: string;
  telefono?: string;
}

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

  const [erroresCliente, setErroresCliente] = useState<ErroresCliente>({});

  if (!modalAbierto) return null;

  const obtenerClaseAsiento = (id: string): string => {

    if (asientosSeleccionados.includes(id))
      return "seatmap-seat seatmap-seat--seleccionado";

    return `seatmap-seat seatmap-seat--${asientos[id]}`;
  };

  
  // Nombre: bloquea directamente cualquier caracter que no sea letra o espacio
  // (el usuario ni siquiera puede escribir un número o símbolo).
  const handleNombreChange = (valor: string) => {
    if (REGEX_NOMBRE.test(valor)) {
      dispatch(actualizarCliente({ nombre: valor }));
      setErroresCliente((prev) => ({ ...prev, nombre: undefined }));
    }
  };
 
  // Teléfono: bloquea directamente cualquier caracter que no sea dígito o espacio.
  const handleTelefonoChange = (valor: string) => {
    if (REGEX_TELEFONO.test(valor)) {
      dispatch(actualizarCliente({ telefono: valor }));
      setErroresCliente((prev) => ({ ...prev, telefono: undefined }));
    }
  };
 
  // Correo: no se puede "bloquear" caracter por caracter porque un email válido
  // se arma con símbolos (@, .) mientras se escribe. Se valida el formato completo
  // al salir del campo (blur) y también antes de confirmar la compra.
  const handleEmailChange = (valor: string) => {
    dispatch(actualizarCliente({ email: valor }));
    if (erroresCliente.email) {
      setErroresCliente((prev) => ({ ...prev, email: undefined }));
    }
  };
 
  const validarEmailAlSalir = () => {
    if (cliente.email && !REGEX_EMAIL.test(cliente.email)) {
      setErroresCliente((prev) => ({
        ...prev,
        email: "Ingresa un correo válido (ejemplo: nombre@dominio.com).",
      }));
    }
  };
 
  // Valida todo el bloque de datos del cliente antes de confirmar la compra
  const validarCliente = (): ErroresCliente => {
    const errores: ErroresCliente = {};
 
    if (!cliente.nombre.trim()) {
      errores.nombre = "El nombre es obligatorio.";
    } else if (!REGEX_NOMBRE.test(cliente.nombre)) {
      errores.nombre = "El nombre solo puede contener letras y espacios.";
    }
 
    if (!cliente.email.trim()) {
      errores.email = "El correo es obligatorio.";
    } else if (!REGEX_EMAIL.test(cliente.email)) {
      errores.email = "Ingresa un correo válido (ejemplo: nombre@dominio.com).";
    }
 
    if (cliente.telefono && !REGEX_TELEFONO.test(cliente.telefono)) {
      errores.telefono = "El teléfono solo puede contener números y espacios.";
    }
 
    return errores;
  };
 
  const confirmarCompra = () => {
    if (asientosSeleccionados.length === 0) {
      alert("Selecciona al menos un asiento.");
      return;
    }
 
    const erroresValidacion = validarCliente();
    setErroresCliente(erroresValidacion);
 
    if (Object.keys(erroresValidacion).length > 0) {
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
    setErroresCliente({});
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

          <h2>Mapa de asientos</h2>

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
              onChange={(e) => handleNombreChange(e.target.value)}
            />
            {erroresCliente.nombre && (
              <span className="field-error">{erroresCliente.nombre}</span>
            )}
 
            <input
              placeholder="Correo"
              value={cliente.email}
              onChange={(e) => handleEmailChange(e.target.value)}
              onBlur={validarEmailAlSalir}
            />
            {erroresCliente.email && (
              <span className="field-error">{erroresCliente.email}</span>
            )}
 
            <input
              placeholder="Teléfono"
              value={cliente.telefono}
              onChange={(e) => handleTelefonoChange(e.target.value)}
            />
            {erroresCliente.telefono && (
              <span className="field-error">{erroresCliente.telefono}</span>
            )}

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
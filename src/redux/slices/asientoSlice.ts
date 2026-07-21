import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type EstadoAsiento = "disponible" | "ocupado";

export interface Cliente {
  nombre: string;
  email: string;
  telefono: string;
}

export interface EstadoAsientos {
  filas: string[];
  asientosIzquierda: number;
  asientosDerecha: number;
  precioPorAsiento: number;
  asientos: Record<string, EstadoAsiento>;
  asientosSeleccionados: string[];
  cliente: Cliente;
  modalAbierto: boolean;
  // Datos de la función elegida en ModalDetallePelicula, necesarios para
  // poder armar la Reserva completa cuando se confirma la compra.
  peliculaId: string | null;
  salaId: string | null;
  salaNombre: string | null;
  fecha: string | null;
  hora: string | null;
}

const FILAS = ["A", "B", "C", "D", "E", "F", "G", "H"];
const ASIENTOS_IZQUIERDA = 5;
const ASIENTOS_DERECHA = 5;
const PRECIO_POR_ASIENTO = 5;

const ASIENTOS_OCUPADOS = new Set([
  "B-2",
  "C-4",
  "D-3",
  "D-7",
  "E-5",
  "F-3",
  "F-8",
]);

export function construirAsientos(
  ocupadosExtra: string[] = []
): Record<string, EstadoAsiento> {
  const asientos: Record<string, EstadoAsiento> = {};
  const total = ASIENTOS_IZQUIERDA + ASIENTOS_DERECHA;
  const setOcupados = new Set([...ASIENTOS_OCUPADOS, ...ocupadosExtra]);

  FILAS.forEach((fila) => {
    for (let i = 1; i <= total; i++) {
      const id = `${fila}-${i}`;
      asientos[id] = setOcupados.has(id) ? "ocupado" : "disponible";
    }
  });

  return asientos;
}

const estadoInicial: EstadoAsientos = {
  filas: FILAS,
  asientosIzquierda: ASIENTOS_IZQUIERDA,
  asientosDerecha: ASIENTOS_DERECHA,
  precioPorAsiento: PRECIO_POR_ASIENTO,
  asientos: construirAsientos(),
  asientosSeleccionados: [],
  cliente: {
    nombre: "",
    email: "",
    telefono: "",
  },
  modalAbierto: false,
  peliculaId: null,
  salaId: null,
  salaNombre: null,
  fecha: null,
  hora: null,
};

export interface AbrirModalPayload {
  peliculaId: string;
  salaId: string;
  salaNombre: string;
  fecha: string;
  hora: string;
}

const asientoSlice = createSlice({
  name: "asientos",
  initialState: estadoInicial,
  reducers: {
    abrirModal(state, action: PayloadAction<AbrirModalPayload>) {
      state.modalAbierto = true;
      state.peliculaId = action.payload.peliculaId;
      state.salaId = action.payload.salaId;
      state.salaNombre = action.payload.salaNombre;
      state.fecha = action.payload.fecha;
      state.hora = action.payload.hora;
    },

    cerrarModal(state) {
      state.modalAbierto = false;
      state.peliculaId = null;
      state.salaId = null;
      state.salaNombre = null;
      state.fecha = null;
      state.hora = null;
    },

    alternarAsiento(state, action: PayloadAction<string>) {
      const id = action.payload;

      if (state.asientos[id] === "ocupado") return;

      const indice = state.asientosSeleccionados.indexOf(id);

      if (indice >= 0) {
        state.asientosSeleccionados.splice(indice, 1);
      } else {
        state.asientosSeleccionados.push(id);
      }
    },

    actualizarCliente(state, action: PayloadAction<Partial<Cliente>>) {
      state.cliente = {
        ...state.cliente,
        ...action.payload,
      };
    },

    limpiarSeleccion(state) {
      state.asientosSeleccionados = [];
      state.cliente = {
        nombre: "",
        email: "",
        telefono: "",
      };
    },

    establecerAsientos(
      state,
      action: PayloadAction<Record<string, EstadoAsiento>>
    ) {
      state.asientos = action.payload;
    },

    marcarAsientosOcupados(state, action: PayloadAction<string[]>) {
      action.payload.forEach((id) => {
        state.asientos[id] = "ocupado";
      });
      state.asientosSeleccionados = [];
      state.cliente = { nombre: "", email: "", telefono: "" };
    },
  },
});

export const {
  abrirModal,
  cerrarModal,
  alternarAsiento,
  actualizarCliente,
  limpiarSeleccion,
  establecerAsientos,
  marcarAsientosOcupados,
} = asientoSlice.actions;

// Selectores
export const seleccionarEstadoAsientos = (state: {
  asientos: EstadoAsientos;
}) => state.asientos;

export const seleccionarTotal = (state: {
  asientos: EstadoAsientos;
}) =>
  state.asientos.asientosSeleccionados.length *
  state.asientos.precioPorAsiento;

export default asientoSlice.reducer;
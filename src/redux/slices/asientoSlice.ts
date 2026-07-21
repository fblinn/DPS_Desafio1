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
  // Ocupados persistidos por función (clave = peliculaId_salaId_fecha_hora),
  // así un asiento ocupado en una función no afecta a otra.
  asientosOcupadosPorFuncion: Record<string, string[]>;
  asientosSeleccionados: string[];
  cliente: Cliente;
  modalAbierto: boolean;
  // Asientos que se intentaron comprar pero ya estaban ocupados
  // (por otra pestaña/venta) al momento de confirmar.
  conflictoAsientos: string[];
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

const ASIENTOS_OCUPADOS_BASE = new Set([
  "B-2",
  "C-4",
  "D-3",
  "D-7",
  "E-5",
  "F-3",
  "F-8",
]);

export function claveFuncion(
  peliculaId: string,
  salaId: string,
  fecha: string,
  hora: string
): string {
  return `${peliculaId}_${salaId}_${fecha}_${hora}`;
}

export function construirAsientos(
  ocupadosExtra: string[] = []
): Record<string, EstadoAsiento> {
  const asientos: Record<string, EstadoAsiento> = {};
  const total = ASIENTOS_IZQUIERDA + ASIENTOS_DERECHA;
  const setOcupados = new Set([...ASIENTOS_OCUPADOS_BASE, ...ocupadosExtra]);

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
  asientosOcupadosPorFuncion: {},
  asientosSeleccionados: [],
  cliente: {
    nombre: "",
    email: "",
    telefono: "",
  },
  modalAbierto: false,
  conflictoAsientos: [],
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
      state.conflictoAsientos = [];

      // Reconstruye el mapa de asientos con los ocupados guardados
      // específicamente para ESTA función (no de otras).
      const clave = claveFuncion(
        action.payload.peliculaId,
        action.payload.salaId,
        action.payload.fecha,
        action.payload.hora
      );
      const ocupadosGuardados = state.asientosOcupadosPorFuncion[clave] ?? [];
      state.asientos = construirAsientos(ocupadosGuardados);
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

    // Revalida contra lo persistido, y si no hay choques, marca los
    // asientos como ocupados para ESTA función específica.
    confirmarCompra(state, action: PayloadAction<string[]>) {
      if (!state.peliculaId || !state.salaId || !state.fecha || !state.hora) {
        return;
      }

      const clave = claveFuncion(
        state.peliculaId,
        state.salaId,
        state.fecha,
        state.hora
      );
      const ocupadosActuales = state.asientosOcupadosPorFuncion[clave] ?? [];
      const conflicto = action.payload.filter((id) =>
        ocupadosActuales.includes(id)
      );

      if (conflicto.length > 0) {
        state.conflictoAsientos = conflicto;
        state.asientos = construirAsientos(ocupadosActuales);
        state.asientosSeleccionados = state.asientosSeleccionados.filter(
          (id) => !conflicto.includes(id)
        );
        return;
      }

      const nuevosOcupados = [...ocupadosActuales, ...action.payload];
      state.asientosOcupadosPorFuncion[clave] = nuevosOcupados;
      state.asientos = construirAsientos(nuevosOcupados);
      state.asientosSeleccionados = [];
      state.cliente = { nombre: "", email: "", telefono: "" };
      state.conflictoAsientos = [];
    },

    limpiarConflicto(state) {
      state.conflictoAsientos = [];
    },

    // Se llama cuando otra pestaña actualizó localStorage: refresca
    // el mapa de asientos de la función actualmente abierta.
    sincronizarOcupados(state, action: PayloadAction<string[]>) {
      const ocupados = action.payload;
      state.asientos = construirAsientos(ocupados);

      const nuevosConflictos = state.asientosSeleccionados.filter((id) =>
        ocupados.includes(id)
      );

      if (nuevosConflictos.length > 0) {
        state.conflictoAsientos = nuevosConflictos;
        state.asientosSeleccionados = state.asientosSeleccionados.filter(
          (id) => !ocupados.includes(id)
        );
      }

      if (state.peliculaId && state.salaId && state.fecha && state.hora) {
        const clave = claveFuncion(
          state.peliculaId,
          state.salaId,
          state.fecha,
          state.hora
        );
        state.asientosOcupadosPorFuncion[clave] = ocupados;
      }
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
  confirmarCompra,
  limpiarConflicto,
  sincronizarOcupados,
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

export const seleccionarConflictoAsientos = (state: {
  asientos: EstadoAsientos;
}) => state.asientos.conflictoAsientos;

export default asientoSlice.reducer;
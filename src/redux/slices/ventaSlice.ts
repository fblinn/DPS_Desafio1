import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { CriterioBusqueda, FiltrosVenta, Venta } from "../types";

export interface VentaState {
  items: Venta[];
  totalVentas: number;
  ventaSeleccionadaId: string | null;
  filtros: FiltrosVenta;
  estado: "idle" | "cargando" | "error";
}

// Slice vacío por defecto. Se llena con `ventasCargadas` cuando llega la
// respuesta del backend (ver thunk/efecto de ejemplo en HistorialVentas.tsx).
const initialState: VentaState = {
  items: [],
  totalVentas: 0,
  ventaSeleccionadaId: null,
  filtros: {
    fecha: "",
    criterio: "fecha_hora",
  },
  estado: "idle",
};

const ventaSlice = createSlice({
  name: "venta",
  initialState,
  reducers: {
    ventasSolicitadas(state) {
      state.estado = "cargando";
    },
    ventasCargadas(
      state,
      action: PayloadAction<{ items: Venta[]; total: number }>
    ) {
      state.items = action.payload.items;
      state.totalVentas = action.payload.total;
      state.estado = "idle";
    },
    ventasFallaron(state) {
      state.estado = "error";
    },
    ventaSeleccionada(state, action: PayloadAction<string>) {
      state.ventaSeleccionadaId = action.payload;
    },
    seleccionLimpiada(state) {
      state.ventaSeleccionadaId = null;
    },
    filtroFechaCambiado(state, action: PayloadAction<string>) {
      state.filtros.fecha = action.payload;
    },
    filtroCriterioCambiado(
      state,
      action: PayloadAction<CriterioBusqueda>
    ) {
      state.filtros.criterio = action.payload;
    },
  },
});

export const {
  ventasSolicitadas,
  ventasCargadas,
  ventasFallaron,
  ventaSeleccionada,
  seleccionLimpiada,
  filtroFechaCambiado,
  filtroCriterioCambiado,
} = ventaSlice.actions;

export default ventaSlice.reducer;

// ---------------------------------------------------------------------------
// Selectores
// ---------------------------------------------------------------------------

interface ConVentaState {
  venta: VentaState;
}

export const selectVentas = (state: ConVentaState) => state.venta.items;
export const selectTotalVentas = (state: ConVentaState) =>
  state.venta.totalVentas;
export const selectFiltrosVenta = (state: ConVentaState) =>
  state.venta.filtros;
export const selectEstadoCarga = (state: ConVentaState) => state.venta.estado;
export const selectVentaSeleccionada = (state: ConVentaState): Venta | null =>
  state.venta.items.find(
    (v) => v.id === state.venta.ventaSeleccionadaId
  ) ?? null;
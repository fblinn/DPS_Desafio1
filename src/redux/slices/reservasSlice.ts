import { createSlice, PayloadAction, createSelector } from "@reduxjs/toolkit";
import { Reserva, ReservaFormData, EstadoReserva } from "@/types/reserva";
import type { RootState } from "../store";

interface ReservasState {
  items: Reserva[];
}

const initialState: ReservasState = {
  items: [],
};

const reservasSlice = createSlice({
  name: "reservas",
  initialState,
  reducers: {
    // Crear una nueva reserva
    agregarReserva: {
      reducer: (state, action: PayloadAction<Reserva>) => {
        state.items.push(action.payload);
      },
      prepare: (data: ReservaFormData) => {
        return {
          payload: {
            ...data,
            id: crypto.randomUUID(),
            estado: "completa" as EstadoReserva,
          },
        };
      },
    },

    // Cambiar el estado de una reserva
    actualizarEstadoReserva: (
      state,
      action: PayloadAction<{ id: string; estado: EstadoReserva }>
    ) => {
      const reserva = state.items.find((r) => r.id === action.payload.id);
      if (reserva) {
        reserva.estado = action.payload.estado;
      }
    },

    // Eliminar una reserva por completo
    eliminarReserva: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((r) => r.id !== action.payload);
    },
  },
});

export const { agregarReserva, actualizarEstadoReserva, eliminarReserva } =
  reservasSlice.actions;

export default reservasSlice.reducer;

// ----------------------------------------------------------------
// Selectores
// ----------------------------------------------------------------

export const selectReservas = (state: RootState) => state.reservas.items;

export const selectReservasHoy = createSelector(
  [selectReservas],
  (reservas) => {
    const hoy = new Date().toISOString().split("T")[0];
    return reservas.filter((r) => r.fecha === hoy);
  }
);

export const selectEntradasVendidasHoy = createSelector(
  [selectReservasHoy],
  (reservasHoy) => reservasHoy.reduce((total, r) => total + r.asientos.length, 0)
);

export const selectIngresosHoy = createSelector(
  [selectReservasHoy],
  (reservasHoy) => reservasHoy.reduce((total, r) => total + r.monto, 0)
);

// Ventas agrupadas por día (para el gráfico "Ventas del Día")
export const selectVentasPorDia = createSelector(
  [selectReservas],
  (reservas) => {
    const dias = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];
    const conteo: Record<string, number> = {};
    reservas.forEach((r) => {
      const diaSemana = dias[new Date(r.fecha).getDay()];
      conteo[diaSemana] = (conteo[diaSemana] || 0) + r.asientos.length;
    });
    return dias.map((dia) => ({ dia, entradas: conteo[dia] || 0 }));
  }
);
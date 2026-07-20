import { createSlice, PayloadAction } from "@reduxjs/toolkit";
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

// Todas las reservas
export const selectReservas = (state: RootState) => state.reservas.items;

// Reservas de hoy (para "Entradas Vendidas Hoy" e "Ingresos Generados")
export const selectReservasHoy = (state: RootState) => {
  const hoy = new Date().toISOString().split("T")[0]; // "2026-07-19"
  return state.reservas.items.filter((r) => r.fecha === hoy);
};

// Total de entradas vendidas hoy (suma de asientos.length de reservas de hoy)
export const selectEntradasVendidasHoy = (state: RootState) =>
  selectReservasHoy(state).reduce((total, r) => total + r.asientos.length, 0);

// Ingresos generados hoy (suma de montos de reservas de hoy)
export const selectIngresosHoy = (state: RootState) =>
  selectReservasHoy(state).reduce((total, r) => total + r.monto, 0);

// Ventas agrupadas por día (para el gráfico "Ventas del Día")
export const selectVentasPorDia = (state: RootState) => {
  const dias = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];
  const conteo: Record<string, number> = {};
  state.reservas.items.forEach((r) => {
    const diaSemana = dias[new Date(r.fecha).getDay()];
    conteo[diaSemana] = (conteo[diaSemana] || 0) + r.asientos.length;
  });
  return dias.map((dia) => ({ dia, entradas: conteo[dia] || 0 }));
};
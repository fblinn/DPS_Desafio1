import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type asientoEstatus = "disponible" | "ocupado" | "preferencial";

export interface Cliente {
  nombre: string;
  email: string;
  telefono: string;
}

export interface asientoEstatus {
  rows: string[];
  leftSeats: number;
  rightSeats: number;
  pricePerSeat: number;
  seats: Record<string, SeatStatus>;
  selected: string[];
  cliente: Cliente;
  isOpen: boolean;
}

const ROWS = ["A", "B", "C", "D", "E", "F", "G", "H"];
const LEFT_SEATS = 5;
const RIGHT_SEATS = 5;
const PRICE_PER_SEAT = 10;

const OCCUPIED = new Set(["B-2", "C-4", "D-3", "D-7", "E-5", "F-3", "F-8"]);
const PREFERENTIAL = new Set(["G-1", "G-2", "G-9", "G-10"]);

function buildSeats(): Record<string, asientoEstatus> {
  const seats: Record<string, SeatStatus> = {};
  const total = LEFT_SEATS + RIGHT_SEATS;
  ROWS.forEach((row) => {
    for (let i = 1; i <= total; i++) {
      const id = `${row}-${i}`;
      let status: SeatStatus = "disponible";
      if (OCCUPIED.has(id)) status = "ocupado";
      else if (PREFERENTIAL.has(id)) status = "preferencial";
      seats[id] = status;
    }
  });
  return seats;
}

const initialState: asientoEstatus = {
  rows: ROWS,
  leftSeats: LEFT_SEATS,
  rightSeats: RIGHT_SEATS,
  pricePerSeat: PRICE_PER_SEAT,
  seats: buildSeats(),
  selected: [],
  cliente: { nombre: "", email: "", telefono: "" },
  isOpen: false,
};

const asientoSlice = createSlice({
  name: "seats",
  initialState,
  reducers: {
    openModal(state) {
      state.isOpen = true;
    },
    closeModal(state) {
      state.isOpen = false;
    },
    toggleSeat(state, action: PayloadAction<string>) {
      const id = action.payload;
      if (state.seats[id] === "ocupado") return;

      const idx = state.selected.indexOf(id);
      if (idx >= 0) {
        state.selected.splice(idx, 1);
      } else {
        state.selected.push(id);
      }
    },
    updateCliente(state, action: PayloadAction<Partial<Cliente>>) {
      state.cliente = { ...state.cliente, ...action.payload };
    },
    resetSeleccion(state) {
      state.selected = [];
      state.cliente = { nombre: "", email: "", telefono: "" };
    },
    // Útil si vas a cargar el estado real de asientos desde tu API
    setSeats(state, action: PayloadAction<Record<string, SeatStatus>>) {
      state.seats = action.payload;
    },
  },
});

export const {
  openModal,
  closeModal,
  toggleSeat,
  updateCliente,
  resetSeleccion,
  setSeats,
} = seatsSlice.actions;

// Selectores
export const selectSeatsState = (state: { seats: SeatsState }) => state.seats;
export const selectTotal = (state: { seats: SeatsState }) =>
  state.seats.selected.length * state.seats.pricePerSeat;

export default seatsSlice.reducer;
// features/asientos/asientoThunks.ts
import type { AppDispatch, RootState } from "../../store";
import {
  abrirModal,
  marcarAsientosOcupados,
  establecerAsientos,
  construirAsientos,
} from "./asientoSlice";
import {
  cargarOcupadosDeFuncion,
  guardarOcupadosDeFuncion,
} from "../../utils/asientosStorage";

export function abrirModalConOcupados(payload: {
  peliculaId: string;
  salaId: string;
  salaNombre: string;
  fecha: string;
  hora: string;
}) {
  return (dispatch: AppDispatch) => {
    dispatch(abrirModal(payload));

    const ocupadosGuardados = cargarOcupadosDeFuncion(
      payload.peliculaId,
      payload.salaId,
      payload.fecha,
      payload.hora
    );

    dispatch(establecerAsientos(construirAsientos(ocupadosGuardados)));
  };
}

export function confirmarCompra(asientosSeleccionados: string[]) {
  return (
    dispatch: AppDispatch,
    getState: () => RootState
  ): { ok: boolean; conflicto: string[] } => {
    const { peliculaId, salaId, fecha, hora } = getState().asientos;

    if (!peliculaId || !salaId || !fecha || !hora) {
      return { ok: false, conflicto: [] };
    }

    // Revalidamos justo antes de confirmar, por si otra pestaña
    // ya ocupó alguno de estos asientos mientras tanto
    const ocupadosActuales = cargarOcupadosDeFuncion(
      peliculaId,
      salaId,
      fecha,
      hora
    );
    const conflicto = asientosSeleccionados.filter((id) =>
      ocupadosActuales.includes(id)
    );

    if (conflicto.length > 0) {
      dispatch(establecerAsientos(construirAsientos(ocupadosActuales)));
      return { ok: false, conflicto };
    }

    const nuevosOcupados = [...ocupadosActuales, ...asientosSeleccionados];
    guardarOcupadosDeFuncion(peliculaId, salaId, fecha, hora, nuevosOcupados);
    dispatch(marcarAsientosOcupados(asientosSeleccionados));

    return { ok: true, conflicto: [] };
  };
}
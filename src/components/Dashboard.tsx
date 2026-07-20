"use client";

import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store"; 
import {
  selectEntradasVendidasHoy,
  selectIngresosHoy,
  selectVentasPorDia,
} from "@/redux/slices/reservasSlice"; 
import {
  selectTotalFuncionesDisponibles,
  selectFuncionesAIniciar,
} from "@/redux/slices/salasSlice"; 
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DashboardProps {
  onNuevaVenta: () => void;
}

export default function Dashboard({ onNuevaVenta }: DashboardProps) {

  const totalPeliculas = useSelector(
    (state: RootState) => state.peliculas.lista.length
  );

  const peliculasActivas = useSelector(
    (state: RootState) =>
      state.peliculas.lista.filter((p) => p.estado === "disponible").length
  );

  const entradasVendidasHoy = useSelector(selectEntradasVendidasHoy);
  const ingresosGenerados = useSelector(selectIngresosHoy);
  const funcionesDisponibles = useSelector(selectTotalFuncionesDisponibles);
  const ventasSemana = useSelector(selectVentasPorDia);
  const funcionesAIniciar = useSelector(selectFuncionesAIniciar);

  const handleNuevaVenta = () => {
    console.log("TODO: abrir formulario / navegar a nueva venta");
  };

  return (
    <div className="dashboard">
      <div className="dashboard-cards">
        <TarjetaResumen
          titulo="Total Películas"
          valor={totalPeliculas}
          subtitulo={`${peliculasActivas} disponibles`}
        />
        <TarjetaResumen titulo="Entradas Vendidas Hoy" valor={entradasVendidasHoy} />
        <TarjetaResumen titulo="Ingresos Generados" valor={`$${ingresosGenerados}`} />
        <TarjetaResumen titulo="Funciones Disponibles" valor={funcionesDisponibles} />
      </div>

      {/* Botón nueva venta */}
      <div className="dashboard-actions">
        <button onClick={onNuevaVenta}  className="btn-primary">
          + NUEVA VENTA
        </button>
      </div>

      {/* ---------------------------------------------------------- */}
      {/* Gráfico + Funciones a iniciar */}
      {/* ---------------------------------------------------------- */}
      <div className="dashboard-panels">
        {/* Ventas del día */}
        <div className="dashboard-panel">
          <h2 className="dashboard-panel-title">Ventas del Día</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={ventasSemana}>
              <XAxis dataKey="dia" stroke="var(--text-muted)" />
              <YAxis stroke="var(--text-muted)" />
              <Tooltip
                contentStyle={{
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 6,
                  color: "var(--text-primary)",
                }}
              />
              <Line
                type="monotone"
                dataKey="entradas"
                stroke="var(--red)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Funciones a iniciar */}
        <div className="dashboard-panel">
          <h2 className="dashboard-panel-title">Funciones a Iniciar</h2>
          {funcionesAIniciar.length === 0 ? (
            <p className="dashboard-sin-datos">No hay funciones programadas para hoy.</p>
          ) : (
            <ul className="dashboard-funciones-list">
              {funcionesAIniciar.map((funcion) => (
                <li key={funcion.id} className="dashboard-funcion-row">
                  <span className="dashboard-funcion-pelicula">
                    {funcion.peliculaNombre} · {funcion.sala}
                  </span>
                  <span className="dashboard-funcion-hora">{funcion.hora}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------
// Tarjeta reutilizable
// ----------------------------------------------------------------
interface TarjetaResumenProps {
  titulo: string;
  valor: string | number;
  subtitulo?: string;
}

function TarjetaResumen({ titulo, valor, subtitulo }: TarjetaResumenProps) {
  return (
    <div className="dashboard-card">
      <span className="dashboard-card-title">{titulo}</span>
      <span className="dashboard-card-value">{valor}</span>
      {subtitulo && <span className="dashboard-card-subtitle">{subtitulo}</span>}
    </div>
  );
}
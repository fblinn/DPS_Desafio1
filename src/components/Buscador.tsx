'use client';

interface BuscadorProps {
  valor: string;
   // actualiza el valor de búsqueda
  onChange: (valor: string) => void;
}

// búsqueda en tiempo real
export default function Buscador({ valor, onChange }: BuscadorProps) {
  return (
    <input
      type="text"
      className="search-input"
      placeholder="Buscar por nombre, género, sala..."
      value={valor}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
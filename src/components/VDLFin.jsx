"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";

const DEMO_GASTOS = [
  { fecha: "2026-09-03", tipo_gasto: "Combustible", categoria: "Operación", concepto: "Carga diésel", monto: 18200, unidad: "VDL-01" },
  { fecha: "2026-10-10", tipo_gasto: "Mantenimiento", categoria: "Taller", concepto: "Servicio preventivo", monto: 12450, unidad: "VDL-02" },
  { fecha: "2026-10-18", tipo_gasto: "Casetas", categoria: "Ruta", concepto: "Autopista", monto: 4800, unidad: "VDL-01" },
  { fecha: "2026-11-04", tipo_gasto: "Combustible", categoria: "Operación", concepto: "Carga diésel", monto: 19500, unidad: "VDL-03" },
  { fecha: "2026-11-21", tipo_gasto: "Viáticos", categoria: "Operación", concepto: "Alimentos operador", monto: 2800, unidad: "VDL-02" },
  { fecha: "2026-12-06", tipo_gasto: "Mantenimiento", categoria: "Taller", concepto: "Cambio de aceite", monto: 16700, unidad: "VDL-01" },
  { fecha: "2027-01-08", tipo_gasto: "Combustible", categoria: "Operación", concepto: "Carga diésel", monto: 22100, unidad: "VDL-04" },
  { fecha: "2027-01-13", tipo_gasto: "Llantas", categoria: "Taller", concepto: "2 llantas", monto: 14200, unidad: "VDL-03" },
  { fecha: "2027-02-02", tipo_gasto: "Casetas", categoria: "Ruta", concepto: "Autopista", monto: 5200, unidad: "VDL-04" },
  { fecha: "2027-02-09", tipo_gasto: "Combustible", categoria: "Operación", concepto: "Carga diésel", monto: 23800, unidad: "VDL-02" },
  { fecha: "2027-02-14", tipo_gasto: "Mantenimiento", categoria: "Taller", concepto: "Frenos", monto: 18400, unidad: "VDL-01" },
];

const COLORS = {
  bg: "#F5F7F4",
  sidebar: "#0B1F17",
  sidebarSoft: "#143126",
  card: "#FFFFFF",
  border: "#E2E8E3",
  text: "#132019",
  muted: "#6B7A72",
  green: "#2E7D32",
  greenSoft: "#DDEEDC",
  greenMid: "#69A96D",
  greenStrong: "#0F5C2E",
  lime: "#74B72E",
};

const MENU = [
  {
    title: "DASHBOARD",
    items: [{ label: "Dashboard Financiero", active: true }],
  },
  {
    title: "CAPTURA DE DATOS",
    items: [
      { label: "Registrar gastos", badge: "Nuevo" },
      { label: "Unidades" },
      { label: "Operadores" },
      { label: "Proveedores" },
    ],
  },
  {
    title: "OPERACIÓN",
    items: [{ label: "Viajes" }, { label: "Reportes" }, { label: "Presupuestos" }],
  },
  {
    title: "SISTEMA",
    items: [{ label: "Configuración" }],
  },
];

export default function VDLFin() {
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGastos() {
      if (!supabase) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("gastos")
        .select("*")
        .order("fecha", { ascending: true });

      if (!error && data?.length) {
        setGastos(data);
      }

      setLoading(false);
    }

    loadGastos();
  }, []);

  const data = gastos.length ? gastos : DEMO_GASTOS;

  const totalGasto = useMemo(
    () => data.reduce((acc, item) => acc + Number(item.monto || 0), 0),
    [data]
  );

  const totalCombustible = useMemo(
    () =>
      data
        .filter((item) => normalize(item.tipo_gasto) === "combustible")
        .reduce((acc, item) => acc + Number(item.monto || 0), 0),
    [data]
  );

  const totalMantenimiento = useMemo(
    () =>
      data
        .filter((item) => {
          const tipo = normalize(item.tipo_gasto);
          return tipo === "mantenimiento" || tipo === "llantas";
        })
        .reduce((acc, item) => acc + Number(item.monto || 0), 0),
    [data]
  );

  const ticketPromedio = useMemo(
    () => (data.length ? totalGasto / data.length : 0),
    [data, totalGasto]
  );

  const presupuestoObjetivo = useMemo(() => {
    const base = Math.max(totalGasto, 100000);
    return Math.ceil((base / 0.82) / 1000) * 1000;
  }, [totalGasto]);

  const presupuestoUsado = useMemo(
    () => Math.min(100, Math.round((totalGasto / presupuestoObjetivo) * 100)),
    [totalGasto, presupuestoObjetivo]
  );

  const seriesMensual = useMemo(() => {
    const grouped = new Map();

    data.forEach((item) => {
      const d = new Date(`${item.fecha}T12:00:00`);
      if (Number.isNaN(d.getTime())) return;

      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = capitalize(
        new Intl.DateTimeFormat("es-MX", { month: "short" })
          .format(d)
          .replace(".", "")
      );

      if (!grouped.has(key)) grouped.set(key, { label, value: 0 });
      grouped.get(key).value += Number(item.monto || 0);
    });

    const rows = Array.from(grouped.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6)
      .map(([, value]) => value);

    return rows.length
      ? rows
      : [
          { label: "Sep", value: 62000 },
          { label: "Oct", value: 70400 },
          { label: "Nov", value: 68800 },
          { label: "Dic", value: 81100 },
          { label: "Ene", value: 64200 },
          { label: "Feb", value: 73000 },
        ];
  }, [data]);

  const seriesTipo = useMemo(() => {
    const grouped = new Map();

    data.forEach((item) => {
      const key = item.tipo_gasto || item.categoria || "Otros";
      if (!grouped.has(key)) grouped.set(key, 0);
      grouped.set(key, grouped.get(key) + Number(item.monto || 0));
    });

    const rows = Array.from(grouped.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    return rows.length
      ? rows
      : [
          { label: "Combustible", value: 72000 },
          { label: "Mantenimiento", value: 41800 },
          { label: "Casetas", value: 18200 },
          { label: "Viáticos", value: 9600 },
        ];
  }, [data]);

  const distribucion = useMemo(() => {
    const grouped = new Map();

    data.forEach((item) => {
      const key = item.categoria || item.tipo_gasto || "Otros";
      if (!grouped.has(key)) grouped.set(key, 0);
      grouped.set(key, grouped.get(key) + Number(item.monto || 0));
    });

    const total = Array.from(grouped.values()).reduce((a, b) => a + b, 0) || 1;

    const palette = ["#2E7D32", "#4A9B50", "#74B72E", "#0F5C2E", "#9BCF6A"];

    return Array.from(grouped.entries())
      .map(([label, value], index) => ({
        label,
        value,
        pct: Math.round((value / total) * 100),
        color: palette[index % palette.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [data]);

  const ultimosGastos = [...data]
    .sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)))
    .slice(0, 6);

  return (
    <main className="min-h-screen bg-[#F5F7F4] text-[#132019]">
      <div className="flex min-h-screen">
        <aside className="hidden w-[290px] shrink-0 border-r border-white/5 bg-[#0B1F17] text-white xl:block">
          <div className="border-b border-white/10 px-8 py-7">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#163629] text-lg font-bold text-[#74B72E]">
                V
              </div>
              <div>
                <div className="text-[28px] font-extrabold tracking-tight">VDL</div>
                <div className="-mt-1 text-sm text-white/65">Verde Diseño Logistic</div>
              </div>
            </div>
          </div>

          <div className="px-5 py-6">
            {MENU.map((group) => (
              <div key={group.title} className="mb-8">
                <p className="mb-3 px-3 text-[11px] font-bold tracking-[0.24em] text-white/35">
                  {group.title}
                </p>

                <div className="space-y-1.5">
                  {group.items.map((item) => (
                    <button
                      key={item.label}
                      className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition ${
                        item.active
                          ? "border-l-4 border-[#74B72E] bg-[#173428] text-white"
                          : "text-white/72 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span className="text-[17px] font-medium">{item.label}</span>
                      {item.badge ? (
                        <span className="rounded-full bg-[#2E7D32] px-2.5 py-1 text-[11px] font-bold text-white">
                          {item.badge}
                        </span>
                      ) : null}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-10 border-b border-[#E2E8E3] bg-[#F5F7F4]/95 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 md:px-8">
              <div className="relative w-full max-w-[520px]">
                <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7A72]">
                  ⌕
                </div>
                <input
                  className="h-14 w-full rounded-2xl border border-[#DDE5DD] bg-white pl-12 pr-4 text-[17px] text-[#132019] outline-none placeholder:text-[#7D8B84] focus:border-[#7CB342]"
                  placeholder="Buscar gasto, unidad, operador..."
                  readOnly
                />
              </div>

              <div className="flex items-center gap-4">
                <button className="relative flex h-11 w-11 items-center justify-center rounded-full border border-[#DDE5DD] bg-white text-xl text-[#516057]">
                  ⌁
                  <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-[#2E7D32]" />
                </button>

                <div className="flex items-center gap-3 rounded-2xl bg-white px-3 py-2">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#2E7D32] text-sm font-bold text-white">
                    VDL
                  </div>
                  <div>
                    <div className="text-[18px] font-bold text-[#132019]">OPS Verde Diseño</div>
                    <div className="text-sm text-[#6B7A72]">Control financiero</div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <div className="p-5 md:p-8">
            <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-[44px] font-extrabold tracking-tight text-[#132019]">
                  Dashboard VDL
                </h1>
                <p className="mt-1 text-xl text-[#6B7A72]">
                  Gastos de flotilla y operación · datos en tiempo real
                </p>
              </div>

              <div className="flex items-center gap-3">
                <select className="h-12 rounded-2xl border border-[#DDE5DD] bg-white px-4 text-[17px] font-semibold text-[#132019] outline-none">
                  <option>Febrero 2027</option>
                  <option>Enero 2027</option>
                  <option>Diciembre 2026</option>
                </select>

                <button className="h-12 rounded-2xl bg-[#2E7D32] px-5 text-[17px] font-bold text-white shadow-[0_10px_25px_rgba(46,125,50,0.18)] transition hover:bg-[#256A2A]">
                  Exportar
                </button>
              </div>
            </div>

            <div className="grid gap-5 xl:grid-cols-4">
              <StatCard
                title="Gasto total"
                value={money(totalGasto)}
                hint={loading ? "Conectando a Supabase..." : "Resumen acumulado"}
                icon="◫"
                accent="bg-[#DDEEDC] text-[#2E7D32]"
              />
              <StatCard
                title="Combustible"
                value={money(totalCombustible)}
                hint="Consumo operativo"
                icon="⛽"
                accent="bg-[#E9F6E8] text-[#2E7D32]"
              />
              <StatCard
                title="Mantenimiento"
                value={money(totalMantenimiento)}
                hint="Taller, llantas y servicio"
                icon="⚙"
                accent="bg-[#EDF7EA] text-[#0F5C2E]"
              />
              <StatCard
                title="Ticket promedio"
                value={money(ticketPromedio)}
                hint={`${data.length} registros`}
                icon="$"
                accent="bg-[#F1F8EC] text-[#74B72E]"
              />
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-[1.15fr_1.1fr_1.1fr]">
              <Panel title="% Presupuesto usado">
                <div className="flex h-full min-h-[260px] flex-col items-center justify-center">
                  <Gauge value={presupuestoUsado} />
                  <div className="mt-5 text-center">
                    <div className="text-[54px] font-extrabold leading-none text-[#132019]">
                      {presupuestoUsado}%
                    </div>
                    <div className="mt-2 text-lg text-[#6B7A72]">
                      Objetivo {money(presupuestoObjetivo)}
                    </div>
                  </div>
                </div>
              </Panel>

              <Panel title="Gasto por mes">
                <MiniBarChart
                  rows={seriesMensual}
                  color="#69A96D"
                  highlightColor="#2E7D32"
                  formatValue={moneyCompact}
                />
              </Panel>

              <Panel title="Top gasto por tipo">
                <CategoryBars rows={seriesTipo} />
              </Panel>
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
              <Panel title="Distribución del gasto por categoría">
                <div className="space-y-5">
                  <div className="overflow-hidden rounded-2xl bg-[#ECF1EC]">
                    <div className="flex h-12 w-full overflow-hidden rounded-2xl">
                      {distribucion.map((item) => (
                        <div
                          key={item.label}
                          style={{ width: `${item.pct}%`, backgroundColor: item.color }}
                          className="flex items-center justify-center text-sm font-bold text-white"
                          title={`${item.label}: ${item.pct}%`}
                        >
                          {item.pct >= 10 ? `${item.pct}%` : ""}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-x-6 gap-y-3">
                    {distribucion.map((item) => (
                      <div key={item.label} className="flex items-center gap-2 text-[17px]">
                        <span
                          className="h-4 w-4 rounded-md"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-[#6B7A72]">{item.label}:</span>
                        <span className="font-bold text-[#132019]">{money(item.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Panel>

              <Panel title="Últimos gastos">
                <div className="space-y-3">
                  {ultimosGastos.map((item, idx) => (
                    <div
                      key={`${item.fecha}-${item.concepto}-${idx}`}
                      className="flex items-center justify-between rounded-2xl border border-[#E2E8E3] bg-[#FBFCFA] px-4 py-3"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-[17px] font-semibold text-[#132019]">
                          {item.concepto}
                        </div>
                        <div className="mt-1 text-sm text-[#6B7A72]">
                          {item.tipo_gasto} · {item.fecha}
                        </div>
                      </div>

                      <div className="ml-4 text-right">
                        <div className="text-[18px] font-extrabold text-[#132019]">
                          {money(Number(item.monto || 0))}
                        </div>
                        <div className="text-sm text-[#6B7A72]">
                          {item.unidad || item.unidad_id || "Sin unidad"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({ title, value, hint, icon, accent }) {
  return (
    <div className="rounded-[28px] border border-[#E2E8E3] bg-white p-7 shadow-[0_12px_40px_rgba(18,32,25,0.05)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[17px] font-medium text-[#708078]">{title}</p>
          <h3 className="mt-7 text-[52px] font-extrabold tracking-tight text-[#132019]">
            {value}
          </h3>
          <p className="mt-2 text-[17px] text-[#6B7A72]">{hint}</p>
        </div>

        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl font-bold ${accent}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <div className="rounded-[28px] border border-[#E2E8E3] bg-white p-7 shadow-[0_12px_40px_rgba(18,32,25,0.05)]">
      <h3 className="mb-5 text-[30px] font-extrabold tracking-tight text-[#132019]">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Gauge({ value }) {
  const clamped = Math.max(0, Math.min(100, value));
  const circumference = 251.2;
  const progress = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative h-[180px] w-[280px]">
      <svg viewBox="0 0 200 120" className="h-full w-full">
        <path
          d="M20 100 A80 80 0 0 1 180 100"
          fill="none"
          stroke="#E5ECE6"
          strokeWidth="16"
          strokeLinecap="round"
        />
        <path
          d="M20 100 A80 80 0 0 1 180 100"
          fill="none"
          stroke="#2E7D32"
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={progress}
        />
      </svg>
    </div>
  );
}

function MiniBarChart({ rows, color, highlightColor, formatValue }) {
  const max = Math.max(...rows.map((r) => r.value), 1);

  return (
    <div className="flex min-h-[260px] items-end gap-4 pt-5">
      {rows.map((row, index) => {
        const isLast = index === rows.length - 1;
        const height = Math.max(48, (row.value / max) * 160);

        return (
          <div key={`${row.label}-${index}`} className="flex flex-1 flex-col items-center">
            <div className="mb-2 text-sm font-semibold text-[#7C8A83]">
              {formatValue(row.value)}
            </div>

            <div
              className="w-full rounded-t-2xl transition"
              style={{
                height,
                background: isLast
                  ? highlightColor
                  : `linear-gradient(180deg, ${color} 0%, #8DC78F 100%)`,
              }}
            />

            <div className="mt-3 text-[17px] font-medium text-[#6B7A72]">{row.label}</div>
          </div>
        );
      })}
    </div>
  );
}

function CategoryBars({ rows }) {
  const max = Math.max(...rows.map((r) => r.value), 1);

  return (
    <div className="space-y-5 pt-1">
      {rows.map((row, index) => {
        const width = `${Math.max(18, (row.value / max) * 100)}%`;
        const shades = ["#2E7D32", "#4A9B50", "#69A96D", "#74B72E", "#99C86B"];

        return (
          <div key={row.label}>
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-[17px] font-semibold text-[#132019]">{row.label}</span>
              <span className="text-[15px] text-[#6B7A72]">{moneyCompact(row.value)}</span>
            </div>

            <div className="h-4 overflow-hidden rounded-full bg-[#EDF2EE]">
              <div
                className="h-full rounded-full"
                style={{ width, backgroundColor: shades[index % shades.length] }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function normalize(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function capitalize(text) {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}

function money(value) {
  return Number(value || 0).toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  });
}

function moneyCompact(value) {
  const amount = Number(value || 0);

  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }

  if (amount >= 1000) {
    return `$${Math.round(amount / 1000)}k`;
  }

  return `$${amount}`;
}
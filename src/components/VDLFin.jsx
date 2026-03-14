"use client";

const COLORS = {
  bg: "#F5F7F4",
  sidebar: "#0B1F17",
  sidebarActive: "#173428",
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

export default function VDLFin() {
  const cards = [
    { title: "Gasto total", value: "$158,150", hint: "Resumen mensual", icon: "$" },
    { title: "Combustible", value: "$83,600", hint: "Consumo operativo", icon: "⛽" },
    { title: "Mantenimiento", value: "$47,550", hint: "Taller y llantas", icon: "⚙" },
    { title: "Ticket promedio", value: "$14,377", hint: "11 registros", icon: "◫" },
  ];

  const mensual = [
    { label: "Sep", value: 62000 },
    { label: "Oct", value: 70400 },
    { label: "Nov", value: 68800 },
    { label: "Dic", value: 81100 },
    { label: "Ene", value: 64200 },
    { label: "Feb", value: 73000 },
  ];

  const tipos = [
    { label: "Combustible", value: 83600 },
    { label: "Mantenimiento", value: 47550 },
    { label: "Casetas", value: 10000 },
    { label: "Viáticos", value: 7000 },
  ];

  const ultimos = [
    { concepto: "Carga diésel", tipo: "Combustible", fecha: "2027-02-09", monto: "$23,800", unidad: "VDL-02" },
    { concepto: "Frenos", tipo: "Mantenimiento", fecha: "2027-02-14", monto: "$18,400", unidad: "VDL-01" },
    { concepto: "Autopista", tipo: "Casetas", fecha: "2027-02-02", monto: "$5,200", unidad: "VDL-04" },
    { concepto: "2 llantas", tipo: "Llantas", fecha: "2027-01-13", monto: "$14,200", unidad: "VDL-03" },
  ];

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
            <Section title="DASHBOARD">
              <MenuItem active>Dashboard Financiero</MenuItem>
            </Section>

            <Section title="CAPTURA DE DATOS">
              <MenuItem badge="Nuevo">Registrar gastos</MenuItem>
              <MenuItem>Unidades</MenuItem>
              <MenuItem>Operadores</MenuItem>
              <MenuItem>Proveedores</MenuItem>
            </Section>

            <Section title="OPERACIÓN">
              <MenuItem>Viajes</MenuItem>
              <MenuItem>Reportes</MenuItem>
              <MenuItem>Presupuestos</MenuItem>
            </Section>

            <Section title="SISTEMA">
              <MenuItem>Configuración</MenuItem>
            </Section>
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
                  className="h-14 w-full rounded-2xl border border-[#DDE5DD] bg-white pl-12 pr-4 text-[17px] text-[#132019] outline-none placeholder:text-[#7D8B84]"
                  placeholder="Buscar gasto, unidad, operador..."
                  readOnly
                />
              </div>

              <div className="flex items-center gap-4">
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
                </select>

                <button className="h-12 rounded-2xl bg-[#2E7D32] px-5 text-[17px] font-bold text-white">
                  Exportar
                </button>
              </div>
            </div>

            <div className="grid gap-5 xl:grid-cols-4">
              {cards.map((card) => (
                <StatCard key={card.title} {...card} />
              ))}
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-[1.15fr_1.1fr_1.1fr]">
              <Panel title="% Presupuesto usado">
                <div className="flex h-full min-h-[260px] flex-col items-center justify-center">
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
                        strokeDasharray="251.2"
                        strokeDashoffset="45"
                      />
                    </svg>
                  </div>
                  <div className="mt-5 text-center">
                    <div className="text-[54px] font-extrabold leading-none text-[#132019]">82%</div>
                    <div className="mt-2 text-lg text-[#6B7A72]">Objetivo $193,000</div>
                  </div>
                </div>
              </Panel>

              <Panel title="Gasto por mes">
                <MiniBarChart rows={mensual} />
              </Panel>

              <Panel title="Top gasto por tipo">
                <CategoryBars rows={tipos} />
              </Panel>
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
              <Panel title="Distribución del gasto por categoría">
                <div className="space-y-5">
                  <div className="overflow-hidden rounded-2xl bg-[#ECF1EC]">
                    <div className="flex h-12 w-full overflow-hidden rounded-2xl">
                      <div className="flex w-[53%] items-center justify-center bg-[#2E7D32] text-sm font-bold text-white">53%</div>
                      <div className="flex w-[30%] items-center justify-center bg-[#69A96D] text-sm font-bold text-white">30%</div>
                      <div className="flex w-[10%] items-center justify-center bg-[#74B72E] text-sm font-bold text-white">10%</div>
                      <div className="flex w-[7%] items-center justify-center bg-[#0F5C2E] text-sm font-bold text-white">7%</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-x-6 gap-y-3">
                    <Legend color="#2E7D32" label="Operación" value="$83,600" />
                    <Legend color="#69A96D" label="Taller" value="$47,550" />
                    <Legend color="#74B72E" label="Ruta" value="$10,000" />
                    <Legend color="#0F5C2E" label="Viáticos" value="$7,000" />
                  </div>
                </div>
              </Panel>

              <Panel title="Últimos gastos">
                <div className="space-y-3">
                  {ultimos.map((item) => (
                    <div
                      key={`${item.fecha}-${item.concepto}`}
                      className="flex items-center justify-between rounded-2xl border border-[#E2E8E3] bg-[#FBFCFA] px-4 py-3"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-[17px] font-semibold text-[#132019]">
                          {item.concepto}
                        </div>
                        <div className="mt-1 text-sm text-[#6B7A72]">
                          {item.tipo} · {item.fecha}
                        </div>
                      </div>

                      <div className="ml-4 text-right">
                        <div className="text-[18px] font-extrabold text-[#132019]">
                          {item.monto}
                        </div>
                        <div className="text-sm text-[#6B7A72]">{item.unidad}</div>
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

function Section({ title, children }) {
  return (
    <div className="mb-8">
      <p className="mb-3 px-3 text-[11px] font-bold tracking-[0.24em] text-white/35">
        {title}
      </p>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function MenuItem({ children, active = false, badge }) {
  return (
    <button
      className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition ${
        active
          ? "border-l-4 border-[#74B72E] bg-[#173428] text-white"
          : "text-white/72 hover:bg-white/5 hover:text-white"
      }`}
    >
      <span className="text-[17px] font-medium">{children}</span>
      {badge ? (
        <span className="rounded-full bg-[#2E7D32] px-2.5 py-1 text-[11px] font-bold text-white">
          {badge}
        </span>
      ) : null}
    </button>
  );
}

function StatCard({ title, value, hint, icon }) {
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

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#DDEEDC] text-2xl font-bold text-[#2E7D32]">
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

function MiniBarChart({ rows }) {
  const max = Math.max(...rows.map((r) => r.value), 1);

  return (
    <div className="flex min-h-[260px] items-end gap-4 pt-5">
      {rows.map((row, index) => {
        const isLast = index === rows.length - 1;
        const height = Math.max(48, (row.value / max) * 160);

        return (
          <div key={row.label} className="flex flex-1 flex-col items-center">
            <div className="mb-2 text-sm font-semibold text-[#7C8A83]">
              ${Math.round(row.value / 1000)}k
            </div>
            <div
              className="w-full rounded-t-2xl"
              style={{
                height,
                background: isLast
                  ? "#2E7D32"
                  : "linear-gradient(180deg, #69A96D 0%, #8DC78F 100%)",
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
  const shades = ["#2E7D32", "#4A9B50", "#69A96D", "#74B72E"];

  return (
    <div className="space-y-5 pt-1">
      {rows.map((row, index) => (
        <div key={row.label}>
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-[17px] font-semibold text-[#132019]">{row.label}</span>
            <span className="text-[15px] text-[#6B7A72]">${Math.round(row.value / 1000)}k</span>
          </div>
          <div className="h-4 overflow-hidden rounded-full bg-[#EDF2EE]">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.max(18, (row.value / max) * 100)}%`,
                backgroundColor: shades[index % shades.length],
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function Legend({ color, label, value }) {
  return (
    <div className="flex items-center gap-2 text-[17px]">
      <span className="h-4 w-4 rounded-md" style={{ backgroundColor: color }} />
      <span className="text-[#6B7A72]">{label}:</span>
      <span className="font-bold text-[#132019]">{value}</span>
    </div>
  );
}
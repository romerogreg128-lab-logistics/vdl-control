"use client";

export default function VDLFin() {
  return (
    <main style={{ minHeight: "100vh", background: "#F8F9FC", display: "flex" }}>
      <aside
        style={{
          width: 260,
          background: "#0C1425",
          color: "white",
          padding: 24,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>VDL-FIN</h1>
        <p style={{ fontSize: 13, opacity: 0.8, margin: 0 }}>
          Control de gastos para transporte
        </p>

        <nav style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 10 }}>
          <button style={navBtnActive}>Dashboard</button>
          <button style={navBtn}>Gastos</button>
          <button style={navBtn}>Proveedores</button>
          <button style={navBtn}>Unidades</button>
          <button style={navBtn}>Operadores</button>
          <button style={navBtn}>Viajes</button>
        </nav>
      </aside>

      <section style={{ flex: 1, padding: 28 }}>
        <h2 style={{ fontSize: 30, fontWeight: 800, marginBottom: 8, color: "#0C1425" }}>
          Dashboard financiero
        </h2>
        <p style={{ color: "#7C8495", marginBottom: 24 }}>
          Base inicial de VDL-FIN.
        </p>

        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <Card title="Gasto mensual" value="$0" />
          <Card title="Combustible" value="$0" />
          <Card title="Mantenimiento" value="$0" />
          <Card title="Costo por km" value="$0" />
        </div>
      </section>
    </main>
  );
}

function Card({ title, value }) {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #E2E6EE",
        borderRadius: 14,
        padding: 20,
        minWidth: 220,
      }}
    >
      <p style={{ margin: 0, fontSize: 13, color: "#7C8495" }}>{title}</p>
      <h3 style={{ margin: "10px 0 0 0", fontSize: 28, color: "#0C1425" }}>{value}</h3>
    </div>
  );
}

const navBtn = {
  background: "transparent",
  color: "white",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 10,
  padding: "10px 14px",
  textAlign: "left",
  cursor: "pointer",
};

const navBtnActive = {
  ...navBtn,
  background: "#E63B2E",
  border: "1px solid #E63B2E",
};
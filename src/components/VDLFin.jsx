"use client";

import { useState, useMemo } from "react";

// ─── PALETA ORIGINAL VDL ───────────────────────────────────────────────────
const C = {
  bg:          "#F5F7F4",
  sidebar:     "#0B1F17",
  sidebarActive:"#173428",
  card:        "#FFFFFF",
  border:      "#E2E8E3",
  text:        "#132019",
  muted:       "#6B7A72",
  green:       "#2E7D32",
  greenSoft:   "#DDEEDC",
  greenMid:    "#69A96D",
  greenStrong: "#0F5C2E",
  lime:        "#74B72E",
};

// ─── CHIP COLORS ──────────────────────────────────────────────────────────
const CHIP_MAP = {
  Combustible:    { bg: "#E6F1FB", color: "#0C447C" },
  Gasolina:       { bg: "#E6F1FB", color: "#0C447C" },
  Caseta:         { bg: "#E2E8E3", color: "#4A5C52" },
  Nómina:         { bg: "#FAEEDA", color: "#633806" },
  Impuesto:       { bg: "#FCEBEB", color: "#791F1F" },
  Estacionamiento:{ bg: "#E2E8E3", color: "#4A5C52" },
  Otro:           { bg: "#E2E8E3", color: "#4A5C52" },
  Activo:         { bg: "#DDEEDC", color: "#1B5E20" },
  Pendiente:      { bg: "#FAEEDA", color: "#633806" },
  Vencido:        { bg: "#FCEBEB", color: "#791F1F" },
  Cancelado:      { bg: "#E2E8E3", color: "#4A5C52" },
  Tercera:        { bg: "#EEEDFE", color: "#3C3489" },
  Propia:         { bg: "#DDEEDC", color: "#1B5E20" },
  Moto:           { bg: "#E2E8E3", color: "#4A5C52" },
  Sedán:          { bg: "#E2E8E3", color: "#4A5C52" },
  "Small Van":    { bg: "#E6F1FB", color: "#0C447C" },
  Van:            { bg: "#E6F1FB", color: "#0C447C" },
  "Large Van":    { bg: "#E6F1FB", color: "#0C447C" },
};

// ─── HELPERS ──────────────────────────────────────────────────────────────
const fmt = (n) =>
  "$" + parseFloat(n || 0).toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const inRange = (fecha, desde, hasta) => {
  if (!fecha) return true;
  if (desde && fecha < desde) return false;
  if (hasta && fecha > hasta) return false;
  return true;
};

let _rutaCounter = 1000;
const nextRutaId = () => { _rutaCounter++; return `RTA-${_rutaCounter}`; };

// ─── COMPONENTS ───────────────────────────────────────────────────────────

function Chip({ label }) {
  if (!label) return <span style={{ color: C.muted, fontSize: 12 }}>—</span>;
  const s = CHIP_MAP[label] || { bg: "#E2E8E3", color: "#4A5C52" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "2px 10px", borderRadius: 20,
      fontSize: 11, fontWeight: 600,
      background: s.bg, color: s.color,
    }}>
      {label}
    </span>
  );
}

function IdBadge({ id }) {
  if (!id) return <span style={{ color: C.muted }}>—</span>;
  return (
    <span style={{
      fontFamily: "monospace", fontSize: 11,
      background: "#ECF1EC", color: C.muted,
      padding: "2px 7px", borderRadius: 5,
      border: `1px solid ${C.border}`,
    }}>
      {id}
    </span>
  );
}

function TagSelector({ options, selected, onSelect, multi = false }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {options.map((opt) => {
        const active = multi ? selected.includes(opt) : selected === opt;
        return (
          <button
            key={opt}
            onClick={() => onSelect(opt)}
            style={{
              padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 500,
              cursor: "pointer", border: `1px solid ${active ? C.green : C.border}`,
              background: active ? C.green : C.card,
              color: active ? "#fff" : C.muted,
              transition: "all 0.15s",
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function Field({ label, children, span2 = false }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, gridColumn: span2 ? "span 2" : undefined }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  padding: "8px 12px", borderRadius: 10, border: `1px solid ${C.border}`,
  fontSize: 13, color: C.text, background: C.card,
  outline: "none", fontFamily: "inherit", width: "100%",
};

function Input({ ...props }) {
  return <input style={inputStyle} {...props} />;
}

function Textarea({ ...props }) {
  return <textarea style={{ ...inputStyle, resize: "vertical", minHeight: 56 }} {...props} />;
}

function EmptyRow({ cols, msg }) {
  return (
    <tr>
      <td colSpan={cols} style={{ textAlign: "center", padding: "32px 20px", color: C.muted, fontSize: 13 }}>
        {msg || "Sin registros"}
      </td>
    </tr>
  );
}

function Th({ children }) {
  return (
    <th style={{
      padding: "9px 12px", textAlign: "left", fontSize: 11, fontWeight: 600,
      color: C.muted, background: "#F0F4F0", borderBottom: `1px solid ${C.border}`,
      whiteSpace: "nowrap",
    }}>
      {children}
    </th>
  );
}

function Td({ children, bold }) {
  return (
    <td style={{
      padding: "9px 12px", fontSize: 12, color: C.text,
      borderBottom: `1px solid ${C.border}`,
      fontWeight: bold ? 600 : 400,
    }}>
      {children}
    </td>
  );
}

function FormPanel({ visible, title, children }) {
  if (!visible) return null;
  return (
    <div style={{
      background: "#EFF3EF", border: `1px solid ${C.border}`,
      borderRadius: 20, padding: 20, marginBottom: 16,
    }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 14,
        paddingBottom: 10, borderBottom: `1px solid ${C.border}`, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function BtnRow({ onCancel, onSave }) {
  return (
    <div style={{ display: "flex", gap: 8, marginTop: 16, justifyContent: "flex-end" }}>
      <button onClick={onCancel} style={{
        padding: "8px 18px", borderRadius: 12, fontSize: 13, fontWeight: 500,
        cursor: "pointer", border: `1px solid ${C.border}`, background: "transparent", color: C.muted,
      }}>
        Cancelar
      </button>
      <button onClick={onSave} style={{
        padding: "8px 18px", borderRadius: 12, fontSize: 13, fontWeight: 600,
        cursor: "pointer", border: "none", background: C.green, color: "#fff",
      }}>
        Guardar
      </button>
    </div>
  );
}

// ─── KPI CARD ─────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, badge, badgeType }) {
  const badgeColors = {
    up:   { bg: C.greenSoft, color: C.greenStrong },
    down: { bg: "#FCEBEB",   color: "#791F1F" },
    neu:  { bg: "#ECF1EC",   color: C.muted },
  };
  const bc = badgeColors[badgeType] || badgeColors.neu;
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`,
      borderRadius: 24, padding: "18px 20px",
      boxShadow: "0 4px 20px rgba(18,32,25,0.06)",
    }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: C.text, lineHeight: 1, marginBottom: 4 }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>{sub}</div>
      {badge && (
        <span style={{
          display: "inline-flex", alignItems: "center",
          padding: "3px 10px", borderRadius: 20,
          fontSize: 11, fontWeight: 600,
          background: bc.bg, color: bc.color,
        }}>
          {badge}
        </span>
      )}
    </div>
  );
}

// ─── NAV ITEM ─────────────────────────────────────────────────────────────
function NavItem({ label, active, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        width: "100%", padding: "10px 16px",
        background: active ? C.sidebarActive : "transparent",
        border: "none", borderLeft: active ? `3px solid ${C.lime}` : "3px solid transparent",
        color: active ? "#fff" : "rgba(255,255,255,0.65)",
        fontSize: 14, fontWeight: active ? 600 : 400,
        cursor: "pointer", textAlign: "left", transition: "all 0.15s",
        borderRadius: active ? "0 10px 10px 0" : 0,
      }}
    >
      <span>{label}</span>
      {badge && (
        <span style={{
          background: C.green, color: "#fff",
          fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
        }}>
          {badge}
        </span>
      )}
    </button>
  );
}

// ─── MODULE META ──────────────────────────────────────────────────────────
const MOD_META = {
  ingresos:   { title: "Ingresos",   sub: "Registro de facturas y cobros" },
  gastos:     { title: "Gastos",     sub: "Control de egresos operativos" },
  operadores: { title: "Operadores", sub: "Registro de conductores y asignación" },
  rutas:      { title: "Rutas",      sub: "Registro de viajes con ID automático" },
  unidades:   { title: "Unidades",   sub: "Registro de vehículos de la flotilla" },
};

// ─── MÓDULO INGRESOS ──────────────────────────────────────────────────────
function ModIngresos({ data, setData, desde, hasta }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ factura: "", periodo: "", siniva: "", coniva: "", fcarga: "", fvence: "", estatus: "", notas: "" });

  const set = (k, v) => setForm(f => {
    const next = { ...f, [k]: v };
    if (k === "siniva") next.coniva = v ? (parseFloat(v) * 1.16).toFixed(2) : "";
    return next;
  });

  const save = () => {
    if (!form.factura || !form.siniva) { alert("Completa factura y monto"); return; }
    setData(d => [...d, { ...form }]);
    setForm({ factura: "", periodo: "", siniva: "", coniva: "", fcarga: "", fvence: "", estatus: "", notas: "" });
    setOpen(false);
  };

  const rows = useMemo(() => data.filter(r => inRange(r.fcarga, desde, hasta)), [data, desde, hasta]);

  return (
    <div>
      <FormPanel visible={open} title="Nuevo ingreso">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Factura"><Input placeholder="FAC-2025-001" value={form.factura} onChange={e => set("factura", e.target.value)} /></Field>
          <Field label="Período"><Input placeholder="Feb 2025" value={form.periodo} onChange={e => set("periodo", e.target.value)} /></Field>
          <Field label="Monto sin IVA"><Input type="number" placeholder="0.00" value={form.siniva} onChange={e => set("siniva", e.target.value)} /></Field>
          <Field label="Monto con IVA (16%)"><Input type="number" value={form.coniva} readOnly style={{ ...inputStyle, background: "#EFF3EF" }} /></Field>
          <Field label="Fecha de carga"><Input type="date" value={form.fcarga} onChange={e => set("fcarga", e.target.value)} /></Field>
          <Field label="Fecha de vencimiento"><Input type="date" value={form.fvence} onChange={e => set("fvence", e.target.value)} /></Field>
          <Field label="Estatus" span2>
            <TagSelector
              options={["Activo", "Pendiente", "Vencido", "Cancelado"]}
              selected={form.estatus}
              onSelect={v => set("estatus", v)}
            />
          </Field>
          <Field label="Notas" span2>
            <Textarea placeholder="Observaciones adicionales..." value={form.notas} onChange={e => set("notas", e.target.value)} />
          </Field>
        </div>
        <BtnRow onCancel={() => setOpen(false)} onSave={save} />
      </FormPanel>

      {!open && (
        <button onClick={() => setOpen(true)} style={{
          marginBottom: 14, padding: "8px 18px", borderRadius: 12,
          background: C.green, color: "#fff", border: "none",
          fontSize: 13, fontWeight: 600, cursor: "pointer",
        }}>
          + Nuevo ingreso
        </button>
      )}

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr><Th>Factura</Th><Th>Período</Th><Th>Sin IVA</Th><Th>Con IVA</Th><Th>F. Carga</Th><Th>Vencimiento</Th><Th>Estatus</Th><Th>Notas</Th></tr>
          </thead>
          <tbody>
            {rows.length === 0 ? <EmptyRow cols={8} msg="Sin ingresos en este período" /> :
              rows.map((r, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? C.card : "#FAFCFA" }}>
                  <Td bold>{r.factura}</Td>
                  <Td>{r.periodo || "—"}</Td>
                  <Td>{fmt(r.siniva)}</Td>
                  <Td>{fmt(r.coniva)}</Td>
                  <Td>{r.fcarga || "—"}</Td>
                  <Td>{r.fvence || "—"}</Td>
                  <Td><Chip label={r.estatus} /></Td>
                  <Td><span style={{ color: C.muted, fontSize: 11, display: "block", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.notas || "—"}</span></Td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── MÓDULO GASTOS ────────────────────────────────────────────────────────
function ModGastos({ data, setData, desde, hasta }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ monto: "", tipo: "", fecha: "", ruta: "", unidad: "", operador: "" });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = () => {
    if (!form.monto) { alert("Ingresa el monto"); return; }
    setData(d => [...d, { ...form }]);
    setForm({ monto: "", tipo: "", fecha: "", ruta: "", unidad: "", operador: "" });
    setOpen(false);
  };

  const rows = useMemo(() => data.filter(r => inRange(r.fecha, desde, hasta)), [data, desde, hasta]);

  return (
    <div>
      <FormPanel visible={open} title="Nuevo gasto">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Monto"><Input type="number" placeholder="0.00" value={form.monto} onChange={e => set("monto", e.target.value)} /></Field>
          <Field label="Fecha"><Input type="date" value={form.fecha} onChange={e => set("fecha", e.target.value)} /></Field>
          <Field label="ID Ruta"><Input placeholder="RTA-1001" value={form.ruta} onChange={e => set("ruta", e.target.value)} /></Field>
          <Field label="Unidad"><Input placeholder="VDL-01" value={form.unidad} onChange={e => set("unidad", e.target.value)} /></Field>
          <Field label="Operador"><Input placeholder="Nombre operador" value={form.operador} onChange={e => set("operador", e.target.value)} /></Field>
          <div />
          <Field label="Tipo de gasto" span2>
            <TagSelector
              options={["Nómina", "Combustible", "Impuesto", "Gasolina", "Estacionamiento", "Caseta", "Otro"]}
              selected={form.tipo}
              onSelect={v => set("tipo", v)}
            />
          </Field>
        </div>
        <BtnRow onCancel={() => setOpen(false)} onSave={save} />
      </FormPanel>

      {!open && (
        <button onClick={() => setOpen(true)} style={{
          marginBottom: 14, padding: "8px 18px", borderRadius: 12,
          background: C.green, color: "#fff", border: "none",
          fontSize: 13, fontWeight: 600, cursor: "pointer",
        }}>
          + Nuevo gasto
        </button>
      )}

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr><Th>Fecha</Th><Th>Monto</Th><Th>Tipo</Th><Th>ID Ruta</Th><Th>Unidad</Th><Th>Operador</Th></tr>
          </thead>
          <tbody>
            {rows.length === 0 ? <EmptyRow cols={6} msg="Sin gastos en este período" /> :
              rows.map((r, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? C.card : "#FAFCFA" }}>
                  <Td>{r.fecha || "—"}</Td>
                  <Td bold>{fmt(r.monto)}</Td>
                  <Td><Chip label={r.tipo} /></Td>
                  <Td><IdBadge id={r.ruta} /></Td>
                  <Td>{r.unidad || "—"}</Td>
                  <Td>{r.operador || "—"}</Td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── MÓDULO OPERADORES ────────────────────────────────────────────────────
function ModOperadores({ data, setData }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ nombre: "", economico: "", unidad: "", tipo: "", tunidad: "" });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = () => {
    if (!form.nombre) { alert("Ingresa el nombre"); return; }
    setData(d => [...d, { ...form }]);
    setForm({ nombre: "", economico: "", unidad: "", tipo: "", tunidad: "" });
    setOpen(false);
  };

  return (
    <div>
      <FormPanel visible={open} title="Nuevo operador">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Nombre completo"><Input placeholder="Nombre del operador" value={form.nombre} onChange={e => set("nombre", e.target.value)} /></Field>
          <Field label="Económico"><Input placeholder="ECO-001" value={form.economico} onChange={e => set("economico", e.target.value)} /></Field>
          <Field label="Unidad asignada"><Input placeholder="VDL-01" value={form.unidad} onChange={e => set("unidad", e.target.value)} /></Field>
          <div />
          <Field label="Tipo de operador">
            <TagSelector options={["Tercera", "Propia"]} selected={form.tipo} onSelect={v => set("tipo", v)} />
          </Field>
          <Field label="Tipo de unidad">
            <TagSelector options={["Moto", "Sedán", "Small Van", "Van", "Large Van", "Otro"]} selected={form.tunidad} onSelect={v => set("tunidad", v)} />
          </Field>
        </div>
        <BtnRow onCancel={() => setOpen(false)} onSave={save} />
      </FormPanel>

      {!open && (
        <button onClick={() => setOpen(true)} style={{
          marginBottom: 14, padding: "8px 18px", borderRadius: 12,
          background: C.green, color: "#fff", border: "none",
          fontSize: 13, fontWeight: 600, cursor: "pointer",
        }}>
          + Nuevo operador
        </button>
      )}

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr><Th>Nombre</Th><Th>Unidad</Th><Th>Económico</Th><Th>Tipo</Th><Th>Tipo de unidad</Th></tr>
          </thead>
          <tbody>
            {data.length === 0 ? <EmptyRow cols={5} msg="Sin operadores registrados" /> :
              data.map((r, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? C.card : "#FAFCFA" }}>
                  <Td bold>{r.nombre}</Td>
                  <Td>{r.unidad || "—"}</Td>
                  <Td><IdBadge id={r.economico} /></Td>
                  <Td><Chip label={r.tipo} /></Td>
                  <Td><Chip label={r.tunidad} /></Td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── MÓDULO RUTAS ─────────────────────────────────────────────────────────
function ModRutas({ data, setData, desde, hasta }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ fecha: "", cliente: "", operador: "", unidad: "" });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = () => {
    if (!form.cliente) { alert("Ingresa el cliente"); return; }
    setData(d => [...d, { ...form, id: nextRutaId() }]);
    setForm({ fecha: "", cliente: "", operador: "", unidad: "" });
    setOpen(false);
  };

  const rows = useMemo(() => data.filter(r => inRange(r.fecha, desde, hasta)), [data, desde, hasta]);

  return (
    <div>
      <FormPanel visible={open} title="Nueva ruta — ID generado automáticamente">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Fecha"><Input type="date" value={form.fecha} onChange={e => set("fecha", e.target.value)} /></Field>
          <Field label="Cliente"><Input placeholder="Nombre del cliente" value={form.cliente} onChange={e => set("cliente", e.target.value)} /></Field>
          <Field label="Operador"><Input placeholder="Nombre operador" value={form.operador} onChange={e => set("operador", e.target.value)} /></Field>
          <Field label="Unidad"><Input placeholder="VDL-01" value={form.unidad} onChange={e => set("unidad", e.target.value)} /></Field>
        </div>
        <BtnRow onCancel={() => setOpen(false)} onSave={save} />
      </FormPanel>

      {!open && (
        <button onClick={() => setOpen(true)} style={{
          marginBottom: 14, padding: "8px 18px", borderRadius: 12,
          background: C.green, color: "#fff", border: "none",
          fontSize: 13, fontWeight: 600, cursor: "pointer",
        }}>
          + Nueva ruta
        </button>
      )}

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr><Th>ID Ruta</Th><Th>Fecha</Th><Th>Operador</Th><Th>Unidad</Th><Th>Cliente</Th></tr>
          </thead>
          <tbody>
            {rows.length === 0 ? <EmptyRow cols={5} msg="Sin rutas en este período" /> :
              rows.map((r, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? C.card : "#FAFCFA" }}>
                  <Td><IdBadge id={r.id} /></Td>
                  <Td>{r.fecha || "—"}</Td>
                  <Td>{r.operador || "—"}</Td>
                  <Td>{r.unidad || "—"}</Td>
                  <Td bold>{r.cliente}</Td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── MÓDULO UNIDADES ──────────────────────────────────────────────────────
function ModUnidades({ data, setData }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ economico: "", tipo: "", prop: "" });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = () => {
    if (!form.economico) { alert("Ingresa el económico"); return; }
    setData(d => [...d, { ...form }]);
    setForm({ economico: "", tipo: "", prop: "" });
    setOpen(false);
  };

  return (
    <div>
      <FormPanel visible={open} title="Nueva unidad">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Económico"><Input placeholder="VDL-01" value={form.economico} onChange={e => set("economico", e.target.value)} /></Field>
          <div />
          <Field label="Tipo de unidad">
            <TagSelector options={["Moto", "Sedán", "Small Van", "Van", "Large Van", "Otro"]} selected={form.tipo} onSelect={v => set("tipo", v)} />
          </Field>
          <Field label="Propiedad">
            <TagSelector options={["Propia", "Tercera"]} selected={form.prop} onSelect={v => set("prop", v)} />
          </Field>
        </div>
        <BtnRow onCancel={() => setOpen(false)} onSave={save} />
      </FormPanel>

      {!open && (
        <button onClick={() => setOpen(true)} style={{
          marginBottom: 14, padding: "8px 18px", borderRadius: 12,
          background: C.green, color: "#fff", border: "none",
          fontSize: 13, fontWeight: 600, cursor: "pointer",
        }}>
          + Nueva unidad
        </button>
      )}

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr><Th>Económico</Th><Th>Tipo</Th><Th>Propiedad</Th></tr>
          </thead>
          <tbody>
            {data.length === 0 ? <EmptyRow cols={3} msg="Sin unidades registradas" /> :
              data.map((r, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? C.card : "#FAFCFA" }}>
                  <Td><IdBadge id={r.economico} /></Td>
                  <Td><Chip label={r.tipo} /></Td>
                  <Td><Chip label={r.prop} /></Td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── ROOT COMPONENT ───────────────────────────────────────────────────────
export default function VDLModulos() {
  const [mod, setMod]           = useState("ingresos");
  const [ingresos, setIngresos] = useState([]);
  const [gastos, setGastos]     = useState([]);
  const [operadores, setOp]     = useState([]);
  const [rutas, setRutas]       = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [desde, setDesde]       = useState("");
  const [hasta, setHasta]       = useState("");

  // KPIs calculados
  const kpi = useMemo(() => {
    const ingFilt = ingresos.filter(r => inRange(r.fcarga, desde, hasta));
    const gasFilt = gastos.filter(r => inRange(r.fecha, desde, hasta));
    const rutFilt = rutas.filter(r => inRange(r.fecha, desde, hasta));

    const totalIng = ingFilt.reduce((s, r) => s + parseFloat(r.coniva || 0), 0);
    const totalGas = gasFilt.reduce((s, r) => s + parseFloat(r.monto || 0), 0);
    const util     = totalIng - totalGas;
    const pct      = totalIng > 0 ? Math.round(util / totalIng * 100) : 0;

    return { totalIng, totalGas, util, pct, ingN: ingFilt.length, gasN: gasFilt.length, rutN: rutFilt.length };
  }, [ingresos, gastos, rutas, desde, hasta]);

  const navItems = [
    { id: "ingresos",   label: "Ingresos" },
    { id: "gastos",     label: "Gastos" },
    { id: "operadores", label: "Operadores" },
    { id: "rutas",      label: "Rutas" },
    { id: "unidades",   label: "Unidades" },
  ];

  return (
    <main style={{ minHeight: "100vh", background: C.bg, display: "flex" }}>
      {/* ── SIDEBAR ── */}
      <aside style={{
        width: 230, flexShrink: 0, background: C.sidebar, color: "#fff",
        display: "flex", flexDirection: "column",
      }}>
        {/* Logo */}
        <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 40, height: 40, background: "#163629", borderRadius: 12,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, fontWeight: 800, color: C.lime,
            }}>V</div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em" }}>VDL</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: -2 }}>Verde Diseño Logistic</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: "16px 0", flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", color: "rgba(255,255,255,0.3)", padding: "0 20px", marginBottom: 8 }}>
            MÓDULOS
          </div>
          {navItems.map(item => (
            <NavItem key={item.id} label={item.label} active={mod === item.id} onClick={() => setMod(item.id)} />
          ))}
        </nav>

        <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.08)", fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
          VDL · Control Financiero
        </div>
      </aside>

      {/* ── MAIN ── */}
      <section style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>

        {/* ── KPI DASHBOARD ── */}
        <div style={{ padding: "20px 28px 0" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 14, marginBottom: 20 }}>
            <KpiCard
              label="Ingresos"
              value={fmt(kpi.totalIng)}
              sub={`${kpi.ingN} factura${kpi.ingN !== 1 ? "s" : ""} · con IVA`}
              badge="▲ Cobros"
              badgeType="up"
            />
            <KpiCard
              label="Gastos"
              value={fmt(kpi.totalGas)}
              sub={`${kpi.gasN} registro${kpi.gasN !== 1 ? "s" : ""} · operativos`}
              badge="Egresos"
              badgeType={kpi.totalGas > 0 ? "down" : "neu"}
            />
            <KpiCard
              label="Utilidad"
              value={fmt(kpi.util)}
              sub={`Margen ${kpi.pct}%`}
              badge={kpi.totalIng === 0 && kpi.totalGas === 0 ? "Sin datos" : kpi.util >= 0 ? "▲ Positiva" : "▼ Negativa"}
              badgeType={kpi.totalIng === 0 && kpi.totalGas === 0 ? "neu" : kpi.util >= 0 ? "up" : "down"}
            />
            <KpiCard
              label="Rutas"
              value={kpi.rutN}
              sub="en el período"
              badge="Viajes"
              badgeType="neu"
            />
          </div>
        </div>

        {/* ── FILTRO POR FECHA ── */}
        <div style={{
          padding: "12px 28px",
          borderTop: `1px solid ${C.border}`,
          borderBottom: `1px solid ${C.border}`,
          background: "#EFF4EF",
          display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
        }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Filtrar por fecha
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <label style={{ fontSize: 12, color: C.muted }}>Desde</label>
            <input
              type="date" value={desde} onChange={e => setDesde(e.target.value)}
              style={{ ...inputStyle, width: "auto", fontSize: 12, padding: "6px 10px" }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <label style={{ fontSize: 12, color: C.muted }}>Hasta</label>
            <input
              type="date" value={hasta} onChange={e => setHasta(e.target.value)}
              style={{ ...inputStyle, width: "auto", fontSize: 12, padding: "6px 10px" }}
            />
          </div>
          <button onClick={() => { setDesde(""); setHasta(""); }} style={{
            padding: "6px 14px", borderRadius: 10, fontSize: 12, fontWeight: 500,
            cursor: "pointer", border: `1px solid ${C.border}`, background: C.card, color: C.muted,
          }}>
            Limpiar
          </button>
          <span style={{ fontSize: 11, color: C.muted, marginLeft: "auto" }}>
            {desde || hasta ? `Filtrado: ${desde || "inicio"} → ${hasta || "hoy"}` : "Mostrando todos los registros"}
          </span>
        </div>

        {/* ── MODULE HEADER ── */}
        <div style={{
          padding: "16px 28px", borderBottom: `1px solid ${C.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: C.text, letterSpacing: "-0.02em" }}>
              {MOD_META[mod].title}
            </h2>
            <p style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>{MOD_META[mod].sub}</p>
          </div>
        </div>

        {/* ── MODULE CONTENT ── */}
        <div style={{ flex: 1, padding: "20px 28px", overflowY: "auto" }}>
          {mod === "ingresos"   && <ModIngresos   data={ingresos}   setData={setIngresos} desde={desde} hasta={hasta} />}
          {mod === "gastos"     && <ModGastos     data={gastos}     setData={setGastos}   desde={desde} hasta={hasta} />}
          {mod === "operadores" && <ModOperadores data={operadores} setData={setOp} />}
          {mod === "rutas"      && <ModRutas      data={rutas}      setData={setRutas}    desde={desde} hasta={hasta} />}
          {mod === "unidades"   && <ModUnidades   data={unidades}   setData={setUnidades} />}
        </div>
      </section>
    </main>
  );
}
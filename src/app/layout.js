"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
// Font loaded via next/font or <link> in layout — uses system stack as fallback
import { createClient } from "@supabase/supabase-js";

// ─── SUPABASE CLIENT ──────────────────────────────────────────────────────
// Reemplaza estos valores con los de tu proyecto:
// Supabase → Project Settings → API → Project URL y anon public key
const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL  || "https://TU_PROYECTO.supabase.co";
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "TU_ANON_KEY";
const sb = createClient(SUPABASE_URL, SUPABASE_ANON);

// ─── PALETA ───────────────────────────────────────────────────────────────
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
  greenStrong: "#0F5C2E",
  lime:        "#74B72E",
};

const CHIP_MAP = {
  // tipo_gasto values (real column name in gastos table)
  Combustible:    { bg: "#E6F1FB", color: "#0C447C" },
  Gasolina:       { bg: "#E6F1FB", color: "#0C447C" },
  Caseta:         { bg: "#E2E8E3", color: "#4A5C52" },
  "Nómina":       { bg: "#FAEEDA", color: "#633806" },
  Impuesto:       { bg: "#FCEBEB", color: "#791F1F" },
  Estacionamiento:{ bg: "#E2E8E3", color: "#4A5C52" },
  Mantenimiento:  { bg: "#EEEDFE", color: "#3C3489" },
  Llantas:        { bg: "#EEEDFE", color: "#3C3489" },
  Otro:           { bg: "#E2E8E3", color: "#4A5C52" },
  Pagado:         { bg: "#DDEEDC", color: "#1B5E20" },
  "Por pagar":    { bg: "#FAEEDA", color: "#633806" },
  "En revisión":  { bg: "#E6F1FB", color: "#0C447C" },
  // estatus
  Activo:         { bg: "#DDEEDC", color: "#1B5E20" },
  Pendiente:      { bg: "#FAEEDA", color: "#633806" },
  Vencido:        { bg: "#FCEBEB", color: "#791F1F" },
  Cancelado:      { bg: "#E2E8E3", color: "#4A5C52" },
  "En taller":    { bg: "#FAEEDA", color: "#633806" },
  Inactivo:       { bg: "#E2E8E3", color: "#4A5C52" },
  Vacaciones:     { bg: "#E6F1FB", color: "#0C447C" },
  Baja:           { bg: "#FCEBEB", color: "#791F1F" },
  // tipo_unidad
  Tercera:        { bg: "#EEEDFE", color: "#3C3489" },
  Propia:         { bg: "#DDEEDC", color: "#1B5E20" },
  Moto:           { bg: "#E2E8E3", color: "#4A5C52" },
  "Sedán":        { bg: "#E2E8E3", color: "#4A5C52" },
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

// Sincronizar contador con el máximo ID existente en Supabase
async function syncRutaCounter() {
  const { data } = await sb.from("rutas").select("id").order("created_at", { ascending: false }).limit(50);
  if (!data || data.length === 0) return;
  const nums = data
    .map(r => parseInt(r.id?.replace("RTA-", "") || "0"))
    .filter(n => !isNaN(n));
  if (nums.length > 0) _rutaCounter = Math.max(...nums);
}

// ─── SHARED STYLES ────────────────────────────────────────────────────────
const inputStyle = {
  padding: "8px 12px", borderRadius: 10, border: "1px solid #E2E8E3",
  fontSize: 13, color: "#132019", background: "#FFFFFF",
  outline: "none", fontFamily: "inherit", width: "100%", boxSizing: "border-box",
};
const selectStyle = {
  ...inputStyle,
  appearance: "none", WebkitAppearance: "none",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236B7A72' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center",
  paddingRight: 34, cursor: "pointer",
};

// ─── BASE COMPONENTS ──────────────────────────────────────────────────────

function Chip({ label }) {
  if (!label) return <span style={{ color: C.muted, fontSize: 12 }}>—</span>;
  const s = CHIP_MAP[label] || { bg: "#E2E8E3", color: "#4A5C52" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: s.bg, color: s.color }}>
      {label}
    </span>
  );
}

function IdBadge({ id }) {
  if (!id) return <span style={{ color: C.muted }}>—</span>;
  return <span style={{ fontFamily: "monospace", fontSize: 11, background: "#ECF1EC", color: C.muted, padding: "2px 7px", borderRadius: 5, border: "1px solid #E2E8E3" }}>{id}</span>;
}

function Select({ value, onChange, options, placeholder = "Seleccionar...", disabled = false }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} disabled={disabled}
      style={{ ...selectStyle, color: value ? C.text : C.muted, opacity: disabled ? 0.5 : 1, cursor: disabled ? "not-allowed" : "pointer" }}>
      <option value="">{placeholder}</option>
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  );
}

function Field({ label, children, span2 = false }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, gridColumn: span2 ? "span 2" : undefined }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>
      {children}
    </div>
  );
}

function Input(props) { return <input style={inputStyle} {...props} />; }
function Textarea(props) { return <textarea style={{ ...inputStyle, resize: "vertical", minHeight: 56 }} {...props} />; }

function EmptyRow({ cols, msg }) {
  return <tr><td colSpan={cols} style={{ textAlign: "center", padding: "32px 20px", color: C.muted, fontSize: 13 }}>{msg || "Sin registros"}</td></tr>;
}

function Th({ children }) {
  return <th style={{ padding: "9px 12px", textAlign: "left", fontSize: 11, fontWeight: 600, color: C.muted, background: "#F0F4F0", borderBottom: "1px solid #E2E8E3", whiteSpace: "nowrap" }}>{children}</th>;
}

function Td({ children, bold }) {
  return <td style={{ padding: "9px 12px", fontSize: 12, color: C.text, borderBottom: "1px solid #E2E8E3", fontWeight: bold ? 600 : 400, verticalAlign: "middle" }}>{children}</td>;
}

function RowActions({ onEdit, onDelete }) {
  return (
    <td style={{ padding: "6px 12px", borderBottom: "1px solid #E2E8E3", whiteSpace: "nowrap" }}>
      <div style={{ display: "flex", gap: 6 }}>
        <button onClick={onEdit}
          style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: "pointer", border: "1px solid #E2E8E3", background: "#FFFFFF", color: C.muted }}
          onMouseEnter={e => { e.currentTarget.style.background = "#EFF3EF"; e.currentTarget.style.color = C.green; e.currentTarget.style.borderColor = C.green; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#FFFFFF"; e.currentTarget.style.color = C.muted; e.currentTarget.style.borderColor = "#E2E8E3"; }}>
          ✎ Editar
        </button>
        <button onClick={onDelete}
          style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: "pointer", border: "1px solid #E2E8E3", background: "#FFFFFF", color: C.muted }}
          onMouseEnter={e => { e.currentTarget.style.background = "#FEF2F2"; e.currentTarget.style.color = "#B91C1C"; e.currentTarget.style.borderColor = "#FECACA"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#FFFFFF"; e.currentTarget.style.color = C.muted; e.currentTarget.style.borderColor = "#E2E8E3"; }}>
          ✕ Eliminar
        </button>
      </div>
    </td>
  );
}

function FormPanel({ visible, title, isEdit, children }) {
  if (!visible) return null;
  return (
    <div style={{ background: isEdit ? "#FFF8EC" : "#EFF3EF", border: `1px solid ${isEdit ? "#F5D89A" : "#E2E8E3"}`, borderRadius: 20, padding: 20, marginBottom: 16 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: isEdit ? "#92610A" : C.muted, marginBottom: 14, paddingBottom: 10, borderBottom: `1px solid ${isEdit ? "#F5D89A" : "#E2E8E3"}`, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {isEdit ? "✎ " : ""}{title}
      </div>
      {children}
    </div>
  );
}

function BtnRow({ onCancel, onSave, isEdit, loading }) {
  return (
    <div style={{ display: "flex", gap: 8, marginTop: 16, justifyContent: "flex-end" }}>
      <button onClick={onCancel} disabled={loading}
        style={{ padding: "8px 18px", borderRadius: 12, fontSize: 13, fontWeight: 500, cursor: "pointer", border: "1px solid #E2E8E3", background: "transparent", color: C.muted }}>
        Cancelar
      </button>
      <button onClick={onSave} disabled={loading}
        style={{ padding: "8px 18px", borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", border: "none", background: isEdit ? "#B45309" : C.green, color: "#fff", opacity: loading ? 0.7 : 1 }}>
        {loading ? "Guardando..." : isEdit ? "Guardar cambios" : "Guardar"}
      </button>
    </div>
  );
}

function AddBtn({ onClick, label }) {
  return (
    <button onClick={onClick} style={{ marginBottom: 14, padding: "8px 18px", borderRadius: 12, background: C.green, color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
      {label}
    </button>
  );
}

function EmptyHint({ msg }) {
  return <div style={{ padding: "10px 14px", borderRadius: 10, border: "1px dashed #E2E8E3", fontSize: 12, color: C.muted, background: "#FAFCFA" }}>{msg}</div>;
}

function GreenBanner({ children }) {
  return (
    <div style={{ gridColumn: "span 2", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", padding: "8px 12px", borderRadius: 10, background: C.greenSoft, fontSize: 12, color: C.greenStrong }}>
      {children}
    </div>
  );
}

// ─── ERROR BANNER ─────────────────────────────────────────────────────────
function ErrBanner({ msg }) {
  if (!msg) return null;
  return (
    <div style={{ padding: "10px 14px", borderRadius: 10, background: "#FEF2F2", border: "1px solid #FECACA", color: "#B91C1C", fontSize: 12, marginBottom: 12 }}>
      ⚠ {msg}
    </div>
  );
}

// ─── LOADING SPINNER ──────────────────────────────────────────────────────
function Loading() {
  return (
    <tr><td colSpan={99} style={{ textAlign: "center", padding: "32px", color: C.muted, fontSize: 13 }}>
      Cargando...
    </td></tr>
  );
}

// ─── KPI CARD ─────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, badge, badgeType }) {
  const colors = { up: { bg: "#DDEEDC", color: "#0F5C2E" }, down: { bg: "#FCEBEB", color: "#791F1F" }, neu: { bg: "#ECF1EC", color: C.muted } };
  const bc = colors[badgeType] || colors.neu;
  return (
    <div style={{ background: C.card, border: "1px solid #E2E8E3", borderRadius: 24, padding: "18px 20px", boxShadow: "0 4px 20px rgba(18,32,25,0.06)" }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: C.text, lineHeight: 1, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>{sub}</div>
      {badge && <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: bc.bg, color: bc.color }}>{badge}</span>}
    </div>
  );
}

// SVG icons for nav
const NAV_ICONS = {
  dashboard:  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity=".9"/><rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity=".6"/><rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity=".6"/><rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity=".6"/></svg>,
  ingresos:   <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.4"/><path d="M5 7h4M5 9.5h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><path d="M11 6l1.5 1.5L11 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  gastos:     <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4"/><path d="M8 5v2.5l2 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  clientes:   <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 13c0-2.2 2.686-4 6-4s6 1.8 6 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.4"/></svg>,
  operadores: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="6" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.4"/><path d="M1 13c0-2.2 2.239-4 5-4s5 1.8 5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><path d="M11.5 7.5a2 2 0 1 0 0-4M14 13c0-1.657-1.119-3-2.5-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  rutas:      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 12h3M6 12h3M10 12h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><rect x="1.5" y="7" width="13" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><path d="M4.5 7V5.5a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1V7" stroke="currentColor" strokeWidth="1.4"/></svg>,
  unidades:   <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="6" width="14" height="7" rx="2" stroke="currentColor" strokeWidth="1.4"/><path d="M4 6V4.5A1.5 1.5 0 0 1 5.5 3h5A1.5 1.5 0 0 1 12 4.5V6" stroke="currentColor" strokeWidth="1.4"/><circle cx="4.5" cy="13" r="1.5" fill="currentColor"/><circle cx="11.5" cy="13" r="1.5" fill="currentColor"/></svg>,
};

const NAV_GROUPS = [
  { label: "GENERAL",        ids: ["dashboard"] },
  { label: "CAPTURA",        ids: ["ingresos", "gastos"] },
  { label: "OPERACIONES",    ids: ["clientes", "operadores", "rutas"] },
  { label: "CONFIGURACIÓN",  ids: ["unidades"] },
];

const NAV_LABELS = {
  dashboard:  "Dashboard",
  ingresos:   "Ingresos",
  gastos:     "Gastos",
  clientes:   "Clientes",
  operadores: "Operadores",
  rutas:      "Rutas",
  unidades:   "Unidades",
};

function NavItem({ id, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 10,
      width: "100%", padding: "9px 16px",
      background: active ? "#173428" : "transparent",
      border: "none",
      borderLeft: active ? "3px solid #74B72E" : "3px solid transparent",
      color: active ? "#fff" : "rgba(255,255,255,0.6)",
      fontSize: 13.5, fontWeight: active ? 600 : 400,
      cursor: "pointer", textAlign: "left",
      transition: "background 0.12s, color 0.12s",
      borderRadius: active ? "0 8px 8px 0" : 0,
    }}
    onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#fff"; }}}
    onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}}
    >
      <span style={{ flexShrink: 0, opacity: active ? 1 : 0.7 }}>{NAV_ICONS[id]}</span>
      <span>{NAV_LABELS[id]}</span>
    </button>
  );
}

const MOD_META = {
  dashboard:  { title: "Dashboard",  sub: "Resumen completo de métricas del período" },
  ingresos:   { title: "Ingresos",   sub: "Registro de facturas y cobros" },
  gastos:     { title: "Gastos",     sub: "Control de egresos operativos" },
  clientes:   { title: "Clientes",   sub: "Tarifas por tipo de unidad y datos de contacto" },
  operadores: { title: "Operadores", sub: "Registro de conductores y asignación" },
  rutas:      { title: "Rutas",      sub: "Registro de viajes con flete automático" },
  unidades:   { title: "Unidades",   sub: "Registro de vehículos de la flotilla" },
};

// ─── MÓDULO UNIDADES ──────────────────────────────────────────────────────
// Columnas reales en Supabase:
// id (uuid), economico, placas, tipo_unidad, marca, modelo, anio, km_actual, rendimiento_km_l, estatus, created_at
function ModUnidades({ data, reload }) {
  const EMPTY = {
    economico: "", placas: "", tipo_unidad: "", marca: "",
    modelo: "", anio: "", km_actual: "", rendimiento_km_l: "", estatus: "",
  };
  const [open, setOpen]       = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [form, setForm]       = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [err, setErr]         = useState("");
  const isEdit = !!editRow;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const openNew  = () => { setForm(EMPTY); setEditRow(null); setErr(""); setOpen(true); };
  const openEdit = (r) => {
    setForm({
      economico:        r.economico        || "",
      placas:           r.placas           || "",
      tipo_unidad:      r.tipo_unidad      || "",
      marca:            r.marca            || "",
      modelo:           r.modelo           || "",
      anio:             r.anio             || "",
      km_actual:        r.km_actual        || "",
      rendimiento_km_l: r.rendimiento_km_l || "",
      estatus:          r.estatus          || "",
    });
    setEditRow(r); setErr(""); setOpen(true);
  };
  const cancel = () => { setForm(EMPTY); setEditRow(null); setErr(""); setOpen(false); };

  const save = async () => {
    if (!form.economico) { setErr("El económico es obligatorio"); return; }
    setLoading(true); setErr("");
    try {
      const payload = {
        economico:        form.economico,
        placas:           form.placas           || null,
        tipo_unidad:      form.tipo_unidad      || null,
        marca:            form.marca            || null,
        modelo:           form.modelo           || null,
        anio:             form.anio             ? parseInt(form.anio) : null,
        km_actual:        form.km_actual        ? parseFloat(form.km_actual) : null,
        rendimiento_km_l: form.rendimiento_km_l ? parseFloat(form.rendimiento_km_l) : null,
        estatus:          form.estatus          || null,
      };
      if (isEdit) {
        const { error } = await sb.from("unidades").update(payload).eq("id", editRow.id);
        if (error) throw error;
      } else {
        const { error } = await sb.from("unidades").insert(payload);
        if (error) throw error;
      }
      await reload();
      cancel();
    } catch (e) {
      setErr(e.message || "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  const remove = async (r) => {
    if (!window.confirm(`¿Eliminar unidad ${r.economico}?`)) return;
    try {
      const { error } = await sb.from("unidades").delete().eq("id", r.id);
      if (error) throw error;
      await reload();
    } catch (e) { alert(e.message); }
  };

  return (
    <div>
      <FormPanel visible={open} title={isEdit ? "Editar unidad" : "Nueva unidad"} isEdit={isEdit}>
        <ErrBanner msg={err} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Económico">
            <Input placeholder="VDL-01" value={form.economico} onChange={e => set("economico", e.target.value)} />
          </Field>
          <Field label="Placas">
            <Input placeholder="ABC-123-X" value={form.placas} onChange={e => set("placas", e.target.value)} />
          </Field>
          <Field label="Tipo de unidad">
            <Select value={form.tipo_unidad} onChange={v => set("tipo_unidad", v)}
              options={["Moto", "Sedán", "Small Van", "Van", "Large Van", "Otro"]}
              placeholder="Seleccionar tipo..." />
          </Field>
          <Field label="Estatus">
            <Select value={form.estatus} onChange={v => set("estatus", v)}
              options={["Activo", "En taller", "Baja"]}
              placeholder="Seleccionar estatus..." />
          </Field>
          <Field label="Marca">
            <Input placeholder="Toyota" value={form.marca} onChange={e => set("marca", e.target.value)} />
          </Field>
          <Field label="Modelo">
            <Input placeholder="Hiace" value={form.modelo} onChange={e => set("modelo", e.target.value)} />
          </Field>
          <Field label="Año">
            <Input type="number" placeholder="2023" value={form.anio} onChange={e => set("anio", e.target.value)} />
          </Field>
          <Field label="KM actual">
            <Input type="number" placeholder="45000" value={form.km_actual} onChange={e => set("km_actual", e.target.value)} />
          </Field>
          <Field label="Rendimiento (km/l)" span2>
            <Input type="number" placeholder="12.5" value={form.rendimiento_km_l} onChange={e => set("rendimiento_km_l", e.target.value)} />
          </Field>
        </div>
        <BtnRow onCancel={cancel} onSave={save} isEdit={isEdit} loading={loading} />
      </FormPanel>

      {!open && <AddBtn onClick={openNew} label="+ Nueva unidad" />}

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <Th>Económico</Th><Th>Placas</Th><Th>Tipo</Th><Th>Marca / Modelo</Th>
              <Th>Año</Th><Th>KM actual</Th><Th>Rend. km/l</Th><Th>Estatus</Th><Th>Acciones</Th>
            </tr>
          </thead>
          <tbody>
            {data === null ? <Loading /> :
             data.length === 0 ? <EmptyRow cols={9} msg="Sin unidades registradas" /> :
             data.map(r => (
               <tr key={r.id} style={{ background: "#FFFFFF" }}
                 onMouseEnter={e => e.currentTarget.style.background = "#FAFCFA"}
                 onMouseLeave={e => e.currentTarget.style.background = "#FFFFFF"}>
                 <Td><IdBadge id={r.economico} /></Td>
                 <Td>{r.placas || "—"}</Td>
                 <Td><Chip label={r.tipo_unidad} /></Td>
                 <Td>{[r.marca, r.modelo].filter(Boolean).join(" ") || "—"}</Td>
                 <Td>{r.anio || "—"}</Td>
                 <Td>{r.km_actual ? r.km_actual.toLocaleString("es-MX") : "—"}</Td>
                 <Td>{r.rendimiento_km_l ? `${r.rendimiento_km_l} km/l` : "—"}</Td>
                 <Td><Chip label={r.estatus} /></Td>
                 <RowActions onEdit={() => openEdit(r)} onDelete={() => remove(r)} />
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
function ModOperadores({ data, reload, unidades }) {
  const EMPTY = { nombre: "", telefono: "", estatus: "", unidad_id: "", cuenta_banco: "", tipo_op: "" };
  const [open, setOpen]       = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [form, setForm]       = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [err, setErr]         = useState("");
  const isEdit = !!editRow;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const unidadOpts = (unidades || []).map(u => u.economico).filter(Boolean);
  const unidadSel  = form.unidad_id ? (unidades || []).find(u => u.economico === form.unidad_id) : null;

  const openNew  = () => { setForm(EMPTY); setEditRow(null); setErr(""); setOpen(true); };
  const openEdit = (r) => {
    setForm({
      nombre:       r.nombre       || "",
      telefono:     r.telefono     || "",
      estatus:      r.estatus      || "",
      unidad_id:    r.unidad_id    || "",
      cuenta_banco: r.cuenta_banco || "",
      tipo_op:      r.tipo_op      || "",
    });
    setEditRow(r); setErr(""); setOpen(true);
  };
  const cancel = () => { setForm(EMPTY); setEditRow(null); setErr(""); setOpen(false); };

  const save = async () => {
    if (!form.nombre) { setErr("El nombre es obligatorio"); return; }
    setLoading(true); setErr("");
    try {
      const payload = {
        nombre:       form.nombre,
        telefono:     form.telefono     || null,
        estatus:      form.estatus      || null,
        unidad_id:    form.unidad_id    || null,
        cuenta_banco: form.cuenta_banco || null,
        tipo_op:      form.tipo_op      || null,
      };
      if (isEdit) {
        const { error } = await sb.from("operadores").update(payload).eq("id", editRow.id);
        if (error) throw error;
      } else {
        const { error } = await sb.from("operadores").insert(payload);
        if (error) throw error;
      }
      await reload();
      cancel();
    } catch (e) {
      setErr(e.message || "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  const remove = async (r) => {
    if (!window.confirm(`¿Eliminar operador ${r.nombre}?`)) return;
    try {
      const { error } = await sb.from("operadores").delete().eq("id", r.id);
      if (error) throw error;
      await reload();
    } catch (e) { alert(e.message); }
  };

  const propios  = (data || []).filter(r => r.tipo_op === "Propia").length;
  const terceros = (data || []).filter(r => r.tipo_op === "Tercera").length;
  const activos  = (data || []).filter(r => r.estatus === "Activo").length;

  return (
    <div>
      {(data || []).length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 10, marginBottom: 16 }}>
          <MiniKpi label="Operadores activos" value={activos}  sub={`de ${(data||[]).length} totales`} color={C.green} />
          <MiniKpi label="Propios"            value={propios}  sub="operadores" color={C.green} />
          <MiniKpi label="Terceros"           value={terceros} sub="operadores" color="#3C3489" />
        </div>
      )}

      <FormPanel visible={open} title={isEdit ? "Editar operador" : "Nuevo operador"} isEdit={isEdit}>
        <ErrBanner msg={err} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Nombre completo" span2>
            <Input placeholder="Nombre del operador" value={form.nombre} onChange={e => set("nombre", e.target.value)} />
          </Field>
          <Field label="Teléfono">
            <Input placeholder="55 1234 5678" value={form.telefono} onChange={e => set("telefono", e.target.value)} />
          </Field>
          <Field label="Estatus">
            <Select value={form.estatus} onChange={v => set("estatus", v)}
              options={["Activo", "Inactivo", "Vacaciones", "Baja"]}
              placeholder="Seleccionar estatus..." />
          </Field>
          <Field label="Tipo de operador">
            <Select value={form.tipo_op} onChange={v => set("tipo_op", v)}
              options={["Propia", "Tercera"]}
              placeholder="Seleccionar tipo..." />
          </Field>
          <Field label="Número de cuenta bancaria" span2>
            <Input placeholder="CLABE o número de cuenta" value={form.cuenta_banco} onChange={e => set("cuenta_banco", e.target.value)} />
          </Field>
          <Field label="Unidad asignada" span2>
            {unidadOpts.length === 0
              ? <EmptyHint msg="No hay unidades registradas. Agrega unidades primero." />
              : <Select value={form.unidad_id} onChange={v => set("unidad_id", v)} options={unidadOpts} placeholder="Seleccionar unidad..." />}
          </Field>
          {unidadSel && (
            <GreenBanner>
              <span style={{ fontWeight: 600 }}>Unidad:</span>
              <IdBadge id={unidadSel.economico} />
              {unidadSel.placas      && <span style={{ fontSize: 11 }}>{unidadSel.placas}</span>}
              {unidadSel.tipo_unidad && <Chip label={unidadSel.tipo_unidad} />}
              <Chip label={unidadSel.prop || "—"} />
              {unidadSel.marca       && <span style={{ fontSize: 11, color: C.greenStrong }}>{unidadSel.marca} {unidadSel.modelo}</span>}
            </GreenBanner>
          )}
        </div>
        <BtnRow onCancel={cancel} onSave={save} isEdit={isEdit} loading={loading} />
      </FormPanel>

      {!open && <AddBtn onClick={openNew} label="+ Nuevo operador" />}

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr><Th>Nombre</Th><Th>Teléfono</Th><Th>Tipo</Th><Th>Unidad</Th><Th>Cuenta bancaria</Th><Th>Estatus</Th><Th>Acciones</Th></tr>
          </thead>
          <tbody>
            {data === null ? <Loading /> :
             data.length === 0 ? <EmptyRow cols={7} msg="Sin operadores registrados" /> :
             data.map(r => (
               <tr key={r.id} style={{ background: "#FFFFFF" }}
                 onMouseEnter={e => e.currentTarget.style.background = "#FAFCFA"}
                 onMouseLeave={e => e.currentTarget.style.background = "#FFFFFF"}>
                 <Td bold>{r.nombre}</Td>
                 <Td>{r.telefono || "—"}</Td>
                 <Td><Chip label={r.tipo_op} /></Td>
                 <Td><IdBadge id={r.unidad_id} /></Td>
                 <Td><CopyField value={r.cuenta_banco} label="cuenta" /></Td>
                 <Td><Chip label={r.estatus} /></Td>
                 <RowActions onEdit={() => openEdit(r)} onDelete={() => remove(r)} />
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
function ModRutas({ data, reload, desde, hasta, operadores, unidades, clientes }) {
  const EMPTY = { fecha: "", cliente_id: "", operador: "", unidad_id: "", flete: "" };
  const [open, setOpen]       = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [form, setForm]       = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [err, setErr]         = useState("");
  const isEdit = !!editRow;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const operadorOpts = (operadores || []).map(o => o.nombre).filter(Boolean);
  const unidadOpts   = (unidades   || []).map(u => u.economico).filter(Boolean);
  const clienteOpts  = (clientes   || []).map(c => c.nombre).filter(Boolean);

  // Buscar tarifa: cliente → tipo_unidad de la unidad seleccionada
  const getTarifa = (cliente_id, unidad_id) => {
    const cliente = (clientes  || []).find(c => c.nombre    === cliente_id);
    const unidad  = (unidades  || []).find(u => u.economico === unidad_id);
    if (cliente && unidad?.tipo_unidad) return cliente.tarifas?.[unidad.tipo_unidad] || null;
    return null;
  };

  const selCliente  = (nombre) => setForm(f => {
    const tarifa = getTarifa(nombre, f.unidad_id);
    return { ...f, cliente_id: nombre, flete: tarifa ? tarifa.toString() : f.flete };
  });
  const selUnidad   = (eco)    => setForm(f => {
    const tarifa = getTarifa(f.cliente_id, eco);
    return { ...f, unidad_id: eco, flete: tarifa ? tarifa.toString() : f.flete };
  });
  const selOperador = (nombre) => setForm(f => {
    // Auto-asignar unidad si el operador tiene una registrada
    const op = (operadores || []).find(o => o.nombre === nombre);
    const unidad_id = op?.unidad_id || f.unidad_id;
    const tarifa = getTarifa(f.cliente_id, unidad_id);
    return { ...f, operador: nombre, unidad_id, flete: tarifa ? tarifa.toString() : f.flete };
  });

  const openNew  = () => { setForm(EMPTY); setEditRow(null); setErr(""); setOpen(true); };
  const openEdit = (r) => {
    setForm({ fecha: r.fecha || "", cliente_id: r.cliente_id || "", operador: r.operador || "", unidad_id: r.unidad_id || "", flete: r.flete?.toString() || "" });
    setEditRow(r); setErr(""); setOpen(true);
  };
  const cancel = () => { setForm(EMPTY); setEditRow(null); setErr(""); setOpen(false); };

  const save = async () => {
    if (!form.cliente_id) { setErr("Selecciona un cliente"); return; }
    if (!form.operador)   { setErr("Selecciona un operador"); return; }
    setLoading(true); setErr("");
    try {
      const payload = {
        fecha:      form.fecha      || null,
        cliente_id: form.cliente_id,
        operador:   form.operador,
        unidad_id:  form.unidad_id  || null,
        flete: form.flete ? parseFloat(form.flete) : null,
      };
      if (isEdit) {
        const { error } = await sb.from("rutas").update(payload).eq("id", editRow.id);
        if (error) throw error;
      } else {
        const { error } = await sb.from("rutas").insert({ id: nextRutaId(), ...payload });
        if (error) throw error;
      }
      await reload();
      cancel();
    } catch (e) {
      setErr(e.message || "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  const remove = async (r) => {
    if (!window.confirm(`¿Eliminar ruta ${r.id}?`)) return;
    try {
      const { error } = await sb.from("rutas").delete().eq("id", r.id);
      if (error) throw error;
      await reload();
    } catch (e) { alert(e.message); }
  };

  const rows       = useMemo(() => (data || []).filter(r => inRange(r.fecha, desde, hasta)), [data, desde, hasta]);
  const unidadSel  = form.unidad_id  ? (unidades || []).find(u => u.economico === form.unidad_id)  : null;
  const clienteSel = form.cliente_id ? (clientes  || []).find(c => c.nombre   === form.cliente_id) : null;
  const tarifaAct  = getTarifa(form.cliente_id, form.unidad_id);

  return (
    <div>
      <FormPanel visible={open} title={isEdit ? "Editar ruta" : "Nueva ruta — ID generado automáticamente"} isEdit={isEdit}>
        <ErrBanner msg={err} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Fecha">
            <Input type="date" value={form.fecha} onChange={e => set("fecha", e.target.value)} />
          </Field>
          <Field label="Cliente">
            {clienteOpts.length === 0
              ? <EmptyHint msg="No hay clientes. Agrega clientes primero." />
              : <Select value={form.cliente_id} onChange={selCliente} options={clienteOpts} placeholder="Seleccionar cliente..." />}
          </Field>
          <Field label="Operador">
            {operadorOpts.length === 0
              ? <EmptyHint msg="No hay operadores registrados." />
              : <Select value={form.operador} onChange={selOperador} options={operadorOpts} placeholder="Seleccionar operador..." />}
          </Field>

          {/* Unidad: auto si el operador tiene una asignada, dropdown si no */}
          <Field label="Unidad">
            {(() => {
              const op = (operadores || []).find(o => o.nombre === form.operador);
              const opTieneUnidad = !!op?.unidad_id;
              if (!form.operador) {
                // Sin operador: mostrar dropdown normal
                return unidadOpts.length === 0
                  ? <EmptyHint msg="No hay unidades registradas." />
                  : <Select value={form.unidad_id} onChange={selUnidad} options={unidadOpts} placeholder="Seleccionar unidad..." />;
              }
              if (opTieneUnidad) {
                // Operador tiene unidad asignada: mostrar badge + botón para cambiar
                return (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{
                      flex: 1, padding: "8px 12px", borderRadius: 10,
                      background: C.greenSoft, border: `1px solid #B7D9B7`,
                      fontSize: 13, fontWeight: 600, color: C.greenStrong,
                    }}>
                      {form.unidad_id} — asignada al operador
                    </div>
                    <button
                      onClick={() => setForm(f => ({ ...f, unidad_id: "" }))}
                      style={{ fontSize: 11, color: C.muted, background: "transparent", border: "1px solid #E2E8E3", borderRadius: 8, padding: "6px 10px", cursor: "pointer" }}
                    >
                      Cambiar
                    </button>
                  </div>
                );
              }
              // Operador sin unidad: mostrar dropdown
              return unidadOpts.length === 0
                ? <EmptyHint msg="No hay unidades registradas." />
                : <Select value={form.unidad_id} onChange={selUnidad} options={unidadOpts} placeholder="Seleccionar unidad..." />;
            })()}
          </Field>

          {unidadSel && (
            <GreenBanner>
              <span style={{ fontWeight: 600 }}>Unidad:</span>
              <IdBadge id={unidadSel.economico} />
              {unidadSel.placas      && <span style={{ fontSize: 11 }}>{unidadSel.placas}</span>}
              {unidadSel.tipo_unidad && <Chip label={unidadSel.tipo_unidad} />}
              {unidadSel.marca       && <span style={{ fontSize: 11, color: C.greenStrong }}>{unidadSel.marca} {unidadSel.modelo}</span>}
            </GreenBanner>
          )}

          <Field label="Flete estimado" span2>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, color: C.muted, flexShrink: 0 }}>$</span>
              <Input type="number" placeholder="0.00" value={form.flete} onChange={e => set("flete", e.target.value)} />
              {tarifaAct && (
                <span style={{ fontSize: 11, color: C.greenStrong, background: C.greenSoft, padding: "4px 10px", borderRadius: 20, whiteSpace: "nowrap" }}>
                  Tarifa {unidadSel?.tipo_unidad}: {fmt(tarifaAct)}
                </span>
              )}
              {clienteSel && unidadSel?.tipo_unidad && !tarifaAct && (
                <span style={{ fontSize: 11, color: "#92610A", background: "#FFF8EC", padding: "4px 10px", borderRadius: 20, whiteSpace: "nowrap" }}>
                  Sin tarifa para {unidadSel.tipo_unidad}
                </span>
              )}
            </div>
          </Field>
        </div>
        <BtnRow onCancel={cancel} onSave={save} isEdit={isEdit} loading={loading} />
      </FormPanel>

      {!open && <AddBtn onClick={openNew} label="+ Nueva ruta" />}

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr><Th>ID Ruta</Th><Th>Fecha</Th><Th>Cliente</Th><Th>Operador</Th><Th>Unidad</Th><Th>Flete</Th><Th>Acciones</Th></tr>
          </thead>
          <tbody>
            {data === null ? <Loading /> :
             rows.length === 0 ? <EmptyRow cols={7} msg="Sin rutas en este período" /> :
             rows.map(r => (
               <tr key={r.id} style={{ background: "#FFFFFF" }}
                 onMouseEnter={e => e.currentTarget.style.background = "#FAFCFA"}
                 onMouseLeave={e => e.currentTarget.style.background = "#FFFFFF"}>
                 <Td><IdBadge id={r.id} /></Td>
                 <Td>{r.fecha || "—"}</Td>
                 <Td bold>{r.cliente_id || "—"}</Td>
                 <Td>{r.operador || "—"}</Td>
                 <Td><IdBadge id={r.unidad_id} /></Td>
                 <Td>{r.flete ? <span style={{ fontWeight: 600, color: C.green }}>{fmt(r.flete)}</span> : <span style={{ color: C.muted }}>—</span>}</Td>
                 <RowActions onEdit={() => openEdit(r)} onDelete={() => remove(r)} />
               </tr>
             ))
            }
          </tbody>
        </table>
      </div>

      {/* ── Resumen por tipo de unidad / período ── */}
      {rows.length > 0 && (() => {
        const totalFlete = rows.reduce((s, r) => s + parseFloat(r.flete || 0), 0);
        const byTipo = rows.reduce((acc, r) => {
          const u = (unidades || []).find(u => u.economico === r.unidad_id);
          const t = u?.tipo_unidad || "Sin tipo";
          if (!acc[t]) acc[t] = { count: 0, flete: 0 };
          acc[t].count++;
          acc[t].flete += parseFloat(r.flete || 0);
          return acc;
        }, {});
        return (
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10, paddingBottom: 6, borderBottom: `1px solid ${C.border}` }}>
              Resumen por tipo de unidad · {desde || "inicio"} → {hasta || "hoy"}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 10, marginBottom: 12 }}>
              <MiniKpi label="Total fletes" value={fmt(totalFlete)} sub={`${rows.length} rutas`} color={C.green} />
              {Object.entries(byTipo).sort((a, b) => b[1].flete - a[1].flete).map(([tipo, d]) => (
                <MiniKpi key={tipo} label={tipo} value={fmt(d.flete)} sub={`${d.count} ruta${d.count !== 1 ? "s" : ""}`} />
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ─── MÓDULO GASTOS ────────────────────────────────────────────────────────
function ModGastos({ data, reload, desde, hasta, rutas, operadores }) {
  const EMPTY = {
    monto: "", siniva: "", coniva: "", tipo_gasto: "", estatus_pago: "",
    fecha: "", viaje_id: "", operador: "", concepto: "", notas: "",
  };
  const [open, setOpen]       = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [form, setForm]       = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [err, setErr]         = useState("");
  const isEdit = !!editRow;

  // Auto-fill ruta when operador + fecha match a registered route
  const autoFillRuta = (operadorNombre, fecha) => {
    if (!operadorNombre || !fecha) return "";
    const match = (rutas || []).find(r => r.fecha === fecha && r.operador === operadorNombre);
    return match?.id || "";
  };

  const set = (k, v) => setForm(f => {
    const next = { ...f, [k]: v };
    if (k === "fecha") {
      next.viaje_id = "";
      if (f.operador) next.viaje_id = autoFillRuta(f.operador, v) || "";
    }
    if (k === "operador") {
      next.viaje_id = autoFillRuta(v, f.fecha) || "";
    }
    return next;
  });

  const rutasDelDia = useMemo(
    () => (rutas || []).filter(r => r.fecha === form.fecha),
    [rutas, form.fecha]
  );

  const operadorOpts = (operadores || []).map(o => o.nombre).filter(Boolean);

  const selRuta = (rutaId) => {
    const r = (rutas || []).find(r => r.id === rutaId);
    setForm(f => ({
      ...f,
      viaje_id: rutaId,
      operador: r?.operador || "",
    }));
  };

  const openNew  = () => { setForm(EMPTY); setEditRow(null); setErr(""); setOpen(true); };
  const openEdit = (r) => {
    setForm({
      monto:        r.monto?.toString()  || "",
      siniva:       r.siniva?.toString() || "",
      coniva:       r.coniva?.toString() || "",
      tipo_gasto:   r.tipo_gasto         || "",
      estatus_pago: r.estatus_pago       || "",
      fecha:        r.fecha              || "",
      viaje_id:     r.viaje_id           || "",
      operador:     r.operador           || "",
      concepto:     r.concepto           || "",
      notas:        r.notas              || "",
    });
    setEditRow(r); setErr(""); setOpen(true);
  };
  const cancel = () => { setForm(EMPTY); setEditRow(null); setErr(""); setOpen(false); };

  const save = async () => {
    if (!form.monto) { setErr("El monto es obligatorio"); return; }
    setLoading(true); setErr("");
    try {
      const payload = {
        monto:        parseFloat(form.monto),
        siniva:       form.siniva       ? parseFloat(form.siniva)  : null,
        coniva:       form.coniva       ? parseFloat(form.coniva)  : null,
        tipo_gasto:   form.tipo_gasto   || null,
        estatus_pago: form.estatus_pago || null,
        fecha:        form.fecha        || null,
        viaje_id:     form.viaje_id     || null,
        operador:     form.operador     || null,
        concepto:     form.concepto     || null,
        notas:        form.notas        || null,
      };
      if (isEdit) {
        const { error } = await sb.from("gastos").update(payload).eq("id", editRow.id);
        if (error) throw error;
      } else {
        const { error } = await sb.from("gastos").insert(payload);
        if (error) throw error;
      }
      await reload();
      cancel();
    } catch (e) {
      setErr(e.message || "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  const remove = async (r) => {
    if (!window.confirm("¿Eliminar este gasto?")) return;
    try {
      const { error } = await sb.from("gastos").delete().eq("id", r.id);
      if (error) throw error;
      await reload();
    } catch (e) { alert(e.message); }
  };

  const rows    = useMemo(() => (data || []).filter(r => inRange(r.fecha, desde, hasta)), [data, desde, hasta]);
  const rutaSel = form.viaje_id ? (rutas || []).find(r => r.id === form.viaje_id) : null;

  // Contadores
  const pagados   = rows.filter(r => r.estatus_pago === "Pagado").length;
  const porPagar  = rows.filter(r => r.estatus_pago === "Por pagar" || !r.estatus_pago).length;
  const totalMonto = rows.reduce((s, r) => s + parseFloat(r.monto || 0), 0);

  return (
    <div>
      {rows.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 10, marginBottom: 16 }}>
          <MiniKpi label="Total gastos"  value={fmt(totalMonto)} sub={`${rows.length} registros`} />
          <MiniKpi label="Pagados"       value={pagados}         sub="gastos"    color={C.green} />
          <MiniKpi label="Por pagar"     value={porPagar}        sub="gastos"    color="#B45309" />
        </div>
      )}
      <FormPanel visible={open} title={isEdit ? "Editar gasto" : "Nuevo gasto"} isEdit={isEdit}>
        <ErrBanner msg={err} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Monto total">
            <Input type="number" placeholder="0.00" value={form.monto} onChange={e => set("monto", e.target.value)} />
          </Field>
          <Field label="Fecha">
            <Input type="date" value={form.fecha} onChange={e => set("fecha", e.target.value)} />
          </Field>
          <Field label="Monto sin IVA">
            <Input type="number" placeholder="0.00" value={form.siniva} onChange={e => set("siniva", e.target.value)} />
          </Field>
          <Field label="Monto con IVA">
            <Input type="number" placeholder="0.00" value={form.coniva} onChange={e => set("coniva", e.target.value)} />
          </Field>
          <Field label="Concepto">
            <Input placeholder="Ej. Carga de diésel" value={form.concepto} onChange={e => set("concepto", e.target.value)} />
          </Field>
          <Field label="Tipo de gasto">
            <Select value={form.tipo_gasto} onChange={v => set("tipo_gasto", v)}
              options={["Nómina", "Combustible", "Impuesto", "Gasolina", "Estacionamiento", "Caseta", "Mantenimiento", "Llantas", "Otro"]}
              placeholder="Seleccionar tipo..." />
          </Field>
          <Field label="Estatus de pago" span2>
            <Select value={form.estatus_pago} onChange={v => set("estatus_pago", v)}
              options={["Pagado", "Por pagar", "En revisión"]}
              placeholder="Seleccionar estatus..." />
          </Field>

          <Field label="Operador" span2>
            {operadorOpts.length === 0
              ? <EmptyHint msg="No hay operadores registrados." />
              : <Select value={form.operador} onChange={v => set("operador", v)}
                  options={operadorOpts} placeholder="Seleccionar operador..." />}
          </Field>

          <Field label="Viaje / Ruta — filtrado por fecha" span2>
            {!form.fecha
              ? <EmptyHint msg="Selecciona una fecha primero para ver los viajes disponibles." />
              : rutasDelDia.length === 0
                ? <EmptyHint msg={`No hay rutas registradas para el ${form.fecha}.`} />
                : <Select value={form.viaje_id} onChange={selRuta}
                    options={rutasDelDia.map(r => r.id)}
                    placeholder="Seleccionar viaje (opcional)..." />}
          </Field>

          {rutaSel && (
            <GreenBanner>
              <span style={{ fontWeight: 600 }}>Viaje:</span>
              <IdBadge id={rutaSel.id} />
              <span>Cliente: <strong>{rutaSel.cliente_id || "—"}</strong></span>
              <span>·</span>
              <span>Unidad: <strong>{rutaSel.unidad_id || "—"}</strong></span>
            </GreenBanner>
          )}

          <Field label="Notas" span2>
            <Input placeholder="Observaciones opcionales" value={form.notas} onChange={e => set("notas", e.target.value)} />
          </Field>
        </div>
        <BtnRow onCancel={cancel} onSave={save} isEdit={isEdit} loading={loading} />
      </FormPanel>

      {!open && <AddBtn onClick={openNew} label="+ Nuevo gasto" />}

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <Th>Fecha</Th><Th>Concepto</Th><Th>Monto</Th><Th>Sin IVA</Th><Th>Con IVA</Th>
              <Th>Tipo</Th><Th>Estatus</Th><Th>Operador</Th><Th>Viaje</Th><Th>Acciones</Th>
            </tr>
          </thead>
          <tbody>
            {data === null ? <Loading /> :
             rows.length === 0 ? <EmptyRow cols={10} msg="Sin gastos en este período" /> :
             rows.map(r => (
               <tr key={r.id} style={{ background: "#FFFFFF" }}
                 onMouseEnter={e => e.currentTarget.style.background = "#FAFCFA"}
                 onMouseLeave={e => e.currentTarget.style.background = "#FFFFFF"}>
                 <Td>{r.fecha || "—"}</Td>
                 <Td>{r.concepto || "—"}</Td>
                 <Td bold>{fmt(r.monto)}</Td>
                 <Td>{r.siniva ? fmt(r.siniva) : "—"}</Td>
                 <Td>{r.coniva ? fmt(r.coniva) : "—"}</Td>
                 <Td><Chip label={r.tipo_gasto} /></Td>
                 <Td><Chip label={r.estatus_pago || "Por pagar"} /></Td>
                 <Td>{r.operador || "—"}</Td>
                 <Td><IdBadge id={r.viaje_id} /></Td>
                 <RowActions onEdit={() => openEdit(r)} onDelete={() => remove(r)} />
               </tr>
             ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── MÓDULO INGRESOS ──────────────────────────────────────────────────────
function ModIngresos({ data, reload, desde, hasta }) {
  const EMPTY = { factura: "", periodo: "", siniva: "", coniva: "", fcarga: "", fvence: "", estatus: "", notas: "" };
  const [open, setOpen]       = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [form, setForm]       = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [err, setErr]         = useState("");
  const isEdit = !!editRow;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const openNew  = () => { setForm(EMPTY); setEditRow(null); setErr(""); setOpen(true); };
  const openEdit = (r) => { setForm({ factura: r.factura, periodo: r.periodo || "", siniva: r.siniva?.toString() || "", coniva: r.coniva?.toString() || "", fcarga: r.fcarga || "", fvence: r.fvence || "", estatus: r.estatus || "", notas: r.notas || "" }); setEditRow(r); setErr(""); setOpen(true); };
  const cancel   = () => { setForm(EMPTY); setEditRow(null); setErr(""); setOpen(false); };

  const save = async () => {
    if (!form.factura || !form.siniva) { setErr("Factura y monto son obligatorios"); return; }
    setLoading(true); setErr("");
    try {
      const payload = { factura: form.factura, periodo: form.periodo, siniva: parseFloat(form.siniva), coniva: parseFloat(form.coniva), fcarga: form.fcarga, fvence: form.fvence, estatus: form.estatus, notas: form.notas };
      if (isEdit) {
        const { error } = await sb.from("ingresos").update(payload).eq("id", editRow.id);
        if (error) throw error;
      } else {
        const { error } = await sb.from("ingresos").insert(payload);
        if (error) throw error;
      }
      await reload();
      cancel();
    } catch (e) {
      setErr(e.message || "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  const remove = async (r) => {
    if (!window.confirm(`¿Eliminar factura ${r.factura}?`)) return;
    try {
      const { error } = await sb.from("ingresos").delete().eq("id", r.id);
      if (error) throw error;
      await reload();
    } catch (e) { alert(e.message); }
  };

  const rows = useMemo(() => (data || []).filter(r => inRange(r.fcarga, desde, hasta)), [data, desde, hasta]);

  return (
    <div>
      <FormPanel visible={open} title={isEdit ? "Editar ingreso" : "Nuevo ingreso"} isEdit={isEdit}>
        <ErrBanner msg={err} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Factura"><Input placeholder="FAC-2025-001" value={form.factura} onChange={e => set("factura", e.target.value)} /></Field>
          <Field label="Período"><Input placeholder="Feb 2025" value={form.periodo} onChange={e => set("periodo", e.target.value)} /></Field>
          <Field label="Monto sin IVA"><Input type="number" placeholder="0.00" value={form.siniva} onChange={e => set("siniva", e.target.value)} /></Field>
          <Field label="Monto con IVA"><Input type="number" placeholder="0.00" value={form.coniva} onChange={e => set("coniva", e.target.value)} /></Field>
          <Field label="Fecha de carga"><Input type="date" value={form.fcarga} onChange={e => set("fcarga", e.target.value)} /></Field>
          <Field label="Fecha de vencimiento"><Input type="date" value={form.fvence} onChange={e => set("fvence", e.target.value)} /></Field>
          <Field label="Estatus" span2>
            <Select value={form.estatus} onChange={v => set("estatus", v)} options={["Activo", "Pendiente", "Vencido", "Cancelado"]} placeholder="Seleccionar estatus..." />
          </Field>
          <Field label="Notas" span2>
            <Textarea placeholder="Observaciones adicionales..." value={form.notas} onChange={e => set("notas", e.target.value)} />
          </Field>
        </div>
        <BtnRow onCancel={cancel} onSave={save} isEdit={isEdit} loading={loading} />
      </FormPanel>

      {!open && <AddBtn onClick={openNew} label="+ Nuevo ingreso" />}

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr><Th>Factura</Th><Th>Período</Th><Th>Sin IVA</Th><Th>Con IVA</Th><Th>F. Carga</Th><Th>Vencimiento</Th><Th>Estatus</Th><Th>Notas</Th><Th>Acciones</Th></tr></thead>
          <tbody>
            {data === null ? <Loading /> :
             rows.length === 0 ? <EmptyRow cols={9} msg="Sin ingresos en este período" /> :
             rows.map(r => (
               <tr key={r.id} style={{ background: "#FFFFFF" }}
                 onMouseEnter={e => e.currentTarget.style.background = "#FAFCFA"}
                 onMouseLeave={e => e.currentTarget.style.background = "#FFFFFF"}>
                 <Td bold>{r.factura}</Td>
                 <Td>{r.periodo || "—"}</Td>
                 <Td>{fmt(r.siniva)}</Td>
                 <Td>{fmt(r.coniva)}</Td>
                 <Td>{r.fcarga || "—"}</Td>
                 <Td>{r.fvence || "—"}</Td>
                 <Td><Chip label={r.estatus} /></Td>
                 <Td><span style={{ color: C.muted, fontSize: 11, display: "block", maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.notas || "—"}</span></Td>
                 <RowActions onEdit={() => openEdit(r)} onDelete={() => remove(r)} />
               </tr>
             ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── MÓDULO CLIENTES ──────────────────────────────────────────────────────
// Cada cliente tiene datos básicos + tarifas por tipo de unidad
const TIPOS_UNIDAD = ["Moto", "Sedán", "Small Van", "Van", "Large Van", "Otro"];

function ModClientes({ data, reload }) {
  const EMPTY = {
    nombre: "", rfc: "", telefono: "", direccion: "",
    // tarifas por tipo de unidad — clave = tipo, valor = monto string
    tarifas: {},
  };
  const [open, setOpen]       = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [form, setForm]       = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [err, setErr]         = useState("");
  const isEdit = !!editRow;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setTarifa = (tipo, val) => setForm(f => ({ ...f, tarifas: { ...f.tarifas, [tipo]: val } }));

  const openNew  = () => { setForm(EMPTY); setEditRow(null); setErr(""); setOpen(true); };
  const openEdit = (r) => {
    setForm({
      nombre:    r.nombre    || "",
      rfc:       r.rfc       || "",
      telefono:  r.telefono  || "",
      direccion: r.direccion || "",
      tarifas:   r.tarifas   || {},
    });
    setEditRow(r); setErr(""); setOpen(true);
  };
  const cancel = () => { setForm(EMPTY); setEditRow(null); setErr(""); setOpen(false); };

  const save = async () => {
    if (!form.nombre) { setErr("El nombre del cliente es obligatorio"); return; }
    setLoading(true); setErr("");
    try {
      const payload = {
        nombre:    form.nombre,
        rfc:       form.rfc       || null,
        telefono:  form.telefono  || null,
        direccion: form.direccion || null,
        tarifas:   form.tarifas,  // jsonb column
      };
      if (isEdit) {
        const { error } = await sb.from("clientes").update(payload).eq("id", editRow.id);
        if (error) throw error;
      } else {
        const { error } = await sb.from("clientes").insert(payload);
        if (error) throw error;
      }
      await reload();
      cancel();
    } catch (e) {
      setErr(e.message || "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  const remove = async (r) => {
    if (!window.confirm(`¿Eliminar cliente ${r.nombre}?`)) return;
    try {
      const { error } = await sb.from("clientes").delete().eq("id", r.id);
      if (error) throw error;
      await reload();
    } catch (e) { alert(e.message); }
  };

  return (
    <div>
      <FormPanel visible={open} title={isEdit ? "Editar cliente" : "Nuevo cliente"} isEdit={isEdit}>
        <ErrBanner msg={err} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Nombre / Razón social" span2>
            <Input placeholder="Ej. Patitos S.A. de C.V." value={form.nombre} onChange={e => set("nombre", e.target.value)} />
          </Field>
          <Field label="RFC">
            <Input placeholder="PAT123456ABC" value={form.rfc} onChange={e => set("rfc", e.target.value)} />
          </Field>
          <Field label="Teléfono">
            <Input placeholder="55 1234 5678" value={form.telefono} onChange={e => set("telefono", e.target.value)} />
          </Field>
          <Field label="Dirección" span2>
            <Input placeholder="Calle, Colonia, Ciudad" value={form.direccion} onChange={e => set("direccion", e.target.value)} />
          </Field>

          {/* Tarifas por tipo de unidad */}
          <div style={{ gridColumn: "span 2", marginTop: 4 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
              Tarifas por tipo de unidad (flete por viaje)
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {TIPOS_UNIDAD.map(tipo => (
                <Field key={tipo} label={tipo}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 13, color: C.muted, flexShrink: 0 }}>$</span>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={form.tarifas[tipo] || ""}
                      onChange={e => setTarifa(tipo, e.target.value)}
                    />
                  </div>
                </Field>
              ))}
            </div>
          </div>
        </div>
        <BtnRow onCancel={cancel} onSave={save} isEdit={isEdit} loading={loading} />
      </FormPanel>

      {!open && <AddBtn onClick={openNew} label="+ Nuevo cliente" />}

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <Th>Nombre</Th><Th>RFC</Th><Th>Teléfono</Th>
              <Th>Moto</Th><Th>Sedán</Th><Th>Small Van</Th><Th>Van</Th><Th>Large Van</Th><Th>Otro</Th>
              <Th>Acciones</Th>
            </tr>
          </thead>
          <tbody>
            {data === null ? <Loading /> :
             data.length === 0 ? <EmptyRow cols={10} msg="Sin clientes registrados" /> :
             data.map(r => (
               <tr key={r.id} style={{ background: "#FFFFFF" }}
                 onMouseEnter={e => e.currentTarget.style.background = "#FAFCFA"}
                 onMouseLeave={e => e.currentTarget.style.background = "#FFFFFF"}>
                 <Td bold>{r.nombre}</Td>
                 <Td>{r.rfc || "—"}</Td>
                 <Td>{r.telefono || "—"}</Td>
                 {TIPOS_UNIDAD.map(tipo => (
                   <Td key={tipo}>
                     {r.tarifas?.[tipo] ? (
                       <span style={{ fontWeight: 600, color: C.green }}>{fmt(r.tarifas[tipo])}</span>
                     ) : (
                       <span style={{ color: C.border }}>—</span>
                     )}
                   </Td>
                 ))}
                 <RowActions onEdit={() => openEdit(r)} onDelete={() => remove(r)} />
               </tr>
             ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── COPY FIELD ───────────────────────────────────────────────────────────
function CopyField({ value, label }) {
  const [copied, setCopied] = useState(false);
  if (!value) return <span style={{ color: C.muted }}>—</span>;
  const copy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ fontFamily: "monospace", fontSize: 12 }}>{value}</span>
      <button onClick={copy} title={`Copiar ${label}`} style={{
        padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 600,
        cursor: "pointer", border: "1px solid #E2E8E3",
        background: copied ? C.greenSoft : "#FFFFFF",
        color: copied ? C.greenStrong : C.muted,
        transition: "all 0.2s", flexShrink: 0,
      }}>
        {copied ? "✓ Copiado" : "Copiar"}
      </button>
    </div>
  );
}

// ─── SECTION TITLE ────────────────────────────────────────────────────────
function SectionTitle({ children }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase",
      letterSpacing: "0.08em", marginBottom: 12, marginTop: 20,
      paddingBottom: 6, borderBottom: `1px solid ${C.border}`,
    }}>
      {children}
    </div>
  );
}

// ─── MINI KPI ─────────────────────────────────────────────────────────────
function MiniKpi({ label, value, sub, color }) {
  return (
    <div style={{
      background: C.card, border: "1px solid #E2E8E3", borderRadius: 16,
      padding: "14px 16px",
    }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: color || C.text, lineHeight: 1, marginBottom: 2 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: C.muted }}>{sub}</div>}
    </div>
  );
}

// ─── MÓDULO DASHBOARD ─────────────────────────────────────────────────────
function ModDashboard({ ingresos, gastos, rutas, operadores, unidades, clientes, desde, hasta }) {
  const ing  = useMemo(() => (ingresos || []).filter(r => inRange(r.fcarga, desde, hasta)), [ingresos, desde, hasta]);
  const gas  = useMemo(() => (gastos   || []).filter(r => inRange(r.fecha,  desde, hasta)), [gastos,   desde, hasta]);
  const rut  = useMemo(() => (rutas    || []).filter(r => inRange(r.fecha,  desde, hasta)), [rutas,    desde, hasta]);

  const totalIng    = ing.reduce((s, r) => s + parseFloat(r.coniva  || 0), 0);
  const totalSinIva = ing.reduce((s, r) => s + parseFloat(r.siniva  || 0), 0);
  const totalGas    = gas.reduce((s, r) => s + parseFloat(r.monto   || 0), 0);
  const totalFlete  = rut.reduce((s, r) => s + parseFloat(r.flete   || 0), 0);
  const util        = totalIng - totalGas;
  const margen      = totalIng > 0 ? Math.round(util / totalIng * 100) : 0;

  // Estatus ingresos
  const ingPagados  = ing.filter(r => r.estatus === "Activo").length;
  const ingPending  = ing.filter(r => r.estatus === "Pendiente").length;
  const ingVencidos = ing.filter(r => r.estatus === "Vencido").length;

  // Gastos estatus pago
  const gasPagados  = gas.filter(r => r.estatus_pago === "Pagado").length;
  const gasPorPagar = gas.filter(r => r.estatus_pago !== "Pagado").length;

  // Gastos por tipo para distribución
  const gasXTipo = gas.reduce((acc, r) => {
    const t = r.tipo_gasto || "Sin tipo";
    acc[t] = (acc[t] || 0) + parseFloat(r.monto || 0);
    return acc;
  }, {});
  const gasXTipoArr = Object.entries(gasXTipo).sort((a, b) => b[1] - a[1]);
  const DIST_COLORS = ["#2E7D32", "#69A96D", "#74B72E", "#0F5C2E", "#AACFAA", "#E2E8E3"];

  // Rutas por tipo unidad
  const rutXTipo = rut.reduce((acc, r) => {
    const u = (unidades || []).find(u => u.economico === r.unidad_id);
    const t = u?.tipo_unidad || "Sin tipo";
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});

  // Tendencia mensual (últimos 6 meses, ignora filtro para mostrar contexto)
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleString("es-MX", { month: "short" }).replace(".", "");
    const ingM   = (ingresos || []).filter(r => (r.fcarga || "").startsWith(key)).reduce((s, r) => s + parseFloat(r.coniva || 0), 0);
    const gasM   = (gastos   || []).filter(r => (r.fecha  || "").startsWith(key)).reduce((s, r) => s + parseFloat(r.monto  || 0), 0);
    const fleM   = (rutas    || []).filter(r => (r.fecha  || "").startsWith(key)).reduce((s, r) => s + parseFloat(r.flete  || 0), 0);
    months.push({ label, ingM, gasM, fleM, rutN: (rutas || []).filter(r => (r.fecha || "").startsWith(key)).length });
  }

  // Bar chart helper
  const BarChart = ({ data, color, valueKey, labelFn }) => {
    const max = Math.max(...data.map(d => d[valueKey]), 1);
    const H = 100; const bw = 32;
    return (
      <svg width={data.length * 52} height={H + 40} style={{ display: "block", overflow: "visible" }}>
        {data.map((d, i) => {
          const h = Math.max(3, (d[valueKey] / max) * H);
          const x = i * 52 + 10;
          const isLast = i === data.length - 1;
          return (
            <g key={d.label}>
              <rect x={x} y={H - h} width={bw} height={h}
                fill={isLast ? color : color + "99"} rx={4} />
              <text x={x + bw / 2} y={H - h - 5} textAnchor="middle"
                fontSize={9} fill="#6B7A72">
                {labelFn ? labelFn(d[valueKey]) : d[valueKey]}
              </text>
              <text x={x + bw / 2} y={H + 16} textAnchor="middle"
                fontSize={10} fill="#6B7A72">{d.label}</text>
            </g>
          );
        })}
        <line x1={0} y1={H} x2={data.length * 52 + 20} y2={H} stroke="#E2E8E3" strokeWidth={1} />
      </svg>
    );
  };

  // Stat card with icon + bar chart
  const StatCard = ({ label, value, sub, delta, color, icon, chartData, chartKey, chartLabelFn }) => (
    <div style={{
      background: "#FFFFFF", border: "1px solid #E2E8E3", borderRadius: 20,
      padding: "20px 22px", boxShadow: "0 2px 12px rgba(18,32,25,0.05)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{ fontSize: 13, color: "#6B7A72", fontWeight: 500 }}>{label}</div>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: color + "18", display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 16,
        }}>{icon}</div>
      </div>
      <div style={{ fontSize: 32, fontWeight: 800, color: "#132019", lineHeight: 1, marginBottom: 4 }}>{value}</div>
      {sub  && <div style={{ fontSize: 12, color: "#6B7A72", marginBottom: 2 }}>{sub}</div>}
      {delta !== undefined && (
        <div style={{ fontSize: 12, fontWeight: 600, color: delta >= 0 ? "#2E7D32" : "#C62828" }}>
          {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}%
        </div>
      )}
      {chartData && (
        <div style={{ marginTop: 12, overflowX: "auto" }}>
          <BarChart data={chartData} color={color} valueKey={chartKey} labelFn={chartLabelFn} />
        </div>
      )}
    </div>
  );

  const fmtM = (n) => {
    if (n >= 1000000) return "$" + (n / 1000000).toFixed(1) + "M";
    if (n >= 1000)    return "$" + (n / 1000).toFixed(0) + "k";
    return fmt(n);
  };

  const periodoLabel = desde || hasta
    ? `${desde || "inicio"} → ${hasta || "hoy"}`
    : "Todo el período";

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#132019", margin: 0 }}>Dashboard VDL</h1>
          <p style={{ fontSize: 13, color: "#6B7A72", margin: "4px 0 0" }}>Métricas de flotilla · {periodoLabel}</p>
        </div>
      </div>

      {/* ── KPI Cards Row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 14, marginBottom: 20 }}>
        <StatCard label="Ingresos (con IVA)"  value={fmtM(totalIng)}   sub={`${ing.length} facturas`}                    color="#2E7D32" icon="💰" />
        <StatCard label="Gastos operativos"   value={fmtM(totalGas)}   sub={`${gas.length} registros`}                   color="#C62828" icon="📤" />
        <StatCard label="Utilidad neta"       value={fmtM(util)}       sub={`Margen ${margen}%`}                          color={util >= 0 ? "#2E7D32" : "#C62828"} icon="📊" />
        <StatCard label="Fletes estimados"    value={fmtM(totalFlete)} sub={`${rut.length} rutas`}                        color="#74B72E" icon="🚛" />
      </div>

      {/* ── Charts Row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 20 }}>
        {/* Ingresos por mes */}
        <div style={{ background: "#FFFFFF", border: "1px solid #E2E8E3", borderRadius: 20, padding: "20px 22px" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#132019", marginBottom: 16 }}>Ingresos por mes</div>
          <div style={{ overflowX: "auto" }}>
            <BarChart data={months} color="#2E7D32" valueKey="ingM" labelFn={fmtM} />
          </div>
        </div>
        {/* Gastos por mes */}
        <div style={{ background: "#FFFFFF", border: "1px solid #E2E8E3", borderRadius: 20, padding: "20px 22px" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#132019", marginBottom: 16 }}>Gastos por mes</div>
          <div style={{ overflowX: "auto" }}>
            <BarChart data={months} color="#C62828" valueKey="gasM" labelFn={fmtM} />
          </div>
        </div>
        {/* Fletes por mes */}
        <div style={{ background: "#FFFFFF", border: "1px solid #E2E8E3", borderRadius: 20, padding: "20px 22px" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#132019", marginBottom: 16 }}>Fletes por mes</div>
          <div style={{ overflowX: "auto" }}>
            <BarChart data={months} color="#74B72E" valueKey="fleM" labelFn={fmtM} />
          </div>
        </div>
      </div>

      {/* ── Distribución gastos por tipo (barra horizontal) ── */}
      {gasXTipoArr.length > 0 && (
        <div style={{ background: "#FFFFFF", border: "1px solid #E2E8E3", borderRadius: 20, padding: "20px 22px", marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#132019", marginBottom: 14 }}>Distribución de gastos por tipo</div>
          <div style={{ display: "flex", height: 36, borderRadius: 10, overflow: "hidden", marginBottom: 14 }}>
            {gasXTipoArr.map(([tipo, monto], i) => {
              const pct = Math.round((monto / totalGas) * 100);
              return (
                <div key={tipo} style={{
                  width: `${pct}%`, minWidth: pct > 5 ? "auto" : 0,
                  background: DIST_COLORS[i % DIST_COLORS.length],
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 700, color: "#fff",
                  transition: "width 0.3s",
                }}>
                  {pct > 8 ? `${pct}%` : ""}
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 20px" }}>
            {gasXTipoArr.map(([tipo, monto], i) => (
              <div key={tipo} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: DIST_COLORS[i % DIST_COLORS.length], display: "inline-block", flexShrink: 0 }} />
                <span style={{ color: "#6B7A72" }}>{tipo}:</span>
                <span style={{ fontWeight: 700, color: "#132019" }}>{fmt(monto)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tabla resumen por tipo de unidad ── */}
      <div style={{ background: "#FFFFFF", border: "1px solid #E2E8E3", borderRadius: 20, padding: "20px 22px", marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#132019", marginBottom: 14 }}>VDL — Resumen por tipo de unidad</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #E2E8E3" }}>
                {["Tipo", "Rutas", "Flete total", "Flete prom.", "Operadores", "Propias", "Terceras"].map(h => (
                  <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#6B7A72", textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(rutXTipo).sort((a, b) => b[1] - a[1]).map(([tipo, count], i) => {
                const rutasTipo = rut.filter(r => {
                  const u = (unidades || []).find(u => u.economico === r.unidad_id);
                  return (u?.tipo_unidad || "Sin tipo") === tipo;
                });
                const fleteT = rutasTipo.reduce((s, r) => s + parseFloat(r.flete || 0), 0);
                const opsTipo = new Set(rutasTipo.map(r => r.operador).filter(Boolean)).size;
                const unisTipo = (unidades || []).filter(u => u.tipo_unidad === tipo);
                const prop = unisTipo.filter(u => u.prop === "Propia").length;
                const terc = unisTipo.filter(u => u.prop === "Tercera").length;
                return (
                  <tr key={tipo} style={{ borderBottom: "1px solid #E2E8E3", background: i % 2 === 0 ? "#FFFFFF" : "#FAFCFA" }}>
                    <td style={{ padding: "10px 12px", fontWeight: 600 }}><Chip label={tipo} /></td>
                    <td style={{ padding: "10px 12px" }}>{count}</td>
                    <td style={{ padding: "10px 12px", fontWeight: 700, color: "#2E7D32" }}>{fmt(fleteT)}</td>
                    <td style={{ padding: "10px 12px" }}>{count > 0 ? fmt(fleteT / count) : "—"}</td>
                    <td style={{ padding: "10px 12px" }}>{opsTipo}</td>
                    <td style={{ padding: "10px 12px" }}>{prop}</td>
                    <td style={{ padding: "10px 12px" }}>{terc}</td>
                  </tr>
                );
              })}
              {Object.keys(rutXTipo).length === 0 && (
                <tr><td colSpan={7} style={{ padding: "24px", textAlign: "center", color: "#6B7A72" }}>Sin rutas en este período</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Estatus ingresos + gastos ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div style={{ background: "#FFFFFF", border: "1px solid #E2E8E3", borderRadius: 20, padding: "20px 22px" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#132019", marginBottom: 14 }}>Ingresos por estatus</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <MiniKpi label="Activos"    value={ingPagados} sub="facturas" color="#2E7D32" />
            <MiniKpi label="Pendientes" value={ingPending}  sub="facturas" color="#B45309" />
            <MiniKpi label="Vencidos"   value={ingVencidos} sub="facturas" color="#C62828" />
          </div>
        </div>
        <div style={{ background: "#FFFFFF", border: "1px solid #E2E8E3", borderRadius: 20, padding: "20px 22px" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#132019", marginBottom: 14 }}>Gastos — estatus de pago</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <MiniKpi label="Pagados"    value={gasPagados}  sub="registros" color="#2E7D32" />
            <MiniKpi label="Por pagar"  value={gasPorPagar} sub="registros" color="#B45309" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ROOT COMPONENT ───────────────────────────────────────────────────────
export default function VDLModulos() {
  const [mod, setMod] = useState("ingresos");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  // ── Data state — null = loading, [] = empty, [...] = loaded
  const [ingresos,   setIngresos]   = useState(null);
  const [gastos,     setGastos]     = useState(null);
  const [operadores, setOperadores] = useState(null);
  const [rutas,      setRutas]      = useState(null);
  const [unidades,   setUnidades]   = useState(null);
  const [clientes,   setClientes]   = useState(null);

  // ── Fetch all tables ──────────────────────────────────────────────────
  const fetchTable = useCallback(async (table, setter) => {
    const { data, error } = await sb.from(table).select("*").order("created_at", { ascending: false });
    if (!error) setter(data || []);
    else console.error(`Error fetching ${table}:`, error.message);
  }, []);

  const reloadUnidades   = useCallback(() => fetchTable("unidades",   setUnidades),   [fetchTable]);
  const reloadOperadores = useCallback(() => fetchTable("operadores", setOperadores), [fetchTable]);
  const reloadRutas      = useCallback(() => fetchTable("rutas",      setRutas),      [fetchTable]);
  const reloadGastos     = useCallback(() => fetchTable("gastos",     setGastos),     [fetchTable]);
  const reloadIngresos   = useCallback(() => fetchTable("ingresos",   setIngresos),   [fetchTable]);
  const reloadClientes   = useCallback(() => fetchTable("clientes",   setClientes),   [fetchTable]);

  // Initial load — fetch everything on mount
  useEffect(() => {
    syncRutaCounter();
    reloadUnidades();
    reloadOperadores();
    reloadRutas();
    reloadGastos();
    reloadIngresos();
    reloadClientes();
  }, []);

  // ── KPIs ─────────────────────────────────────────────────────────────
  const kpi = useMemo(() => {
    const ingFilt = (ingresos || []).filter(r => inRange(r.fcarga, desde, hasta));
    const gasFilt = (gastos   || []).filter(r => inRange(r.fecha,  desde, hasta));
    const rutFilt = (rutas    || []).filter(r => inRange(r.fecha,  desde, hasta));
    const totalIng   = ingFilt.reduce((s, r) => s + parseFloat(r.coniva || 0), 0);
    const totalGas   = gasFilt.reduce((s, r) => s + parseFloat(r.monto  || 0), 0);
    const totalFlete = rutFilt.reduce((s, r) => s + parseFloat(r.flete  || 0), 0);
    const util = totalIng - totalGas;
    const pct  = totalIng > 0 ? Math.round(util / totalIng * 100) : 0;
    // IVA: solo facturas con estatus "Activo" (pagadas)
    const ingPagadas = ingFilt.filter(r => r.estatus === "Activo");
    const totalIVA   = ingPagadas.reduce((s, r) => {
      const coniva = parseFloat(r.coniva || 0);
      const siniva = parseFloat(r.siniva || 0);
      return s + (coniva - siniva);
    }, 0);
    return { totalIng, totalGas, totalFlete, totalIVA, util, pct, ingN: ingFilt.length, gasN: gasFilt.length, rutN: rutFilt.length };
  }, [ingresos, gastos, rutas, desde, hasta]);

  const navIds = ["dashboard", "ingresos", "gastos", "clientes", "operadores", "rutas", "unidades"];

  return (
    <main style={{ minHeight: "100vh", background: C.bg, display: "flex", fontFamily: "'Inter', 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      {/* SIDEBAR */}
      <aside style={{ width: 230, flexShrink: 0, background: C.sidebar, color: "#fff", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, background: "#163629", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: C.lime }}>V</div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em" }}>VDL</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: -2 }}>Verde Diseño Logistic</div>
            </div>
          </div>
        </div>
        <nav style={{ padding: "12px 0", flex: 1, overflowY: "auto" }}>
          {NAV_GROUPS.map(group => (
            <div key={group.label} style={{ marginBottom: 6 }}>
              <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.16em", color: "rgba(255,255,255,0.25)", padding: "8px 20px 4px" }}>
                {group.label}
              </div>
              {group.ids.map(id => (
                <NavItem key={id} id={id} active={mod === id} onClick={() => setMod(id)} />
              ))}
            </div>
          ))}
        </nav>
        <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.08)", fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
          VDL · Control Financiero
        </div>
      </aside>

      {/* MAIN */}
      <section style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        {/* KPIs */}
        <div style={{ padding: "20px 28px 0" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0,1fr))", gap: 12, marginBottom: 20 }}>
            <KpiCard label="Ingresos"  value={fmt(kpi.totalIng)}   sub={`${kpi.ingN} factura${kpi.ingN !== 1 ? "s" : ""} · con IVA`}      badge="▲ Cobros"   badgeType="up" />
            <KpiCard label="Gastos"    value={fmt(kpi.totalGas)}   sub={`${kpi.gasN} registro${kpi.gasN !== 1 ? "s" : ""} · operativos`}  badge="Egresos"    badgeType={kpi.totalGas > 0 ? "down" : "neu"} />
            <KpiCard label="Utilidad"  value={fmt(kpi.util)}       sub={`Margen ${kpi.pct}%`}
              badge={kpi.totalIng === 0 && kpi.totalGas === 0 ? "Sin datos" : kpi.util >= 0 ? "▲ Positiva" : "▼ Negativa"}
              badgeType={kpi.totalIng === 0 && kpi.totalGas === 0 ? "neu" : kpi.util >= 0 ? "up" : "down"} />
            <KpiCard label="IVA cobrado" value={fmt(kpi.totalIVA)} sub="facturas activas · período"                                        badge="Solo Activos" badgeType="up" />
            <KpiCard label="Fletes"    value={fmt(kpi.totalFlete)} sub={`${kpi.rutN} ruta${kpi.rutN !== 1 ? "s" : ""} · estimado`}        badge="Prefactura"  badgeType="up" />
            <KpiCard label="Rutas"     value={kpi.rutN}            sub="en el período"                                                     badge="Viajes"      badgeType="neu" />
          </div>
        </div>

        {/* FILTRO FECHA */}
        <div style={{ padding: "12px 28px", borderTop: "1px solid #E2E8E3", borderBottom: "1px solid #E2E8E3", background: "#EFF4EF", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>Filtrar por fecha</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <label style={{ fontSize: 12, color: C.muted }}>Desde</label>
            <input type="date" value={desde} onChange={e => setDesde(e.target.value)} style={{ ...inputStyle, width: "auto", fontSize: 12, padding: "6px 10px" }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <label style={{ fontSize: 12, color: C.muted }}>Hasta</label>
            <input type="date" value={hasta} onChange={e => setHasta(e.target.value)} style={{ ...inputStyle, width: "auto", fontSize: 12, padding: "6px 10px" }} />
          </div>
          <button onClick={() => { setDesde(""); setHasta(""); }} style={{ padding: "6px 14px", borderRadius: 10, fontSize: 12, fontWeight: 500, cursor: "pointer", border: "1px solid #E2E8E3", background: C.card, color: C.muted }}>Limpiar</button>
          <span style={{ fontSize: 11, color: C.muted, marginLeft: "auto" }}>
            {desde || hasta ? `Filtrado: ${desde || "inicio"} → ${hasta || "hoy"}` : "Mostrando todos los registros"}
          </span>
        </div>

        {/* MODULE HEADER */}
        <div style={{ padding: "16px 28px", borderBottom: "1px solid #E2E8E3" }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: C.text, letterSpacing: "-0.02em" }}>{MOD_META[mod].title}</h2>
          <p style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>{MOD_META[mod].sub}</p>
        </div>

        {/* MODULE CONTENT */}
        <div style={{ flex: 1, padding: "20px 28px", overflowY: "auto" }}>
          {mod === "dashboard"  && <ModDashboard  ingresos={ingresos || []} gastos={gastos || []} rutas={rutas || []} operadores={operadores || []} unidades={unidades || []} clientes={clientes || []} desde={desde} hasta={hasta} />}
          {mod === "ingresos"   && <ModIngresos   data={ingresos}   reload={reloadIngresos}   desde={desde} hasta={hasta} />}
          {mod === "gastos"     && <ModGastos     data={gastos}     reload={reloadGastos}     desde={desde} hasta={hasta} rutas={rutas || []} operadores={operadores || []} />}
          {mod === "clientes"   && <ModClientes   data={clientes}   reload={reloadClientes} />}
          {mod === "operadores" && <ModOperadores data={operadores} reload={reloadOperadores} unidades={unidades || []} />}
          {mod === "rutas"      && <ModRutas      data={rutas}      reload={reloadRutas}      desde={desde} hasta={hasta} operadores={operadores || []} unidades={unidades || []} clientes={clientes || []} />}
          {mod === "unidades"   && <ModUnidades   data={unidades}   reload={reloadUnidades} />}
        </div>
      </section>
    </main>
  );
}
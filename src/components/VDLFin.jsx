"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
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
  Combustible:    { bg: "#E6F1FB", color: "#0C447C" },
  Gasolina:       { bg: "#E6F1FB", color: "#0C447C" },
  Caseta:         { bg: "#E2E8E3", color: "#4A5C52" },
  "Nómina":       { bg: "#FAEEDA", color: "#633806" },
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

function NavItem({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{ display: "flex", alignItems: "center", width: "100%", padding: "10px 16px", background: active ? "#173428" : "transparent", border: "none", borderLeft: active ? "3px solid #74B72E" : "3px solid transparent", color: active ? "#fff" : "rgba(255,255,255,0.65)", fontSize: 14, fontWeight: active ? 600 : 400, cursor: "pointer", textAlign: "left", transition: "all 0.15s", borderRadius: active ? "0 10px 10px 0" : 0 }}>
      {label}
    </button>
  );
}

const MOD_META = {
  ingresos:   { title: "Ingresos",   sub: "Registro de facturas y cobros" },
  gastos:     { title: "Gastos",     sub: "Control de egresos operativos" },
  operadores: { title: "Operadores", sub: "Registro de conductores y asignación" },
  rutas:      { title: "Rutas",      sub: "Registro de viajes con ID automático" },
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
  const EMPTY = { nombre: "", economico: "", unidad: "", tunidad: "", tipo: "" };
  const [open, setOpen]       = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [form, setForm]       = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [err, setErr]         = useState("");
  const isEdit = !!editRow;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const unidadOpts = (unidades || []).map(u => u.economico).filter(Boolean);

  const selUnidad = (eco) => {
    const u = (unidades || []).find(u => u.economico === eco);
    setForm(f => ({ ...f, unidad: eco, tunidad: u?.tipo_unidad || "" }));
  };

  const openNew  = () => { setForm(EMPTY); setEditRow(null); setErr(""); setOpen(true); };
  const openEdit = (r) => { setForm({ nombre: r.nombre, economico: r.economico || "", unidad: r.unidad || "", tunidad: r.tunidad || "", tipo: r.tipo || "" }); setEditRow(r); setErr(""); setOpen(true); };
  const cancel   = () => { setForm(EMPTY); setEditRow(null); setErr(""); setOpen(false); };

  const save = async () => {
    if (!form.nombre) { setErr("El nombre es obligatorio"); return; }
    setLoading(true); setErr("");
    try {
      const payload = { nombre: form.nombre, economico: form.economico, unidad: form.unidad, tunidad: form.tunidad, tipo: form.tipo };
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

  const unidadSelected = form.unidad ? (unidades || []).find(u => u.economico === form.unidad) : null;

  return (
    <div>
      <FormPanel visible={open} title={isEdit ? "Editar operador" : "Nuevo operador"} isEdit={isEdit}>
        <ErrBanner msg={err} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Nombre completo"><Input placeholder="Nombre del operador" value={form.nombre} onChange={e => set("nombre", e.target.value)} /></Field>
          <Field label="Económico"><Input placeholder="ECO-001" value={form.economico} onChange={e => set("economico", e.target.value)} /></Field>
          <Field label="Unidad asignada" span2>
            {unidadOpts.length === 0
              ? <EmptyHint msg="No hay unidades registradas. Agrega unidades primero." />
              : <Select value={form.unidad} onChange={selUnidad} options={unidadOpts} placeholder="Seleccionar unidad..." />}
          </Field>
          {unidadSelected && (
            <GreenBanner>
              <span style={{ fontWeight: 600 }}>Unidad seleccionada:</span>
              <IdBadge id={unidadSelected.economico} />
              <Chip label={unidadSelected.tipo_unidad} />
              {unidadSelected.marca && <span style={{ fontSize: 11, color: C.greenStrong }}>{unidadSelected.marca} {unidadSelected.modelo}</span>}
            </GreenBanner>
          )}
          <Field label="Tipo de operador" span2>
            <Select value={form.tipo} onChange={v => set("tipo", v)} options={["Tercera", "Propia"]} placeholder="Seleccionar tipo..." />
          </Field>
        </div>
        <BtnRow onCancel={cancel} onSave={save} isEdit={isEdit} loading={loading} />
      </FormPanel>

      {!open && <AddBtn onClick={openNew} label="+ Nuevo operador" />}

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr><Th>Nombre</Th><Th>Unidad</Th><Th>Tipo unidad</Th><Th>Económico</Th><Th>Tipo operador</Th><Th>Acciones</Th></tr></thead>
          <tbody>
            {data === null ? <Loading /> :
             data.length === 0 ? <EmptyRow cols={6} msg="Sin operadores registrados" /> :
             data.map(r => (
               <tr key={r.id} style={{ background: "#FFFFFF" }}
                 onMouseEnter={e => e.currentTarget.style.background = "#FAFCFA"}
                 onMouseLeave={e => e.currentTarget.style.background = "#FFFFFF"}>
                 <Td bold>{r.nombre}</Td>
                 <Td><IdBadge id={r.unidad} /></Td>
                 <Td><Chip label={r.tunidad} /></Td>
                 <Td><IdBadge id={r.economico} /></Td>
                 <Td><Chip label={r.tipo} /></Td>
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
function ModRutas({ data, reload, desde, hasta, operadores }) {
  const EMPTY = { fecha: "", cliente: "", operador: "", unidad: "", tunidad: "" };
  const [open, setOpen]       = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [form, setForm]       = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [err, setErr]         = useState("");
  const isEdit = !!editRow;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const operadorOpts = (operadores || []).map(o => o.nombre).filter(Boolean);

  const selOperador = (nombre) => {
    const op = (operadores || []).find(o => o.nombre === nombre);
    setForm(f => ({ ...f, operador: nombre, unidad: op?.unidad || "", tunidad: op?.tunidad || "" }));
  };

  const openNew  = () => { setForm(EMPTY); setEditRow(null); setErr(""); setOpen(true); };
  const openEdit = (r) => { setForm({ fecha: r.fecha || "", cliente: r.cliente, operador: r.operador || "", unidad: r.unidad || "", tunidad: r.tunidad || "" }); setEditRow(r); setErr(""); setOpen(true); };
  const cancel   = () => { setForm(EMPTY); setEditRow(null); setErr(""); setOpen(false); };

  const save = async () => {
    if (!form.cliente)  { setErr("El cliente es obligatorio"); return; }
    if (!form.operador) { setErr("Selecciona un operador"); return; }
    setLoading(true); setErr("");
    try {
      if (isEdit) {
        const { error } = await sb.from("rutas").update({ fecha: form.fecha, cliente: form.cliente, operador: form.operador, unidad: form.unidad, tunidad: form.tunidad }).eq("id", editRow.id);
        if (error) throw error;
      } else {
        const newId = nextRutaId();
        const { error } = await sb.from("rutas").insert({ id: newId, fecha: form.fecha, cliente: form.cliente, operador: form.operador, unidad: form.unidad, tunidad: form.tunidad });
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

  const rows = useMemo(() => (data || []).filter(r => inRange(r.fecha, desde, hasta)), [data, desde, hasta]);
  const opSelected = form.operador ? (operadores || []).find(o => o.nombre === form.operador) : null;

  return (
    <div>
      <FormPanel visible={open} title={isEdit ? "Editar ruta" : "Nueva ruta — ID generado automáticamente"} isEdit={isEdit}>
        <ErrBanner msg={err} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Fecha"><Input type="date" value={form.fecha} onChange={e => set("fecha", e.target.value)} /></Field>
          <Field label="Cliente"><Input placeholder="Nombre del cliente" value={form.cliente} onChange={e => set("cliente", e.target.value)} /></Field>
          <Field label="Operador" span2>
            {operadorOpts.length === 0
              ? <EmptyHint msg="No hay operadores registrados. Agrega operadores primero." />
              : <Select value={form.operador} onChange={selOperador} options={operadorOpts} placeholder="Seleccionar operador..." />}
          </Field>
          {opSelected && (
            <GreenBanner>
              <span style={{ fontWeight: 600 }}>Unidad heredada:</span>
              <IdBadge id={opSelected.unidad} />
              {opSelected.tunidad && <Chip label={opSelected.tunidad} />}
              {opSelected.tipo    && <Chip label={opSelected.tipo} />}
            </GreenBanner>
          )}
        </div>
        <BtnRow onCancel={cancel} onSave={save} isEdit={isEdit} loading={loading} />
      </FormPanel>

      {!open && <AddBtn onClick={openNew} label="+ Nueva ruta" />}

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr><Th>ID Ruta</Th><Th>Fecha</Th><Th>Operador</Th><Th>Unidad</Th><Th>Tipo unidad</Th><Th>Cliente</Th><Th>Acciones</Th></tr></thead>
          <tbody>
            {data === null ? <Loading /> :
             rows.length === 0 ? <EmptyRow cols={7} msg="Sin rutas en este período" /> :
             rows.map(r => (
               <tr key={r.id} style={{ background: "#FFFFFF" }}
                 onMouseEnter={e => e.currentTarget.style.background = "#FAFCFA"}
                 onMouseLeave={e => e.currentTarget.style.background = "#FFFFFF"}>
                 <Td><IdBadge id={r.id} /></Td>
                 <Td>{r.fecha || "—"}</Td>
                 <Td bold>{r.operador || "—"}</Td>
                 <Td><IdBadge id={r.unidad} /></Td>
                 <Td><Chip label={r.tunidad} /></Td>
                 <Td>{r.cliente}</Td>
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

// ─── MÓDULO GASTOS ────────────────────────────────────────────────────────
function ModGastos({ data, reload, desde, hasta, rutas }) {
  const EMPTY = { monto: "", tipo: "", fecha: "", ruta: "", unidad: "", operador: "" };
  const [open, setOpen]       = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [form, setForm]       = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [err, setErr]         = useState("");
  const isEdit = !!editRow;

  const set = (k, v) => setForm(f => {
    const next = { ...f, [k]: v };
    if (k === "fecha") next.ruta = "";
    return next;
  });

  const rutasDelDia = useMemo(() => (rutas || []).filter(r => r.fecha === form.fecha), [rutas, form.fecha]);

  const selRuta = (rutaId) => {
    const r = (rutas || []).find(r => r.id === rutaId);
    setForm(f => ({ ...f, ruta: rutaId, operador: r?.operador || "", unidad: r?.unidad || "" }));
  };

  const openNew  = () => { setForm(EMPTY); setEditRow(null); setErr(""); setOpen(true); };
  const openEdit = (r) => { setForm({ monto: r.monto?.toString() || "", tipo: r.tipo || "", fecha: r.fecha || "", ruta: r.ruta || "", unidad: r.unidad || "", operador: r.operador || "" }); setEditRow(r); setErr(""); setOpen(true); };
  const cancel   = () => { setForm(EMPTY); setEditRow(null); setErr(""); setOpen(false); };

  const save = async () => {
    if (!form.monto) { setErr("El monto es obligatorio"); return; }
    setLoading(true); setErr("");
    try {
      const payload = { monto: parseFloat(form.monto), tipo: form.tipo, fecha: form.fecha, ruta: form.ruta, unidad: form.unidad, operador: form.operador };
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

  const rows = useMemo(() => (data || []).filter(r => inRange(r.fecha, desde, hasta)), [data, desde, hasta]);
  const rutaSelected = form.ruta ? (rutas || []).find(r => r.id === form.ruta) : null;

  return (
    <div>
      <FormPanel visible={open} title={isEdit ? "Editar gasto" : "Nuevo gasto"} isEdit={isEdit}>
        <ErrBanner msg={err} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Monto"><Input type="number" placeholder="0.00" value={form.monto} onChange={e => set("monto", e.target.value)} /></Field>
          <Field label="Fecha"><Input type="date" value={form.fecha} onChange={e => set("fecha", e.target.value)} /></Field>
          <Field label="ID Ruta — filtrado por fecha" span2>
            {!form.fecha ? <EmptyHint msg="Selecciona una fecha primero." />
              : rutasDelDia.length === 0 ? <EmptyHint msg={`No hay rutas para el ${form.fecha}.`} />
              : <Select value={form.ruta} onChange={selRuta} options={rutasDelDia.map(r => r.id)} placeholder="Seleccionar ruta del día..." />}
          </Field>
          {rutaSelected && (
            <GreenBanner>
              <span style={{ fontWeight: 600 }}>Heredado de la ruta:</span>
              <span>Operador: <strong>{rutaSelected.operador || "—"}</strong></span>
              <span>·</span>
              <span>Unidad: <strong>{rutaSelected.unidad || "—"}</strong></span>
            </GreenBanner>
          )}
          <Field label="Tipo de gasto" span2>
            <Select value={form.tipo} onChange={v => set("tipo", v)}
              options={["Nómina", "Combustible", "Impuesto", "Gasolina", "Estacionamiento", "Caseta", "Otro"]}
              placeholder="Seleccionar tipo..." />
          </Field>
        </div>
        <BtnRow onCancel={cancel} onSave={save} isEdit={isEdit} loading={loading} />
      </FormPanel>

      {!open && <AddBtn onClick={openNew} label="+ Nuevo gasto" />}

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr><Th>Fecha</Th><Th>Monto</Th><Th>Tipo</Th><Th>ID Ruta</Th><Th>Unidad</Th><Th>Operador</Th><Th>Acciones</Th></tr></thead>
          <tbody>
            {data === null ? <Loading /> :
             rows.length === 0 ? <EmptyRow cols={7} msg="Sin gastos en este período" /> :
             rows.map(r => (
               <tr key={r.id} style={{ background: "#FFFFFF" }}
                 onMouseEnter={e => e.currentTarget.style.background = "#FAFCFA"}
                 onMouseLeave={e => e.currentTarget.style.background = "#FFFFFF"}>
                 <Td>{r.fecha || "—"}</Td>
                 <Td bold>{fmt(r.monto)}</Td>
                 <Td><Chip label={r.tipo} /></Td>
                 <Td><IdBadge id={r.ruta} /></Td>
                 <Td>{r.unidad || "—"}</Td>
                 <Td>{r.operador || "—"}</Td>
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

  const set = (k, v) => setForm(f => {
    const next = { ...f, [k]: v };
    if (k === "siniva") next.coniva = v ? (parseFloat(v) * 1.16).toFixed(2) : "";
    return next;
  });

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
          <Field label="Monto con IVA (16%)"><Input type="number" value={form.coniva} readOnly style={{ ...inputStyle, background: "#EFF3EF", color: C.muted }} /></Field>
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

  // Initial load — fetch everything on mount
  useEffect(() => {
    reloadUnidades();
    reloadOperadores();
    reloadRutas();
    reloadGastos();
    reloadIngresos();
  }, []);

  // ── KPIs ─────────────────────────────────────────────────────────────
  const kpi = useMemo(() => {
    const ingFilt = (ingresos || []).filter(r => inRange(r.fcarga, desde, hasta));
    const gasFilt = (gastos   || []).filter(r => inRange(r.fecha,  desde, hasta));
    const rutFilt = (rutas    || []).filter(r => inRange(r.fecha,  desde, hasta));
    const totalIng = ingFilt.reduce((s, r) => s + parseFloat(r.coniva || 0), 0);
    const totalGas = gasFilt.reduce((s, r) => s + parseFloat(r.monto  || 0), 0);
    const util = totalIng - totalGas;
    const pct  = totalIng > 0 ? Math.round(util / totalIng * 100) : 0;
    return { totalIng, totalGas, util, pct, ingN: ingFilt.length, gasN: gasFilt.length, rutN: rutFilt.length };
  }, [ingresos, gastos, rutas, desde, hasta]);

  const navItems = [
    { id: "ingresos",   label: "Ingresos"   },
    { id: "gastos",     label: "Gastos"     },
    { id: "operadores", label: "Operadores" },
    { id: "rutas",      label: "Rutas"      },
    { id: "unidades",   label: "Unidades"   },
  ];

  return (
    <main style={{ minHeight: "100vh", background: C.bg, display: "flex" }}>
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
        <nav style={{ padding: "16px 0", flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", color: "rgba(255,255,255,0.3)", padding: "0 20px", marginBottom: 8 }}>MÓDULOS</div>
          {navItems.map(item => (
            <NavItem key={item.id} label={item.label} active={mod === item.id} onClick={() => setMod(item.id)} />
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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 14, marginBottom: 20 }}>
            <KpiCard label="Ingresos"  value={fmt(kpi.totalIng)} sub={`${kpi.ingN} factura${kpi.ingN !== 1 ? "s" : ""} · con IVA`}        badge="▲ Cobros"  badgeType="up" />
            <KpiCard label="Gastos"    value={fmt(kpi.totalGas)} sub={`${kpi.gasN} registro${kpi.gasN !== 1 ? "s" : ""} · operativos`}     badge="Egresos"  badgeType={kpi.totalGas > 0 ? "down" : "neu"} />
            <KpiCard label="Utilidad"  value={fmt(kpi.util)}     sub={`Margen ${kpi.pct}%`}
              badge={kpi.totalIng === 0 && kpi.totalGas === 0 ? "Sin datos" : kpi.util >= 0 ? "▲ Positiva" : "▼ Negativa"}
              badgeType={kpi.totalIng === 0 && kpi.totalGas === 0 ? "neu" : kpi.util >= 0 ? "up" : "down"} />
            <KpiCard label="Rutas"     value={kpi.rutN}          sub="en el período"                                                        badge="Viajes"   badgeType="neu" />
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
          {mod === "ingresos"   && <ModIngresos   data={ingresos}   reload={reloadIngresos}   desde={desde} hasta={hasta} />}
          {mod === "gastos"     && <ModGastos     data={gastos}     reload={reloadGastos}     desde={desde} hasta={hasta} rutas={rutas || []} />}
          {mod === "operadores" && <ModOperadores data={operadores} reload={reloadOperadores} unidades={unidades || []} />}
          {mod === "rutas"      && <ModRutas      data={rutas}      reload={reloadRutas}      desde={desde} hasta={hasta} operadores={operadores || []} />}
          {mod === "unidades"   && <ModUnidades   data={unidades}   reload={reloadUnidades} />}
        </div>
      </section>
    </main>
  );
}
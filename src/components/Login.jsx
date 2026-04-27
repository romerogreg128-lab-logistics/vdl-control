"use client";
import { useState } from "react";

const USER = process.env.NEXT_PUBLIC_APP_USER || "admin";
const PASS = process.env.NEXT_PUBLIC_APP_PASSWORD || "vdl2024";

export default function Login({ onLogin }) {
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    setTimeout(() => {
      if (usuario === USER && contrasena === PASS) {
        onLogin();
      } else {
        setError("Usuario o contraseña incorrectos.");
      }
      setLoading(false);
    }, 400);
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0B1F17",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
    }}>
      <div style={{
        background: "#F5F7F4",
        borderRadius: 16,
        padding: "48px 40px",
        width: 360,
        boxShadow: "0 8px 40px rgba(0,0,0,0.35)",
      }}>
        {/* Logo / título */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <img
            src="/logo.png"
            alt="VDL Logo"
            style={{
              width: 64, height: 64, borderRadius: "50%",
              objectFit: "cover",
              margin: "0 auto 16px",
              display: "block",
              border: "2px solid rgba(46,125,50,0.4)",
              boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
            }}
          />
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#0B1F17" }}>VDL</h1>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: "#6B7B6E" }}>Inicia sesión para continuar</p>
        </div>

        <form onSubmit={handleSubmit}>
          <label style={{ display: "block", marginBottom: 4, fontSize: 13, fontWeight: 600, color: "#2E4030" }}>
            Usuario
          </label>
          <input
            type="text"
            value={usuario}
            onChange={e => setUsuario(e.target.value)}
            autoComplete="username"
            autoFocus
            required
            style={{
              width: "100%", padding: "10px 12px", marginBottom: 16,
              border: "1.5px solid #C8D6C9", borderRadius: 8,
              fontSize: 14, outline: "none", boxSizing: "border-box",
              background: "#fff", color: "#0B1F17",
              transition: "border-color 0.2s",
            }}
            onFocus={e => e.target.style.borderColor = "#2E7D32"}
            onBlur={e => e.target.style.borderColor = "#C8D6C9"}
          />

          <label style={{ display: "block", marginBottom: 4, fontSize: 13, fontWeight: 600, color: "#2E4030" }}>
            Contraseña
          </label>
          <input
            type="password"
            value={contrasena}
            onChange={e => setContrasena(e.target.value)}
            autoComplete="current-password"
            required
            style={{
              width: "100%", padding: "10px 12px", marginBottom: 8,
              border: "1.5px solid #C8D6C9", borderRadius: 8,
              fontSize: 14, outline: "none", boxSizing: "border-box",
              background: "#fff", color: "#0B1F17",
              transition: "border-color 0.2s",
            }}
            onFocus={e => e.target.style.borderColor = "#2E7D32"}
            onBlur={e => e.target.style.borderColor = "#C8D6C9"}
          />

          {error && (
            <p style={{ margin: "0 0 12px", fontSize: 13, color: "#C62828", fontWeight: 500 }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", padding: "11px 0", marginTop: 12,
              background: loading ? "#74B72E" : "#2E7D32",
              color: "#fff", border: "none", borderRadius: 8,
              fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.2s",
              letterSpacing: 0.3,
            }}
          >
            {loading ? "Verificando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}

"use client";
import { useState } from "react";
import VDLFin from "../components/VDLFin";
import Login from "../components/Login";

export default function Home() {
  const [autenticado, setAutenticado] = useState(false);

  if (!autenticado) {
    return <Login onLogin={() => setAutenticado(true)} />;
  }

  return <VDLFin onLogout={() => setAutenticado(false)} />;
}

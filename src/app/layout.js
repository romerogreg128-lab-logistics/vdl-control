import "./globals.css";

export const metadata = {
  title: "VDL-FIN",
  description: "Plataforma de control de gastos para transporte",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
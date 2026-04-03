import "./globals.css";

export const metadata = {
  title: "VDL Fin",
  description: "Sistema financiero VDL",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}

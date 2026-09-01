import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Horizonte Ciudadano | Decisiones financieras con información',
  description:
    'Recursos claros y herramientas prácticas para tomar mejores decisiones financieras.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}

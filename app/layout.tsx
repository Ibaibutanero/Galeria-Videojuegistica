import type { Metadata } from 'next';
import './globals.css';
import { LibraryProvider } from '@/lib/context/library-context';

export const metadata: Metadata = {
  title: 'GameShelf - Tu Biblioteca Personal de Videojuegos',
  description:
    'Organiza tu colección de videojuegos, haz seguimiento de tu progreso y horas jugadas, e integra el catálogo de GameBrain.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className="bg-shelf-950 text-shelf-100 min-h-screen selection:bg-brand-purple selection:text-white antialiased">
        <LibraryProvider>{children}</LibraryProvider>
      </body>
    </html>
  );
}

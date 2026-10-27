# 🎮 GameShelf

GameShelf es una aplicación web moderna y elegante diseñada para organizar tu biblioteca personal de videojuegos, registrar horas jugadas, notas personales y realizar un seguimiento de tu progreso (Jugando, Pendientes, Completados, En pausa y Abandonados).

Integra el catálogo oficial de **GameBrain API** con más de 800.000 videojuegos mediante rutas de servidor seguras en Next.js.

---

## 🚀 Tecnologías

- **Framework:** Next.js (App Router)
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS con paleta oscura gaming (`slate/obsidian` con acentos en violeta y cian)
- **Iconografía:** Lucide React
- **API Externa:** [GameBrain API](https://gamebrain.co/api) (Search, Detail, Metadatos)
- **Persistencia:** Capa de abstracción `ILibraryStorage` con implementación en `localStorage` (lista para migración transparente a Supabase)

---

## ⚙️ Configuración de la API de GameBrain

Para buscar juegos en el catálogo oficial de GameBrain:

1. **Consigue tu clave gratuita:**  
   Regístrate en [https://gamebrain.co/api](https://gamebrain.co/api) para obtener tu clave de desarrollador.

2. **Crea el archivo `.env.local`:**  
   En la raíz de este proyecto, copia el archivo de ejemplo o crea uno nuevo:
   ```bash
   cp .env.example .env.local
   ```

3. **Añade tu clave en `.env.local`:**
   ```env
   GAMEBRAIN_API_KEY=tu_clave_real_de_gamebrain
   ```

> 🔒 **Seguridad:** La variable `GAMEBRAIN_API_KEY` se consume **únicamente en el servidor de Next.js** (`lib/gamebrain/client.ts`) y **nunca** se envía ni se expone al cliente del navegador.

---

## 💻 Puesta en marcha

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

3. **Compilación de producción:**
   ```bash
   npm run build
   npm run start
   ```

4. **Verificación de tipos TypeScript:**
   ```bash
   npm run typecheck
   ```

---

## 📁 Arquitectura del Proyecto

```text
├── app/
│   ├── api/
│   │   ├── games/
│   │   │   ├── search/route.ts    # Búsqueda en GameBrain por query
│   │   │   └── [id]/route.ts       # Ficha detallada por ID de GameBrain
│   │   └── status/route.ts        # Comprobación de API key configurada
│   ├── games/[id]/page.tsx        # Página de ficha detallada accesible por URL
│   ├── layout.tsx                 # Layout principal con LibraryProvider
│   ├── page.tsx                   # Vista principal: Biblioteca y gestión
│   └── globals.css                # Estilos globales y utilidades Tailwind
├── components/
│   ├── games/
│   │   ├── GameCard.tsx           # Carátula 2:3, estados, horas y hover
│   │   ├── GameGrid.tsx           # Cuadrícula responsive y estados vacíos
│   │   ├── GameDetailModal.tsx    # Modal con sinopsis, capturas y ficha
│   │   └── EditGameModal.tsx      # Modal para editar notas y horas
│   ├── layout/
│   │   ├── Header.tsx             # Barra superior con buscador y estado
│   │   └── Sidebar.tsx            # Navegación por estados y plataformas
│   ├── search/
│   │   └── SearchModal.tsx        # Búsqueda con debounce en GameBrain
│   └── ui/
│       ├── ApiKeyBanner.tsx       # Guía interactiva si falta la clave
│       ├── GameImage.tsx          # Imagen con fallback gaming si no hay portada
│       └── StatusBadge.tsx        # Badges de estado con código de color
├── lib/
│   ├── context/
│   │   └── library-context.tsx    # Estado reactivo y operaciones de la biblioteca
│   ├── gamebrain/
│   │   └── client.ts              # Cliente servidor seguro para GameBrain API
│   ├── hooks/
│   │   └── useDebounce.ts         # Hook de debounce para el buscador
│   ├── storage/
│   │   └── library-storage.ts     # Interfaz ILibraryStorage y LocalStorage
│   └── utils/
│       └── formatters.ts          # Formateadores de horas, puntuaciones y fechas
├── types/
│   ├── gamebrain.ts               # Tipos oficiales de la API de GameBrain
│   └── library.ts                 # Tipos de la biblioteca del usuario
├── .env.example                   # Plantilla de variables de entorno
└── package.json
```

---

## 🔄 Futura migración a Supabase

La persistencia está desacoplada de la interfaz mediante la interfaz `ILibraryStorage` definida en `lib/storage/library-storage.ts`:

```typescript
export interface ILibraryStorage {
  getAll(): Promise<UserGame[]>;
  getById(id: string): Promise<UserGame | null>;
  getByGameId(gameId: number): Promise<UserGame | null>;
  add(input: NewUserGameInput): Promise<UserGame>;
  update(id: string, updates: UpdateUserGameInput): Promise<UserGame>;
  remove(id: string): Promise<boolean>;
}
```

Para conectar Supabase más adelante, bastará con crear una clase `SupabaseLibraryStorage` que implemente estos métodos e intercambiar la instancia exportada, sin tener que modificar los componentes de la interfaz ni la lógica de la biblioteca.

# Feria Americana

App mobile-first para gestionar inventario y ventas de una feria americana grupal. Cada persona carga sus propios productos; cualquier vendedor puede registrar ventas durante el evento.

## Stack

- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **Backend/DB**: Supabase (Postgres + Auth + Storage)
- **Deploy**: Vercel

---

## Setup local

### 1. Clonar e instalar

```bash
git clone <repo-url>
cd feria-americana
npm install
```

### 2. Variables de entorno

Copiá el archivo de ejemplo y completá los valores:

```bash
cp .env.example .env.local
```

Editá `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
VENDOR_CODE=el-codigo-secreto-que-elijas
```

Encontrás las keys de Supabase en: **supabase.com → tu proyecto → Settings → API**

### 3. Ejecutar migraciones de Supabase

En el panel de tu proyecto de Supabase, andá a **SQL Editor** y pegá el contenido completo de:

```
supabase/migrations/001_initial.sql
```

Ejecutalo. Esto crea las tablas `users`, `products`, `sales`, las políticas de seguridad (RLS) y el bucket de storage para fotos.

### 4. Correr en desarrollo

```bash
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

---

## Seed de datos de prueba (opcional)

1. Creá 3 usuarios en tu app local (login con magic link)
2. Anotá sus UUIDs desde **Supabase → Authentication → Users**
3. Reemplazá los UUIDs en `supabase/seed.sql`
4. Ejecutá el seed en el SQL Editor

---

## Flujo de roles

| Rol | Qué puede hacer |
|-----|-----------------|
| **Comprador** (default) | Ver el inventario completo |
| **Vendedor** | Todo lo anterior + agregar productos, registrar ventas, ver dashboard |

Para activar el modo vendedor: **Perfil → "Tengo el código" → ingresar `VENDOR_CODE`**

El `VENDOR_CODE` es tu variable de entorno. Compartilo solo con las personas que van a vender.

---

## Deploy en Vercel

### 1. Push a GitHub

```bash
git remote add origin https://github.com/tu-usuario/feria-americana.git
git push -u origin main
```

### 2. Importar en Vercel

1. Ir a [vercel.com](https://vercel.com) → **New Project**
2. Importar el repositorio
3. En **Environment Variables** agregar las 3 variables del `.env.example`
4. Deploy

### 3. Configurar redirect URL en Supabase

En **Supabase → Authentication → URL Configuration** agregar:

```
https://tu-app.vercel.app/auth/callback
```

---

## Estructura del proyecto

```
feria-americana/
├── app/
│   ├── (auth)/login/          # Pantalla de login con magic link
│   ├── (app)/                 # Rutas protegidas
│   │   ├── inventario/        # Grid de productos + filtros
│   │   ├── vender/            # Vista optimizada para vender en el evento
│   │   ├── dashboard/         # Estadísticas + export CSV
│   │   └── perfil/            # Perfil + activación modo vendedor
│   ├── actions/               # Server Actions (ventas, productos, usuarios)
│   ├── auth/callback/         # Handler de magic link
│   └── onboarding/            # Primer login: elegir nombre y color
├── components/
│   ├── ui/                    # Modal, Badge, Spinner
│   ├── BottomNav.tsx
│   ├── ProductCard.tsx
│   ├── VenderCard.tsx
│   ├── AddProductModal.tsx    # Formulario con subida de foto
│   ├── SaleModal.tsx          # Modal de registro de venta
│   ├── FilterBar.tsx
│   ├── UserChip.tsx
│   ├── UndoToast.tsx          # Toast con countdown de 8 segundos
│   └── ToastProvider.tsx
├── lib/
│   ├── supabase/              # Clientes browser y server
│   ├── types.ts
│   ├── utils.ts               # formatPrice (ARS), CSV helpers
│   └── constants.ts           # Colores, categorías, etc.
├── middleware.ts               # Auth guard + refresh de sesión
└── supabase/
    ├── migrations/001_initial.sql
    └── seed.sql
```

---

## Funcionalidades

- **Magic link auth** — sin contraseñas
- **Inventario** — grid con filtros por dueño, categoría, estado y rango de precio. FAB para agregar productos (vendedores).
- **Vender** — lista optimizada para el evento: solo disponibles, botón grande por ítem, modal rápido de venta con precio editable y método de pago.
- **Undo** — 8 segundos para deshacer una venta con countdown visible.
- **Dashboard** — total recaudado, desglose por persona con barra de progreso, top ventas, export a CSV (ventas + inventario).
- **Foto opcional** — subida directo desde cámara o galería, máx 5MB, preview inmediato.
- **Colores por dueño** — barra y punto de color en cada card para identificar productos rápido.

---

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL de tu proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key pública de Supabase |
| `VENDOR_CODE` | Código secreto para activar modo vendedor (server-only) |

-- ============================================================
-- Feria Americana — Schema inicial
-- Ejecutar en Supabase > SQL Editor
-- ============================================================

-- Tabla de perfiles de usuario (extiende auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id      UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre  TEXT NOT NULL,
  email   TEXT NOT NULL,
  color   TEXT NOT NULL DEFAULT '#9590C8',
  role    TEXT NOT NULL DEFAULT 'comprador'
            CHECK (role IN ('comprador', 'vendedor')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla de productos
CREATE TABLE IF NOT EXISTS public.products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id        UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  titulo          TEXT NOT NULL,
  descripcion     TEXT,
  categoria       TEXT NOT NULL
                    CHECK (categoria IN ('ropa', 'accesorios', 'calzado', 'hogar', 'otros')),
  talle           TEXT,
  precio_sugerido NUMERIC(10, 2) NOT NULL CHECK (precio_sugerido >= 0),
  precio_minimo   NUMERIC(10, 2)          CHECK (precio_minimo >= 0),
  foto_url        TEXT,
  estado          TEXT NOT NULL DEFAULT 'disponible'
                    CHECK (estado IN ('disponible', 'reservado', 'vendido')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla de ventas
CREATE TABLE IF NOT EXISTS public.sales (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id   UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  precio_final NUMERIC(10, 2) NOT NULL CHECK (precio_final >= 0),
  metodo_pago  TEXT NOT NULL
                 CHECK (metodo_pago IN ('efectivo', 'transferencia')),
  vendido_por  UUID NOT NULL REFERENCES public.users(id),
  notas        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para queries frecuentes
CREATE INDEX IF NOT EXISTS idx_products_owner    ON public.products(owner_id);
CREATE INDEX IF NOT EXISTS idx_products_estado   ON public.products(estado);
CREATE INDEX IF NOT EXISTS idx_products_categoria ON public.products(categoria);
CREATE INDEX IF NOT EXISTS idx_sales_product     ON public.sales(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_vendido_por ON public.sales(vendido_por);
CREATE INDEX IF NOT EXISTS idx_sales_created_at  ON public.sales(created_at DESC);

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE public.users    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales    ENABLE ROW LEVEL SECURITY;

-- USERS
CREATE POLICY "Usuarios autenticados pueden leer perfiles"
  ON public.users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios pueden crear su propio perfil"
  ON public.users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Usuarios pueden actualizar su propio perfil"
  ON public.users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- PRODUCTS
CREATE POLICY "Usuarios autenticados pueden leer productos"
  ON public.products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Vendedores pueden agregar productos"
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'vendedor'
    )
  );

CREATE POLICY "Vendedores pueden actualizar productos"
  ON public.products FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'vendedor'
    )
  );

CREATE POLICY "Dueños pueden eliminar sus propios productos"
  ON public.products FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- SALES
CREATE POLICY "Usuarios autenticados pueden leer ventas"
  ON public.sales FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Vendedores pueden registrar ventas"
  ON public.sales FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'vendedor'
    )
  );

CREATE POLICY "Vendedores pueden eliminar ventas (undo)"
  ON public.sales FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'vendedor'
    )
  );

-- ============================================================
-- Storage: bucket para fotos de productos
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-photos',
  'product-photos',
  true,
  5242880,  -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Vendedores pueden subir fotos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'product-photos' AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'vendedor'
    )
  );

CREATE POLICY "Cualquiera puede ver fotos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-photos');

CREATE POLICY "Dueños pueden eliminar sus fotos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'product-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

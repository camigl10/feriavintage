-- ============================================================
-- Seed de datos de prueba — Feria Americana
-- ⚠️  Solo para desarrollo/testing. No ejecutar en producción.
--
-- Instrucciones:
-- 1. Crear 3 usuarios via magic link en tu app (registrarse)
-- 2. Reemplazar los UUIDs de abajo con los IDs reales de auth.users
-- 3. Ejecutar este script en Supabase > SQL Editor
-- ============================================================

-- NOTA: Reemplazá estos UUIDs con los IDs reales de tus usuarios
-- Podés verlos en Authentication > Users en tu panel de Supabase

DO $$
DECLARE
  user1_id UUID := '00000000-0000-0000-0000-000000000001'; -- Camila
  user2_id UUID := '00000000-0000-0000-0000-000000000002'; -- Mara
  user3_id UUID := '00000000-0000-0000-0000-000000000003'; -- Julia
  p1_id UUID := gen_random_uuid();
  p2_id UUID := gen_random_uuid();
  p3_id UUID := gen_random_uuid();
  p4_id UUID := gen_random_uuid();
  p5_id UUID := gen_random_uuid();
  p6_id UUID := gen_random_uuid();
  p7_id UUID := gen_random_uuid();
BEGIN

-- Perfiles (si ya existen por el onboarding, actualizar)
INSERT INTO public.users (id, nombre, email, color, role) VALUES
  (user1_id, 'Camila',   'camila@example.com',   '#E07060', 'vendedor'),
  (user2_id, 'Mara',     'mara@example.com',     '#6B9E7A', 'vendedor'),
  (user3_id, 'Julia',    'julia@example.com',    '#D4A853', 'comprador')
ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  color  = EXCLUDED.color,
  role   = EXCLUDED.role;

-- Productos de Camila
INSERT INTO public.products (id, owner_id, titulo, descripcion, categoria, talle, precio_sugerido, precio_minimo, estado)
VALUES
  (p1_id, user1_id, 'Vestido floral verano', 'Muy buena calidad, usado 2 veces', 'ropa', 'M', 3500, 2500, 'disponible'),
  (p2_id, user1_id, 'Campera de jean', 'Levi''s original, talle S', 'ropa', 'S', 8000, 6000, 'disponible'),
  (p3_id, user1_id, 'Cartera de cuero marrón', 'Cuero genuino, estado impecable', 'accesorios', NULL, 5000, 3500, 'disponible');

-- Productos de Mara
INSERT INTO public.products (id, owner_id, titulo, descripcion, categoria, talle, precio_sugerido, precio_minimo, estado)
VALUES
  (p4_id, user2_id, 'Zapatillas Nike Air Max', 'Talle 38, poco uso', 'calzado', '38', 12000, 9000, 'disponible'),
  (p5_id, user2_id, 'Pantalón negro recto', 'Tiro alto, ideal para trabajo', 'ropa', 'M', 4000, 3000, 'disponible'),
  (p6_id, user2_id, 'Collar de perlas', 'Bijouterie, largo ajustable', 'accesorios', NULL, 1500, 1000, 'vendido'),
  (p7_id, user2_id, 'Bufanda de lana gris', 'Importada, muy abrigada', 'accesorios', NULL, 2500, 2000, 'disponible');

-- Una venta de ejemplo (collar de Mara)
INSERT INTO public.sales (product_id, precio_final, metodo_pago, vendido_por, notas)
VALUES
  (p6_id, 1200, 'efectivo', user1_id, 'La clienta regatió un poco');

END $$;

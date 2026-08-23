-- ENUMS
CREATE TYPE public.account_type AS ENUM ('creador', 'seguidor');
CREATE TYPE public.category AS ENUM ('belleza', 'moda', 'tech');
CREATE TYPE public.collection_type AS ENUM ('semanal', 'categoria', 'personalizada');
CREATE TYPE public.ad_type AS ENUM ('banner', 'modal', 'card');

-- PROFILES
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE,
  account_type public.account_type NOT NULL DEFAULT 'seguidor',
  full_name text NOT NULL DEFAULT '',
  username text NOT NULL UNIQUE,
  avatar_url text,
  bio text,
  categories public.category[] NOT NULL DEFAULT '{}',
  socials jsonb NOT NULL DEFAULT '{}'::jsonb,
  featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_public_read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- COLLECTIONS
CREATE TABLE public.collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  type public.collection_type NOT NULL DEFAULT 'personalizada',
  cover_url text,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.collections TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.collections TO authenticated;
GRANT ALL ON public.collections TO service_role;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "collections_public_read" ON public.collections FOR SELECT USING (true);
CREATE POLICY "collections_write_own" ON public.collections FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = creator_id AND p.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = creator_id AND p.user_id = auth.uid()));

-- RECOMMENDATIONS
CREATE TABLE public.recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  image_url text NOT NULL,
  review text NOT NULL DEFAULT '',
  external_url text NOT NULL,
  category public.category NOT NULL,
  tags text[] NOT NULL DEFAULT '{}',
  brand text,
  featured boolean NOT NULL DEFAULT false,
  week_start date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.recommendations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recommendations TO authenticated;
GRANT ALL ON public.recommendations TO service_role;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "recommendations_public_read" ON public.recommendations FOR SELECT USING (true);
CREATE POLICY "recommendations_write_own" ON public.recommendations FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = creator_id AND p.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = creator_id AND p.user_id = auth.uid()));

-- RECOMMENDATION_COLLECTIONS
CREATE TABLE public.recommendation_collections (
  recommendation_id uuid NOT NULL REFERENCES public.recommendations(id) ON DELETE CASCADE,
  collection_id uuid NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  PRIMARY KEY (recommendation_id, collection_id)
);
GRANT SELECT ON public.recommendation_collections TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recommendation_collections TO authenticated;
GRANT ALL ON public.recommendation_collections TO service_role;
ALTER TABLE public.recommendation_collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rec_collections_public_read" ON public.recommendation_collections FOR SELECT USING (true);
CREATE POLICY "rec_collections_write_own" ON public.recommendation_collections FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.recommendations r JOIN public.profiles p ON p.id = r.creator_id WHERE r.id = recommendation_id AND p.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.recommendations r JOIN public.profiles p ON p.id = r.creator_id WHERE r.id = recommendation_id AND p.user_id = auth.uid()));

-- FOLLOWS
CREATE TABLE public.follows (
  follower_id uuid NOT NULL,
  creator_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, creator_id)
);
GRANT SELECT ON public.follows TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.follows TO authenticated;
GRANT ALL ON public.follows TO service_role;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "follows_public_read" ON public.follows FOR SELECT USING (true);
CREATE POLICY "follows_insert_own" ON public.follows FOR INSERT TO authenticated WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "follows_delete_own" ON public.follows FOR DELETE TO authenticated USING (auth.uid() = follower_id);

-- FAVORITES
CREATE TABLE public.favorites (
  follower_id uuid NOT NULL,
  recommendation_id uuid NOT NULL REFERENCES public.recommendations(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, recommendation_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.favorites TO authenticated;
GRANT ALL ON public.favorites TO service_role;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "favorites_select_own" ON public.favorites FOR SELECT TO authenticated USING (auth.uid() = follower_id);
CREATE POLICY "favorites_insert_own" ON public.favorites FOR INSERT TO authenticated WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "favorites_delete_own" ON public.favorites FOR DELETE TO authenticated USING (auth.uid() = follower_id);

-- SPONSORED CONTENT
CREATE TABLE public.sponsored_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand text NOT NULL,
  headline text,
  image_url text NOT NULL,
  link_url text NOT NULL,
  type public.ad_type NOT NULL,
  placement text NOT NULL DEFAULT 'home',
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.sponsored_content TO anon;
GRANT SELECT ON public.sponsored_content TO authenticated;
GRANT ALL ON public.sponsored_content TO service_role;
ALTER TABLE public.sponsored_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sponsored_public_read_active" ON public.sponsored_content FOR SELECT
  USING (active = true AND starts_at <= now() AND (ends_at IS NULL OR ends_at >= now()));

-- CLICKS (fase 2)
CREATE TABLE public.clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recommendation_id uuid REFERENCES public.recommendations(id) ON DELETE CASCADE,
  sponsored_id uuid REFERENCES public.sponsored_content(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.clicks TO anon;
GRANT INSERT ON public.clicks TO authenticated;
GRANT ALL ON public.clicks TO service_role;
ALTER TABLE public.clicks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clicks_insert_anyone" ON public.clicks FOR INSERT WITH CHECK (true);

CREATE INDEX idx_recs_creator ON public.recommendations(creator_id);
CREATE INDEX idx_recs_category ON public.recommendations(category);
CREATE INDEX idx_recs_created ON public.recommendations(created_at DESC);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_recs_updated BEFORE UPDATE ON public.recommendations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- SEED
INSERT INTO public.profiles (id, account_type, full_name, username, avatar_url, bio, categories, socials, featured) VALUES
('11111111-1111-1111-1111-111111111101','creador','Valentina Ríos','valeriosbeauty','https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80','Skincare sin filtros y maquillaje que sí rinde. Bogotá 🇨🇴',ARRAY['belleza']::public.category[],'{"instagram":"https://instagram.com/valerios","tiktok":"https://tiktok.com/@valerios"}',true),
('11111111-1111-1111-1111-111111111102','creador','Mariana Lozano','marilooks','https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&q=80','Looks de oficina, thrift finds y básicos que duran. CDMX 🇲🇽',ARRAY['moda','belleza']::public.category[],'{"instagram":"https://instagram.com/marilooks"}',true),
('11111111-1111-1111-1111-111111111103','creador','Andrés Pinto','pintotech','https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80','Gadgets probados de verdad antes de recomendarlos. Lima 🇵🇪',ARRAY['tech']::public.category[],'{"tiktok":"https://tiktok.com/@pintotech","youtube":"https://youtube.com/@pintotech"}',true),
('11111111-1111-1111-1111-111111111104','creador','Sofía Márquez','sofimarquez','https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80','Belleza limpia, precios reales. Buenos Aires 🇦🇷',ARRAY['belleza','moda']::public.category[],'{"instagram":"https://instagram.com/sofimarquez"}',true),
('11111111-1111-1111-1111-111111111105','creador','Camila Duarte','camiestilo','https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80','Streetwear latino y sneakers. Santiago 🇨🇱',ARRAY['moda']::public.category[],'{"instagram":"https://instagram.com/camiestilo"}',false),
('11111111-1111-1111-1111-111111111106','creador','Diego Salas','diegosetup','https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80','Setups, audio y productividad sin humo. Medellín 🇨🇴',ARRAY['tech']::public.category[],'{"youtube":"https://youtube.com/@diegosetup"}',false);

INSERT INTO public.collections (id, creator_id, name, type, position) VALUES
('22222222-2222-2222-2222-222222222201','11111111-1111-1111-1111-111111111101','Skincare de noche','personalizada',1),
('22222222-2222-2222-2222-222222222202','11111111-1111-1111-1111-111111111101','Semana del 18 de agosto','semanal',2),
('22222222-2222-2222-2222-222222222203','11111111-1111-1111-1111-111111111102','Looks de oficina','personalizada',1),
('22222222-2222-2222-2222-222222222204','11111111-1111-1111-1111-111111111103','Mi setup 2026','personalizada',1);

INSERT INTO public.recommendations (id, creator_id, title, image_url, review, external_url, category, tags, brand, featured, week_start, created_at) VALUES
('33333333-3333-3333-3333-333333333301','11111111-1111-1111-1111-111111111101','Sérum de niacinamida 10%','https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80','Me bajó el enrojecimiento en dos semanas. Textura ligera, no pica y rinde muchísimo.','https://example.com/serum','belleza',ARRAY['skincare','noche'],'The Ordinary',true,'2026-08-18','2026-08-19 10:00+00'),
('33333333-3333-3333-3333-333333333302','11111111-1111-1111-1111-111111111101','Protector solar con color FPS 50','https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80','El único que no me deja cara blanca ni brillo raro. Lo uso todos los días.','https://example.com/spf','belleza',ARRAY['spf','diario'],'Isdin',false,'2026-08-18','2026-08-20 10:00+00'),
('33333333-3333-3333-3333-333333333303','11111111-1111-1111-1111-111111111101','Bálsamo limpiador','https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&q=80','Derrite el maquillaje sin frotar. Ideal para arrancar la rutina de noche.','https://example.com/balsamo','belleza',ARRAY['limpieza','noche'],'Banila Co',false,NULL,'2026-08-12 10:00+00'),
('33333333-3333-3333-3333-333333333304','11111111-1111-1111-1111-111111111102','Blazer oversize beige','https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80','Sirve con jeans y con vestido. La tela no se arruga en el transporte.','https://example.com/blazer','moda',ARRAY['oficina','básicos'],'Zara',true,'2026-08-18','2026-08-19 12:00+00'),
('33333333-3333-3333-3333-333333333305','11111111-1111-1111-1111-111111111102','Mocasines de cuero','https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80','Caminé 12 mil pasos sin ampollas. Se ven mucho más caros de lo que costaron.','https://example.com/mocasines','moda',ARRAY['calzado','oficina'],'Vélez',false,NULL,'2026-08-16 12:00+00'),
('33333333-3333-3333-3333-333333333306','11111111-1111-1111-1111-111111111102','Bolso estructurado negro','https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80','Cabe laptop de 14". Lo llevo a la oficina y a cenar sin cambiar de bolso.','https://example.com/bolso','moda',ARRAY['accesorios'],'Mango',false,NULL,'2026-08-10 12:00+00'),
('33333333-3333-3333-3333-333333333307','11111111-1111-1111-1111-111111111103','Audífonos con cancelación de ruido','https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80','La cancelación es real en bus y avión. Batería me dura toda la semana.','https://example.com/audifonos','tech',ARRAY['audio','viaje'],'Sony',true,'2026-08-18','2026-08-21 09:00+00'),
('33333333-3333-3333-3333-333333333308','11111111-1111-1111-1111-111111111103','Teclado mecánico 65%','https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80','Silencioso para oficina y ocupa poquísimo espacio. Switches suaves.','https://example.com/teclado','tech',ARRAY['setup','oficina'],'Keychron',false,NULL,'2026-08-14 09:00+00'),
('33333333-3333-3333-3333-333333333309','11111111-1111-1111-1111-111111111103','Cargador GaN 65W','https://images.unsplash.com/photo-1601972602288-3be527b4f18a?w=800&q=80','Un solo cargador para laptop y celu. Cabe en el bolsillo, cero calor raro.','https://example.com/cargador','tech',ARRAY['viaje','accesorios'],'Anker',false,NULL,'2026-08-08 09:00+00'),
('33333333-3333-3333-3333-333333333310','11111111-1111-1111-1111-111111111104','Labial mate hidratante','https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&q=80','Mate pero no reseca. Aguanta café y almuerzo sin retoque.','https://example.com/labial','belleza',ARRAY['maquillaje'],'Natura',true,NULL,'2026-08-18 15:00+00'),
('33333333-3333-3333-3333-333333333311','11111111-1111-1111-1111-111111111104','Base fluida cobertura media','https://images.unsplash.com/photo-1631730359585-38a4935cbec4?w=800&q=80','Se siente piel, no máscara. El tono se adapta bien a piel trigueña.','https://example.com/base','belleza',ARRAY['maquillaje','base'],'Vera',false,NULL,'2026-08-11 15:00+00'),
('33333333-3333-3333-3333-333333333312','11111111-1111-1111-1111-111111111105','Sneakers blancos de lona','https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80','Combinan con todo y se limpian fácil. Van dos años conmigo.','https://example.com/sneakers','moda',ARRAY['calzado','streetwear'],'Converse',false,NULL,'2026-08-17 18:00+00'),
('33333333-3333-3333-3333-333333333313','11111111-1111-1111-1111-111111111105','Jean wide leg','https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80','El corte alarga muchísimo. Tela gruesa que no se deforma al lavarlo.','https://example.com/jean','moda',ARRAY['denim'],'Levi''s',true,NULL,'2026-08-13 18:00+00'),
('33333333-3333-3333-3333-333333333314','11111111-1111-1111-1111-111111111106','Monitor 27" QHD','https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80','Salto brutal desde full HD. El texto se ve nítido todo el día sin cansar.','https://example.com/monitor','tech',ARRAY['setup'],'LG',false,NULL,'2026-08-15 20:00+00'),
('33333333-3333-3333-3333-333333333315','11111111-1111-1111-1111-111111111106','Micrófono USB para reuniones','https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&q=80','Plug and play, se me oye mucho mejor en calls. No necesita interfaz.','https://example.com/micro','tech',ARRAY['audio','setup'],'FIFINE',true,NULL,'2026-08-09 20:00+00');

INSERT INTO public.recommendation_collections (recommendation_id, collection_id) VALUES
('33333333-3333-3333-3333-333333333301','22222222-2222-2222-2222-222222222201'),
('33333333-3333-3333-3333-333333333303','22222222-2222-2222-2222-222222222201'),
('33333333-3333-3333-3333-333333333301','22222222-2222-2222-2222-222222222202'),
('33333333-3333-3333-3333-333333333302','22222222-2222-2222-2222-222222222202'),
('33333333-3333-3333-3333-333333333304','22222222-2222-2222-2222-222222222203'),
('33333333-3333-3333-3333-333333333305','22222222-2222-2222-2222-222222222203'),
('33333333-3333-3333-3333-333333333306','22222222-2222-2222-2222-222222222203'),
('33333333-3333-3333-3333-333333333307','22222222-2222-2222-2222-222222222204'),
('33333333-3333-3333-3333-333333333308','22222222-2222-2222-2222-222222222204'),
('33333333-3333-3333-3333-333333333314','22222222-2222-2222-2222-222222222204');

INSERT INTO public.sponsored_content (brand, headline, image_url, link_url, type, placement, active) VALUES
('Fresha Cosmética','Rutina completa desde $49.900','https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=1200&q=80','https://example.com/fresha','banner','global',true),
('Nube Store','Envío gratis en toda LATAM esta semana','https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1000&q=80','https://example.com/nube','modal','global',true),
('TecnoYa','Audífonos y wearables con 30% off','https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=800&q=80','https://example.com/tecnoya','card','feed',true),
('Casa Botánica','Skincare hecho en Colombia','https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80','https://example.com/botanica','card','feed',true);
export const APP_NAME = "Reko";

/** Cada cuántas recomendaciones vistas se puede mostrar el modal publicitario. */
export const ADS_MODAL_EVERY_N_VIEWS = 12;
/** Minutos mínimos entre dos modales publicitarios. */
export const ADS_MODAL_COOLDOWN_MINUTES = 10;
/** Cada cuántas tarjetas del grid se intercala una tarjeta patrocinada. */
export const ADS_CARD_EVERY_N_ITEMS = 7;

export type Categoria = "belleza" | "moda" | "tech";

export const CATEGORIAS: { slug: Categoria; label: string; emoji: string; descripcion: string }[] = [
  { slug: "belleza", label: "Belleza", emoji: "✨", descripcion: "Skincare, maquillaje y cuidado personal probado de verdad." },
  { slug: "moda", label: "Moda", emoji: "👗", descripcion: "Looks, básicos y hallazgos que sí valen la plata." },
  { slug: "tech", label: "Tech", emoji: "🎧", descripcion: "Gadgets, setups y accesorios reseñados sin humo." },
];

export function categoriaLabel(slug: string) {
  return CATEGORIAS.find((c) => c.slug === slug)?.label ?? slug;
}

export function semanaLabel(weekStart: string | null) {
  if (!weekStart) return null;
  const d = new Date(`${weekStart}T12:00:00`);
  return `Semana del ${d.toLocaleDateString("es-CO", { day: "numeric", month: "long" })}`;
}

export function fechaCorta(iso: string) {
  return new Date(iso).toLocaleDateString("es-CO", { day: "numeric", month: "short" });
}

export type Profile = {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  categories: string[];
  socials: Record<string, string> | unknown;
  featured?: boolean;
  account_type?: string;
};

export type Recommendation = {
  id: string;
  title: string;
  image_url: string;
  review: string;
  external_url: string;
  category: string;
  tags: string[];
  brand: string | null;
  featured: boolean;
  week_start: string | null;
  created_at: string;
  creator_id: string;
  profiles?: Profile;
};

export type Sponsored = {
  id: string;
  brand: string;
  headline: string | null;
  image_url: string;
  link_url: string;
  type: "banner" | "modal" | "card";
  placement: string;
};

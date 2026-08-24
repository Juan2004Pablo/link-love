import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { getDiscover } from "@/lib/reko.functions";
import { CATEGORIAS, type Profile, type Recommendation } from "@/lib/reko";
import { RecGrid } from "@/components/reko/RecGrid";
import { CreatorCard } from "@/components/reko/CreatorCard";
import { useAds } from "@/components/reko/AdsProvider";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Reko — Todas las recomendaciones de tus creadores favoritos" },
      {
        name: "description",
        content:
          "Reko reúne en un solo lugar las recomendaciones de belleza, moda y tech de creadores de LATAM. Sin perseguir historias.",
      },
      { property: "og:title", content: "Reko — Recomendaciones que no desaparecen en 24 horas" },
      {
        property: "og:description",
        content: "Descubre productos recomendados por creadores de belleza, moda y tech en LATAM.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: () => getDiscover(),
  component: Discover,
});

function Discover() {
  const data = Route.useLoaderData();
  const { registerViews } = useAds();
  const recommendations = data.recommendations as unknown as Recommendation[];
  const creators = data.creators as unknown as Profile[];

  useEffect(() => {
    registerViews(recommendations.length);
  }, [registerViews, recommendations.length]);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-28 pt-6">
      <section className="rounded-3xl bg-surface p-6 sm:p-10">
        <h1 className="max-w-2xl font-display text-3xl font-bold leading-tight sm:text-5xl">
          Todo lo que tus creadores <span className="text-brand-gradient">recomiendan</span>, en un solo lugar.
        </h1>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
          Las historias se van en 24 horas. Acá quedan para siempre, organizadas por semana, categoría y colección.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {CATEGORIAS.map((c) => (
            <Link
              key={c.slug}
              to="/categoria/$slug"
              params={{ slug: c.slug }}
              className="rounded-full bg-card px-4 py-2 text-sm font-medium shadow-soft transition-transform hover:-translate-y-0.5"
            >
              {c.emoji} {c.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Creadores destacados</h2>
        <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
          {creators.map((c) => (
            <CreatorCard key={c.id} creator={c} />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Recomendaciones recientes</h2>
        <div className="mt-4">
          <RecGrid recommendations={recommendations} />
        </div>
      </section>
    </div>
  );
}

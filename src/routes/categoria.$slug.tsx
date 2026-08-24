import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect } from "react";
import { getByCategory } from "@/lib/reko.functions";
import { CATEGORIAS, type Categoria, type Profile, type Recommendation } from "@/lib/reko";
import { RecGrid } from "@/components/reko/RecGrid";
import { CreatorCard } from "@/components/reko/CreatorCard";
import { useAds } from "@/components/reko/AdsProvider";

export const Route = createFileRoute("/categoria/$slug")({
  loader: async ({ params }) => {
    const cat = CATEGORIAS.find((c) => c.slug === params.slug);
    if (!cat) throw notFound();
    const data = await getByCategory({ data: { category: cat.slug as Categoria } });
    return { ...data, cat };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Categoría no encontrada — Reko" }, { name: "robots", content: "noindex" }] };
    }
    const title = `${loaderData.cat.label} en Reko — recomendaciones de creadores LATAM`;
    return {
      meta: [
        { title },
        { name: "description", content: loaderData.cat.descripcion },
        { property: "og:title", content: title },
        { property: "og:description", content: loaderData.cat.descripcion },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { cat, ...data } = Route.useLoaderData();
  const { registerViews } = useAds();
  const recommendations = data.recommendations as unknown as Recommendation[];
  const creators = data.creators as unknown as Profile[];

  useEffect(() => {
    registerViews(recommendations.length);
  }, [registerViews, recommendations.length]);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-28 pt-6">
      <header className="rounded-3xl bg-surface p-6">
        <h1 className="font-display text-3xl font-bold">
          {cat.label}
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">{cat.descripcion}</p>
      </header>

      {creators.length > 0 ? (
        <section className="mt-8">
          <h2 className="text-lg font-semibold">Creadores de {cat.label.toLowerCase()}</h2>
          <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
            {creators.map((c) => (
              <CreatorCard key={c.id} creator={c} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-8">
        <RecGrid recommendations={recommendations} />
      </section>
    </div>
  );
}

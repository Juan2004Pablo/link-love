import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { getRecommendation } from "@/lib/reko.functions";
import { categoriaLabel, fechaCorta, semanaLabel, type Recommendation } from "@/lib/reko";
import { RecGrid } from "@/components/reko/RecGrid";

export const Route = createFileRoute("/r/$id")({
  loader: async ({ params }) => {
    const data = await getRecommendation({ data: { id: params.id } });
    if (!data.recommendation) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    if (!loaderData?.recommendation) {
      return { meta: [{ title: "Recomendación no disponible — Reko" }, { name: "robots", content: "noindex" }] };
    }
    const rec = loaderData.recommendation as unknown as Recommendation;
    const title = `${rec.title} — recomendado por @${rec.profiles?.username} en Reko`;
    return {
      meta: [
        { title },
        { name: "description", content: rec.review },
        { property: "og:title", content: title },
        { property: "og:description", content: rec.review },
        { property: "og:type", content: "article" },
        { property: "og:image", content: rec.image_url },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: rec.image_url },
      ],
    };
  },
  component: RecDetail,
});

function RecDetail() {
  const data = Route.useLoaderData();
  const rec = data.recommendation as unknown as Recommendation;
  const creator = rec.profiles!;
  const semana = semanaLabel(rec.week_start);

  return (
    <div className="mx-auto max-w-4xl px-4 pb-28 pt-6">
      <div className="overflow-hidden rounded-3xl bg-card shadow-soft">
        <img src={rec.image_url} alt={rec.title} className="max-h-[60vh] w-full object-cover" />
        <div className="space-y-4 p-5 sm:p-7">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="rounded-full bg-surface px-2 py-0.5">{categoriaLabel(rec.category)}</span>
            {rec.brand ? <span className="rounded-full bg-surface px-2 py-0.5">{rec.brand}</span> : null}
            {semana ? <span className="rounded-full bg-surface px-2 py-0.5">{semana}</span> : null}
            <span>{fechaCorta(rec.created_at)}</span>
          </div>

          <h1 className="font-display text-2xl font-bold sm:text-3xl">{rec.title}</h1>
          <p className="text-base leading-relaxed text-foreground/90">{rec.review}</p>

          <Link
            to="/$username"
            params={{ username: `@${creator.username}` }}
            className="flex items-center gap-3 rounded-2xl bg-surface p-3"
          >
            <img src={creator.avatar_url ?? ""} alt={creator.full_name} className="size-11 rounded-full object-cover" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{creator.full_name}</p>
              <p className="truncate text-xs text-muted-foreground">@{creator.username}</p>
            </div>
          </Link>

          <a
            href={rec.external_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-gradient px-6 py-3.5 text-base font-semibold text-primary-foreground shadow-lift"
          >
            Ver producto <ExternalLink className="size-4" />
          </a>
          <p className="text-center text-xs text-muted-foreground">
            El link abre la tienda externa en una pestaña nueva.
          </p>
        </div>
      </div>

      {data.more.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-lg font-semibold">Más de @{creator.username}</h2>
          <div className="mt-4">
            <RecGrid recommendations={data.more as unknown as Recommendation[]} showCreator={false} withAds={false} />
          </div>
        </section>
      ) : null}
    </div>
  );
}

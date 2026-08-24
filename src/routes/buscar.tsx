import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { searchCreators } from "@/lib/reko.functions";
import type { Profile } from "@/lib/reko";
import { CreatorCard } from "@/components/reko/CreatorCard";

export const Route = createFileRoute("/buscar")({
  validateSearch: (search: Record<string, unknown>) => ({ q: (search["q"] as string) || "" }),
  loaderDeps: ({ search }) => ({ q: search.q }),
  loader: ({ deps }) => searchCreators({ data: { q: deps.q } }),
  head: () => ({
    meta: [
      { title: "Buscar creadores — Reko" },
      { name: "description", content: "Encuentra creadores de belleza, moda y tech y mira todo lo que recomiendan." },
      { property: "og:title", content: "Buscar creadores — Reko" },
      { property: "og:description", content: "Encuentra creadores de belleza, moda y tech en Reko." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { creators } = Route.useLoaderData();
  const { q } = Route.useSearch();
  const navigate = useNavigate({ from: "/buscar" });

  return (
    <div className="mx-auto max-w-3xl px-4 pb-28 pt-6">
      <h1 className="font-display text-2xl font-bold">Buscar creadores</h1>
      <form
        className="mt-4 flex items-center gap-2 rounded-full bg-surface px-4 py-3"
        onSubmit={(e) => {
          e.preventDefault();
          const value = new FormData(e.currentTarget).get("q") as string;
          navigate({ search: { q: value } });
        }}
      >
        <Search className="size-4 text-muted-foreground" />
        <input
          name="q"
          defaultValue={q}
          placeholder="Nombre o @usuario"
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        <button type="submit" className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground">
          Buscar
        </button>
      </form>

      <div className="mt-6 flex flex-wrap gap-3">
        {(creators as unknown as Profile[]).map((c) => (
          <CreatorCard key={c.id} creator={c} />
        ))}
      </div>
      {q && creators.length === 0 ? (
        <p className="mt-8 text-center text-sm text-muted-foreground">
          No encontramos creadores para “{q}”.
        </p>
      ) : null}
    </div>
  );
}

import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Instagram, Youtube, Music2, Link2 } from "lucide-react";
import { getCreator } from "@/lib/reko.functions";
import { categoriaLabel, semanaLabel, type Profile, type Recommendation } from "@/lib/reko";
import { RecGrid } from "@/components/reko/RecGrid";
import { useAds } from "@/components/reko/AdsProvider";
import { ProfileActions } from "@/components/reko/ProfileActions";

export const Route = createFileRoute("/$username")({
  loader: async ({ params }) => {
    if (!params.username.startsWith("@")) throw notFound();
    const data = await getCreator({ data: { username: params.username.slice(1) } });
    if (!data.profile) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    if (!loaderData?.profile) {
      return { meta: [{ title: "Perfil no encontrado — Reko" }, { name: "robots", content: "noindex" }] };
    }
    const p = loaderData.profile;
    const title = `${p.full_name} (@${p.username}) — recomendaciones en Reko`;
    const description = p.bio ?? `Todas las recomendaciones de ${p.full_name} en un solo lugar.`;
    const meta = [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ];
    if (p.avatar_url?.startsWith("https://")) {
      meta.push({ property: "og:image", content: p.avatar_url });
      meta.push({ name: "twitter:image", content: p.avatar_url });
    }
    return { meta };
  },
  component: CreatorProfile,
});

const SOCIAL_ICONS: Record<string, typeof Instagram> = {
  instagram: Instagram,
  tiktok: Music2,
  youtube: Youtube,
};

function CreatorProfile() {
  const data = Route.useLoaderData();
  const profile = data.profile as unknown as Profile;
  const recs = data.recommendations as unknown as Recommendation[];
  const { registerViews } = useAds();
  const [tab, setTab] = useState("recientes");

  useEffect(() => {
    registerViews(recs.length);
  }, [registerViews, recs.length]);

  const semanas = useMemo(() => {
    const set = new Set(recs.map((r) => r.week_start).filter(Boolean) as string[]);
    return [...set].sort().reverse();
  }, [recs]);

  const categorias = useMemo(() => [...new Set(recs.map((r) => r.category))], [recs]);

  const tabs = useMemo(
    () => [
      { id: "recientes", label: "Recientes" },
      ...semanas.map((w) => ({ id: `semana:${w}`, label: semanaLabel(w)! })),
      ...categorias.map((c) => ({ id: `cat:${c}`, label: categoriaLabel(c) })),
      ...data.collections.map((c) => ({ id: `col:${c.id}`, label: c.name })),
    ],
    [semanas, categorias, data.collections],
  );

  const visibles = useMemo(() => {
    if (tab.startsWith("semana:")) return recs.filter((r) => r.week_start === tab.slice(7));
    if (tab.startsWith("cat:")) return recs.filter((r) => r.category === tab.slice(4));
    if (tab.startsWith("col:")) {
      const ids = new Set(
        data.links.filter((l) => l.collection_id === tab.slice(4)).map((l) => l.recommendation_id),
      );
      return recs.filter((r) => ids.has(r.id));
    }
    return recs;
  }, [tab, recs, data.links]);

  const socials = (profile.socials ?? {}) as Record<string, string>;

  return (
    <div className="mx-auto max-w-5xl px-4 pb-28 pt-6">
      <header className="flex flex-col items-center gap-3 rounded-3xl bg-surface p-6 text-center">
        <img
          src={profile.avatar_url ?? ""}
          alt={profile.full_name}
          className="size-24 rounded-full object-cover ring-4 ring-background"
        />
        <div>
          <h1 className="font-display text-2xl font-bold">{profile.full_name}</h1>
          <p className="text-sm text-muted-foreground">@{profile.username}</p>
        </div>
        {profile.bio ? <p className="max-w-md text-sm text-foreground/85">{profile.bio}</p> : null}
        <div className="flex flex-wrap justify-center gap-1">
          {profile.categories.map((c) => (
            <span key={c} className="rounded-full bg-card px-3 py-1 text-xs font-medium">
              {categoriaLabel(c)}
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          {Object.entries(socials).map(([key, url]) => {
            const Icon = SOCIAL_ICONS[key] ?? Link2;
            return (
              <a
                key={key}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={key}
                className="rounded-full bg-card p-2 shadow-soft transition-transform hover:-translate-y-0.5"
              >
                <Icon className="size-4" />
              </a>
            );
          })}
        </div>
        <ProfileActions
          profileId={profile.id}
          username={profile.username}
          recCount={recs.length}
          followersCount={data.followersCount ?? 0}
        />
      </header>

      <nav className="mt-6 flex gap-2 overflow-x-auto pb-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm transition-colors ${
              tab === t.id ? "bg-primary text-primary-foreground" : "bg-surface text-muted-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <section className="mt-4">
        <RecGrid recommendations={visibles} showCreator={false} />
      </section>
    </div>
  );
}

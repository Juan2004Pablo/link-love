import { Link } from "@tanstack/react-router";
import type { Recommendation } from "@/lib/reko";
import { categoriaLabel } from "@/lib/reko";

export function RecCard({ rec, showCreator = true }: { rec: Recommendation; showCreator?: boolean }) {
  const creator = rec.profiles;
  return (
    <article className="masonry-item group overflow-hidden rounded-2xl bg-card shadow-soft transition-transform duration-200 hover:-translate-y-0.5">
      <Link to="/r/$id" params={{ id: rec.id }} className="block">
        <div className="relative">
          <img
            src={rec.image_url}
            alt={rec.title}
            loading="lazy"
            className="w-full object-cover"
          />
          <span className="absolute left-2 top-2 rounded-full bg-background/85 px-2 py-0.5 text-[11px] font-medium text-foreground backdrop-blur">
            {categoriaLabel(rec.category)}
          </span>
        </div>
        <div className="space-y-1 p-3">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug">{rec.title}</h3>
          <p className="line-clamp-2 text-xs text-muted-foreground">{rec.review}</p>
        </div>
      </Link>
      {showCreator && creator ? (
        <Link
          to="/$username"
          params={{ username: `@${creator.username}` }}
          className="flex items-center gap-2 border-t border-border px-3 py-2"
        >
          <img
            src={creator.avatar_url ?? ""}
            alt={creator.full_name}
            className="size-6 rounded-full object-cover"
            loading="lazy"
          />
          <span className="truncate text-xs text-muted-foreground">@{creator.username}</span>
        </Link>
      ) : null}
    </article>
  );
}

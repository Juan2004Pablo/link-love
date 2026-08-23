import { Link } from "@tanstack/react-router";
import type { Profile } from "@/lib/reko";
import { categoriaLabel } from "@/lib/reko";

export function CreatorCard({ creator }: { creator: Profile }) {
  return (
    <Link
      to="/$username"
      params={{ username: `@${creator.username}` }}
      className="flex w-40 shrink-0 flex-col items-center gap-2 rounded-2xl bg-card p-4 text-center shadow-soft transition-transform hover:-translate-y-0.5 sm:w-44"
    >
      <img
        src={creator.avatar_url ?? ""}
        alt={creator.full_name}
        loading="lazy"
        className="size-16 rounded-full object-cover ring-2 ring-primary/25"
      />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{creator.full_name}</p>
        <p className="truncate text-xs text-muted-foreground">@{creator.username}</p>
      </div>
      <div className="flex flex-wrap justify-center gap-1">
        {creator.categories.map((c) => (
          <span key={c} className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium text-accent-foreground">
            {categoriaLabel(c)}
          </span>
        ))}
      </div>
    </Link>
  );
}

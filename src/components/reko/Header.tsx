import { Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { CATEGORIAS } from "@/lib/reko";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <Link to="/" className="font-display text-xl font-bold tracking-tight text-brand-gradient">
          Reko
        </Link>
        <nav className="ml-2 hidden gap-1 sm:flex">
          {CATEGORIAS.map((c) => (
            <Link
              key={c.slug}
              to="/categoria/$slug"
              params={{ slug: c.slug }}
              className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
              activeProps={{ className: "bg-surface text-foreground" }}
            >
              {c.label}
            </Link>
          ))}
        </nav>
        <Link
          to="/buscar"
          search={{ q: "" }}
          className="ml-auto inline-flex items-center gap-2 rounded-full bg-surface px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <Search className="size-4" />
          <span className="hidden sm:inline">Buscar creadores</span>
        </Link>
      </div>
      <nav className="flex gap-2 overflow-x-auto px-4 pb-3 sm:hidden">
        {CATEGORIAS.map((c) => (
          <Link
            key={c.slug}
            to="/categoria/$slug"
            params={{ slug: c.slug }}
            className="whitespace-nowrap rounded-full bg-surface px-3 py-1.5 text-sm text-muted-foreground"
            activeProps={{ className: "bg-primary text-primary-foreground" }}
          >
            {c.emoji} {c.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

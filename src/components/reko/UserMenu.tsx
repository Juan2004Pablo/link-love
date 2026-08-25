import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { UserRound } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function UserMenu() {
  const { user, profile, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          to="/auth"
          search={{ mode: "login" }}
          className="hidden rounded-full px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
        >
          Iniciar sesión
        </Link>
        <Link
          to="/auth"
          search={{ mode: "registro", tipo: "creador" }}
          className="rounded-full bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition-transform hover:-translate-y-0.5"
        >
          Únete como creador
        </Link>
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-label="Menú de usuario"
        onClick={() => setOpen((o) => !o)}
        className="flex size-9 items-center justify-center overflow-hidden rounded-full bg-surface ring-2 ring-transparent transition-all hover:ring-primary"
      >
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt={profile.full_name} className="size-full object-cover" />
        ) : (
          <UserRound className="size-4 text-muted-foreground" />
        )}
      </button>

      {open ? (
        <div className="absolute right-0 top-11 z-50 w-52 overflow-hidden rounded-2xl border border-border bg-card p-1 shadow-lift">
          {profile ? (
            <Link
              to="/$username"
              params={{ username: `@${profile.username}` }}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-2 text-sm transition-colors hover:bg-surface"
            >
              Mi perfil
            </Link>
          ) : null}
          {profile?.account_type === "creador" ? (
            <Link
              to="/panel"
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-2 text-sm transition-colors hover:bg-surface"
            >
              Panel de creador
            </Link>
          ) : null}
          <button
            type="button"
            onClick={async () => {
              setOpen(false);
              await signOut();
              navigate({ to: "/" });
            }}
            className="block w-full rounded-xl px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-surface"
          >
            Cerrar sesión
          </button>
        </div>
      ) : null}
    </div>
  );
}

import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/useAuth";

type AuthSearch = {
  mode: "login" | "registro";
  tipo: "creador" | "seguidor" | undefined;
  next: string | undefined;
};

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): AuthSearch => ({
    mode: search["mode"] === "registro" ? "registro" : "login",
    tipo: search["tipo"] === "creador" ? "creador" : search["tipo"] === "seguidor" ? "seguidor" : undefined,
    next: typeof search["next"] === "string" ? search["next"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Entra o únete a Reko — crea tu página de recomendaciones" },
      {
        name: "description",
        content:
          "Inicia sesión o crea tu cuenta de creador en Reko y ten una página permanente con todas tus recomendaciones.",
      },
      { property: "og:title", content: "Únete a Reko como creador" },
      {
        property: "og:description",
        content: "Tu link en la bio con todas tus recomendaciones de belleza, moda y tech.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const search = useSearch({ from: "/auth" });
  const navigate = useNavigate();
  const { session } = useAuth();
  const [mode, setMode] = useState<"login" | "registro">(search.mode ?? "login");
  const [tipo, setTipo] = useState<"creador" | "seguidor">(search.tipo ?? "creador");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (session) navigate({ to: search.next ?? "/" });
  }, [session, navigate, search.next]);

  const handleGoogle = async () => {
    setBusy(true);
    try {
      await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    } catch (err) {
      setBusy(false);
      toast.error(err instanceof Error ? err.message : "No pudimos conectar con Google");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) {
        toast.error("No pudimos entrar: " + error.message);
        return;
      }
      toast.success("¡Bienvenido de vuelta!");
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: { full_name: nombre, account_type: tipo },
        },
      });
      setBusy(false);
      if (error) {
        toast.error("No pudimos crear la cuenta: " + error.message);
        return;
      }
      if (!data.session) {
        toast.success("Revisa tu correo para confirmar la cuenta.");
      } else {
        toast.success("¡Cuenta creada! Bienvenido a Reko.");
      }
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 pb-28 pt-10">
      <h1 className="font-display text-2xl font-bold">
        {mode === "login" ? "Inicia sesión en Reko" : "Únete a Reko"}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {mode === "login"
          ? "Entra para seguir creadores, guardar favoritos y publicar tus recomendaciones."
          : "Crea tu página permanente de recomendaciones y compártela en tu bio."}
      </p>

      <button
        type="button"
        onClick={handleGoogle}
        disabled={busy}
        className="mt-6 inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-3 text-sm font-medium shadow-soft transition-colors hover:bg-surface disabled:opacity-60"
      >
        Continuar con Google
      </button>

      <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" /> o con tu correo <span className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {mode === "registro" ? (
          <>
            <div className="grid grid-cols-2 gap-2">
              {(["creador", "seguidor"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTipo(t)}
                  className={`rounded-2xl border px-3 py-3 text-sm font-medium transition-colors ${
                    tipo === t
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground"
                  }`}
                >
                  {t === "creador" ? "Soy creador" : "Soy seguidor"}
                </button>
              ))}
            </div>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              placeholder="Tu nombre"
              className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </>
        ) : null}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="tu@correo.com"
          className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          placeholder="Contraseña"
          className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
        />
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:opacity-60"
        >
          {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => setMode(mode === "login" ? "registro" : "login")}
        className="mt-5 text-sm text-muted-foreground underline underline-offset-4"
      >
        {mode === "login" ? "¿No tienes cuenta? Únete como creador" : "¿Ya tienes cuenta? Inicia sesión"}
      </button>
    </div>
  );
}

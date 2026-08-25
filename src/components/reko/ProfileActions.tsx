import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Check, Link2, Share2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function ProfileActions({
  profileId,
  username,
  recCount,
  followersCount,
}: {
  profileId: string;
  username: string;
  recCount: number;
  followersCount: number;
}) {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const isOwner = profile?.id === profileId;
  const [following, setFollowing] = useState(false);
  const [followers, setFollowers] = useState(followersCount);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => setFollowers(followersCount), [followersCount]);

  useEffect(() => {
    if (!user) {
      setFollowing(false);
      return;
    }
    let cancelled = false;
    supabase
      .from("follows")
      .select("creator_id")
      .eq("creator_id", profileId)
      .eq("follower_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setFollowing(Boolean(data));
      });
    return () => {
      cancelled = true;
    };
  }, [user, profileId]);

  const goAuth = () =>
    navigate({
      to: "/auth",
      search: { mode: "login", tipo: undefined, next: `/@${username}` },
    });

  const toggleFollow = async () => {
    if (!user) return goAuth();
    setBusy(true);
    if (following) {
      const { error } = await supabase
        .from("follows")
        .delete()
        .eq("creator_id", profileId)
        .eq("follower_id", user.id);
      if (!error) {
        setFollowing(false);
        setFollowers((f) => Math.max(0, f - 1));
      }
    } else {
      const { error } = await supabase
        .from("follows")
        .insert({ creator_id: profileId, follower_id: user.id });
      if (!error) {
        setFollowing(true);
        setFollowers((f) => f + 1);
        toast.success(`Ahora sigues a @${username}`);
      }
    }
    setBusy(false);
  };

  const share = async () => {
    const url = `${window.location.origin}/@${username}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      toast.error("No pudimos copiar el link");
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    toast.success("¡Link copiado! Pégalo en tu bio");
  };

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {isOwner ? null : (
          <button
            type="button"
            onClick={toggleFollow}
            disabled={busy}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-transform hover:-translate-y-0.5 disabled:opacity-60 ${
              following
                ? "border border-border bg-card text-muted-foreground"
                : "bg-primary text-primary-foreground shadow-soft"
            }`}
          >
            {following ? "Siguiendo" : "Seguir"}
          </button>
        )}
        <button
          type="button"
          onClick={share}
          className={
            isOwner
              ? "inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition-transform hover:-translate-y-0.5"
              : "inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium transition-transform hover:-translate-y-0.5"
          }
        >
          {copied ? <Check className="size-4" /> : isOwner ? <Link2 className="size-4" /> : <Share2 className="size-4" />}
          {isOwner ? "Copia tu link para tu bio de Instagram/TikTok" : "Compartir perfil"}
        </button>
      </div>

      <p className="text-xs text-muted-foreground">
        {recCount} {recCount === 1 ? "recomendación" : "recomendaciones"} · {followers}{" "}
        {followers === 1 ? "seguidor" : "seguidores"}
      </p>
    </div>
  );
}

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AuthProfile = {
  id: string;
  user_id: string | null;
  username: string;
  full_name: string;
  avatar_url: string | null;
  account_type: string;
};

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: AuthProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

async function createProfileFor(user: User): Promise<AuthProfile | null> {
  const meta = (user.user_metadata ?? {}) as Record<string, string>;
  const base =
    (meta["username"] || meta["full_name"] || user.email?.split("@")[0] || "creador")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9_]/g, "")
      .slice(0, 20) || "creador";

  for (let i = 0; i < 4; i += 1) {
    const username = i === 0 ? base : `${base}${Math.floor(Math.random() * 9000 + 1000)}`;
    const { data, error } = await supabase
      .from("profiles")
      .insert({
        user_id: user.id,
        username,
        full_name: meta["full_name"] || meta["name"] || user.email?.split("@")[0] || "Nuevo perfil",
        avatar_url: meta["avatar_url"] ?? null,
        account_type: (meta["account_type"] === "creador" ? "creador" : "seguidor") as "creador" | "seguidor",
      })
      .select("id, user_id, username, full_name, avatar_url, account_type")
      .maybeSingle();
    if (data) return data as AuthProfile;
    if (error && !error.message.includes("duplicate")) return null;
  }
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (user: User | undefined | null) => {
    if (!user) {
      setProfile(null);
      return;
    }
    const { data } = await supabase
      .from("profiles")
      .select("id, user_id, username, full_name, avatar_url, account_type")
      .eq("user_id", user.id)
      .maybeSingle();
    if (data) {
      setProfile(data as AuthProfile);
      return;
    }
    const created = await createProfileFor(user);
    setProfile(created);
  }, []);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setLoading(false);
      // Evitar llamadas a Supabase dentro del callback.
      setTimeout(() => void loadProfile(next?.user), 0);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
      void loadProfile(data.session?.user);
    });
    return () => sub.subscription.unsubscribe();
  }, [loadProfile]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      loading,
      signOut: async () => {
        await supabase.auth.signOut();
        setProfile(null);
      },
      refreshProfile: () => loadProfile(session?.user),
    }),
    [session, profile, loading, loadProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

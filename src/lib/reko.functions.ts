import { createServerFn } from "@tanstack/react-start";
import { publicClient } from "./reko.server";

const REC_FIELDS =
  "id, title, image_url, review, external_url, category, tags, brand, featured, week_start, created_at, creator_id";
const PROFILE_FIELDS =
  "id, username, full_name, avatar_url, bio, categories, socials, featured, account_type";

export const getDiscover = createServerFn({ method: "GET" }).handler(async () => {
  const db = publicClient();
  const [creators, recs] = await Promise.all([
    db.from("profiles").select(PROFILE_FIELDS).eq("account_type", "creador").order("featured", { ascending: false }).limit(8),
    db.from("recommendations").select(`${REC_FIELDS}, profiles!inner(${PROFILE_FIELDS})`).order("created_at", { ascending: false }).limit(24),
  ]);
  return { creators: creators.data ?? [], recommendations: recs.data ?? [] };
});

export const getByCategory = createServerFn({ method: "GET" })
  .inputValidator((data: { category: "belleza" | "moda" | "tech" }) => data)
  .handler(async ({ data }) => {
    const db = publicClient();
    const [creators, recs] = await Promise.all([
      db.from("profiles").select(PROFILE_FIELDS).contains("categories", [data.category]).limit(12),
      db
        .from("recommendations")
        .select(`${REC_FIELDS}, profiles!inner(${PROFILE_FIELDS})`)
        .eq("category", data.category)
        .order("created_at", { ascending: false })
        .limit(40),
    ]);
    return { creators: creators.data ?? [], recommendations: recs.data ?? [] };
  });

export const getCreator = createServerFn({ method: "GET" })
  .inputValidator((data: { username: string }) => data)
  .handler(async ({ data }) => {
    const db = publicClient();
    const { data: profile } = await db
      .from("profiles")
      .select(PROFILE_FIELDS)
      .eq("username", data.username.toLowerCase())
      .maybeSingle();
    if (!profile) return { profile: null, recommendations: [], collections: [], links: [] };

    const [recs, cols, links] = await Promise.all([
      db.from("recommendations").select(REC_FIELDS).eq("creator_id", profile.id).order("created_at", { ascending: false }),
      db.from("collections").select("id, name, type, position").eq("creator_id", profile.id).order("position"),
      db.from("recommendation_collections").select("recommendation_id, collection_id"),
    ]);
    return {
      profile,
      recommendations: recs.data ?? [],
      collections: cols.data ?? [],
      links: links.data ?? [],
    };
  });

export const getRecommendation = createServerFn({ method: "GET" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const db = publicClient();
    const { data: rec } = await db
      .from("recommendations")
      .select(`${REC_FIELDS}, profiles!inner(${PROFILE_FIELDS})`)
      .eq("id", data.id)
      .maybeSingle();
    if (!rec) return { recommendation: null, more: [] };
    const { data: more } = await db
      .from("recommendations")
      .select(REC_FIELDS)
      .eq("creator_id", rec.creator_id)
      .neq("id", rec.id)
      .order("created_at", { ascending: false })
      .limit(6);
    return { recommendation: rec, more: more ?? [] };
  });

export const searchCreators = createServerFn({ method: "GET" })
  .inputValidator((data: { q: string }) => data)
  .handler(async ({ data }) => {
    const q = data.q.trim();
    if (!q) return { creators: [] };
    const db = publicClient();
    const { data: creators } = await db
      .from("profiles")
      .select(PROFILE_FIELDS)
      .or(`username.ilike.%${q.replace(/[%,()]/g, "")}%,full_name.ilike.%${q.replace(/[%,()]/g, "")}%`)
      .eq("account_type", "creador")
      .limit(24);
    return { creators: creators ?? [] };
  });

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  ADS_MODAL_COOLDOWN_MINUTES,
  ADS_MODAL_EVERY_N_VIEWS,
  type Sponsored,
} from "@/lib/reko";

type AdsContextValue = {
  cardAds: Sponsored[];
  /** Se llama cuando el usuario ve recomendaciones; dispara el modal ocasional. */
  registerViews: (count: number) => void;
};

const AdsContext = createContext<AdsContextValue>({ cardAds: [], registerViews: () => {} });

export const useAds = () => useContext(AdsContext);

export function AdsProvider({ children }: { children: ReactNode }) {
  const [ads, setAds] = useState<Sponsored[]>([]);
  const [views, setViews] = useState(0);
  const [bannerClosed, setBannerClosed] = useState(false);
  const [modalAd, setModalAd] = useState<Sponsored | null>(null);
  const [lastModalAt, setLastModalAt] = useState(() => Date.now());

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("sponsored_content")
      .select("id, brand, headline, image_url, link_url, type, placement")
      .then(({ data }) => {
        if (!cancelled && data) setAds(data as Sponsored[]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const cardAds = useMemo(() => ads.filter((a) => a.type === "card"), [ads]);
  const bannerAd = useMemo(() => ads.find((a) => a.type === "banner") ?? null, [ads]);
  const modalPool = useMemo(() => ads.filter((a) => a.type === "modal"), [ads]);

  const registerViews = useCallback((count: number) => {
    setViews((v) => v + count);
  }, []);

  useEffect(() => {
    if (modalAd || modalPool.length === 0) return;
    if (views < ADS_MODAL_EVERY_N_VIEWS) return;
    const cooldownOk = Date.now() - lastModalAt > ADS_MODAL_COOLDOWN_MINUTES * 60_000;
    if (!cooldownOk) return;
    setModalAd(modalPool[0]!);
    setViews(0);
    setLastModalAt(Date.now());
  }, [views, modalPool, modalAd, lastModalAt]);

  return (
    <AdsContext.Provider value={{ cardAds, registerViews }}>
      {children}

      {bannerAd && !bannerClosed ? (
        <div className="fixed inset-x-0 bottom-0 z-40 px-3 pb-3">
          <div className="mx-auto flex max-w-3xl items-center gap-3 rounded-2xl border border-sponsored-border bg-sponsored/95 p-2 shadow-soft backdrop-blur">
            <a
              href={bannerAd.link_url}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="flex min-w-0 flex-1 items-center gap-3"
            >
              <img src={bannerAd.image_url} alt={bannerAd.brand} className="size-10 rounded-xl object-cover" />
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-sponsored-foreground">
                  Publicidad · {bannerAd.brand}
                </p>
                <p className="truncate text-sm text-sponsored-foreground">{bannerAd.headline ?? bannerAd.brand}</p>
              </div>
            </a>
            <button
              type="button"
              aria-label="Ocultar publicidad"
              onClick={() => setBannerClosed(true)}
              className="rounded-full p-2 text-sponsored-foreground transition-colors hover:bg-background/50"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      ) : null}

      {modalAd ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/50 p-4 sm:items-center">
          <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-sponsored-border bg-card shadow-lift">
            <button
              type="button"
              aria-label="Cerrar publicidad"
              onClick={() => setModalAd(null)}
              className="absolute right-3 top-3 z-10 rounded-full bg-background/90 p-2 text-foreground shadow-soft"
            >
              <X className="size-4" />
            </button>
            <a href={modalAd.link_url} target="_blank" rel="noopener noreferrer sponsored">
              <img src={modalAd.image_url} alt={modalAd.brand} className="h-56 w-full object-cover" />
              <div className="space-y-1 p-5">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-sponsored-foreground">
                  Publicidad · {modalAd.brand}
                </p>
                <p className="text-lg font-semibold">{modalAd.headline ?? modalAd.brand}</p>
                <p className="text-sm text-muted-foreground">Contenido patrocinado por una marca aliada.</p>
              </div>
            </a>
          </div>
        </div>
      ) : null}
    </AdsContext.Provider>
  );
}

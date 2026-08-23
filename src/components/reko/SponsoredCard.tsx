import type { Sponsored } from "@/lib/reko";

export function SponsoredCard({ ad }: { ad: Sponsored }) {
  return (
    <article className="masonry-item overflow-hidden rounded-2xl border border-sponsored-border bg-sponsored shadow-soft">
      <a href={ad.link_url} target="_blank" rel="noopener noreferrer sponsored" className="block">
        <div className="flex items-center justify-between px-3 pt-2">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-sponsored-foreground">
            Publicidad
          </span>
          <span className="text-[10px] text-sponsored-foreground/80">{ad.brand}</span>
        </div>
        <img src={ad.image_url} alt={ad.brand} loading="lazy" className="mt-2 w-full object-cover" />
        <div className="p-3">
          <p className="line-clamp-2 text-sm font-semibold text-sponsored-foreground">
            {ad.headline ?? ad.brand}
          </p>
          <p className="mt-1 text-xs text-sponsored-foreground/80">Contenido patrocinado</p>
        </div>
      </a>
    </article>
  );
}

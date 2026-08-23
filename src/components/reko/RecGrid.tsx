import { useMemo } from "react";
import { RecCard } from "./RecCard";
import { SponsoredCard } from "./SponsoredCard";
import { useAds } from "./AdsProvider";
import { ADS_CARD_EVERY_N_ITEMS, type Recommendation } from "@/lib/reko";

export function RecGrid({
  recommendations,
  showCreator = true,
  withAds = true,
}: {
  recommendations: Recommendation[];
  showCreator?: boolean;
  withAds?: boolean;
}) {
  const { cardAds } = useAds();

  const items = useMemo(() => {
    const out: Array<{ kind: "rec"; rec: Recommendation } | { kind: "ad"; ad: (typeof cardAds)[number]; key: string }> = [];
    let adIndex = 0;
    recommendations.forEach((rec, i) => {
      out.push({ kind: "rec", rec });
      const shouldAd = withAds && cardAds.length > 0 && (i + 1) % ADS_CARD_EVERY_N_ITEMS === 0;
      if (shouldAd) {
        const ad = cardAds[adIndex % cardAds.length]!;
        out.push({ kind: "ad", ad, key: `${ad.id}-${i}` });
        adIndex += 1;
      }
    });
    return out;
  }, [recommendations, cardAds, withAds]);

  if (recommendations.length === 0) {
    return (
      <p className="rounded-2xl bg-surface px-4 py-10 text-center text-sm text-muted-foreground">
        Todavía no hay recomendaciones por acá.
      </p>
    );
  }

  return (
    <div className="masonry-grid-wide">
      {items.map((item) =>
        item.kind === "rec" ? (
          <RecCard key={item.rec.id} rec={item.rec} showCreator={showCreator} />
        ) : (
          <SponsoredCard key={item.key} ad={item.ad} />
        ),
      )}
    </div>
  );
}

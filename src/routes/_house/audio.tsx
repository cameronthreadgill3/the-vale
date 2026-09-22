import { createFileRoute } from "@tanstack/react-router";
import { AUDIO } from "@/canon/catalog";
import { MediaShelf } from "@/components/media-shelf";

export const Route = createFileRoute("/_house/audio")({
  component: () => (
    <MediaShelf
      kind="audio"
      kicker="Voices"
      title="The First Trial, spoken"
      intro="Male voices for named men. Female voices for named women. A First Story echo sits on every track — Atlas narration, not a rewrite. Voices is $5. The kettle is $10 for the whole house."
      items={AUDIO}
      empty="No track plays until a Voices or Kettle key is redeemed. Book One in prose stays free. The Vale echo on each title is already visible."
    />
  ),
});

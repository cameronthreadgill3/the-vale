import { createFileRoute } from "@tanstack/react-router";
import { ANIME } from "@/canon/catalog";
import { MediaShelf } from "@/components/media-shelf";

export const Route = createFileRoute("/_house/anime")({
  component: () => (
    <MediaShelf
      kind="anime"
      kicker="Episodes"
      title="Hollow Reach, drawn"
      intro="One episode a chapter. Atlas narration. Roads, classes, and hollows taste like the Vale — Lucas stays in his trial. Fourteen episodes from Book One. Anime is $5. The kettle is $10 for the whole house."
      items={ANIME}
      empty="Episodes unlock with an Anime or Kettle key. They are not a second plot. The First Story shows through the stills."
    />
  ),
});

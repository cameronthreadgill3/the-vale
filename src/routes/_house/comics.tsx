import { createFileRoute } from "@tanstack/react-router";
import { COMICS } from "@/canon/catalog";
import { MediaShelf } from "@/components/media-shelf";

export const Route = createFileRoute("/_house/comics")({
  component: () => (
    <MediaShelf
      kind="comic"
      kicker="Issues"
      title="The Accession, in panels"
      intro="Each chapter is an issue. The yard. The blink. The grass. Comics ride with the $10 kettle. Book One in prose stays free. Fourteen issues, First Story in the gutters."
      items={COMICS}
      empty="Issues unlock with the kettle. Open any title for the Vale panels that sit beside Lucas's trial."
    />
  ),
});

import { createFileRoute, Link } from "@tanstack/react-router";
import { mediaById } from "@/canon/catalog";
import { MediaDetail } from "@/components/media-detail";

export const Route = createFileRoute("/_house/anime/$id")({ component: AnimeItem });

function AnimeItem() {
  const { id } = Route.useParams();
  const item = mediaById("anime", id);
  if (!item) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <p className="text-sm text-fg-muted">No episode by that name.</p>
        <Link to="/anime" className="mt-4 inline-block text-sm text-fg hover:underline">
          Back to episodes
        </Link>
      </div>
    );
  }
  return <MediaDetail item={item} kind="anime" />;
}

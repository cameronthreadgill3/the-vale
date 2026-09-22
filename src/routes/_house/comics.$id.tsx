import { createFileRoute, Link } from "@tanstack/react-router";
import { mediaById } from "@/canon/catalog";
import { MediaDetail } from "@/components/media-detail";

export const Route = createFileRoute("/_house/comics/$id")({ component: ComicItem });

function ComicItem() {
  const { id } = Route.useParams();
  const item = mediaById("comic", id);
  if (!item) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <p className="text-sm text-fg-muted">No issue by that name.</p>
        <Link to="/comics" className="mt-4 inline-block text-sm text-fg hover:underline">
          Back to issues
        </Link>
      </div>
    );
  }
  return <MediaDetail item={item} kind="comic" />;
}

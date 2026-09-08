import type { Route } from "./+types/album-cover";
import { getAlbumCoverImage } from "../lib/db.server";

export const loader = ({ params }: Route.LoaderArgs) => {
  const id = Number(params.id);
  const row = getAlbumCoverImage(id);
  if (!row?.cover_image) {
    throw new Response("Not found", { status: 404 });
  }
  return new Response(new Uint8Array(row.cover_image), {
    headers: {
      "Content-Type": row.cover_image_type ?? "application/octet-stream",
      "Cache-Control": "no-cache"
    }
  });
};

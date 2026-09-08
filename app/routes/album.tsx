import { useState } from "react";
import { Form, Link, redirect, useSubmit } from "react-router";
import type { Route } from "./+types/album";
import {
  createListen,
  deleteAlbum,
  getAlbum,
  getAlbumRow,
  listListensForAlbum,
  setSpotifyTrackId
} from "../lib/db.server";
import { searchTrack } from "../lib/spotify.server";
import { AlbumCover } from "../components/album-cover";
import { ConfirmDialog } from "../components/confirm-dialog";

export const meta: Route.MetaFunction = () => {
  return [{ title: "Album — Riff" }];
};

export const loader = async ({ params }: Route.LoaderArgs) => {
  const id = Number(params.id);
  const album = getAlbum(id);
  if (!album) {
    throw new Response("Not found", { status: 404 });
  }
  const row = getAlbumRow(id);
  let spotifyTrackId = row?.spotify_track_id ?? null;
  if (!spotifyTrackId) {
    const found = await searchTrack(album.title, album.artist);
    if (found) {
      setSpotifyTrackId(id, found);
      spotifyTrackId = found;
    }
  }
  const listens = listListensForAlbum(id);
  return { album, listens, spotifyTrackId };
};

export const action = async ({ params, request }: Route.ActionArgs) => {
  const id = Number(params.id);
  const form = await request.formData();
  const intent = form.get("intent");

  if (intent === "listen") {
    const ratingRaw = form.get("rating");
    const notes = form.get("notes");
    createListen({
      album_id: id,
      rating: ratingRaw ? Number(ratingRaw) : null,
      notes: typeof notes === "string" && notes.length > 0 ? notes : null
    });
    return null;
  }

  if (intent === "delete") {
    deleteAlbum(id);
    return redirect("/albums");
  }

  return null;
};

const stars = (rating: number | null) => {
  if (!rating) {
    return "—";
  }
  return "★".repeat(rating) + "☆".repeat(Math.max(0, 5 - rating));
};

export default function AlbumRoute({ loaderData }: Route.ComponentProps) {
  const { album, listens, spotifyTrackId } = loaderData;
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const submit = useSubmit();

  return (
    <div className="space-y-10">
      <div className="grid md:grid-cols-[320px_1fr] gap-10 items-start">
        <div className="max-w-sm space-y-4">
          <AlbumCover title={album.title} artist={album.artist} palette={album.palette} size="lg" />
          {spotifyTrackId ? (
            <div className="rounded-2xl overflow-hidden border border-white/10">
              <iframe
                title={`Spotify preview: ${album.title}`}
                src={`https://open.spotify.com/embed/track/${spotifyTrackId}?utm_source=riff`}
                width="100%"
                height="80"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                style={{ border: 0 }}
              />
            </div>
          ) : null}
        </div>
        <div className="space-y-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">
              {album.year ? `${album.year} · ` : ""}
              {album.genre ?? "Unfiled"}
            </p>
            <h1 className="font-display text-6xl mt-3 tracking-tight leading-none">
              {album.title}
            </h1>
            <p className="mt-3 text-2xl text-white/70">{album.artist}</p>
          </div>
          {album.notes ? (
            <p className="text-white/70 max-w-prose italic border-l-2 border-white/20 pl-4">
              "{album.notes}"
            </p>
          ) : null}
          <div className="flex items-center gap-8">
            <Metric label="Listens" value={album.listen_count} />
            <Metric label="Avg rating" value={album.avg_rating ? album.avg_rating.toFixed(1) : "—"} />
            <Metric
              label="Last spun"
              value={album.last_listened ? new Date(album.last_listened).toLocaleDateString() : "—"}
            />
          </div>

          <Form method="post" className="mt-4 p-5 rounded-2xl border border-white/10 bg-white/[0.03] space-y-4">
            <input type="hidden" name="intent" value="listen" />
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl">Log a listen</h3>
              <span className="text-xs text-white/40">just now</span>
            </div>
            <div className="flex items-center gap-6">
              <div>
                <label className="text-xs uppercase tracking-widest text-white/40 block mb-2">Rating</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((n) => {
                    return (
                      <label key={n} className="cursor-pointer">
                        <input
                          type="radio"
                          name="rating"
                          value={n}
                          checked={rating === n}
                          onChange={() => setRating(n)}
                          className="peer sr-only"
                        />
                        <span className="peer-checked:text-yellow-300 text-2xl text-white/20 hover:text-white/50 transition">
                          ★
                        </span>
                      </label>
                    );
                  })}
                  {rating !== null ? (
                    <button
                      type="button"
                      onClick={() => setRating(null)}
                      aria-label="Clear rating"
                      className="ml-2 text-xs text-white/40 hover:text-white/70 transition"
                    >
                      Clear
                    </button>
                  ) : null}
                </div>
              </div>
              <div className="flex-1">
                <label className="text-xs uppercase tracking-widest text-white/40 block mb-2">Note (optional)</label>
                <input
                  type="text"
                  name="notes"
                  placeholder="How did it hit?"
                  className="w-full px-4 py-2 rounded-full text-sm bg-white/5 border border-white/10 placeholder:text-white/30 focus:outline-none focus:border-white/25"
                />
              </div>
              <button
                type="submit"
                className="self-end px-5 py-2 rounded-full text-sm text-black bg-white hover:bg-white/90 transition"
              >
                Log
              </button>
            </div>
          </Form>
        </div>
      </div>

      <div>
        <h2 className="font-display text-3xl mb-5">Listens</h2>
        <ol className="space-y-3">
          {listens.map((l) => {
            return (
              <li
                key={l.id}
                className="p-4 rounded-xl border border-white/5 bg-white/[0.02] flex items-center gap-6"
              >
                <div className="text-xs uppercase tracking-widest text-white/40 w-32 shrink-0 tabular-nums">
                  {new Date(l.listened_at).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </div>
                <div className="text-yellow-300 font-mono text-sm w-24 shrink-0">
                  {stars(l.rating)}
                </div>
                <div className="text-white/70 text-sm truncate">{l.notes ?? " "}</div>
              </li>
            );
          })}
          {listens.length === 0 ? (
            <li className="text-white/40 text-sm p-6 border border-dashed border-white/10 rounded-xl text-center">
              Never spun. Log a listen above.
            </li>
          ) : null}
        </ol>
      </div>

      <div className="pt-8 border-t border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <Link to="/albums" className="text-sm text-white/50 hover:text-white transition">
              ← Back to albums
            </Link>
          </div>
          <button
            type="button"
            className="text-xs text-red-400/70 hover:text-red-300 uppercase tracking-widest"
            onClick={() => setConfirmingDelete(true)}
          >
            Delete album
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmingDelete}
        title="Delete album?"
        description="This permanently removes the album and all its listens."
        confirmLabel="Delete album"
        onConfirm={() => submit({ intent: "delete" }, { method: "post" })}
        onCancel={() => setConfirmingDelete(false)}
      />
    </div>
  );
}

const Metric = ({ label, value }: { label: string; value: string | number }) => {
  return (
    <div>
      <div className="text-xs uppercase tracking-widest text-white/40">{label}</div>
      <div className="font-display text-2xl mt-1 tabular-nums">{value}</div>
    </div>
  );
};

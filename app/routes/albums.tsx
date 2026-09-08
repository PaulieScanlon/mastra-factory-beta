import { Link, useFetcher, useSearchParams } from "react-router";
import type { Route } from "./+types/albums";
import { listAlbums, type AlbumWithStats } from "../lib/db.server";
import { AlbumCover } from "../components/album-cover";

export const meta: Route.MetaFunction = () => {
  return [{ title: "Albums — Riff" }];
};

export const loader = () => {
  return { albums: listAlbums() };
};

export default function Albums({ loaderData }: Route.ComponentProps) {
  const { albums } = loaderData;
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const genre = params.get("genre") ?? "";

  const genres = Array.from(
    new Set(
      albums
        .map((a) => {
          return a.genre;
        })
        .filter((g): g is string => {
          return Boolean(g);
        })
    )
  );

  const filtered = albums.filter((a) => {
    const matchesQ = q === "" || `${a.title} ${a.artist}`.toLowerCase().includes(q.toLowerCase());
    const matchesGenre = genre === "" || a.genre === genre;
    return matchesQ && matchesGenre;
  });

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">Library</p>
          <h1 className="font-display text-5xl mt-2">Albums</h1>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="search"
            value={q}
            onChange={(e) => {
              const next = new URLSearchParams(params);
              if (e.target.value) {
                next.set("q", e.target.value);
              } else {
                next.delete("q");
              }
              setParams(next, { replace: true });
            }}
            placeholder="Search title or artist…"
            className="w-64 px-4 py-2 rounded-full text-sm bg-white/5 border border-white/10 placeholder:text-white/30 focus:outline-none focus:border-white/25"
          />
          <select
            value={genre}
            onChange={(e) => {
              const next = new URLSearchParams(params);
              if (e.target.value) {
                next.set("genre", e.target.value);
              } else {
                next.delete("genre");
              }
              setParams(next, { replace: true });
            }}
            className="px-4 py-2 rounded-full text-sm bg-white/5 border border-white/10 focus:outline-none focus:border-white/25"
          >
            <option value="">All genres</option>
            {genres.map((g) => {
              return (
                <option key={g} value={g}>
                  {g}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
        {filtered.map((album) => {
          return <AlbumCard key={album.id} album={album} />;
        })}
      </ul>

      {filtered.length === 0 ? (
        <div className="text-white/40 text-sm p-12 border border-dashed border-white/10 rounded-xl text-center">
          No albums matched.{" "}
          <button
            type="button"
            onClick={() => {
              setParams(new URLSearchParams(), { replace: true });
            }}
            className="underline hover:text-white"
          >
            Clear filters
          </button>
        </div>
      ) : null}
    </div>
  );
}

const AlbumCard = ({ album }: { album: AlbumWithStats }) => {
  const fetcher = useFetcher();
  const isFavorite = fetcher.formData
    ? fetcher.formData.get("favorite") === "1"
    : album.favorite === 1;

  return (
    <li className="relative">
      <Link to={`/albums/${album.id}`} className="group block">
        <AlbumCover title={album.title} artist={album.artist} palette={album.palette} />
        <div className="mt-3">
          <div className="text-sm font-medium truncate">{album.title}</div>
          <div className="text-xs text-white/50 truncate">{album.artist}</div>
          <div className="mt-2 flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/40">
            {album.year ? <span>{album.year}</span> : null}
            {album.genre ? <span>· {album.genre}</span> : null}
          </div>
        </div>
      </Link>
      <fetcher.Form method="post" action={`/albums/${album.id}`} className="absolute top-2 right-2 z-10">
        <input type="hidden" name="intent" value="toggle-favorite" />
        <input type="hidden" name="favorite" value={isFavorite ? "0" : "1"} />
        <button
          type="submit"
          aria-pressed={isFavorite}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          title={isFavorite ? "Remove from favorites" : "Add to favorites"}
          className={`text-2xl leading-none drop-shadow transition ${
            isFavorite ? "text-red-400 hover:text-red-300" : "text-white/40 hover:text-white/80"
          }`}
        >
          {isFavorite ? "♥" : "♡"}
        </button>
      </fetcher.Form>
    </li>
  );
};

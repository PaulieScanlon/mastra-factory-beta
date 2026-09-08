import { Link, useSearchParams } from "react-router";
import type { Route } from "./+types/albums";
import { listAlbumsPage, listGenres } from "../lib/db.server";
import { AlbumCover } from "../components/album-cover";

export const meta: Route.MetaFunction = () => {
  return [{ title: "Albums — Riff" }];
};

export const loader = ({ request }: Route.LoaderArgs) => {
  const url = new URL(request.url);
  const q = url.searchParams.get("q") ?? "";
  const genre = url.searchParams.get("genre") ?? "";
  const page = Number(url.searchParams.get("page")) || 1;
  return { ...listAlbumsPage({ q, genre, page }), genres: listGenres() };
};

const pageLink = (params: URLSearchParams, page: number) => {
  const next = new URLSearchParams(params);
  if (page > 1) {
    next.set("page", String(page));
  } else {
    next.delete("page");
  }
  const s = next.toString();
  return s ? `?${s}` : "?";
};

export default function Albums({ loaderData }: Route.ComponentProps) {
  const { albums, genres, page, pageCount } = loaderData;
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const genre = params.get("genre") ?? "";

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
              next.delete("page");
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
              next.delete("page");
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
        {albums.map((album) => {
          return (
            <li key={album.id}>
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
            </li>
          );
        })}
      </ul>

      {albums.length === 0 ? (
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

      {pageCount > 1 ? (
        <nav className="flex items-center justify-center gap-4 text-sm">
          {page > 1 ? (
            <Link
              to={pageLink(params, page - 1)}
              className="px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition"
            >
              ← Prev
            </Link>
          ) : (
            <span className="px-4 py-2 rounded-full border border-white/5 text-white/25">← Prev</span>
          )}
          <span className="text-white/40 tabular-nums">
            Page {page} of {pageCount}
          </span>
          {page < pageCount ? (
            <Link
              to={pageLink(params, page + 1)}
              className="px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition"
            >
              Next →
            </Link>
          ) : (
            <span className="px-4 py-2 rounded-full border border-white/5 text-white/25">Next →</span>
          )}
        </nav>
      ) : null}
    </div>
  );
}

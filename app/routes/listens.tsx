import { Link } from "react-router";
import type { Route } from "./+types/listens";
import { listListensPage } from "../lib/db.server";

export const meta: Route.MetaFunction = () => {
  return [{ title: "Listens — Riff" }];
};

export const loader = ({ request }: Route.LoaderArgs) => {
  const url = new URL(request.url);
  const page = Number(url.searchParams.get("page")) || 1;
  return listListensPage(page);
};

const groupByDay = <T extends { listened_at: string }>(items: T[]) => {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const day = new Date(item.listened_at).toDateString();
    if (!map.has(day)) {
      map.set(day, []);
    }
    map.get(day)!.push(item);
  }
  return Array.from(map.entries());
};

const stars = (n: number | null) => {
  if (!n) {
    return "";
  }
  return "★".repeat(n);
};

export default function Listens({ loaderData }: Route.ComponentProps) {
  const { listens, page, pageCount } = loaderData;
  const groups = groupByDay(listens);

  return (
    <div className="space-y-10">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-white/40">History</p>
        <h1 className="font-display text-5xl mt-2">Listens</h1>
      </div>

      <ol className="relative space-y-10 border-l border-white/10 ml-4 pl-8">
        {groups.map(([day, items]) => {
          return (
            <li key={day}>
              <div className="absolute -left-2 w-4 h-4 rounded-full bg-white" />
              <div className="text-xs uppercase tracking-widest text-white/40 mb-4">
                {new Date(day).toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "long",
                  day: "numeric"
                })}
              </div>
              <ul className="space-y-3">
                {items.map((l) => {
                  return (
                    <li key={l.id}>
                      <Link
                        to={`/albums/${l.album_id}`}
                        className="group flex items-center gap-4 p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition"
                      >
                        <div className={`cover palette-${l.palette} w-12 h-12 rounded-lg shrink-0`} />
                        <div className="min-w-0 flex-1">
                          <div className="truncate">
                            <span className="font-medium">{l.album_title}</span>
                            <span className="text-white/50"> — {l.album_artist}</span>
                          </div>
                          {l.notes ? (
                            <div className="text-xs text-white/50 italic mt-1 truncate">"{l.notes}"</div>
                          ) : null}
                        </div>
                        <div className="text-xs text-white/40 tabular-nums shrink-0">
                          {new Date(l.listened_at).toLocaleTimeString(undefined, {
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </div>
                        <div className="text-yellow-300 text-sm w-16 text-right shrink-0">
                          {stars(l.rating)}
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })}
        {groups.length === 0 ? (
          <li className="text-white/40 text-sm p-12 border border-dashed border-white/10 rounded-xl text-center">
            Nothing spun yet.
          </li>
        ) : null}
      </ol>

      {pageCount > 1 ? (
        <nav className="flex items-center justify-center gap-4 text-sm">
          {page > 1 ? (
            <Link
              to={page - 1 > 1 ? `?page=${page - 1}` : "?"}
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
              to={`?page=${page + 1}`}
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

import { Link } from "react-router";
import type { Route } from "./+types/listens";
import { listRecentListens } from "../lib/db.server";
import { CoverThumb, coverSrcFor } from "../components/album-cover";

export const meta: Route.MetaFunction = () => {
  return [{ title: "Listens — Riff" }];
};

export const loader = () => {
  return { listens: listRecentListens(200) };
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
  const groups = groupByDay(loaderData.listens);

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
                        <CoverThumb
                          coverSrc={coverSrcFor({
                            id: l.album_id,
                            cover_url: l.cover_url,
                            has_cover_image: l.has_cover_image
                          })}
                          palette={l.palette}
                          className="w-12 h-12 rounded-lg shrink-0"
                        />
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
    </div>
  );
}

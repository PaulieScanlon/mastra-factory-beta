import { Link } from "react-router";
import type { Route } from "./+types/home";
import { listRecentListens, stats } from "../lib/db.server";
import { AlbumCover, CoverThumb, coverSrcFor } from "../components/album-cover";

export const meta: Route.MetaFunction = () => {
  return [{ title: "Riff — a listening log" }];
};

export const loader = () => {
  const { totals, topRated } = stats();
  const recent = listRecentListens(8);
  return { totals, topRated, recent };
};

const relativeDate = (iso: string) => {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const mins = Math.floor((now - then) / 60000);
  if (mins < 60) {
    return `${mins}m ago`;
  }
  const hours = Math.floor(mins / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }
  const days = Math.floor(hours / 24);
  if (days < 30) {
    return `${days}d ago`;
  }
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

export default function Home({ loaderData }: Route.ComponentProps) {
  const { totals, topRated, recent } = loaderData;

  return (
    <div className="space-y-16">
      <section className="pt-6">
        <p className="text-xs uppercase tracking-[0.3em] text-white/40">Now spinning</p>
        <h1 className="font-display text-6xl md:text-8xl leading-[0.9] mt-4 tracking-tight">
          Every listen,
          <br />
          <span className="italic text-white/60">on the shelf.</span>
        </h1>
      </section>

      <section className="grid grid-cols-3 gap-4">
        <Stat label="Albums" value={totals?.albums ?? 0} />
        <Stat label="Listens" value={totals?.listens ?? 0} />
        <Stat label="Rated" value={totals?.rated ?? 0} />
      </section>

      <section>
        <SectionHeader title="Recent listens" cta={{ label: "See all", to: "/listens" }} />
        <ul className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {recent.slice(0, 8).map((l) => {
            return (
              <li key={l.id}>
                <Link to={`/albums/${l.album_id}`} className="group block">
                  <div className="relative">
                    <AlbumCover
                      title={l.album_title}
                      artist={l.album_artist}
                      palette={l.palette}
                      coverSrc={coverSrcFor({
                        id: l.album_id,
                        cover_url: l.cover_url,
                        has_cover_image: l.has_cover_image
                      })}
                    />
                  </div>
                  <div className="mt-3 flex items-baseline justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{l.album_title}</div>
                      <div className="truncate text-xs text-white/50">{l.album_artist}</div>
                    </div>
                    <div className="text-[10px] text-white/40 shrink-0 tabular-nums">
                      {relativeDate(l.listened_at)}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <SectionHeader title="Top rated" cta={{ label: "Browse albums", to: "/albums" }} />
        <ol className="space-y-3">
          {topRated.map((row, i) => {
            return (
              <li
                key={`${row.title}-${row.artist}`}
                className="flex items-center gap-5 p-3 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition"
              >
                <div className="w-8 text-right font-display text-2xl text-white/30 tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="w-14 h-14 shrink-0">
                  <CoverThumb
                    coverSrc={coverSrcFor(row)}
                    palette={row.palette}
                    className="w-14 h-14 rounded-lg"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{row.title}</div>
                  <div className="text-sm text-white/50 truncate">{row.artist}</div>
                </div>
                <div className="font-display text-3xl tabular-nums">{row.avg.toFixed(1)}</div>
              </li>
            );
          })}
          {topRated.length === 0 ? (
            <li className="text-white/40 text-sm p-6 border border-dashed border-white/10 rounded-xl text-center">
              No ratings yet.
            </li>
          ) : null}
        </ol>
      </section>
    </div>
  );
}

const Stat = ({ label, value }: { label: string; value: number }) => {
  return (
    <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
      <div className="text-xs uppercase tracking-widest text-white/40">{label}</div>
      <div className="font-display text-5xl tabular-nums mt-3">{value}</div>
    </div>
  );
};

const SectionHeader = ({ title, cta }: { title: string; cta?: { label: string; to: string } }) => {
  return (
    <div className="flex items-baseline justify-between mb-5">
      <h2 className="font-display text-3xl">{title}</h2>
      {cta ? (
        <Link to={cta.to} className="text-sm text-white/50 hover:text-white transition">
          {cta.label} →
        </Link>
      ) : null}
    </div>
  );
};

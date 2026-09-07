import { Form, Link, redirect } from "react-router";
import type { Route } from "./+types/albums.new";
import { createAlbum } from "../lib/db.server";

const palettes = [
  { name: "ember", description: "Orange & deep red" },
  { name: "aurora", description: "Cyan, violet & green" },
  { name: "storm", description: "Slate & midnight blue" },
  { name: "citrus", description: "Yellow, orange & pink" },
  { name: "mono", description: "Greyscale" },
  { name: "violet", description: "Purple & indigo" },
  { name: "coast", description: "Cyan & ocean blue" },
  { name: "rust", description: "Amber & dark brown" }
];

export const meta: Route.MetaFunction = () => {
  return [{ title: "New album — Riff" }];
};

export const action = async ({ request }: Route.ActionArgs) => {
  const form = await request.formData();
  const title = String(form.get("title") ?? "").trim();
  const artist = String(form.get("artist") ?? "").trim();
  const yearRaw = form.get("year");
  const genre = String(form.get("genre") ?? "").trim();
  const palette = String(form.get("palette") ?? "ember");
  const notes = String(form.get("notes") ?? "").trim();

  if (!title || !artist) {
    return { error: "Title and artist are required." };
  }

  const id = createAlbum({
    title,
    artist,
    year: yearRaw ? Number(yearRaw) : null,
    genre: genre || null,
    palette,
    notes: notes || null
  });

  return redirect(`/albums/${id}`);
};

export default function NewAlbum({ actionData }: Route.ComponentProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link to="/albums" className="text-sm text-white/50 hover:text-white transition">
          ← Back to albums
        </Link>
        <h1 className="font-display text-5xl mt-3">Add an album</h1>
        <p className="mt-2 text-white/60">A quick entry — just enough to log listens against.</p>
      </div>

      <Form method="post" className="space-y-6">
        <Field label="Title" name="title" required placeholder="Kid A" />
        <Field label="Artist" name="artist" required placeholder="Radiohead" />
        <div className="grid grid-cols-2 gap-6">
          <Field label="Year" name="year" type="number" placeholder="2000" />
          <Field label="Genre" name="genre" placeholder="Art rock" />
        </div>

        <div>
          <label className="text-xs uppercase tracking-widest text-white/40 block mb-3">Cover palette</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {palettes.map(({ name, description }, i) => {
              return (
                <label key={name} className="cursor-pointer" title={name}>
                  <input
                    type="radio"
                    name="palette"
                    value={name}
                    defaultChecked={i === 0}
                    className="peer sr-only"
                  />
                  <div
                    className={`cover palette-${name} aspect-square rounded-lg border-2 border-transparent peer-checked:border-white transition`}
                  />
                  <div className="text-[10px] uppercase tracking-widest text-white/40 text-center mt-1">
                    {name}
                  </div>
                  <div className="text-[10px] text-white/30 text-center leading-tight">
                    {description}
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        <div>
          <label className="text-xs uppercase tracking-widest text-white/40 block mb-2">Notes</label>
          <textarea
            name="notes"
            rows={3}
            placeholder="First impression, a lyric that stuck…"
            className="w-full px-4 py-3 rounded-2xl text-sm bg-white/5 border border-white/10 placeholder:text-white/30 focus:outline-none focus:border-white/25 resize-none"
          />
        </div>

        {actionData?.error ? (
          <p className="text-sm text-red-400">{actionData.error}</p>
        ) : null}

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link to="/albums" className="px-5 py-2 rounded-full text-sm text-white/60 hover:text-white transition">
            Cancel
          </Link>
          <button
            type="submit"
            className="px-6 py-2 rounded-full text-sm text-black bg-white hover:bg-white/90 transition"
          >
            Add to library
          </button>
        </div>
      </Form>
    </div>
  );
}

type FieldProps = {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
  type?: string;
};

const Field = ({ label, name, required, placeholder, type = "text" }: FieldProps) => {
  return (
    <div>
      <label className="text-xs uppercase tracking-widest text-white/40 block mb-2">
        {label} {required ? <span className="text-white/30">*</span> : null}
      </label>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-2xl text-sm bg-white/5 border border-white/10 placeholder:text-white/30 focus:outline-none focus:border-white/25"
      />
    </div>
  );
};

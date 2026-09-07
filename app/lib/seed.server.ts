import type Database from "better-sqlite3";

const palettes = ["ember", "aurora", "storm", "citrus", "mono", "violet", "coast", "rust"];

const albums = [
  { title: "Kid A", artist: "Radiohead", year: 2000, genre: "Art Rock", palette: "storm", notes: "Feels like static from a lighthouse." },
  { title: "Blue", artist: "Joni Mitchell", year: 1971, genre: "Folk", palette: "coast" },
  { title: "In Rainbows", artist: "Radiohead", year: 2007, genre: "Alternative", palette: "aurora" },
  { title: "Discovery", artist: "Daft Punk", year: 2001, genre: "Electronic", palette: "citrus" },
  { title: "Currents", artist: "Tame Impala", year: 2015, genre: "Psych", palette: "violet" },
  { title: "OK Computer", artist: "Radiohead", year: 1997, genre: "Art Rock", palette: "storm" },
  { title: "For Emma, Forever Ago", artist: "Bon Iver", year: 2007, genre: "Indie Folk", palette: "mono" },
  { title: "Illinois", artist: "Sufjan Stevens", year: 2005, genre: "Indie Folk", palette: "aurora" },
  { title: "Hounds of Love", artist: "Kate Bush", year: 1985, genre: "Art Pop", palette: "ember" },
  { title: "Homogenic", artist: "Björk", year: 1997, genre: "Electronic", palette: "violet" },
  { title: "Random Access Memories", artist: "Daft Punk", year: 2013, genre: "Electronic", palette: "rust" },
  { title: "The Suburbs", artist: "Arcade Fire", year: 2010, genre: "Indie", palette: "coast" },
  { title: "Yankee Hotel Foxtrot", artist: "Wilco", year: 2002, genre: "Alt Country", palette: "rust" },
  { title: "Selected Ambient Works 85–92", artist: "Aphex Twin", year: 1992, genre: "Ambient", palette: "mono" },
  { title: "Untrue", artist: "Burial", year: 2007, genre: "Dubstep", palette: "storm" }
];

const notesPool = [
  "Late-night listen with the lights off.",
  "First cup of coffee, sunrise.",
  "Drive north through fog.",
  "Cooking, wide open windows.",
  "Rereading the liner notes.",
  "Cleaning the flat.",
  null,
  null
];

const randomDate = (daysBack: number) => {
  const d = new Date();
  d.setHours(d.getHours() - Math.floor(Math.random() * daysBack * 24));
  return d.toISOString();
};

export const seed = (db: Database.Database) => {
  const insertAlbum = db.prepare(
    `INSERT INTO albums (title, artist, year, genre, palette, notes) VALUES (?, ?, ?, ?, ?, ?)`
  );
  const insertListen = db.prepare(
    `INSERT INTO listens (album_id, listened_at, rating, notes) VALUES (?, ?, ?, ?)`
  );

  const tx = db.transaction(() => {
    for (const a of albums) {
      const info = insertAlbum.run(
        a.title,
        a.artist,
        a.year ?? null,
        a.genre ?? null,
        a.palette ?? palettes[Math.floor(Math.random() * palettes.length)],
        a.notes ?? null
      );
      const id = info.lastInsertRowid as number;
      const listenCount = 1 + Math.floor(Math.random() * 5);
      for (let i = 0; i < listenCount; i += 1) {
        insertListen.run(
          id,
          randomDate(30),
          Math.random() < 0.85 ? 3 + Math.floor(Math.random() * 3) : null,
          Math.random() < 0.5 ? notesPool[Math.floor(Math.random() * notesPool.length)] : null
        );
      }
    }
  });

  tx();
};

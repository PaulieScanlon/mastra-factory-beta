import Database from "better-sqlite3";
import { seed } from "./seed.server";

const dbPath = process.env.RIFF_DB_PATH ?? "./riff.db";
const db = new Database(dbPath);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS albums (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    year INTEGER,
    genre TEXT,
    palette TEXT NOT NULL DEFAULT 'ember',
    notes TEXT,
    spotify_track_id TEXT,
    cover_url TEXT,
    cover_image BLOB,
    cover_image_type TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS listens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    album_id INTEGER NOT NULL,
    listened_at TEXT NOT NULL DEFAULT (datetime('now')),
    rating INTEGER,
    notes TEXT,
    FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE
  );
  CREATE INDEX IF NOT EXISTS idx_listens_album ON listens(album_id);
  CREATE INDEX IF NOT EXISTS idx_listens_when ON listens(listened_at);
`);

const albumCols = db.prepare("PRAGMA table_info(albums)").all() as { name: string }[];
if (!albumCols.some((c) => { return c.name === "spotify_track_id"; })) {
  db.exec("ALTER TABLE albums ADD COLUMN spotify_track_id TEXT");
}
if (!albumCols.some((c) => { return c.name === "cover_url"; })) {
  db.exec("ALTER TABLE albums ADD COLUMN cover_url TEXT");
}
if (!albumCols.some((c) => { return c.name === "cover_image"; })) {
  db.exec("ALTER TABLE albums ADD COLUMN cover_image BLOB");
}
if (!albumCols.some((c) => { return c.name === "cover_image_type"; })) {
  db.exec("ALTER TABLE albums ADD COLUMN cover_image_type TEXT");
}

const albumCount = db.prepare("SELECT COUNT(*) AS n FROM albums").get() as { n: number };
if (albumCount.n === 0) {
  seed(db);
}

export type Album = {
  id: number;
  title: string;
  artist: string;
  year: number | null;
  genre: string | null;
  palette: string;
  notes: string | null;
  spotify_track_id: string | null;
  cover_url: string | null;
  has_cover_image: 0 | 1;
  created_at: string;
};

// Every row-shaped album select enumerates columns so the cover_image BLOB
// never rides along on list/detail queries.
const albumSelect = `a.id, a.title, a.artist, a.year, a.genre, a.palette, a.notes,
       a.spotify_track_id, a.cover_url,
       (a.cover_image IS NOT NULL) AS has_cover_image, a.created_at`;

export type Listen = {
  id: number;
  album_id: number;
  listened_at: string;
  rating: number | null;
  notes: string | null;
};

export type AlbumWithStats = Album & {
  listen_count: number;
  avg_rating: number | null;
  last_listened: string | null;
};

export const getAlbumRow = (id: number) => {
  return db.prepare<[number], Album>(
    `SELECT ${albumSelect} FROM albums a WHERE a.id = ?`
  ).get(id);
};

export const listAlbums = () => {
  return db
    .prepare<[], AlbumWithStats>(
      `SELECT ${albumSelect},
              COUNT(l.id) AS listen_count,
              AVG(l.rating) AS avg_rating,
              MAX(l.listened_at) AS last_listened
         FROM albums a
         LEFT JOIN listens l ON l.album_id = a.id
        GROUP BY a.id
        ORDER BY a.created_at DESC`
    )
    .all();
};

export const getAlbum = (id: number) => {
  return db.prepare<[number], AlbumWithStats>(
    `SELECT ${albumSelect},
            COUNT(l.id) AS listen_count,
            AVG(l.rating) AS avg_rating,
            MAX(l.listened_at) AS last_listened
       FROM albums a
       LEFT JOIN listens l ON l.album_id = a.id
      WHERE a.id = ?
      GROUP BY a.id`
  ).get(id);
};

export const getAlbumCoverImage = (id: number) => {
  return db.prepare<[number], { cover_image: Buffer | null; cover_image_type: string | null }>(
    `SELECT cover_image, cover_image_type FROM albums WHERE id = ?`
  ).get(id);
};

export const listListensForAlbum = (albumId: number) => {
  return db.prepare<[number], Listen>(
    `SELECT * FROM listens WHERE album_id = ? ORDER BY listened_at DESC`
  ).all(albumId);
};

export type ListenWithAlbum = Listen & {
  album_title: string;
  album_artist: string;
  palette: string;
  cover_url: string | null;
  has_cover_image: 0 | 1;
};

export const listRecentListens = (limit: number = 30) => {
  return db.prepare<[number], ListenWithAlbum>(
    `SELECT l.*, a.title AS album_title, a.artist AS album_artist, a.palette,
            a.cover_url, (a.cover_image IS NOT NULL) AS has_cover_image
       FROM listens l
       JOIN albums a ON a.id = l.album_id
      ORDER BY l.listened_at DESC
      LIMIT ?`
  ).all(limit);
};

export const createAlbum = (input: {
  title: string;
  artist: string;
  year?: number | null;
  genre?: string | null;
  palette?: string;
  notes?: string | null;
  cover_url?: string | null;
  cover_image?: Buffer | null;
  cover_image_type?: string | null;
}) => {
  const result = db
    .prepare(
      `INSERT INTO albums (title, artist, year, genre, palette, notes, cover_url, cover_image, cover_image_type)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      input.title,
      input.artist,
      input.year ?? null,
      input.genre ?? null,
      input.palette ?? "ember",
      input.notes ?? null,
      input.cover_url ?? null,
      input.cover_image ?? null,
      input.cover_image_type ?? null
    );
  return result.lastInsertRowid as number;
};

export const setAlbumCover = (
  id: number,
  cover: { cover_url: string | null; cover_image: Buffer | null; cover_image_type: string | null }
) => {
  db.prepare(
    `UPDATE albums SET cover_url = ?, cover_image = ?, cover_image_type = ? WHERE id = ?`
  ).run(cover.cover_url, cover.cover_image, cover.cover_image_type, id);
};

export const clearAlbumCover = (id: number) => {
  db.prepare(
    `UPDATE albums SET cover_url = NULL, cover_image = NULL, cover_image_type = NULL WHERE id = ?`
  ).run(id);
};

export const createListen = (input: {
  album_id: number;
  rating?: number | null;
  notes?: string | null;
}) => {
  const result = db
    .prepare(
      `INSERT INTO listens (album_id, rating, notes) VALUES (?, ?, ?)`
    )
    .run(input.album_id, input.rating ?? null, input.notes ?? null);
  return result.lastInsertRowid as number;
};

export const deleteAlbum = (id: number) => {
  db.prepare("DELETE FROM albums WHERE id = ?").run(id);
};

export const setSpotifyTrackId = (albumId: number, trackId: string | null) => {
  db.prepare("UPDATE albums SET spotify_track_id = ? WHERE id = ?").run(trackId, albumId);
};

export const stats = () => {
  const totals = db.prepare<[], { albums: number; listens: number; rated: number }>(
    `SELECT
       (SELECT COUNT(*) FROM albums) AS albums,
       (SELECT COUNT(*) FROM listens) AS listens,
       (SELECT COUNT(*) FROM listens WHERE rating IS NOT NULL) AS rated`
  ).get();
  const topRated = db.prepare<[], {
    id: number;
    title: string;
    artist: string;
    palette: string;
    cover_url: string | null;
    has_cover_image: 0 | 1;
    avg: number;
  }>(
    `SELECT a.id, a.title, a.artist, a.palette, a.cover_url,
            (a.cover_image IS NOT NULL) AS has_cover_image, AVG(l.rating) AS avg
       FROM albums a
       JOIN listens l ON l.album_id = a.id
      WHERE l.rating IS NOT NULL
      GROUP BY a.id
     HAVING COUNT(l.id) >= 1
      ORDER BY avg DESC
      LIMIT 5`
  ).all();
  return { totals, topRated };
};

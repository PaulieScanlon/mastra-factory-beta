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
  created_at: string;
};

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
  return db.prepare<[number], Album>(`SELECT * FROM albums WHERE id = ?`).get(id);
};

export const listAlbums = () => {
  return db
    .prepare<[], AlbumWithStats>(
      `SELECT a.*,
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
    `SELECT a.*,
            COUNT(l.id) AS listen_count,
            AVG(l.rating) AS avg_rating,
            MAX(l.listened_at) AS last_listened
       FROM albums a
       LEFT JOIN listens l ON l.album_id = a.id
      WHERE a.id = ?
      GROUP BY a.id`
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
};

export const listRecentListens = (limit: number = 30) => {
  return db.prepare<[number], ListenWithAlbum>(
    `SELECT l.*, a.title AS album_title, a.artist AS album_artist, a.palette
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
}) => {
  const result = db
    .prepare(
      `INSERT INTO albums (title, artist, year, genre, palette, notes)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(
      input.title,
      input.artist,
      input.year ?? null,
      input.genre ?? null,
      input.palette ?? "ember",
      input.notes ?? null
    );
  return result.lastInsertRowid as number;
};

export const updateAlbum = (
  id: number,
  input: {
    title: string;
    artist: string;
    year?: number | null;
    genre?: string | null;
    palette?: string;
    notes?: string | null;
  }
) => {
  const existing = getAlbumRow(id);
  const clearSpotify =
    existing && (existing.title !== input.title || existing.artist !== input.artist);
  db.prepare(
    `UPDATE albums
        SET title = ?, artist = ?, year = ?, genre = ?, palette = ?, notes = ?,
            spotify_track_id = CASE WHEN ? THEN NULL ELSE spotify_track_id END
      WHERE id = ?`
  ).run(
    input.title,
    input.artist,
    input.year ?? null,
    input.genre ?? null,
    input.palette ?? "ember",
    input.notes ?? null,
    clearSpotify ? 1 : 0,
    id
  );
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
  const topRated = db.prepare<[], { title: string; artist: string; palette: string; avg: number }>(
    `SELECT a.title, a.artist, a.palette, AVG(l.rating) AS avg
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

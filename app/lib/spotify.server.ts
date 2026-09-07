type TokenCache = {
  token: string;
  expiresAt: number;
};

let cache: TokenCache | null = null;

const getToken = async (): Promise<string | null> => {
  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!id || !secret) {
    return null;
  }
  if (cache && cache.expiresAt > Date.now() + 30_000) {
    return cache.token;
  }
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`
    },
    body: "grant_type=client_credentials"
  });
  if (!res.ok) {
    console.error("[spotify] token fetch failed:", res.status, await res.text());
    return null;
  }
  const data = (await res.json()) as { access_token: string; expires_in: number };
  cache = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000
  };
  return cache.token;
};

const runSearch = async (token: string, query: string): Promise<string | null> => {
  const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    console.error("[spotify] search failed:", res.status, await res.text());
    return null;
  }
  const data = (await res.json()) as { tracks: { items: { id: string }[] } };
  return data.tracks.items[0]?.id ?? null;
};

export const searchTrack = async (title: string, artist: string): Promise<string | null> => {
  const token = await getToken();
  if (!token) {
    return null;
  }
  const attempts = [
    `album:"${title}" artist:"${artist}"`,
    `album:${title} artist:${artist}`,
    `${title} ${artist}`,
    title
  ];
  for (const q of attempts) {
    const id = await runSearch(token, q);
    if (id) {
      return id;
    }
  }
  return null;
};

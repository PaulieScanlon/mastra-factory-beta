import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("albums", "routes/albums.tsx"),
  route("albums/new", "routes/albums.new.tsx"),
  route("albums/:id", "routes/album.tsx"),
  route("albums/:id/cover", "routes/album-cover.ts"),
  route("listens", "routes/listens.tsx")
] satisfies RouteConfig;

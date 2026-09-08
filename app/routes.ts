import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("albums", "routes/albums.tsx"),
  route("albums/new", "routes/albums.new.tsx"),
  route("albums/:id/edit", "routes/albums.edit.tsx"),
  route("albums/:id", "routes/album.tsx"),
  route("listens", "routes/listens.tsx")
] satisfies RouteConfig;

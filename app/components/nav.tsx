import { NavLink } from "react-router";

const items = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/albums", label: "Albums" },
  { to: "/listens", label: "Listens" }
];

export const Nav = () => {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-[rgba(5,5,10,0.6)] border-b border-white/5">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-full cover palette-aurora flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-black" />
          </div>
          <span className="font-display text-2xl tracking-tight">Riff</span>
        </NavLink>
        <nav className="flex items-center gap-1">
          {items.map((item) => {
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => {
                  return `px-4 py-2 rounded-full text-sm transition ${
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-white/50 hover:text-white hover:bg-white/5"
                  }`;
                }}
              >
                {item.label}
              </NavLink>
            );
          })}
          <NavLink
            to="/albums/new"
            className="ml-2 px-4 py-2 rounded-full text-sm text-black bg-white hover:bg-white/90 transition"
          >
            + New
          </NavLink>
        </nav>
      </div>
    </header>
  );
};

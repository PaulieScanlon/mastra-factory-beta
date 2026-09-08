import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router";

const items = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/albums", label: "Albums" },
  { to: "/listens", label: "Listens" }
];

const linkClassName = ({ isActive }: { isActive: boolean }) => {
  return `px-4 py-2 rounded-full text-sm transition ${
    isActive
      ? "bg-white/10 text-white"
      : "text-white/50 hover:text-white hover:bg-white/5"
  }`;
};

const mobileLinkClassName = ({ isActive }: { isActive: boolean }) => {
  return `block px-4 py-3 rounded-xl text-sm transition ${
    isActive
      ? "bg-white/10 text-white"
      : "text-white/50 hover:text-white hover:bg-white/5"
  }`;
};

export const Nav = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-[rgba(5,5,10,0.6)] border-b border-white/5">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-full cover palette-aurora flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-black" />
          </div>
          <span className="font-display text-2xl tracking-tight">Riff</span>
        </NavLink>
        <nav className="hidden sm:flex items-center gap-1">
          {items.map((item) => {
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={linkClassName}
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
        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen(!open)}
          className="sm:hidden p-2 rounded-full text-white/50 hover:text-white hover:bg-white/5 transition"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            aria-hidden="true"
          >
            {open ? (
              <>
                <line x1="4" y1="4" x2="16" y2="16" />
                <line x1="16" y1="4" x2="4" y2="16" />
              </>
            ) : (
              <>
                <line x1="3" y1="5" x2="17" y2="5" />
                <line x1="3" y1="10" x2="17" y2="10" />
                <line x1="3" y1="15" x2="17" y2="15" />
              </>
            )}
          </svg>
        </button>
      </div>
      {open ? (
        <nav id="mobile-nav" className="sm:hidden flex flex-col gap-1 px-6 pb-4">
          {items.map((item) => {
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={mobileLinkClassName}
              >
                {item.label}
              </NavLink>
            );
          })}
          <NavLink
            to="/albums/new"
            className="block px-4 py-3 rounded-xl text-sm text-black bg-white hover:bg-white/90 transition"
          >
            + New
          </NavLink>
        </nav>
      ) : null}
    </header>
  );
};

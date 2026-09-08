type Props = {
  title: string;
  artist: string;
  palette: string;
  size?: "sm" | "md" | "lg";
};

const sizeMap = {
  sm: "w-16 h-16 text-[10px] p-2",
  md: "w-full aspect-square text-lg p-5 sm:p-4",
  lg: "w-full aspect-square text-2xl p-6"
};

export const AlbumCover = ({ title, artist, palette, size = "md" }: Props) => {
  const initials = title
    .split(" ")
    .filter((word) => {
      return word.length > 0;
    })
    .slice(0, 3)
    .map((word) => {
      return word[0];
    })
    .join("");

  return (
    <div className={`cover palette-${palette} ${sizeMap[size]} rounded-xl relative flex flex-col justify-between text-white/90 shadow-2xl shadow-black/50`}>
      <div className="font-display leading-none tracking-tight uppercase opacity-90">{initials}</div>
      {size !== "sm" ? (
        <div>
          <div className="font-display text-white leading-tight line-clamp-2">{title}</div>
          <div className="text-xs uppercase tracking-widest opacity-70 mt-1 truncate">{artist}</div>
        </div>
      ) : null}
      <span className="cover-shine" />
    </div>
  );
};

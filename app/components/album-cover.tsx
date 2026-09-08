import { useEffect, useState } from "react";

type Props = {
  title: string;
  artist: string;
  palette: string;
  coverSrc?: string | null;
  size?: "sm" | "md" | "lg";
};

const sizeMap = {
  sm: "w-16 h-16 text-[10px] p-2",
  md: "w-full aspect-square text-lg p-4",
  lg: "w-full aspect-square text-2xl p-6"
};

const imageSizeMap = {
  sm: "w-16 h-16",
  md: "w-full aspect-square",
  lg: "w-full aspect-square"
};

export const coverSrcFor = (album: {
  id: number;
  cover_url: string | null;
  has_cover_image: 0 | 1;
}) => {
  if (album.has_cover_image) {
    return `/albums/${album.id}/cover`;
  }
  return album.cover_url;
};

export const CoverThumb = ({
  coverSrc,
  palette,
  className
}: {
  coverSrc: string | null;
  palette: string;
  className: string;
}) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [coverSrc]);

  if (coverSrc && !failed) {
    return (
      <img
        src={coverSrc}
        alt=""
        className={`${className} object-cover`}
        onError={() => {
          setFailed(true);
        }}
      />
    );
  }
  return <div className={`cover palette-${palette} ${className}`} />;
};

export const AlbumCover = ({ title, artist, palette, coverSrc, size = "md" }: Props) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [coverSrc]);

  if (coverSrc && !failed) {
    return (
      <div className={`${imageSizeMap[size]} rounded-xl relative overflow-hidden shadow-2xl shadow-black/50`}>
        <img
          src={coverSrc}
          alt={`${title} by ${artist}`}
          className="absolute inset-0 w-full h-full object-cover"
          onError={() => {
            setFailed(true);
          }}
        />
        <span className="cover-shine" />
      </div>
    );
  }

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

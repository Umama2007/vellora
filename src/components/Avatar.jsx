import { getImageUrl } from "../utils/imageUrl";

export default function Avatar({ src, alt, size = 40, online, className = "" }) {
  const initials = (alt || "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className={`relative shrink-0 ${className}`} style={{ width: size, height: size }}>
      {src ? (
        <img
          src={getImageUrl(src, "c_fill,w_150,q_auto")}
          alt={alt}
          width={size}
          height={size}
          className="rounded-full object-cover w-full h-full border border-plum-100/60"
        />
      ) : (
        <div
          className="rounded-full w-full h-full border border-plum-100/60 bg-plum-100 text-plum flex items-center justify-center font-medium"
          style={{ fontSize: size * 0.38 }}
          aria-label={alt}
        >
          {initials}
        </div>
      )}
      {online !== undefined && (
        <span
          className={`absolute bottom-0 right-0 rounded-full border-2 border-surface ${
            online ? "bg-emerald-400" : "bg-ink-faint"
          }`}
          style={{ width: size * 0.28, height: size * 0.28 }}
        />
      )}
    </div>
  );
}

import { BRAND } from "../data/brand";

/**
 * Vellora Logo component rendering the official uploaded brand mark & logo image.
 * - `variant="default"` for light backgrounds (Primary Deep Plum logo image)
 * - `variant="light"` for dark backgrounds (Light logo image)
 * - `iconOnly={true}` for icon-only contexts (standalone mark)
 */
export default function Logo({ variant = "default", iconOnly = false, size = "lg", className = "" }) {
  const isLight = variant === "light";

  // Unified size map so every page receives the exact same prominent logo scale
  const heights = {
    sm: "h-10 sm:h-12",
    md: "h-14 sm:h-16",
    lg: "h-14 sm:h-16",
    xl: "h-18 sm:h-22",
  };

  const hClass = heights[size] || heights.lg;

  if (iconOnly) {
    return (
      <div className={`inline-flex items-center select-none ${className}`}>
        <img
          src={BRAND.icon}
          alt="Vellora"
          className={`${hClass} w-auto object-contain shrink-0`}
        />
      </div>
    );
  }

  const logoSrc = isLight ? BRAND.logoLight : BRAND.logoPrimary;

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <img
        src={logoSrc}
        alt="Vellora"
        className={`${hClass} w-auto object-contain shrink-0`}
      />
    </div>
  );
}

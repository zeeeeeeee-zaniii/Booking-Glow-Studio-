/**
 * Hand-drawn SVG illustration for the hero: an arched vanity mirror
 * with glowing bulbs, a plant and sparkle accents. All fills use the
 * theme CSS variables, so the artwork re-skins with the site.
 */
export default function HeroArt() {
  return (
    <svg className="hero-art" viewBox="0 0 480 400" role="img" aria-label="Illustration of a beauty studio vanity mirror">
      {/* soft backdrop arch */}
      <path d="M70 400 V190 a170 170 0 0 1 340 0 V400 Z" fill="var(--accent)" opacity="0.28" />
      <path d="M100 400 V200 a140 140 0 0 1 280 0 V400 Z" fill="var(--primary-dark)" opacity="0.35" />

      {/* mirror */}
      <path d="M150 400 V205 a90 90 0 0 1 180 0 V400 Z" fill="var(--bg)" opacity="0.14" />
      <path d="M150 400 V205 a90 90 0 0 1 180 0 V400 Z" fill="none" stroke="var(--accent-2)" strokeWidth="5" />
      {/* mirror shine */}
      <path d="M185 190 L235 130" stroke="var(--hero-text)" strokeWidth="7" strokeLinecap="round" opacity="0.35" />
      <path d="M205 215 L260 150" stroke="var(--hero-text)" strokeWidth="5" strokeLinecap="round" opacity="0.22" />

      {/* bulbs */}
      {[
        [150, 235], [150, 300], [150, 365],
        [330, 235], [330, 300], [330, 365],
        [195, 148], [240, 128], [285, 148],
      ].map(([cx, cy], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r="13" fill="var(--accent-2)" opacity="0.35" />
          <circle cx={cx} cy={cy} r="6.5" fill="var(--accent-2)" />
        </g>
      ))}

      {/* vanity table */}
      <rect x="118" y="368" width="244" height="10" rx="5" fill="var(--accent-2)" />
      <rect x="140" y="378" width="8" height="22" fill="var(--accent-2)" opacity="0.8" />
      <rect x="332" y="378" width="8" height="22" fill="var(--accent-2)" opacity="0.8" />

      {/* bottles on the table */}
      <rect x="176" y="336" width="16" height="32" rx="4" fill="var(--accent)" />
      <rect x="181" y="326" width="6" height="10" fill="var(--accent)" />
      <rect x="288" y="342" width="13" height="26" rx="4" fill="var(--hero-text)" opacity="0.75" />
      <circle cx="240" cy="352" r="13" fill="var(--accent)" />
      <circle cx="240" cy="352" r="6" fill="var(--accent-2)" />

      {/* plant */}
      <path d="M84 400 v-38" stroke="var(--accent)" strokeWidth="5" strokeLinecap="round" />
      <path d="M84 366 C60 356 54 336 56 322 C74 326 86 342 84 366Z" fill="var(--accent)" />
      <path d="M84 358 C104 346 108 328 104 314 C88 320 78 338 84 358Z" fill="var(--accent-2)" />
      <path d="M70 400 h28 l-4 -16 h-20 Z" fill="var(--accent-2)" />

      {/* sparkles */}
      {[
        [66, 120, 1], [404, 96, 1.3], [428, 210, 0.8], [44, 226, 0.7], [392, 300, 0.9],
      ].map(([x, y, s], i) => (
        <path
          key={i}
          d={`M${x} ${y - 12 * s} L${x + 3.5 * s} ${y - 3.5 * s} L${x + 12 * s} ${y} L${x + 3.5 * s} ${y + 3.5 * s} L${x} ${y + 12 * s} L${x - 3.5 * s} ${y + 3.5 * s} L${x - 12 * s} ${y} L${x - 3.5 * s} ${y - 3.5 * s} Z`}
          fill="var(--accent-2)"
          opacity="0.9"
        />
      ))}
    </svg>
  );
}

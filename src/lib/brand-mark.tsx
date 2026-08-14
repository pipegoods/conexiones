type BrandHeartProps = {
  size: number;
};

/** Split-heart symbol used in favicons and social preview images. */
export function BrandHeart({ size }: BrandHeartProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32">
      <defs>
        <linearGradient id="brand-left" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#ec2d8a" />
          <stop offset="100%" stopColor="#f9639f" />
        </linearGradient>
        <linearGradient id="brand-right" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#22c7d6" />
        </linearGradient>
      </defs>
      <path
        d="M16 28 C 16 28, 2 19.5, 2 10.5 A 7.5 7.5 0 0 1 16 6.5 L 16 28 Z"
        fill="url(#brand-left)"
        transform="translate(-0.9 0)"
      />
      <path
        d="M16 28 L 16 6.5 A 7.5 7.5 0 0 1 30 10.5 C 30 19.5, 16 28, 16 28 Z"
        fill="url(#brand-right)"
        transform="translate(0.9 0)"
      />
    </svg>
  );
}

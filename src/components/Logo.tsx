type Props = {
  className?: string;
  /** Shows the name and tagline next to the symbol. */
  showText?: boolean;
  /** Footer treatment on a light background with gray text. */
  tone?: 'dark' | 'light';
};

/**
 * The symbol is two halves of one heart separated by air: two parts that work
 * only when joined. Each half carries a different segment of the brand gradient.
 */
export function Logo({ className = '', showText = true, tone = 'dark' }: Props) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        viewBox="0 0 32 32"
        className="h-9 w-9 shrink-0"
        role="img"
        aria-label="Conexiones"
      >
        <defs>
          <linearGradient id="logo-izq" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--color-marca-rosa)" />
            <stop offset="100%" stopColor="var(--color-marca-rosa-claro)" />
          </linearGradient>
          <linearGradient id="logo-der" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--color-marca-morado)" />
            <stop offset="100%" stopColor="var(--color-marca-cian)" />
          </linearGradient>
        </defs>
        <path
          d="M16 28 C 16 28, 2 19.5, 2 10.5 A 7.5 7.5 0 0 1 16 6.5 L 16 28 Z"
          fill="url(#logo-izq)"
          transform="translate(-0.9 0)"
        />
        <path
          d="M16 28 L 16 6.5 A 7.5 7.5 0 0 1 30 10.5 C 30 19.5, 16 28, 16 28 Z"
          fill="url(#logo-der)"
          transform="translate(0.9 0)"
        />
      </svg>

      {showText && (
        <span className="flex flex-col leading-none">
          <span
            className={`text-[1.35rem] font-extrabold tracking-tight ${
              tone === 'dark' ? 'text-tinta' : 'text-neutral-800'
            }`}
          >
            Conexiones
          </span>
          <span className="mt-0.5 text-[0.7rem] font-medium text-neutral-500">
            Conectamos para ayudar
          </span>
        </span>
      )}
    </span>
  );
}

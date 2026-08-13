export function WaveBackground() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 overflow-hidden opacity-80">
      <svg viewBox="0 0 480 200" preserveAspectRatio="none" className="h-full w-full">
        <defs>
          <linearGradient id="wave-grad-1" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#2563EB" stopOpacity="0.55" />
            <stop offset="1" stopColor="#22C55E" stopOpacity="0.55" />
          </linearGradient>
          <linearGradient id="wave-grad-2" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#1D4ED8" stopOpacity="0.35" />
            <stop offset="1" stopColor="#16A34A" stopOpacity="0.35" />
          </linearGradient>
        </defs>
        <path
          d="M0,120 C80,160 160,80 240,110 C320,140 400,90 480,120 L480,200 L0,200 Z"
          fill="url(#wave-grad-2)"
        />
        <path
          d="M0,140 C90,100 170,170 260,140 C340,115 410,150 480,130 L480,200 L0,200 Z"
          fill="url(#wave-grad-1)"
        />
        {Array.from({ length: 24 }).map((_, i) => (
          <circle
            key={i}
            cx={(i * 137) % 480}
            cy={60 + ((i * 53) % 110)}
            r={i % 3 === 0 ? 1.6 : 1}
            fill={i % 2 === 0 ? '#60A5FA' : '#4ADE80'}
            opacity={0.5}
          />
        ))}
      </svg>
    </div>
  )
}

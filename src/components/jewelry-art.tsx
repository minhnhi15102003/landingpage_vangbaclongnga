type JewelryShape = "ring" | "earrings" | "necklace" | "bracelet";

export default function JewelryArt({ shape, id }: { shape: JewelryShape; id: string }) {
  const metal = `url(#${id}-metal)`;
  const diamond = `url(#${id}-diamond)`;
  const shadow = `url(#${id}-shadow)`;

  return (
    <svg className={`jewelry-art art-${shape}`} viewBox="0 0 320 320" fill="none" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}-metal`} x1="70" y1="85" x2="235" y2="250" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff0bc" /><stop offset=".18" stopColor="#b17c32" /><stop offset=".36" stopColor="#f4d789" /><stop offset=".55" stopColor="#9c6326" /><stop offset=".75" stopColor="#ffe6a3" /><stop offset="1" stopColor="#a56d2d" />
        </linearGradient>
        <linearGradient id={`${id}-diamond`} x1="-18" y1="-20" x2="19" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fffdf5" /><stop offset=".35" stopColor="#b2d1cf" /><stop offset=".52" stopColor="#fff" /><stop offset="1" stopColor="#99b7be" />
        </linearGradient>
        <filter id={`${id}-shadow`} x="-50%" y="-50%" width="200%" height="220%">
          <feDropShadow dx="0" dy="12" stdDeviation="9" floodColor="#3b160b" floodOpacity=".25" />
        </filter>
      </defs>

      {shape === "ring" && (
        <g filter={shadow}>
          <ellipse cx="154" cy="184" rx="89" ry="59" transform="rotate(-28 154 184)" stroke={metal} strokeWidth="23" />
          <ellipse cx="154" cy="184" rx="78" ry="48" transform="rotate(-28 154 184)" stroke="#ffecb3" strokeOpacity=".6" strokeWidth="1.5" />
          <g transform="translate(187 122) rotate(-15)">
            <path d="M-23 0 0-24 23 0 0 25Z" fill={metal} />
            <path d="M-17 0 0-18 17 0 0 19Z" fill={diamond} />
            <path d="M-17 0H17M0-18 7 0 0 19-7 0Z" stroke="#fff" strokeOpacity=".8" strokeWidth="1" />
            <path d="m-21-2 5 2m16-22v6m22 14-6 2M0 22v-6" stroke="#fae2a0" strokeWidth="3" strokeLinecap="round" />
          </g>
        </g>
      )}

      {shape === "earrings" && (
        <g filter={shadow}>
          {[{ x: 112, y: 149, angle: 12 }, { x: 211, y: 168, angle: -12 }].map((earring, index) => (
            <g key={index} transform={`translate(${earring.x} ${earring.y}) rotate(${earring.angle})`}>
              <circle cy="-66" r="9" fill={metal} /><circle cy="-66" r="5" fill="#fff3d3" />
              <path d="M0-52C-51-24-39 58 0 63 39 58 51-24 0-52Z" stroke={metal} strokeWidth="10" />
              <path d="M0-44C-37-17-29 48 0 54" stroke="#ffe8ac" strokeOpacity=".7" strokeWidth="1.5" />
              <g transform="translate(0 37)"><path d="M-13 0 0-17 13 0 0 18Z" fill={metal} /><path d="m-8 0 8-11 8 11-8 12Z" fill={diamond} /></g>
            </g>
          ))}
        </g>
      )}

      {shape === "necklace" && (
        <g filter={shadow}>
          <path d="M95 47C35 119 65 211 160 241 255 211 285 119 225 47" stroke={metal} strokeWidth="5" strokeLinecap="round" />
          <path d="M96 47C40 119 69 206 160 236 251 206 280 119 224 47" stroke="#f6df9a" strokeWidth="1" strokeDasharray="2 5" />
          <circle cx="160" cy="239" r="6" stroke={metal} strokeWidth="4" />
          <g transform="translate(160 263)"><path d="M-24 0 0-29 24 0 0 32Z" fill={metal} /><path d="M-17 0 0-20 17 0 0 23Z" fill={diamond} /><path d="M-17 0H17M0-20V23" stroke="#fff" strokeOpacity=".65" /></g>
        </g>
      )}

      {shape === "bracelet" && (
        <g filter={shadow} transform="rotate(-25 160 170)">
          <ellipse cx="160" cy="170" rx="106" ry="71" stroke={metal} strokeWidth="22" />
          <ellipse cx="160" cy="170" rx="96" ry="62" stroke="#fff0bd" strokeOpacity=".65" strokeWidth="2" />
          <ellipse cx="160" cy="170" rx="106" ry="71" stroke="#fff2cc" strokeWidth="4" strokeDasharray="1 13" strokeLinecap="round" />
          <circle cx="256" cy="201" r="14" fill={metal} /><circle cx="256" cy="201" r="9" fill="#ead8ae" /><path d="m252 201 4-5 4 5-4 5Z" fill="#fff6de" />
        </g>
      )}
    </svg>
  );
}

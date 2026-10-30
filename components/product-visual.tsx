const sand = "#E6D9C8";
const sage = "#C9D3C6";
const blush = "#E6D2CB";
const stone = "#D9D3CB";
const ink = "#8A8178";
const paper = "#FBF8F4";
const wood = "#CDB89A";

export function ProductVisual({
  src,
  name,
}: {
  src: string;
  name: string;
}) {
  if (src.startsWith("icon:")) {
    return (
      <svg viewBox="0 0 160 160" className="h-full w-full" role="img" aria-label={name}>
        <SoftIcon kind={src.slice(5)} />
      </svg>
    );
  }

  return (
    // Photos come from our own uploads or Vercel Blob, not a third-party hotlink.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={name} className="h-full w-full object-contain" />
  );
}

function SoftIcon({ kind }: { kind: string }) {
  switch (kind) {
    case "bottles":
      return (
        <>
          <Bottle x={46} />
          <Bottle x={78} />
        </>
      );
    case "brush":
      return (
        <>
          <ellipse cx="80" cy="118" rx="28" ry="6" fill={sand} />
          <rect x="74" y="58" width="12" height="52" rx="6" fill={wood} />
          <circle cx="80" cy="46" r="18" fill={blush} />
          <path d="M68 40h24M70 48h20M72 56h16" stroke={ink} strokeWidth="1.4" />
        </>
      );
    case "rack":
      return (
        <>
          <rect x="36" y="78" width="88" height="10" rx="3" fill={stone} />
          <rect x="42" y="88" width="76" height="8" rx="2" fill={sand} />
          {Array.from({ length: 7 }, (_, index) => (
            <rect key={index} x={46 + index * 10} y="48" width="4" height="32" rx="2" fill={sage} />
          ))}
        </>
      );
    case "burp":
      return (
        <>
          <Folded y={58} fill={sage} />
          <Folded y={78} fill={paper} />
          <Folded y={98} fill={blush} />
        </>
      );
    case "bibs":
      return (
        <>
          <Bib x={52} fill={sage} />
          <Bib x={90} fill={blush} />
        </>
      );
    case "pillow":
      return <path d="M28 96c18-46 86-46 104 0-28 18-76 18-104 0z" fill={sand} stroke={ink} />;
    case "bassinet":
      return (
        <>
          <path d="M36 70h88l-8 36H44z" fill={sand} stroke={ink} />
          <path d="M48 70c6-24 58-24 64 0" fill={paper} stroke={ink} />
          <path d="M40 118h80" stroke={wood} strokeWidth="4" />
        </>
      );
    case "mattress":
      return <rect x="36" y="48" width="88" height="64" rx="8" fill={paper} stroke={ink} />;
    case "sheets":
      return (
        <>
          <Folded y={54} fill={paper} />
          <Folded y={76} fill={sage} />
          <Folded y={98} fill={sand} />
        </>
      );
    case "swaddles":
      return <path d="M48 42h64l-8 76H56z" fill={sage} stroke={ink} />;
    case "sacks":
      return (
        <>
          <path d="M58 40h18l4 18h-26z" fill={blush} stroke={ink} />
          <path d="M50 58h60l-8 58H58z" fill={paper} stroke={ink} />
        </>
      );
    case "sound":
      return (
        <>
          <ellipse cx="80" cy="96" rx="28" ry="16" fill={sand} stroke={ink} />
          <path d="M80 80c18 0 26-16 26-28" stroke={sage} strokeWidth="6" fill="none" />
        </>
      );
    case "monitor":
      return (
        <>
          <rect x="46" y="48" width="68" height="48" rx="8" fill={stone} stroke={ink} />
          <circle cx="80" cy="72" r="10" fill={paper} />
          <rect x="70" y="100" width="20" height="16" rx="4" fill={sand} />
        </>
      );
    case "diapers":
      return (
        <>
          <rect x="58" y="46" width="44" height="28" rx="6" fill={paper} stroke={ink} />
          <rect x="52" y="72" width="56" height="28" rx="6" fill={sage} stroke={ink} />
          <rect x="48" y="98" width="64" height="22" rx="6" fill={blush} stroke={ink} />
        </>
      );
    case "wipes":
      return (
        <>
          <rect x="48" y="58" width="64" height="46" rx="8" fill={paper} stroke={ink} />
          <path d="M70 58c4 16 16 16 20 0" fill={sage} />
        </>
      );
    case "cream":
      return (
        <>
          <rect x="62" y="40" width="36" height="14" rx="4" fill={stone} />
          <rect x="56" y="54" width="48" height="58" rx="16" fill={paper} stroke={ink} />
        </>
      );
    case "spatula":
      return <path d="M96 36c18 18-6 48-28 70-8 8-20 6-16-8 10-24 28-42 44-62z" fill={sand} stroke={ink} />;
    case "pad":
      return <rect x="34" y="62" width="92" height="40" rx="18" fill={sand} stroke={ink} />;
    case "caddy":
      return (
        <>
          <path d="M48 70h64l-6 42H54z" fill={wood} stroke={ink} />
          <path d="M58 70c0-16 44-16 44 0" fill="none" stroke={ink} />
        </>
      );
    case "pail":
      return (
        <>
          <rect x="58" y="48" width="44" height="12" rx="4" fill={stone} />
          <rect x="52" y="60" width="56" height="52" rx="10" fill={paper} stroke={ink} />
        </>
      );
    case "onesies":
      return <path d="M48 48l14-10h36l14 10-8 14H56zM58 62h44v46H58z" fill={paper} stroke={ink} />;
    case "sleepers":
      return <path d="M62 36h36l8 18v62H54V54z" fill={sage} stroke={ink} />;
    case "socks":
      return (
        <>
          <path d="M58 48h16v34c0 14-20 16-24 4" fill={blush} stroke={ink} />
          <path d="M86 48h16v34c0 14-20 16-24 4" fill={paper} stroke={ink} />
        </>
      );
    case "hats":
      return (
        <>
          <path d="M58 78c0-24 44-24 44 0l6 18H52z" fill={sage} stroke={ink} />
          <path d="M46 96h68" stroke={ink} />
        </>
      );
    case "mittens":
      return <path d="M64 46h28v28c8 4 12 16 4 24-12 12-36 8-40-8-6-10 0-20 8-22z" fill={paper} stroke={ink} />;
    case "washcloths":
      return (
        <>
          <rect x="48" y="48" width="40" height="52" rx="4" fill={paper} stroke={ink} />
          <rect x="72" y="60" width="40" height="52" rx="4" fill={sage} stroke={ink} />
        </>
      );
    case "towel":
      return (
        <>
          <path d="M70 36c16 8 24 8 28 0 8 10 6 22-4 24v52H62V58c-8-2-12-14-4-22 6 6 12 8 12 0z" fill={sand} stroke={ink} />
        </>
      );
    case "soap":
      return (
        <>
          <rect x="58" y="36" width="28" height="18" rx="4" fill={sage} />
          <rect x="50" y="70" width="60" height="42" rx="14" fill={paper} stroke={ink} />
        </>
      );
    case "lotion":
      return (
        <>
          <rect x="70" y="36" width="20" height="16" rx="4" fill={blush} />
          <rect x="58" y="52" width="44" height="64" rx="16" fill={paper} stroke={ink} />
        </>
      );
    case "tub":
      return <path d="M36 78h88c0 28-16 42-44 42S36 106 36 78z" fill={paper} stroke={ink} />;
    case "thermo":
      return (
        <>
          <rect x="70" y="36" width="20" height="70" rx="10" fill={paper} stroke={ink} />
          <circle cx="80" cy="112" r="14" fill={blush} />
        </>
      );
    case "aspirator":
      return <path d="M48 96c0-30 20-48 32-48s32 18 32 48c-18 16-46 16-64 0z" fill={sage} stroke={ink} />;
    case "grooming":
      return <rect x="40" y="58" width="80" height="46" rx="10" fill={sand} stroke={ink} />;
    case "nail":
      return <rect x="42" y="74" width="76" height="16" rx="8" fill={stone} stroke={ink} transform="rotate(-18 80 82)" />;
    case "medicine":
      return (
        <>
          <rect x="70" y="34" width="20" height="28" rx="6" fill={paper} stroke={ink} />
          <path d="M80 62v48" stroke={ink} strokeWidth="4" />
          <circle cx="80" cy="116" r="8" fill={sage} />
        </>
      );
    case "pacifiers":
      return (
        <>
          <circle cx="68" cy="78" r="16" fill={blush} stroke={ink} />
          <circle cx="96" cy="86" r="14" fill={sage} stroke={ink} />
        </>
      );
    case "teether":
      return (
        <>
          {Array.from({ length: 8 }, (_, index) => {
            const angle = (Math.PI * 2 * index) / 8;
            return (
              <circle
                key={index}
                cx={80 + Math.cos(angle) * 28}
                cy={82 + Math.sin(angle) * 28}
                r="8"
                fill={index % 2 ? sage : sand}
                stroke={ink}
              />
            );
          })}
        </>
      );
    case "bouncer":
      return (
        <>
          <path d="M40 96c20-40 60-40 80 0" fill={sand} stroke={ink} />
          <path d="M48 96h64" stroke={wood} strokeWidth="4" />
        </>
      );
    case "toy":
      return (
        <>
          <ellipse cx="80" cy="96" rx="28" ry="32" fill={sand} stroke={ink} />
          <ellipse cx="58" cy="70" rx="12" ry="20" fill={sand} stroke={ink} />
          <ellipse cx="102" cy="70" rx="12" ry="20" fill={sand} stroke={ink} />
        </>
      );
    case "stroller":
      return (
        <>
          <path d="M48 70h46l14 28H58z" fill={stone} stroke={ink} />
          <circle cx="64" cy="114" r="10" fill={ink} />
          <circle cx="104" cy="114" r="10" fill={ink} />
        </>
      );
    case "carseat":
      return <path d="M52 46h40l16 62H48z" fill={stone} stroke={ink} />;
    case "bag":
      return (
        <>
          <rect x="48" y="62" width="64" height="52" rx="10" fill={sand} stroke={ink} />
          <path d="M64 62c0-16 32-16 32 0" fill="none" stroke={ink} />
        </>
      );
    case "carrier":
      return (
        <>
          <path d="M58 48h44v56H58z" fill={sage} stroke={ink} />
          <path d="M58 60H40M102 60h18" stroke={ink} />
        </>
      );
    case "mat":
      return <rect x="46" y="52" width="68" height="56" rx="6" fill={sage} stroke={ink} />;
    default:
      return <circle cx="80" cy="80" r="28" fill={sand} stroke={ink} />;
  }
}

function Bottle({ x }: { x: number }) {
  return (
    <g>
      <rect x={x} y="40" width="22" height="12" rx="3" fill={sage} />
      <path d={`M${x - 2} 52h26l4 18v28a10 10 0 0 1-10 10h-14a10 10 0 0 1-10-10V70z`} fill={paper} stroke={ink} />
    </g>
  );
}

function Folded({ y, fill }: { y: number; fill: string }) {
  return <rect x="42" y={y} width="76" height="18" rx="4" fill={fill} stroke={ink} />;
}

function Bib({ x, fill }: { x: number; fill: string }) {
  return (
    <g>
      <path d={`M${x} 52h28c0 28-4 48-14 48S${x} 80 ${x} 52z`} fill={fill} stroke={ink} />
      <path d={`M${x + 6} 52c2-12 14-12 16 0`} fill="none" stroke={ink} />
    </g>
  );
}

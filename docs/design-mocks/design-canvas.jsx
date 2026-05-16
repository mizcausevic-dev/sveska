/* design-canvas.jsx — Sveska design-canvas framework.
 * Loaded as a plain Babel script (no modules). Top-level decls become globals
 * for app-shell.jsx and ai-flows.jsx to consume.
 *
 * Vocabulary: <DesignCanvas> wraps a project, <DCSection> groups artboards,
 * <DCArtboard> is one fixed-size frame holding a single design state.
 */

const TOKENS = {
  ink900: '#0C0C0E',
  ink800: '#161619',
  ink700: '#222228',
  ink600: '#2A2A30',
  paper: '#F4EFE6',
  paperDim: '#B8B2A6',
  amber500: '#F2B544',
  amber600: '#EDA92E',
  amber700: '#C9871F',
  signal400: '#4FD6C4',
  danger: '#E5604D',
  ok: '#6FCF7F',
  paperSurface: '#FBF8F1',
  paperRaised: '#EFEADF',
  paperBorder: '#E2DCCE',
  paperText: '#15110A',
  paperTextDim: '#6B6457',
  canvasBg: '#1A1A1F',
};

const FONT = {
  display: '"Bricolage Grotesque", "Segoe UI", system-ui, sans-serif',
  ui: '"Satoshi", "Manrope", system-ui, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, "SFMono-Regular", monospace',
};

// Theme dict — used by AppShell + FlowFrame.
const THEME = {
  dark: {
    bg: TOKENS.ink900,
    surface: TOKENS.ink800,
    raised: TOKENS.ink700,
    text: TOKENS.paper,
    textDim: TOKENS.paperDim,
    border: TOKENS.ink700,
    accent: TOKENS.amber500,
    accentHover: TOKENS.amber600,
    ai: TOKENS.signal400,
    snapDot: TOKENS.signal400,
  },
  light: {
    bg: TOKENS.paper,
    surface: TOKENS.paperSurface,
    raised: TOKENS.paperRaised,
    text: TOKENS.paperText,
    textDim: TOKENS.paperTextDim,
    border: TOKENS.paperBorder,
    accent: TOKENS.amber600,
    accentHover: TOKENS.amber700,
    ai: TOKENS.amber700,
    snapDot: TOKENS.amber700,
  },
};

// Tiny icon set — inline SVG, currentColor-stroked.
function Icon({ name, size = 16, strokeWidth = 1.75, ...rest }) {
  const paths = ICONS[name] || ICONS.dot;
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      {paths}
    </svg>
  );
}

const ICONS = {
  plus: <path d="M12 5v14M5 12h14" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </>
  ),
  file: (
    <>
      <path d="M6 3h9l3 3v15H6z" />
      <path d="M15 3v3h3" />
    </>
  ),
  star: <path d="M12 2l2.3 5.3L20 9.5l-4.5 3.8L17 19l-5-3-5 3 1.5-5.7L4 9.5l5.7-2.2z" />,
  bullets: <path d="M4 6h16M4 12h10M4 18h16" />,
  download: <path d="M12 3v12M6 9l6 6 6-6M4 21h16" />,
  upload: <path d="M12 21V9M6 15l6-6 6 6M4 3h16" />,
  bold: <path d="M7 5h6a4 4 0 1 1 0 8H7zM7 13h7a4 4 0 1 1 0 8H7z" />,
  italic: <path d="M14 5h4M10 19h4M15 5l-4 14" />,
  check: <path d="M4 6l2 2 4-4M4 13l2 2 4-4M4 20l2 2 4-4M14 7h7M14 14h7M14 21h7" />,
  pin: <path d="M12 2v10l4 3-2 7-2-3-2 3-2-7 4-3z" />,
  cog: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
    </>
  ),
  cmd: (
    <path d="M9 6a3 3 0 1 0-3 3M9 6v12M9 6h6M9 18a3 3 0 1 1-3-3M9 18v0M15 18a3 3 0 1 0 3-3M15 18V6M15 6a3 3 0 1 1 3 3M15 9h-6M9 15h6" />
  ),
  sparkle: (
    <path d="M12 3l1.7 4 4 1.7-4 1.7L12 14.4l-1.7-4-4-1.7 4-1.7zM18 14l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" />
  ),
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  x: <path d="M6 6l12 12M18 6L6 18" />,
  retry: <path d="M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5" />,
  check2: <path d="M5 12l5 5L20 7" />,
  dot: <circle cx="12" cy="12" r="3" />,
  link: (
    <>
      <path d="M10 14a4 4 0 0 0 6 0l3-3a4 4 0 1 0-6-6l-1 1" />
      <path d="M14 10a4 4 0 0 0-6 0l-3 3a4 4 0 1 0 6 6l1-1" />
    </>
  ),
  pen: <path d="M14 4l6 6L8 22H2v-6z" />,
  copy: (
    <>
      <rect x="8" y="8" width="13" height="13" rx="2" />
      <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
    </>
  ),
  ai: <path d="M12 3l2 6 6 1-4 4 1 6-5-3-5 3 1-6-4-4 6-1z" />,
  warn: (
    <>
      <path d="M12 3l10 18H2z" />
      <path d="M12 10v5M12 18v.01" />
    </>
  ),
  bolt: <path d="M13 2L4 14h7l-1 8 9-12h-7z" />,
  caret: <path d="M6 8l6 6 6-6" />,
};

// ─────────────────────────────────────────────────────────────────
// DesignCanvas — outermost wrapper.
// Holds project title topbar + a scaled artboard region.
// ─────────────────────────────────────────────────────────────────
function DesignCanvas({ projectTitle, initialZoom = 0.5, children }) {
  const [zoom, setZoom] = React.useState(initialZoom);
  const clamp = (z) => Math.max(0.2, Math.min(1.2, z));

  return (
    <div
      style={{
        minHeight: '100vh',
        background: TOKENS.canvasBg,
        color: TOKENS.paper,
        fontFamily: FONT.ui,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '18px 32px',
          borderBottom: `1px solid ${TOKENS.ink700}`,
          background: TOKENS.ink900,
          position: 'sticky',
          top: 0,
          zIndex: 50,
          fontFamily: FONT.mono,
          fontSize: 11,
          letterSpacing: '.10em',
          textTransform: 'uppercase',
          color: TOKENS.paperDim,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          <span style={{ color: TOKENS.amber500, fontWeight: 700 }}>Sveska</span>
          <span>·</span>
          <span style={{ color: TOKENS.paper, fontWeight: 500 }}>{projectTitle}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <ZoomControl zoom={zoom} onChange={(z) => setZoom(clamp(z))} />
          <span style={{ color: TOKENS.signal400 }}>● live</span>
          <span>2026.05.16</span>
        </div>
      </div>

      <div
        style={{
          padding: '48px 32px 96px',
          transformOrigin: 'top left',
          transform: `scale(${zoom})`,
          width: `${100 / zoom}%`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

function ZoomControl({ zoom, onChange }) {
  const step = 0.05;
  const pct = Math.round(zoom * 100);
  const btn = {
    background: 'transparent',
    border: 0,
    color: TOKENS.paperDim,
    fontFamily: FONT.mono,
    fontSize: 11,
    cursor: 'pointer',
    padding: '4px 6px',
    borderRadius: 5,
  };
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        background: TOKENS.ink800,
        border: `1px solid ${TOKENS.ink700}`,
        borderRadius: 999,
        padding: 2,
      }}
    >
      <button style={btn} onClick={() => onChange(zoom - step)} aria-label="Zoom out">
        −
      </button>
      <span style={{ minWidth: 44, textAlign: 'center', color: TOKENS.paper }}>{pct}%</span>
      <button style={btn} onClick={() => onChange(zoom + step)} aria-label="Zoom in">
        +
      </button>
      <span style={{ width: 1, height: 14, background: TOKENS.ink700, margin: '0 2px' }} />
      <button style={btn} onClick={() => onChange(0.5)} aria-label="Reset zoom">
        50
      </button>
      <button style={btn} onClick={() => onChange(1)} aria-label="100%">
        100
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// DCSection — group of artboards under one heading.
// ─────────────────────────────────────────────────────────────────
function DCSection({ id, title, subtitle, children }) {
  return (
    <section id={id} style={{ marginBottom: 96 }}>
      <header style={{ marginBottom: 28, maxWidth: 1200 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 18,
            marginBottom: 12,
          }}
        >
          <span
            style={{
              fontFamily: FONT.mono,
              fontSize: 11,
              letterSpacing: '.12em',
              textTransform: 'uppercase',
              color: TOKENS.amber500,
            }}
          >
            §{id}
          </span>
          <h2
            style={{
              fontFamily: FONT.display,
              fontWeight: 700,
              fontSize: 36,
              letterSpacing: '-0.02em',
              margin: 0,
              color: TOKENS.paper,
            }}
          >
            {title}
          </h2>
        </div>
        {subtitle && (
          <p
            style={{
              color: TOKENS.paperDim,
              maxWidth: '72ch',
              margin: '0 0 0 0',
              fontSize: 15,
              lineHeight: 1.55,
            }}
          >
            {subtitle}
          </p>
        )}
      </header>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 48,
          alignItems: 'flex-start',
        }}
      >
        {children}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────
// DCArtboard — single fixed-size frame.
// ─────────────────────────────────────────────────────────────────
function DCArtboard({ id, label, width, height, children }) {
  return (
    <figure id={id} style={{ margin: 0 }}>
      <figcaption
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 10,
          width,
          fontFamily: FONT.mono,
          fontSize: 11,
          letterSpacing: '.08em',
          textTransform: 'uppercase',
          color: TOKENS.paperDim,
        }}
      >
        <span style={{ color: TOKENS.paper }}>{label}</span>
        <span>
          {width} × {height}
        </span>
      </figcaption>
      <div
        style={{
          width,
          height,
          overflow: 'hidden',
          borderRadius: 18,
          border: `1px solid ${TOKENS.ink700}`,
          boxShadow: '0 24px 60px rgba(0,0,0,.45), 0 1px 0 rgba(255,255,255,.03)',
          background: TOKENS.ink900,
          position: 'relative',
        }}
      >
        {children}
      </div>
    </figure>
  );
}

// caret blink keyframes — injected once globally.
(function injectKeyframes() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('sveska-canvas-keyframes')) return;
  const style = document.createElement('style');
  style.id = 'sveska-canvas-keyframes';
  style.textContent = `
@keyframes sveska-caret {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
}
@keyframes sveska-pulse {
  0% { transform: scale(.6); opacity: .55; }
  100% { transform: scale(1.7); opacity: 0; }
}
@keyframes sveska-stream {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
@media (prefers-reduced-motion: reduce) {
  [data-sveska-anim] { animation: none !important; }
}
  `;
  document.head.appendChild(style);
})();

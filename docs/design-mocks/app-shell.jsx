/* app-shell.jsx — Sveska <AppShell theme mode/> mock.
 * Composes header + tabs + sidebar + editor + statusbar into a single 1440×900
 * frame. mode="focus" hides chrome and widens margins.
 * Consumes TOKENS / FONT / THEME / Icon from design-canvas.jsx (loaded first).
 */

// ─────────────────────────────────────────────────────────────────
// AppShell — the full M1+ shell, rendered as a single static state.
// ─────────────────────────────────────────────────────────────────
function AppShell({ theme = 'dark', mode = 'default' }) {
  const t = THEME[theme];
  const isFocus = mode === 'focus';

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'grid',
        gridTemplateRows: isFocus ? '1fr' : 'auto auto 1fr auto',
        gridTemplateColumns: '1fr',
        background: t.bg,
        color: t.text,
        fontFamily: FONT.ui,
        fontSize: 15,
        lineHeight: 1.55,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {!isFocus && <ShellHeader t={t} theme={theme} />}
      {!isFocus && <TabBar t={t} />}
      <ShellBody t={t} theme={theme} isFocus={isFocus} />
      {!isFocus && <StatusBar t={t} />}

      {isFocus && <FocusCornerHint t={t} />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Header — brand · search/⌘K · prefs · theme switch
// ─────────────────────────────────────────────────────────────────
function ShellHeader({ t, theme }) {
  return (
    <header
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '14px 22px',
        borderBottom: `1px solid ${t.border}`,
        background: t.surface,
      }}
    >
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14 }}>
        <BrandMark />
        <span
          style={{
            fontFamily: FONT.display,
            fontWeight: 700,
            fontSize: 18,
            letterSpacing: '-0.01em',
            color: t.text,
          }}
        >
          Sveska<span style={{ color: t.accent }}>.</span>
        </span>
        <span
          style={{
            color: t.textDim,
            fontFamily: FONT.mono,
            fontSize: 11,
            letterSpacing: '.08em',
            textTransform: 'uppercase',
            marginLeft: 6,
          }}
        >
          studio · local
        </span>
      </div>

      <SearchTrigger t={t} />

      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
        <IconButton t={t} title="New note (⌘N)" icon="plus" />
        <IconButton t={t} title="Quick capture" icon="bolt" />
        <IconButton t={t} title="Preferences (⌃,)" icon="cog" />
        <ThemeSegmented t={t} active={theme} />
      </div>
    </header>
  );
}

function BrandMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 512 512" aria-hidden="true">
      <defs>
        <linearGradient id="bm-page" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F6C155" />
          <stop offset="1" stopColor="#EDA92E" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="512" height="512" rx="116" fill="#0C0C0E" />
      <path
        d="M130 96H328L400 168V398A18 18 0 0 1 382 416H130A18 18 0 0 1 112 398V114A18 18 0 0 1 130 96Z"
        fill="url(#bm-page)"
      />
      <path d="M328 96 L400 168 H346 A18 18 0 0 1 328 150 Z" fill="#C9871F" />
      <path
        d="M338 196C338 158 306 138 262 138C214 138 182 162 182 200C182 238 216 256 262 262C308 268 342 286 342 326C342 368 308 392 258 392C214 392 180 372 178 332"
        fill="none"
        stroke="#0C0C0E"
        strokeWidth="46"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SearchTrigger({ t }) {
  return (
    <button
      type="button"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 12,
        height: 36,
        padding: '0 14px',
        minWidth: 420,
        background: t.bg,
        border: `1px solid ${t.border}`,
        borderRadius: 10,
        color: t.textDim,
        cursor: 'pointer',
        fontFamily: FONT.ui,
        fontSize: 14,
      }}
    >
      <Icon name="search" size={14} />
      <span style={{ flex: 1, textAlign: 'left' }}>
        Search notes · run a command · <span style={{ color: t.text }}>type /</span> for AI
      </span>
      <Kbd t={t} keys={['⌘', 'K']} />
    </button>
  );
}

function IconButton({ t, icon, title, active }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      style={{
        width: 34,
        height: 34,
        background: active ? t.raised : 'transparent',
        border: 0,
        borderRadius: 8,
        color: active ? t.accent : t.textDim,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon name={icon} size={16} />
    </button>
  );
}

function ThemeSegmented({ t, active }) {
  const choices = ['dark', 'light', 'sys'];
  return (
    <div
      role="group"
      aria-label="Theme"
      style={{
        display: 'inline-flex',
        background: t.bg,
        border: `1px solid ${t.border}`,
        borderRadius: 999,
        padding: 3,
        fontFamily: FONT.mono,
        fontSize: 10.5,
        letterSpacing: '.08em',
        textTransform: 'uppercase',
      }}
    >
      {choices.map((c) => {
        const on = c === active;
        return (
          <span
            key={c}
            style={{
              padding: '6px 12px',
              borderRadius: 999,
              background: on ? t.raised : 'transparent',
              color: on ? t.accent : t.textDim,
            }}
          >
            {c}
          </span>
        );
      })}
    </div>
  );
}

function Kbd({ t, keys, dim }) {
  return (
    <span style={{ display: 'inline-flex', gap: 3 }}>
      {keys.map((k, i) => (
        <span
          key={i}
          style={{
            fontFamily: FONT.mono,
            fontSize: 10.5,
            padding: '2px 6px',
            borderRadius: 5,
            background: t.raised,
            color: dim ? t.textDim : t.text,
            lineHeight: 1,
          }}
        >
          {k}
        </span>
      ))}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────
// Tab bar — open notes
// ─────────────────────────────────────────────────────────────────
function TabBar({ t }) {
  const tabs = [
    { id: 'a', title: 'weekend', ext: '.md', active: true, dirty: true },
    { id: 'b', title: 'imports of Selimović', ext: '', active: false },
    { id: 'c', title: 'sveska v0.1 ship list', ext: '.md', active: false },
    { id: 'd', title: 'untitled', ext: '', active: false, faint: true },
  ];
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'stretch',
        height: 38,
        background: t.bg,
        borderBottom: `1px solid ${t.border}`,
        paddingLeft: 8,
        overflow: 'hidden',
      }}
    >
      {tabs.map((tab) => (
        <Tab key={tab.id} t={t} {...tab} />
      ))}
      <div style={{ flex: 1, borderBottom: `1px solid ${t.border}` }} />
      <button
        type="button"
        title="New tab"
        style={{
          width: 38,
          background: 'transparent',
          border: 0,
          color: t.textDim,
          cursor: 'pointer',
        }}
      >
        <Icon name="plus" size={14} />
      </button>
    </div>
  );
}

function Tab({ t, title, ext, active, dirty, faint }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '0 14px',
        borderRight: `1px solid ${t.border}`,
        background: active ? t.surface : 'transparent',
        borderBottom: active ? `2px solid ${t.accent}` : `1px solid ${t.border}`,
        color: active ? t.text : t.textDim,
        fontFamily: FONT.mono,
        fontSize: 12.5,
        height: '100%',
        opacity: faint ? 0.55 : 1,
        cursor: 'pointer',
      }}
    >
      {dirty && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: 999,
            background: t.accent,
            display: 'inline-block',
          }}
        />
      )}
      <span>
        {title}
        {ext && <span style={{ color: t.textDim }}>{ext}</span>}
      </span>
      <span style={{ color: t.textDim, opacity: 0.6, marginLeft: 4 }}>×</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Body — sidebar + editor (or, in focus mode, just the editor)
// ─────────────────────────────────────────────────────────────────
function ShellBody({ t, theme, isFocus }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: isFocus ? '1fr' : '264px 1fr',
        overflow: 'hidden',
        background: t.bg,
      }}
    >
      {!isFocus && <Sidebar t={t} />}
      <Editor t={t} theme={theme} isFocus={isFocus} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Sidebar — favorites · tags · recent
// ─────────────────────────────────────────────────────────────────
function Sidebar({ t }) {
  return (
    <aside
      style={{
        borderRight: `1px solid ${t.border}`,
        background: t.surface,
        padding: '18px 14px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 22,
      }}
    >
      <SidebarGroup t={t} label="Pinned">
        <SidebarItem t={t} icon="pin" label="weekend.md" meta="2m" active />
        <SidebarItem t={t} icon="pin" label="imports of Selimović" meta="1d" />
      </SidebarGroup>

      <SidebarGroup t={t} label="Recent">
        <SidebarItem t={t} icon="file" label="sveska v0.1 ship list" meta="3h" />
        <SidebarItem t={t} icon="file" label="meeting · Tue 14:00" meta="yesterday" />
        <SidebarItem t={t} icon="file" label="draft — studio post" meta="2d" />
        <SidebarItem t={t} icon="file" label="ai notes — /improve" meta="4d" />
        <SidebarItem t={t} icon="file" label="2026-Q2 themes" meta="1w" />
      </SidebarGroup>

      <SidebarGroup t={t} label="Tags">
        <TagRow t={t} name="studio" count={12} dot={t.accent} />
        <TagRow t={t} name="reading" count={7} dot={t.ai} />
        <TagRow t={t} name="meeting" count={4} dot={t.textDim} />
        <TagRow t={t} name="ship" count={3} dot={t.accent} />
      </SidebarGroup>

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <SidebarItem t={t} icon="bolt" label="Inbox · 2 unread" meta="" subdued />
        <SidebarItem t={t} icon="check" label="All notes" meta="38" subdued />
      </div>
    </aside>
  );
}

function SidebarGroup({ t, label, children }) {
  return (
    <div>
      <div
        style={{
          fontFamily: FONT.mono,
          fontSize: 10.5,
          letterSpacing: '.12em',
          textTransform: 'uppercase',
          color: t.textDim,
          padding: '0 6px 8px',
        }}
      >
        {label}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>{children}</div>
    </div>
  );
}

function SidebarItem({ t, icon, label, meta, active, subdued }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '7px 10px',
        borderRadius: 8,
        background: active ? 'color-mix(in oklab, ' + t.accent + ' 14%, transparent)' : 'transparent',
        color: active ? t.text : subdued ? t.textDim : t.text,
        cursor: 'pointer',
        fontSize: 13.5,
        position: 'relative',
      }}
    >
      <span style={{ color: active ? t.accent : t.textDim, display: 'inline-flex' }}>
        <Icon name={icon} size={13} />
      </span>
      <span
        style={{
          flex: 1,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {label}
      </span>
      {meta && (
        <span
          style={{
            fontFamily: FONT.mono,
            fontSize: 10.5,
            color: t.textDim,
            letterSpacing: '.04em',
          }}
        >
          {meta}
        </span>
      )}
    </div>
  );
}

function TagRow({ t, name, count, dot }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '6px 10px',
        borderRadius: 8,
        color: t.text,
        fontSize: 13.5,
        cursor: 'pointer',
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: 999,
          background: dot,
          display: 'inline-block',
        }}
      />
      <span style={{ flex: 1 }}>#{name}</span>
      <span style={{ fontFamily: FONT.mono, fontSize: 10.5, color: t.textDim }}>{count}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Editor — gutter + lines + caret. focus mode widens margins.
// ─────────────────────────────────────────────────────────────────
const SAMPLE_LINES = [
  ['# ', 'weekend', { dim: '.md' }],
  [''],
  ['Local-first means the app keeps working when the network does not.'],
  ['Notes live in IndexedDB, the canvas renders offline, and keys never travel'],
  ['through the browser. The folded page does not need permission to be written on.'],
  [''],
  ['## ', 'ship list'],
  [''],
  [{ list: '- ' }, 'draft the studio post'],
  [{ list: '- ' }, 'read ', { italic: 'Death and the Dervish' }, ' — chapter 3'],
  [{ list: '- ' }, 'sveska v0.1 — ', { mono: 'M0 ✓ M1 in flight' }],
  [{ list: '- ' }, 'reply to the procurement note', { caret: true }],
  [''],
  ['> A studio is the discipline of finishing the things you started.'],
  [''],
  ['### ', 'tomorrow'],
  [''],
  [{ list: '- [ ] ' }, 'commit T1.4 — statistics modal'],
  [{ list: '- [x] ' }, 'merge T0.3 — shell + routing'],
];

function Editor({ t, theme, isFocus }) {
  const editorBg = t.bg;
  const margin = isFocus ? 200 : 64;
  const lineHeight = 28;
  return (
    <div
      style={{
        background: editorBg,
        overflow: 'hidden',
        position: 'relative',
        padding: isFocus ? '64px 0' : '24px 0 0',
      }}
    >
      {!isFocus && <EditorToolbar t={t} />}
      <div
        style={{
          padding: `${isFocus ? 0 : 22}px ${margin}px 0`,
          display: 'grid',
          gridTemplateColumns: '44px 1fr',
          columnGap: 14,
          fontFamily: FONT.mono,
          fontSize: 16,
          lineHeight: `${lineHeight}px`,
          color: t.text,
          maxWidth: isFocus ? 880 : 'none',
          margin: isFocus ? '0 auto' : 0,
        }}
      >
        {SAMPLE_LINES.map((line, i) => (
          <EditorLine key={i} t={t} lineno={i + 1} tokens={line} />
        ))}
      </div>

      {!isFocus && <WordCountGoal t={t} />}
    </div>
  );
}

function EditorToolbar({ t }) {
  return (
    <div
      style={{
        margin: '0 64px 6px',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: 8,
        borderRadius: 12,
        background: t.surface,
        boxShadow: `inset 0 0 0 1px ${t.border}`,
        maxWidth: 720,
      }}
    >
      <ToolbarBtn t={t} icon="plus" label="New" />
      <ToolbarBtn t={t} icon="bold" active />
      <ToolbarBtn t={t} icon="italic" />
      <ToolbarBtn t={t} icon="check" />
      <ToolbarBtn t={t} icon="link" />
      <span style={{ width: 1, height: 18, background: t.border, margin: '0 4px' }} />
      <span
        style={{
          flex: 1,
          fontFamily: FONT.mono,
          fontSize: 12.5,
          color: t.text,
          padding: '0 8px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{ color: t.textDim }}>weekend</span>.md
        <span style={{ color: t.textDim }}> · edited 2m ago</span>
      </span>
      <SnapButton t={t} />
    </div>
  );
}

function ToolbarBtn({ t, icon, active }) {
  return (
    <button
      type="button"
      style={{
        width: 34,
        height: 34,
        background: active ? t.raised : 'transparent',
        border: 0,
        borderRadius: 8,
        color: active ? t.accent : t.textDim,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon name={icon} size={16} />
    </button>
  );
}

function SnapButton({ t }) {
  return (
    <button
      type="button"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 12px 6px 10px',
        borderRadius: 8,
        background: 'transparent',
        color: t.textDim,
        fontFamily: FONT.mono,
        fontSize: 11,
        border: 0,
        cursor: 'pointer',
      }}
    >
      <span
        style={{
          position: 'relative',
          width: 8,
          height: 8,
          borderRadius: 999,
          background: t.snapDot,
          boxShadow: `0 0 0 3px color-mix(in oklab, ${t.snapDot} 22%, transparent)`,
          display: 'inline-block',
        }}
      >
        <span
          data-sveska-anim
          style={{
            content: '""',
            position: 'absolute',
            inset: -6,
            borderRadius: 999,
            border: `1px solid ${t.snapDot}`,
            opacity: 0.35,
            animation: 'sveska-pulse 2.4s ease-out infinite',
          }}
        />
      </span>
      <span>snapshot · 14:02</span>
    </button>
  );
}

function EditorLine({ t, lineno, tokens }) {
  return (
    <>
      <span
        style={{
          color: t.textDim,
          opacity: 0.55,
          textAlign: 'right',
          fontSize: 12,
          alignSelf: 'baseline',
          paddingTop: 5,
          userSelect: 'none',
        }}
      >
        {lineno}
      </span>
      <span style={{ color: t.text, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        {tokens.map((seg, i) => {
          if (typeof seg === 'string') return <span key={i}>{seg}</span>;
          if (seg.dim) return <span key={i} style={{ color: t.textDim }}>{seg.dim}</span>;
          if (seg.italic) return <span key={i} style={{ fontStyle: 'italic', color: t.text }}>{seg.italic}</span>;
          if (seg.mono) return <span key={i} style={{ color: t.accent }}>{seg.mono}</span>;
          if (seg.list) return <span key={i} style={{ color: t.accent }}>{seg.list}</span>;
          if (seg.caret) return (
            <span
              key={i}
              data-sveska-anim
              style={{
                display: 'inline-block',
                width: 2,
                height: 18,
                background: t.accent,
                verticalAlign: '-3px',
                marginLeft: 1,
                animation: 'sveska-caret 1.1s steps(1) infinite',
              }}
            />
          );
          return null;
        })}
      </span>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────
// Status bar — mono row at the bottom
// ─────────────────────────────────────────────────────────────────
function StatusBar({ t }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 22px',
        borderTop: `1px solid ${t.border}`,
        background: t.surface,
        color: t.textDim,
        fontFamily: FONT.mono,
        fontSize: 11,
        letterSpacing: '.04em',
        textTransform: 'uppercase',
      }}
    >
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 18 }}>
        <span style={{ color: t.ai }}>● local · offline-ok</span>
        <span>312 words · 1,847 chars · 19 lines</span>
        <span>md mode</span>
      </div>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14 }}>
        <span>UTF-8 · LF</span>
        <span>Ln 12 · Col 36</span>
        <Kbd t={t} keys={['⌘', 'K']} dim /> <span>command</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Focus mode hint — small ⎋ corner card with snapshot dot
// ─────────────────────────────────────────────────────────────────
function FocusCornerHint({ t }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 24,
        right: 24,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 12px 8px 10px',
        borderRadius: 999,
        background: t.surface,
        border: `1px solid ${t.border}`,
        color: t.textDim,
        fontFamily: FONT.mono,
        fontSize: 11,
        letterSpacing: '.06em',
        textTransform: 'uppercase',
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: 999,
          background: t.snapDot,
          display: 'inline-block',
        }}
      />
      <span>focus · </span>
      <Kbd t={t} keys={['⌥', 'F']} dim />
      <span>to exit</span>
    </div>
  );
}

// Word-count goal — floating bottom-right card with progress arc-ish
function WordCountGoal({ t }) {
  const goal = 500;
  const have = 312;
  const pct = have / goal;
  return (
    <div
      style={{
        position: 'absolute',
        right: 28,
        bottom: 44,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 14px',
        background: t.surface,
        border: `1px solid ${t.border}`,
        borderRadius: 12,
        color: t.text,
        fontFamily: FONT.mono,
        fontSize: 11,
        letterSpacing: '.06em',
      }}
    >
      <span style={{ position: 'relative', width: 24, height: 24 }}>
        <svg width="24" height="24" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" fill="none" stroke={t.border} strokeWidth="2" />
          <circle
            cx="12"
            cy="12"
            r="10"
            fill="none"
            stroke={t.accent}
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 10}`}
            strokeDashoffset={`${2 * Math.PI * 10 * (1 - pct)}`}
            transform="rotate(-90 12 12)"
          />
        </svg>
      </span>
      <span style={{ textTransform: 'uppercase' }}>
        <span style={{ color: t.text }}>{have}</span>
        <span style={{ color: t.textDim }}> / {goal} words</span>
      </span>
    </div>
  );
}

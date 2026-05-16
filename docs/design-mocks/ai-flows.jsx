/* ai-flows.jsx — Sveska command palette + AI editor flows.
 * Provides <FlowFrame/>, <PaletteEmpty/>, <PaletteFiltered/>, <PaletteContext/>,
 * <PaletteNoKey/>, <SlashMenu/>, <StreamHUD/>, <DiffPanel/>.
 * Consumes TOKENS / FONT / THEME / Icon / AppShell from prior scripts.
 */

// ─────────────────────────────────────────────────────────────────
// FlowFrame — wraps an AppShell at full bleed with a dim veil and
// positions an overlay (palette / menu / hud / modal) anchored to one
// of four positions: top, center, custom, or bottom.
// ─────────────────────────────────────────────────────────────────
function FlowFrame({
  theme = 'dark',
  anchor = 'top',
  anchorOffset,
  veil = 'medium',
  children,
}) {
  const t = THEME[theme];
  const veilAlpha =
    veil === 'none' ? 0 : veil === 'heavy' ? 0.62 : veil === 'soft' ? 0.18 : 0.42;

  const anchorStyle = (() => {
    if (anchor === 'custom') {
      const o = anchorOffset || {};
      return {
        position: 'absolute',
        top: o.top,
        left: o.left,
        right: o.right,
        bottom: o.bottom,
      };
    }
    if (anchor === 'top') {
      return {
        position: 'absolute',
        top: 96,
        left: '50%',
        transform: 'translateX(-50%)',
      };
    }
    if (anchor === 'bottom') {
      return {
        position: 'absolute',
        bottom: 48,
        left: '50%',
        transform: 'translateX(-50%)',
      };
    }
    return {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    };
  })();

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0 }}>
        <AppShell theme={theme} mode="default" />
      </div>
      {veilAlpha > 0 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              theme === 'dark'
                ? `rgba(0,0,0,${veilAlpha})`
                : `rgba(20,17,10,${veilAlpha * 0.55})`,
            backdropFilter: 'blur(2px)',
            WebkitBackdropFilter: 'blur(2px)',
          }}
        />
      )}
      <div style={anchorStyle}>{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Palette — shared modal frame
// ─────────────────────────────────────────────────────────────────
function PaletteShell({ theme = 'dark', children, width = 620 }) {
  const t = THEME[theme];
  return (
    <div
      style={{
        width,
        maxWidth: '92vw',
        background: t.surface,
        border: `1px solid ${t.border}`,
        borderRadius: 14,
        overflow: 'hidden',
        boxShadow:
          theme === 'dark'
            ? '0 1px 0 rgba(255,255,255,.03), 0 24px 60px rgba(0,0,0,.55)'
            : '0 1px 0 rgba(0,0,0,.02), 0 24px 60px rgba(20,17,10,.18)',
        fontFamily: FONT.ui,
        color: t.text,
      }}
    >
      {children}
    </div>
  );
}

function PaletteInput({ t, value, placeholder, focused = true }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '16px 18px',
        borderBottom: `1px solid ${t.border}`,
      }}
    >
      <span style={{ color: t.textDim, display: 'inline-flex' }}>
        <Icon name="search" size={16} />
      </span>
      <span
        style={{
          flex: 1,
          fontFamily: FONT.ui,
          fontSize: 16,
          color: value ? t.text : t.textDim,
          position: 'relative',
        }}
      >
        {value || placeholder}
        {focused && (
          <span
            data-sveska-anim
            style={{
              display: 'inline-block',
              width: 2,
              height: 18,
              background: t.accent,
              verticalAlign: '-3px',
              marginLeft: 2,
              animation: 'sveska-caret 1.1s steps(1) infinite',
            }}
          />
        )}
      </span>
      <span
        style={{
          fontFamily: FONT.mono,
          fontSize: 10.5,
          letterSpacing: '.04em',
          color: t.textDim,
          padding: '3px 7px',
          borderRadius: 5,
          background: t.raised,
        }}
      >
        ESC
      </span>
    </div>
  );
}

function PaletteSection({ t, label, children }) {
  return (
    <div>
      <div
        style={{
          fontFamily: FONT.mono,
          fontSize: 10.5,
          letterSpacing: '.12em',
          textTransform: 'uppercase',
          color: t.textDim,
          padding: '14px 18px 6px',
        }}
      >
        {label}
      </div>
      <div>{children}</div>
    </div>
  );
}

function PaletteItem({ t, icon, label, hint, keys, sel, ai }) {
  const iconBg = sel
    ? t.accent
    : ai
    ? `color-mix(in oklab, ${t.ai} 18%, transparent)`
    : t.raised;
  const iconFg = sel ? TOKENS.ink900 : ai ? t.ai : t.textDim;
  const rowBg = sel ? `color-mix(in oklab, ${t.accent} 14%, transparent)` : 'transparent';
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '10px 18px',
        background: rowBg,
        cursor: 'pointer',
      }}
    >
      <span
        style={{
          width: 26,
          height: 26,
          borderRadius: 7,
          background: iconBg,
          color: iconFg,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name={icon} size={14} />
      </span>
      <span style={{ flex: 1, fontSize: 14.5 }}>
        {label}
        {hint && <span style={{ color: t.textDim, fontSize: 13, marginLeft: 6 }}>{hint}</span>}
      </span>
      {keys && (
        <span style={{ display: 'inline-flex', gap: 4 }}>
          {keys.map((k, i) => (
            <span
              key={i}
              style={{
                fontFamily: FONT.mono,
                fontSize: 10.5,
                padding: '2px 6px',
                borderRadius: 5,
                background: t.raised,
                color: t.textDim,
              }}
            >
              {k}
            </span>
          ))}
        </span>
      )}
    </div>
  );
}

function PaletteFoot({ t, count, hints }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 18px',
        borderTop: `1px solid ${t.border}`,
        fontFamily: FONT.mono,
        fontSize: 11,
        color: t.textDim,
        letterSpacing: '.04em',
      }}
    >
      <span>{count}</span>
      <span style={{ display: 'inline-flex', gap: 14 }}>
        {hints.map((h, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            {h.keys.map((k, j) => (
              <kbd
                key={j}
                style={{
                  fontFamily: FONT.mono,
                  fontSize: 10,
                  padding: '2px 6px',
                  borderRadius: 5,
                  background: t.raised,
                }}
              >
                {k}
              </kbd>
            ))}
            <span>{h.label}</span>
          </span>
        ))}
      </span>
    </div>
  );
}

// ① empty
function PaletteEmpty({ theme = 'dark' }) {
  const t = THEME[theme];
  return (
    <PaletteShell theme={theme}>
      <PaletteInput t={t} value="" placeholder="Search notes · run a command · type / for AI…" />
      <PaletteSection t={t} label="Suggested">
        <PaletteItem t={t} icon="plus" label="New note" hint="empty buffer" keys={['⌘', 'N']} sel />
        <PaletteItem t={t} icon="search" label="Search across all notes" keys={['⌘', '⇧', 'F']} />
        <PaletteItem t={t} icon="bolt" label="Quick capture to inbox" keys={['⌘', '⇧', 'I']} />
      </PaletteSection>
      <PaletteSection t={t} label="Recent">
        <PaletteItem t={t} icon="file" label="weekend.md" hint="edited 2m ago" keys={['⌘', '1']} />
        <PaletteItem t={t} icon="file" label="imports of Selimović" hint="1d ago" />
        <PaletteItem t={t} icon="file" label="sveska v0.1 ship list" hint="3h ago" />
      </PaletteSection>
      <PaletteSection t={t} label="AI commands">
        <PaletteItem
          t={t}
          icon="sparkle"
          label="/improve"
          hint="— tighten this paragraph"
          ai
        />
        <PaletteItem t={t} icon="bullets" label="/summarize" hint="— note → 3 bullets" ai />
      </PaletteSection>
      <PaletteFoot
        t={t}
        count="8 suggestions"
        hints={[
          { keys: ['↑', '↓'], label: 'navigate' },
          { keys: ['↵'], label: 'run' },
          { keys: ['esc'], label: 'close' },
        ]}
      />
    </PaletteShell>
  );
}

// ② filtered (query "imp")
function PaletteFiltered({ theme = 'dark' }) {
  const t = THEME[theme];
  return (
    <PaletteShell theme={theme}>
      <PaletteInput t={t} value="imp" placeholder="" />
      <PaletteSection t={t} label="AI commands">
        <PaletteItem
          t={t}
          icon="sparkle"
          label="/improve"
          hint="— tighten this paragraph"
          keys={['↵']}
          sel
          ai
        />
        <PaletteItem t={t} icon="sparkle" label="/improve · expand" hint="— add depth + examples" ai />
      </PaletteSection>
      <PaletteSection t={t} label="Notes">
        <PaletteItem
          t={t}
          icon="file"
          label="Open · imports of Selimović"
          keys={['⌘', '1']}
        />
      </PaletteSection>
      <PaletteSection t={t} label="Actions">
        <PaletteItem t={t} icon="download" label="Import .md / .txt…" keys={['⌘', 'I']} />
      </PaletteSection>
      <PaletteFoot
        t={t}
        count="4 results"
        hints={[
          { keys: ['↑', '↓'], label: 'navigate' },
          { keys: ['↵'], label: 'run' },
          { keys: ['esc'], label: 'close' },
        ]}
      />
    </PaletteShell>
  );
}

// ③ context picker for /improve
function PaletteContext({ theme = 'dark' }) {
  const t = THEME[theme];
  return (
    <PaletteShell theme={theme} width={640}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '14px 18px',
          borderBottom: `1px solid ${t.border}`,
          background: `color-mix(in oklab, ${t.ai} 10%, transparent)`,
        }}
      >
        <span
          style={{
            width: 26,
            height: 26,
            borderRadius: 7,
            background: `color-mix(in oklab, ${t.ai} 18%, transparent)`,
            color: t.ai,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="sparkle" size={14} />
        </span>
        <span style={{ flex: 1, fontFamily: FONT.ui, fontSize: 15 }}>
          <span style={{ color: t.ai }}>/improve</span>{' '}
          <span style={{ color: t.textDim }}>— choose the context to send</span>
        </span>
        <span style={{ display: 'inline-flex', gap: 4 }}>
          <Kbd t={t} keys={['⌫']} dim />
          <span style={{ color: t.textDim, fontFamily: FONT.mono, fontSize: 10.5 }}>back</span>
        </span>
      </div>
      <PaletteSection t={t} label="Context">
        <PaletteItem
          t={t}
          icon="pen"
          label="Selection"
          hint="— 47 words · paragraph at line 12"
          keys={['↵']}
          sel
        />
        <PaletteItem
          t={t}
          icon="bullets"
          label="Paragraph at caret"
          hint="— 1 paragraph · 47 words"
        />
        <PaletteItem
          t={t}
          icon="file"
          label="Whole note"
          hint="— 312 words · ~ 1,847 chars"
        />
        <PaletteItem
          t={t}
          icon="copy"
          label="Last AI response"
          hint="— re-run /improve on the prior output"
        />
      </PaletteSection>
      <div
        style={{
          padding: '12px 18px',
          borderTop: `1px solid ${t.border}`,
          color: t.textDim,
          fontFamily: FONT.mono,
          fontSize: 10.5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>
          context stays local — only the selected scope leaves the device, once,
          through <span style={{ color: t.ai }}>/api/ai</span>.
        </span>
        <span style={{ display: 'inline-flex', gap: 14 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <Kbd t={t} keys={['↵']} dim /> send
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <Kbd t={t} keys={['esc']} dim /> cancel
          </span>
        </span>
      </div>
    </PaletteShell>
  );
}

// ④ no-key graceful degradation
function PaletteNoKey({ theme = 'dark' }) {
  const t = THEME[theme];
  return (
    <PaletteShell theme={theme} width={620}>
      <PaletteInput t={t} value="/improve" placeholder="" focused={false} />
      <div style={{ padding: '24px 22px', display: 'flex', gap: 16 }}>
        <span
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: `color-mix(in oklab, ${TOKENS.danger} 18%, transparent)`,
            color: TOKENS.danger,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon name="warn" size={18} />
        </span>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: FONT.display,
              fontSize: 17,
              fontWeight: 700,
              color: t.text,
              marginBottom: 6,
              letterSpacing: '-0.01em',
            }}
          >
            <span style={{ color: TOKENS.danger }}>/api/ai</span> is unreachable.
          </div>
          <div style={{ color: t.textDim, fontSize: 14, lineHeight: 1.55, marginBottom: 14 }}>
            The edge proxy returned 401 or did not respond. Your note is safe — AI runs against
            a server-side key vault, never the browser. Local commands still work.
          </div>
          <div style={{ display: 'inline-flex', gap: 10, marginBottom: 14 }}>
            <button
              type="button"
              style={{
                background: t.accent,
                color: TOKENS.ink900,
                border: 0,
                borderRadius: 10,
                fontFamily: FONT.ui,
                fontWeight: 700,
                fontSize: 13,
                padding: '0 14px',
                height: 34,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
              }}
            >
              <Icon name="retry" size={14} />
              Retry once
            </button>
            <button
              type="button"
              style={{
                background: 'transparent',
                color: t.text,
                border: 0,
                boxShadow: `inset 0 0 0 1px ${t.border}`,
                borderRadius: 10,
                fontFamily: FONT.ui,
                fontWeight: 700,
                fontSize: 13,
                padding: '0 14px',
                height: 34,
                cursor: 'pointer',
              }}
            >
              Configure proxy URL
            </button>
            <button
              type="button"
              style={{
                background: 'transparent',
                color: t.textDim,
                border: 0,
                borderRadius: 10,
                fontFamily: FONT.ui,
                fontSize: 13,
                padding: '0 14px',
                height: 34,
                cursor: 'pointer',
              }}
            >
              Continue without AI
            </button>
          </div>
          <PaletteSection t={t} label="Local-only commands still work">
            <PaletteItem t={t} icon="bullets" label="Outline · headings + first lines" />
            <PaletteItem t={t} icon="search" label="Find & replace" keys={['⌘', 'F']} />
            <PaletteItem t={t} icon="download" label="Export .md" keys={['⌘', 'S']} />
          </PaletteSection>
        </div>
      </div>
      <PaletteFoot
        t={t}
        count="degraded · proxy offline"
        hints={[
          { keys: ['R'], label: 'retry' },
          { keys: ['esc'], label: 'close' },
        ]}
      />
    </PaletteShell>
  );
}

// ─────────────────────────────────────────────────────────────────
// SlashMenu — small floating menu anchored under the caret
// ─────────────────────────────────────────────────────────────────
function SlashMenu({ theme = 'dark' }) {
  const t = THEME[theme];
  const items = [
    { icon: 'sparkle', label: '/improve', hint: 'tighten this paragraph', sel: true, ai: true },
    { icon: 'bullets', label: '/summarize', hint: 'collapse to 3 bullets', ai: true },
    { icon: 'pen', label: '/continue', hint: 'write what comes next', ai: true },
    { icon: 'retry', label: '/rewrite', hint: 'same idea, different voice', ai: true },
    { icon: 'copy', label: '/linkedin', hint: 'copy as LinkedIn post', ai: true },
  ];
  return (
    <div
      style={{
        width: 360,
        background: t.surface,
        border: `1px solid ${t.border}`,
        borderRadius: 12,
        overflow: 'hidden',
        fontFamily: FONT.ui,
        color: t.text,
        boxShadow: '0 18px 40px rgba(0,0,0,.55)',
      }}
    >
      <div
        style={{
          padding: '8px 14px',
          borderBottom: `1px solid ${t.border}`,
          fontFamily: FONT.mono,
          fontSize: 10.5,
          letterSpacing: '.12em',
          textTransform: 'uppercase',
          color: t.textDim,
        }}
      >
        Slash · AI commands
      </div>
      {items.map((it, i) => (
        <PaletteItem
          key={i}
          t={t}
          icon={it.icon}
          label={it.label}
          hint={`— ${it.hint}`}
          sel={it.sel}
          ai={it.ai}
          keys={it.sel ? ['↵'] : undefined}
        />
      ))}
      <div
        style={{
          padding: '8px 14px',
          borderTop: `1px solid ${t.border}`,
          fontFamily: FONT.mono,
          fontSize: 10.5,
          color: t.textDim,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span>5 commands</span>
        <span style={{ display: 'inline-flex', gap: 8 }}>
          <Kbd t={t} keys={['↑', '↓']} dim />
          <span>navigate</span>
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// StreamHUD — top-right floating panel showing the AI is streaming.
// Also paints cyan rings on the touched line numbers (rendered into the
// gutter of the underlying AppShell's editor — but since this is a static
// mock, we render decorative ring chips here).
// ─────────────────────────────────────────────────────────────────
function StreamHUD({ theme = 'dark' }) {
  const t = THEME[theme];
  return (
    <div
      style={{
        width: 340,
        background: t.surface,
        border: `1px solid ${t.border}`,
        borderRadius: 14,
        padding: 18,
        boxShadow: '0 18px 40px rgba(0,0,0,.55)',
        fontFamily: FONT.ui,
        color: t.text,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <span
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: `color-mix(in oklab, ${t.ai} 18%, transparent)`,
            color: t.ai,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="sparkle" size={14} />
        </span>
        <div style={{ flex: 1, lineHeight: 1.3 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>
            <span style={{ color: t.ai }}>/improve</span> · streaming
          </div>
          <div
            style={{
              fontFamily: FONT.mono,
              fontSize: 11,
              color: t.textDim,
              letterSpacing: '.04em',
              textTransform: 'uppercase',
            }}
          >
            paragraph at line 12 · 47 → 39 words
          </div>
        </div>
        <button
          type="button"
          title="Cancel"
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: 'transparent',
            color: t.textDim,
            border: 0,
            cursor: 'pointer',
          }}
        >
          <Icon name="x" size={14} />
        </button>
      </div>

      <div
        style={{
          height: 6,
          borderRadius: 999,
          background: t.raised,
          overflow: 'hidden',
          position: 'relative',
          marginBottom: 12,
        }}
      >
        <div
          data-sveska-anim
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(90deg, transparent, ${t.ai}, transparent)`,
            animation: 'sveska-stream 1.4s linear infinite',
          }}
        />
      </div>

      <div
        style={{
          fontFamily: FONT.mono,
          fontSize: 12,
          color: t.text,
          lineHeight: 1.55,
          background: t.bg,
          border: `1px solid ${t.border}`,
          borderRadius: 8,
          padding: '10px 12px',
          maxHeight: 88,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        Local-first means the app keeps working when the network does not.
        <br />
        Notes live in IndexedDB; keys never leave the
        <span data-sveska-anim style={{
          display: 'inline-block', width: 2, height: 14, background: t.ai, verticalAlign: '-3px', marginLeft: 1,
          animation: 'sveska-caret 1.1s steps(1) infinite',
        }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
        <span
          style={{
            fontFamily: FONT.mono,
            fontSize: 10.5,
            color: t.textDim,
            letterSpacing: '.04em',
            textTransform: 'uppercase',
          }}
        >
          0.6s · 142 tokens · streaming
        </span>
        <span style={{ display: 'inline-flex', gap: 6 }}>
          <Kbd t={t} keys={['esc']} dim />
          <span style={{ color: t.textDim, fontFamily: FONT.mono, fontSize: 11 }}>cancel</span>
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// DiffPanel — center modal: original/rewritten + accept/reject/retry
// ─────────────────────────────────────────────────────────────────
function DiffPanel({ theme = 'dark' }) {
  const t = THEME[theme];
  const isDark = theme === 'dark';

  const addRowBg = isDark ? 'rgba(111,207,127,.10)' : 'rgba(84,168,98,.12)';
  const delRowBg = isDark ? 'rgba(229,96,77,.10)' : 'rgba(184,75,60,.10)';
  const addMark = TOKENS.ok;
  const delMark = TOKENS.danger;

  return (
    <div
      style={{
        width: 760,
        maxWidth: '92vw',
        background: t.surface,
        border: `1px solid ${t.border}`,
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow:
          isDark
            ? '0 1px 0 rgba(255,255,255,.03), 0 32px 80px rgba(0,0,0,.6)'
            : '0 1px 0 rgba(0,0,0,.02), 0 32px 80px rgba(20,17,10,.22)',
        fontFamily: FONT.ui,
        color: t.text,
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '16px 22px',
          borderBottom: `1px solid ${t.border}`,
          background: `color-mix(in oklab, ${t.ai} 6%, transparent)`,
        }}
      >
        <span
          style={{
            width: 26,
            height: 26,
            borderRadius: 7,
            background: `color-mix(in oklab, ${t.ai} 18%, transparent)`,
            color: t.ai,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="sparkle" size={14} />
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: t.text }}>
            <span style={{ color: t.ai }}>/improve</span> · diff ready
          </div>
          <div
            style={{
              fontFamily: FONT.mono,
              fontSize: 11,
              color: t.textDim,
              letterSpacing: '.04em',
              textTransform: 'uppercase',
            }}
          >
            paragraph · line 12 · 47 → 39 words · 1.2s · 162 tokens
          </div>
        </div>
        <button
          type="button"
          title="Close"
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: 'transparent',
            color: t.textDim,
            border: 0,
            cursor: 'pointer',
          }}
        >
          <Icon name="x" size={14} />
        </button>
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          borderBottom: `1px solid ${t.border}`,
        }}
      >
        <DiffPane
          t={t}
          tone="before"
          markBg={delRowBg}
          mark={delMark}
          lines={[
            'Local-first means the app keeps working when the network does not.',
            'Notes live in IndexedDB, the canvas renders offline, and keys never travel',
            'through the browser. The folded page does not need permission to be written on.',
          ]}
        />
        <DiffPane
          t={t}
          tone="after"
          markBg={addRowBg}
          mark={addMark}
          lines={[
            'Local-first means the app keeps working without the network.',
            'Notes live in IndexedDB; the canvas renders offline; keys never reach the browser.',
            'The folded page never asked for permission to be written on.',
          ]}
        />
      </div>

      <footer
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 22px',
          background: t.bg,
        }}
      >
        <span
          style={{
            fontFamily: FONT.mono,
            fontSize: 11,
            color: t.textDim,
            letterSpacing: '.04em',
            textTransform: 'uppercase',
          }}
        >
          ◀ original · proposed ▶
        </span>
        <div style={{ display: 'inline-flex', gap: 10 }}>
          <button
            type="button"
            style={{
              background: 'transparent',
              color: TOKENS.danger,
              border: 0,
              boxShadow: `inset 0 0 0 1px ${isDark ? 'rgba(229,96,77,.34)' : 'rgba(184,75,60,.4)'}`,
              borderRadius: 10,
              fontFamily: FONT.ui,
              fontWeight: 700,
              fontSize: 13,
              padding: '0 14px',
              height: 36,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
            }}
          >
            <Icon name="x" size={14} />
            Reject
            <Kbd t={t} keys={['⌫']} dim />
          </button>
          <button
            type="button"
            style={{
              background: 'transparent',
              color: t.text,
              border: 0,
              boxShadow: `inset 0 0 0 1px ${t.border}`,
              borderRadius: 10,
              fontFamily: FONT.ui,
              fontWeight: 700,
              fontSize: 13,
              padding: '0 14px',
              height: 36,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
            }}
          >
            <Icon name="retry" size={14} />
            Retry
            <Kbd t={t} keys={['⌥', 'R']} dim />
          </button>
          <button
            type="button"
            style={{
              background: t.accent,
              color: TOKENS.ink900,
              border: 0,
              borderRadius: 10,
              fontFamily: FONT.ui,
              fontWeight: 700,
              fontSize: 13,
              padding: '0 14px',
              height: 36,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
            }}
          >
            <Icon name="check2" size={14} />
            Accept
            <span
              style={{
                fontFamily: FONT.mono,
                fontSize: 10.5,
                padding: '2px 6px',
                borderRadius: 5,
                background: 'rgba(0,0,0,.18)',
                color: TOKENS.ink900,
              }}
            >
              ↵
            </span>
          </button>
        </div>
      </footer>
    </div>
  );
}

function DiffPane({ t, tone, markBg, mark, lines }) {
  return (
    <div style={{ padding: '14px 0', background: t.surface }}>
      <div
        style={{
          fontFamily: FONT.mono,
          fontSize: 10.5,
          letterSpacing: '.12em',
          textTransform: 'uppercase',
          color: t.textDim,
          padding: '0 22px 10px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: 999,
            background: mark,
            display: 'inline-block',
          }}
        />
        {tone === 'before' ? 'before · original' : 'after · proposed'}
      </div>
      <div
        style={{
          fontFamily: FONT.mono,
          fontSize: 13,
          lineHeight: 1.65,
          color: t.text,
          padding: '0 22px',
        }}
      >
        {lines.map((line, i) => (
          <div
            key={i}
            style={{
              background: markBg,
              borderLeft: `3px solid ${mark}`,
              padding: '4px 10px',
              marginBottom: 2,
              borderRadius: 3,
              whiteSpace: 'pre-wrap',
            }}
          >
            <span style={{ color: mark, marginRight: 8, opacity: 0.7 }}>
              {tone === 'before' ? '−' : '+'}
            </span>
            {line}
          </div>
        ))}
      </div>
    </div>
  );
}

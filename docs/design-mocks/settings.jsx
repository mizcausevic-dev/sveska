// Settings panels — composes the Preference Row pattern from the design system.
// Reuses SVESKA_TOKENS from app-shell.jsx (must be loaded first).
// Each section renders inside <SettingsShell sectionId=...>.

const { useState: useStateS } = React;

// ─── shared atoms ───
const SIcon = ({d, w=14, sw=1.75, children}) => (
  <svg viewBox="0 0 24 24" width={w} height={w} fill="none" stroke="currentColor"
       strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    {d ? <path d={d}/> : children}
  </svg>
);
const SKbd = ({children, big}) => (
  <span style={{
    fontFamily:'var(--font-mono)',
    fontSize: big ? 12 : 10.5,
    padding: big ? '3px 9px' : '1px 6px',
    borderRadius:5, background:'var(--raised)', color:'var(--text-dim)',
    letterSpacing:'.04em',
  }}>{children}</span>
);

// ─── chrome ───
function SettingsWindowBar() {
  return (
    <div style={{
      height:44, flexShrink:0,
      background:'var(--bg)',
      borderBottom:'1px solid var(--border-soft)',
      display:'flex', alignItems:'center', gap:14, padding:'0 16px',
    }}>
      <div style={{display:'flex', gap:8}}>
        <span style={{width:12,height:12,borderRadius:999,background:'#ff5f57'}}/>
        <span style={{width:12,height:12,borderRadius:999,background:'#febc2e'}}/>
        <span style={{width:12,height:12,borderRadius:999,background:'#28c840'}}/>
      </div>
      <div style={{width:1, height:18, background:'var(--border-soft)'}}/>
      <span style={{
        fontFamily:'var(--font-mono)', fontSize:11.5, color:'var(--text-dim)',
        letterSpacing:'.06em',
      }}>
        <span style={{color:'var(--text)'}}>sveska</span> · settings
      </span>
      <div style={{flex:1}}/>
      <span style={{
        fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-dim)',
        letterSpacing:'.04em', display:'inline-flex', gap:6, alignItems:'center',
      }}>
        <span style={{width:6, height:6, borderRadius:999, background:'var(--ok)'}}/>
        Saved · 2s ago
      </span>
      <button style={{
        appearance:'none', border:0, cursor:'pointer',
        width:30, height:30, borderRadius:7, color:'var(--text-dim)',
        background:'transparent', marginLeft:12,
        display:'inline-flex', alignItems:'center', justifyContent:'center',
      }}>
        <SIcon d="M18 6L6 18M6 6l12 12" w={14} sw={2}/>
      </button>
    </div>
  );
}

function NavRail({active}) {
  const items = [
    ['editor',     'Editor',          'M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z'],
    ['appearance', 'Appearance',      'M12 2v2M12 20v2M5 12H3M21 12h-2M16.95 7.05l1.41-1.41M5.64 18.36l1.41-1.41M16.95 16.95l1.41 1.41M5.64 5.64L7.05 7.05M12 8a4 4 0 0 0 0 8'],
    ['ai',         'AI · proxy',      'M12 2l2.3 5.3L20 9.5l-4.5 3.8L17 19l-5-3-5 3 1.5-5.7L4 9.5l5.7-2.2z'],
    ['data',       'Data · backup',   'M3 6c0-1.7 4-3 9-3s9 1.3 9 3v12c0 1.7-4 3-9 3s-9-1.3-9-3zM3 6v6c0 1.7 4 3 9 3s9-1.3 9-3V6'],
    ['privacy',    'Privacy',         'M12 1l9 4v7c0 6-9 11-9 11s-9-5-9-11V5z'],
    ['keyboard',   'Keyboard',        'M6 8h.01M10 8h.01M14 8h.01M18 8h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M7 16h10M3 4h18a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z'],
    ['about',      'About',           'M12 16v-4M12 8h.01M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z'],
  ];
  return (
    <aside style={{
      width:260, flexShrink:0,
      background:'var(--surface)',
      borderRight:'1px solid var(--border-soft)',
      display:'flex', flexDirection:'column',
      padding:'18px 12px',
    }}>
      <div style={{
        fontFamily:'var(--font-display)', fontWeight:700, fontSize:22,
        letterSpacing:'-0.018em', color:'var(--text)',
        padding:'8px 12px 16px',
      }}>Settings</div>
      <div style={{display:'flex', flexDirection:'column', gap:2}}>
        {items.map(([id,label,d])=>{
          const on = id===active;
          return (
            <button key={id} style={{
              appearance:'none', border:0, cursor:'pointer',
              display:'flex', alignItems:'center', gap:12,
              padding:'8px 12px', borderRadius:8,
              background: on ? 'color-mix(in oklab, var(--accent) 14%, transparent)' : 'transparent',
              color: on ? 'var(--text)' : 'var(--text-dim)',
              fontFamily:'var(--font-ui)', fontSize:13.5, fontWeight:500, textAlign:'left',
            }}>
              <span style={{color: on ? 'var(--accent)' : 'var(--text-dim)', display:'inline-flex'}}>
                <SIcon d={d} w={15} sw={1.6}/>
              </span>
              <span style={{flex:1}}>{label}</span>
              {on && <SIcon d="M9 6l6 6-6 6" w={11} sw={2}/>}
            </button>
          );
        })}
      </div>
      <div style={{flex:1}}/>
      <div style={{
        padding:'14px 12px', borderTop:'1px solid var(--border-soft)',
        margin:'8px -4px -4px',
      }}>
        <div style={{
          fontFamily:'var(--font-mono)', fontSize:10.5, letterSpacing:'.08em',
          textTransform:'uppercase', color:'var(--text-dim)', marginBottom:6,
        }}>Version</div>
        <div style={{
          fontFamily:'var(--font-mono)', fontSize:12, color:'var(--text)',
          display:'flex', justifyContent:'space-between',
        }}>
          <span>v0.1.0</span><span style={{color:'var(--text-dim)'}}>2026.05.16</span>
        </div>
      </div>
    </aside>
  );
}

// ─── building blocks ───
function PageHead({eyebrow, title, sub}) {
  return (
    <div style={{padding:'32px 40px 18px', borderBottom:'1px solid var(--border-soft)'}}>
      <div style={{
        fontFamily:'var(--font-mono)', fontSize:11, letterSpacing:'.12em',
        textTransform:'uppercase', color:'var(--accent)', marginBottom:8,
      }}>{eyebrow}</div>
      <div style={{
        fontFamily:'var(--font-display)', fontWeight:700, fontSize:34,
        letterSpacing:'-0.025em', color:'var(--text)', margin:'0 0 6px',
      }}>{title}</div>
      {sub && <div style={{color:'var(--text-dim)', fontSize:14, maxWidth:'62ch'}}>{sub}</div>}
    </div>
  );
}

function Group({title, hint, children}) {
  return (
    <div style={{padding:'14px 40px 20px', borderBottom:'1px solid var(--border-soft)'}}>
      <div style={{
        display:'flex', alignItems:'baseline', justifyContent:'space-between', gap:24,
        marginBottom:8,
      }}>
        <div style={{
          fontFamily:'var(--font-mono)', fontSize:11, letterSpacing:'.10em',
          textTransform:'uppercase', color:'var(--text-dim)',
        }}>{title}</div>
        {hint && <div style={{
          fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-dim)',
          letterSpacing:'.04em',
        }}>{hint}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}

function Row({name, hint, children, danger}) {
  return (
    <div style={{
      display:'grid', gridTemplateColumns:'1fr auto', gap:24,
      alignItems:'center', padding:'14px 0',
      borderTop:'1px solid var(--border-soft)',
    }}>
      <div>
        <div style={{
          fontFamily:'var(--font-ui)', fontWeight:500, fontSize:14.5,
          color: danger ? 'var(--danger)' : 'var(--text)',
        }}>{name}</div>
        {hint && <div style={{
          fontFamily:'var(--font-mono)', fontSize:11.5, color:'var(--text-dim)',
          letterSpacing:'.02em', marginTop:3, lineHeight:1.45,
        }}>{hint}</div>}
      </div>
      <div style={{display:'flex', alignItems:'center', justifyContent:'flex-end'}}>{children}</div>
    </div>
  );
}

// ─── controls ───
function Slider({pct=50, value}) {
  return (
    <div style={{display:'flex', alignItems:'center', gap:14, minWidth:260}}>
      <div style={{position:'relative', height:4, background:'var(--raised)', borderRadius:999, flex:1}}>
        <div style={{position:'absolute', left:0, top:0, bottom:0, width:pct+'%', background:'var(--accent)', borderRadius:999}}/>
        <div style={{
          position:'absolute', top:'50%', left:pct+'%', transform:'translate(-50%, -50%)',
          width:16, height:16, borderRadius:999, background:'var(--text)',
          boxShadow:'0 0 0 4px var(--bg), 0 0 0 5px var(--accent)',
        }}/>
      </div>
      <div style={{
        fontFamily:'var(--font-mono)', fontSize:12, color:'var(--text)',
        minWidth:60, textAlign:'right',
      }}>{value}</div>
    </div>
  );
}
function Toggle({on}) {
  return (
    <div style={{
      width:38, height:22, borderRadius:999, position:'relative',
      background: on ? 'color-mix(in oklab, var(--accent) 60%, transparent)' : 'var(--raised)',
    }}>
      <div style={{
        position:'absolute', top:2, left: on?18:2, width:18, height:18,
        borderRadius:999, background: on ? 'var(--accent)' : 'var(--text-dim)',
        transition:'left .15s ease, background .15s ease',
      }}/>
    </div>
  );
}
function Segmented({options, value}) {
  return (
    <div style={{
      display:'inline-flex', background:'var(--raised)', borderRadius:8, padding:2,
      fontFamily:'var(--font-mono)', fontSize:11, letterSpacing:'.04em',
    }}>
      {options.map(o=>{
        const on = o===value;
        return <span key={o} style={{
          padding:'5px 11px', borderRadius:6,
          background: on ? 'var(--surface)' : 'transparent',
          color: on ? 'var(--text)' : 'var(--text-dim)',
          boxShadow: on ? '0 1px 0 rgba(0,0,0,.18)' : 'none',
          cursor:'pointer',
        }}>{o}</span>;
      })}
    </div>
  );
}
function SButton({label, ghost, primary, danger, kb}) {
  let style;
  if (primary) style = {background:'var(--accent)', color:'#0C0C0E', boxShadow:'none'};
  else if (danger) style = {background:'transparent', color:'var(--danger)', boxShadow:'inset 0 0 0 1px color-mix(in oklab, var(--danger) 40%, transparent)'};
  else style = {background:'transparent', color:'var(--text)', boxShadow:'inset 0 0 0 1px var(--border-soft)'};
  return (
    <button style={{
      appearance:'none', border:0, cursor:'pointer',
      height:34, padding:'0 14px', borderRadius:8,
      fontFamily:'var(--font-ui)', fontWeight:700, fontSize:13,
      display:'inline-flex', alignItems:'center', gap:8,
      letterSpacing:'-0.005em',
      ...style,
    }}>
      {label}
      {kb && <span style={{
        fontFamily:'var(--font-mono)', fontSize:10.5, padding:'1px 5px',
        borderRadius:5,
        background: primary ? 'rgba(0,0,0,.18)' : 'var(--raised)',
        color: primary ? 'inherit' : 'var(--text-dim)',
      }}>{kb}</span>}
    </button>
  );
}

// ─── sections ───
function EditorSection() {
  return (
    <>
      <PageHead eyebrow="Editor" title="How notes feel."
        sub="The page is yours. Type-size, rhythm, indents, and the optional textures that make blank paper less blank."/>
      <Group title="Typography" hint="17 px / 1.7 — sveska defaults">
        <Row name="Editor font size" hint="Scales the note body. 13–22 px.">
          <Slider pct={42} value="17 px"/>
        </Row>
        <Row name="Line height" hint="The paper rhythm — 1.3 tight, 2.0 spacious.">
          <Slider pct={64} value="1.7"/>
        </Row>
        <Row name="Font family" hint="Preset for the editor surface only.">
          <Segmented options={['mono','satoshi','serif','dyslexic']} value="mono"/>
        </Row>
        <Row name="Letter spacing" hint="Mono only · slight + or − tracking.">
          <Slider pct={50} value="0"/>
        </Row>
      </Group>

      <Group title="Editing" hint="M1.6 + M3.5 + M3.6">
        <Row name="Spellcheck" hint="Uses the browser's native dictionary. Offline.">
          <Toggle on/>
        </Row>
        <Row name="Tab inserts indent" hint="Otherwise — Tab moves focus to the next field.">
          <Toggle on/>
        </Row>
        <Row name="Tab size">
          <Segmented options={['2','4','tab']} value="2"/>
        </Row>
        <Row name="Auto-pair brackets · quotes">
          <Toggle/>
        </Row>
        <Row name="Trim trailing whitespace on save">
          <Toggle on/>
        </Row>
      </Group>

      <Group title="Focus · typewriter">
        <Row name="Focus margin" hint="Alt+F. Hides chrome; widens side margins.">
          <Slider pct={55} value="160 px"/>
        </Row>
        <Row name="Typewriter mode" hint="Pins the active line to the vertical center.">
          <Toggle on/>
        </Row>
        <Row name="Typing sounds" hint="Key · space · enter samples. Quiet by default.">
          <Toggle/>
        </Row>
        <Row name="Typing volume" hint="Disabled while typing sounds are off.">
          <Slider pct={20} value="20 %"/>
        </Row>
      </Group>
    </>
  );
}

function AppearanceSection() {
  return (
    <>
      <PageHead eyebrow="Appearance" title="Light it as you like."
        sub="Dark is the default. Light mirrors surfaces. The accent stays amber, always; you choose the paper underneath."/>
      <Group title="Theme" hint="M0.2 — persists across sessions">
        <Row name="Theme">
          <ThemePicker/>
        </Row>
        <Row name="Honor system preference"
          hint="Watch prefers-color-scheme and follow it; your manual override wins until you reset.">
          <Toggle on/>
        </Row>
        <Row name="Reduced motion"
          hint="Stops the snapshot dot from pulsing. Respects OS prefers-reduced-motion.">
          <Segmented options={['auto','off','on']} value="auto"/>
        </Row>
      </Group>

      <Group title="Surface" hint="paper texture · M3.6">
        <Row name="Paper texture" hint="CSS-only — no performance cost.">
          <TexturePicker/>
        </Row>
        <Row name="UI font" hint="Satoshi for chrome · Newsreader for serif lovers · Atkinson for low-vision.">
          <Segmented options={['satoshi','newsreader','atkinson']} value="satoshi"/>
        </Row>
        <Row name="Accent color" hint="Choose from curated set — never invent.">
          <AccentPicker/>
        </Row>
      </Group>

      <Group title="Chrome">
        <Row name="Show tab strip" hint="Always · Multiple notes · Never (focus mode is one tab).">
          <Segmented options={['always','multi','never']} value="multi"/>
        </Row>
        <Row name="Status bar slots" hint="Toggle which slots appear in the bottom strip.">
          <span style={{display:'inline-flex', gap:6}}>
            {[['saved',true],['words',true],['cursor',true],['encoding',false],['network',true]].map(([t,on])=>(
              <span key={t} style={{
                fontFamily:'var(--font-mono)', fontSize:11, padding:'4px 9px',
                borderRadius:6,
                background: on ? 'color-mix(in oklab, var(--accent) 14%, transparent)' : 'var(--raised)',
                color: on ? 'var(--text)' : 'var(--text-dim)',
              }}>{on ? '●' : '○'} {t}</span>
            ))}
          </span>
        </Row>
      </Group>
    </>
  );
}

function ThemePicker() {
  const opts = [
    ['dark',   'Dark',   '#0C0C0E', '#F2B544'],
    ['light',  'Light',  '#F4EFE6', '#EDA92E'],
    ['system', 'System', null,      '#4FD6C4'],
  ];
  return (
    <div style={{display:'flex', gap:10}}>
      {opts.map(([id,label,bg,dot])=>{
        const on = id==='dark';
        return (
          <div key={id} style={{
            width:88,
            borderRadius:10,
            padding:6, cursor:'pointer',
            background:'var(--raised)',
            boxShadow: on ? 'inset 0 0 0 2px var(--accent)' : 'inset 0 0 0 1px var(--border-soft)',
          }}>
            <div style={{
              height:50, borderRadius:6,
              background: bg ?? 'linear-gradient(135deg, #0C0C0E 0 50%, #F4EFE6 50% 100%)',
              display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow:'inset 0 0 0 1px var(--border-soft)',
            }}>
              <span style={{
                width:8, height:8, borderRadius:999, background:dot,
              }}/>
            </div>
            <div style={{
              fontFamily:'var(--font-mono)', fontSize:11, color: on?'var(--text)':'var(--text-dim)',
              textAlign:'center', marginTop:6, letterSpacing:'.04em',
            }}>{label}</div>
          </div>
        );
      })}
    </div>
  );
}

function TexturePicker() {
  const textures = [
    ['none',   null,              true],
    ['dotted', 'radial-gradient(circle, var(--text-dim) 1px, transparent 1.5px) 0 0/14px 14px', false],
    ['graph',  'linear-gradient(var(--border-soft) 1px, transparent 1px) 0 0/20px 20px, linear-gradient(90deg, var(--border-soft) 1px, transparent 1px) 0 0/20px 20px', false],
    ['linen',  'repeating-linear-gradient(45deg, color-mix(in oklab, var(--text-dim) 8%, transparent) 0 1px, transparent 1px 6px)', false],
    ['grain',  'repeating-radial-gradient(circle at 25% 30%, color-mix(in oklab, var(--text-dim) 12%, transparent) 0 1px, transparent 1px 3px)', false],
  ];
  return (
    <div style={{display:'flex', gap:8}}>
      {textures.map(([id, tex, on])=>(
        <div key={id} style={{
          width:64, cursor:'pointer',
        }}>
          <div style={{
            height:46, borderRadius:8,
            background:'var(--bg)',
            backgroundImage: tex || 'none',
            boxShadow: on ? 'inset 0 0 0 2px var(--accent)' : 'inset 0 0 0 1px var(--border-soft)',
          }}/>
          <div style={{
            fontFamily:'var(--font-mono)', fontSize:10.5, color: on?'var(--text)':'var(--text-dim)',
            textAlign:'center', marginTop:5, letterSpacing:'.04em',
          }}>{id}</div>
        </div>
      ))}
    </div>
  );
}

function AccentPicker() {
  // Only amber is canonical — others are visual placeholders showing that
  // the option exists but is locked to amber by brand.
  const swatches = [
    ['#F2B544','amber',true],
  ];
  return (
    <div style={{display:'inline-flex', gap:8, alignItems:'center'}}>
      {swatches.map(([c,n,on])=>(
        <span key={c} style={{
          width:24, height:24, borderRadius:999, background:c,
          boxShadow: on ? '0 0 0 2px var(--bg), 0 0 0 4px var(--accent)' : 'inset 0 0 0 1px var(--border-soft)',
          cursor:'pointer',
        }} title={n}/>
      ))}
      <span style={{
        fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-dim)',
        padding:'4px 9px', borderRadius:6, background:'var(--raised)',
        marginLeft:6, letterSpacing:'.04em',
      }}>🔒 brand-locked</span>
    </div>
  );
}

function AISection() {
  return (
    <>
      <PageHead eyebrow="AI · proxy" title="Capability, not coupling."
        sub="AI runs through an edge function — your browser never holds the key. Slash commands degrade gracefully when /api/ai is unreachable; everything local keeps working."/>

      <Group title="Connection" hint="M4 · security gate · CLAUDE.md §5">
        <Row name="Proxy endpoint"
          hint="Set in your deployment; read-only here. We route through this URL only.">
          <span style={{
            fontFamily:'var(--font-mono)', fontSize:12,
            padding:'7px 12px', borderRadius:7,
            background:'var(--bg)', boxShadow:'inset 0 0 0 1px var(--border-soft)',
            color:'var(--text)', display:'inline-flex', alignItems:'center', gap:10,
          }}>
            <span style={{
              width:8, height:8, borderRadius:999, background:'var(--ok)',
              boxShadow:'0 0 0 3px color-mix(in oklab, var(--ok) 22%, transparent)',
            }}/>
            https://sveska.studio/api/ai
            <span style={{color:'var(--text-dim)'}}>· edge · streamed</span>
          </span>
        </Row>
        <Row name="Status"
          hint="Last roundtrip · provider · rate-limit window.">
          <span style={{display:'inline-flex', gap:10, alignItems:'center'}}>
            <span style={{
              fontFamily:'var(--font-mono)', fontSize:11, padding:'4px 9px',
              borderRadius:6, background:'color-mix(in oklab, var(--ok) 14%, transparent)',
              color:'var(--ok)', letterSpacing:'.04em',
            }}>● online · 142 ms</span>
            <span style={{
              fontFamily:'var(--font-mono)', fontSize:11, padding:'4px 9px',
              borderRadius:6, background:'var(--raised)', color:'var(--text-dim)',
            }}>claude · haiku 4.5</span>
            <span style={{
              fontFamily:'var(--font-mono)', fontSize:11, padding:'4px 9px',
              borderRadius:6, background:'var(--raised)', color:'var(--text-dim)',
            }}>14 / 60 calls · 1m</span>
          </span>
        </Row>
        <Row name="Key in client"
          hint="The gate that fails the build. CI greps for VITE_*_API_KEY in the bundle.">
          <span style={{
            fontFamily:'var(--font-mono)', fontSize:11, padding:'4px 9px',
            borderRadius:6, background:'color-mix(in oklab, var(--ok) 14%, transparent)',
            color:'var(--ok)', letterSpacing:'.04em',
          }}>● none · verified</span>
        </Row>
      </Group>

      <Group title="Slash commands" hint="M4.2 — enable per command">
        {[
          ['/improve', 'tighten this paragraph', true],
          ['/summarize', 'note → 3 bullets', true],
          ['/continue', 'write the next paragraph', true],
          ['/rewrite', 'change tone or length', true],
          ['Notes → image', 'concise · detailed', false],
          ['Copy as LinkedIn post', 'one-tap export', false],
        ].map(([cmd, hint, on])=>(
          <Row key={cmd}
            name={<span><span style={{fontFamily:'var(--font-mono)', color:'var(--ai)'}}>{cmd.startsWith('/')?cmd:''}</span>{cmd.startsWith('/')?'':cmd}</span>}
            hint={hint}>
            <Toggle on={on}/>
          </Row>
        ))}
      </Group>

      <Group title="Behavior">
        <Row name="Apply mode"
          hint="How the streamed output meets the page.">
          <Segmented options={['diff','insert','replace']} value="diff"/>
        </Row>
        <Row name="Auto-trigger on selection"
          hint='Hold Alt to suggest /improve on any selection of more than 12 words.'>
          <Toggle/>
        </Row>
      </Group>
    </>
  );
}

function DataSection() {
  return (
    <>
      <PageHead eyebrow="Data · backup" title="It lives in your browser."
        sub="IndexedDB via Dexie. Nothing leaves this device unless you click an export. Snapshots are local, named, and you can prune them whenever."/>

      <Group title="Storage" hint="IndexedDB · 23 notes · 142 snapshots">
        <div style={{display:'flex', flexDirection:'column', gap:14, padding:'14px 0'}}>
          <StorageBar label="Notes"      mb={1.4}  pct={14} color="var(--accent)"/>
          <StorageBar label="Snapshots"  mb={3.8}  pct={38} color="var(--ai)"/>
          <StorageBar label="Canvas"     mb={0.9}  pct={9}  color="var(--ok)"/>
          <StorageBar label="Inbox · templates · snippets" mb={0.3} pct={3} color="var(--text-dim)"/>
        </div>
        <Row name="Total" hint="of ~50 MB conservatively safe in IndexedDB across browsers">
          <span style={{
            fontFamily:'var(--font-mono)', fontSize:14, color:'var(--text)',
          }}>6.4 / 50 MB</span>
        </Row>
      </Group>

      <Group title="Snapshots" hint="M1.2 · point-in-time copies">
        <Row name="Auto-snapshot interval" hint="Captures a quiet checkpoint every N minutes of writing.">
          <Slider pct={40} value="5 min"/>
        </Row>
        <Row name="Retention" hint="Auto-discard unnamed snapshots older than N days. Named ones stay forever.">
          <Slider pct={30} value="30 days"/>
        </Row>
        <Row name="Sync · post-M6"
          hint="Will ship E2E-encrypted or not ship. See parking lot in CLAUDE.md.">
          <span style={{
            fontFamily:'var(--font-mono)', fontSize:11, padding:'4px 9px',
            borderRadius:6, background:'var(--raised)', color:'var(--text-dim)',
            letterSpacing:'.04em',
          }}>not shipped</span>
        </Row>
      </Group>

      <Group title="Import · Export" hint="One AST · txt · md · html · pdf">
        <Row name="Export current note">
          <span style={{display:'inline-flex', gap:8}}>
            <SButton label=".txt"/>
            <SButton label=".md"/>
            <SButton label=".html"/>
            <SButton label=".pdf"/>
          </span>
        </Row>
        <Row name="Export everything"
          hint="Zip of all notes + snapshots as .md. No metadata leaves the device.">
          <SButton label="Download .zip"/>
        </Row>
        <Row name="Import"
          hint="Drop .md / .txt files anywhere on the editor. Or pick from disk.">
          <SButton label="Choose files…" kb="⌘I"/>
        </Row>
      </Group>

      <Group title="Danger zone">
        <Row name="Clear all snapshots" hint="Keeps notes. Removes every named and unnamed checkpoint." danger>
          <SButton label="Clear snapshots" danger/>
        </Row>
        <Row name="Delete all notes" hint="Soft-deleted — recoverable from Trash for 30 days. Then gone." danger>
          <SButton label="Move to Trash" danger/>
        </Row>
        <Row name="Reset Sveska" hint="Wipes IndexedDB, prefs, and snapshots. The notebook returns to empty." danger>
          <SButton label="Reset · type DELETE" danger/>
        </Row>
      </Group>
    </>
  );
}

function StorageBar({label, mb, pct, color}) {
  return (
    <div style={{display:'flex', alignItems:'center', gap:14}}>
      <span style={{
        width:180, fontFamily:'var(--font-ui)', fontSize:13.5, color:'var(--text)', fontWeight:500,
      }}>{label}</span>
      <div style={{flex:1, height:6, background:'var(--raised)', borderRadius:999, overflow:'hidden'}}>
        <div style={{height:'100%', width:pct+'%', background:color, borderRadius:999}}/>
      </div>
      <span style={{
        width:80, textAlign:'right',
        fontFamily:'var(--font-mono)', fontSize:12, color:'var(--text-dim)',
      }}>{mb.toFixed(1)} MB</span>
    </div>
  );
}

function KeyboardSection() {
  const shortcuts = [
    ['File', [
      ['New note',         ['⌘','N']],
      ['Save as .txt',     ['⌘','S']],
      ['Save snapshot',    ['⌘','⇧','S']],
      ['Import file…',     ['⌘','I']],
      ['Clear note',       ['Ctrl','Del']],
    ]],
    ['Navigation', [
      ['Command palette',  ['⌘','K']],
      ['Find in note',     ['⌘','F']],
      ['Replace',          ['⌘','⌥','F']],
      ['Preferences',      ['⌘',',']],
      ['Switch tab',       ['⌘','1–9']],
      ['Quick capture',    ['⌘','⇧','N']],
    ]],
    ['Editor', [
      ['Bold',             ['⌘','B']],
      ['Italic',           ['⌘','I']],
      ['Heading',          ['⌘','⌥','1–3']],
      ['Checklist',        ['⌘','⇧','L']],
      ['Focus mode',       ['Alt','F']],
      ['Typewriter',       ['Alt','T']],
      ['Statistics',       ['⌘','/']],
      ['Copy all',         ['Alt','C']],
    ]],
    ['AI · slash', [
      ['Slash menu',       ['/']],
      ['Run /improve',     ['⌘','↵']],
      ['Cancel stream',    ['esc']],
      ['Accept diff',      ['⌘','↵']],
      ['Reject diff',      ['esc']],
      ['Retry',            ['⌘','R']],
    ]],
  ];
  return (
    <>
      <PageHead eyebrow="Keyboard" title="Every action is a keystroke."
        sub="Sveska is keyboard-first. A11y rule of thumb — if you can't reach it without a mouse, the design isn't done."/>
      <div style={{padding:'18px 40px 40px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:24}}>
        {shortcuts.map(([group, list])=>(
          <div key={group}>
            <div style={{
              fontFamily:'var(--font-mono)', fontSize:11, letterSpacing:'.10em',
              textTransform:'uppercase', color:'var(--text-dim)',
              padding:'10px 0 4px', borderBottom:'1px solid var(--border-soft)', marginBottom:6,
            }}>{group}</div>
            {list.map(([name, keys])=>(
              <div key={name} style={{
                display:'flex', justifyContent:'space-between', alignItems:'center',
                padding:'8px 0', borderTop:'1px solid var(--border-soft)',
              }}>
                <span style={{
                  fontFamily:'var(--font-ui)', fontSize:13.5, color:'var(--text)',
                }}>{name}</span>
                <span style={{display:'inline-flex', gap:4}}>
                  {keys.map((k,i)=><SKbd key={i} big>{k}</SKbd>)}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

// ─── shell ───
function SettingsShell({theme='dark', sectionId='editor'}) {
  const tokens = (window.SVESKA_TOKENS && window.SVESKA_TOKENS[theme]) || {};
  const Section = ({
    editor: EditorSection,
    appearance: AppearanceSection,
    ai: AISection,
    data: DataSection,
    keyboard: KeyboardSection,
  })[sectionId] || EditorSection;
  return (
    <div style={{
      ...tokens,
      width:'100%', height:'100%',
      background:'var(--bg)', color:'var(--text)',
      fontFamily:'var(--font-ui)',
      display:'flex', flexDirection:'column', overflow:'hidden',
    }}>
      <SettingsWindowBar/>
      <div style={{flex:1, display:'flex', overflow:'hidden'}}>
        <NavRail active={sectionId}/>
        <main style={{flex:1, overflowY:'auto', overflowX:'hidden'}}>
          <Section/>
          <div style={{height:40}}/>
        </main>
      </div>
    </div>
  );
}

Object.assign(window, { SettingsShell });

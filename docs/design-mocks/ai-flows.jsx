// AI Flows — every state of the AI surface in Sveska.
// Reuses AppShell (loaded first) as a dimmed/blurred background so each
// artboard tells the full story — palette / slash menu / streaming / diff /
// no-key fallback — without a forest of one-off mocks.

const { useMemo: useMemoAI } = React;

// ─── shared atoms ───
const AIcon = ({d, w=14, sw=1.75, children}) => (
  <svg viewBox="0 0 24 24" width={w} height={w} fill="none" stroke="currentColor"
       strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    {d ? <path d={d}/> : children}
  </svg>
);
const AKbd = ({children}) => (
  <span style={{
    fontFamily:'var(--font-mono)', fontSize:10.5, padding:'1px 6px',
    borderRadius:5, background:'var(--raised)', color:'var(--text-dim)',
    letterSpacing:'.04em',
  }}>{children}</span>
);

// ─── dimmed shell background ───
function DimmedShell({theme='dark'}) {
  return (
    <div style={{
      position:'absolute', inset:0,
      filter:'blur(3px) saturate(.85)',
      opacity:.55,
      pointerEvents:'none',
    }}>
      <AppShell theme={theme} mode="default"/>
    </div>
  );
}
function Veil({theme='dark', tint='dim'}) {
  const bg = theme==='dark'
    ? (tint==='heavy' ? 'rgba(12,12,14,0.72)' : 'rgba(12,12,14,0.55)')
    : (tint==='heavy' ? 'rgba(244,239,230,0.7)' : 'rgba(244,239,230,0.5)');
  return <div style={{position:'absolute', inset:0, background:bg, pointerEvents:'none'}}/>;
}

// ─── palette parts ───
function PItem({icon, kind='local', label, hint, keys, selected, disabled, onAccept}) {
  const isAI = kind==='ai';
  return (
    <div style={{
      display:'flex', alignItems:'center', gap:14,
      padding:'10px 18px', cursor:'pointer',
      background: selected ? 'color-mix(in oklab, var(--accent) 14%, transparent)' : 'transparent',
      opacity: disabled ? .4 : 1,
    }}>
      <span style={{
        width:26, height:26, borderRadius:7,
        background: selected ? 'var(--accent)'
                  : isAI    ? 'color-mix(in oklab, var(--ai) 18%, transparent)'
                  : 'var(--raised)',
        color: selected ? '#0C0C0E' : isAI ? 'var(--ai)' : 'var(--text-dim)',
        display:'inline-flex', alignItems:'center', justifyContent:'center', flexShrink:0,
      }}>{icon}</span>
      <span style={{flex:1, fontSize:14.5, color:'var(--text)'}}>
        {label}
        {hint && <span style={{color:'var(--text-dim)', fontSize:13, marginLeft:6}}>— {hint}</span>}
      </span>
      {keys && <span style={{display:'inline-flex', gap:4}}>
        {keys.map((k,i)=>(
          <span key={i} style={{
            fontFamily:'var(--font-mono)', fontSize:10.5,
            padding:'2px 6px', borderRadius:5,
            background: selected ? 'rgba(0,0,0,.18)' : 'var(--raised)',
            color: selected ? '#0C0C0E' : 'var(--text-dim)',
          }}>{k}</span>
        ))}
      </span>}
    </div>
  );
}
function PSection({children}) {
  return <div style={{
    fontFamily:'var(--font-mono)', fontSize:10.5, letterSpacing:'.12em',
    textTransform:'uppercase', color:'var(--text-dim)', padding:'14px 18px 6px',
  }}>{children}</div>;
}

function PaletteFrame({children, query, queryReadout, headerExtra}) {
  return (
    <div style={{
      width:600,
      background:'var(--surface)',
      borderRadius:14,
      boxShadow:'0 1px 0 rgba(255,255,255,.03), 0 28px 80px rgba(0,0,0,.6)',
      border:'1px solid var(--border-soft)',
      overflow:'hidden', color:'var(--text)',
    }}>
      <div style={{
        display:'flex', alignItems:'center', gap:12,
        padding:'16px 18px', borderBottom:'1px solid var(--border-soft)',
      }}>
        <span style={{color:'var(--text-dim)'}}>
          <AIcon w={16}><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></AIcon>
        </span>
        <span style={{
          flex:1, fontFamily:'var(--font-ui)', fontSize:16, color:'var(--text)',
          caretColor:'var(--accent)',
        }}>
          {query !== undefined ? (
            <span>{query}<span style={{
              display:'inline-block', width:1, height:18, background:'var(--accent)',
              verticalAlign:'-3px', marginLeft:1, animation:'sveska-caret 1.1s steps(1) infinite',
            }}/></span>
          ) : (
            <span style={{color:'var(--text-dim)'}}>Search or run command…</span>
          )}
          {queryReadout && <span style={{color:'var(--text-dim)', marginLeft:10, fontSize:13}}>{queryReadout}</span>}
        </span>
        {headerExtra}
        <AKbd>ESC</AKbd>
      </div>
      {children}
      <style>{`@keyframes sveska-caret { 50% { opacity: 0 } }`}</style>
    </div>
  );
}

function PaletteFoot({left, right}) {
  return (
    <div style={{
      display:'flex', justifyContent:'space-between', alignItems:'center',
      padding:'10px 18px', borderTop:'1px solid var(--border-soft)',
      fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-dim)',
      letterSpacing:'.04em',
    }}>
      <span>{left}</span>
      <span style={{display:'inline-flex', gap:12}}>{right}</span>
    </div>
  );
}

// ─── ① empty state — just opened ⌘K ───
function PaletteEmpty() {
  return (
    <PaletteFrame>
      <PSection>AI · Slash commands</PSection>
      <PItem icon="✦" kind="ai" label="/improve" hint="tighten this paragraph" selected keys={['↵']}/>
      <PItem icon="≡" kind="ai" label="/summarize" hint="note → 3 bullets"/>
      <PItem icon="→" kind="ai" label="/continue" hint="write the next paragraph"/>
      <PItem icon="⇄" kind="ai" label="/rewrite" hint="change tone or length"/>
      <PItem icon="◉" kind="ai" label="Notes → image" hint="concise · detailed"/>
      <PItem icon="↗" kind="ai" label="Copy as LinkedIn post"/>
      <PSection>Notes · recent</PSection>
      <PItem icon="📄" label="weekend.md" hint="14:02 · 312 words" keys={['⌘','1']}/>
      <PItem icon="📄" label="imports of Selimović" hint="pinned · 3m" keys={['⌘','2']}/>
      <PSection>Actions</PSection>
      <PItem icon="＋" label="New note" hint="from template" keys={['⌘','N']}/>
      <PItem icon="↓" label="Import .md / .txt …" keys={['⌘','I']}/>
      <PaletteFoot
        left="12 results"
        right={<>
          <span><AKbd>↑</AKbd> <AKbd>↓</AKbd> navigate</span>
          <span><AKbd>↵</AKbd> run</span>
          <span><AKbd>esc</AKbd> close</span>
        </>}
      />
    </PaletteFrame>
  );
}

// ─── ② filtered query "imp" ───
function PaletteFiltered() {
  return (
    <PaletteFrame query="imp">
      <PSection>AI · Slash commands</PSection>
      <PItem icon="✦" kind="ai" label={<><b style={{color:'var(--accent)'}}>imp</b>rove</>} hint="tighten this paragraph" selected keys={['↵']}/>
      <PItem icon="≡" kind="ai" label={<>summarize</>} hint="note → 3 bullets" disabled/>
      <PItem icon="↑" label={<><b style={{color:'var(--accent)'}}>imp</b>ort .md / .txt</>} hint="from disk" keys={['⌘','I']}/>
      <PSection>Notes</PSection>
      <PItem icon="📄" label={<><b style={{color:'var(--accent)'}}>imp</b>orts of Selimović</>} hint="pinned · 3m" keys={['⌘','2']}/>
      <PaletteFoot
        left="3 results · 9 filtered out"
        right={<>
          <span><AKbd>↑</AKbd> <AKbd>↓</AKbd></span>
          <span><AKbd>↵</AKbd> run</span>
        </>}
      />
    </PaletteFrame>
  );
}

// ─── ③ /improve context picker — second step ───
function PaletteContext() {
  return (
    <PaletteFrame
      queryReadout={<><span style={{color:'var(--ai)'}}>✦ /improve</span></>}
      headerExtra={<span style={{
        fontFamily:'var(--font-mono)', fontSize:10.5, letterSpacing:'.08em',
        color:'var(--text-dim)', padding:'3px 7px', borderRadius:5,
        background:'color-mix(in oklab, var(--ai) 16%, transparent)',
      }}>STEP 2 / 2</span>}
    >
      <div style={{padding:'18px 20px 6px'}}>
        <div style={{
          fontFamily:'var(--font-display)', fontWeight:700, fontSize:18,
          letterSpacing:'-0.015em', color:'var(--text)', marginBottom:14,
        }}>Apply to what?</div>
        <Radio label="Current paragraph" hint="line 4 · 28 words"/>
        <Radio label="Current selection" hint='"The folded page does not need …"' selected/>
        <Radio label="Whole note" hint="weekend.md · 312 words"/>
      </div>

      <div style={{padding:'10px 20px'}}>
        <div style={{
          fontFamily:'var(--font-mono)', fontSize:10.5, letterSpacing:'.10em',
          textTransform:'uppercase', color:'var(--text-dim)', margin:'6px 0 8px',
        }}>Tone preset</div>
        <div style={{display:'flex', flexWrap:'wrap', gap:6}}>
          {[['tighter',true],['warmer',false],['more formal',false],['bosnian',false],['1 sentence',false]].map(([t,on])=>(
            <span key={t} style={{
              fontFamily:'var(--font-mono)', fontSize:11.5, padding:'5px 11px',
              borderRadius:999,
              background: on ? 'var(--accent)' : 'transparent',
              color: on ? '#0C0C0E' : 'var(--text)',
              boxShadow: on ? 'none' : 'inset 0 0 0 1px var(--border-soft)',
            }}>{t}</span>
          ))}
        </div>
      </div>

      <div style={{padding:'14px 20px 4px'}}>
        <div style={{
          fontFamily:'var(--font-mono)', fontSize:10.5, letterSpacing:'.10em',
          textTransform:'uppercase', color:'var(--text-dim)', margin:'4px 0 6px',
        }}>Context preview · 28 words</div>
        <div style={{
          fontFamily:'var(--font-mono)', fontSize:13, color:'var(--text-dim)',
          padding:'10px 12px', borderRadius:8, background:'var(--bg)',
          boxShadow:'inset 0 0 0 1px var(--border-soft)', lineHeight:1.55,
        }}>
          <span style={{color:'var(--text)'}}>The folded page does not need permission to be written on.</span> Local-first means the app keeps working when the network does not.
        </div>
      </div>

      <div style={{
        display:'flex', justifyContent:'space-between', alignItems:'center',
        padding:'14px 18px', marginTop:6,
        borderTop:'1px solid var(--border-soft)',
        background:'color-mix(in oklab, var(--bg) 50%, var(--surface))',
      }}>
        <span style={{
          fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-dim)',
          letterSpacing:'.04em',
        }}>Routes through <span style={{color:'var(--ai)'}}>/api/ai</span> · streamed · no key in client</span>
        <div style={{display:'flex', gap:10}}>
          <button style={btnGhost()}>Cancel <AKbd>esc</AKbd></button>
          <button style={btnPrimary()}>Run · <span style={{
            fontFamily:'var(--font-mono)', fontSize:11, marginLeft:6, opacity:.7,
            padding:'1px 6px', borderRadius:5, background:'rgba(0,0,0,.18)',
          }}>⌘↵</span></button>
        </div>
      </div>
    </PaletteFrame>
  );
}

function Radio({label, hint, selected}) {
  return (
    <div style={{
      display:'flex', alignItems:'center', gap:12,
      padding:'9px 4px', cursor:'pointer',
    }}>
      <span style={{
        width:16, height:16, borderRadius:999,
        border: selected ? '5px solid var(--accent)' : '1.5px solid var(--text-dim)',
        flexShrink:0, transition:'all .12s ease',
      }}/>
      <span style={{flex:1, color:'var(--text)', fontSize:14.5}}>{label}</span>
      <span style={{color:'var(--text-dim)', fontSize:12.5, fontFamily:'var(--font-mono)'}}>{hint}</span>
    </div>
  );
}

// ─── ④ no-key fallback ───
function PaletteNoKey() {
  return (
    <PaletteFrame>
      <div style={{
        display:'flex', alignItems:'center', gap:10,
        padding:'12px 18px', borderBottom:'1px solid var(--border-soft)',
        background:'color-mix(in oklab, var(--danger) 8%, transparent)',
        color:'var(--text-dim)', fontFamily:'var(--font-mono)', fontSize:11.5,
        letterSpacing:'.04em',
      }}>
        <span style={{
          width:16, height:16, borderRadius:999,
          background:'color-mix(in oklab, var(--danger) 18%, transparent)',
          color:'var(--danger)',
          display:'inline-flex', alignItems:'center', justifyContent:'center',
          fontFamily:'var(--font-ui)', fontWeight:700, fontSize:11,
        }}>!</span>
        <span><span style={{color:'var(--text)'}}>AI commands unavailable</span> · <span style={{color:'var(--text-dim)'}}>/api/ai proxy not configured.</span> Notes and editing work as usual.</span>
      </div>

      <PSection>AI · paused</PSection>
      <PItem icon="✦" kind="ai" label="/improve" hint="needs proxy" disabled keys={['offline']}/>
      <PItem icon="≡" kind="ai" label="/summarize" hint="needs proxy" disabled keys={['offline']}/>

      <div style={{padding:'4px 18px 14px'}}>
        <button style={{
          appearance:'none', border:0, cursor:'pointer',
          width:'100%', padding:'10px 12px', borderRadius:9,
          background:'transparent', color:'var(--text)',
          boxShadow:'inset 0 0 0 1px var(--ai)',
          fontFamily:'var(--font-ui)', fontWeight:700, fontSize:13,
          display:'flex', alignItems:'center', gap:10, justifyContent:'space-between',
        }}>
          <span><span style={{color:'var(--ai)', marginRight:8}}>⚙</span>Configure <span style={{fontFamily:'var(--font-mono)', color:'var(--ai)'}}>/api/ai</span> proxy …</span>
          <span style={{color:'var(--text-dim)', fontFamily:'var(--font-mono)', fontSize:11}}>opens docs ↗</span>
        </button>
      </div>

      <PSection>Notes · always local-first</PSection>
      <PItem icon="📄" label="weekend.md" hint="14:02 · 312 words" keys={['⌘','1']} selected/>
      <PItem icon="📄" label="imports of Selimović" hint="pinned · 3m" keys={['⌘','2']}/>

      <PaletteFoot
        left={<span><span style={{color:'var(--ok)'}}>● </span>local features available</span>}
        right={<><span><AKbd>↵</AKbd> open</span><span><AKbd>esc</AKbd> close</span></>}
      />
    </PaletteFrame>
  );
}

// ─── helpers ───
function btnPrimary() {
  return {
    appearance:'none', border:0, cursor:'pointer',
    height:36, padding:'0 14px', borderRadius:9,
    background:'var(--accent)', color:'#0C0C0E',
    fontFamily:'var(--font-ui)', fontWeight:700, fontSize:13,
    display:'inline-flex', alignItems:'center', gap:6,
    letterSpacing:'-0.005em',
  };
}
function btnGhost() {
  return {
    appearance:'none', border:0, cursor:'pointer',
    height:36, padding:'0 14px', borderRadius:9,
    background:'transparent', color:'var(--text)',
    boxShadow:'inset 0 0 0 1px var(--border-soft)',
    fontFamily:'var(--font-ui)', fontWeight:700, fontSize:13,
    display:'inline-flex', alignItems:'center', gap:8,
  };
}
function btnDangerSolid() {
  return {
    appearance:'none', border:0, cursor:'pointer',
    height:36, padding:'0 14px', borderRadius:9,
    background:'transparent', color:'var(--danger)',
    boxShadow:'inset 0 0 0 1px color-mix(in oklab, var(--danger) 40%, transparent)',
    fontFamily:'var(--font-ui)', fontWeight:700, fontSize:13,
  };
}

// ─── ⑤ slash menu — inline floating ───
function SlashMenu() {
  return (
    <div style={{
      width:320,
      background:'var(--surface)',
      borderRadius:11,
      boxShadow:'0 1px 0 rgba(255,255,255,.03), 0 18px 50px rgba(0,0,0,.55)',
      border:'1px solid var(--border-soft)',
      overflow:'hidden', color:'var(--text)',
    }}>
      <div style={{
        padding:'8px 14px', borderBottom:'1px solid var(--border-soft)',
        fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-dim)',
        letterSpacing:'.04em', display:'flex', alignItems:'center', gap:8,
      }}>
        <span style={{color:'var(--accent)'}}>/</span>
        <span style={{color:'var(--text)'}}>imp</span>
        <span style={{flex:1}}/>
        <span>↑↓ <span style={{color:'var(--text-dim)'}}>· tab to accept</span></span>
      </div>
      <SItem icon="✦" kind="ai" label="/improve" hint="paragraph" selected/>
      <SItem icon="≡" kind="ai" label="/summarize" hint="note"/>
      <SItem icon="→" kind="ai" label="/continue" hint="cursor"/>
      <SItem icon="⇄" kind="ai" label="/rewrite" hint="tone"/>
      <div style={{height:1, background:'var(--border-soft)', margin:'4px 0'}}/>
      <SItem icon="📅" label="/date"/>
      <SItem icon="📐" label="/template"/>
    </div>
  );
}

function SItem({icon, kind, label, hint, selected}) {
  const isAI = kind==='ai';
  return (
    <div style={{
      display:'flex', alignItems:'center', gap:10,
      padding:'7px 12px', cursor:'pointer',
      background: selected ? 'color-mix(in oklab, var(--accent) 14%, transparent)' : 'transparent',
    }}>
      <span style={{
        width:22, height:22, borderRadius:6, fontSize:12,
        background: selected ? 'var(--accent)'
                  : isAI ? 'color-mix(in oklab, var(--ai) 18%, transparent)'
                  : 'var(--raised)',
        color: selected ? '#0C0C0E' : isAI ? 'var(--ai)' : 'var(--text-dim)',
        display:'inline-flex', alignItems:'center', justifyContent:'center', flexShrink:0,
      }}>{icon}</span>
      <span style={{flex:1, fontFamily:'var(--font-mono)', fontSize:13, color:'var(--text)'}}>{label}</span>
      {hint && <span style={{
        fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-dim)',
      }}>{hint}</span>}
    </div>
  );
}

// ─── ⑥ streaming HUD ───
function StreamHUD() {
  return (
    <div style={{
      width:480,
      background:'var(--surface)',
      borderRadius:12,
      border:'1px solid var(--ai)',
      boxShadow:'0 1px 0 rgba(255,255,255,.03), 0 18px 50px rgba(0,0,0,.55)',
      padding:'14px 16px',
      color:'var(--text)',
    }}>
      <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:8}}>
        <span style={{position:'relative', width:9, height:9}}>
          <span style={{
            position:'absolute', inset:0, borderRadius:999, background:'var(--ai)',
            boxShadow:'0 0 0 4px color-mix(in oklab, var(--ai) 22%, transparent)',
          }}/>
        </span>
        <span style={{fontFamily:'var(--font-mono)', fontSize:12, color:'var(--ai)', letterSpacing:'.04em'}}>/improve</span>
        <span style={{color:'var(--text-dim)', fontFamily:'var(--font-mono)', fontSize:11.5}}>· streaming · 1.4 s · 82 tokens</span>
        <div style={{flex:1}}/>
        <button style={{
          appearance:'none', border:0, cursor:'pointer', background:'var(--raised)',
          color:'var(--text)', height:24, padding:'0 9px', borderRadius:6,
          fontFamily:'var(--font-mono)', fontSize:11, letterSpacing:'.04em',
          display:'inline-flex', alignItems:'center', gap:5,
        }}>esc cancel</button>
      </div>

      <div style={{
        height:3, background:'var(--raised)', borderRadius:999, overflow:'hidden',
        marginBottom:10,
      }}>
        <div style={{
          height:'100%', width:'62%', background:'var(--ai)',
          boxShadow:'0 0 12px var(--ai)',
        }}/>
      </div>

      <div style={{
        fontFamily:'var(--font-mono)', fontSize:11.5, color:'var(--text-dim)',
        letterSpacing:'.04em', display:'flex', gap:14,
      }}>
        <span><span style={{color:'var(--ok)'}}>●</span> /api/ai · edge</span>
        <span>· model claude-haiku-4-5</span>
        <span>· key vaulted server-side</span>
      </div>
    </div>
  );
}

// ─── ⑦ diff / accept-reject ───
function DiffPanel() {
  return (
    <div style={{
      width:620,
      background:'var(--surface)',
      borderRadius:12,
      border:'1px solid var(--border-soft)',
      boxShadow:'0 1px 0 rgba(255,255,255,.03), 0 28px 80px rgba(0,0,0,.6)',
      overflow:'hidden', color:'var(--text)',
    }}>
      <div style={{
        padding:'14px 18px 10px', borderBottom:'1px solid var(--border-soft)',
        display:'flex', alignItems:'center', gap:10,
      }}>
        <span style={{
          fontFamily:'var(--font-mono)', fontSize:11, letterSpacing:'.10em',
          color:'var(--ai)', textTransform:'uppercase',
        }}>✦ /improve · 1 of 1 suggestion</span>
        <div style={{flex:1}}/>
        <span style={{
          fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-dim)',
          letterSpacing:'.04em',
        }}>2.1 s · 142 tokens</span>
      </div>

      <div style={{padding:'14px 18px', fontFamily:'var(--font-mono)', fontSize:14, lineHeight:1.7}}>
        <div style={{
          padding:'8px 12px', borderRadius:8, marginBottom:8,
          background:'color-mix(in oklab, var(--danger) 10%, transparent)',
          borderLeft:'2px solid var(--danger)',
          color:'var(--text-dim)', textDecoration:'line-through',
          textDecorationThickness:'.5px',
        }}>
          The folded page does not need permission to be written on. Local-first means the app keeps working when the network does not.
        </div>
        <div style={{
          padding:'8px 12px', borderRadius:8,
          background:'color-mix(in oklab, var(--ai) 12%, transparent)',
          borderLeft:'2px solid var(--ai)',
          color:'var(--text)',
        }}>
          The folded page asks no permission. Local-first: the app outlives the network.
        </div>
      </div>

      <div style={{
        display:'flex', justifyContent:'space-between', alignItems:'center',
        padding:'12px 16px', borderTop:'1px solid var(--border-soft)',
        background:'color-mix(in oklab, var(--bg) 60%, var(--surface))',
      }}>
        <div style={{display:'flex', gap:8}}>
          <button style={btnGhost()}>↻ Try again</button>
          <button style={btnGhost()}>✎ Edit prompt</button>
        </div>
        <div style={{display:'flex', gap:10}}>
          <button style={btnDangerSolid()}>Reject <AKbd>esc</AKbd></button>
          <button style={btnPrimary()}>Accept <AKbd>⌘↵</AKbd></button>
        </div>
      </div>
    </div>
  );
}

// ─── overlay wrapper for use inside an artboard ───
function FlowFrame({theme='dark', children, anchor='center', anchorOffset, veil='dim'}) {
  let style;
  if (anchor === 'center') {
    style = { position:'absolute', top:'50%', left:'50%', transform:'translate(-50%, -50%)' };
  } else if (anchor === 'top') {
    style = { position:'absolute', top:96, left:'50%', transform:'translateX(-50%)' };
  } else {
    // custom anchor — anchorOffset = {top, left, right, bottom}
    style = { position:'absolute', ...anchorOffset };
  }
  // Tokens must live on the same subtree as the overlay — DimmedShell only
  // scopes them inside AppShell, so siblings of it (our overlay) need their
  // own copy.
  const tokens = (window.SVESKA_TOKENS && window.SVESKA_TOKENS[theme]) || {};
  return (
    <div style={{position:'absolute', inset:0, overflow:'hidden', ...tokens, fontFamily:'var(--font-ui)'}}>
      <DimmedShell theme={theme}/>
      <Veil theme={theme} tint={veil}/>
      <div style={style}>{children}</div>
    </div>
  );
}

Object.assign(window, {
  PaletteEmpty, PaletteFiltered, PaletteContext, PaletteNoKey,
  SlashMenu, StreamHUD, DiffPanel, FlowFrame,
});

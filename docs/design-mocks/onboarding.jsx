// onboarding.jsx — 5-frame interactive first-run flow.
// Distinct from the cinematic motion piece — these are the real coachmark
// overlays a first-time user sees. 1440×900.

const OB_DARK = {
  '--bg':'#0C0C0E','--surface':'#161619','--raised':'#222228',
  '--text':'#F4EFE6','--text-dim':'#B8B2A6',
  '--accent':'#F2B544','--accent-hover':'#EDA92E','--accent-press':'#C9871F',
  '--ai':'#4FD6C4','--ok':'#6FCF7F','--danger':'#E5604D',
  '--border-soft':'#222228',
  '--font-display':'"Bricolage Grotesque",system-ui,sans-serif',
  '--font-ui':'"Satoshi","Manrope",system-ui,sans-serif',
  '--font-mono':'"JetBrains Mono",ui-monospace,monospace',
};

const OIcon = ({d, w=16, sw=1.75, children}) => (
  <svg viewBox="0 0 24 24" width={w} height={w} fill="none" stroke="currentColor"
       strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    {d ? <path d={d}/> : children}
  </svg>
);
const OKbd = ({children, light}) => (
  <span style={{
    fontFamily:'var(--font-mono)', fontSize:10.5, padding:'1px 6px',
    borderRadius:5, background: light?'rgba(0,0,0,.18)':'var(--raised)',
    color: light?'inherit':'var(--text-dim)', letterSpacing:'.04em',
  }}>{children}</span>
);

// ─── shared chrome ───
function OBWindowBar({active='canvas-hidden'}) {
  return (
    <div style={{
      height:44, flexShrink:0,
      background:'var(--bg)', borderBottom:'1px solid var(--border-soft)',
      display:'flex', alignItems:'center', gap:14, padding:'0 16px',
    }}>
      <div style={{display:'flex', gap:8}}>
        <span style={{width:12,height:12,borderRadius:999,background:'#ff5f57'}}/>
        <span style={{width:12,height:12,borderRadius:999,background:'#febc2e'}}/>
        <span style={{width:12,height:12,borderRadius:999,background:'#28c840'}}/>
      </div>
      <div style={{width:1, height:18, background:'var(--border-soft)'}}/>
      <div style={{display:'flex', alignItems:'center', gap:8}}>
        <div style={{
          width:22, height:22, borderRadius:5, background:'#0C0C0E',
          display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
        }}>
          <svg viewBox="0 0 64 64" width={14} height={14}>
            <path d="M16 12 H40 L50 22 V50 A2 2 0 0 1 48 52 H16 A2 2 0 0 1 14 50 V14 A2 2 0 0 1 16 12 Z" fill="#F2B544"/>
            <path d="M40 12 L50 22 H42 A2 2 0 0 1 40 20 Z" fill="#C9871F"/>
            <path d="M42 24.5C42 19.7 38 17 32.5 17C26.5 17 22.5 20 22.5 24.75C22.5 29.5 26.75 31.75 32.5 32.5C38.25 33.25 42.5 35.5 42.5 40.5C42.5 45.75 38.5 48.75 32.25 48.75C26.75 48.75 22.5 46.25 22.25 41.25" fill="none" stroke="#0C0C0E" strokeWidth="5.75" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span style={{
          fontFamily:'var(--font-display)', fontWeight:700, fontSize:14,
          letterSpacing:'-0.02em', color:'var(--text)',
        }}>sveska<span style={{
          fontFamily:'var(--font-mono)', fontSize:12, color:'var(--accent)',
          fontWeight:500, marginLeft:2,
        }}>.studio</span></span>
      </div>
      <div style={{flex:1}}/>
      <span style={{
        fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-dim)',
        letterSpacing:'.04em',
      }}>local · offline-first · first run</span>
    </div>
  );
}

function OBStatusBar({state='empty'}) {
  const slots = {
    empty:   {color:'var(--text-dim)', label:'Empty · ready', dot:false},
    typing:  {color:'var(--text-dim)', label:'Editing · unsaved', dot:false},
    pending: {color:'var(--ai)', label:'Editing · snapshot pending', dot:true},
    saved:   {color:'var(--ok)', label:'Saved · just now', dot:true, ok:true},
  };
  const s = slots[state];
  return (
    <div style={{
      flexShrink:0, height:30, background:'var(--surface)',
      borderTop:'1px solid var(--border-soft)',
      display:'flex', alignItems:'center', padding:'0 16px',
      fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-dim)',
      letterSpacing:'.04em',
    }}>
      <span style={{display:'inline-flex', gap:6, alignItems:'center', padding:'0 10px 0 0', color:s.color}}>
        {s.dot && <span style={{
          width:6, height:6, borderRadius:999, background:s.color,
          boxShadow: s.ok ? 'none' : '0 0 0 2px color-mix(in oklab, var(--ai) 22%, transparent)',
        }}/>}
        {s.label}
      </span>
      <span style={{width:1, height:14, background:'var(--border-soft)', margin:'0 4px'}}/>
      <span style={{padding:'0 10px'}}>{state==='empty' ? '0' : state==='typing' ? '4' : '9'} words</span>
      <div style={{flex:1}}/>
      <span style={{padding:'0 10px', color:'var(--accent)'}}>● Offline · local-first</span>
    </div>
  );
}

// ─── coachmark spotlight ───
function Spotlight({x, y, w, h, padding=12, round=12}) {
  // Renders a darkened veil with a clear "spotlight" cut over the target.
  // Plus a glowing amber outline around the cleared region.
  return (
    <div style={{position:'absolute', inset:0, pointerEvents:'none', zIndex:30}}>
      <svg width="100%" height="100%" style={{position:'absolute', inset:0}}>
        <defs>
          <mask id="ob-spot-mask">
            <rect width="100%" height="100%" fill="white"/>
            <rect x={x-padding} y={y-padding} width={w+padding*2} height={h+padding*2} rx={round+4} ry={round+4} fill="black"/>
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(12,12,14,0.72)" mask="url(#ob-spot-mask)"/>
        <rect
          x={x-padding} y={y-padding}
          width={w+padding*2} height={h+padding*2}
          rx={round+4} ry={round+4}
          fill="none" stroke="var(--accent)" strokeWidth="2"
          strokeDasharray="0"
        />
        <rect
          x={x-padding-6} y={y-padding-6}
          width={w+padding*2+12} height={h+padding*2+12}
          rx={round+10} ry={round+10}
          fill="none" stroke="var(--accent)" strokeWidth="1"
          opacity=".4"
        />
      </svg>
    </div>
  );
}

// ─── coachmark bubble ───
function Coachmark({step, total, title, body, kbHint, primary, secondary, x, y, anchor='top-left'}) {
  const arrowOffsets = {
    'top-left':    {arrow:'top'   , left:24,  right:'auto', top:-9},
    'top-right':   {arrow:'top'   , left:'auto', right:24, top:-9},
    'bottom-left': {arrow:'bottom', left:24,  right:'auto', bottom:-9},
    'left-top':    {arrow:'left'  , left:-9,  top:24},
    'right-top':   {arrow:'right' , right:-9, top:24},
  };
  const a = arrowOffsets[anchor] || arrowOffsets['top-left'];
  return (
    <div style={{
      position:'absolute', left:x, top:y, width:360, zIndex:40,
      background:'var(--surface)', borderRadius:12, border:'1px solid var(--accent)',
      boxShadow:'0 1px 0 rgba(255,255,255,.03), 0 28px 70px rgba(0,0,0,.65)',
      padding:'18px 20px 16px',
      color:'var(--text)',
    }}>
      {/* arrow */}
      <div style={{
        position:'absolute',
        ...a,
        width: a.arrow==='top'||a.arrow==='bottom' ? 16 : 8,
        height: a.arrow==='top'||a.arrow==='bottom' ? 8 : 16,
      }}>
        <svg viewBox="0 0 16 16" width="100%" height="100%">
          {a.arrow==='top'    && <polygon points="0,8 8,0 16,8" fill="var(--surface)" stroke="var(--accent)" strokeWidth="1"/>}
          {a.arrow==='bottom' && <polygon points="0,0 8,8 16,0" fill="var(--surface)" stroke="var(--accent)" strokeWidth="1"/>}
          {a.arrow==='left'   && <polygon points="8,0 0,8 8,16" fill="var(--surface)" stroke="var(--accent)" strokeWidth="1"/>}
          {a.arrow==='right'  && <polygon points="0,0 8,8 0,16" fill="var(--surface)" stroke="var(--accent)" strokeWidth="1"/>}
        </svg>
      </div>

      <div style={{
        display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:6,
      }}>
        <span style={{
          fontFamily:'var(--font-mono)', fontSize:10.5, letterSpacing:'.12em',
          textTransform:'uppercase', color:'var(--accent)',
        }}>STEP {step} / {total}</span>
        <span style={{
          fontFamily:'var(--font-mono)', fontSize:10.5, color:'var(--text-dim)', letterSpacing:'.04em',
          display:'inline-flex', gap:4,
        }}>
          {Array.from({length:total}).map((_,i)=>(
            <span key={i} style={{
              width:14, height:3, borderRadius:999,
              background: i<step ? 'var(--accent)' : 'var(--raised)',
            }}/>
          ))}
        </span>
      </div>

      <h4 style={{
        margin:'0 0 6px',
        fontFamily:'var(--font-display)', fontWeight:700, fontSize:20,
        letterSpacing:'-0.018em', color:'var(--text)', lineHeight:1.15,
      }}>{title}</h4>

      <p style={{margin:0, color:'var(--text-dim)', fontSize:13.5, lineHeight:1.55}}>{body}</p>

      {kbHint && (
        <div style={{
          margin:'12px 0 0', padding:'8px 12px',
          background:'var(--bg)', borderRadius:7, boxShadow:'inset 0 0 0 1px var(--border-soft)',
          fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-dim)', letterSpacing:'.04em',
          display:'flex', justifyContent:'space-between', alignItems:'center',
        }}>
          <span>{kbHint.label}</span>
          <span style={{display:'inline-flex', gap:4}}>
            {kbHint.keys.map((k,i)=><OKbd key={i}>{k}</OKbd>)}
          </span>
        </div>
      )}

      <div style={{
        display:'flex', justifyContent:'space-between', gap:10, marginTop:14,
        paddingTop:12, borderTop:'1px solid var(--border-soft)',
      }}>
        <button style={{
          appearance:'none', border:0, cursor:'pointer',
          height:32, padding:'0 10px', borderRadius:7,
          background:'transparent', color:'var(--text-dim)',
          fontFamily:'var(--font-ui)', fontWeight:500, fontSize:12,
        }}>{secondary || 'Skip tour'}</button>
        <button style={{
          appearance:'none', border:0, cursor:'pointer',
          height:32, padding:'0 14px', borderRadius:7,
          background:'var(--accent)', color:'#0C0C0E',
          fontFamily:'var(--font-ui)', fontWeight:700, fontSize:12.5,
          display:'inline-flex', alignItems:'center', gap:6,
        }}>{primary || 'Next →'}</button>
      </div>
    </div>
  );
}

// ─── shell wrapper ───
function OBShell({children}) {
  return (
    <div style={{
      ...OB_DARK, width:'100%', height:'100%', position:'relative',
      background:'var(--bg)', color:'var(--text)',
      fontFamily:'var(--font-ui)',
      display:'flex', flexDirection:'column', overflow:'hidden',
    }}>{children}</div>
  );
}

// ─── editor body (varies per step) ───
function EditorContent({step}) {
  const lineNo = (n) => (
    <span style={{
      width:32, textAlign:'right', color:'var(--text-dim)', opacity:.5,
      paddingRight:14, userSelect:'none', fontVariantNumeric:'tabular-nums',
    }}>{n}</span>
  );

  if (step===1) {
    // empty state in the center
    return (
      <div style={{
        flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
        gap:24, padding:32,
      }}>
        <div style={{
          width:140, height:140, borderRadius:20,
          border:'1px dashed var(--border-soft)',
          background:`repeating-linear-gradient(45deg, transparent 0 9px, color-mix(in oklab, var(--text-dim) 6%, transparent) 9px 10px)`,
          display:'flex', alignItems:'center', justifyContent:'center',
          color:'var(--text-dim)', position:'relative',
        }}>
          <OIcon w={56} sw={1.4}><path d="M7 3h8l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><path d="M15 3v4h4"/></OIcon>
          <div style={{
            position:'absolute', top:-12, right:-12, width:24, height:24, borderRadius:999,
            background:'var(--accent)',
          }}/>
        </div>
        <div style={{
          fontFamily:'var(--font-display)', fontWeight:700, fontSize:48,
          letterSpacing:'-0.03em', lineHeight:1.0, textAlign:'center',
        }}>
          Prazna sveska.<br/>
          <span style={{color:'var(--accent)'}}>Najbolji početak.</span>
        </div>
        <div style={{
          fontFamily:'var(--font-mono)', fontSize:13, color:'var(--text-dim)',
          letterSpacing:'.06em',
        }}>An empty notebook. The best beginning.</div>
      </div>
    );
  }

  // step 2+: editor surface with progressive content
  const content = {
    2: [
      ['1','# weekend.md', 'h'],
      ['2','', 'blank'],
      ['3','', 'caret'],
    ],
    3: [
      ['1','# weekend.md', 'h'],
      ['2','', 'blank'],
      ['3','The folded page does not need permission to be written on.', 'text-caret'],
    ],
    4: [
      ['1','# weekend.md', 'h'],
      ['2','', 'blank'],
      ['3','The folded page does not need permission to be written on.', 'text'],
      ['4','', 'blank'],
      ['5','Local-first means the app keeps working when the network does not.', 'text-caret'],
    ],
    5: [
      ['1','# weekend.md', 'h'],
      ['2','', 'blank'],
      ['3','The folded page does not need permission to be written on.', 'text'],
      ['4','', 'blank'],
      ['5','Local-first means the app keeps working when the network does not.', 'text'],
    ],
  };
  const lines = content[step] || content[2];
  return (
    <div style={{flex:1, padding:'56px 64px 32px', overflow:'hidden'}}>
      <div style={{
        maxWidth:920, margin:'0 auto',
        fontFamily:'var(--font-mono)', fontSize:18, lineHeight:1.8, color:'var(--text)',
      }}>
        {lines.map(([n, text, kind])=>(
          <div key={n} style={{display:'flex', alignItems:'flex-start'}}>
            {lineNo(n)}
            <div style={{flex:1, paddingLeft:14}}>
              {kind==='h' && <span style={{color:'var(--accent)'}}>{text}</span>}
              {kind==='text' && <span>{text}</span>}
              {kind==='blank' && <span>&nbsp;</span>}
              {kind==='caret' && <span style={{
                display:'inline-block', width:2, height:'1em',
                background:'var(--accent)', verticalAlign:'-2px',
                animation:'ob-caret 1.1s steps(1) infinite',
              }}/>}
              {kind==='text-caret' && (<>
                <span>{text}</span>
                <span style={{
                  display:'inline-block', width:2, height:'1em',
                  background:'var(--accent)', verticalAlign:'-2px', marginLeft:1,
                  animation:'ob-caret 1.1s steps(1) infinite',
                }}/>
              </>)}
            </div>
          </div>
        ))}
        <style>{`@keyframes ob-caret { 50%{opacity:0} }`}</style>
      </div>
    </div>
  );
}

// ─── toolbar with optional pulsing target ───
function OBToolbar({step}) {
  const snapState = step >= 4 ? (step === 4 ? 'pending' : 'saved') : 'empty';
  return (
    <div style={{
      flexShrink:0, height:56, borderBottom:'1px solid var(--border-soft)',
      display:'flex', alignItems:'center', gap:6, padding:'0 24px',
      background:'var(--bg)',
    }}>
      {[
        ['M12 5v14M5 12h14', false],
        ['M7 5h6a4 4 0 1 1 0 8H7zM7 13h7a4 4 0 1 1 0 8H7z', true],
        ['M14 5h4M10 19h4M15 5l-4 14', false],
        ['M4 6l2 2 4-4M4 13l2 2 4-4M4 20l2 2 4-4M14 7h7M14 14h7M14 21h7', false],
      ].map(([d, active], i) => (
        <button key={i} style={{
          appearance:'none', border:0, background: active?'var(--raised)':'transparent',
          cursor:'pointer', width:34, height:34, borderRadius:8,
          color: active?'var(--accent)':'var(--text-dim)',
          display:'inline-flex', alignItems:'center', justifyContent:'center',
        }}>
          <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>
        </button>
      ))}
      <span style={{
        flex:1, fontFamily:'var(--font-mono)', fontSize:12.5,
        color:'var(--text)', padding:'0 14px',
      }}>
        <span style={{color:'var(--text-dim)'}}>{step===1?'untitled':'weekend'}</span>{step!==1 && '.md'}
        <span style={{color:'var(--text-dim)'}}>
          {' '}· {step===1 ? 'empty' : step===2 ? 'just now' : step===3 ? 'editing' : step===4 ? 'unsaved' : 'edited just now'}
        </span>
      </span>

      {/* SNAPSHOT button — id'd for the coachmark spotlight */}
      <button id="ob-snap-btn" style={{
        appearance:'none', border:0, cursor:'pointer',
        height:32, padding:'0 14px 0 12px', borderRadius:8,
        background:'transparent',
        color: snapState==='empty' ? 'var(--text-dim)' : 'var(--text)',
        fontFamily:'var(--font-mono)', fontSize:11, letterSpacing:'.04em',
        display:'inline-flex', alignItems:'center', gap:10,
      }}>
        <span style={{position:'relative', width:9, height:9}}>
          <span style={{
            position:'absolute', inset:0, borderRadius:999,
            background: snapState==='empty' ? '#3a3a3e' : 'var(--ai)',
            boxShadow: snapState!=='empty' ? '0 0 0 3px color-mix(in oklab, var(--ai) 22%, transparent)' : 'none',
          }}/>
          {snapState==='pending' && <span style={{
            position:'absolute', inset:0, borderRadius:999,
            border:'1.5px solid var(--ai)',
            animation:'ob-pulse 2.4s ease-out infinite',
          }}/>}
        </span>
        {snapState==='empty' && 'no snapshot'}
        {snapState==='pending' && 'snapshot pending'}
        {snapState==='saved' && 'snapshot · just now'}
      </button>

      {/* SAVE button */}
      <button id="ob-save-btn" style={{
        appearance:'none', border:0, cursor:'pointer',
        height:36, padding:'0 16px', borderRadius:8,
        background:'var(--accent)', color:'#0C0C0E',
        fontFamily:'var(--font-ui)', fontWeight:700, fontSize:13.5,
        display:'inline-flex', alignItems:'center', gap:10,
      }}>
        Save snapshot
        <OKbd light>⌘S</OKbd>
      </button>

      <style>{`@keyframes ob-pulse {
        0%   { transform:scale(1);   opacity:.45; }
        100% { transform:scale(2.6); opacity:0;   }
      }`}</style>
    </div>
  );
}

// ─── tab strip (after step 2) ───
function OBTabStrip({step}) {
  if (step === 1) {
    // pre-creation: empty tab strip placeholder
    return (
      <div style={{
        flexShrink:0, height:36,
        background:'var(--surface)', borderBottom:'1px solid var(--border-soft)',
        display:'flex', alignItems:'center', padding:'0 16px',
        fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-dim)', letterSpacing:'.04em',
      }}>
        <span>0 open · 0 in notebook</span>
        <span style={{flex:1}}/>
        <span>session restored · false</span>
      </div>
    );
  }
  return (
    <div style={{
      flexShrink:0, height:36,
      background:'var(--surface)', borderBottom:'1px solid var(--border-soft)',
      display:'flex', alignItems:'flex-end', padding:'0 12px', gap:2,
    }}>
      <button style={{
        appearance:'none', border:0, cursor:'pointer',
        height:32, padding:'0 12px', borderRadius:'8px 8px 0 0',
        background:'var(--bg)', color:'var(--text)',
        fontFamily:'var(--font-ui)', fontSize:13, fontWeight:500,
        display:'inline-flex', alignItems:'center', gap:8, position:'relative',
        boxShadow:'inset 1px 0 0 var(--border-soft), inset -1px 0 0 var(--border-soft), inset 0 1px 0 var(--border-soft)',
      }}>
        <span style={{width:6, height:6, borderRadius:999, background:'var(--accent)'}}/>
        weekend.md
        <svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
        <span style={{position:'absolute', left:8, right:8, top:0, height:2, background:'var(--accent)', borderRadius:2}}/>
      </button>
      <div style={{flex:1}}/>
      <div style={{
        fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-dim)',
        padding:'0 8px 8px', letterSpacing:'.04em',
      }}>1 open · 1 in notebook</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SCREEN 1 — Welcome · spotlight on empty state center
// ═══════════════════════════════════════════════════════════════
function OBStep1() {
  return (
    <OBShell>
      <OBWindowBar/>
      <OBTabStrip step={1}/>
      <main style={{flex:1, display:'flex', flexDirection:'column', overflow:'hidden', position:'relative'}}>
        <OBToolbar step={1}/>
        <EditorContent step={1}/>
        <OBStatusBar state="empty"/>

        {/* Spotlight on the empty state */}
        <Spotlight x={540} y={170} w={360} h={360} padding={28} round={20}/>

        {/* Welcome coachmark */}
        <div style={{
          position:'absolute', top:170, right:60, width:380, zIndex:40,
          background:'var(--surface)', borderRadius:14, border:'1px solid var(--accent)',
          boxShadow:'0 1px 0 rgba(255,255,255,.03), 0 28px 70px rgba(0,0,0,.65)',
          padding:'24px 26px 20px',
        }}>
          <div style={{
            fontFamily:'var(--font-mono)', fontSize:10.5, letterSpacing:'.12em',
            textTransform:'uppercase', color:'var(--accent)', marginBottom:10,
            display:'flex', justifyContent:'space-between',
          }}>
            <span>STEP 1 / 5 · WELCOME</span>
            <span style={{display:'inline-flex', gap:4}}>
              {[1,0,0,0,0].map((on,i)=>(
                <span key={i} style={{width:14, height:3, borderRadius:999, background:on?'var(--accent)':'var(--raised)'}}/>
              ))}
            </span>
          </div>
          <h3 style={{
            margin:'0 0 10px',
            fontFamily:'var(--font-display)', fontWeight:700, fontSize:28,
            letterSpacing:'-0.022em', color:'var(--text)', lineHeight:1.05,
          }}>An empty notebook<br/><span style={{color:'var(--accent)'}}>is the best beginning.</span></h3>
          <p style={{margin:0, color:'var(--text-dim)', fontSize:14, lineHeight:1.55}}>
            Sveska lives in your browser. No account, no cloud, no key. Notes stay here unless <i>you</i> click an export. Let's make the first one — 30 seconds, then you're free.
          </p>
          <div style={{
            margin:'14px 0 0', padding:'10px 14px',
            background:'var(--bg)', borderRadius:8, boxShadow:'inset 0 0 0 1px var(--border-soft)',
            fontFamily:'var(--font-mono)', fontSize:11.5, color:'var(--text-dim)', letterSpacing:'.04em',
            display:'flex', justifyContent:'space-between', alignItems:'center',
          }}>
            <span>Press to begin · or paste anything</span>
            <span style={{display:'inline-flex', gap:4}}><OKbd>⌘</OKbd><OKbd>N</OKbd></span>
          </div>
          <div style={{
            display:'flex', justifyContent:'space-between', alignItems:'center', gap:10,
            marginTop:16, paddingTop:14, borderTop:'1px solid var(--border-soft)',
          }}>
            <button style={{
              appearance:'none', border:0, cursor:'pointer',
              height:34, padding:'0 12px', borderRadius:7,
              background:'transparent', color:'var(--text-dim)',
              fontFamily:'var(--font-ui)', fontWeight:500, fontSize:12.5,
            }}>Skip tour · never show again</button>
            <button style={{
              appearance:'none', border:0, cursor:'pointer',
              height:36, padding:'0 16px', borderRadius:8,
              background:'var(--accent)', color:'#0C0C0E',
              fontFamily:'var(--font-ui)', fontWeight:700, fontSize:13,
              display:'inline-flex', alignItems:'center', gap:8,
            }}>
              Begin · ⌘N
              <OKbd light>↵</OKbd>
            </button>
          </div>
        </div>
      </main>
    </OBShell>
  );
}

// ═══════════════════════════════════════════════════════════════
// SCREEN 2 — Just typed; coachmark on toolbar snapshot dot
// ═══════════════════════════════════════════════════════════════
function OBStep2() {
  return (
    <OBShell>
      <OBWindowBar/>
      <OBTabStrip step={2}/>
      <main style={{flex:1, display:'flex', flexDirection:'column', overflow:'hidden', position:'relative'}}>
        <OBToolbar step={2}/>
        <EditorContent step={2}/>
        <OBStatusBar state="typing"/>

        {/* Spotlight on toolbar title area */}
        <Spotlight x={250} y={60} w={420} h={36} padding={6} round={6}/>

        <Coachmark
          step={2} total={5}
          title={<>You named it <span style={{color:'var(--accent)'}}>weekend.md</span>.</>}
          body="The title comes from the first heading. Edit it anytime — the URL won't change since notes are local. Now type whatever's on your mind. Sveska auto-saves every keystroke."
          kbHint={{label:'tip · Markdown works · # for heading', keys:['#',' ','…']}}
          primary="Try writing →"
          x={280} y={144} anchor="top-left"
        />
      </main>
    </OBShell>
  );
}

// ═══════════════════════════════════════════════════════════════
// SCREEN 3 — Snapshot dot introduction
// ═══════════════════════════════════════════════════════════════
function OBStep3() {
  return (
    <OBShell>
      <OBWindowBar/>
      <OBTabStrip step={3}/>
      <main style={{flex:1, display:'flex', flexDirection:'column', overflow:'hidden', position:'relative'}}>
        <OBToolbar step={3}/>
        <EditorContent step={3}/>
        <OBStatusBar state="typing"/>

        {/* Spotlight on the Save snapshot button area */}
        <Spotlight x={1112} y={56} w={172} h={40} padding={8} round={10}/>

        <Coachmark
          step={3} total={5}
          title={<>This dot is <span style={{color:'var(--ai)', fontStyle:'normal'}}>the heartbeat.</span></>}
          body={<>The cyan dot wakes up when there's something worth keeping. Click <b style={{color:'var(--accent)'}}>Save snapshot</b> (or hit ⌘S) and you get a named point-in-time copy — your own little time machine, all local.</>}
          kbHint={{label:'snapshots = procedural memory', keys:['⌘','S']}}
          primary="Save the first one →"
          x={760} y={144} anchor="top-right"
        />
      </main>
    </OBShell>
  );
}

// ═══════════════════════════════════════════════════════════════
// SCREEN 4 — ⌘K command palette intro
// ═══════════════════════════════════════════════════════════════
function OBStep4() {
  return (
    <OBShell>
      <OBWindowBar/>
      <OBTabStrip step={4}/>
      <main style={{flex:1, display:'flex', flexDirection:'column', overflow:'hidden', position:'relative'}}>
        <OBToolbar step={5}/>
        <EditorContent step={5}/>
        <OBStatusBar state="saved"/>

        {/* Toast-style confirmation top-right */}
        <div style={{
          position:'absolute', top:114, right:24, zIndex:35,
          padding:'10px 14px', borderRadius:10,
          background:'color-mix(in oklab, var(--ok) 14%, transparent)',
          boxShadow:'inset 0 0 0 1px color-mix(in oklab, var(--ok) 40%, transparent), 0 12px 32px rgba(0,0,0,.45)',
          fontFamily:'var(--font-mono)', fontSize:11.5, color:'var(--ok)', letterSpacing:'.04em',
          display:'inline-flex', alignItems:'center', gap:8,
        }}>
          <span style={{width:7, height:7, borderRadius:999, background:'var(--ok)'}}/>
          snapshot saved · 14:02
        </div>

        {/* Dim everything except the editor center where the palette will live */}
        <div style={{position:'absolute', inset:0, background:'rgba(12,12,14,0.55)', pointerEvents:'none', zIndex:25}}/>

        {/* The command palette as the focal point */}
        <div style={{
          position:'absolute', top:120, left:'50%', transform:'translateX(-50%)',
          width:560, zIndex:30,
          background:'var(--surface)', borderRadius:14,
          boxShadow:'0 1px 0 rgba(255,255,255,.03), 0 28px 80px rgba(0,0,0,.6)',
          border:'1px solid var(--accent)',
          overflow:'hidden',
        }}>
          <div style={{display:'flex', alignItems:'center', gap:12, padding:'16px 18px', borderBottom:'1px solid var(--border-soft)'}}>
            <OIcon w={16}><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></OIcon>
            <span style={{flex:1, fontFamily:'var(--font-ui)', fontSize:16, color:'var(--text-dim)'}}>
              Search or run command…
              <span style={{
                display:'inline-block', width:2, height:18, background:'var(--accent)',
                verticalAlign:'-3px', marginLeft:1,
                animation:'ob-caret 1.1s steps(1) infinite',
              }}/>
            </span>
            <OKbd>ESC</OKbd>
          </div>
          <div style={{padding:'12px 18px 6px', fontFamily:'var(--font-mono)', fontSize:10.5, letterSpacing:'.12em', textTransform:'uppercase', color:'var(--text-dim)'}}>AI · slash commands</div>
          <PaletteRow icon="✦" label="/improve" hint="tighten this paragraph" ai/>
          <PaletteRow icon="≡" label="/summarize" hint="note → 3 bullets" ai/>
          <div style={{padding:'12px 18px 6px', fontFamily:'var(--font-mono)', fontSize:10.5, letterSpacing:'.12em', textTransform:'uppercase', color:'var(--text-dim)'}}>Notes</div>
          <PaletteRow icon="📄" label="weekend.md" hint="just now · 9 words" keys={['⌘','1']}/>
          <div style={{padding:'12px 18px 6px', fontFamily:'var(--font-mono)', fontSize:10.5, letterSpacing:'.12em', textTransform:'uppercase', color:'var(--text-dim)'}}>Actions</div>
          <PaletteRow icon="＋" label="New note" hint="from template" keys={['⌘','N']}/>
          <PaletteRow icon="↓" label="Import .md / .txt" keys={['⌘','I']}/>
          <PaletteRow icon="⚙" label="Preferences" keys={['⌘',',']}/>
        </div>

        <Coachmark
          step={4} total={5}
          title={<><span style={{color:'var(--accent)'}}>⌘K</span> opens everything.</>}
          body={<>Notes, AI commands, settings, exports — one keystroke gets you anywhere. The slash commands (<span className="mono" style={{fontFamily:'var(--font-mono)', color:'var(--ai)'}}>/improve</span>, <span className="mono" style={{fontFamily:'var(--font-mono)', color:'var(--ai)'}}>/summarize</span>…) route through a server-side proxy. The key never lives in your browser.</>}
          kbHint={{label:'open palette · close with esc', keys:['⌘','K']}}
          primary="Got it →"
          x={760} y={460} anchor="top-left"
        />
      </main>
    </OBShell>
  );
}

function PaletteRow({icon, label, hint, keys, ai}) {
  return (
    <div style={{
      display:'flex', alignItems:'center', gap:14, padding:'9px 18px',
    }}>
      <span style={{
        width:24, height:24, borderRadius:6,
        background: ai ? 'color-mix(in oklab, var(--ai) 18%, transparent)' : 'var(--raised)',
        color: ai ? 'var(--ai)' : 'var(--text-dim)',
        display:'inline-flex', alignItems:'center', justifyContent:'center',
        fontSize:11,
      }}>{icon}</span>
      <span style={{flex:1, fontSize:14, color:'var(--text)'}}>
        {label} {hint && <span style={{color:'var(--text-dim)', fontSize:12.5, marginLeft:6}}>— {hint}</span>}
      </span>
      {keys && <span style={{display:'inline-flex', gap:4}}>
        {keys.map((k,i)=><OKbd key={i}>{k}</OKbd>)}
      </span>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SCREEN 5 — Done. Completion card.
// ═══════════════════════════════════════════════════════════════
function OBStep5() {
  return (
    <OBShell>
      <OBWindowBar/>
      <OBTabStrip step={5}/>
      <main style={{flex:1, display:'flex', flexDirection:'column', overflow:'hidden', position:'relative'}}>
        <OBToolbar step={5}/>
        <EditorContent step={5}/>
        <OBStatusBar state="saved"/>

        <div style={{position:'absolute', inset:0, background:'rgba(12,12,14,0.55)', pointerEvents:'none', zIndex:25}}/>

        {/* Completion card */}
        <div style={{
          position:'absolute', top:'50%', left:'50%', transform:'translate(-50%, -50%)',
          width:520, zIndex:30,
          background:'var(--surface)', borderRadius:14,
          border:'1px solid var(--accent)',
          boxShadow:'0 1px 0 rgba(255,255,255,.03), 0 28px 80px rgba(0,0,0,.65)',
          overflow:'hidden',
        }}>
          {/* progress bar full */}
          <div style={{height:3, background:'var(--accent)'}}/>
          <div style={{padding:'28px 32px 6px'}}>
            <div style={{
              fontFamily:'var(--font-mono)', fontSize:10.5, letterSpacing:'.12em',
              textTransform:'uppercase', color:'var(--accent)',
              display:'flex', justifyContent:'space-between', marginBottom:14,
            }}>
              <span>STEP 5 / 5 · COMPLETE</span>
              <span style={{display:'inline-flex', gap:4}}>
                {[1,1,1,1,1].map((on,i)=>(
                  <span key={i} style={{width:14, height:3, borderRadius:999, background:'var(--accent)'}}/>
                ))}
              </span>
            </div>
            <h3 style={{
              margin:'0 0 12px',
              fontFamily:'var(--font-display)', fontWeight:700, fontSize:36,
              letterSpacing:'-0.028em', lineHeight:1.0, color:'var(--text)',
            }}>You're ready.<br/><span style={{color:'var(--accent)'}}>The page is yours.</span></h3>
            <p style={{margin:0, color:'var(--text-dim)', fontSize:14.5, lineHeight:1.6}}>
              That's the whole product. One note created, one snapshot saved, the palette known. Everything else is more of the same — every action is a keystroke, every keystroke is local.
            </p>
          </div>

          <div style={{padding:'18px 32px 4px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:14}}>
            {[
              ['⌘N', 'new note'],
              ['⌘K', 'palette'],
              ['⌘S', 'snapshot'],
              ['⌘,', 'preferences'],
              ['Alt+F', 'focus mode'],
              ['⌘F', 'find'],
            ].map(([k,label])=>(
              <div key={k} style={{
                display:'flex', alignItems:'center', gap:10,
                padding:'8px 12px', borderRadius:7, background:'var(--bg)',
                boxShadow:'inset 0 0 0 1px var(--border-soft)',
              }}>
                <OKbd>{k}</OKbd>
                <span style={{fontFamily:'var(--font-mono)', fontSize:11.5, color:'var(--text-dim)', letterSpacing:'.04em'}}>{label}</span>
              </div>
            ))}
          </div>

          <div style={{padding:'14px 32px 20px'}}>
            <div style={{
              padding:'12px 14px', borderRadius:9,
              background:'color-mix(in oklab, var(--ok) 10%, transparent)',
              boxShadow:'inset 0 0 0 1px color-mix(in oklab, var(--ok) 40%, transparent)',
              display:'flex', alignItems:'center', gap:10,
              fontFamily:'var(--font-mono)', fontSize:12, color:'var(--text)',
            }}>
              <span style={{width:7, height:7, borderRadius:999, background:'var(--ok)'}}/>
              <span style={{flex:1, color:'var(--ok)'}}>1 note · 1 snapshot · 9 words · saved locally</span>
              <span style={{color:'var(--text-dim)'}}>0 bytes sent</span>
            </div>
          </div>

          <div style={{
            display:'flex', justifyContent:'space-between', alignItems:'center', gap:10,
            padding:'14px 18px', borderTop:'1px solid var(--border-soft)',
            background:'color-mix(in oklab, var(--bg) 60%, var(--surface))',
          }}>
            <button style={{
              appearance:'none', border:0, cursor:'pointer',
              height:36, padding:'0 14px', borderRadius:8,
              background:'transparent', color:'var(--text)',
              boxShadow:'inset 0 0 0 1px var(--border-soft)',
              fontFamily:'var(--font-ui)', fontWeight:700, fontSize:13,
            }}>Open shortcut cheatsheet</button>
            <button style={{
              appearance:'none', border:0, cursor:'pointer',
              height:36, padding:'0 18px', borderRadius:8,
              background:'var(--accent)', color:'#0C0C0E',
              fontFamily:'var(--font-ui)', fontWeight:700, fontSize:13,
              display:'inline-flex', alignItems:'center', gap:8,
            }}>
              Start writing
              <OKbd light>↵</OKbd>
            </button>
          </div>
        </div>
      </main>
    </OBShell>
  );
}

Object.assign(window, { OBStep1, OBStep2, OBStep3, OBStep4, OBStep5 });

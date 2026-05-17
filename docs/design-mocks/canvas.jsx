// canvas.jsx — M5 Canvas module. CanvasProvider seam, drawing surface,
// provider settings, export pane. 4 screens at 1440×900.

const CV_DARK = {
  '--bg':'#0C0C0E','--surface':'#161619','--raised':'#222228',
  '--text':'#F4EFE6','--text-dim':'#B8B2A6',
  '--accent':'#F2B544','--accent-hover':'#EDA92E','--accent-press':'#C9871F',
  '--ai':'#4FD6C4','--ok':'#6FCF7F','--danger':'#E5604D',
  '--border-soft':'#222228',
  '--font-display':'"Bricolage Grotesque",system-ui,sans-serif',
  '--font-ui':'"Satoshi","Manrope",system-ui,sans-serif',
  '--font-mono':'"JetBrains Mono",ui-monospace,monospace',
};

const CIcon = ({d, w=16, sw=1.75, children}) => (
  <svg viewBox="0 0 24 24" width={w} height={w} fill="none" stroke="currentColor"
       strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    {d ? <path d={d}/> : children}
  </svg>
);
const CKbd = ({children}) => (
  <span style={{
    fontFamily:'var(--font-mono)', fontSize:10.5, padding:'1px 6px',
    borderRadius:5, background:'var(--raised)', color:'var(--text-dim)',
    letterSpacing:'.04em',
  }}>{children}</span>
);

function CVShell({children}) {
  return (
    <div style={{
      ...CV_DARK, width:'100%', height:'100%',
      background:'var(--bg)', color:'var(--text)',
      fontFamily:'var(--font-ui)',
      display:'flex', flexDirection:'column', overflow:'hidden',
    }}>
      {children}
    </div>
  );
}

// ── shared top bar ──
function CVWindowBar({modeToggle=true, active='canvas'}) {
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
      <span style={{
        fontFamily:'var(--font-display)', fontWeight:700, fontSize:14,
        letterSpacing:'-0.02em', color:'var(--text)',
      }}>sveska<span style={{
        fontFamily:'var(--font-mono)', fontSize:12, color:'var(--accent)',
        fontWeight:500, marginLeft:2,
      }}>.studio</span></span>
      <div style={{width:1, height:18, background:'var(--border-soft)', marginLeft:8}}/>
      <span style={{
        fontFamily:'var(--font-mono)', fontSize:12, color:'var(--text)',
      }}><span style={{color:'var(--text-dim)'}}>weekend</span>.md</span>

      <div style={{flex:1}}/>

      {modeToggle && (
        <div style={{
          display:'inline-flex', padding:3, background:'var(--surface)',
          borderRadius:999, boxShadow:'inset 0 0 0 1px var(--border-soft)',
        }}>
          {[['text','M4 6h16M4 12h10M4 18h16'],['canvas','M3 17l6-6 4 4 8-8M3 21h18']].map(([k,d])=>(
            <button key={k} style={{
              appearance:'none', border:0, cursor:'pointer',
              padding:'5px 12px', borderRadius:999,
              background: k===active ? 'var(--bg)' : 'transparent',
              color: k===active ? 'var(--accent)' : 'var(--text-dim)',
              fontFamily:'var(--font-mono)', fontSize:11, letterSpacing:'.04em',
              display:'inline-flex', alignItems:'center', gap:6,
            }}>
              <CIcon d={d} w={13} sw={1.6}/>
              {k}
            </button>
          ))}
        </div>
      )}

      <button style={{
        appearance:'none', border:0, background:'var(--surface)', cursor:'pointer',
        height:28, padding:'0 12px', borderRadius:8,
        boxShadow:'inset 0 0 0 1px var(--border-soft)',
        color:'var(--text-dim)', fontFamily:'var(--font-ui)', fontSize:12,
        display:'inline-flex', alignItems:'center', gap:8, marginLeft:14,
      }}>
        <CIcon w={14}><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></CIcon>
        Search · jump
        <CKbd>⌘K</CKbd>
      </button>
    </div>
  );
}

// ── compact sidebar for canvas mode ──
function CVSidebar() {
  return (
    <aside style={{
      width:240, flexShrink:0,
      background:'var(--surface)', borderRight:'1px solid var(--border-soft)',
      display:'flex', flexDirection:'column', overflow:'hidden',
      padding:'14px 12px',
    }}>
      <div style={{
        fontFamily:'var(--font-mono)', fontSize:10.5, letterSpacing:'.10em',
        textTransform:'uppercase', color:'var(--text-dim)',
        padding:'4px 8px 10px',
      }}>NOTES WITH CANVAS · 3</div>

      {[
        {t:'weekend.md', body:'system diagram', meta:'now', active:true},
        {t:'v0.1 ship list', body:'milestone map', meta:'1h'},
        {t:'imports of Selimović', body:'time as procedure', meta:'2d'},
      ].map((n,i)=>(
        <div key={i} style={{
          padding:'10px 10px', borderRadius:8,
          background: n.active ? 'var(--bg)' : 'transparent',
          boxShadow: n.active ? 'inset 0 0 0 1px var(--border-soft)' : 'none',
          marginBottom:4, cursor:'pointer',
          display:'flex', flexDirection:'column', gap:4,
        }}>
          <div style={{display:'flex', alignItems:'center', gap:8}}>
            <CIcon d="M3 17l6-6 4 4 8-8M3 21h18" w={13} sw={1.6}/>
            <span style={{
              flex:1, fontFamily:'var(--font-display)', fontWeight:700, fontSize:13.5,
              letterSpacing:'-0.012em', color:'var(--text)',
            }}>{n.t}</span>
          </div>
          <div style={{
            paddingLeft:21, display:'flex', justifyContent:'space-between',
            fontFamily:'var(--font-mono)', fontSize:10.5, color:'var(--text-dim)',
            letterSpacing:'.04em',
          }}>
            <span>{n.body}</span>
            <span>{n.meta}</span>
          </div>
        </div>
      ))}

      <div style={{flex:1}}/>

      <div style={{
        padding:'14px 10px 8px', borderTop:'1px solid var(--border-soft)',
        margin:'8px -4px',
      }}>
        <div style={{
          fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'.10em',
          textTransform:'uppercase', color:'var(--text-dim)', marginBottom:8,
        }}>CanvasProvider</div>
        <div style={{
          display:'flex', alignItems:'center', gap:8,
          padding:'8px 10px', borderRadius:7, background:'var(--bg)',
          boxShadow:'inset 0 0 0 1px var(--border-soft)',
        }}>
          <span style={{
            width:7, height:7, borderRadius:999, background:'var(--ok)',
            boxShadow:'0 0 0 2px color-mix(in oklab, var(--ok) 22%, transparent)',
          }}/>
          <span style={{flex:1, fontFamily:'var(--font-mono)', fontSize:12, color:'var(--text)'}}>excalidraw</span>
          <span style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text-dim)', letterSpacing:'.04em'}}>MIT</span>
        </div>
        <div style={{
          marginTop:6, padding:'6px 10px', borderRadius:7,
          background:'transparent', color:'var(--text-dim)',
          boxShadow:'inset 0 0 0 1px var(--border-soft)',
          display:'flex', alignItems:'center', gap:8,
          fontFamily:'var(--font-mono)', fontSize:12,
        }}>
          <span style={{
            width:7, height:7, borderRadius:999, background:'#3a3a3e',
          }}/>
          tldraw
          <span style={{flex:1}}/>
          <span style={{
            fontFamily:'var(--font-mono)', fontSize:9.5, padding:'1px 6px', borderRadius:3,
            background:'var(--raised)', color:'var(--text-dim)', letterSpacing:'.06em',
          }}>flag</span>
        </div>
      </div>
    </aside>
  );
}

// ── canvas toolbar (left strip of tools) ──
function CVToolStrip() {
  return (
    <div style={{
      position:'absolute', top:24, left:24, zIndex:5,
      display:'flex', flexDirection:'column', gap:4,
      padding:6, borderRadius:12,
      background:'var(--surface)',
      boxShadow:'0 1px 0 rgba(255,255,255,.03), 0 12px 32px rgba(0,0,0,.45), inset 0 0 0 1px var(--border-soft)',
    }}>
      {[
        ['M5 12l5 5L20 7', false, 'select'],
        ['M3 7l9-4 9 4-9 4-9-4z M3 12l9 4 9-4 M3 17l9 4 9-4', true, 'free'],
        ['M4 4h16v16H4z', false, 'rect'],
        ['', false, 'ellipse', 'circle'],
        ['M5 12l14 0M13 6l6 6-6 6', false, 'arrow'],
        ['M4 6h16M4 12h10M4 18h16', false, 'text'],
        ['SEP'],
        ['M14 9l-4 4M16 4l-4 4 4 4M8 16l4-4-4-4M19 16l-4 4', false, 'connect'],
        ['M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z', false, 'frame'],
        ['SEP'],
        ['M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2', false, 'eraser'],
        ['SEP'],
        ['M9 14l-3 3-3-3M6 17V3M15 10l3-3 3 3M18 7v14', false, 'hand'],
      ].map((it,i)=>{
        if (it[0]==='SEP') return <div key={i} style={{height:1, background:'var(--border-soft)', margin:'2px 0'}}/>;
        const [d, active, label, shape] = it;
        return (
          <button key={i} title={label} style={{
            appearance:'none', border:0, cursor:'pointer',
            width:36, height:36, borderRadius:8,
            background: active ? 'var(--accent)' : 'transparent',
            color: active ? '#0C0C0E' : 'var(--text-dim)',
            display:'inline-flex', alignItems:'center', justifyContent:'center',
          }}>
            {shape === 'circle'
              ? <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={1.75}><circle cx="12" cy="12" r="8"/></svg>
              : <CIcon d={d} w={16} sw={1.75}/>}
          </button>
        );
      })}
    </div>
  );
}

// ── canvas right rail (color, stroke, options) ──
function CVRightRail() {
  return (
    <div style={{
      position:'absolute', top:24, right:24, zIndex:5,
      width:200,
      display:'flex', flexDirection:'column', gap:8,
      padding:14, borderRadius:12,
      background:'var(--surface)',
      boxShadow:'0 1px 0 rgba(255,255,255,.03), 0 12px 32px rgba(0,0,0,.45), inset 0 0 0 1px var(--border-soft)',
    }}>
      <div style={{
        fontFamily:'var(--font-mono)', fontSize:10.5, letterSpacing:'.10em',
        textTransform:'uppercase', color:'var(--text-dim)',
      }}>STROKE</div>
      <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
        {['#F4EFE6','#F2B544','#4FD6C4','#E5604D','#6FCF7F','#B8B2A6'].map((c,i)=>(
          <button key={c} style={{
            appearance:'none', border:0, cursor:'pointer',
            width:22, height:22, borderRadius:5, background:c,
            boxShadow: c==='#F4EFE6'
              ? '0 0 0 2px var(--surface), 0 0 0 4px var(--accent)'
              : 'inset 0 0 0 1px rgba(0,0,0,.2)',
          }}/>
        ))}
      </div>

      <div style={{
        fontFamily:'var(--font-mono)', fontSize:10.5, letterSpacing:'.10em',
        textTransform:'uppercase', color:'var(--text-dim)', marginTop:8,
      }}>WIDTH</div>
      <div style={{display:'flex', gap:6}}>
        {[1.5,2.5,4,6].map((w,i)=>(
          <button key={w} style={{
            appearance:'none', border:0, cursor:'pointer',
            flex:1, height:30, borderRadius:6,
            background: i===1 ? 'var(--raised)' : 'transparent',
            color: i===1 ? 'var(--text)' : 'var(--text-dim)',
            display:'inline-flex', alignItems:'center', justifyContent:'center',
            boxShadow: i===1 ? 'inset 0 0 0 1px var(--border-soft)' : 'none',
          }}>
            <span style={{width:14, height:w, background:'currentColor', borderRadius:999}}/>
          </button>
        ))}
      </div>

      <div style={{
        fontFamily:'var(--font-mono)', fontSize:10.5, letterSpacing:'.10em',
        textTransform:'uppercase', color:'var(--text-dim)', marginTop:8,
      }}>STYLE</div>
      <div style={{display:'flex', gap:6}}>
        {['hand-drawn','straight'].map((t,i)=>(
          <button key={t} style={{
            appearance:'none', border:0, cursor:'pointer',
            flex:1, height:28, borderRadius:6,
            background: i===0 ? 'var(--accent)' : 'transparent',
            color: i===0 ? '#0C0C0E' : 'var(--text-dim)',
            boxShadow: i===0 ? 'none' : 'inset 0 0 0 1px var(--border-soft)',
            fontFamily:'var(--font-mono)', fontSize:10.5, letterSpacing:'.04em',
          }}>{t}</button>
        ))}
      </div>

      {/* AI assist */}
      <div style={{
        marginTop:12, padding:'10px 12px', borderRadius:9,
        background:'color-mix(in oklab, var(--ai) 12%, transparent)',
        boxShadow:'inset 0 0 0 1px color-mix(in oklab, var(--ai) 40%, transparent)',
        display:'flex', flexDirection:'column', gap:6,
      }}>
        <div style={{
          fontFamily:'var(--font-mono)', fontSize:10.5, letterSpacing:'.10em',
          textTransform:'uppercase', color:'var(--ai)',
          display:'inline-flex', alignItems:'center', gap:6,
        }}>
          <CIcon d="M12 2l2.3 5.3L20 9.5l-4.5 3.8L17 19l-5-3-5 3 1.5-5.7L4 9.5l5.7-2.2z" w={11} sw={1.5}/>
          AI · sketch
        </div>
        <div style={{
          fontFamily:'var(--font-ui)', fontSize:12, color:'var(--text)', lineHeight:1.4,
        }}>Describe a diagram in the note; we'll sketch a first pass on the canvas.</div>
        <button style={{
          appearance:'none', border:0, cursor:'pointer',
          height:30, borderRadius:7, marginTop:4,
          background:'var(--ai)', color:'#0C0C0E',
          fontFamily:'var(--font-ui)', fontWeight:700, fontSize:12,
        }}>Sketch from note</button>
      </div>
    </div>
  );
}

// ── status bar specialized for canvas ──
function CVStatusBar({provider='excalidraw', license='MIT', live}) {
  return (
    <div style={{
      flexShrink:0, height:30, background:'var(--surface)',
      borderTop:'1px solid var(--border-soft)',
      display:'flex', alignItems:'center', padding:'0 16px',
      fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-dim)',
      letterSpacing:'.04em',
    }}>
      <span style={{display:'inline-flex', gap:6, alignItems:'center', padding:'0 10px 0 0', color:'var(--ok)'}}>
        <span style={{width:6, height:6, borderRadius:999, background:'var(--ok)'}}/>
        Saved · 14:02
      </span>
      <span style={{width:1, height:14, background:'var(--border-soft)', margin:'0 4px'}}/>
      <span style={{padding:'0 10px'}}>canvas · 22 nodes · 18 edges</span>
      <span style={{width:1, height:14, background:'var(--border-soft)', margin:'0 4px'}}/>
      <span style={{padding:'0 10px'}}>zoom 100% · grid 20</span>
      <div style={{flex:1}}/>
      {live && (
        <>
          <span style={{display:'inline-flex', gap:6, alignItems:'center', padding:'0 10px', color:'var(--ai)'}}>
            <span style={{width:6, height:6, borderRadius:999, background:'var(--ai)', boxShadow:'0 0 0 2px color-mix(in oklab, var(--ai) 22%, transparent)'}}/>
            /sketch · streaming
          </span>
          <span style={{width:1, height:14, background:'var(--border-soft)', margin:'0 4px'}}/>
        </>
      )}
      <span style={{padding:'0 10px'}}>
        <span style={{color:'var(--text)'}}>CanvasProvider</span>
        <span> · {provider} · </span>
        <span style={{color:'var(--ok)'}}>{license}</span>
      </span>
      <span style={{width:1, height:14, background:'var(--border-soft)', margin:'0 4px'}}/>
      <span style={{padding:'0 10px', color:'var(--accent)'}}>● Offline · local-first</span>
    </div>
  );
}

// ── the actual drawing (hand-drawn system diagram) ──
function CanvasSketch({selected}) {
  // Drawn in 1000x600 viewbox, scales to fit.
  return (
    <svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid meet" style={{
      width:'100%', height:'100%', display:'block',
    }} aria-hidden="true">
      <defs>
        <filter id="rough">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="3"/>
          <feDisplacementMap in="SourceGraphic" scale="2"/>
        </filter>
        <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="10" r=".8" fill="#222228"/>
        </pattern>
      </defs>

      <rect width="1000" height="600" fill="url(#dots)"/>

      {/* NOTE box (top-left) */}
      <g filter="url(#rough)">
        <rect x="80" y="80" width="240" height="140" rx="14" fill="none" stroke="#F4EFE6" strokeWidth="2.2"/>
      </g>
      <text x="100" y="115" fontFamily="JetBrains Mono" fontSize="14" fill="#F2B544">weekend.md</text>
      <text x="100" y="142" fontFamily="JetBrains Mono" fontSize="11" fill="#B8B2A6">3 paragraphs</text>
      <text x="100" y="160" fontFamily="JetBrains Mono" fontSize="11" fill="#B8B2A6">checklist · 7 items</text>
      <text x="100" y="178" fontFamily="JetBrains Mono" fontSize="11" fill="#B8B2A6">312 words</text>
      <text x="100" y="202" fontFamily="JetBrains Mono" fontSize="11" fill="#4FD6C4">+ canvas</text>

      {/* SNAPSHOTS (top-middle) */}
      <g filter="url(#rough)" transform="translate(420 60)">
        <rect x="0" y="0" width="160" height="40" rx="6" fill="none" stroke="#F4EFE6" strokeWidth="2"/>
        <rect x="-6" y="-6" width="160" height="40" rx="6" fill="none" stroke="#F4EFE6" strokeWidth="2" opacity=".5"/>
        <rect x="-12" y="-12" width="160" height="40" rx="6" fill="none" stroke="#F4EFE6" strokeWidth="2" opacity=".25"/>
      </g>
      <text x="440" y="86" fontFamily="JetBrains Mono" fontSize="12" fill="#F4EFE6">snapshots · 7</text>
      <text x="440" y="118" fontFamily="JetBrains Mono" fontSize="10" fill="#B8B2A6">named · auto · diff</text>

      {/* DEXIE INDEXEDDB (right) */}
      <g filter="url(#rough)" transform="translate(740 80)">
        <path d="M 0 20 Q 0 0 90 0 Q 180 0 180 20 L 180 120 Q 180 140 90 140 Q 0 140 0 120 Z"
              fill="none" stroke="#F2B544" strokeWidth="2.4"/>
        <ellipse cx="90" cy="20" rx="90" ry="14" fill="none" stroke="#F2B544" strokeWidth="2"/>
      </g>
      <text x="765" y="170" fontFamily="JetBrains Mono" fontSize="13" fill="#F2B544">IndexedDB</text>
      <text x="765" y="190" fontFamily="JetBrains Mono" fontSize="11" fill="#B8B2A6">Dexie · local</text>
      <text x="765" y="208" fontFamily="JetBrains Mono" fontSize="11" fill="#B8B2A6">6.4 MB / 50 MB</text>

      {/* CANVAS DOC (mid-left) */}
      <g filter="url(#rough)" transform="translate(80 300)">
        <rect x="0" y="0" width="240" height="120" rx="10" fill="none" stroke="#4FD6C4" strokeWidth="2.4"/>
      </g>
      <text x="100" y="330" fontFamily="JetBrains Mono" fontSize="13" fill="#4FD6C4">canvas · this one</text>
      <text x="100" y="354" fontFamily="JetBrains Mono" fontSize="11" fill="#B8B2A6">excalidraw doc</text>
      <text x="100" y="372" fontFamily="JetBrains Mono" fontSize="11" fill="#B8B2A6">22 nodes · 18 edges</text>
      <text x="100" y="394" fontFamily="JetBrains Mono" fontSize="11" fill="#B8B2A6">blob · 14 kb</text>

      {/* CanvasProvider (center) */}
      <g filter="url(#rough)" transform="translate(420 280)">
        <rect x="0" y="0" width="220" height="160" rx="10" fill="none" stroke="#F2B544" strokeWidth="2.8" {...(selected?{}:{}) }/>
        {selected && <rect x="-6" y="-6" width="232" height="172" rx="14" fill="none" stroke="#F2B544" strokeWidth="1.4" strokeDasharray="6 4"/>}
      </g>
      <text x="440" y="316" fontFamily="JetBrains Mono" fontSize="14" fill="#F2B544">CanvasProvider</text>
      <text x="440" y="336" fontFamily="JetBrains Mono" fontSize="10.5" fill="#B8B2A6" letterSpacing=".04em">— mount(el)</text>
      <text x="440" y="354" fontFamily="JetBrains Mono" fontSize="10.5" fill="#B8B2A6">— load(doc)</text>
      <text x="440" y="372" fontFamily="JetBrains Mono" fontSize="10.5" fill="#B8B2A6">— export(fmt)</text>
      <text x="440" y="390" fontFamily="JetBrains Mono" fontSize="10.5" fill="#B8B2A6">— onChange(cb)</text>
      <text x="440" y="418" fontFamily="JetBrains Mono" fontSize="10" fill="#F2B544" letterSpacing=".06em">SEE CLAUDE.md §3</text>

      {/* IMPL CANDIDATES (right) */}
      <g filter="url(#rough)" transform="translate(740 260)">
        <rect x="0" y="0" width="180" height="60" rx="8" fill="#6FCF7F" stroke="#6FCF7F" strokeWidth="2"/>
      </g>
      <text x="760" y="296" fontFamily="JetBrains Mono" fontSize="13" fill="#0C0C0E">excalidraw</text>
      <text x="760" y="312" fontFamily="JetBrains Mono" fontSize="10.5" fill="#0C0C0E">MIT · v1 · shipped</text>

      <g filter="url(#rough)" transform="translate(740 340)">
        <rect x="0" y="0" width="180" height="60" rx="8" fill="none" stroke="#B8B2A6" strokeWidth="2" strokeDasharray="8 4"/>
      </g>
      <text x="760" y="376" fontFamily="JetBrains Mono" fontSize="13" fill="#B8B2A6">tldraw</text>
      <text x="760" y="392" fontFamily="JetBrains Mono" fontSize="10.5" fill="#B8B2A6">flag · $6k/yr</text>

      {/* EXPORTS (bottom-left) */}
      <g filter="url(#rough)" transform="translate(80 470)">
        <rect x="0" y="0" width="240" height="80" rx="8" fill="none" stroke="#F4EFE6" strokeWidth="2"/>
      </g>
      <text x="100" y="500" fontFamily="JetBrains Mono" fontSize="12" fill="#F4EFE6">export</text>
      <text x="100" y="520" fontFamily="JetBrains Mono" fontSize="10.5" fill="#B8B2A6">.png · .svg · .json</text>
      <text x="100" y="538" fontFamily="JetBrains Mono" fontSize="10.5" fill="#B8B2A6">+ embedded in .md/.pdf</text>

      {/* ARROWS (hand-drawn) */}
      {/* note → snapshots */}
      <g filter="url(#rough)" stroke="#F4EFE6" strokeWidth="2" fill="none">
        <path d="M 320 150 C 380 140, 380 80, 420 80"/>
        <path d="M 414 75 L 430 80 L 416 90"/>
      </g>
      {/* snapshots → indexed */}
      <g filter="url(#rough)" stroke="#F2B544" strokeWidth="2" fill="none">
        <path d="M 600 100 L 720 130"/>
        <path d="M 714 124 L 728 132 L 712 138"/>
      </g>
      {/* note → canvas doc */}
      <g filter="url(#rough)" stroke="#4FD6C4" strokeWidth="2" fill="none">
        <path d="M 180 230 L 180 290"/>
        <path d="M 174 285 L 180 296 L 186 285"/>
      </g>
      {/* canvas → provider */}
      <g filter="url(#rough)" stroke="#F2B544" strokeWidth="2.4" fill="none">
        <path d="M 320 360 L 410 360"/>
        <path d="M 404 354 L 416 360 L 404 366"/>
      </g>
      {/* provider → excalidraw */}
      <g filter="url(#rough)" stroke="#6FCF7F" strokeWidth="2.4" fill="none">
        <path d="M 640 320 L 730 295"/>
        <path d="M 724 289 L 736 294 L 728 304"/>
      </g>
      {/* provider → tldraw (dashed) */}
      <g filter="url(#rough)" stroke="#B8B2A6" strokeWidth="2" strokeDasharray="6 4" fill="none">
        <path d="M 640 380 L 730 370"/>
        <path d="M 724 364 L 736 370 L 726 376"/>
      </g>
      {/* canvas → exports */}
      <g filter="url(#rough)" stroke="#F4EFE6" strokeWidth="1.6" fill="none">
        <path d="M 200 420 L 200 470"/>
        <path d="M 194 465 L 200 476 L 206 465"/>
      </g>

      {/* hand-written annotation */}
      <text x="540" y="240" fontFamily="Bricolage Grotesque" fontWeight="700" fontSize="20"
            fill="#F2B544" transform="rotate(-3 540 240)">the seam</text>
      <g stroke="#F2B544" strokeWidth="1.4" fill="none" filter="url(#rough)">
        <path d="M 540 246 C 542 260, 540 270, 530 278"/>
      </g>

      {/* live caret on the page */}
      <text x="850" y="500" fontFamily="JetBrains Mono" fontSize="11" fill="#B8B2A6"
            transform="rotate(-2 850 500)">caret = me, drawing</text>
    </svg>
  );
}

// ╔════════════════════════════════════════════════════════════╗
// ║ SCREEN 1 · Canvas mode active                              ║
// ╚════════════════════════════════════════════════════════════╝
function ScreenCanvasActive() {
  return (
    <CVShell>
      <CVWindowBar active="canvas"/>
      <div style={{flex:1, display:'flex', overflow:'hidden'}}>
        <CVSidebar/>
        <main style={{flex:1, position:'relative', overflow:'hidden', background:'var(--bg)'}}>
          <CVToolStrip/>
          <CVRightRail/>
          {/* canvas surface */}
          <div style={{position:'absolute', inset:0, padding:'20px 230px 20px 90px'}}>
            <CanvasSketch selected/>
          </div>
          {/* selection toolbar floating at top */}
          <div style={{
            position:'absolute', top:24, left:'50%', transform:'translateX(-50%)',
            display:'inline-flex', alignItems:'center', gap:4,
            padding:6, borderRadius:10,
            background:'var(--surface)',
            boxShadow:'0 12px 32px rgba(0,0,0,.45), inset 0 0 0 1px var(--accent)',
            zIndex:6,
          }}>
            <span style={{
              fontFamily:'var(--font-mono)', fontSize:10.5, letterSpacing:'.10em',
              textTransform:'uppercase', color:'var(--accent)', padding:'0 8px',
            }}>SELECTED · 1 NODE</span>
            <span style={{width:1, height:18, background:'var(--border-soft)', margin:'0 2px'}}/>
            <button style={tbMini()}><CIcon d="M9 12l2 2 4-4" w={14}/></button>
            <button style={tbMini()}><CIcon d="M5 12h14M12 5v14" w={14}/></button>
            <button style={tbMini()}><CIcon d="M4 6h16M4 12h10M4 18h16" w={14}/></button>
            <span style={{width:1, height:18, background:'var(--border-soft)', margin:'0 2px'}}/>
            <button style={tbMini('danger')}><CIcon d="M6 6l12 12M18 6L6 18" w={14} sw={2}/></button>
          </div>
        </main>
      </div>
      <CVStatusBar/>
    </CVShell>
  );
}
function tbMini(kind) {
  return {
    appearance:'none', border:0, cursor:'pointer',
    width:30, height:28, borderRadius:6,
    background:'transparent',
    color: kind==='danger' ? 'var(--danger)' : 'var(--text-dim)',
    display:'inline-flex', alignItems:'center', justifyContent:'center',
  };
}

// ╔════════════════════════════════════════════════════════════╗
// ║ SCREEN 2 · Text ↔ canvas split + transition                ║
// ╚════════════════════════════════════════════════════════════╝
function ScreenSplit() {
  return (
    <CVShell>
      <CVWindowBar active="canvas"/>
      <div style={{
        flexShrink:0, height:36,
        background:'var(--surface)', borderBottom:'1px solid var(--border-soft)',
        display:'flex', alignItems:'center', padding:'0 24px', gap:14,
      }}>
        <span style={{
          fontFamily:'var(--font-mono)', fontSize:11, letterSpacing:'.10em',
          textTransform:'uppercase', color:'var(--text-dim)',
        }}>SPLIT VIEW</span>
        <span style={{
          fontFamily:'var(--font-mono)', fontSize:11, color:'var(--accent)',
          letterSpacing:'.04em',
        }}>text ↔ canvas · linked</span>
        <div style={{flex:1}}/>
        <span style={{
          fontFamily:'var(--font-mono)', fontSize:10.5, color:'var(--text-dim)', letterSpacing:'.04em',
        }}>type on the left · sketch on the right · both persist</span>
      </div>
      <div style={{flex:1, display:'flex', overflow:'hidden'}}>
        {/* LEFT — text */}
        <div style={{flex:1, padding:'40px 56px', overflow:'auto', borderRight:'1px solid var(--border-soft)'}}>
          <div style={{
            maxWidth:680,
            fontFamily:'var(--font-mono)', fontSize:15.5, lineHeight:1.75, color:'var(--text)',
          }}>
            <div style={{color:'var(--accent)'}}># weekend.md</div>
            <div style={{color:'var(--text-dim)'}}>&lt;!-- linked canvas · 22 nodes --&gt;</div>
            <br/>
            <div>The system has four parts. <span style={{
              background:'color-mix(in oklab, var(--ai) 18%, transparent)',
              padding:'0 4px', borderRadius:3,
            }}>The note is the source of truth — body and metadata. Snapshots are procedural memory. The canvas is bound to the note, not the user. The provider is swappable.</span></div>
            <br/>
            <div style={{color:'var(--accent)'}}>## the seam</div>
            <div>
              <Check on/> CanvasProvider · interface defined<br/>
              <Check on/> Excalidraw impl (MIT) shipped as v1<br/>
              <Check/> tldraw adapter behind <span style={{color:'var(--accent)'}}>VITE_TLDRAW=1</span><br/>
              <Check/> license decision before prod
            </div>
            <br/>
            <div style={{
              padding:'12px 14px', background:'color-mix(in oklab, var(--ai) 12%, transparent)',
              borderLeft:'2px solid var(--ai)', borderRadius:6,
              fontSize:14,
            }}>
              <span style={{
                fontFamily:'var(--font-mono)', fontSize:10.5, letterSpacing:'.10em',
                textTransform:'uppercase', color:'var(--ai)', display:'block', marginBottom:6,
              }}>✦ AI · sketched the diagram on the right</span>
              <span style={{fontFamily:'var(--font-mono)', fontSize:13, color:'var(--text)'}}>22 nodes · 18 edges · 2.1 s</span><br/>
              <span style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-dim)'}}>esc to undo · ⌘↵ to keep</span>
            </div>
          </div>
        </div>

        {/* RIGHT — canvas */}
        <div style={{flex:1, position:'relative', background:'var(--bg)', overflow:'hidden'}}>
          <CanvasSketch/>
          <div style={{
            position:'absolute', bottom:14, right:14,
            fontFamily:'var(--font-mono)', fontSize:10.5, color:'var(--text-dim)',
            letterSpacing:'.04em',
            padding:'5px 9px', borderRadius:5,
            background:'var(--surface)', boxShadow:'inset 0 0 0 1px var(--border-soft)',
          }}>excalidraw · 100% · 22 / 18</div>
        </div>
      </div>
      <CVStatusBar live="/sketch · streaming"/>
    </CVShell>
  );
}

function Check({on}) {
  return (
    <span style={{
      display:'inline-block', verticalAlign:'-3px',
      width:14, height:14, borderRadius:3.5,
      border: on?'1.5px solid var(--accent)':'1.5px solid var(--text-dim)',
      background: on?'var(--accent)':'transparent',
      marginRight:8, position:'relative',
    }}>
      {on && <span style={{
        position:'absolute', left:3, top:1, width:6, height:3,
        borderLeft:'2px solid #0C0C0E', borderBottom:'2px solid #0C0C0E',
        transform:'rotate(-45deg)',
      }}/>}
    </span>
  );
}

// ╔════════════════════════════════════════════════════════════╗
// ║ SCREEN 3 · Provider settings — the seam, explained         ║
// ╚════════════════════════════════════════════════════════════╝
function ScreenProvider() {
  return (
    <CVShell>
      <CVWindowBar modeToggle={false}/>
      <div style={{flex:1, display:'flex', overflow:'hidden'}}>
        {/* nav rail */}
        <aside style={{
          width:240, flexShrink:0, background:'var(--surface)',
          borderRight:'1px solid var(--border-soft)',
          padding:'18px 12px', display:'flex', flexDirection:'column',
        }}>
          <div style={{
            fontFamily:'var(--font-display)', fontWeight:700, fontSize:22,
            letterSpacing:'-0.018em', color:'var(--text)', padding:'8px 12px 16px',
          }}>Settings</div>
          {[
            ['editor','Editor'],
            ['appearance','Appearance'],
            ['ai','AI · proxy'],
            ['canvas','Canvas · provider', true],
            ['data','Data · backup'],
            ['privacy','Privacy'],
            ['keyboard','Keyboard'],
            ['about','About'],
          ].map(([id,label,on])=>(
            <button key={id} style={{
              appearance:'none', border:0, cursor:'pointer', textAlign:'left',
              padding:'8px 12px', borderRadius:8,
              background: on ? 'color-mix(in oklab, var(--accent) 14%, transparent)' : 'transparent',
              color: on ? 'var(--text)' : 'var(--text-dim)',
              fontFamily:'var(--font-ui)', fontSize:13.5, fontWeight:500,
              display:'flex', alignItems:'center', gap:10,
            }}>
              <span style={{
                width:6, height:6, borderRadius:999,
                background: on ? 'var(--accent)' : 'transparent',
                outline: on ? 'none' : '1px solid var(--border-soft)',
              }}/>
              {label}
            </button>
          ))}
        </aside>

        <main style={{flex:1, overflowY:'auto'}}>
          {/* page head */}
          <div style={{padding:'32px 40px 18px', borderBottom:'1px solid var(--border-soft)'}}>
            <div style={{
              fontFamily:'var(--font-mono)', fontSize:11, letterSpacing:'.12em',
              textTransform:'uppercase', color:'var(--accent)', marginBottom:8,
            }}>Canvas · provider · M5</div>
            <div style={{
              fontFamily:'var(--font-display)', fontWeight:700, fontSize:34,
              letterSpacing:'-0.025em', color:'var(--text)', margin:'0 0 6px',
            }}>The swappable canvas.</div>
            <div style={{color:'var(--text-dim)', fontSize:14, maxWidth:'62ch'}}>
              Sveska's drawing surface sits behind an interface — <span className="mono" style={{fontFamily:'var(--font-mono)'}}>CanvasProvider</span>. Excalidraw ships as v1. tldraw lives behind a build flag and a license key. App code never imports either directly.
            </div>
          </div>

          {/* The two cards — Excalidraw vs tldraw */}
          <div style={{padding:'20px 40px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:18}}>
            {/* EXCALIDRAW · active */}
            <div style={{
              background:'var(--surface)', border:'2px solid var(--accent)',
              borderRadius:10, padding:24,
              display:'flex', flexDirection:'column', gap:14,
            }}>
              <div style={{display:'flex', alignItems:'center', gap:10}}>
                <span style={{
                  fontFamily:'var(--font-mono)', fontSize:10.5, padding:'3px 8px',
                  borderRadius:5, background:'var(--accent)', color:'#0C0C0E',
                  letterSpacing:'.06em', textTransform:'uppercase', fontWeight:500,
                }}>ACTIVE</span>
                <span style={{
                  fontFamily:'var(--font-mono)', fontSize:11, color:'var(--ok)',
                  letterSpacing:'.04em',
                  display:'inline-flex', alignItems:'center', gap:6,
                }}>
                  <span style={{width:6, height:6, borderRadius:999, background:'var(--ok)'}}/>
                  MIT · free forever
                </span>
              </div>
              <h3 style={{
                margin:0, fontFamily:'var(--font-display)', fontWeight:700, fontSize:30,
                letterSpacing:'-0.022em', color:'var(--text)',
              }}>excalidraw</h3>
              <div style={{color:'var(--text-dim)', fontSize:14, lineHeight:1.55}}>
                Hand-drawn aesthetic. MIT licensed. Already in the bundle. Loaded lazily on first canvas open. No cost, no watermark, no flag.
              </div>

              <div style={{
                marginTop:6, padding:'12px 14px', borderRadius:8,
                background:'var(--bg)', boxShadow:'inset 0 0 0 1px var(--border-soft)',
                fontFamily:'var(--font-mono)', fontSize:11.5, lineHeight:1.7,
                color:'var(--text)',
              }}>
                <span style={{color:'var(--accent)'}}>import</span> {'{'} ExcalidrawProvider {'}'} <span style={{color:'var(--accent)'}}>from</span> <span style={{color:'var(--ok)'}}>'~/canvas/excalidraw'</span>;<br/>
                <span style={{color:'var(--text-dim)'}}>// ^ the only place this import is allowed</span><br/>
                canvas.<span style={{color:'var(--accent)'}}>register</span>(<span style={{color:'var(--ai)'}}>'excalidraw'</span>, ExcalidrawProvider);
              </div>

              <div style={{
                display:'flex', justifyContent:'space-between', alignItems:'center',
                paddingTop:14, borderTop:'1px solid var(--border-soft)',
              }}>
                <span style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-dim)', letterSpacing:'.04em'}}>v0.18 · 84 KB gz · loaded on demand</span>
                <button style={{
                  appearance:'none', border:0, cursor:'pointer',
                  height:34, padding:'0 14px', borderRadius:8,
                  background:'transparent', color:'var(--text-dim)',
                  boxShadow:'inset 0 0 0 1px var(--border-soft)',
                  fontFamily:'var(--font-ui)', fontWeight:500, fontSize:12,
                }}>Configure ↗</button>
              </div>
            </div>

            {/* TLDRAW · gated */}
            <div style={{
              background:'var(--surface)', border:'1px dashed var(--border-soft)',
              borderRadius:10, padding:24,
              display:'flex', flexDirection:'column', gap:14,
              opacity:.85,
            }}>
              <div style={{display:'flex', alignItems:'center', gap:10}}>
                <span style={{
                  fontFamily:'var(--font-mono)', fontSize:10.5, padding:'3px 8px',
                  borderRadius:5, background:'var(--raised)', color:'var(--text-dim)',
                  letterSpacing:'.06em', textTransform:'uppercase',
                }}>FEATURE FLAG · VITE_TLDRAW=1</span>
                <span style={{
                  fontFamily:'var(--font-mono)', fontSize:11, color:'var(--amber-500)',
                  letterSpacing:'.04em',
                  display:'inline-flex', alignItems:'center', gap:6,
                }}>
                  <span style={{width:6, height:6, borderRadius:999, background:'var(--amber-500)'}}/>
                  license · $6k/yr · prod
                </span>
              </div>
              <h3 style={{
                margin:0, fontFamily:'var(--font-display)', fontWeight:700, fontSize:30,
                letterSpacing:'-0.022em', color:'var(--text)',
              }}>tldraw</h3>
              <div style={{color:'var(--text-dim)', fontSize:14, lineHeight:1.55}}>
                Polished, performant, infinitely deep. v4+ dev-only is free; production needs a license. Sveska ships it behind a build flag — never loaded unless explicitly enabled.
              </div>

              <div style={{
                marginTop:6, padding:'12px 14px', borderRadius:8,
                background:'var(--bg)', boxShadow:'inset 0 0 0 1px var(--border-soft)',
                fontFamily:'var(--font-mono)', fontSize:11.5, lineHeight:1.7,
                color:'var(--text-dim)',
              }}>
                <span style={{color:'var(--text-dim)'}}>// only when VITE_TLDRAW=1 at build time</span><br/>
                <span style={{color:'var(--accent)'}}>const</span> tldraw = <span style={{color:'var(--accent)'}}>await import</span>(<span style={{color:'var(--ok)'}}>'~/canvas/tldraw'</span>);<br/>
                canvas.<span style={{color:'var(--accent)'}}>register</span>(<span style={{color:'var(--ai)'}}>'tldraw'</span>, tldraw.<span style={{color:'var(--ai)'}}>TldrawProvider</span>);
              </div>

              <div style={{
                display:'flex', justifyContent:'space-between', alignItems:'center',
                paddingTop:14, borderTop:'1px solid var(--border-soft)',
              }}>
                <span style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-dim)', letterSpacing:'.04em'}}>parked · CLAUDE.md §11 · decide when MRR ≥ $15k/mo</span>
                <button style={{
                  appearance:'none', border:0, cursor:'pointer',
                  height:34, padding:'0 14px', borderRadius:8,
                  background:'transparent', color:'var(--text-dim)',
                  boxShadow:'inset 0 0 0 1px var(--border-soft)',
                  fontFamily:'var(--font-ui)', fontWeight:500, fontSize:12,
                }}>Enable later</button>
              </div>
            </div>
          </div>

          {/* preference rows */}
          <div style={{padding:'14px 40px 32px'}}>
            <div style={{
              fontFamily:'var(--font-mono)', fontSize:11, letterSpacing:'.10em',
              textTransform:'uppercase', color:'var(--text-dim)', margin:'12px 0 8px',
            }}>BEHAVIOR</div>
            {[
              ['Auto-open on /canvas command', 'Slash /canvas in any note opens or creates one', true],
              ['Persist last tool', 'Reopen with whichever tool was active', true],
              ['Sync canvas with text mode', 'Edits to either persist; the canvas binds to noteId', true],
              ['AI sketch · /sketch', 'Describe a diagram in the note; AI drafts a first pass on the canvas', false],
              ['Snap to grid', '20 px grid · same as the design system spacing', true],
            ].map(([name, hint, on], i) => (
              <div key={i} style={{
                display:'grid', gridTemplateColumns:'1fr auto', gap:24,
                alignItems:'center', padding:'14px 0',
                borderTop: i===0 ? 0 : '1px solid var(--border-soft)',
              }}>
                <div>
                  <div style={{fontFamily:'var(--font-ui)', fontWeight:500, fontSize:14.5, color:'var(--text)'}}>{name}</div>
                  <div style={{fontFamily:'var(--font-mono)', fontSize:11.5, color:'var(--text-dim)', letterSpacing:'.02em', marginTop:3}}>{hint}</div>
                </div>
                <div style={{
                  width:38, height:22, borderRadius:999, position:'relative',
                  background: on ? 'color-mix(in oklab, var(--accent) 60%, transparent)' : 'var(--raised)',
                }}>
                  <div style={{
                    position:'absolute', top:2, left: on?18:2, width:18, height:18,
                    borderRadius:999, background: on ? 'var(--accent)' : 'var(--text-dim)',
                  }}/>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </CVShell>
  );
}

// ╔════════════════════════════════════════════════════════════╗
// ║ SCREEN 4 · Export modal                                    ║
// ╚════════════════════════════════════════════════════════════╝
function ScreenExport() {
  return (
    <CVShell>
      {/* dimmed shell underneath */}
      <div style={{position:'absolute', inset:0, filter:'blur(3px) saturate(.85)', opacity:.4, pointerEvents:'none'}}>
        <ScreenCanvasActive/>
      </div>
      <div style={{position:'absolute', inset:0, background:'rgba(12,12,14,0.55)', pointerEvents:'none'}}/>

      {/* modal */}
      <div style={{
        position:'absolute', top:'50%', left:'50%', transform:'translate(-50%, -50%)',
        width:780,
        background:'var(--surface)', borderRadius:14,
        border:'1px solid var(--border-soft)',
        boxShadow:'0 1px 0 rgba(255,255,255,.03), 0 28px 80px rgba(0,0,0,.6)',
        overflow:'hidden',
        display:'flex',
      }}>
        {/* preview pane */}
        <div style={{
          flex:'0 0 380px',
          background:'var(--bg)', borderRight:'1px solid var(--border-soft)',
          padding:22, display:'flex', flexDirection:'column', gap:14,
        }}>
          <div style={{
            fontFamily:'var(--font-mono)', fontSize:10.5, letterSpacing:'.12em',
            textTransform:'uppercase', color:'var(--text-dim)',
            display:'flex', justifyContent:'space-between',
          }}>
            <span>PREVIEW</span>
            <span>1920 × 1080 · 480 KB</span>
          </div>
          <div style={{
            flex:1, borderRadius:8, background:'var(--bg)',
            boxShadow:'inset 0 0 0 1px var(--border-soft)', overflow:'hidden',
          }}>
            <CanvasSketch/>
          </div>
          <div style={{display:'flex', gap:8, alignItems:'center'}}>
            <span style={{
              fontFamily:'var(--font-mono)', fontSize:10.5, padding:'3px 8px', borderRadius:5,
              background:'color-mix(in oklab, var(--ok) 14%, transparent)', color:'var(--ok)',
              letterSpacing:'.04em',
            }}>● ready</span>
            <span style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-dim)'}}>22 nodes · 18 edges · auto-trimmed bounds</span>
          </div>
        </div>

        {/* options pane */}
        <div style={{flex:1, padding:'22px 24px', display:'flex', flexDirection:'column'}}>
          <div style={{
            fontFamily:'var(--font-mono)', fontSize:11, letterSpacing:'.10em',
            textTransform:'uppercase', color:'var(--accent)', marginBottom:8,
          }}>EXPORT CANVAS · weekend.md</div>
          <h3 style={{
            margin:0, fontFamily:'var(--font-display)', fontWeight:700, fontSize:24,
            letterSpacing:'-0.018em', color:'var(--text)',
          }}>Take it with you.</h3>

          <div style={{
            fontFamily:'var(--font-mono)', fontSize:10.5, letterSpacing:'.10em',
            textTransform:'uppercase', color:'var(--text-dim)', margin:'18px 0 8px',
          }}>FORMAT</div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
            <FormatCard label=".png" sub="rasterized · 2× retina" active/>
            <FormatCard label=".svg" sub="vector · editable in Figma"/>
            <FormatCard label=".json" sub="excalidraw native · re-importable"/>
            <FormatCard label=".pdf" sub="embedded · with note title page"/>
          </div>

          <div style={{
            fontFamily:'var(--font-mono)', fontSize:10.5, letterSpacing:'.10em',
            textTransform:'uppercase', color:'var(--text-dim)', margin:'18px 0 8px',
          }}>OPTIONS</div>
          <Row name="Resolution" right={
            <div style={{display:'inline-flex', background:'var(--raised)', borderRadius:7, padding:2}}>
              {[['1×',false],['2×',true],['3×',false],['4×',false]].map(([t,on])=>(
                <span key={t} style={{
                  padding:'4px 10px', borderRadius:5,
                  background: on ? 'var(--surface)' : 'transparent',
                  color: on ? 'var(--text)' : 'var(--text-dim)',
                  fontFamily:'var(--font-mono)', fontSize:11, letterSpacing:'.04em',
                  cursor:'pointer',
                }}>{t}</span>
              ))}
            </div>
          }/>
          <Row name="Transparent background" hint="ink-900 otherwise" right={<MiniToggle/>}/>
          <Row name="Embed font subset" hint="Bricolage + JetBrains glyphs used in this canvas" right={<MiniToggle on/>}/>
          <Row name="Watermark" hint="sveska.studio · bottom-right · subtle" right={<MiniToggle on/>}/>

          <div style={{flex:1}}/>

          <div style={{
            margin:'18px 0 14px', padding:'10px 14px', borderRadius:8,
            background:'var(--bg)', boxShadow:'inset 0 0 0 1px var(--border-soft)',
            display:'flex', justifyContent:'space-between', alignItems:'center',
            fontFamily:'var(--font-mono)', fontSize:11.5, color:'var(--text-dim)',
            letterSpacing:'.04em',
          }}>
            <span>filename</span>
            <span style={{color:'var(--text)'}}>weekend · canvas · 2026-05-16.png</span>
          </div>

          <div style={{display:'flex', justifyContent:'flex-end', gap:10}}>
            <button style={{
              appearance:'none', border:0, cursor:'pointer',
              height:38, padding:'0 16px', borderRadius:8,
              background:'transparent', color:'var(--text)',
              boxShadow:'inset 0 0 0 1px var(--border-soft)',
              fontFamily:'var(--font-ui)', fontWeight:700, fontSize:13,
              display:'inline-flex', alignItems:'center', gap:8,
            }}>Cancel <span style={{
              fontFamily:'var(--font-mono)', fontSize:10.5, padding:'1px 5px',
              borderRadius:4, background:'var(--raised)', color:'var(--text-dim)',
            }}>esc</span></button>
            <button style={{
              appearance:'none', border:0, cursor:'pointer',
              height:38, padding:'0 18px', borderRadius:8,
              background:'var(--accent)', color:'#0C0C0E',
              fontFamily:'var(--font-ui)', fontWeight:700, fontSize:13,
              display:'inline-flex', alignItems:'center', gap:8,
            }}>
              <CIcon d="M12 5v14M5 12l7 7 7-7" w={14} sw={2}/>
              Download .png · 2×
              <span style={{
                fontFamily:'var(--font-mono)', fontSize:10.5, padding:'1px 5px',
                borderRadius:4, background:'rgba(0,0,0,.18)',
              }}>⌘↵</span>
            </button>
          </div>
        </div>
      </div>
    </CVShell>
  );
}

function FormatCard({label, sub, active}) {
  return (
    <button style={{
      appearance:'none', border:0, cursor:'pointer', textAlign:'left',
      padding:'12px 14px', borderRadius:9,
      background: active ? 'color-mix(in oklab, var(--accent) 14%, transparent)' : 'transparent',
      boxShadow: active ? 'inset 0 0 0 1.5px var(--accent)' : 'inset 0 0 0 1px var(--border-soft)',
      display:'flex', flexDirection:'column', gap:4,
      color: 'var(--text)',
    }}>
      <span style={{fontFamily:'var(--font-mono)', fontSize:14, color: active?'var(--accent)':'var(--text)', letterSpacing:'.02em'}}>{label}</span>
      <span style={{fontFamily:'var(--font-mono)', fontSize:10.5, color:'var(--text-dim)', letterSpacing:'.04em'}}>{sub}</span>
    </button>
  );
}
function Row({name, hint, right}) {
  return (
    <div style={{
      display:'grid', gridTemplateColumns:'1fr auto', gap:18, alignItems:'center',
      padding:'10px 0', borderTop:'1px solid var(--border-soft)',
    }}>
      <div>
        <div style={{fontFamily:'var(--font-ui)', fontWeight:500, fontSize:13.5, color:'var(--text)'}}>{name}</div>
        {hint && <div style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-dim)', marginTop:2}}>{hint}</div>}
      </div>
      <div>{right}</div>
    </div>
  );
}
function MiniToggle({on}) {
  return (
    <div style={{
      width:34, height:20, borderRadius:999, position:'relative',
      background: on ? 'color-mix(in oklab, var(--accent) 60%, transparent)' : 'var(--raised)',
    }}>
      <div style={{
        position:'absolute', top:2, left: on?16:2, width:16, height:16,
        borderRadius:999, background: on ? 'var(--accent)' : 'var(--text-dim)',
      }}/>
    </div>
  );
}

Object.assign(window, {
  ScreenCanvasActive, ScreenSplit, ScreenProvider, ScreenExport,
});

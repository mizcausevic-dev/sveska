// firstnote-scene.jsx — "Empty → first snapshot" motion piece.
// Scene(t) renders the full Sveska editor at a frozen moment t ∈ [0, 14] seconds.
// AnimatedScene wires it into a <Stage>. Keyframe(t) renders a scaled-down still.
//
// Six beats:
//   01 · empty notebook         0.0 – 2.6
//   02 · ⌘N · open new          2.6 – 4.0
//   03 · editor materializes    4.0 – 5.8
//   04 · typing                 5.8 – 9.4
//   05 · snapshot pending · ⌘S  9.4 – 11.0
//   06 · saved · at rest       11.0 – 14.0

// ── tokens (scoped to this scene; avoids polluting other shells) ──
const FN_TOKENS = {
  '--bg':'#0C0C0E','--surface':'#161619','--raised':'#222228',
  '--text':'#F4EFE6','--text-dim':'#B8B2A6',
  '--accent':'#F2B544','--accent-hover':'#EDA92E','--accent-press':'#C9871F',
  '--ai':'#4FD6C4','--ok':'#6FCF7F','--danger':'#E5604D',
  '--border-soft':'#222228',
  '--font-display':'"Bricolage Grotesque",system-ui,sans-serif',
  '--font-ui':'"Satoshi","Manrope",system-ui,sans-serif',
  '--font-mono':'"JetBrains Mono",ui-monospace,monospace',
};

const SCENE_W = 1440;
const SCENE_H = 900;

// ── tweening helpers ──
function fnTween(t, start, end, from, to, ease = (x)=>x) {
  if (t <= start) return from;
  if (t >= end) return to;
  const local = (t-start)/(end-start);
  return from + (to-from) * ease(local);
}
const fnEaseOutCubic   = (t) => 1 - Math.pow(1-t, 3);
const fnEaseInOutCubic = (t) => t<.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2;
const fnEaseOutBack    = (t) => { const c1=1.70158, c3=c1+1; return 1 + c3*Math.pow(t-1,3) + c1*Math.pow(t-1,2); };

function typedChars(t, start, end, str) {
  if (t <= start) return '';
  if (t >= end) return str;
  const local = (t-start)/(end-start);
  const n = Math.floor(local * str.length);
  return str.substring(0, n);
}

// ── timing table — one source of truth ──
const T = {
  emptyExitStart: 2.6, emptyExitEnd: 4.0,
  cmdN: [2.6, 4.0],
  topbarIn:  [3.8, 4.4],
  toolbarIn: [4.0, 4.6],
  statusIn:  [4.2, 4.8],
  type1:     [4.8, 5.4],            // # weekend.md
  type2:     [5.8, 8.5],            // body line
  snapshotPendingStart: 9.4,
  cmdS:      [9.8, 11.0],
  saveAt:    10.8,
  end:       14.0,
};

// ── caret ──
function caret() {
  return (
    <span style={{
      display:'inline-block', width:2, height:'1em',
      background:'var(--accent)', verticalAlign:'-2px', marginLeft:2,
      animation:'fn-caret 1.1s steps(1) infinite',
    }}/>
  );
}

// ── master scene ──
function Scene({ t }) {
  return (
    <div style={{
      ...FN_TOKENS,
      width:SCENE_W, height:SCENE_H,
      position:'relative', overflow:'hidden',
      background:'var(--bg)', color:'var(--text)',
      fontFamily:'var(--font-ui)',
    }}>
      <style>{`
        @keyframes fn-caret { 50% { opacity:0 } }
        @keyframes fn-pulse {
          0% { transform: scale(1); opacity:.45; }
          100% { transform: scale(2.6); opacity:0; }
        }
      `}</style>

      <EmptyState t={t}/>
      <Editor t={t}/>
      <Keycap t={t} chord="⌘N" window={T.cmdN} label="new note"/>
      <Keycap t={t} chord="⌘S" window={T.cmdS} label="save snapshot"/>
      <BeatLabel t={t}/>
    </div>
  );
}

// ── empty state ──
function EmptyState({ t }) {
  if (t >= T.emptyExitEnd) return null;

  const entryOpacity = fnTween(t, 0, 0.9, 0, 1, fnEaseOutCubic);
  const exitOpacity  = fnTween(t, T.emptyExitStart, T.emptyExitEnd, 1, 0, fnEaseInOutCubic);
  const opacity      = Math.min(entryOpacity, exitOpacity);

  const entryY = fnTween(t, 0, 0.9, 28, 0, fnEaseOutCubic);
  const exitY  = fnTween(t, T.emptyExitStart, T.emptyExitEnd, 0, -36, fnEaseInOutCubic);
  const ty     = entryY + exitY;

  const line2Opacity = Math.min(fnTween(t, 0.5, 1.4, 0, 1, fnEaseOutCubic), exitOpacity);
  const subOpacity   = Math.min(fnTween(t, 1.1, 2.0, 0, 1, fnEaseOutCubic), exitOpacity);
  const glyphScale   = fnTween(t, 0, 0.9, 0.85, 1.0, fnEaseOutBack);

  return (
    <div style={{
      position:'absolute', inset:0,
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      gap:32, opacity, transform:`translateY(${ty}px)`,
    }}>
      {/* page glyph */}
      <div style={{
        width:160, height:160, borderRadius:24,
        border:'1px dashed var(--border-soft)',
        background:`repeating-linear-gradient(45deg, transparent 0 9px, color-mix(in oklab, var(--text-dim) 6%, transparent) 9px 10px)`,
        display:'flex', alignItems:'center', justifyContent:'center',
        color:'var(--text-dim)', position:'relative',
        transform:`scale(${glyphScale})`,
      }}>
        <svg viewBox="0 0 24 24" width={72} height={72} fill="none" stroke="currentColor"
             strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 3h8l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/>
          <path d="M15 3v4h4"/>
        </svg>
        <div style={{
          position:'absolute', top:-14, right:-14, width:28, height:28,
          borderRadius:999, background:'var(--accent)',
        }}/>
      </div>

      <div style={{
        fontFamily:'var(--font-display)', fontWeight:700, fontSize:72,
        letterSpacing:'-0.035em', lineHeight:1.0, textAlign:'center',
      }}>
        Prazna sveska.
        <br/>
        <span style={{color:'var(--accent)', opacity:line2Opacity}}>Najbolji početak.</span>
      </div>

      <div style={{
        opacity:subOpacity,
        fontFamily:'var(--font-mono)', fontSize:14, color:'var(--text-dim)',
        letterSpacing:'.06em',
      }}>
        Press <span style={{
          fontFamily:'var(--font-mono)', fontSize:13,
          padding:'2px 9px', borderRadius:6, background:'var(--raised)', color:'var(--text)',
          letterSpacing:'.04em',
        }}>⌘N</span> for a new note · or paste anything to start.
      </div>
    </div>
  );
}

// ── editor (composes top-bar, toolbar, body, status-bar) ──
function Editor({ t }) {
  if (t < T.topbarIn[0]) return null;

  const topbarY  = fnTween(t, T.topbarIn[0],  T.topbarIn[1],  -44, 0, fnEaseOutCubic);
  const toolbarY = fnTween(t, T.toolbarIn[0], T.toolbarIn[1], -56, 0, fnEaseOutCubic);
  const statusY  = fnTween(t, T.statusIn[0],  T.statusIn[1],   30, 0, fnEaseOutCubic);
  const opacity  = fnTween(t, T.topbarIn[0],  T.topbarIn[1]+0.2, 0, 1, fnEaseOutCubic);

  return (
    <div style={{position:'absolute', inset:0, opacity}}>
      <TopBar ty={topbarY}/>
      <Toolbar t={t} ty={toolbarY}/>
      <EditorBody t={t}/>
      <StatusBar t={t} ty={statusY}/>
    </div>
  );
}

function TopBar({ty}) {
  return (
    <div style={{
      position:'absolute', top:0, left:0, right:0, height:44,
      transform:`translateY(${ty}px)`,
      background:'var(--bg)',
      borderBottom:'1px solid var(--border-soft)',
      display:'flex', alignItems:'center', gap:14, padding:'0 18px', zIndex:5,
    }}>
      <div style={{display:'flex', gap:8}}>
        <span style={{width:12,height:12,borderRadius:999,background:'#ff5f57'}}/>
        <span style={{width:12,height:12,borderRadius:999,background:'#febc2e'}}/>
        <span style={{width:12,height:12,borderRadius:999,background:'#28c840'}}/>
      </div>
      <div style={{width:1, height:18, background:'var(--border-soft)'}}/>
      <span style={{
        fontFamily:'var(--font-display)', fontWeight:700, fontSize:16,
        letterSpacing:'-0.02em', color:'var(--text)',
      }}>sveska<span style={{
        fontFamily:'var(--font-mono)', fontSize:13, color:'var(--accent)',
        fontWeight:500, marginLeft:2,
      }}>.studio</span></span>
      <div style={{flex:1}}/>
      <span style={{
        fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-dim)',
        letterSpacing:'.04em',
      }}>local · offline-first</span>
    </div>
  );
}

function Toolbar({t, ty}) {
  let dotState = 'empty';
  if (t >= T.snapshotPendingStart && t < T.saveAt) dotState = 'pending';
  else if (t >= T.saveAt) dotState = 'saved';

  const saveBtnPressed = t >= T.saveAt && t < T.saveAt + 0.25;
  const saveBtnGlow    = t >= T.saveAt && t < T.saveAt + 0.6;

  let dotColor = '#3a3a3e';
  let dotPulse = false;
  let dotHalo  = false;
  let snapLabel = 'no snapshot';
  if (dotState === 'pending') {
    dotColor = 'var(--ai)'; dotPulse = true; dotHalo = true;
    snapLabel = 'snapshot pending';
  } else if (dotState === 'saved') {
    dotColor = 'var(--ai)'; dotHalo = true;
    snapLabel = 'snapshot · 14:02';
  }

  return (
    <div style={{
      position:'absolute', top:44, left:0, right:0, height:56,
      transform:`translateY(${ty}px)`,
      background:'var(--bg)', borderBottom:'1px solid var(--border-soft)',
      display:'flex', alignItems:'center', gap:6, padding:'0 24px', zIndex:4,
    }}>
      {[
        ['M12 5v14M5 12h14', false],
        ['M7 5h6a4 4 0 1 1 0 8H7zM7 13h7a4 4 0 1 1 0 8H7z', true],
        ['M14 5h4M10 19h4M15 5l-4 14', false],
        ['M4 6l2 2 4-4M4 13l2 2 4-4M4 20l2 2 4-4M14 7h7M14 14h7M14 21h7', false],
      ].map(([d, active], i) => (
        <button key={i} style={{
          appearance:'none', border:0, background: active?'var(--raised)':'transparent',
          cursor:'pointer', width:36, height:36, borderRadius:8,
          color: active ? 'var(--accent)' : 'var(--text-dim)',
          display:'inline-flex', alignItems:'center', justifyContent:'center',
        }}>
          <svg viewBox="0 0 24 24" width={17} height={17} fill="none" stroke="currentColor"
               strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>
        </button>
      ))}
      <div style={{width:1, height:20, background:'var(--border-soft)', margin:'0 8px'}}/>

      <span style={{
        flex:1, fontFamily:'var(--font-mono)', fontSize:13.5,
        color:'var(--text)', padding:'0 14px',
      }}>
        <span style={{color:'var(--text-dim)'}}>weekend</span>.md
        <span style={{color:'var(--text-dim)'}}>
          {' '}· {t < T.type1[0] ? 'just now' : t < T.saveAt ? 'editing' : 'edited just now'}
        </span>
      </span>

      <button style={{
        appearance:'none', border:0, cursor:'pointer',
        height:34, padding:'0 14px 0 12px', borderRadius:8,
        background:'transparent', color: dotState==='empty'?'var(--text-dim)':'var(--text)',
        fontFamily:'var(--font-mono)', fontSize:12, letterSpacing:'.04em',
        display:'inline-flex', alignItems:'center', gap:10,
      }}>
        <span style={{position:'relative', width:9, height:9}}>
          <span style={{
            position:'absolute', inset:0, borderRadius:999, background:dotColor,
            boxShadow: dotHalo
              ? `0 0 0 3px color-mix(in oklab, var(--ai) 22%, transparent)`
              : 'none',
            zIndex:2,
          }}/>
          {dotPulse && <span style={{
            position:'absolute', inset:0, borderRadius:999,
            border:`1.5px solid var(--ai)`,
            animation:'fn-pulse 2.4s ease-out infinite',
          }}/>}
        </span>
        {snapLabel}
      </button>

      <button style={{
        appearance:'none', border:0, cursor:'pointer',
        height:36, padding:'0 16px', borderRadius:8,
        background: saveBtnPressed ? 'var(--accent-press)' : 'var(--accent)',
        color:'#0C0C0E',
        boxShadow: saveBtnGlow ? '0 0 0 4px color-mix(in oklab, var(--accent) 35%, transparent)' : 'none',
        transform: saveBtnPressed ? 'translateY(1px)' : 'translateY(0)',
        fontFamily:'var(--font-ui)', fontWeight:700, fontSize:13.5,
        display:'inline-flex', alignItems:'center', gap:10,
        transition:'box-shadow .2s ease',
      }}>
        Save snapshot
        <span style={{
          fontFamily:'var(--font-mono)', fontSize:11, padding:'1px 6px',
          borderRadius:5, background:'rgba(0,0,0,.18)', opacity:.85,
        }}>⌘S</span>
      </button>
    </div>
  );
}

function EditorBody({t}) {
  const line1Str = '# weekend.md';
  const line3Str = 'The folded page does not need permission to be written on.';
  const line1   = typedChars(t, T.type1[0], T.type1[1], line1Str);
  const line3   = typedChars(t, T.type2[0], T.type2[1], line3Str);

  const onLine1 = t >= T.type1[0] && t <= T.type1[1];
  const onLine3 = t >= T.type2[0];

  return (
    <div style={{
      position:'absolute', top:100, left:0, right:0, bottom:30,
      padding:'56px 0 32px', overflow:'hidden',
    }}>
      <div style={{
        maxWidth:920, margin:'0 auto', padding:'0 64px',
        fontFamily:'var(--font-mono)', fontSize:20, lineHeight:1.8,
        color:'var(--text)',
      }}>
        <Line n={1}>
          <span style={{color:'var(--accent)'}}>{line1}</span>
          {onLine1 && caret()}
        </Line>
        <Line n={2}>&nbsp;</Line>
        <Line n={3}>
          {line3}
          {onLine3 && caret()}
        </Line>
      </div>
    </div>
  );
}

function Line({n, children}) {
  return (
    <div style={{display:'flex', alignItems:'flex-start'}}>
      <span style={{
        width:40, textAlign:'right', color:'var(--text-dim)',
        opacity:.5, paddingRight:18, userSelect:'none',
        fontVariantNumeric:'tabular-nums',
      }}>{n}</span>
      <div style={{flex:1}}>{children}</div>
    </div>
  );
}

function StatusBar({t, ty}) {
  const saved   = t >= T.saveAt;
  const editing = t >= T.type1[0] && t < T.saveAt;
  const pending = t >= T.snapshotPendingStart && t < T.saveAt;

  const line3 = typedChars(t, T.type2[0], T.type2[1], 'The folded page does not need permission to be written on.');
  const words = line3.split(/\s+/).filter(Boolean).length;

  let leftSlot;
  if (saved) {
    leftSlot = (
      <span style={{display:'inline-flex', alignItems:'center', gap:6, color:'var(--ok)'}}>
        <span style={{width:6, height:6, borderRadius:999, background:'var(--ok)'}}/>
        Saved · 14:02
      </span>
    );
  } else if (editing && pending) {
    leftSlot = (
      <span style={{display:'inline-flex', alignItems:'center', gap:6, color:'var(--ai)'}}>
        <span style={{width:6, height:6, borderRadius:999, background:'var(--ai)'}}/>
        Editing · snapshot pending
      </span>
    );
  } else if (editing) {
    leftSlot = <span style={{color:'var(--text-dim)'}}>Editing · unsaved</span>;
  } else {
    leftSlot = <span style={{color:'var(--text-dim)'}}>Empty · ready</span>;
  }

  return (
    <div style={{
      position:'absolute', bottom:0, left:0, right:0, height:30,
      transform:`translateY(${ty}px)`,
      background:'var(--surface)', borderTop:'1px solid var(--border-soft)',
      display:'flex', alignItems:'center', padding:'0 16px',
      fontFamily:'var(--font-mono)', fontSize:11.5, color:'var(--text-dim)',
      letterSpacing:'.04em', zIndex:5,
    }}>
      <span style={{padding:'0 10px 0 0'}}>{leftSlot}</span>
      <span style={{width:1, height:14, background:'var(--border-soft)', margin:'0 4px'}}/>
      <span style={{padding:'0 10px'}}>{words} word{words===1?'':'s'}</span>
      <span style={{width:1, height:14, background:'var(--border-soft)', margin:'0 4px'}}/>
      <span style={{padding:'0 10px'}}>Ln {line3.length>0?3:1}, Col 1</span>
      <div style={{flex:1}}/>
      <span style={{padding:'0 10px'}}>UTF-8 · LF · markdown</span>
      <span style={{width:1, height:14, background:'var(--border-soft)', margin:'0 4px'}}/>
      <span style={{padding:'0 10px', color:'var(--accent)'}}>● Offline · local-first</span>
    </div>
  );
}

// ── keycap chord ──
function Keycap({t, chord, window: w, label}) {
  if (t < w[0] || t > w[1]) return null;
  const total = w[1] - w[0];
  const popIn  = total * 0.22;
  const hold   = total * 0.56;
  const popOut = total * 0.22;
  const local  = t - w[0];

  let scale = 0.6, opacity = 0, tyJitter = 0;
  if (local < popIn) {
    const u = local / popIn;
    scale = 0.6 + 0.5 * fnEaseOutBack(u);
    opacity = u;
  } else if (local < popIn + hold) {
    scale = 1.05;
    opacity = 1;
    // gentle press near end of hold
    const tailIn = popIn + hold - 0.18;
    if (local > tailIn) {
      const u = (local - tailIn) / 0.18;
      scale = 1.05 - 0.08 * u;
      tyJitter = 2 * u;
    }
  } else {
    const u = (local - popIn - hold) / popOut;
    scale = 0.97 - 0.3 * u;
    opacity = 1 - u;
  }

  return (
    <div style={{
      position:'absolute', left:'50%', bottom:160,
      transform:`translateX(-50%) translateY(${tyJitter}px) scale(${scale})`,
      opacity, transformOrigin:'center',
      display:'flex', alignItems:'center', gap:18, pointerEvents:'none',
      zIndex:8,
    }}>
      <div style={{
        fontFamily:'var(--font-mono)', fontSize:12, color:'var(--text-dim)',
        letterSpacing:'.10em', textTransform:'uppercase',
        textAlign:'right', lineHeight:1.5, maxWidth:160,
      }}>
        {label}
      </div>
      <div style={{
        background:'var(--surface)', border:'1px solid var(--border-soft)',
        borderRadius:14, padding:'18px 26px',
        boxShadow:'0 28px 60px rgba(0,0,0,.6), 0 1px 0 rgba(255,255,255,.04) inset',
        fontFamily:'var(--font-mono)', fontWeight:600, fontSize:40,
        color:'var(--text)', letterSpacing:'-0.01em',
      }}>{chord}</div>
    </div>
  );
}

// ── beat label (always-on indicator at top) ──
function BeatLabel({t}) {
  const beats = [
    {start: 0,     end: 2.6,  num:'01', label:'empty notebook'},
    {start: 2.6,   end: 4.0,  num:'02', label:'⌘N · open new'},
    {start: 4.0,   end: 5.8,  num:'03', label:'editor materializes'},
    {start: 5.8,   end: 9.4,  num:'04', label:'typing'},
    {start: 9.4,   end: 11.0, num:'05', label:'snapshot pending · ⌘S'},
    {start: 11.0,  end: 14.0, num:'06', label:'saved · at rest'},
  ];
  const current = beats.find(b => t >= b.start && t < b.end) || beats[beats.length-1];
  // hide while editor is dropping in to avoid two labels at once
  if (t > T.topbarIn[0] && t < T.toolbarIn[1]) return null;
  return (
    <div style={{
      position:'absolute', top:24, left:'50%', transform:'translateX(-50%)',
      fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-dim)',
      letterSpacing:'.10em', textTransform:'uppercase',
      padding:'7px 14px', borderRadius:999,
      background:'color-mix(in oklab, var(--surface) 85%, transparent)',
      boxShadow:'inset 0 0 0 1px var(--border-soft)',
      zIndex:10,
      display:'inline-flex', gap:10, alignItems:'center',
    }}>
      <span style={{color:'var(--accent)'}}>{current.num}</span>
      <span>{current.label}</span>
    </div>
  );
}

// ── animated wrapper (reads useTime from Stage) ──
function AnimatedScene() {
  const t = useTime();
  return <Scene t={t}/>;
}

// ── static keyframe (scales the 1440×900 scene to fit the artboard) ──
function Keyframe({ t: time, width, height, caption }) {
  const scale = Math.min(width/SCENE_W, height/SCENE_H);
  return (
    <div style={{
      width, height, position:'relative', overflow:'hidden',
      background:'#0C0C0E',
    }}>
      <div style={{
        width:SCENE_W, height:SCENE_H,
        transform:`scale(${scale})`, transformOrigin:'top left',
      }}>
        <Scene t={time}/>
      </div>
      {caption && (
        <div style={{
          position:'absolute', bottom:10, left:12,
          fontFamily:'JetBrains Mono, ui-monospace, monospace', fontSize:10.5,
          color:'rgba(244,239,230,.55)', letterSpacing:'.10em', textTransform:'uppercase',
        }}>{caption}</div>
      )}
    </div>
  );
}

Object.assign(window, { Scene, AnimatedScene, Keyframe });

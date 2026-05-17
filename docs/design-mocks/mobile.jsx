// mobile.jsx — Sveska on iOS and Android at native resolution.
// 4 screens — notes list, editor with keyboard, install prompt, Android notes.
// Loads after ios-frame.jsx + android-frame.jsx.

const MOB_DARK = {
  '--bg':'#0C0C0E','--surface':'#161619','--raised':'#222228',
  '--text':'#F4EFE6','--text-dim':'#B8B2A6',
  '--accent':'#F2B544','--accent-hover':'#EDA92E','--accent-press':'#C9871F',
  '--ai':'#4FD6C4','--ok':'#6FCF7F','--danger':'#E5604D',
  '--border-soft':'#222228',
  '--font-display':'"Bricolage Grotesque",system-ui,sans-serif',
  '--font-ui':'"Satoshi","Manrope",system-ui,sans-serif',
  '--font-mono':'"JetBrains Mono",ui-monospace,monospace',
};

const MobIcon = ({d, w=18, sw=1.75, children}) => (
  <svg viewBox="0 0 24 24" width={w} height={w} fill="none" stroke="currentColor"
       strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    {d ? <path d={d}/> : children}
  </svg>
);

// ─── shared svg brand mark ───
function SvesMark({size=28}) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size}>
      <rect x="0" y="0" width="64" height="64" rx="14" fill="#0C0C0E"/>
      <path d="M16 12 H40 L50 22 V50 A2 2 0 0 1 48 52 H16 A2 2 0 0 1 14 50 V14 A2 2 0 0 1 16 12 Z" fill="#F2B544"/>
      <path d="M40 12 L50 22 H42 A2 2 0 0 1 40 20 Z" fill="#C9871F"/>
      <path d="M42 24.5C42 19.7 38 17 32.5 17C26.5 17 22.5 20 22.5 24.75C22.5 29.5 26.75 31.75 32.5 32.5C38.25 33.25 42.5 35.5 42.5 40.5C42.5 45.75 38.5 48.75 32.25 48.75C26.75 48.75 22.5 46.25 22.25 41.25" fill="none" stroke="#0C0C0E" strokeWidth="5.75" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ─── shared app header (mobile) ───
function MobHeader({title='sveska.studio', tagline, accent='studio', showSettings=true, backOnly=false}) {
  if (backOnly) {
    return (
      <div style={{
        padding:'52px 16px 12px',
        display:'flex', alignItems:'center', gap:8,
        background:'var(--bg)',
        borderBottom:'1px solid var(--border-soft)',
      }}>
        <button style={{
          appearance:'none', border:0, cursor:'pointer', background:'transparent',
          width:36, height:36, borderRadius:8, color:'var(--accent)',
          display:'inline-flex', alignItems:'center', justifyContent:'center',
          margin:'0 -8px',
        }}>
          <MobIcon d="M15 18l-6-6 6-6" w={22} sw={2}/>
        </button>
        <div style={{flex:1, overflow:'hidden'}}>
          <div style={{
            fontFamily:'var(--font-mono)', fontSize:13.5, color:'var(--text)',
            whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
          }}>
            <span style={{color:'var(--text-dim)'}}>weekend</span>.md
          </div>
          <div style={{
            fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-dim)',
            letterSpacing:'.04em', marginTop:2, display:'inline-flex', gap:6, alignItems:'center',
          }}>
            <span style={{
              width:6, height:6, borderRadius:999, background:'var(--ai)',
              boxShadow:'0 0 0 2px color-mix(in oklab, var(--ai) 22%, transparent)',
            }}/>
            snapshot · 14:02
          </div>
        </div>
        <button style={{
          appearance:'none', border:0, cursor:'pointer', background:'transparent',
          width:36, height:36, borderRadius:8, color:'var(--text-dim)',
          display:'inline-flex', alignItems:'center', justifyContent:'center',
        }}>
          <MobIcon d="M5 12h.01M12 12h.01M19 12h.01" w={20} sw={2.5}/>
        </button>
      </div>
    );
  }
  return (
    <div style={{
      padding:'52px 18px 14px',
      background:'var(--bg)',
      borderBottom:'1px solid var(--border-soft)',
    }}>
      <div style={{display:'flex', alignItems:'center', gap:12}}>
        <SvesMark size={28}/>
        <span style={{
          flex:1,
          fontFamily:'var(--font-display)', fontWeight:700, fontSize:20,
          letterSpacing:'-0.025em', color:'var(--text)', lineHeight:1,
        }}>{title.split('.')[0]}<span style={{
          fontFamily:'var(--font-mono)', fontSize:14, color:'var(--accent)',
          fontWeight:500, letterSpacing:'-0.005em',
        }}>.{accent}</span></span>
        <button style={{
          appearance:'none', border:0, cursor:'pointer', background:'transparent',
          width:36, height:36, borderRadius:8, color:'var(--text-dim)',
          display:'inline-flex', alignItems:'center', justifyContent:'center',
        }}>
          <MobIcon w={18}><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></MobIcon>
        </button>
        {showSettings && <button style={{
          appearance:'none', border:0, cursor:'pointer', background:'transparent',
          width:36, height:36, borderRadius:8, color:'var(--text-dim)',
          display:'inline-flex', alignItems:'center', justifyContent:'center',
        }}>
          <MobIcon d="M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </button>}
      </div>
      {tagline && (
        <div style={{
          marginTop:10,
          fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-dim)',
          letterSpacing:'.06em', textTransform:'uppercase',
        }}>{tagline}</div>
      )}
    </div>
  );
}

// ─── notes list filter segmented ───
function FilterStrip() {
  return (
    <div style={{
      display:'flex', alignItems:'center', gap:8, padding:'12px 16px 4px',
      overflowX:'auto', whiteSpace:'nowrap',
    }}>
      {[
        ['All', 23, true, null],
        ['Pinned', 3, false, 'amber'],
        ['Inbox', 2, false, 'signal'],
        ['Reading', 4, false, null],
        ['Studio', 5, false, null],
        ['Trash', 5, false, null],
      ].map(([name, n, on, dot]) => (
        <span key={name} style={{
          fontFamily:'var(--font-mono)', fontSize:12, padding:'6px 12px',
          borderRadius:999,
          background: on ? 'var(--accent)' : 'transparent',
          color: on ? '#0C0C0E' : 'var(--text-dim)',
          boxShadow: on ? 'none' : 'inset 0 0 0 1px var(--border-soft)',
          display:'inline-flex', alignItems:'center', gap:6, flexShrink:0,
        }}>
          {dot && <span style={{
            width:5, height:5, borderRadius:999,
            background: dot==='amber' ? 'var(--accent)' : 'var(--ai)',
            boxShadow: dot==='signal' ? '0 0 0 2px color-mix(in oklab, var(--ai) 22%, transparent)' : 'none',
          }}/>}
          {name}
          <span style={{opacity: on ? .6 : .5}}>{n}</span>
        </span>
      ))}
    </div>
  );
}

// ─── single note row ───
function MobNoteRow({title, body, tags=[], meta, pinned, live, dim}) {
  return (
    <div style={{
      padding:'14px 18px', borderBottom:'1px solid var(--border-soft)',
      display:'flex', flexDirection:'column', gap:6, opacity: dim ? .55 : 1,
      position:'relative',
    }}>
      {live && <span style={{
        position:'absolute', top:18, left:6, width:3, height:18,
        borderRadius:999, background:'var(--ai)',
      }}/>}
      <div style={{display:'flex', alignItems:'flex-start', gap:8}}>
        <h4 style={{
          flex:1, margin:0,
          fontFamily:'var(--font-display)', fontWeight:700, fontSize:16,
          letterSpacing:'-0.012em', color:'var(--text)', lineHeight:1.2,
        }}>{title}</h4>
        {pinned && <span style={{color:'var(--accent)'}}>
          <MobIcon d="M12 2l3 6 6 1-4.5 4.5L18 20l-6-3.5L6 20l1.5-6.5L3 9l6-1z" w={13} sw={1.5}/>
        </span>}
      </div>
      <div style={{
        fontFamily:'var(--font-mono)', fontSize:12, color:'var(--text-dim)', lineHeight:1.5,
        display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden',
      }}>{body}</div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:1}}>
        <div style={{display:'inline-flex', gap:5}}>
          {tags.map(t=>(
            <span key={t.label} style={{
              fontFamily:'var(--font-mono)', fontSize:10, padding:'1px 6px', borderRadius:4,
              background: t.amber ? 'color-mix(in oklab, var(--accent) 14%, transparent)' : 'var(--raised)',
              color: t.amber ? 'var(--accent)' : 'var(--text-dim)',
            }}>{t.label}</span>
          ))}
        </div>
        <span style={{
          fontFamily:'var(--font-mono)', fontSize:10.5,
          color: live ? 'var(--ai)' : 'var(--text-dim)', letterSpacing:'.04em',
          display:'inline-flex', alignItems:'center', gap:4,
        }}>
          {live && <span style={{width:5, height:5, borderRadius:999, background:'var(--ai)'}}/>}
          {meta}
        </span>
      </div>
    </div>
  );
}

// ─── bottom tab bar ───
function MobTabBar({active='notes'}) {
  const tabs = [
    ['notes', 'M6 3h9l3 3v15H6z', 'Notes'],
    ['inbox', 'M4 12h6l1 2h2l1-2h6M4 5h16v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z', 'Inbox'],
    ['glossary', 'M4 6h12M4 12h16M4 18h10', 'Glossary'],
    ['settings', 'M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z', 'Settings'],
  ];
  return (
    <div style={{
      borderTop:'1px solid var(--border-soft)',
      background:'var(--surface)', padding:'10px 12px 36px',
      display:'flex', alignItems:'center', justifyContent:'space-around',
    }}>
      {tabs.map(([id, d, label]) => {
        const on = id === active;
        return (
          <button key={id} style={{
            appearance:'none', border:0, cursor:'pointer', background:'transparent',
            flex:1, height:48, borderRadius:8,
            display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:3,
            color: on ? 'var(--accent)' : 'var(--text-dim)',
          }}>
            <MobIcon d={d} w={20} sw={1.6}/>
            <span style={{fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'.04em'}}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── floating action button ───
function MobFAB({label='New', bottom=92}) {
  return (
    <button style={{
      position:'absolute', right:18, bottom,
      appearance:'none', border:0, cursor:'pointer',
      height:54, padding:'0 22px', borderRadius:999,
      background:'var(--accent)', color:'#0C0C0E',
      fontFamily:'var(--font-ui)', fontWeight:700, fontSize:14,
      display:'inline-flex', alignItems:'center', gap:10,
      boxShadow:'0 12px 32px rgba(242,181,68,.32), 0 1px 0 rgba(0,0,0,.1) inset',
      zIndex:20,
    }}>
      <MobIcon d="M12 5v14M5 12h14" w={16} sw={2.5}/>
      {label}
    </button>
  );
}

// ─── status strip (mobile compact) ───
function MobStatusStrip({left='8 notes', right='Saved · 14:02', live}) {
  return (
    <div style={{
      padding:'10px 18px',
      borderTop:'1px solid var(--border-soft)',
      background:'var(--surface)',
      display:'flex', alignItems:'center', justifyContent:'space-between',
      fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-dim)',
      letterSpacing:'.04em',
    }}>
      <span style={{display:'inline-flex', alignItems:'center', gap:8}}>
        {!live && <span style={{
          width:6, height:6, borderRadius:999, background:'var(--ok)',
        }}/>}
        {live && <span style={{
          width:6, height:6, borderRadius:999, background:'var(--ai)',
          boxShadow:'0 0 0 2px color-mix(in oklab, var(--ai) 22%, transparent)',
        }}/>}
        {left}
      </span>
      <span style={{color:'var(--accent)'}}>● offline</span>
    </div>
  );
}

// ╔════════════════════════════════════════════════════════════╗
// ║ SCREEN 1 · iOS Notes List                                  ║
// ╚════════════════════════════════════════════════════════════╝
function IOSNotesList() {
  return (
    <IOSDevice dark={true}>
      <div style={{
        ...MOB_DARK, position:'relative',
        background:'var(--bg)', color:'var(--text)', minHeight:'100%',
        fontFamily:'var(--font-ui)',
      }}>
        <MobHeader tagline="23 notes · 3 pinned · offline-first"/>
        <FilterStrip/>
        <div style={{marginTop:6}}>
          <MobNoteRow
            title="imports of Selimović"
            body='"Death and the Dervish" — the way memory is staged as procedure. Move the chapter-3 notes here; cross-reference with the studio post.'
            tags={[{label:'pinned', amber:true}, {label:'reading'}]}
            meta="3m"
            pinned
          />
          <MobNoteRow
            title="v0.1 ship list"
            body="M0 scaffold · M1 editor · M2 multi-note · M3 power UX · M4 AI · M5 canvas · M6 platform · M7 harden."
            tags={[{label:'ship'}]}
            meta="/improve · 1s"
            live
          />
          <MobNoteRow
            title="weekend.md"
            body="Draft the studio post · read Selimović, chapter 3 · ship list final pass · pour the rakija."
            tags={[{label:'draft'}]}
            meta="14:02"
          />
          <MobNoteRow
            title="sevdah — glossary"
            body="A specifically Bosnian variety of melancholia, untranslatable; closest English word is 'ache' but durative…"
            tags={[{label:'reading'},{label:'sevdah'},{label:'glossary'}]}
            meta="yesterday"
          />
          <MobNoteRow
            title="reading list · Q2"
            body="Selimović (re-read) · Andrić (start) · Hemon (essays, not novels) · Karahasan."
            tags={[{label:'reading'}]}
            meta="1w"
            dim
          />
          <MobNoteRow
            title="Andrić — bridges as metaphor"
            body='"The Bridge on the Drina" stages every conflict as a passage. Useful framing for the studio post.'
            tags={[{label:'reading'},{label:'studio'}]}
            meta="2d"
            dim
          />
        </div>
        <div style={{height:140}}/>
        <MobFAB label="New note" bottom={108}/>
        <MobTabBar active="notes"/>
      </div>
    </IOSDevice>
  );
}

// ╔════════════════════════════════════════════════════════════╗
// ║ SCREEN 2 · iOS Editor + keyboard                            ║
// ╚════════════════════════════════════════════════════════════╝
function IOSEditor() {
  return (
    <IOSDevice dark={true} keyboard={true}>
      <div style={{
        ...MOB_DARK, position:'relative',
        background:'var(--bg)', color:'var(--text)', minHeight:'100%',
        fontFamily:'var(--font-ui)',
        display:'flex', flexDirection:'column',
      }}>
        <MobHeader backOnly/>
        <div style={{
          flex:1, padding:'18px 16px 12px',
          fontFamily:'var(--font-mono)', fontSize:15, lineHeight:1.7,
          color:'var(--text)', overflow:'hidden',
        }}>
          <div style={{color:'var(--accent)'}}># weekend.md</div>
          <div style={{height:14}}/>
          <div>The folded page does not need permission to be written on.</div>
          <div style={{height:14}}/>
          <div style={{color:'var(--accent)'}}>## ship sveska v0.1</div>
          <div>
            <Check on/> draft the studio post<br/>
            <Check/> ship v0.1 — M0 + M1<br/>
            <Check/> read Selimović, ch. 3
          </div>
          <div style={{height:14}}/>
          <div>Snapshots are procedural memory<span style={{
            display:'inline-block', width:2, height:'1em',
            background:'var(--accent)', verticalAlign:'-2px', marginLeft:2,
            animation:'mob-caret 1.1s steps(1) infinite',
          }}/></div>
          <style>{`@keyframes mob-caret { 50% { opacity:0 } }`}</style>
        </div>
        {/* format bar — sticks just above keyboard */}
        <div style={{
          position:'sticky', bottom:0,
          background:'var(--surface)',
          borderTop:'1px solid var(--border-soft)',
          padding:'8px 10px',
          display:'flex', alignItems:'center', gap:4,
        }}>
          {[
            ['M7 5h6a4 4 0 1 1 0 8H7zM7 13h7a4 4 0 1 1 0 8H7z'],
            ['M14 5h4M10 19h4M15 5l-4 14'],
            ['M5 9h14M5 15h14M9 4l-2 16M17 4l-2 16'],
            ['M4 6l2 2 4-4M4 13l2 2 4-4M4 20l2 2 4-4M14 7h7M14 14h7M14 21h7'],
            ['M4 6h16M4 12h10M4 18h16'],
            ['SEP'],
            ['M9 18l6-6-6-6'],
          ].map((it,i)=>(
            it[0]==='SEP'
              ? <div key={i} style={{width:1, height:22, background:'var(--border-soft)', margin:'0 4px'}}/>
              : <button key={i} style={{
                  appearance:'none', border:0, cursor:'pointer', background:'transparent',
                  width:38, height:38, borderRadius:8, color:'var(--text-dim)',
                  display:'inline-flex', alignItems:'center', justifyContent:'center',
                }}>
                  <MobIcon d={it[0]} w={18} sw={1.75}/>
                </button>
          ))}
          <div style={{flex:1}}/>
          {/* AI button — cyan */}
          <button style={{
            appearance:'none', border:0, cursor:'pointer',
            height:34, padding:'0 12px 0 10px', borderRadius:8,
            background:'color-mix(in oklab, var(--ai) 16%, transparent)',
            color:'var(--ai)',
            fontFamily:'var(--font-mono)', fontSize:12, letterSpacing:'.04em',
            display:'inline-flex', alignItems:'center', gap:6,
          }}>
            <MobIcon d="M12 2l2.3 5.3L20 9.5l-4.5 3.8L17 19l-5-3-5 3 1.5-5.7L4 9.5l5.7-2.2z" w={14} sw={1.5}/>
            /AI
          </button>
        </div>
      </div>
    </IOSDevice>
  );
}

function Check({on}) {
  return (
    <span style={{
      display:'inline-block', verticalAlign:'-3px',
      width:14, height:14, borderRadius:4,
      border: on?'1.5px solid var(--accent)':'1.5px solid var(--text-dim)',
      background: on?'var(--accent)':'transparent',
      marginRight:8, position:'relative',
    }}>
      {on && <span style={{
        position:'absolute', left:3, top:1,
        width:6, height:3,
        borderLeft:'2px solid #0C0C0E', borderBottom:'2px solid #0C0C0E',
        transform:'rotate(-45deg)',
      }}/>}
    </span>
  );
}

// ╔════════════════════════════════════════════════════════════╗
// ║ SCREEN 3 · iOS Add to Home Screen (PWA install bottom-sheet) ║
// ╚════════════════════════════════════════════════════════════╝
function IOSInstall() {
  return (
    <IOSDevice dark={true}>
      <div style={{...MOB_DARK, position:'relative', minHeight:'100%', background:'var(--bg)', color:'var(--text)', fontFamily:'var(--font-ui)'}}>
        {/* dimmed underlying notes list */}
        <div style={{filter:'blur(4px) saturate(.7)', opacity:.45, pointerEvents:'none'}}>
          <MobHeader tagline="23 notes · 3 pinned · offline-first"/>
          <FilterStrip/>
          <MobNoteRow title="imports of Selimović" body="…" tags={[{label:'pinned',amber:true}]} meta="3m" pinned/>
          <MobNoteRow title="v0.1 ship list" body="…" tags={[{label:'ship'}]} meta="2m"/>
          <MobNoteRow title="weekend.md" body="…" tags={[{label:'draft'}]} meta="14:02"/>
          <MobNoteRow title="sevdah — glossary" body="…" tags={[{label:'reading'}]} meta="1d"/>
        </div>
        <div style={{position:'absolute', inset:0, background:'rgba(0,0,0,0.62)'}}/>

        {/* bottom sheet */}
        <div style={{
          position:'absolute', left:8, right:8, bottom:8,
          background:'var(--surface)', borderRadius:24,
          boxShadow:'0 -8px 32px rgba(0,0,0,.5)',
          padding:'10px 0 28px',
          border:'1px solid var(--border-soft)',
        }}>
          <div style={{
            width:38, height:5, borderRadius:999, background:'var(--raised)',
            margin:'4px auto 18px',
          }}/>
          <div style={{
            display:'flex', alignItems:'center', gap:14, padding:'0 20px 14px',
            borderBottom:'1px solid var(--border-soft)',
          }}>
            <div style={{
              width:60, height:60, borderRadius:14,
              boxShadow:'0 8px 24px rgba(0,0,0,.4)',
              overflow:'hidden', flexShrink:0,
            }}>
              <SvesMark size={60}/>
            </div>
            <div style={{flex:1}}>
              <div style={{
                fontFamily:'var(--font-display)', fontWeight:700, fontSize:18,
                letterSpacing:'-0.018em', color:'var(--text)', lineHeight:1.15,
              }}>Sveska</div>
              <div style={{
                fontFamily:'var(--font-mono)', fontSize:12, color:'var(--accent)',
                marginTop:2,
              }}>sveska.studio</div>
              <div style={{
                fontFamily:'var(--font-ui)', fontSize:12, color:'var(--text-dim)',
                marginTop:2,
              }}>local-first notepad · 0.4 MB</div>
            </div>
          </div>

          <div style={{padding:'16px 20px 6px'}}>
            <div style={{
              fontFamily:'var(--font-mono)', fontSize:10.5, letterSpacing:'.10em',
              textTransform:'uppercase', color:'var(--accent)', marginBottom:6,
            }}>INSTALL</div>
            <div style={{
              fontFamily:'var(--font-display)', fontWeight:700, fontSize:22,
              letterSpacing:'-0.02em', color:'var(--text)', lineHeight:1.15,
            }}>Add to Home Screen.</div>
            <div style={{
              fontFamily:'var(--font-ui)', fontSize:13.5, color:'var(--text-dim)',
              marginTop:8, lineHeight:1.55,
            }}>
              Get the full notebook — opens in its own window, works offline, and never leaves your device.
              Your notes stay in this browser; install is purely cosmetic.
            </div>
          </div>

          <div style={{padding:'14px 20px 8px', display:'flex', flexDirection:'column', gap:8}}>
            <InstallStep n={1} label="Tap Share" icon={
              <MobIcon d="M12 3v14M5 10l7-7 7 7M5 21h14" w={18} sw={1.75}/>
            }/>
            <InstallStep n={2} label='Find "Add to Home Screen"' icon={
              <MobIcon d="M3 6h18M3 12h18M3 18h18" w={18} sw={1.75}/>
            }/>
            <InstallStep n={3} label='Confirm "Add"' icon={
              <MobIcon d="M5 13l4 4L19 7" w={18} sw={2}/>
            }/>
          </div>

          <div style={{padding:'10px 20px 0', display:'flex', flexDirection:'column', gap:8}}>
            <button style={{
              appearance:'none', border:0, cursor:'pointer',
              width:'100%', height:50, borderRadius:14,
              background:'var(--accent)', color:'#0C0C0E',
              fontFamily:'var(--font-ui)', fontWeight:700, fontSize:15,
              display:'inline-flex', alignItems:'center', justifyContent:'center', gap:8,
            }}>
              <MobIcon d="M12 3v14M5 10l7-7 7 7M5 21h14" w={16} sw={2}/>
              Show me where to tap Share
            </button>
            <button style={{
              appearance:'none', border:0, cursor:'pointer',
              width:'100%', height:44, borderRadius:14,
              background:'transparent', color:'var(--text-dim)',
              fontFamily:'var(--font-ui)', fontWeight:500, fontSize:13.5,
            }}>Not now</button>
          </div>
        </div>
      </div>
    </IOSDevice>
  );
}

function InstallStep({n, label, icon}) {
  return (
    <div style={{
      display:'flex', alignItems:'center', gap:14,
      padding:'10px 12px', borderRadius:10,
      background:'var(--bg)', boxShadow:'inset 0 0 0 1px var(--border-soft)',
    }}>
      <span style={{
        width:28, height:28, borderRadius:7,
        background:'var(--raised)', color:'var(--text)',
        display:'inline-flex', alignItems:'center', justifyContent:'center',
        fontFamily:'var(--font-mono)', fontSize:13, fontWeight:500,
      }}>{n}</span>
      <span style={{flex:1, color:'var(--text)', fontFamily:'var(--font-ui)', fontSize:13.5}}>{label}</span>
      <span style={{color:'var(--text-dim)'}}>{icon}</span>
    </div>
  );
}

// ╔════════════════════════════════════════════════════════════╗
// ║ SCREEN 4 · Android Notes List + Share Target                ║
// ╚════════════════════════════════════════════════════════════╝
function AndroidNotes() {
  return (
    <AndroidDevice dark={true}>
      <div style={{...MOB_DARK, position:'relative', minHeight:'100%', background:'var(--bg)', color:'var(--text)', fontFamily:'var(--font-ui)'}}>
        <MobHeader tagline="23 notes · share target ready"/>
        <FilterStrip/>

        {/* Share-target banner — shown when the system shares INTO sveska */}
        <div style={{
          margin:'10px 14px 4px', padding:'12px 14px',
          background:'color-mix(in oklab, var(--ai) 12%, transparent)',
          boxShadow:'inset 0 0 0 1px color-mix(in oklab, var(--ai) 40%, transparent)',
          borderRadius:12,
          display:'flex', flexDirection:'column', gap:8,
        }}>
          <div style={{
            display:'flex', alignItems:'center', gap:8,
            fontFamily:'var(--font-mono)', fontSize:10.5, letterSpacing:'.10em',
            textTransform:'uppercase', color:'var(--ai)',
          }}>
            <span style={{
              width:6, height:6, borderRadius:999, background:'var(--ai)',
              boxShadow:'0 0 0 2px color-mix(in oklab, var(--ai) 22%, transparent)',
            }}/>
            INCOMING SHARE · CHROME → SVESKA
          </div>
          <div style={{
            fontFamily:'var(--font-mono)', fontSize:13, color:'var(--text)', lineHeight:1.5,
            background:'var(--bg)', padding:'10px 12px', borderRadius:8,
            display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical', overflow:'hidden',
          }}>
            <span style={{color:'var(--text-dim)'}}>https://merlin.dev/blog/local-first/  ·  </span>
            "The folded page" — a post about how local-first software gives the user the same dignity as paper. Filed under: software, paper, dignity.
          </div>
          <div style={{display:'flex', gap:8}}>
            <button style={{
              appearance:'none', border:0, cursor:'pointer',
              flex:1, height:38, borderRadius:8,
              background:'var(--accent)', color:'#0C0C0E',
              fontFamily:'var(--font-ui)', fontWeight:700, fontSize:13,
              display:'inline-flex', alignItems:'center', justifyContent:'center', gap:6,
            }}>
              <MobIcon d="M12 5v14M5 12h14" w={14} sw={2.5}/>
              New note
            </button>
            <button style={{
              appearance:'none', border:0, cursor:'pointer',
              flex:1, height:38, borderRadius:8,
              background:'transparent', color:'var(--text)',
              boxShadow:'inset 0 0 0 1px var(--border-soft)',
              fontFamily:'var(--font-ui)', fontWeight:700, fontSize:13,
            }}>Append to weekend.md</button>
            <button style={{
              appearance:'none', border:0, cursor:'pointer',
              flex:1, height:38, borderRadius:8,
              background:'transparent', color:'var(--text)',
              boxShadow:'inset 0 0 0 1px var(--border-soft)',
              fontFamily:'var(--font-ui)', fontWeight:700, fontSize:13,
            }}>Send to Inbox</button>
          </div>
        </div>

        <div style={{marginTop:6}}>
          <MobNoteRow
            title="imports of Selimović"
            body='"Death and the Dervish" — the way memory is staged as procedure.'
            tags={[{label:'pinned', amber:true}, {label:'reading'}]}
            meta="3m"
            pinned
          />
          <MobNoteRow
            title="v0.1 ship list"
            body="M0 scaffold · M1 editor · M2 multi-note · M3 power UX · M4 AI · M5 canvas."
            tags={[{label:'ship'}]}
            meta="2m"
          />
          <MobNoteRow
            title="weekend.md"
            body="Draft the studio post · read Selimović, chapter 3 · ship list final pass."
            tags={[{label:'draft'}]}
            meta="14:02"
          />
          <MobNoteRow
            title="sevdah — glossary"
            body="A specifically Bosnian variety of melancholia, untranslatable."
            tags={[{label:'reading'},{label:'sevdah'}]}
            meta="1d"
          />
        </div>
        <div style={{height:120}}/>
        <MobFAB label="New" bottom={32}/>
      </div>
    </AndroidDevice>
  );
}

Object.assign(window, {
  IOSNotesList, IOSEditor, IOSInstall, AndroidNotes,
});

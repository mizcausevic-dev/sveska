// AppShell.jsx — composes every system component into the full Sveska desktop view.
// Props:
//   theme:  'dark' | 'light'   (sets the scoped --bg/--surface/--accent tokens)
//   mode:   'default' | 'focus' (focus mode hides sidebar/tabs, widens margins)
//   activeNote: which note is open (controls editor body)
// Sized for 1440 × 900 — fits exactly inside a design-canvas artboard.

const { useMemo } = React;

const TOKENS = {
  dark: {
    '--bg':'#0C0C0E','--surface':'#161619','--raised':'#222228',
    '--text':'#F4EFE6','--text-dim':'#B8B2A6',
    '--accent':'#F2B544','--accent-hover':'#EDA92E','--accent-press':'#C9871F',
    '--ai':'#4FD6C4','--ok':'#6FCF7F','--danger':'#E5604D',
    '--border-soft':'#222228','--shadow':'0 24px 60px rgba(0,0,0,.55)',
    '--font-display':'"Bricolage Grotesque",system-ui,sans-serif',
    '--font-ui':'"Satoshi","Manrope",system-ui,sans-serif',
    '--font-mono':'"JetBrains Mono",ui-monospace,monospace',
  },
  light: {
    '--bg':'#F4EFE6','--surface':'#FBF8F1','--raised':'#EFEADF',
    '--text':'#15110A','--text-dim':'#6B6457',
    '--accent':'#EDA92E','--accent-hover':'#C9871F','--accent-press':'#A06813',
    '--ai':'#C9871F','--ok':'#6FCF7F','--danger':'#E5604D',
    '--border-soft':'#E2DCCE','--shadow':'0 24px 60px rgba(20,17,10,.18)',
    '--font-display':'"Bricolage Grotesque",system-ui,sans-serif',
    '--font-ui':'"Satoshi","Manrope",system-ui,sans-serif',
    '--font-mono':'"JetBrains Mono",ui-monospace,monospace',
  },
};

// ─── small atoms ───
const Icon = ({d, w=16, sw=1.75, children}) => (
  <svg viewBox="0 0 24 24" width={w} height={w} fill="none" stroke="currentColor"
       strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    {d ? <path d={d}/> : children}
  </svg>
);

const Kbd = ({children}) => (
  <span style={{
    fontFamily:'var(--font-mono)', fontSize:10.5, padding:'1px 6px',
    borderRadius:5, background:'var(--raised)', color:'var(--text-dim)',
    letterSpacing:'.04em',
  }}>{children}</span>
);

// ─── chrome ───
function WindowBar({theme}) {
  return (
    <div style={{
      height:44, flexShrink:0,
      background:'var(--bg)',
      borderBottom:'1px solid var(--border-soft)',
      display:'flex', alignItems:'center', gap:14, padding:'0 16px',
    }}>
      {/* traffic lights */}
      <div style={{display:'flex', gap:8}}>
        <span style={{width:12,height:12,borderRadius:999,background:'#ff5f57'}}/>
        <span style={{width:12,height:12,borderRadius:999,background:'#febc2e'}}/>
        <span style={{width:12,height:12,borderRadius:999,background:'#28c840'}}/>
      </div>
      <div style={{width:1, height:18, background:'var(--border-soft)'}}/>
      {/* brand */}
      <div style={{display:'flex', alignItems:'center', gap:8}}>
        <div style={{
          width:22, height:22, borderRadius:5, background:'#0C0C0E',
          display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
        }}>
          <SvesPaper size={14}/>
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
      {/* command shortcut */}
      <button style={{
        appearance:'none', border:0, background:'var(--surface)', cursor:'pointer',
        height:28, padding:'0 12px 0 10px', borderRadius:8,
        display:'inline-flex', alignItems:'center', gap:8,
        boxShadow:'inset 0 0 0 1px var(--border-soft)',
        color:'var(--text-dim)', fontFamily:'var(--font-ui)', fontSize:12,
      }}>
        <Icon><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></Icon>
        <span>Search or jump…</span>
        <span style={{
          fontFamily:'var(--font-mono)', fontSize:10, padding:'1px 5px',
          borderRadius:4, background:'var(--raised)', marginLeft:18,
        }}>⌘K</span>
      </button>
      <button style={{
        appearance:'none', border:0, background:'transparent', cursor:'pointer',
        width:30, height:30, borderRadius:7, color:'var(--text-dim)',
        display:'inline-flex', alignItems:'center', justifyContent:'center',
      }}>
        <Icon d="M12 3v3M12 18v3M5 12H2M22 12h-3M19.07 4.93l-2.12 2.12M7.05 16.95l-2.12 2.12M19.07 19.07l-2.12-2.12M7.05 7.05L4.93 4.93"/>
      </button>
      <button style={{
        appearance:'none', border:0, background:'transparent', cursor:'pointer',
        width:30, height:30, borderRadius:7, color:'var(--text-dim)',
        display:'inline-flex', alignItems:'center', justifyContent:'center',
      }}>
        <Icon d="M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </button>
    </div>
  );
}

function SvesPaper({size=14}) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true">
      <path d="M16 12 H40 L50 22 V50 A2 2 0 0 1 48 52 H16 A2 2 0 0 1 14 50 V14 A2 2 0 0 1 16 12 Z" fill="#F2B544"/>
      <path d="M40 12 L50 22 H42 A2 2 0 0 1 40 20 Z" fill="#C9871F"/>
      <path d="M42 24.5C42 19.7 38 17 32.5 17C26.5 17 22.5 20 22.5 24.75C22.5 29.5 26.75 31.75 32.5 32.5C38.25 33.25 42.5 35.5 42.5 40.5C42.5 45.75 38.5 48.75 32.25 48.75C26.75 48.75 22.5 46.25 22.25 41.25" fill="none" stroke="#0C0C0E" strokeWidth="5.75" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function TabStrip({tabs, active, dirty}) {
  return (
    <div style={{
      flexShrink:0, height:36,
      background:'var(--surface)',
      borderBottom:'1px solid var(--border-soft)',
      display:'flex', alignItems:'flex-end', padding:'0 12px',
      gap:2,
    }}>
      {tabs.map((t, i) => (
        <button key={i} style={{
          appearance:'none', border:0, cursor:'pointer',
          height:32,
          padding:'0 12px',
          borderRadius:'8px 8px 0 0',
          background: i===active ? 'var(--bg)' : 'transparent',
          color: i===active ? 'var(--text)' : 'var(--text-dim)',
          fontFamily:'var(--font-ui)', fontSize:13, fontWeight:500,
          display:'inline-flex', alignItems:'center', gap:8,
          position:'relative',
          boxShadow: i===active ? 'inset 1px 0 0 var(--border-soft), inset -1px 0 0 var(--border-soft), inset 0 1px 0 var(--border-soft)' : 'none',
        }}>
          <span style={{
            width:6, height:6, borderRadius:999,
            background: i===active ? 'var(--accent)' : (dirty.includes(i) ? 'var(--ai)' : 'var(--text-dim)'),
          }}/>
          <span style={{maxWidth:160, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{t}</span>
          <Icon d="M6 6l12 12M18 6L6 18" w={12} sw={2}/>
          {i===active && (
            <span style={{
              position:'absolute', left:8, right:8, top:0, height:2,
              background:'var(--accent)', borderRadius:2,
            }}/>
          )}
        </button>
      ))}
      <button style={{
        appearance:'none', border:0, cursor:'pointer',
        width:26, height:26, borderRadius:6, margin:'0 4px 4px',
        background:'transparent', color:'var(--text-dim)',
        display:'inline-flex', alignItems:'center', justifyContent:'center',
      }}>
        <Icon d="M12 5v14M5 12h14" w={14} sw={2}/>
      </button>
      <div style={{flex:1}}/>
      <div style={{
        display:'inline-flex', alignItems:'center', gap:8,
        fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-dim)',
        padding:'0 8px 8px', letterSpacing:'.04em',
      }}>
        <span>3 open · 7 in notebook</span>
      </div>
    </div>
  );
}

function Sidebar() {
  return (
    <aside style={{
      width:300, flexShrink:0,
      background:'var(--surface)',
      borderRight:'1px solid var(--border-soft)',
      display:'flex', flexDirection:'column',
      overflow:'hidden',
    }}>
      {/* search */}
      <div style={{padding:'14px 16px 10px'}}>
        <div style={{
          display:'flex', alignItems:'center', gap:10,
          background:'var(--bg)', height:34, borderRadius:9, padding:'0 12px',
          boxShadow:'inset 0 0 0 1px var(--border-soft)',
          color:'var(--text-dim)',
        }}>
          <Icon w={14}><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></Icon>
          <span style={{fontFamily:'var(--font-ui)', fontSize:13}}>Search · 23 notes</span>
          <div style={{flex:1}}/>
          <Kbd>⌘F</Kbd>
        </div>
      </div>

      <SidebarHeader>FILTERS</SidebarHeader>
      <div style={{padding:'4px 12px 12px', display:'flex', flexDirection:'column', gap:2}}>
        <Filter label="All notes" count={23} active/>
        <Filter label="Pinned" count={3} dot="amber"/>
        <Filter label="Inbox" count={2} dot="signal"/>
        <Filter label="Trash" count={5}/>
      </div>

      <SidebarHeader>TAGS</SidebarHeader>
      <div style={{padding:'4px 16px 14px', display:'flex', flexWrap:'wrap', gap:6}}>
        {[['writing',6],['reading',3],['ship',2],['sevdah',1],['studio',4]].map(([t,n])=>(
          <span key={t} style={{
            fontFamily:'var(--font-mono)', fontSize:11, padding:'3px 9px',
            borderRadius:6, background:'var(--raised)', color:'var(--text-dim)',
            display:'inline-flex', gap:6,
          }}>{t}<span style={{opacity:.55}}>{n}</span></span>
        ))}
      </div>

      <SidebarHeader>RECENTS</SidebarHeader>
      <div style={{padding:'4px 12px', display:'flex', flexDirection:'column', gap:8, overflow:'hidden'}}>
        <RecentItem title="imports of Selimović" body='"Death and the Dervish" — memory staged as procedure…' tags={['pinned','reading']} meta="3m" pinned/>
        <RecentItem title="v0.1 ship list" body="M0 scaffold · M1 editor · M2 multi-note · M3 power UX…" tags={['ship']} meta="/improve" live/>
        <RecentItem title="weekend.md" body="Draft the studio post · read Selimović · ship list…" tags={['draft']} meta="14:02" active/>
        <RecentItem title="sevdah — glossary" body="A specifically Bosnian variety of melancholia…" tags={['sevdah']} meta="yesterday"/>
      </div>

      <div style={{flex:1}}/>
      <div style={{
        borderTop:'1px solid var(--border-soft)',
        padding:'10px 14px',
        display:'flex', alignItems:'center', gap:10,
      }}>
        <button style={{
          appearance:'none', border:0, cursor:'pointer',
          flex:1, height:32, borderRadius:8, padding:'0 12px',
          background:'transparent', color:'var(--text)',
          boxShadow:'inset 0 0 0 1px var(--border-soft)',
          fontFamily:'var(--font-ui)', fontSize:13, fontWeight:500,
          display:'inline-flex', alignItems:'center', gap:8, justifyContent:'center',
        }}>
          <Icon d="M12 5v14M5 12h14" w={13} sw={2}/>
          New note
          <Kbd>⌘N</Kbd>
        </button>
        <button style={{
          appearance:'none', border:0, cursor:'pointer',
          width:32, height:32, borderRadius:8,
          background:'transparent', color:'var(--text-dim)',
          display:'inline-flex', alignItems:'center', justifyContent:'center',
        }}>
          <Icon d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" sw={1.5}/>
        </button>
      </div>
    </aside>
  );
}

function SidebarHeader({children}) {
  return <div style={{
    fontFamily:'var(--font-mono)', fontSize:10.5, letterSpacing:'.12em',
    textTransform:'uppercase', color:'var(--text-dim)',
    padding:'14px 18px 4px',
  }}>{children}</div>;
}

function Filter({label, count, active, dot}) {
  return (
    <button style={{
      appearance:'none', border:0, cursor:'pointer',
      display:'flex', alignItems:'center', gap:10,
      padding:'7px 10px', borderRadius:7,
      background: active ? 'color-mix(in oklab, var(--accent) 14%, transparent)' : 'transparent',
      color: 'var(--text)',
      fontFamily:'var(--font-ui)', fontSize:13, fontWeight:500, textAlign:'left',
    }}>
      <span style={{
        width:6, height:6, borderRadius:999,
        background: dot==='amber' ? 'var(--accent)'
                  : dot==='signal' ? 'var(--ai)'
                  : active ? 'var(--accent)'
                  : 'transparent',
        boxShadow: dot==='signal' ? '0 0 0 2px color-mix(in oklab, var(--ai) 22%, transparent)' : 'none',
        outline: !dot && !active ? '1px solid var(--border-soft)' : 'none',
      }}/>
      <span style={{flex:1}}>{label}</span>
      <span style={{
        fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-dim)',
      }}>{count}</span>
    </button>
  );
}

function RecentItem({title, body, tags=[], meta, pinned, live, active}) {
  return (
    <div style={{
      padding:'10px 12px', borderRadius:9,
      background: active ? 'var(--bg)' : 'transparent',
      boxShadow: active ? 'inset 0 0 0 1px var(--border-soft)'
               : live   ? 'inset 0 0 0 1px var(--ai)'
               : 'none',
      cursor:'pointer',
      display:'flex', flexDirection:'column', gap:5,
    }}>
      <div style={{display:'flex', alignItems:'flex-start', gap:6}}>
        <div style={{
          flex:1, fontFamily:'var(--font-display)', fontWeight:700, fontSize:14.5,
          letterSpacing:'-0.012em', color:'var(--text)', lineHeight:1.2,
        }}>{title}</div>
        {pinned && <Icon d="M12 2l3 6 6 1-4.5 4.5L18 20l-6-3.5L6 20l1.5-6.5L3 9l6-1z" w={12} sw={1.5}/>}
      </div>
      <div style={{
        fontFamily:'var(--font-mono)', fontSize:11.5, color:'var(--text-dim)',
        lineHeight:1.45, overflow:'hidden', display:'-webkit-box',
        WebkitLineClamp:1, WebkitBoxOrient:'vertical',
      }}>{body}</div>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
        <div style={{display:'flex', gap:4}}>
          {tags.map(t => (
            <span key={t} style={{
              fontFamily:'var(--font-mono)', fontSize:10, padding:'1px 6px',
              borderRadius:4, background:'var(--raised)', color:'var(--text-dim)',
            }}>{t}</span>
          ))}
        </div>
        <span style={{
          fontFamily:'var(--font-mono)', fontSize:10, color: live ? 'var(--ai)' : 'var(--text-dim)',
          letterSpacing:'.04em', display:'inline-flex', alignItems:'center', gap:5,
        }}>
          {live && <span style={{
            width:5, height:5, borderRadius:999, background:'var(--ai)',
          }}/>}
          {meta}
        </span>
      </div>
    </div>
  );
}

function Toolbar() {
  return (
    <div style={{
      flexShrink:0, height:56,
      borderBottom:'1px solid var(--border-soft)',
      display:'flex', alignItems:'center', gap:6, padding:'0 24px',
      background:'var(--bg)',
    }}>
      <TbBtn d="M12 5v14M5 12h14"/>
      <TbBtn d="M19 12H5M12 19l-7-7 7-7"/>
      <TbBtn d="M5 12h14M12 5l7 7-7 7"/>
      <div style={{width:1, height:18, background:'var(--border-soft)', margin:'0 6px'}}/>
      <TbBtn d="M7 5h6a4 4 0 1 1 0 8H7zM7 13h7a4 4 0 1 1 0 8H7z" active/>
      <TbBtn d="M14 5h4M10 19h4M15 5l-4 14"/>
      <TbBtn d="M5 9h14M5 15h14M9 4l-2 16M17 4l-2 16"/>
      <TbBtn d="M4 6l2 2 4-4M4 13l2 2 4-4M4 20l2 2 4-4M14 7h7M14 14h7M14 21h7"/>
      <TbBtn d="M16 4h2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M9 4h6v4H9z"/>
      <div style={{width:1, height:18, background:'var(--border-soft)', margin:'0 6px'}}/>
      <TbBtn d="M9 18l6-6-6-6"/>
      <span style={{
        flex:1, fontFamily:'var(--font-mono)', fontSize:12.5,
        color:'var(--text)', padding:'0 14px',
        overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
      }}><span style={{color:'var(--text-dim)'}}>weekend</span>.md<span style={{color:'var(--text-dim)'}}> · edited 2m ago · 312 words</span></span>

      <button style={{
        appearance:'none', border:0, cursor:'pointer',
        height:32, padding:'0 12px 0 10px', borderRadius:8,
        background:'transparent', color:'var(--text-dim)',
        fontFamily:'var(--font-mono)', fontSize:11, letterSpacing:'.04em',
        display:'inline-flex', alignItems:'center', gap:8,
      }}>
        <span style={{position:'relative', width:8, height:8}}>
          <span style={{
            position:'absolute', inset:0, borderRadius:999, background:'var(--ai)',
            boxShadow:'0 0 0 3px color-mix(in oklab, var(--ai) 22%, transparent)',
          }}/>
        </span>
        <span>snapshot · 14:02</span>
      </button>

      <button style={{
        appearance:'none', border:0, cursor:'pointer',
        height:32, padding:'0 14px', borderRadius:8,
        background:'transparent', color:'var(--text)',
        boxShadow:'inset 0 0 0 1px var(--border-soft)',
        fontFamily:'var(--font-ui)', fontWeight:700, fontSize:13,
        display:'inline-flex', alignItems:'center', gap:8,
      }}>
        Share
        <Icon d="M12 5v14M5 12l7-7 7 7" w={13} sw={2}/>
      </button>

      <button style={{
        appearance:'none', border:0, cursor:'pointer',
        height:32, padding:'0 14px', borderRadius:8,
        background:'var(--accent)', color:'#0C0C0E',
        fontFamily:'var(--font-ui)', fontWeight:700, fontSize:13,
        display:'inline-flex', alignItems:'center', gap:8,
        letterSpacing:'-0.005em',
      }}>
        Save snapshot
        <Kbd>⌘S</Kbd>
      </button>
    </div>
  );
}

function TbBtn({d, active}) {
  return (
    <button style={{
      appearance:'none', border:0, background: active?'var(--raised)':'transparent',
      cursor:'pointer', width:34, height:34, borderRadius:8,
      color: active ? 'var(--accent)' : 'var(--text-dim)',
      display:'inline-flex', alignItems:'center', justifyContent:'center',
    }}>
      <Icon d={d} w={16} sw={1.75}/>
    </button>
  );
}

function EditorBody({focus}) {
  // The visible "note". A mix of prose, list, and one streaming AI suggestion block.
  const lineNo = (n) => (
    <span style={{
      width:32, textAlign:'right', color:'var(--text-dim)',
      opacity:.55, paddingRight:14, userSelect:'none',
      fontVariantNumeric:'tabular-nums',
    }}>{n}</span>
  );
  const line = (n, body, opts={}) => (
    <div key={n} style={{
      display:'flex', alignItems:'flex-start',
      background: opts.live ? 'color-mix(in oklab, var(--ai) 10%, transparent)' : 'transparent',
      borderLeft: opts.live ? '2px solid var(--ai)' : '2px solid transparent',
      padding:'1px 0',
    }}>
      {lineNo(n)}
      <div style={{flex:1, paddingLeft:14}}>{body}</div>
    </div>
  );
  return (
    <div style={{
      flex:1, overflow:'hidden',
      background:'var(--bg)', color:'var(--text)',
      fontFamily:'var(--font-mono)', fontSize:15.5, lineHeight:1.75,
      padding:`28px ${focus?160:64}px 32px`,
      display:'flex', flexDirection:'column',
    }}>
      <div style={{maxWidth: focus? 760 : 880, margin:focus?'0 auto':'0', width:'100%'}}>
        {line(1, <span><span style={{color:'var(--accent)'}}># weekend.md</span></span>)}
        {line(2, <span style={{color:'var(--text-dim)'}}>{'<!-- snapshot 14:02 · 312 words -->'}</span>)}
        {line(3, <span>&nbsp;</span>)}
        {line(4, <span>The folded page does not need permission to be written on. Local-first means the app keeps working when the network does not.</span>)}
        {line(5, <span>&nbsp;</span>)}
        {line(6, <span style={{color:'var(--accent)'}}>## todo · ship v0.1</span>)}
        {line(7, <span><Box on/> draft the studio post <Tag>writing</Tag></span>)}
        {line(8, <span><Box/> ship sveska v0.1 <Tag>M0–M1</Tag></span>)}
        {line(9, <span style={{paddingLeft:24}}><Box on/> wire vite + dexie + workbox</span>)}
        {line(10, <span style={{paddingLeft:24}}><Box/> textarea + 400ms autosave <Tag>M1.1</Tag></span>)}
        {line(11, <span style={{paddingLeft:24, position:'relative'}}>
          <Box/> snapshot dot + restore <Tag ai>AI · plan</Tag>
        </span>, {live:true})}
        {line(12, <span><Box/> read Selimović, chapter 3 <Tag>reading</Tag></span>)}
        {line(13, <span><Box on/> pour the rakija</span>)}
        {line(14, <span>&nbsp;</span>)}
        {line(15, <span style={{color:'var(--accent)'}}>## notes from selimović</span>)}
        {line(16, <span>&nbsp;</span>)}
        {line(17, <span><span style={{color:'var(--ai)'}}>"</span>Death and the Dervish<span style={{color:'var(--ai)'}}>"</span> — the way memory is staged as procedure.<span style={{borderLeft:'2px solid var(--accent)', marginLeft:4, height:'1.4em', display:'inline-block', verticalAlign:'middle', animation:'sveska-caret 1.1s steps(1) infinite'}}/></span>)}
      </div>

      {/* selection bubble — /improve in-flight */}
      <div style={{
        position:'absolute', left: focus?260:340, top:330,
        display:'flex', gap:6, alignItems:'center',
        background:'var(--surface)', border:'1px solid var(--ai)',
        borderRadius:10, padding:'6px 10px 6px 8px',
        boxShadow:'var(--shadow)',
        fontFamily:'var(--font-mono)', fontSize:11.5, letterSpacing:'.04em',
        color:'var(--text)',
      }}>
        <span style={{width:7, height:7, borderRadius:999, background:'var(--ai)',
          boxShadow:'0 0 0 3px color-mix(in oklab, var(--ai) 22%, transparent)'}}/>
        <span style={{color:'var(--ai)'}}>/improve</span>
        <span style={{color:'var(--text-dim)'}}>· streaming · 1.4 s</span>
        <span style={{width:1, height:14, background:'var(--border-soft)', margin:'0 2px'}}/>
        <span style={{color:'var(--text-dim)'}}>esc cancel</span>
      </div>

      <style>{`@keyframes sveska-caret { 50% { opacity: 0 } }`}</style>
    </div>
  );
}

function Box({on}) {
  return (
    <span style={{
      display:'inline-block', verticalAlign:'-3px',
      width:15, height:15, borderRadius:4,
      border: on?'1.5px solid var(--accent)':'1.5px solid var(--text-dim)',
      background: on?'var(--accent)':'transparent',
      marginRight:8, position:'relative',
    }}>
      {on && <span style={{
        position:'absolute', left:3, top:1,
        width:7, height:4,
        borderLeft:'2px solid #0C0C0E', borderBottom:'2px solid #0C0C0E',
        transform:'rotate(-45deg)',
      }}/>}
    </span>
  );
}

function Tag({children, ai}) {
  return (
    <span style={{
      fontFamily:'var(--font-mono)', fontSize:10.5,
      padding:'1px 6px', borderRadius:4, marginLeft:6,
      background: ai ? 'color-mix(in oklab, var(--ai) 16%, transparent)' : 'var(--raised)',
      color: ai ? 'var(--ai)' : 'var(--text-dim)',
      verticalAlign:'2px',
    }}>{children}</span>
  );
}

function StatusBar({focus}) {
  return (
    <div style={{
      flexShrink:0, height:30,
      background:'var(--surface)',
      borderTop:'1px solid var(--border-soft)',
      display:'flex', alignItems:'center',
      fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-dim)',
      letterSpacing:'.04em', padding:'0 16px',
    }}>
      <span style={{display:'inline-flex', gap:6, alignItems:'center', padding:'0 10px 0 0', color:'var(--ok)'}}>
        <span style={{width:6, height:6, borderRadius:999, background:'var(--ok)'}}/>
        Saved · 14:02
      </span>
      <Sep/>
      <Slot>312 words · 14m read</Slot>
      <Sep/>
      <Slot>Ln 38, Col 12</Slot>
      <Sep/>
      <Slot>spaces: 2</Slot>
      <div style={{flex:1}}/>
      <Slot style={{color:'var(--ai)'}}><span style={{width:6, height:6, borderRadius:999, background:'var(--ai)', boxShadow:'0 0 0 2px color-mix(in oklab, var(--ai) 22%, transparent)'}}/> /improve · streaming</Slot>
      <Sep/>
      <Slot>UTF-8 · LF</Slot>
      <Sep/>
      <Slot>markdown</Slot>
      <Sep/>
      <Slot style={{color:'var(--accent)'}}>● Offline · local-first</Slot>
    </div>
  );
}
function Sep() { return <span style={{width:1, height:14, background:'var(--border-soft)', margin:'0 4px'}}/>; }
function Slot({children, style}) {
  return <span style={{display:'inline-flex', alignItems:'center', gap:6, padding:'0 10px', ...style}}>{children}</span>;
}

// ─── Whole shell ───
function AppShell({theme='dark', mode='default'}) {
  const tokens = TOKENS[theme];
  const styleVars = useMemo(()=>Object.fromEntries(Object.entries(tokens)), [theme]);
  const focus = mode === 'focus';
  return (
    <div style={{
      ...styleVars,
      width:'100%', height:'100%',
      background:'var(--bg)', color:'var(--text)',
      fontFamily:'var(--font-ui)',
      display:'flex', flexDirection:'column',
      overflow:'hidden',
      position:'relative',
    }}>
      <WindowBar theme={theme}/>
      {!focus && <TabStrip
        tabs={['weekend.md','imports of Selimović','v0.1 ship list']}
        active={0}
        dirty={[1]}
      />}
      <div style={{flex:1, display:'flex', overflow:'hidden'}}>
        {!focus && <Sidebar/>}
        <main style={{flex:1, display:'flex', flexDirection:'column', overflow:'hidden', position:'relative'}}>
          {!focus && <Toolbar/>}
          {focus && (
            <div style={{
              position:'absolute', top:18, right:24, zIndex:2,
              display:'flex', alignItems:'center', gap:10,
              fontFamily:'var(--font-mono)', fontSize:11, letterSpacing:'.04em',
              color:'var(--text-dim)',
            }}>
              <span style={{position:'relative', width:7, height:7}}>
                <span style={{position:'absolute', inset:0, borderRadius:999, background:'var(--ai)',
                  boxShadow:'0 0 0 3px color-mix(in oklab, var(--ai) 22%, transparent)'}}/>
              </span>
              snapshot · 14:02
              <span style={{width:1, height:14, background:'var(--border-soft)'}}/>
              focus · Alt+F to exit
            </div>
          )}
          <EditorBody focus={focus}/>
          <StatusBar focus={focus}/>
        </main>
      </div>
    </div>
  );
}

Object.assign(window, { AppShell, SVESKA_TOKENS: TOKENS });

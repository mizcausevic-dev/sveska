// multinote-chrome.jsx — shared chrome for the M2 multi-note views.
// Sidebar (search, favorites, filters, tags, recents), TabStrip, Toolbar,
// StatusBar, atoms. Loaded before multinote-screens.jsx.

const MN_TOKENS = {
  dark: {
    '--bg':'#0C0C0E','--surface':'#161619','--raised':'#222228',
    '--text':'#F4EFE6','--text-dim':'#B8B2A6',
    '--accent':'#F2B544','--accent-hover':'#EDA92E','--accent-press':'#C9871F',
    '--ai':'#4FD6C4','--ok':'#6FCF7F','--danger':'#E5604D',
    '--border-soft':'#222228',
    '--font-display':'"Bricolage Grotesque",system-ui,sans-serif',
    '--font-ui':'"Satoshi","Manrope",system-ui,sans-serif',
    '--font-mono':'"JetBrains Mono",ui-monospace,monospace',
  },
};

// ── atoms ──
const MIcon = ({d, w=14, sw=1.75, children}) => (
  <svg viewBox="0 0 24 24" width={w} height={w} fill="none" stroke="currentColor"
       strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    {d ? <path d={d}/> : children}
  </svg>
);
const MKbd = ({children, light}) => (
  <span style={{
    fontFamily:'var(--font-mono)', fontSize:10.5, padding:'1px 6px',
    borderRadius:5, background: light?'rgba(0,0,0,.18)':'var(--raised)',
    color: light?'inherit':'var(--text-dim)', letterSpacing:'.04em',
  }}>{children}</span>
);

// ── window bar ──
function MNWindowBar({title='weekend.md', searchPlaceholder='Search or jump… ⌘K'}) {
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
      <button style={{
        appearance:'none', border:0, background:'var(--surface)', cursor:'pointer',
        height:28, padding:'0 12px 0 10px', borderRadius:8,
        display:'inline-flex', alignItems:'center', gap:8,
        boxShadow:'inset 0 0 0 1px var(--border-soft)',
        color:'var(--text-dim)', fontFamily:'var(--font-ui)', fontSize:12,
      }}>
        <MIcon><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></MIcon>
        <span>{searchPlaceholder}</span>
      </button>
      <button style={{
        appearance:'none', border:0, background:'transparent', cursor:'pointer',
        width:30, height:30, borderRadius:7, color:'var(--text-dim)',
        display:'inline-flex', alignItems:'center', justifyContent:'center',
      }}>
        <MIcon d="M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </button>
    </div>
  );
}

// ── tab strip ──
function MNTabStrip({tabs, active=0, dirty=[], showNew=true, hint}) {
  return (
    <div style={{
      flexShrink:0, height:36,
      background:'var(--surface)', borderBottom:'1px solid var(--border-soft)',
      display:'flex', alignItems:'flex-end', padding:'0 12px', gap:2,
    }}>
      {tabs.map((t, i) => (
        <button key={i} style={{
          appearance:'none', border:0, cursor:'pointer',
          height:32, padding:'0 12px',
          borderRadius:'8px 8px 0 0',
          background: i===active ? 'var(--bg)' : 'transparent',
          color: i===active ? 'var(--text)' : 'var(--text-dim)',
          fontFamily:'var(--font-ui)', fontSize:13, fontWeight:500,
          display:'inline-flex', alignItems:'center', gap:8, position:'relative',
          boxShadow: i===active ? 'inset 1px 0 0 var(--border-soft), inset -1px 0 0 var(--border-soft), inset 0 1px 0 var(--border-soft)' : 'none',
        }}>
          <span style={{
            width:6, height:6, borderRadius:999,
            background: i===active ? 'var(--accent)' : (dirty.includes(i) ? 'var(--ai)' : 'var(--text-dim)'),
            boxShadow: dirty.includes(i) && i!==active ? '0 0 0 2px color-mix(in oklab, var(--ai) 22%, transparent)' : 'none',
          }}/>
          <span style={{maxWidth:160, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{t}</span>
          <MIcon d="M6 6l12 12M18 6L6 18" w={12} sw={2}/>
          {i===active && (
            <span style={{
              position:'absolute', left:8, right:8, top:0, height:2,
              background:'var(--accent)', borderRadius:2,
            }}/>
          )}
        </button>
      ))}
      {showNew && (
        <button style={{
          appearance:'none', border:0, cursor:'pointer',
          width:26, height:26, borderRadius:6, margin:'0 4px 4px',
          background:'transparent', color:'var(--text-dim)',
          display:'inline-flex', alignItems:'center', justifyContent:'center',
        }}>
          <MIcon d="M12 5v14M5 12h14" w={14} sw={2}/>
        </button>
      )}
      <div style={{flex:1}}/>
      <div style={{
        display:'inline-flex', alignItems:'center', gap:8,
        fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-dim)',
        padding:'0 8px 8px', letterSpacing:'.04em',
      }}>
        <span>{hint || `${tabs.length} open · 23 in notebook`}</span>
      </div>
    </div>
  );
}

// ── rich sidebar ──
function MNSidebar({activeFilter='all', activeTag, inboxCount=2, favorites, recents, query, showInboxBadge=true}) {
  return (
    <aside style={{
      width:300, flexShrink:0,
      background:'var(--surface)', borderRight:'1px solid var(--border-soft)',
      display:'flex', flexDirection:'column', overflow:'hidden',
    }}>
      <div style={{padding:'14px 16px 10px'}}>
        <div style={{
          display:'flex', alignItems:'center', gap:10,
          background:'var(--bg)', height:34, borderRadius:9, padding:'0 12px',
          boxShadow:'inset 0 0 0 1px var(--border-soft)',
          color: query ? 'var(--text)' : 'var(--text-dim)',
        }}>
          <MIcon w={14}><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></MIcon>
          <span style={{
            flex:1, fontFamily:'var(--font-ui)', fontSize:13,
            overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
          }}>{query || 'Search · 23 notes'}</span>
          {!query && <MKbd>⌘F</MKbd>}
        </div>
      </div>

      {favorites && (
        <>
          <MNSideHeader>FAVORITES BAR</MNSideHeader>
          <div style={{padding:'4px 14px 12px', display:'flex', gap:8}}>
            {favorites.map((f,i)=>(
              <div key={i} title={f.title} style={{
                width:44, height:44, borderRadius:8,
                background: f.amber ? 'var(--accent)' : 'var(--raised)',
                color: f.amber ? '#0C0C0E' : 'var(--text)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontFamily:'var(--font-display)', fontWeight:700, fontSize:16,
                letterSpacing:'-0.02em',
                boxShadow:'inset 0 0 0 1px var(--border-soft)',
                cursor:'pointer',
              }}>{f.letter}</div>
            ))}
            <div style={{
              width:44, height:44, borderRadius:8,
              border:'1px dashed var(--border-soft)',
              display:'flex', alignItems:'center', justifyContent:'center',
              color:'var(--text-dim)', cursor:'pointer',
            }}><MIcon d="M12 5v14M5 12h14" w={14}/></div>
          </div>
        </>
      )}

      {showInboxBadge && (
        <>
          <MNSideHeader right={<span style={{color:'var(--ai)', fontWeight:500}}>{inboxCount}</span>}>QUICK CAPTURE · INBOX</MNSideHeader>
          <div style={{padding:'4px 14px 12px', display:'flex', flexDirection:'column', gap:6}}>
            <InboxItem text="check whether Selimović is on the studio reading list — it's clearly the source for…" time="2h"/>
            <InboxItem text='"sevdah" — needs a glossary entry before the studio post goes out' time="5h"/>
          </div>
        </>
      )}

      <MNSideHeader>FILTERS</MNSideHeader>
      <div style={{padding:'4px 12px 10px', display:'flex', flexDirection:'column', gap:2}}>
        <MNFilter id="all" label="All notes" count={23} active={activeFilter==='all'}/>
        <MNFilter id="pinned" label="Pinned" count={3} dot="amber" active={activeFilter==='pinned'}/>
        <MNFilter id="inbox" label="Inbox" count={inboxCount} dot="signal" active={activeFilter==='inbox'}/>
        <MNFilter id="this-week" label="This week" count={9} active={activeFilter==='this-week'}/>
        <MNFilter id="trash" label="Trash" count={5} active={activeFilter==='trash'}/>
      </div>

      <MNSideHeader right={<span style={{color:'var(--text-dim)'}}>{activeTag ? '1' : '12'} of 12</span>}>TAGS</MNSideHeader>
      <div style={{padding:'4px 16px 14px', display:'flex', flexWrap:'wrap', gap:6}}>
        {[
          ['writing',6,false],
          ['reading',3, activeTag==='reading'],
          ['ship',2,false],
          ['sevdah',1,false],
          ['studio',4,false],
          ['M0',2,false],
          ['M1',3,false],
          ['draft',2,false],
        ].map(([t,n,on])=>(
          <span key={t} style={{
            fontFamily:'var(--font-mono)', fontSize:11, padding:'3px 9px',
            borderRadius:6,
            background: on ? 'var(--accent)' : 'var(--raised)',
            color: on ? '#0C0C0E' : 'var(--text-dim)',
            display:'inline-flex', gap:6, cursor:'pointer',
          }}>{t}<span style={{opacity:.55}}>{n}</span></span>
        ))}
      </div>

      <MNSideHeader>RECENTS</MNSideHeader>
      <div style={{padding:'4px 12px', display:'flex', flexDirection:'column', gap:8, overflow:'hidden'}}>
        {(recents || defaultRecents).map((r,i)=>(
          <MNRecentItem key={i} {...r}/>
        ))}
      </div>

      <div style={{flex:1}}/>
      <div style={{
        borderTop:'1px solid var(--border-soft)', padding:'10px 14px',
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
          <MIcon d="M12 5v14M5 12h14" w={13} sw={2}/>
          New note <MKbd>⌘N</MKbd>
        </button>
        <button style={{
          appearance:'none', border:0, cursor:'pointer',
          width:32, height:32, borderRadius:8,
          background:'transparent', color:'var(--text-dim)',
          display:'inline-flex', alignItems:'center', justifyContent:'center',
        }}>
          <MIcon d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" sw={1.5}/>
        </button>
      </div>
    </aside>
  );
}

function MNSideHeader({children, right}) {
  return (
    <div style={{
      fontFamily:'var(--font-mono)', fontSize:10.5, letterSpacing:'.12em',
      textTransform:'uppercase', color:'var(--text-dim)',
      padding:'14px 18px 4px',
      display:'flex', justifyContent:'space-between', alignItems:'baseline',
    }}>
      <span>{children}</span>
      {right && <span style={{letterSpacing:'.04em'}}>{right}</span>}
    </div>
  );
}

function MNFilter({label, count, active, dot}) {
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
      <span style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-dim)'}}>{count}</span>
    </button>
  );
}

function InboxItem({text, time}) {
  return (
    <div style={{
      display:'flex', gap:8, alignItems:'flex-start',
      padding:'8px 10px', borderRadius:7,
      background:'color-mix(in oklab, var(--ai) 10%, transparent)',
      boxShadow:'inset 0 0 0 1px color-mix(in oklab, var(--ai) 30%, transparent)',
      cursor:'pointer',
    }}>
      <span style={{
        width:5, height:5, borderRadius:999, background:'var(--ai)',
        marginTop:6, flexShrink:0,
      }}/>
      <div style={{flex:1, overflow:'hidden'}}>
        <div style={{
          fontFamily:'var(--font-mono)', fontSize:11.5, color:'var(--text)',
          lineHeight:1.45, overflow:'hidden',
          display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical',
        }}>{text}</div>
        <div style={{
          fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text-dim)',
          letterSpacing:'.04em', marginTop:3,
        }}>{time} · unprocessed</div>
      </div>
    </div>
  );
}

function MNRecentItem({title, body, tags=[], meta, pinned, live, active, dirty}) {
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
        {dirty && <span style={{
          width:6, height:6, borderRadius:999, background:'var(--ai)',
          boxShadow:'0 0 0 2px color-mix(in oklab, var(--ai) 22%, transparent)',
          marginTop:7, flexShrink:0,
        }}/>}
        <div style={{
          flex:1, fontFamily:'var(--font-display)', fontWeight:700, fontSize:14.5,
          letterSpacing:'-0.012em', color:'var(--text)', lineHeight:1.2,
        }}>{title}</div>
        {pinned && <MIcon d="M12 2l3 6 6 1-4.5 4.5L18 20l-6-3.5L6 20l1.5-6.5L3 9l6-1z" w={12} sw={1.5}/>}
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
          fontFamily:'var(--font-mono)', fontSize:10,
          color: live ? 'var(--ai)' : 'var(--text-dim)',
          letterSpacing:'.04em', display:'inline-flex', alignItems:'center', gap:5,
        }}>
          {live && <span style={{width:5, height:5, borderRadius:999, background:'var(--ai)'}}/>}
          {meta}
        </span>
      </div>
    </div>
  );
}

const defaultRecents = [
  {title:'imports of Selimović', body:'"Death and the Dervish" — memory staged as procedure…', tags:['pinned','reading'], meta:'3m', pinned:true},
  {title:'v0.1 ship list', body:'M0 scaffold · M1 editor · M2 multi-note · M3 power UX…', tags:['ship'], meta:'/improve', live:true, dirty:true},
  {title:'weekend.md', body:'Draft the studio post · read Selimović · ship list…', tags:['draft'], meta:'14:02', active:true},
  {title:'sevdah — glossary', body:'A specifically Bosnian variety of melancholia…', tags:['sevdah'], meta:'yesterday'},
];

const defaultFavorites = [
  {letter:'W', title:'weekend.md', amber:true},
  {letter:'S', title:'imports of Selimović'},
  {letter:'V', title:'v0.1 ship list'},
  {letter:'G', title:'glossary'},
];

// ── toolbar ──
function MNToolbar({title, dirty, snapshot='14:02', pending}) {
  const dotColor = pending ? 'var(--ai)' : 'var(--ai)';
  return (
    <div style={{
      flexShrink:0, height:56, borderBottom:'1px solid var(--border-soft)',
      display:'flex', alignItems:'center', gap:6, padding:'0 24px',
      background:'var(--bg)',
    }}>
      {[
        ['M12 5v14M5 12h14', false],
        ['M19 12H5M12 19l-7-7 7-7', false],
        ['M5 12h14M12 5l7 7-7 7', false],
        ['SEP'],
        ['M7 5h6a4 4 0 1 1 0 8H7zM7 13h7a4 4 0 1 1 0 8H7z', true],
        ['M14 5h4M10 19h4M15 5l-4 14', false],
        ['M4 6l2 2 4-4M4 13l2 2 4-4M4 20l2 2 4-4M14 7h7M14 14h7M14 21h7', false],
        ['M16 4h2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M9 4h6v4H9z', false],
      ].map((it, i) => it[0]==='SEP'
        ? <div key={i} style={{width:1, height:18, background:'var(--border-soft)', margin:'0 6px'}}/>
        : <button key={i} style={{
            appearance:'none', border:0, background: it[1]?'var(--raised)':'transparent',
            cursor:'pointer', width:34, height:34, borderRadius:8,
            color: it[1]?'var(--accent)':'var(--text-dim)',
            display:'inline-flex', alignItems:'center', justifyContent:'center',
          }}>
            <MIcon d={it[0]} w={16} sw={1.75}/>
          </button>
      )}
      <span style={{
        flex:1, fontFamily:'var(--font-mono)', fontSize:12.5,
        color:'var(--text)', padding:'0 14px',
        overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
      }}>
        <span style={{color:'var(--text-dim)'}}>{title.split('.')[0]}</span>.{title.split('.')[1]||'md'}
        <span style={{color:'var(--text-dim)'}}>{dirty ? ' · unsaved · 2m ago' : ' · edited 2m ago · 312 words'}</span>
      </span>
      <button style={{
        appearance:'none', border:0, cursor:'pointer',
        height:32, padding:'0 12px 0 10px', borderRadius:8,
        background:'transparent', color:'var(--text-dim)',
        fontFamily:'var(--font-mono)', fontSize:11, letterSpacing:'.04em',
        display:'inline-flex', alignItems:'center', gap:8,
      }}>
        <span style={{position:'relative', width:8, height:8}}>
          <span style={{
            position:'absolute', inset:0, borderRadius:999, background:dotColor,
            boxShadow: pending ? '0 0 0 3px color-mix(in oklab, var(--ai) 22%, transparent)' : 'none',
          }}/>
        </span>
        snapshot · {snapshot}
      </button>
      <button style={{
        appearance:'none', border:0, cursor:'pointer',
        height:32, padding:'0 14px', borderRadius:8,
        background:'transparent', color:'var(--text)',
        boxShadow:'inset 0 0 0 1px var(--border-soft)',
        fontFamily:'var(--font-ui)', fontWeight:700, fontSize:13,
        display:'inline-flex', alignItems:'center', gap:8,
      }}>Share</button>
      <button style={{
        appearance:'none', border:0, cursor:'pointer',
        height:32, padding:'0 14px', borderRadius:8,
        background:'var(--accent)', color:'#0C0C0E',
        fontFamily:'var(--font-ui)', fontWeight:700, fontSize:13,
        display:'inline-flex', alignItems:'center', gap:8,
      }}>Save snapshot <MKbd light>⌘S</MKbd></button>
    </div>
  );
}

// ── status bar ──
function MNStatusBar({left, right, live, saved=true}) {
  return (
    <div style={{
      flexShrink:0, height:30,
      background:'var(--surface)', borderTop:'1px solid var(--border-soft)',
      display:'flex', alignItems:'center', padding:'0 16px',
      fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-dim)',
      letterSpacing:'.04em',
    }}>
      {saved && (
        <span style={{display:'inline-flex', gap:6, alignItems:'center', padding:'0 10px 0 0', color:'var(--ok)'}}>
          <span style={{width:6, height:6, borderRadius:999, background:'var(--ok)'}}/>
          Saved · 14:02
        </span>
      )}
      <span style={{width:1, height:14, background:'var(--border-soft)', margin:'0 4px'}}/>
      {left}
      <div style={{flex:1}}/>
      {right}
      {live && (
        <>
          <span style={{width:1, height:14, background:'var(--border-soft)', margin:'0 4px'}}/>
          <span style={{display:'inline-flex', gap:6, alignItems:'center', padding:'0 10px', color:'var(--ai)'}}>
            <span style={{width:6, height:6, borderRadius:999, background:'var(--ai)', boxShadow:'0 0 0 2px color-mix(in oklab, var(--ai) 22%, transparent)'}}/>
            {live}
          </span>
        </>
      )}
      <span style={{width:1, height:14, background:'var(--border-soft)', margin:'0 4px'}}/>
      <span style={{padding:'0 10px', color:'var(--accent)'}}>● Offline · local-first</span>
    </div>
  );
}

Object.assign(window, {
  MN_TOKENS,
  MNWindowBar, MNTabStrip, MNSidebar, MNToolbar, MNStatusBar,
  MIcon, MKbd, MNRecentItem,
});

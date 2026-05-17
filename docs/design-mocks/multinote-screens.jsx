// multinote-screens.jsx — five screen compositions for M2 multi-note depth.
// Loads after multinote-chrome.jsx. Each is sized for 1440×900.

const SCREEN_W = 1440;
const SCREEN_H = 900;

function MNShell({children}) {
  return (
    <div style={{
      ...MN_TOKENS.dark,
      width:'100%', height:'100%',
      background:'var(--bg)', color:'var(--text)',
      fontFamily:'var(--font-ui)',
      display:'flex', flexDirection:'column', overflow:'hidden',
    }}>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SCREEN 1 — Multi-note overview: 5 tabs, rich sidebar w/ favorites + inbox
// ─────────────────────────────────────────────────────────────
function ScreenMultiNote() {
  return (
    <MNShell>
      <MNWindowBar/>
      <MNTabStrip
        tabs={['weekend.md', 'imports of Selimović', 'v0.1 ship list', 'sevdah · glossary', 'studio post · draft']}
        active={0}
        dirty={[1,2]}
        hint="5 open · 23 in notebook · session restored"
      />
      <div style={{flex:1, display:'flex', overflow:'hidden'}}>
        <MNSidebar
          activeFilter="all"
          favorites={defaultFavorites}
          inboxCount={2}
        />
        <main style={{flex:1, display:'flex', flexDirection:'column', overflow:'hidden'}}>
          <MNToolbar title="weekend.md" snapshot="14:02"/>
          <div style={{
            flex:1, background:'var(--bg)', padding:'40px 64px',
            fontFamily:'var(--font-mono)', fontSize:15.5, lineHeight:1.75, color:'var(--text)',
            overflow:'hidden',
          }}>
            <div style={{maxWidth:880, color:'var(--accent)'}}># weekend.md</div>
            <div style={{color:'var(--text-dim)', maxWidth:880}}>&lt;!-- snapshot 14:02 · 312 words --&gt;</div>
            <br/>
            <div style={{maxWidth:880}}>The folded page does not need permission to be written on. Local-first means the app keeps working when the network does not.</div>
            <br/>
            <div style={{maxWidth:880, color:'var(--accent)'}}>## ship sveska v0.1</div>
            <div style={{maxWidth:880}}>
              <Check on/> draft the studio post<br/>
              <Check/> ship sveska v0.1 — M0 + M1<br/>
              <Check/> read Selimović, chapter 3
            </div>
          </div>
          <MNStatusBar
            left={<span style={{padding:'0 10px'}}>312 words · 14m read · Ln 12, Col 38</span>}
            right={<span style={{padding:'0 10px'}}>UTF-8 · LF · markdown</span>}
          />
        </main>
      </div>
    </MNShell>
  );
}

function Check({on}) {
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

// ─────────────────────────────────────────────────────────────
// SCREEN 2 — Tag filter: notes grid filtered by "reading"
// ─────────────────────────────────────────────────────────────
function ScreenTagFilter() {
  return (
    <MNShell>
      <MNWindowBar searchPlaceholder='tag:reading · 3 notes'/>
      <MNTabStrip
        tabs={['weekend.md', 'imports of Selimović']}
        active={1}
        dirty={[]}
        hint="2 open · 3 of 23 visible"
      />
      <div style={{flex:1, display:'flex', overflow:'hidden'}}>
        <MNSidebar
          activeFilter="all"
          activeTag="reading"
          favorites={defaultFavorites}
          showInboxBadge={false}
        />
        <main style={{flex:1, display:'flex', flexDirection:'column', overflow:'hidden', background:'var(--bg)'}}>
          {/* sub-toolbar with active filter */}
          <div style={{
            height:64, borderBottom:'1px solid var(--border-soft)',
            display:'flex', alignItems:'center', padding:'0 32px', gap:14,
            flexShrink:0,
          }}>
            <span style={{
              fontFamily:'var(--font-display)', fontWeight:700, fontSize:22,
              letterSpacing:'-0.015em', color:'var(--text)',
            }}>Reading</span>
            <span style={{
              fontFamily:'var(--font-mono)', fontSize:11, padding:'4px 9px',
              borderRadius:6, background:'color-mix(in oklab, var(--accent) 14%, transparent)',
              color:'var(--accent)', letterSpacing:'.04em',
              display:'inline-flex', alignItems:'center', gap:6,
            }}>
              tag · reading
              <MIcon d="M6 6l12 12M18 6L6 18" w={10} sw={2}/>
            </span>
            <span style={{
              fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-dim)', letterSpacing:'.04em',
            }}>3 notes · 4,820 words total</span>
            <div style={{flex:1}}/>
            <span style={{
              fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-dim)',
            }}>SORT</span>
            <button style={{
              appearance:'none', border:0, background:'var(--surface)', cursor:'pointer',
              height:30, padding:'0 12px', borderRadius:7,
              boxShadow:'inset 0 0 0 1px var(--border-soft)',
              fontFamily:'var(--font-ui)', fontSize:12, color:'var(--text)',
              display:'inline-flex', alignItems:'center', gap:8,
            }}>
              Last edited <MIcon d="M6 9l6 6 6-6" w={11} sw={2}/>
            </button>
            <button style={{
              appearance:'none', border:0, background:'var(--surface)', cursor:'pointer',
              width:34, height:30, borderRadius:7,
              boxShadow:'inset 0 0 0 1px var(--border-soft)',
              color:'var(--accent)',
              display:'inline-flex', alignItems:'center', justifyContent:'center',
            }}>
              <MIcon d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" w={14} sw={1.6}/>
            </button>
          </div>

          {/* card grid */}
          <div style={{
            flex:1, padding:'24px 32px', overflow:'auto',
            display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:16, alignContent:'start',
          }}>
            <NoteCard
              title="imports of Selimović"
              body='"Death and the Dervish" — the way memory is staged as procedure. Move the chapter-3 notes here; cross-reference with the studio post draft. Add a glossary entry for "sevdah".'
              tags={[{label:'pinned', amber:true}, {label:'reading'}]}
              meta="3m · 1.2 kb"
              pinned active
            />
            <NoteCard
              title="Andrić — bridges as metaphor"
              body='"The Bridge on the Drina" stages every conflict as a passage. Useful framing for the studio post — the page as a bridge from intent to record.'
              tags={[{label:'reading'},{label:'studio'}]}
              meta="2d · 2.8 kb"
            />
            <NoteCard
              title="sevdah — first pass at a definition"
              body='A specifically Bosnian variety of melancholia, untranslatable; the closest English word is "ache" but the connotation is closer to durative…'
              tags={[{label:'reading'},{label:'sevdah'},{label:'glossary'}]}
              meta="5d · 824 b"
            />
            <NoteCard
              title="reading list · Q2"
              body='Selimović (re-read) · Andrić (start) · Hemon (essays, not novels) · Karahasan (Sarajevo, A War Journal of the Soul).'
              tags={[{label:'reading'}]}
              meta="1w · 312 b"
              dim
            />
          </div>
        </main>
      </div>
      <MNStatusBar
        left={<span style={{padding:'0 10px'}}>4 notes tagged "reading" · sorted by last edited</span>}
        right={<span style={{padding:'0 10px'}}>grid view</span>}
      />
    </MNShell>
  );
}

function NoteCard({title, body, tags=[], meta, pinned, active, dim}) {
  return (
    <div style={{
      background:'var(--surface)',
      border: active ? '1px solid var(--accent)' : '1px solid var(--border-soft)',
      borderRadius:12, padding:'18px 20px',
      display:'flex', flexDirection:'column', gap:10,
      position:'relative', cursor:'pointer', minHeight:170,
      opacity: dim ? .6 : 1,
    }}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8}}>
        <h4 style={{
          fontFamily:'var(--font-display)', fontWeight:700, fontSize:18,
          letterSpacing:'-0.012em', color:'var(--text)', lineHeight:1.15,
          margin:0, flex:1,
        }}>{title}</h4>
        {pinned && <span style={{color:'var(--accent)'}}>
          <MIcon d="M12 2l3 6 6 1-4.5 4.5L18 20l-6-3.5L6 20l1.5-6.5L3 9l6-1z" w={14} sw={1.5}/>
        </span>}
      </div>
      <div style={{
        fontFamily:'var(--font-mono)', fontSize:12.5, color:'var(--text-dim)', lineHeight:1.5,
        display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical', overflow:'hidden',
        flex:1,
      }}>{body}</div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:2}}>
        <div style={{display:'inline-flex', gap:5}}>
          {tags.map(t=>(
            <span key={t.label} style={{
              fontFamily:'var(--font-mono)', fontSize:10.5, padding:'1px 6px', borderRadius:4,
              background: t.amber ? 'color-mix(in oklab, var(--accent) 14%, transparent)' : 'var(--raised)',
              color: t.amber ? 'var(--accent)' : 'var(--text-dim)',
            }}>{t.label}</span>
          ))}
        </div>
        <span style={{
          fontFamily:'var(--font-mono)', fontSize:10.5, color:'var(--text-dim)', letterSpacing:'.04em',
        }}>{meta}</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SCREEN 3 — Fuzzy search results, query "selim", 8 matches
// ─────────────────────────────────────────────────────────────
function ScreenSearch() {
  return (
    <MNShell>
      <MNWindowBar searchPlaceholder='Search "selim" · 8 matches in 6 notes · 23 ms'/>
      <MNTabStrip
        tabs={['weekend.md', 'imports of Selimović', 'v0.1 ship list']}
        active={1}
        dirty={[]}
        hint="search · ⌘F focused · 8 of 23"
      />
      <div style={{flex:1, display:'flex', overflow:'hidden'}}>
        <MNSidebar
          query='"selim"'
          activeFilter="all"
          favorites={defaultFavorites}
          showInboxBadge={false}
        />
        <main style={{flex:1, display:'flex', overflow:'hidden', background:'var(--bg)'}}>
          {/* Results list (left) + preview pane (right) */}
          <div style={{flex:'0 0 540px', borderRight:'1px solid var(--border-soft)', display:'flex', flexDirection:'column', overflow:'hidden'}}>
            <div style={{
              padding:'18px 24px 14px', borderBottom:'1px solid var(--border-soft)',
              display:'flex', flexDirection:'column', gap:12,
            }}>
              <div style={{display:'flex', alignItems:'baseline', gap:14}}>
                <div style={{
                  fontFamily:'var(--font-display)', fontWeight:700, fontSize:22,
                  letterSpacing:'-0.015em',
                }}>
                  <span style={{color:'var(--text-dim)'}}>Search · </span>
                  <span style={{color:'var(--accent)'}}>"selim"</span>
                </div>
                <span style={{
                  fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-dim)', letterSpacing:'.04em',
                }}>8 matches · 23 ms · fuzzy</span>
              </div>
              <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
                <ScopeChip on>all</ScopeChip>
                <ScopeChip>title</ScopeChip>
                <ScopeChip>body</ScopeChip>
                <ScopeChip>tags</ScopeChip>
                <span style={{width:1, height:18, background:'var(--border-soft)', margin:'0 4px', alignSelf:'center'}}/>
                <ScopeChip mute>this week</ScopeChip>
                <ScopeChip mute>pinned only</ScopeChip>
              </div>
            </div>
            <div style={{flex:1, overflowY:'auto', padding:'8px 0'}}>
              <SearchRow
                title='imports of <em>Selim</em>ović'
                excerpt='"Death and the Dervish" — <em>Selim</em>ović stages memory as procedure. Move chapter-3 notes here.'
                tags={['pinned','reading']}
                meta="3m"
                active
                matches={3}
              />
              <SearchRow
                title="reading list · Q2"
                excerpt='<em>Selim</em>ović (re-read) · Andrić (start) · Hemon (essays, not novels).'
                tags={['reading']}
                meta="1w"
                matches={1}
              />
              <SearchRow
                title="weekend.md"
                excerpt='- read <em>Selim</em>ović, chapter 3 — finish before the studio post draft.'
                tags={['draft']}
                meta="14:02"
                matches={1}
              />
              <SearchRow
                title="studio post · draft"
                excerpt='…the way <em>Selim</em>ović embeds procedure inside grief is the model for how the editor should embed snapshots inside writing.'
                tags={['studio','writing']}
                meta="2d"
                matches={2}
              />
              <SearchRow
                title="glossary · sevdah"
                excerpt='…closest in <em>Selim</em>ović — see chapter 3 marginalia, also chapter 14.'
                tags={['sevdah','glossary']}
                meta="5d"
                matches={1}
              />
              <SearchRow
                title="bibliography seed"
                excerpt='primary: <em>Selim</em>ović, Andrić, Karahasan, Bašeskija. secondary: Mahmutćehajić, Hemon.'
                tags={['reading','studio']}
                meta="3w"
                matches={1}
              />
            </div>
            <div style={{
              padding:'10px 18px', borderTop:'1px solid var(--border-soft)',
              display:'flex', justifyContent:'space-between', alignItems:'center',
              fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-dim)', letterSpacing:'.04em',
            }}>
              <span>6 results</span>
              <span style={{display:'inline-flex', gap:10}}>
                <span><MKbd>↑</MKbd> <MKbd>↓</MKbd> navigate</span>
                <span><MKbd>↵</MKbd> open</span>
              </span>
            </div>
          </div>

          {/* preview pane (right) */}
          <div style={{flex:1, padding:'24px 32px', overflow:'hidden', display:'flex', flexDirection:'column'}}>
            <div style={{
              display:'flex', alignItems:'baseline', gap:10, marginBottom:12,
            }}>
              <span style={{
                fontFamily:'var(--font-mono)', fontSize:11, letterSpacing:'.10em', textTransform:'uppercase',
                color:'var(--text-dim)',
              }}>PREVIEW · MATCH 1 OF 3</span>
              <div style={{flex:1}}/>
              <button style={{
                appearance:'none', border:0, background:'var(--surface)', cursor:'pointer',
                height:28, padding:'0 12px', borderRadius:7,
                boxShadow:'inset 0 0 0 1px var(--border-soft)',
                fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-dim)',
                display:'inline-flex', alignItems:'center', gap:6,
              }}>prev <MKbd>⌥↑</MKbd></button>
              <button style={{
                appearance:'none', border:0, background:'var(--surface)', cursor:'pointer',
                height:28, padding:'0 12px', borderRadius:7,
                boxShadow:'inset 0 0 0 1px var(--border-soft)',
                fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-dim)',
                display:'inline-flex', alignItems:'center', gap:6,
              }}>next <MKbd>⌥↓</MKbd></button>
            </div>
            <h2 style={{
              fontFamily:'var(--font-display)', fontWeight:700, fontSize:30,
              letterSpacing:'-0.025em', color:'var(--text)', margin:'0 0 6px',
            }}>imports of <Hi>Selim</Hi>ović</h2>
            <div style={{
              fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-dim)', letterSpacing:'.04em',
              display:'flex', gap:10,
            }}>
              <span>edited 3 m ago</span>
              <span>·</span>
              <span>1.2 kb</span>
              <span>·</span>
              <span>3 snapshots</span>
              <span>·</span>
              <span style={{display:'inline-flex', gap:4}}>
                <span style={{padding:'1px 6px', borderRadius:4, background:'color-mix(in oklab, var(--accent) 14%, transparent)', color:'var(--accent)'}}>pinned</span>
                <span style={{padding:'1px 6px', borderRadius:4, background:'var(--raised)'}}>reading</span>
              </span>
            </div>
            <div style={{
              marginTop:18, padding:'20px 24px', borderRadius:10,
              background:'var(--surface)', boxShadow:'inset 0 0 0 1px var(--border-soft)',
              fontFamily:'var(--font-mono)', fontSize:14, lineHeight:1.7, color:'var(--text)',
              flex:1, overflow:'auto',
            }}>
              <div style={{color:'var(--accent)'}}># imports of <Hi>Selim</Hi>ović</div>
              <br/>
              "Death and the Dervish" — <Hi>Selim</Hi>ović stages memory as procedure. Move the chapter-3 notes here; cross-reference with the studio post draft. Add a glossary entry for "sevdah" — see chapter 14 marginalia.
              <br/><br/>
              <span style={{color:'var(--text-dim)'}}>The protagonist's relationship to time isn't sequential; it's recursive. Every chapter folds back into the same handful of fixed points. Useful frame for a notebook app — the "snapshot" as a recursive anchor, not a linear save.</span>
              <br/><br/>
              <Hi>Selim</Hi>ović's procedural memory ≠ the editor's redo stack. The redo stack is loss-less; procedural memory is what the writer chooses to keep. Snapshots = procedural memory.
            </div>
          </div>
        </main>
      </div>
      <MNStatusBar
        left={<span style={{padding:'0 10px'}}>fuzzy match · "selim" · 8 in 6 notes · 23 ms</span>}
        right={<span style={{padding:'0 10px'}}>preview · imports of Selimović</span>}
      />
    </MNShell>
  );
}

function ScopeChip({children, on, mute}) {
  return (
    <span style={{
      fontFamily:'var(--font-mono)', fontSize:11, padding:'4px 10px', borderRadius:999,
      background: on ? 'var(--accent)' : 'transparent',
      color: on ? '#0C0C0E' : 'var(--text-dim)',
      boxShadow: on ? 'none' : 'inset 0 0 0 1px var(--border-soft)',
      letterSpacing:'.04em',
      opacity: mute ? .7 : 1,
      cursor:'pointer',
    }}>{children}</span>
  );
}
function Hi({children}) {
  return <span style={{
    background:'color-mix(in oklab, var(--accent) 28%, transparent)',
    color:'var(--text)', padding:'0 2px', borderRadius:3,
    boxShadow:'0 -1px 0 var(--accent) inset',
  }}>{children}</span>;
}
function SearchRow({title, excerpt, tags=[], meta, matches, active}) {
  return (
    <div style={{
      padding:'12px 24px', cursor:'pointer',
      background: active ? 'color-mix(in oklab, var(--accent) 12%, transparent)' : 'transparent',
      borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
      display:'flex', flexDirection:'column', gap:5,
    }}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
        <span style={{
          fontFamily:'var(--font-display)', fontWeight:700, fontSize:15.5,
          letterSpacing:'-0.012em', color:'var(--text)',
        }} dangerouslySetInnerHTML={{__html: title.replace(/<em>/g,'<span style="background:color-mix(in oklab, #F2B544 28%, transparent); color:#F4EFE6; padding:0 2px; border-radius:3px;">').replace(/<\/em>/g,'</span>')}}/>
        <span style={{
          fontFamily:'var(--font-mono)', fontSize:10.5, color:'var(--text-dim)', letterSpacing:'.04em',
        }}>{matches} match{matches===1?'':'es'} · {meta}</span>
      </div>
      <div style={{
        fontFamily:'var(--font-mono)', fontSize:12, color:'var(--text-dim)', lineHeight:1.5,
        display:'-webkit-box', WebkitLineClamp:1, WebkitBoxOrient:'vertical', overflow:'hidden',
      }} dangerouslySetInnerHTML={{__html: excerpt.replace(/<em>/g,'<span style="background:color-mix(in oklab, #F2B544 28%, transparent); color:#F4EFE6; padding:0 2px; border-radius:3px;">').replace(/<\/em>/g,'</span>')}}/>
      <div style={{display:'inline-flex', gap:5}}>
        {tags.map(t=>(
          <span key={t} style={{
            fontFamily:'var(--font-mono)', fontSize:10, padding:'1px 6px', borderRadius:4,
            background:'var(--raised)', color:'var(--text-dim)',
          }}>{t}</span>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SCREEN 4 — Version history split-pane diff
// ─────────────────────────────────────────────────────────────
function ScreenVersionDiff() {
  return (
    <MNShell>
      <MNWindowBar searchPlaceholder='weekend.md · history · 7 snapshots'/>
      <MNTabStrip
        tabs={['weekend.md', 'imports of Selimović', 'v0.1 ship list']}
        active={0}
        dirty={[]}
        hint="version history · ⌘H"
      />
      <div style={{flex:1, display:'flex', overflow:'hidden'}}>
        {/* version list rail */}
        <aside style={{
          width:240, flexShrink:0, background:'var(--surface)',
          borderRight:'1px solid var(--border-soft)',
          display:'flex', flexDirection:'column', overflow:'hidden',
        }}>
          <div style={{
            padding:'18px 18px 12px', borderBottom:'1px solid var(--border-soft)',
          }}>
            <div style={{
              fontFamily:'var(--font-mono)', fontSize:10.5, letterSpacing:'.10em',
              textTransform:'uppercase', color:'var(--text-dim)', marginBottom:6,
            }}>HISTORY</div>
            <div style={{
              fontFamily:'var(--font-display)', fontWeight:700, fontSize:18,
              letterSpacing:'-0.015em', color:'var(--text)',
            }}>weekend.md</div>
            <div style={{
              fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-dim)', marginTop:3,
              letterSpacing:'.04em',
            }}>7 snapshots · 14 minutes</div>
          </div>
          <div style={{flex:1, overflowY:'auto', padding:'8px 0'}}>
            <VersionItem time="now"   label="current draft" selected="b" auto/>
            <VersionItem time="14:02" label="ship list final" selected="b" named/>
            <VersionItem time="13:48" label="auto-snap · 5m" selected="a" auto/>
            <VersionItem time="13:32" label="before AI rewrite" named/>
            <VersionItem time="13:14" label="auto-snap · 5m" auto/>
            <VersionItem time="13:09" label="first draft" named/>
            <VersionItem time="12:55" label="opened note" auto first/>
          </div>
          <div style={{
            padding:'10px 14px', borderTop:'1px solid var(--border-soft)',
            fontFamily:'var(--font-mono)', fontSize:10.5, color:'var(--text-dim)', letterSpacing:'.04em',
          }}>
            <div style={{marginBottom:4}}>auto · every 5 m of writing</div>
            <div>named · ⌘⇧S</div>
          </div>
        </aside>

        <main style={{flex:1, display:'flex', flexDirection:'column', overflow:'hidden', background:'var(--bg)'}}>
          {/* diff toolbar */}
          <div style={{
            height:54, borderBottom:'1px solid var(--border-soft)',
            display:'flex', alignItems:'center', padding:'0 24px', gap:14,
            flexShrink:0,
          }}>
            <span style={{
              fontFamily:'var(--font-mono)', fontSize:11, letterSpacing:'.10em',
              textTransform:'uppercase', color:'var(--text-dim)',
            }}>COMPARE</span>
            <VersionChip color="danger" label="13:48 · auto-snap"/>
            <span style={{color:'var(--text-dim)', fontFamily:'var(--font-mono)'}}>↔</span>
            <VersionChip color="ok" label="14:02 · ship list final" named/>
            <div style={{flex:1}}/>
            <span style={{
              fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-dim)', letterSpacing:'.04em',
            }}>+24 −7 lines · 312 → 329 words</span>
            <button style={{
              appearance:'none', border:0, cursor:'pointer',
              height:30, padding:'0 12px', borderRadius:7,
              background:'transparent', color:'var(--text)',
              boxShadow:'inset 0 0 0 1px var(--border-soft)',
              fontFamily:'var(--font-ui)', fontWeight:700, fontSize:12,
            }}>Restore 13:48</button>
            <button style={{
              appearance:'none', border:0, cursor:'pointer',
              height:30, padding:'0 12px', borderRadius:7,
              background:'var(--accent)', color:'#0C0C0E',
              fontFamily:'var(--font-ui)', fontWeight:700, fontSize:12,
            }}>Compare to current</button>
          </div>

          {/* split pane */}
          <div style={{flex:1, display:'flex', overflow:'hidden'}}>
            <DiffPane side="left" label="13:48 · auto-snap" tone="danger">
              <DiffLine n={1} kind="ctx">{'# weekend.md'}</DiffLine>
              <DiffLine n={2} kind="ctx">{''}</DiffLine>
              <DiffLine n={3} kind="ctx">The folded page does not need permission to be written on.</DiffLine>
              <DiffLine n={4} kind="del">Local-first is a vibe.</DiffLine>
              <DiffLine n={5} kind="ctx">{''}</DiffLine>
              <DiffLine n={6} kind="ctx">{'## ship sveska v0.1'}</DiffLine>
              <DiffLine n={7} kind="del">- ship the studio post</DiffLine>
              <DiffLine n={8} kind="del">- read selimović</DiffLine>
              <DiffLine n={9} kind="ctx">- ship v0.1</DiffLine>
              <DiffLine n={10} kind="ctx">{''}</DiffLine>
              <DiffLine n={11} kind="ctx">{'## notes'}</DiffLine>
              <DiffLine n={12} kind="ctx">The protagonist's relationship to time isn't sequential…</DiffLine>
            </DiffPane>
            <DiffPane side="right" label="14:02 · ship list final" tone="ok" named>
              <DiffLine n={1} kind="ctx">{'# weekend.md'}</DiffLine>
              <DiffLine n={2} kind="ctx">{''}</DiffLine>
              <DiffLine n={3} kind="ctx">The folded page does not need permission to be written on.</DiffLine>
              <DiffLine n={4} kind="add">Local-first means the app keeps working when the network does not.</DiffLine>
              <DiffLine n={5} kind="ctx">{''}</DiffLine>
              <DiffLine n={6} kind="ctx">{'## ship sveska v0.1'}</DiffLine>
              <DiffLine n={7} kind="add">- draft the studio post</DiffLine>
              <DiffLine n={8} kind="add">- ship sveska v0.1 — M0 + M1</DiffLine>
              <DiffLine n={9} kind="add">- read Selimović, chapter 3</DiffLine>
              <DiffLine n={10} kind="ctx">{''}</DiffLine>
              <DiffLine n={11} kind="ctx">{'## notes'}</DiffLine>
              <DiffLine n={12} kind="ctx">The protagonist's relationship to time isn't sequential…</DiffLine>
            </DiffPane>
          </div>
        </main>
      </div>
      <MNStatusBar
        left={<span style={{padding:'0 10px'}}>diff · +24 −7 lines · 17 words added</span>}
        right={<span style={{padding:'0 10px'}}>history · 7 snapshots · 14 m</span>}
      />
    </MNShell>
  );
}

function VersionItem({time, label, named, auto, first, selected}) {
  const isA = selected === 'a';
  const isB = selected === 'b';
  return (
    <div style={{
      padding:'10px 18px', cursor:'pointer',
      borderLeft: isA ? '3px solid var(--danger)' : isB ? '3px solid var(--ok)' : '3px solid transparent',
      background: (isA||isB) ? 'color-mix(in oklab, var(--surface) 60%, var(--bg) 40%)' : 'transparent',
      display:'flex', flexDirection:'column', gap:3,
    }}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
        <span style={{
          fontFamily:'var(--font-mono)', fontSize:12, color:'var(--text)', fontWeight: named ? 500 : 400,
          letterSpacing:'.02em',
        }}>{time}</span>
        {named && <span style={{
          fontFamily:'var(--font-mono)', fontSize:9.5, padding:'1px 5px', borderRadius:3,
          background:'color-mix(in oklab, var(--accent) 14%, transparent)', color:'var(--accent)',
          letterSpacing:'.06em', textTransform:'uppercase',
        }}>NAMED</span>}
        {auto && !named && <span style={{
          fontFamily:'var(--font-mono)', fontSize:9.5, color:'var(--text-dim)',
          letterSpacing:'.06em', textTransform:'uppercase',
        }}>auto</span>}
      </div>
      <div style={{
        fontFamily:'var(--font-ui)', fontSize:12, color: named?'var(--text)':'var(--text-dim)',
        lineHeight:1.3,
      }}>{label}</div>
      {first && <div style={{
        fontFamily:'var(--font-mono)', fontSize:9.5, color:'var(--text-dim)',
        letterSpacing:'.06em', textTransform:'uppercase',
      }}>first version</div>}
    </div>
  );
}

function VersionChip({color, label, named}) {
  const colorVar = color === 'danger' ? 'var(--danger)' : color === 'ok' ? 'var(--ok)' : 'var(--text-dim)';
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:8,
      padding:'4px 10px', borderRadius:6,
      background:'var(--surface)', boxShadow:`inset 0 0 0 1px ${colorVar}`,
      fontFamily:'var(--font-mono)', fontSize:12, color:'var(--text)',
    }}>
      <span style={{width:6, height:6, borderRadius:999, background:colorVar}}/>
      {label}
      {named && <span style={{
        fontSize:9, padding:'1px 5px', borderRadius:3,
        background:'color-mix(in oklab, var(--accent) 14%, transparent)', color:'var(--accent)',
        letterSpacing:'.06em', textTransform:'uppercase',
      }}>NAMED</span>}
    </span>
  );
}

function DiffPane({side, label, tone, named, children}) {
  const colorVar = tone === 'danger' ? 'var(--danger)' : tone === 'ok' ? 'var(--ok)' : 'var(--text-dim)';
  return (
    <div style={{
      flex:1, overflowY:'auto', display:'flex', flexDirection:'column',
      borderRight: side==='left' ? '1px solid var(--border-soft)' : 'none',
    }}>
      <div style={{
        padding:'10px 24px', display:'flex', alignItems:'center', gap:10,
        borderBottom:'1px solid var(--border-soft)',
        background:`color-mix(in oklab, ${colorVar} 6%, transparent)`,
        flexShrink:0,
      }}>
        <span style={{
          fontFamily:'var(--font-mono)', fontSize:10.5, letterSpacing:'.10em',
          textTransform:'uppercase', color:colorVar,
        }}>{side === 'left' ? 'A · older' : 'B · newer'}</span>
        <span style={{color:'var(--text)', fontFamily:'var(--font-mono)', fontSize:12}}>{label}</span>
        {named && <span style={{
          fontFamily:'var(--font-mono)', fontSize:9.5, padding:'1px 5px', borderRadius:3,
          background:'color-mix(in oklab, var(--accent) 14%, transparent)', color:'var(--accent)',
          letterSpacing:'.06em', textTransform:'uppercase',
        }}>NAMED</span>}
      </div>
      <div style={{flex:1, padding:'18px 0', fontFamily:'var(--font-mono)', fontSize:13.5, lineHeight:1.7}}>
        {children}
      </div>
    </div>
  );
}

function DiffLine({n, kind, children}) {
  const bg = kind==='add' ? 'color-mix(in oklab, var(--ok) 10%, transparent)'
           : kind==='del' ? 'color-mix(in oklab, var(--danger) 10%, transparent)'
           : 'transparent';
  const sign = kind==='add' ? '+' : kind==='del' ? '−' : ' ';
  const signColor = kind==='add' ? 'var(--ok)' : kind==='del' ? 'var(--danger)' : 'var(--text-dim)';
  const textStyle = kind==='del' ? {textDecoration:'line-through', textDecorationThickness:'.5px', color:'var(--text-dim)'} : {};
  return (
    <div style={{
      display:'flex', alignItems:'flex-start',
      background:bg, padding:'2px 0',
      borderLeft: kind==='add' ? '2px solid var(--ok)' : kind==='del' ? '2px solid var(--danger)' : '2px solid transparent',
    }}>
      <span style={{
        width:36, textAlign:'right', color:'var(--text-dim)', opacity:.5,
        paddingRight:10, userSelect:'none', fontVariantNumeric:'tabular-nums',
      }}>{n}</span>
      <span style={{
        width:18, textAlign:'center', color:signColor, userSelect:'none',
      }}>{sign}</span>
      <span style={{flex:1, paddingRight:24, color: kind==='ctx'?'var(--text)':'var(--text)', ...textStyle}}>
        {children || <span style={{opacity:0}}>·</span>}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SCREEN 5 — Session restore modal over dimmed shell
// ─────────────────────────────────────────────────────────────
function ScreenSessionRestore({crash=false}) {
  return (
    <div style={{
      ...MN_TOKENS.dark,
      width:'100%', height:'100%', position:'relative',
      background:'var(--bg)', color:'var(--text)',
      fontFamily:'var(--font-ui)', overflow:'hidden',
    }}>
      {/* dimmed background */}
      <div style={{
        position:'absolute', inset:0, filter:'blur(3px) saturate(.85)', opacity:.4,
        pointerEvents:'none',
      }}>
        <ScreenMultiNote/>
      </div>
      <div style={{position:'absolute', inset:0, background:'rgba(12,12,14,0.65)', pointerEvents:'none'}}/>

      {/* modal */}
      <div style={{
        position:'absolute', top:'50%', left:'50%', transform:'translate(-50%, -50%)',
        width:560,
        background:'var(--surface)', borderRadius:14,
        border: crash ? '1px solid var(--danger)' : '1px solid var(--border-soft)',
        boxShadow:'0 1px 0 rgba(255,255,255,.03), 0 28px 80px rgba(0,0,0,.6)',
        overflow:'hidden',
      }}>
        <div style={{padding:'22px 24px 6px'}}>
          {crash ? (
            <div style={{
              fontFamily:'var(--font-mono)', fontSize:11, letterSpacing:'.10em',
              textTransform:'uppercase', color:'var(--danger)', marginBottom:8,
              display:'inline-flex', alignItems:'center', gap:8,
            }}>
              <span style={{
                width:16, height:16, borderRadius:999,
                background:'color-mix(in oklab, var(--danger) 18%, transparent)',
                color:'var(--danger)',
                display:'inline-flex', alignItems:'center', justifyContent:'center',
                fontFamily:'var(--font-ui)', fontWeight:700, fontSize:11,
              }}>!</span>
              CRASH RECOVERY · 2 UNSAVED DRAFTS
            </div>
          ) : (
            <div style={{
              fontFamily:'var(--font-mono)', fontSize:11, letterSpacing:'.10em',
              textTransform:'uppercase', color:'var(--accent)', marginBottom:8,
            }}>SESSION · 3 TABS WERE OPEN</div>
          )}
          <h3 style={{
            margin:0, fontFamily:'var(--font-display)', fontWeight:700,
            fontSize:24, letterSpacing:'-0.018em', color:'var(--text)',
          }}>
            {crash
              ? <>Pick up where the crash <span style={{color:'var(--danger)'}}>cut you off</span>?</>
              : <>Continue where you <span style={{color:'var(--accent)'}}>left off</span>?</>}
          </h3>
        </div>
        <div style={{padding:'10px 24px 14px', color:'var(--text-dim)', fontSize:14, lineHeight:1.55}}>
          {crash
            ? <>Two drafts had unsaved changes when Sveska closed unexpectedly. The text was kept locally in IndexedDB — choose what to do with each.</>
            : <>Sveska remembers the last session. You closed 14 hours ago with 3 tabs open. Restore them, or start fresh.</>}
        </div>

        <div style={{padding:'0 18px 14px'}}>
          {crash ? (
            <>
              <RestoreRow
                title="studio post · draft"
                meta="last edited 3 m before crash · +124 words unsaved"
                tag="reading"
                action="recovered"
                checked
                danger
              />
              <RestoreRow
                title="weekend.md"
                meta="last edited 9 m before crash · +18 words unsaved"
                tag="draft"
                action="recovered"
                checked
                danger
              />
            </>
          ) : (
            <>
              <RestoreRow
                title="weekend.md"
                meta="active tab · last edited 14:02 yesterday"
                tag="draft"
                checked
              />
              <RestoreRow
                title="imports of Selimović"
                meta="last edited 11:30 yesterday"
                tag="reading"
                checked
              />
              <RestoreRow
                title="v0.1 ship list"
                meta="dirty · unsaved changes preserved"
                tag="ship"
                checked
                dirty
              />
            </>
          )}
        </div>

        <div style={{
          padding:'12px 20px 0', borderTop:'1px solid var(--border-soft)',
        }}>
          <label style={{
            display:'flex', alignItems:'center', gap:10, cursor:'pointer',
            padding:'10px 4px',
          }}>
            <span style={{
              width:22, height:14, borderRadius:999,
              background:'color-mix(in oklab, var(--accent) 60%, transparent)',
              position:'relative', flexShrink:0,
            }}>
              <span style={{
                position:'absolute', top:2, left:10, width:10, height:10,
                borderRadius:999, background:'var(--accent)',
              }}/>
            </span>
            <span style={{flex:1, fontFamily:'var(--font-ui)', fontSize:13, color:'var(--text)'}}>
              Always {crash ? 'recover drafts' : 'restore session'}
            </span>
            <span style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-dim)'}}>
              {crash ? '/settings/data' : '/settings/data'}
            </span>
          </label>
        </div>

        <div style={{
          display:'flex', justifyContent:'space-between', alignItems:'center',
          padding:'12px 18px', borderTop:'1px solid var(--border-soft)',
          background:'color-mix(in oklab, var(--bg) 60%, var(--surface))',
        }}>
          <button style={{
            appearance:'none', border:0, cursor:'pointer',
            height:36, padding:'0 14px', borderRadius:8,
            background:'transparent', color: crash ? 'var(--danger)' : 'var(--text)',
            boxShadow: crash ? 'inset 0 0 0 1px color-mix(in oklab, var(--danger) 40%, transparent)' : 'inset 0 0 0 1px var(--border-soft)',
            fontFamily:'var(--font-ui)', fontWeight:700, fontSize:13,
          }}>{crash ? 'Discard drafts' : 'Start fresh'}</button>
          <button style={{
            appearance:'none', border:0, cursor:'pointer',
            height:36, padding:'0 16px', borderRadius:8,
            background:'var(--accent)', color:'#0C0C0E',
            fontFamily:'var(--font-ui)', fontWeight:700, fontSize:13,
            display:'inline-flex', alignItems:'center', gap:8,
          }}>
            {crash ? 'Restore both drafts' : 'Open all 3 tabs'}
            <MKbd light>↵</MKbd>
          </button>
        </div>
      </div>
    </div>
  );
}

function RestoreRow({title, meta, tag, action, checked, danger, dirty}) {
  return (
    <label style={{
      display:'flex', alignItems:'center', gap:12,
      padding:'10px 12px', cursor:'pointer', borderRadius:8,
    }}>
      <span style={{
        width:18, height:18, borderRadius:5, flexShrink:0,
        background: checked ? 'var(--accent)' : 'transparent',
        border: checked ? '1.5px solid var(--accent)' : '1.5px solid var(--text-dim)',
        position:'relative',
      }}>
        {checked && <span style={{
          position:'absolute', left:3, top:1, width:9, height:5,
          borderLeft:'2px solid #0C0C0E', borderBottom:'2px solid #0C0C0E',
          transform:'rotate(-45deg)',
        }}/>}
      </span>
      <span style={{
        width:18, height:18, borderRadius:5, flexShrink:0,
        background:'var(--raised)',
        display:'inline-flex', alignItems:'center', justifyContent:'center',
        color:'var(--text-dim)',
      }}>
        <MIcon d="M6 3h9l3 3v15H6z" w={11} sw={1.5}/>
      </span>
      <span style={{flex:1, display:'flex', flexDirection:'column', gap:2, overflow:'hidden'}}>
        <span style={{
          fontFamily:'var(--font-ui)', fontWeight:500, fontSize:14, color:'var(--text)',
          display:'flex', alignItems:'center', gap:6,
        }}>
          {title}
          {dirty && <span style={{
            width:6, height:6, borderRadius:999, background:'var(--ai)',
            boxShadow:'0 0 0 2px color-mix(in oklab, var(--ai) 22%, transparent)',
          }}/>}
        </span>
        <span style={{
          fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-dim)', letterSpacing:'.02em',
        }}>{meta}</span>
      </span>
      <span style={{display:'inline-flex', gap:6, alignItems:'center'}}>
        <span style={{
          fontFamily:'var(--font-mono)', fontSize:10.5, padding:'1px 6px', borderRadius:4,
          background:'var(--raised)', color:'var(--text-dim)',
        }}>{tag}</span>
        {action && <span style={{
          fontFamily:'var(--font-mono)', fontSize:10.5, padding:'1px 6px', borderRadius:4,
          background: danger ? 'color-mix(in oklab, var(--danger) 14%, transparent)' : 'var(--raised)',
          color: danger ? 'var(--danger)' : 'var(--text-dim)',
          letterSpacing:'.04em', textTransform:'uppercase',
        }}>{action}</span>}
      </span>
    </label>
  );
}

Object.assign(window, {
  ScreenMultiNote, ScreenTagFilter, ScreenSearch, ScreenVersionDiff, ScreenSessionRestore,
});

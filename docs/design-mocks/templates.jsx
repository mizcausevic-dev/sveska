// templates.jsx — M3.4 templates picker + snippets manager.
// 2 artboards at 1440×900.

const TPL_DARK = {
  '--bg':'#0C0C0E','--surface':'#161619','--raised':'#222228',
  '--text':'#F4EFE6','--text-dim':'#B8B2A6',
  '--accent':'#F2B544','--accent-hover':'#EDA92E','--accent-press':'#C9871F',
  '--ai':'#4FD6C4','--ok':'#6FCF7F','--danger':'#E5604D',
  '--border-soft':'#222228',
  '--font-display':'"Bricolage Grotesque",system-ui,sans-serif',
  '--font-ui':'"Satoshi","Manrope",system-ui,sans-serif',
  '--font-mono':'"JetBrains Mono",ui-monospace,monospace',
};

const TIcon = ({d, w=14, sw=1.75, children}) => (
  <svg viewBox="0 0 24 24" width={w} height={w} fill="none" stroke="currentColor"
       strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    {d ? <path d={d}/> : children}
  </svg>
);
const TKbd = ({children, light}) => (
  <span style={{
    fontFamily:'var(--font-mono)', fontSize:10.5, padding:'1px 6px',
    borderRadius:5, background: light?'rgba(0,0,0,.18)':'var(--raised)',
    color: light?'inherit':'var(--text-dim)', letterSpacing:'.04em',
  }}>{children}</span>
);

function TShell({children}) {
  return (
    <div style={{
      ...TPL_DARK, width:'100%', height:'100%', position:'relative',
      background:'var(--bg)', color:'var(--text)',
      fontFamily:'var(--font-ui)',
      display:'flex', flexDirection:'column', overflow:'hidden',
    }}>{children}</div>
  );
}

// ╔════════════════════════════════════════════════════════════╗
// ║ SCREEN 1 — Templates picker over the dimmed shell           ║
// ╚════════════════════════════════════════════════════════════╝
function ScreenTemplates() {
  return (
    <TShell>
      {/* faint shell underneath */}
      <div style={{
        position:'absolute', inset:0, padding:0, opacity:.34, filter:'blur(2px)',
        pointerEvents:'none',
      }}>
        <div style={{height:44, background:'var(--bg)', borderBottom:'1px solid var(--border-soft)'}}/>
        <div style={{height:36, background:'var(--surface)', borderBottom:'1px solid var(--border-soft)'}}/>
        <div style={{height:56, background:'var(--bg)', borderBottom:'1px solid var(--border-soft)'}}/>
        <div style={{flex:1, padding:'64px 96px'}}>
          <div style={{maxWidth:880, fontFamily:'var(--font-mono)', fontSize:15, lineHeight:1.75, color:'var(--text-dim)'}}>
            <span style={{color:'var(--accent)'}}># weekend.md</span><br/>
            <span style={{color:'var(--text-dim)'}}>—</span>
          </div>
        </div>
      </div>
      <div style={{position:'absolute', inset:0, background:'rgba(12,12,14,0.62)', pointerEvents:'none'}}/>

      {/* main picker */}
      <div style={{
        position:'absolute', top:'50%', left:'50%', transform:'translate(-50%, -50%)',
        width:1080, height:720,
        background:'var(--surface)', borderRadius:14,
        border:'1px solid var(--border-soft)',
        boxShadow:'0 1px 0 rgba(255,255,255,.03), 0 28px 80px rgba(0,0,0,.65)',
        overflow:'hidden',
        display:'flex',
      }}>
        {/* left rail — categories */}
        <aside style={{
          width:240, flexShrink:0, background:'var(--bg)',
          borderRight:'1px solid var(--border-soft)',
          padding:'22px 12px', display:'flex', flexDirection:'column',
        }}>
          <div style={{
            fontFamily:'var(--font-mono)', fontSize:10.5, letterSpacing:'.12em',
            textTransform:'uppercase', color:'var(--accent)', padding:'4px 12px 12px',
          }}>NEW NOTE FROM TEMPLATE</div>

          <div style={{
            display:'flex', alignItems:'center', gap:10,
            background:'var(--surface)', height:32, borderRadius:8, padding:'0 12px',
            boxShadow:'inset 0 0 0 1px var(--border-soft)',
            color:'var(--text-dim)', margin:'0 4px 14px',
          }}>
            <TIcon w={13}><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></TIcon>
            <span style={{flex:1, fontFamily:'var(--font-ui)', fontSize:12}}>filter…</span>
            <TKbd>/</TKbd>
          </div>

          {[
            ['all', 'All templates', 12, true],
            ['meeting', 'Meetings', 4],
            ['writing', 'Writing', 3],
            ['planning', 'Planning', 3],
            ['daily', 'Daily', 2],
            ['custom', 'Custom · yours', 0],
          ].map(([id, label, n, on])=>(
            <button key={id} style={{
              appearance:'none', border:0, cursor:'pointer', textAlign:'left',
              display:'flex', alignItems:'center', gap:10,
              padding:'8px 12px', borderRadius:7,
              background: on ? 'color-mix(in oklab, var(--accent) 14%, transparent)' : 'transparent',
              color:'var(--text)',
              fontFamily:'var(--font-ui)', fontSize:13, fontWeight:500,
            }}>
              <span style={{
                width:6, height:6, borderRadius:999,
                background: on ? 'var(--accent)' : 'transparent',
                outline: on ? 'none' : '1px solid var(--border-soft)',
              }}/>
              <span style={{flex:1}}>{label}</span>
              <span style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-dim)'}}>{n}</span>
            </button>
          ))}

          <div style={{flex:1}}/>

          <div style={{
            margin:'14px 4px 0', padding:'10px 12px', borderRadius:8,
            background:'color-mix(in oklab, var(--ai) 12%, transparent)',
            boxShadow:'inset 0 0 0 1px color-mix(in oklab, var(--ai) 40%, transparent)',
            fontFamily:'var(--font-mono)', fontSize:11, color:'var(--ai)',
            letterSpacing:'.04em',
            display:'flex', flexDirection:'column', gap:4,
          }}>
            <span style={{textTransform:'uppercase', fontSize:9.5, letterSpacing:'.10em'}}>✦ AI · GENERATE</span>
            <span style={{color:'var(--text)', fontFamily:'var(--font-ui)', fontSize:12, lineHeight:1.4}}>
              Describe what you want; we'll draft a template for it.
            </span>
          </div>
        </aside>

        {/* grid of templates */}
        <main style={{flex:1, display:'flex', flexDirection:'column', overflow:'hidden'}}>
          <div style={{
            display:'flex', alignItems:'center', padding:'20px 28px 12px',
            borderBottom:'1px solid var(--border-soft)',
          }}>
            <div>
              <div style={{
                fontFamily:'var(--font-display)', fontWeight:700, fontSize:24,
                letterSpacing:'-0.018em', color:'var(--text)', lineHeight:1,
              }}>Pick a starting point.</div>
              <div style={{
                fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-dim)',
                letterSpacing:'.04em', marginTop:6,
              }}>12 templates · 3 starred · used 184× this month</div>
            </div>
            <div style={{flex:1}}/>
            <span style={{
              fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-dim)',
              padding:'0 8px',
            }}>SORT</span>
            <button style={{
              appearance:'none', border:0, background:'var(--bg)', cursor:'pointer',
              height:30, padding:'0 12px', borderRadius:7,
              boxShadow:'inset 0 0 0 1px var(--border-soft)',
              fontFamily:'var(--font-ui)', fontSize:12, color:'var(--text)',
              display:'inline-flex', alignItems:'center', gap:8,
            }}>
              Most used <TIcon d="M6 9l6 6 6-6" w={11} sw={2}/>
            </button>
            <button style={{
              appearance:'none', border:0, cursor:'pointer', marginLeft:10,
              height:30, width:30, borderRadius:7, color:'var(--text-dim)',
              background:'transparent',
              display:'inline-flex', alignItems:'center', justifyContent:'center',
            }}>
              <TIcon d="M6 6l12 12M18 6L6 18" w={14} sw={2}/>
            </button>
          </div>

          <div style={{
            flex:1, padding:24, overflow:'auto',
            display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:14, alignContent:'start',
          }}>
            <TemplateCard
              icon="users" name="Meeting · 1:1" kind="meeting"
              desc="Pre-read · agenda · notes · actions. Names auto-fill from calendar."
              used={42} starred
              shortcut={['⌘','⇧','M']}
              active
            />
            <TemplateCard
              icon="users" name="Meeting · team" kind="meeting"
              desc="Agenda · decisions · risks · owners. Roll-up table at the end."
              used={18}
            />
            <TemplateCard
              icon="users" name="Meeting · customer call" kind="meeting"
              desc="Context · questions · quotes · follow-ups · close."
              used={11} starred
            />

            <TemplateCard
              icon="edit" name="Studio post" kind="writing"
              desc="Working title · lede · 3 beats · pull-quote · close. With word goal."
              used={9}
            />
            <TemplateCard
              icon="edit" name="Field note" kind="writing"
              desc="One observation. One opinion. One question. 200 words, max."
              used={14}
            />
            <TemplateCard
              icon="edit" name="Reading note" kind="writing"
              desc="Title · author · highlights · marginalia · my reaction · cites."
              used={6}
            />

            <TemplateCard
              icon="target" name="Daily standup" kind="daily"
              desc="Yesterday · today · blocked? · capture · review yesterday's notes."
              used={31} starred
            />
            <TemplateCard
              icon="target" name="Weekly review" kind="planning"
              desc="What shipped · what slipped · next week's 3. Auto-tags last week."
              used={12}
            />
            <TemplateCard
              icon="target" name="OKR draft" kind="planning"
              desc="Objective · 3 KRs · confidence · check-ins. With % progress."
              used={4}
            />

            <TemplateCard
              icon="zap" name="Quick capture" kind="daily"
              desc="One sentence. Go. Lands in inbox until processed."
              used={47}
              shortcut={['⌘','⇧','N']}
            />
            <TemplateCard
              icon="bookmark" name="Brand brief" kind="planning"
              desc="Audience · feeling · don'ts · references · approval column."
              used={2}
            />
            <TemplateCard
              icon="plus" name="Blank · just a heading" kind="meeting"
              desc="Empty page with a title and a date stamp. The default."
              used={184}
              shortcut={['⌘','N']}
            />
          </div>

          <div style={{
            display:'flex', justifyContent:'space-between', alignItems:'center',
            padding:'14px 24px',
            borderTop:'1px solid var(--border-soft)',
            background:'color-mix(in oklab, var(--bg) 60%, var(--surface))',
          }}>
            <div style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-dim)', letterSpacing:'.04em', display:'inline-flex', alignItems:'center', gap:10}}>
              <span>SELECTED · <span style={{color:'var(--accent)'}}>Meeting · 1:1</span></span>
              <span>·</span>
              <span>10 placeholders · 8 fields</span>
            </div>
            <div style={{display:'flex', gap:10}}>
              <button style={ghostBtn()}>Manage templates <TKbd>⌘.</TKbd></button>
              <button style={ghostBtn()}>Preview <TKbd>space</TKbd></button>
              <button style={primaryBtn()}>
                Create note from template
                <TKbd light>⌘↵</TKbd>
              </button>
            </div>
          </div>
        </main>
      </div>
    </TShell>
  );
}

function TemplateCard({icon, name, kind, desc, used, starred, shortcut, active}) {
  const icons = {
    users:    'M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0zM3 21a7 7 0 0 1 14 0M17 7a3 3 0 1 1 0 6M21 21a5 5 0 0 0-3-4.6',
    edit:     'M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z',
    target:   'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 6v6l4 2',
    zap:      'M13 2L3 14h7l-1 8 10-12h-7z',
    bookmark: 'M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z',
    plus:     'M12 5v14M5 12h14',
  };
  return (
    <div style={{
      background: active ? 'color-mix(in oklab, var(--accent) 12%, transparent)' : 'var(--bg)',
      border: active ? '1.5px solid var(--accent)' : '1px solid var(--border-soft)',
      borderRadius:10, padding:'16px 18px',
      display:'flex', flexDirection:'column', gap:10,
      cursor:'pointer', minHeight:140,
      position:'relative',
    }}>
      <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8}}>
        <div style={{
          width:30, height:30, borderRadius:8,
          background: active ? 'var(--accent)' : 'var(--raised)',
          color: active ? '#0C0C0E' : 'var(--text-dim)',
          display:'inline-flex', alignItems:'center', justifyContent:'center', flexShrink:0,
        }}>
          <TIcon d={icons[icon]} w={15} sw={1.6}/>
        </div>
        {starred && (
          <span style={{color:'var(--accent)'}}>
            <TIcon d="M12 2l3 6 6 1-4.5 4.5L18 20l-6-3.5L6 20l1.5-6.5L3 9l6-1z" w={13} sw={1.5}/>
          </span>
        )}
      </div>
      <h4 style={{
        margin:0, fontFamily:'var(--font-display)', fontWeight:700, fontSize:16,
        letterSpacing:'-0.015em', color:'var(--text)', lineHeight:1.15,
      }}>{name}</h4>
      <p style={{
        margin:0, color:'var(--text-dim)', fontSize:12.5, lineHeight:1.5,
        flex:1,
      }}>{desc}</p>
      <div style={{
        display:'flex', justifyContent:'space-between', alignItems:'center',
        marginTop:2, paddingTop:8, borderTop:'1px solid var(--border-soft)',
      }}>
        <span style={{
          fontFamily:'var(--font-mono)', fontSize:10.5, color:'var(--text-dim)', letterSpacing:'.04em',
        }}>{used}× used · {kind}</span>
        {shortcut && (
          <span style={{display:'inline-flex', gap:3}}>
            {shortcut.map((k,i)=>(
              <span key={i} style={{
                fontFamily:'var(--font-mono)', fontSize:9.5, padding:'1px 5px', borderRadius:4,
                background:'var(--raised)', color:'var(--text-dim)', letterSpacing:'.04em',
              }}>{k}</span>
            ))}
          </span>
        )}
      </div>
    </div>
  );
}

function primaryBtn() {
  return {
    appearance:'none', border:0, cursor:'pointer',
    height:36, padding:'0 16px', borderRadius:8,
    background:'var(--accent)', color:'#0C0C0E',
    fontFamily:'var(--font-ui)', fontWeight:700, fontSize:13,
    display:'inline-flex', alignItems:'center', gap:8,
  };
}
function ghostBtn() {
  return {
    appearance:'none', border:0, cursor:'pointer',
    height:36, padding:'0 14px', borderRadius:8,
    background:'transparent', color:'var(--text)',
    boxShadow:'inset 0 0 0 1px var(--border-soft)',
    fontFamily:'var(--font-ui)', fontWeight:700, fontSize:13,
    display:'inline-flex', alignItems:'center', gap:8,
  };
}

// ╔════════════════════════════════════════════════════════════╗
// ║ SCREEN 2 — Snippets manager (settings panel)                ║
// ╚════════════════════════════════════════════════════════════╝
function ScreenSnippets() {
  return (
    <TShell>
      <div style={{
        height:44, flexShrink:0, background:'var(--bg)',
        borderBottom:'1px solid var(--border-soft)',
        display:'flex', alignItems:'center', gap:14, padding:'0 16px',
      }}>
        <div style={{display:'flex', gap:8}}>
          <span style={{width:12,height:12,borderRadius:999,background:'#ff5f57'}}/>
          <span style={{width:12,height:12,borderRadius:999,background:'#febc2e'}}/>
          <span style={{width:12,height:12,borderRadius:999,background:'#28c840'}}/>
        </div>
        <div style={{width:1, height:18, background:'var(--border-soft)'}}/>
        <span style={{fontFamily:'var(--font-mono)', fontSize:11.5, color:'var(--text-dim)', letterSpacing:'.06em'}}>
          <span style={{color:'var(--text)'}}>sveska</span> · settings · snippets
        </span>
        <div style={{flex:1}}/>
        <span style={{
          fontFamily:'var(--font-mono)', fontSize:11, color:'var(--ok)',
          letterSpacing:'.04em', display:'inline-flex', gap:6, alignItems:'center',
        }}>
          <span style={{width:6, height:6, borderRadius:999, background:'var(--ok)'}}/>
          Saved · 2s ago
        </span>
      </div>

      <div style={{flex:1, display:'flex', overflow:'hidden'}}>
        {/* nav rail (same as settings) */}
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
            ['canvas','Canvas'],
            ['templates','Templates & snippets', true],
            ['data','Data · backup'],
            ['keyboard','Keyboard'],
            ['about','About'],
          ].map(([id,label,on])=>(
            <div key={id} style={{
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
            </div>
          ))}
        </aside>

        <main style={{flex:1, display:'flex', overflow:'hidden'}}>
          {/* snippets list */}
          <div style={{flex:'0 0 460px', borderRight:'1px solid var(--border-soft)', display:'flex', flexDirection:'column', overflow:'hidden'}}>
            <div style={{padding:'24px 28px 16px', borderBottom:'1px solid var(--border-soft)'}}>
              <div style={{
                fontFamily:'var(--font-mono)', fontSize:11, letterSpacing:'.12em',
                textTransform:'uppercase', color:'var(--accent)', marginBottom:6,
              }}>SNIPPETS · M3.4</div>
              <h2 style={{
                margin:'0 0 4px',
                fontFamily:'var(--font-display)', fontWeight:700, fontSize:24,
                letterSpacing:'-0.018em', color:'var(--text)',
              }}>Type once. Use forever.</h2>
              <p style={{margin:0, color:'var(--text-dim)', fontSize:13, lineHeight:1.5}}>
                Triggers are typed in the editor. Hit space or tab to expand. Stored locally.
              </p>
            </div>

            <div style={{padding:'12px 18px 8px', display:'flex', gap:8}}>
              <div style={{
                flex:1, display:'flex', alignItems:'center', gap:10,
                background:'var(--bg)', height:32, borderRadius:7, padding:'0 12px',
                boxShadow:'inset 0 0 0 1px var(--border-soft)',
                color:'var(--text-dim)',
              }}>
                <TIcon w={13}><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></TIcon>
                <span style={{flex:1, fontFamily:'var(--font-ui)', fontSize:12.5}}>filter · 14 snippets</span>
              </div>
              <button style={{
                appearance:'none', border:0, cursor:'pointer',
                height:32, padding:'0 12px', borderRadius:7,
                background:'var(--accent)', color:'#0C0C0E',
                fontFamily:'var(--font-ui)', fontWeight:700, fontSize:12,
                display:'inline-flex', alignItems:'center', gap:6,
              }}>
                <TIcon d="M12 5v14M5 12h14" w={13} sw={2}/>
                New
              </button>
            </div>

            <div style={{flex:1, overflow:'auto', padding:'4px 0'}}>
              <SnippetRow trigger=":wkd" name="weekend date" preview="Saturday, May 16 — Sunday, May 17" used={84} dyn/>
              <SnippetRow trigger=":em" name="email" preview="miz@sveska.studio" used={51}/>
              <SnippetRow trigger=":sig" name="signature" preview="— Miz · sveska.studio · sarajevo+brooklyn" used={42}/>
              <SnippetRow trigger=":todo" name="todo line" preview="- [ ] " used={211} selected/>
              <SnippetRow trigger=":head" name="heading 1" preview="# {{title}}\n\n" used={94}/>
              <SnippetRow trigger=":mtg" name="meeting block" preview="## Meeting · {{date}}\n\n**Attendees**: \n**Agenda**:\n- …" used={28}/>
              <SnippetRow trigger=":ld" name="lorem (short)" preview="Lorem ipsum dolor sit amet, consectetur adipiscing elit…" used={6}/>
              <SnippetRow trigger=":fix" name="claude fix" preview="/improve · tighten this paragraph" used={37} ai/>
              <SnippetRow trigger=":sum" name="claude summarize" preview="/summarize · 3 bullets" used={19} ai/>
              <SnippetRow trigger=":sevdah" name="glossary · sevdah" preview="sevdah /ˈsɛʋdah/" used={4}/>
              <SnippetRow trigger=":box" name="callout box" preview="> **Note** — …" used={11}/>
            </div>

            <div style={{
              padding:'12px 18px', borderTop:'1px solid var(--border-soft)',
              fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-dim)',
              letterSpacing:'.04em',
              display:'flex', justifyContent:'space-between', alignItems:'center',
            }}>
              <span>14 snippets · 9 manual · 5 dynamic · {`{{date}}`} resolves at expand</span>
              <button style={{
                appearance:'none', border:0, cursor:'pointer', background:'transparent',
                color:'var(--text-dim)', fontFamily:'var(--font-mono)', fontSize:11,
                letterSpacing:'.04em',
              }}>Import / Export · .json</button>
            </div>
          </div>

          {/* edit pane */}
          <div style={{flex:1, padding:'24px 32px', overflow:'auto', display:'flex', flexDirection:'column'}}>
            <div style={{display:'flex', alignItems:'center', gap:14, marginBottom:18}}>
              <div style={{
                fontFamily:'var(--font-mono)', fontSize:10.5, letterSpacing:'.12em',
                textTransform:'uppercase', color:'var(--accent)',
              }}>EDITING · :todo</div>
              <div style={{flex:1}}/>
              <span style={{
                fontFamily:'var(--font-mono)', fontSize:11, color:'var(--ok)',
                letterSpacing:'.04em', display:'inline-flex', alignItems:'center', gap:6,
              }}>
                <span style={{width:6, height:6, borderRadius:999, background:'var(--ok)'}}/>
                auto-saved · 211× used
              </span>
            </div>

            <div style={{
              display:'grid', gridTemplateColumns:'1fr 1fr', gap:18, marginBottom:18,
            }}>
              <Field label="Trigger" hint="Typed in the editor. No spaces; starts with : by convention.">
                <input value=":todo" readOnly style={{
                  appearance:'none', border:0, outline:0,
                  background:'var(--bg)', boxShadow:'inset 0 0 0 1px var(--accent)',
                  fontFamily:'var(--font-mono)', fontSize:14, color:'var(--accent)',
                  padding:'10px 14px', borderRadius:8, width:'100%',
                }}/>
              </Field>
              <Field label="Name" hint="What you see in the picker. Not typed.">
                <input value="todo line" readOnly style={{
                  appearance:'none', border:0, outline:0,
                  background:'var(--bg)', boxShadow:'inset 0 0 0 1px var(--border-soft)',
                  fontFamily:'var(--font-ui)', fontSize:14, color:'var(--text)',
                  padding:'10px 14px', borderRadius:8, width:'100%',
                }}/>
              </Field>
            </div>

            <Field label="Expansion" hint="Multi-line. Use {{date}}, {{time}}, {{cursor}}, {{title}} for dynamic insertion.">
              <div style={{
                background:'var(--bg)', borderRadius:8,
                boxShadow:'inset 0 0 0 1px var(--border-soft)',
                padding:'14px 16px',
                fontFamily:'var(--font-mono)', fontSize:13.5, lineHeight:1.7, color:'var(--text)',
                minHeight:140,
              }}>
                - [ ] <span style={{
                  display:'inline-block', width:2, height:'1em',
                  background:'var(--accent)', verticalAlign:'-2px',
                  animation:'tpl-caret 1.1s steps(1) infinite',
                }}/>
              </div>
              <style>{`@keyframes tpl-caret { 50%{opacity:0} }`}</style>
              <div style={{marginTop:8, display:'flex', gap:6, flexWrap:'wrap'}}>
                {['{{date}}','{{time}}','{{cursor}}','{{title}}','{{selection}}','{{author}}'].map(v=>(
                  <span key={v} style={{
                    fontFamily:'var(--font-mono)', fontSize:11, padding:'4px 8px', borderRadius:5,
                    background:'color-mix(in oklab, var(--ai) 14%, transparent)', color:'var(--ai)',
                    letterSpacing:'.02em', cursor:'pointer',
                  }}>{v}</span>
                ))}
              </div>
            </Field>

            <div style={{
              display:'grid', gridTemplateColumns:'1fr 1fr', gap:18, marginTop:18,
            }}>
              <Field label="Trigger style" hint="When does this snippet fire?">
                <div style={{display:'inline-flex', background:'var(--raised)', borderRadius:7, padding:2}}>
                  {[['space',true],['tab',false],['enter',false],['manual',false]].map(([t,on])=>(
                    <span key={t} style={{
                      padding:'6px 12px', borderRadius:5,
                      background: on ? 'var(--surface)' : 'transparent',
                      color: on ? 'var(--text)' : 'var(--text-dim)',
                      fontFamily:'var(--font-mono)', fontSize:11, letterSpacing:'.04em',
                      cursor:'pointer',
                    }}>{t}</span>
                  ))}
                </div>
              </Field>
              <Field label="Place caret after expand" hint="Where the cursor lands; {{cursor}} overrides.">
                <div style={{display:'inline-flex', background:'var(--raised)', borderRadius:7, padding:2}}>
                  {[['end',true],['start',false],['inside',false]].map(([t,on])=>(
                    <span key={t} style={{
                      padding:'6px 12px', borderRadius:5,
                      background: on ? 'var(--surface)' : 'transparent',
                      color: on ? 'var(--text)' : 'var(--text-dim)',
                      fontFamily:'var(--font-mono)', fontSize:11, letterSpacing:'.04em',
                      cursor:'pointer',
                    }}>{t}</span>
                  ))}
                </div>
              </Field>
            </div>

            <Field label="Scope" hint="Limit when this snippet fires." style={{marginTop:18}}>
              <div style={{display:'flex', flexWrap:'wrap', gap:6}}>
                <Chip on>everywhere</Chip>
                <Chip>checklist mode only</Chip>
                <Chip>markdown only</Chip>
                <Chip>tag · meeting</Chip>
                <Chip>tag · writing</Chip>
              </div>
            </Field>

            <div style={{flex:1}}/>

            <div style={{
              marginTop:18, padding:'14px 16px', borderRadius:10,
              background:'color-mix(in oklab, var(--ai) 10%, transparent)',
              boxShadow:'inset 0 0 0 1px color-mix(in oklab, var(--ai) 40%, transparent)',
              display:'flex', alignItems:'flex-start', gap:12,
            }}>
              <span style={{
                width:22, height:22, borderRadius:6, flexShrink:0,
                background:'color-mix(in oklab, var(--ai) 18%, transparent)', color:'var(--ai)',
                display:'inline-flex', alignItems:'center', justifyContent:'center',
              }}>
                <TIcon d="M12 2l2.3 5.3L20 9.5l-4.5 3.8L17 19l-5-3-5 3 1.5-5.7L4 9.5l5.7-2.2z" w={12} sw={1.4}/>
              </span>
              <div style={{flex:1}}>
                <div style={{
                  fontFamily:'var(--font-mono)', fontSize:10.5, letterSpacing:'.10em',
                  textTransform:'uppercase', color:'var(--ai)', marginBottom:4,
                }}>LIVE PREVIEW · ‹editor›</div>
                <div style={{
                  fontFamily:'var(--font-mono)', fontSize:13, color:'var(--text)',
                  background:'var(--bg)', padding:'10px 12px', borderRadius:7,
                  boxShadow:'inset 0 0 0 1px var(--border-soft)',
                }}>
                  Type <span style={{color:'var(--accent)'}}>:todo</span><span style={{color:'var(--text-dim)'}}>·</span>space → expands to <span style={{color:'var(--text-dim)'}}>"</span><span style={{color:'var(--text)'}}>- [ ] </span><span style={{
                    display:'inline-block', width:2, height:'1em',
                    background:'var(--accent)', verticalAlign:'-2px',
                    animation:'tpl-caret 1.1s steps(1) infinite',
                  }}/><span style={{color:'var(--text-dim)'}}>"</span>
                </div>
              </div>
            </div>

            <div style={{
              display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:14,
            }}>
              <button style={{
                appearance:'none', border:0, cursor:'pointer',
                height:34, padding:'0 14px', borderRadius:8,
                background:'transparent', color:'var(--danger)',
                boxShadow:'inset 0 0 0 1px color-mix(in oklab, var(--danger) 40%, transparent)',
                fontFamily:'var(--font-ui)', fontWeight:700, fontSize:12.5,
              }}>Delete snippet</button>
              <div style={{display:'flex', gap:10}}>
                <button style={ghostBtn()}>Duplicate</button>
                <button style={ghostBtn()}>Test in editor →</button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </TShell>
  );
}

function SnippetRow({trigger, name, preview, used, selected, ai, dyn}) {
  return (
    <div style={{
      padding:'10px 18px', cursor:'pointer',
      background: selected ? 'color-mix(in oklab, var(--accent) 12%, transparent)' : 'transparent',
      borderLeft: selected ? '2px solid var(--accent)' : '2px solid transparent',
      display:'flex', flexDirection:'column', gap:4,
    }}>
      <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between', gap:10}}>
        <span style={{display:'flex', alignItems:'baseline', gap:10}}>
          <span style={{
            fontFamily:'var(--font-mono)', fontSize:13, color: selected ? 'var(--accent)' : 'var(--accent)',
            letterSpacing:'.02em', fontWeight:500,
          }}>{trigger}</span>
          <span style={{fontFamily:'var(--font-ui)', fontSize:13, color:'var(--text)'}}>{name}</span>
          {ai && <span style={{
            fontFamily:'var(--font-mono)', fontSize:9.5, padding:'1px 6px', borderRadius:3,
            background:'color-mix(in oklab, var(--ai) 16%, transparent)', color:'var(--ai)',
            letterSpacing:'.06em', textTransform:'uppercase',
          }}>AI</span>}
          {dyn && <span style={{
            fontFamily:'var(--font-mono)', fontSize:9.5, padding:'1px 6px', borderRadius:3,
            background:'var(--raised)', color:'var(--text-dim)',
            letterSpacing:'.06em', textTransform:'uppercase',
          }}>DYNAMIC</span>}
        </span>
        <span style={{fontFamily:'var(--font-mono)', fontSize:10.5, color:'var(--text-dim)', letterSpacing:'.04em'}}>{used}×</span>
      </div>
      <div style={{
        fontFamily:'var(--font-mono)', fontSize:11.5, color:'var(--text-dim)', lineHeight:1.4,
        whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
      }}>{preview}</div>
    </div>
  );
}

function Field({label, hint, children, style}) {
  return (
    <div style={{display:'flex', flexDirection:'column', gap:6, ...style}}>
      <label style={{fontFamily:'var(--font-mono)', fontSize:10.5, letterSpacing:'.10em', textTransform:'uppercase', color:'var(--text-dim)'}}>{label}</label>
      {hint && <span style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-dim)', letterSpacing:'.02em', marginBottom:2}}>{hint}</span>}
      {children}
    </div>
  );
}
function Chip({children, on}) {
  return (
    <span style={{
      fontFamily:'var(--font-mono)', fontSize:11.5, padding:'5px 11px', borderRadius:999,
      background: on ? 'var(--accent)' : 'transparent',
      color: on ? '#0C0C0E' : 'var(--text-dim)',
      boxShadow: on ? 'none' : 'inset 0 0 0 1px var(--border-soft)',
      cursor:'pointer', letterSpacing:'.02em',
    }}>{children}</span>
  );
}

Object.assign(window, { ScreenTemplates, ScreenSnippets });

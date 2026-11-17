const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const base=process.env.PORTFOLIO_URL||'http://127.0.0.1:8000/';
const out=path.resolve(process.env.TEST_OUTPUT_DIR||'local_docs/motion-qa');
fs.mkdirSync(out,{recursive:true});

const MOTION_KEY='portfolio-motion-v1';
const APPEARANCE_KEY='portfolio-appearance';
const PAUSED='{"mode":"paused"}';
const DESKTOP={width:1440,height:1000};
const PHONE={width:390,height:844};
const WIDTHS=[320,390,768,1024,1440,1920];
const REVEAL_SELECTORS=['.hero-copy > *','.section-heading > p','.role-record','.paper-record','.project-record','.education-entry','.contact-address','.contact-actions','.contact-links'];
const MODES={
 on:{motion:true,text:'Pause motion',disabled:false},
 paused:{motion:false,text:'Play motion',disabled:false},
 reduced:{motion:false,text:'Motion reduced by system setting',disabled:true},
 noanim:{motion:false,text:'Motion off for this view',disabled:true},
};
const errors=[];

function watch(page,{ignoreConsole=false}={}){
 page.on('pageerror',e=>errors.push('pageerror: '+e.message));
 if(!ignoreConsole)page.on('console',m=>{if(m.type()==='error')errors.push('console: '+m.text())});
}

async function withSession(browser,opts,run){
 const context=await browser.newContext({
  viewport:opts.viewport||DESKTOP,
  colorScheme:'light',
  reducedMotion:opts.reducedMotion||'no-preference',
  javaScriptEnabled:opts.javaScriptEnabled!==false,
 });
 context.setDefaultTimeout(10000);
 if(opts.stored!==undefined)await context.addInitScript(({key,raw})=>{try{localStorage.setItem(key,raw)}catch(e){}},{key:MOTION_KEY,raw:opts.stored});
 if(opts.blocked)await context.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Storage unavailable','SecurityError')}}));
 context.on('page',page=>watch(page,opts));
 const page=await context.newPage();
 try{await run({context,page})}finally{await context.close()}
}

const settle=page=>page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
const gotoOnly=(page,suffix='')=>page.goto(base+suffix,{waitUntil:'load'});
const motionOn=page=>page.evaluate(()=>document.documentElement.classList.contains('motion-on'));
const storedRaw=(page,key)=>page.evaluate(k=>localStorage.getItem(k),key);
const opacityOf=(page,selector)=>page.locator(selector).first().evaluate(el=>getComputedStyle(el).opacity);

function waitBound(page){
 return page.waitForFunction(()=>{const t=document.querySelector('button[data-motion-toggle]');return Boolean(t)&&!t.hidden});
}

async function loadView(page,suffix=''){
 await gotoOnly(page,suffix);
 await page.evaluate(()=>document.fonts.ready);
 await waitBound(page);
}

function toggleState(page){
 return page.evaluate(()=>{
  const t=document.querySelector('button[data-motion-toggle]');
  return {text:t.textContent.trim(),disabled:t.disabled,hidden:t.hidden,inPanel:Boolean(t.closest('.appearance-panel'))};
 });
}

async function revealReport(page,{transform}){
 return page.evaluate(({transform})=>{
  const identity=['none','matrix(1, 0, 0, 1, 0, 0)'];
  const all=[...document.querySelectorAll('[data-reveal]')];
  const stuck=all.filter(el=>{
   const s=getComputedStyle(el);
   return s.opacity!=='1'||(transform&&!identity.includes(s.transform));
  }).map(el=>el.id||el.className||el.tagName);
  return {total:all.length,stuckCount:stuck.length,sample:stuck.slice(0,5).join(', ')};
 },{transform});
}

async function assertAllVisible(page,label,{transform=false}={}){
 const r=await revealReport(page,{transform});
 assert.ok(r.total>0,`${label}: the page carries data-reveal elements`);
 assert.equal(r.stuckCount,0,`${label}: ${r.stuckCount} of ${r.total} data-reveal elements are not fully visible (${r.sample})`);
}

async function assertMode(page,mode,label){
 const want=MODES[mode];
 assert.equal(await motionOn(page),want.motion,`${label}: html motion-on presence`);
 assert.deepEqual(await toggleState(page),{text:want.text,disabled:want.disabled,hidden:false,inPanel:true},`${label}: motion toggle text and state`);
 if(!want.motion)await assertAllVisible(page,`${label}: static page`,{transform:true});
}

function rendered(page,selector){
 return page.locator(selector).first().evaluate(el=>{
  const s=getComputedStyle(el);
  const r=el.getBoundingClientRect();
  return s.display!=='none'&&s.visibility!=='hidden'&&s.opacity!=='0'&&r.width>0&&r.height>0;
 });
}

function scaleX(page,selector){
 return page.evaluate(sel=>{
  const cs=getComputedStyle(document.querySelector(sel));
  if(cs.scale&&cs.scale!=='none')return parseFloat(cs.scale);
  return new DOMMatrix(cs.transform).a;
 },selector);
}

function jumpTo(page,selector){
 return page.evaluate(sel=>{
  const el=document.querySelector(sel);
  scrollTo({top:el.getBoundingClientRect().top+scrollY-innerHeight*0.25,behavior:'instant'});
 },selector);
}

async function revealAll(page){
 const {step,total}=await page.evaluate(()=>({step:Math.floor(innerHeight*0.8),total:document.documentElement.scrollHeight}));
 for(let y=0;y<total;y+=step){
  await page.evaluate(top=>scrollTo({top,behavior:'instant'}),y);
  await page.waitForTimeout(80);
 }
 await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
 await page.waitForFunction(()=>[...document.querySelectorAll('[data-reveal]')].every(el=>getComputedStyle(el).opacity==='1'),null,{timeout:15000});
}

async function openAppearance(page){
 const open=await page.locator('.appearance-controls').evaluate(d=>d.open);
 if(!open)await page.locator('.appearance-controls summary').click();
}

async function expandAllDetails(page){
 await page.setViewportSize(DESKTOP);
 await page.getByRole('button',{name:'Sections',exact:true}).click();
 await page.getByRole('button',{name:'Show all details',exact:true}).click();
 assert.equal(await page.locator('main details:not([open])').count(),0,'Show all details opens every details block');
 await page.keyboard.press('Escape');
}

async function assertNoOverflow(page,label){
 for(const width of WIDTHS){
  await page.setViewportSize({width,height:width<=700?844:1000});
  await settle(page);
  const m=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));
  assert.ok(m.scroll<=m.width,`${label} overflows horizontally at ${width}: ${JSON.stringify(m)}`);
 }
}

async function preferenceParsing(browser){
 const cases=[
  {name:'no stored value',stored:undefined,mode:'on'},
  {name:'stored auto',stored:'{"mode":"auto"}',mode:'on'},
  {name:'stored paused',stored:PAUSED,mode:'paused'},
  {name:'malformed JSON',stored:'{not json',mode:'on'},
  {name:'JSON null',stored:'null',mode:'on'},
  {name:'JSON array',stored:'[]',mode:'on'},
  {name:'JSON string "paused"',stored:'"paused"',mode:'on'},
  {name:'unknown mode',stored:'{"mode":"x"}',mode:'on'},
  {name:'wrong-case mode',stored:'{"mode":"Paused"}',mode:'on'},
  {name:'array mode that coerces to paused',stored:'{"mode":["paused"]}',mode:'on'},
  {name:'object mode',stored:'{"mode":{}}',mode:'on'},
  {name:'empty object',stored:'{}',mode:'on'},
  {name:'paused with extra keys',stored:'{"mode":"paused","theme":"dark","extra":[1]}',mode:'paused'},
  {name:'auto with a pause-like extra key',stored:'{"mode":"auto","paused":true}',mode:'on'},
 ];
 for(const c of cases){
  await withSession(browser,{stored:c.stored},async({page})=>{
   await loadView(page);
   await assertMode(page,c.mode,`Stored ${c.name}`);
  });
 }
 await withSession(browser,{blocked:true},async({page})=>{
  await loadView(page);
  await assertMode(page,'on','Blocked storage');
 });
}

async function staticModes(browser){
 const cases=[
  {name:'Reduced motion',mode:'reduced',opts:{reducedMotion:'reduce'},suffix:''},
  {name:'?noanim',mode:'noanim',opts:{},suffix:'?noanim'},
  {name:'Stored pause',mode:'paused',opts:{stored:PAUSED},suffix:''},
  {name:'Reduced motion with stored pause',mode:'reduced',opts:{reducedMotion:'reduce',stored:PAUSED},suffix:''},
  {name:'?noanim with stored pause',mode:'noanim',opts:{stored:PAUSED},suffix:'?noanim'},
 ];
 for(const c of cases){
  await withSession(browser,c.opts,async({page})=>{
   await gotoOnly(page,c.suffix);
   await assertAllVisible(page,`${c.name} right after load`,{transform:true});
   await waitBound(page);
   await assertMode(page,c.mode,c.name);
  });
 }
}

async function motionOnBehavior(browser){
 await withSession(browser,{},async({page})=>{
  await loadView(page);
  assert.equal(await motionOn(page),true,'Default view has motion-on');
  assert.equal(await opacityOf(page,'.contact-links'),'0','A far-down reveal element is hidden before it is approached');
  const heroLines=await page.locator('.hero-name-line').allTextContents();
  assert.deepEqual(heroLines,['Enrizky','Brillian'],'Masked hero name keeps its text');
  const headings=await page.evaluate(()=>[...document.querySelectorAll('.section-heading h2')].map(h=>({
   masks:h.querySelectorAll(':scope > .mask-line').length,
   inner:h.querySelectorAll(':scope > .mask-line > span').length,
   same:h.querySelector('.mask-line > span')?.textContent===h.textContent,
  })));
  assert.ok(headings.length>0&&headings.every(h=>h.masks===1&&h.inner===1&&h.same),'Every section h2 wraps its unchanged text in span.mask-line > span');
  assert.equal(await page.locator('#contact-heading .mask-line.is-revealed').count(),0,'A far heading mask is not revealed before approach');
  await jumpTo(page,'.contact-links');
  await page.waitForFunction(()=>getComputedStyle(document.querySelector('.contact-links')).opacity==='1');
  assert.equal(await opacityOf(page,'.contact-links'),'1','The far element is visible once scrolled to');
  await page.waitForFunction(()=>getComputedStyle(document.querySelector('.role-record')).opacity==='1');
  assert.equal(await opacityOf(page,'.role-record'),'1','Elements above the viewport count as revealed');
  await page.waitForFunction(()=>document.querySelector('#contact-heading .mask-line.is-revealed'));
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
  await settle(page);
  await page.waitForTimeout(400);
  assert.equal(await opacityOf(page,'.contact-links'),'1','A revealed element stays visible after scrolling away');
  assert.equal(await page.locator('#contact-heading .mask-line.is-revealed').count(),1,'A revealed mask stays revealed after scrolling away');
 });
}

async function assertTargetTree(page,id,label){
 const tree=await page.evaluate(id=>{
  const target=document.getElementById(id);
  const nodes=new Set();
  for(let n=target;n;n=n.parentElement)if(n.matches('[data-reveal]'))nodes.add(n);
  target.querySelectorAll('[data-reveal]').forEach(n=>nodes.add(n));
  return [...nodes].map(n=>({node:n.id||n.className,opacity:getComputedStyle(n).opacity}));
 },id);
 assert.ok(tree.length>0,`${label}: #${id} has reveal elements in its tree`);
 const hidden=tree.filter(n=>n.opacity!=='1');
 assert.deepEqual(hidden,[],`${label}: #${id} and its reveal ancestors and descendants are fully visible immediately`);
}

async function navigationSettle(browser){
 for(const id of ['project-openbrowser','experience-sanofi']){
  await withSession(browser,{},async({page})=>{
   await gotoOnly(page,'#'+id);
   assert.equal(await motionOn(page),true,`Deep link #${id} runs with motion on`);
   await assertTargetTree(page,id,`Deep link #${id}`);
   assert.equal(await opacityOf(page,'.contact-links'),'0',`Deep link #${id} leaves unrelated far content unrevealed`);
  });
 }
 await withSession(browser,{},async({page})=>{
  await loadView(page);
  assert.equal(await opacityOf(page,'#experience-sanofi'),'0','Sanofi role is unrevealed before the Sections link');
  await page.getByRole('button',{name:'Sections',exact:true}).click();
  await page.locator('.nav-links a[href="#experience"]').click();
  await page.waitForFunction(()=>location.hash==='#experience');
  await assertTargetTree(page,'experience','Sections link');
  assert.equal(await opacityOf(page,'#experience-sanofi'),'1','Roles inside the chosen section are visible after the Sections link');
 });
 await withSession(browser,{},async({page})=>{
  await loadView(page);
  assert.equal(await opacityOf(page,'#experience-sanofi'),'0','Sanofi role is unrevealed before the role jump');
  await page.locator('#role-jump').selectOption('experience-sanofi');
  await page.waitForFunction(()=>location.hash==='#experience-sanofi');
  await assertTargetTree(page,'experience-sanofi','Role jump');
 });
 await withSession(browser,{},async({page})=>{
  await loadView(page);
  await page.evaluate(()=>{
   const links=[...document.querySelectorAll('.project-record a[href]')].filter(a=>!a.closest('.record-body')&&!a.closest('details.detail-block'));
   window.__farLink=links[links.length-1];
  });
  assert.equal(await page.evaluate(()=>getComputedStyle(window.__farLink.closest('[data-reveal]')).opacity),'0','The last project is unrevealed before focus');
  await page.evaluate(()=>window.__farLink.focus());
  assert.equal(await page.evaluate(()=>document.activeElement===window.__farLink),true,'The far project link accepts focus');
  const activeOpacity=()=>page.evaluate(()=>{
   const r=document.activeElement.closest('[data-reveal]');
   return r?getComputedStyle(r).opacity:'none';
  });
  assert.equal(await activeOpacity(),'1','A far element focused programmatically is visible immediately');
  for(let i=1;i<=3;i++){
   await page.keyboard.press('Shift+Tab');
   const landed=await page.evaluate(()=>{
    const a=document.activeElement,r=a.getBoundingClientRect(),h=a.closest('[data-reveal]');
    return {inView:r.bottom>0&&r.top<innerHeight&&r.width>0,opacity:h?getComputedStyle(h).opacity:'1'};
   });
   assert.deepEqual(landed,{inView:true,opacity:'1'},`Keyboard focus step ${i} lands on content that is on screen and visible`);
  }
 });
}

async function toggleAndSync(browser){
 await withSession(browser,{},async({context,page})=>{
  await loadView(page);
  await assertMode(page,'on','Fresh view');
  const appearanceBefore=await storedRaw(page,APPEARANCE_KEY);
  await openAppearance(page);
  await page.locator('button[data-motion-toggle]').click();
  assert.equal(await motionOn(page),false,'Pause motion removes motion-on immediately');
  assert.equal((await toggleState(page)).text,'Play motion','Toggle offers Play motion after pausing');
  assert.deepEqual(JSON.parse(await storedRaw(page,MOTION_KEY)),{mode:'paused'},'Pause is stored at portfolio-motion-v1');
  assert.equal(await storedRaw(page,APPEARANCE_KEY),appearanceBefore,'Pausing motion leaves the appearance key untouched');
  await assertAllVisible(page,'Paused view',{transform:true});
  const motionAfterPause=await storedRaw(page,MOTION_KEY);
  await page.getByRole('radio',{name:'Dark',exact:true}).check();
  await page.getByRole('radio',{name:'Blue',exact:true}).check();
  assert.deepEqual(JSON.parse(await storedRaw(page,APPEARANCE_KEY)),{theme:'dark',color:'blue'},'Appearance choices are stored at portfolio-appearance');
  assert.equal(await storedRaw(page,MOTION_KEY),motionAfterPause,'Changing appearance leaves the motion key untouched');
  assert.equal(await motionOn(page),false,'Changing appearance does not resume motion');
  await page.reload();
  await waitBound(page);
  await assertMode(page,'paused','After reload');
  const appearanceAfterReload=await storedRaw(page,APPEARANCE_KEY);
  await openAppearance(page);
  await page.locator('button[data-motion-toggle]').click();
  assert.equal(await motionOn(page),true,'Play motion restores motion-on immediately');
  assert.equal((await toggleState(page)).text,'Pause motion','Toggle offers Pause motion after resuming');
  assert.equal(JSON.parse(await storedRaw(page,MOTION_KEY)).mode,'auto','Resuming stores mode auto');
  assert.equal(await storedRaw(page,APPEARANCE_KEY),appearanceAfterReload,'Resuming motion leaves the appearance key untouched');

  const other=await context.newPage();
  await other.goto(base);
  await other.evaluate(({k,v})=>localStorage.setItem(k,v),{k:MOTION_KEY,v:PAUSED});
  await page.waitForFunction(()=>!document.documentElement.classList.contains('motion-on'));
  assert.equal((await toggleState(page)).text,'Play motion','A pause stored in another tab applies live');
  await other.evaluate(k=>localStorage.setItem(k,JSON.stringify({theme:'light',color:'red'})),APPEARANCE_KEY);
  await page.waitForTimeout(300);
  assert.equal(await motionOn(page),false,'An appearance change in another tab does not resume motion');
  await other.evaluate(k=>localStorage.removeItem(k),MOTION_KEY);
  await page.waitForFunction(()=>document.documentElement.classList.contains('motion-on'));
  assert.equal((await toggleState(page)).text,'Pause motion','Removing the key in another tab resumes motion live');
  await other.evaluate(({k,v})=>localStorage.setItem(k,v),{k:MOTION_KEY,v:PAUSED});
  await page.waitForFunction(()=>!document.documentElement.classList.contains('motion-on'));
  await other.evaluate(()=>localStorage.clear());
  await page.waitForFunction(()=>document.documentElement.classList.contains('motion-on'));
  assert.equal(await motionOn(page),true,'Clearing storage in another tab resumes motion live');
 });
}

async function motionVisuals(browser){
 await withSession(browser,{},async({page})=>{
  await loadView(page);
  const art=await page.evaluate(()=>({art:document.querySelectorAll('.hero-artwork,.hero-project-tile,.hero-turn').length,images:document.querySelectorAll('.profile-hero img').length,ready:document.documentElement.classList.contains('sprite-ready')}));
  assert.deepEqual(art,{art:0,images:0,ready:false},'The hero has no artwork and never marks a sprite ready');
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
  await settle(page);
  const progressTop=await scaleX(page,'.scroll-progress > span');
  await page.evaluate(()=>scrollTo({top:(document.documentElement.scrollHeight-innerHeight)/2,behavior:'instant'}));
  await settle(page);
  const progressMid=await scaleX(page,'.scroll-progress > span');
  await page.evaluate(()=>scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'}));
  await settle(page);
  const progressEnd=await scaleX(page,'.scroll-progress > span');
  assert.ok(progressTop<progressMid&&progressMid<progressEnd,`Scroll progress grows with scroll: ${[progressTop,progressMid,progressEnd]}`);

  await jumpTo(page,'#experience');
  await settle(page);
  const route=await page.evaluate(()=>{
   const svg=document.querySelector('#experience svg.career-route');
   return svg?{aria:svg.getAttribute('aria-hidden'),shown:getComputedStyle(svg).display!=='none',paths:svg.querySelectorAll('path').length}:null;
  });
  assert.deepEqual({aria:route.aria,shown:route.shown},{aria:'true',shown:true},'Career route is a decorative visible svg in #experience');
  assert.ok(route.paths>=1,'Career route draws at least one path');
  const dash=()=>page.evaluate(()=>getComputedStyle(document.querySelector('svg.career-route path')).strokeDashoffset);
  const dashStart=await dash();
  await page.evaluate(()=>{
   const s=document.getElementById('experience').getBoundingClientRect();
   scrollTo({top:s.bottom+scrollY-innerHeight,behavior:'instant'});
  });
  await page.waitForFunction(initial=>getComputedStyle(document.querySelector('svg.career-route path')).strokeDashoffset!==initial,dashStart);
  assert.notEqual(await dash(),dashStart,'Career route draws as the role list scrolls');
  for(const [width,shown] of [[700,false],[701,true]]){
   await page.setViewportSize({width,height:900});
   await settle(page);
   assert.equal(await page.locator('svg.career-route').evaluate(el=>getComputedStyle(el).display!=='none'),shown,`Career route display at ${width}px`);
  }
  await page.setViewportSize(DESKTOP);
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
  await settle(page);

  const pressTargets=['.nav-toggle','.hero-actions .button-primary'];
  for(const selector of pressTargets){
   assert.equal((await scaleX(page,selector)).toFixed(2),'1.00',`${selector} rests at full size`);
   await page.locator(selector).hover();
   await page.mouse.down();
   await page.waitForTimeout(500);
   const pressed=await scaleX(page,selector);
   await page.mouse.move(0,0);
   await page.mouse.up();
   assert.equal(pressed.toFixed(2),'0.96',`${selector} scales to 0.96 while pressed`);
  }
  await jumpTo(page,'#skills');
  const tab='.skills-tabs [role="tab"]';
  await page.locator(tab).first().hover();
  await page.mouse.down();
  await page.waitForTimeout(500);
  const pressedTab=await scaleX(page,tab);
  await page.mouse.move(0,0);
  await page.mouse.up();
  assert.equal(pressedTab.toFixed(2),'0.96','Skill tabs scale to 0.96 while pressed');
 });
 await withSession(browser,{stored:PAUSED},async({page})=>{
  await loadView(page);
  await page.evaluate(()=>scrollTo({top:document.documentElement.scrollHeight/2,behavior:'instant'}));
  await settle(page);
  const progress=await page.evaluate(()=>{
   const bar=document.querySelector('.scroll-progress');
   const span=bar.querySelector(':scope > span');
   const cs=getComputedStyle(span);
   const a=cs.scale&&cs.scale!=='none'?parseFloat(cs.scale):new DOMMatrix(cs.transform).a;
   return getComputedStyle(bar).display==='none'||a===0;
  });
  assert.equal(progress,true,'Scroll progress stays off while motion is paused');
 });
}

async function inspectResource(page,{wrapper,link,article,text,href}){
 const found=await page.evaluate(({wrapper,link,article})=>{
  const w=document.querySelectorAll('#'+wrapper);
  const el=w[0];
  const outcome=el&&el.parentElement.querySelector(':scope > p.project-outcome');
  return {
   count:w.length,
   linkCount:document.querySelectorAll('a#'+link).length,
   tag:el&&el.tagName,
   hasClass:Boolean(el)&&el.classList.contains('project-resource-actions'),
   parentId:el&&el.closest('article')&&el.closest('article').id,
   inRecord:Boolean(el)&&Boolean(el.closest('article'))&&el.closest('article').id===article,
   afterOutcome:Boolean(outcome)&&Boolean(outcome.compareDocumentPosition(el)&Node.DOCUMENT_POSITION_FOLLOWING),
   outsideDetails:Boolean(el)&&!el.closest('details.detail-block'),
   children:el?[...el.children].map(c=>({tag:c.tagName,id:c.id,href:c.getAttribute('href'),text:c.textContent.trim()})):[],
   ownText:el&&el.textContent.trim(),
  };
 },{wrapper,link,article});
 assert.deepEqual(found,{
  count:1,linkCount:1,tag:'P',hasClass:true,parentId:article,inRecord:true,afterOutcome:true,outsideDetails:true,
  children:[{tag:'A',id:link,href,text}],ownText:text,
 },`Resource paragraph #${wrapper} is exact`);
}

async function assertResourceLinks(page,label){
 await inspectResource(page,{wrapper:'context-atlas-resources',link:'context-atlas-article-link',article:'project-context-atlas',text:'Read the Context Atlas article',href:'https://openbrowser-landing.pages.dev/context-atlas-blog/'});
 await inspectResource(page,{wrapper:'openbrowser-resources',link:'openbrowser-comparison-link',article:'project-openbrowser',text:'Compare CLI and MCP',href:'https://docs.openbrowser.me/comparison'});
 assert.equal(await page.locator('p.project-resource-actions').count(),2,`${label}: exactly two resource paragraphs exist`);
 const original=await page.evaluate(()=>({
  inDetails:document.querySelectorAll('#project-openbrowser details.detail-block a[href="https://docs.openbrowser.me/comparison"]').length,
  byText:[...document.querySelectorAll('a')].filter(a=>a.textContent.trim()==='Read the comparison').length,
 }));
 assert.deepEqual(original,{inDetails:1,byText:1},`${label}: the original Read the comparison link survives inside the OpenBrowser details`);
}

async function resourceLinks(browser){
 await withSession(browser,{},async({page})=>{
  await loadView(page);
  await assertResourceLinks(page,'Motion view');
 });
}

async function preservation(browser){
 const views=[{name:'motion on',stored:undefined},{name:'motion paused',stored:PAUSED}];
 for(const view of views){
  await withSession(browser,{stored:view.stored},async({page})=>{
   await loadView(page);
   assert.equal(await motionOn(page),view.stored===undefined,`${view.name}: motion-on state`);
   assert.equal(await page.locator('.role-record').count(),11,`${view.name}: role records`);
   assert.equal(await page.locator('.project-record').count(),30,`${view.name}: project records`);
   assert.equal(await page.locator('.paper-record').count(),2,`${view.name}: paper records`);
   assert.equal(await page.locator('#credentials .credential-group').count(),8,`${view.name}: credential groups`);
   assert.equal(await page.locator('#credentials .credential-group li').count(),47,`${view.name}: credential items`);
   assert.equal(await page.locator('main img[src*="portrait"]').count(),0,`${view.name}: no author portrait in page content`);
   await assertNoOverflow(page,`${view.name}, collapsed`);
   await expandAllDetails(page);
   await assertNoOverflow(page,`${view.name}, all details expanded`);
  });
 }
}

async function noScript(browser){
 await withSession(browser,{javaScriptEnabled:false,viewport:PHONE},async({page})=>{
  await gotoOnly(page);
  assert.equal(await motionOn(page),false,'No-JS page never carries motion-on');
  await assertAllVisible(page,'No-JS page',{transform:true});
  const markup=await page.evaluate(sels=>sels.map(selector=>{
   const all=[...document.querySelectorAll(selector)];
   return {selector,present:all.length>0,missing:all.filter(el=>!el.hasAttribute('data-reveal')).length};
  }),REVEAL_SELECTORS);
  assert.deepEqual(markup.filter(m=>!m.present||m.missing),[],'Static HTML marks every spec reveal selector with data-reveal');
  assert.equal(await page.locator('.project-record').count(),30,'No-JS page keeps all project records');
  assert.equal(await page.locator('.role-record').count(),11,'No-JS page keeps all role records');
  for(const selector of ['h1','#experience-ibm','.project-record','.contact-address']){
   assert.equal(await page.locator(selector).first().isVisible(),true,`No-JS page reads ${selector}`);
  }
  assert.equal(await page.locator('.scroll-progress').isVisible(),false,'No-JS page shows no scroll progress bar');
  assert.equal(await page.locator('button[data-motion-toggle]').isVisible(),false,'No-JS page hides the motion toggle');
  await assertResourceLinks(page,'No-JS page');
 });
}

async function failsafe(browser){
 await withSession(browser,{ignoreConsole:true},async({context,page})=>{
  await context.route('**/js/motion.js*',route=>route.abort());
  await gotoOnly(page);
  assert.equal(await motionOn(page),true,'Boot script enables motion-on before the failsafe fires');
  await page.waitForTimeout(3500);
  assert.equal(await motionOn(page),false,'Failsafe removes motion-on when motion.js never runs');
  await assertAllVisible(page,'Failsafe view',{transform:true});
 });
}

async function screenshots(browser){
 const views=[{name:'phone',viewport:PHONE},{name:'desktop',viewport:DESKTOP}];
 const modes=[{name:'motion-on',stored:undefined},{name:'paused',stored:PAUSED}];
 for(const view of views){
  for(const mode of modes){
   await withSession(browser,{viewport:view.viewport,stored:mode.stored},async({page})=>{
    await loadView(page);
    assert.equal(await motionOn(page),mode.stored===undefined,`${view.name} ${mode.name}: motion state before capture`);
    await revealAll(page);
    await assertAllVisible(page,`${view.name} ${mode.name} after revealing`);
    for(const [stop,selector] of [['hero',null],['projects','#projects']]){
     if(selector){await jumpTo(page,selector);await settle(page)}
     const file=path.join(out,`${view.name}-${mode.name}-${stop}.png`);
     await page.screenshot({path:file,animations:'disabled'});
     assert.ok(fs.statSync(file).size>0,`Screenshot written: ${file}`);
    }
   });
  }
 }
}

async function reviewRegressions(browser){
 await withSession(browser,{},async({page})=>{
  await loadView(page);
  await page.waitForFunction(()=>getComputedStyle(document.querySelector('.career-route')).display==='block');
  await openAppearance(page);
  await page.locator('button[data-motion-toggle]').click();
  const route=await page.evaluate(()=>getComputedStyle(document.querySelector('.career-route')).display);
  assert.equal(route,'none','Pausing at runtime hides the career route');
 });

 await withSession(browser,{},async({page})=>{
  await page.setViewportSize({width:1440,height:900});
  await loadView(page);
  for(const top of [3000,5200,8580,11000]){
   await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),top);
   await page.waitForTimeout(2500);
   const stuck=await page.evaluate(()=>[...document.querySelectorAll('[data-reveal]')].filter(e=>{const r=e.getBoundingClientRect();return r.top<innerHeight&&r.bottom>0&&getComputedStyle(e).opacity!=='1'}).map(e=>e.id||e.className));
   assert.deepEqual(stuck,[],`Every reveal element on screen is visible after resting at scrollY ${top}`);
  }
 });

 for(const [label,viewport] of [['desktop',{width:1440,height:900}],['phone',{width:390,height:844}]]){
  const geometry={};
  for(const mode of ['paused','motion']){
   await withSession(browser,{stored:mode==='paused'?PAUSED:undefined,viewport},async({page})=>{
    await loadView(page);
    await page.waitForTimeout(1500);
    geometry[mode]=await page.evaluate(()=>{const r=e=>{const b=e.getBoundingClientRect();return [Math.round(b.top*10)/10,Math.round(b.height*10)/10]};return {name:r(document.querySelector('h1.hero-name')),line:r(document.querySelector('.hero-name-line')),skills:r(document.querySelector('#skills')),heading:r(document.querySelector('#skills-heading'))}});
   });
  }
  assert.deepEqual(geometry.motion,geometry.paused,`Masked headings add no height and move nothing on ${label}, so loading causes no layout shift`);
 }

 await withSession(browser,{blocked:true},async({page})=>{
  await loadView(page);
  await openAppearance(page);
  await page.locator('button[data-motion-toggle]').click();
  assert.equal(await motionOn(page),false,'Pause works for this visit when storage is blocked');
  assert.equal((await toggleState(page)).text,'Play motion','Blocked storage still flips the label');
  await page.locator('button[data-motion-toggle]').click();
  assert.equal(await motionOn(page),true,'Play works again when storage is blocked');
 });

 for(const height of [1400,3200]){
  await withSession(browser,{},async({page})=>{
   await page.setViewportSize({width:1280,height});
   await loadView(page);
   await page.evaluate(()=>scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'}));
   await page.waitForTimeout(1500);
   const hidden=await page.evaluate(()=>[...document.querySelectorAll('.contact-address,.contact-actions,.contact-links')].filter(e=>{const r=e.getBoundingClientRect();return r.top<innerHeight&&r.bottom>0&&getComputedStyle(e).opacity!=='1'}).map(e=>e.className));
   assert.deepEqual(hidden,[],`Contact block is visible once on screen at the page end on a ${height}px viewport`);
  });
 }

 await withSession(browser,{},async({page})=>{
  await loadView(page);
  await page.waitForFunction(()=>[...document.querySelectorAll('[data-reveal], .mask-line')].every(el=>{const r=el.getBoundingClientRect();return r.bottom<=0||r.top>=innerHeight||el.classList.contains('is-revealed')}),null,{timeout:5000});
  const before=await page.evaluate(()=>document.querySelectorAll('.is-revealed').length);
  await page.evaluate(()=>{history.pushState(null,'','#main');dispatchEvent(new HashChangeEvent('hashchange'))});
  await page.waitForTimeout(200);
  const after=await page.evaluate(()=>document.querySelectorAll('.is-revealed').length);
  assert.equal(after,before,'Navigating to #main does not reveal the whole page');
  const errorsBefore=errors.length;
  await page.evaluate(()=>{location.hash='#%E0%A4%A'});
  await page.waitForTimeout(300);
  assert.equal(errors.length,errorsBefore,'A malformed hash raises no error');
 });

 await withSession(browser,{},async({page})=>{
  await page.setViewportSize({width:1440,height:900});
  await loadView(page);
  await page.evaluate(()=>document.querySelector('#experience-sanofi').scrollIntoView({block:'center',behavior:'instant'}));
  await page.waitForTimeout(1200);
  const overlap=await page.evaluate(()=>{
   const dots=[...document.querySelectorAll('.route-dot')].map(d=>d.getBoundingClientRect());
   const text=[...document.querySelectorAll('#experience .role-record summary>h3 a,#experience .role-record summary>.record-meta,#experience .role-record summary>.ledger-date')].map(e=>e.getBoundingClientRect()).filter(r=>r.width>0&&r.bottom>0&&r.top<innerHeight);
   const line=document.querySelector('.career-route path').getBoundingClientRect();
   return {dots:dots.length,hits:text.filter(r=>dots.some(d=>d.right>r.left&&d.left<r.right&&d.bottom>r.top&&d.top<r.bottom)||(line.right>r.left&&line.left<r.right)).length};
  });
  assert.ok(overlap.dots>0,'The career route has a dot for each role');
  assert.equal(overlap.hits,0,'The career route stays in the page margin and never overlaps a role title, company or date');
 });

 await withSession(browser,{ignoreConsole:true},async({context,page})=>{
  await context.route('**/js/motion.js*',route=>route.abort());
  await gotoOnly(page);
  await page.waitForTimeout(500);
  await openAppearance(page);
  const legend=await page.evaluate(()=>{const l=[...document.querySelectorAll('.appearance-panel legend')].find(x=>x.textContent.trim()==='Motion');return l?l.getBoundingClientRect().height:0});
  assert.equal(legend,0,'No empty Motion group shows when the motion script is blocked');
 });

 await withSession(browser,{},async({page})=>{
  await loadView(page);
  const hover=await page.evaluate(()=>matchMedia('(hover:hover) and (pointer:fine)').matches);
  assert.equal(hover,true,'The test browser has a fine hover pointer, so the card hover rule is active');
  await page.locator('#projects .project-record').first().evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));
  await page.waitForTimeout(1200);
  const props=await page.locator('#projects .project-record.is-revealed').first().evaluate(e=>getComputedStyle(e).transitionProperty);
  assert.ok(props.split(',').map(x=>x.trim()).includes('opacity'),'A revealed project card still fades opacity, so the stagger shows on hover-capable pointers: '+props);
 });
}

(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  await preferenceParsing(browser);
  await staticModes(browser);
  await motionOnBehavior(browser);
  await navigationSettle(browser);
  await toggleAndSync(browser);
  await motionVisuals(browser);
  await resourceLinks(browser);
  await preservation(browser);
  await noScript(browser);
  await failsafe(browser);
  await reviewRegressions(browser);
  await screenshots(browser);
  assert.deepEqual(errors,[],'No page errors or console errors across the run');
  console.log('PASS: motion preference parsing, reduced/noanim/paused static fallbacks, reveal and masks, navigation settle, toggle and cross-tab sync, scroll progress and career route, a hero with no artwork, resource links, record preservation without overflow, no-JS reading, failsafe, and screenshots.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});

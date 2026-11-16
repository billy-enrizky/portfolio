const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const OUT = path.resolve(process.env.TEST_OUTPUT_DIR || 'local_docs/appearance-qa');
fs.mkdirSync(OUT, {recursive:true});
const URL = process.env.PORTFOLIO_URL || 'http://127.0.0.1:8000/';
const KEY = 'portfolio-appearance';
const colors = ['Red','Orange','Green','Blue','Pink'];
const results = [];
function rgb(value) { return value.match(/[\d.]+/g).slice(0,3).map(Number); }
function luminance(value) { return rgb(value).map(n=>{const s=n/255;return s<=.04045?s/12.92:((s+.055)/1.055)**2.4;}).reduce((s,n,i)=>s+n*[.2126,.7152,.0722][i],0); }
function contrast(a,b) { const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05); }
(async()=>{
 const browser = await chromium.launch({headless:true});
 const errors = [];
 const context = await browser.newContext({viewport:{width:1440,height:1000},colorScheme:'light',reducedMotion:'reduce'});
 context.on('page',page=>page.on('pageerror',e=>errors.push(e.message)));
 const page = await context.newPage();
 async function load() { await page.goto(URL+'?noanim',{waitUntil:'load'});await page.evaluate(()=>document.fonts.ready); }
 async function settle() { await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))); }
 async function theme(name) { await page.getByRole('radio',{name,exact:true}).check();await settle(); }
 async function current() { return page.evaluate(()=>({theme:document.documentElement.dataset.theme,color:document.documentElement.dataset.color,bg:getComputedStyle(document.body).backgroundColor})); }
 try {
  await load();
  await page.screenshot({path:OUT+'/initial-desktop.png',animations:'disabled'});
  assert.equal(await page.locator('.appearance-controls summary').count(),1,'A discoverable Appearance control must exist');
  assert.equal(await page.locator('input[name="appearance-theme"]').count(),3);
  assert.equal(await page.locator('input[name="appearance-color"]').count(),5);
  await page.locator('.appearance-controls summary').click();
  assert.equal(await page.getByRole('radio',{name:'System',exact:true}).isChecked(),true);
  assert.deepEqual(await current(),{theme:'light',color:'orange',bg:'rgb(241, 241, 241)'});
  await theme('Dark');assert.equal((await current()).theme,'dark');
  await page.getByRole('radio',{name:'Blue',exact:true}).check();
  await page.reload();await page.locator('.appearance-controls summary').click();
  assert.equal(await page.getByRole('radio',{name:'Dark',exact:true}).isChecked(),true);
  assert.equal(await page.getByRole('radio',{name:'Blue',exact:true}).isChecked(),true);
  assert.deepEqual(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),KEY),{theme:'dark',color:'blue'});
  await theme('Light');await page.emulateMedia({colorScheme:'dark'});
  assert.equal((await current()).theme,'light','Explicit light must override a dark OS');
  await theme('System');await page.waitForFunction(()=>document.documentElement.dataset.theme==='dark');
  await page.emulateMedia({colorScheme:'light'});await page.waitForFunction(()=>document.documentElement.dataset.theme==='light');
  results.push('Theme and color are independent, persist across reload, and system changes respect explicit overrides');
  for(const mode of ['Light','Dark']) {
   await theme(mode);
   for(const color of colors) {
    await page.getByRole('radio',{name:color,exact:true}).check();await settle();
    assert.equal((await current()).color,color.toLowerCase());
    assert.equal(await page.locator('#appearance-color-name').textContent(),color);
    const pairs=await page.evaluate(()=>{
     const css=el=>getComputedStyle(el);const root=css(document.documentElement),body=css(document.body),nav=css(document.querySelector('.nav-links a[aria-current]')),button=css(document.querySelector('.hero-actions .button-primary'));
     const probe=document.createElement('span');probe.style.color='var(--accent)';document.body.append(probe);const accent=css(probe).color;probe.remove();
     return {accent:[accent,body.backgroundColor],muted:[css(document.querySelector('.hero-intro')).color,body.backgroundColor],nav:[nav.color,nav.backgroundColor],button:[button.color,button.backgroundColor],nativeScheme:root.colorScheme};
    });
    assert.equal(pairs.button[1],pairs.accent[0],'The settled primary button must use the selected accent');
    assert.equal(pairs.nav[0],pairs.accent[0],'The current navigation link must use the selected accent');
    for(const key of ['accent','muted','nav','button']) assert.ok(contrast(...pairs[key])>=4.5,JSON.stringify({mode,color,key,pair:pairs[key],ratio:contrast(...pairs[key])}));
    assert.equal(pairs.nativeScheme,mode.toLowerCase());
    results.push({mode,color,ratios:Object.fromEntries(['accent','muted','nav','button'].map(k=>[k,contrast(...pairs[k])]))});
   }
  }
  await page.getByRole('radio',{name:'Light',exact:true}).focus();await page.keyboard.press('ArrowRight');
  assert.equal(await page.getByRole('radio',{name:'Dark',exact:true}).isChecked(),true);
  await page.getByRole('radio',{name:'Red',exact:true}).focus();await page.keyboard.press('ArrowRight');
  assert.equal(await page.getByRole('radio',{name:'Orange',exact:true}).isChecked(),true);
  await page.keyboard.press('Escape');assert.equal(await page.locator('.appearance-controls').getAttribute('open'),null);
  assert.equal(await page.locator('.appearance-controls summary').evaluate(el=>el===document.activeElement),true);
  results.push('Native radio arrow keys and Escape/focus work');
  await page.evaluate(k=>localStorage.setItem(k,'not json'),KEY);await page.reload();
  assert.equal((await current()).color,'orange');
  await page.evaluate(k=>localStorage.setItem(k,JSON.stringify({theme:'unexpected',color:'<style>'})),KEY);await page.reload();
  assert.deepEqual(await current(),{theme:'light',color:'orange',bg:'rgb(241, 241, 241)'});
  for(const value of [{theme:'dark',color:['blue']},{theme:'dark',color:{toString:null}},{theme:null,color:null}]) {
   await page.evaluate(({k,value})=>localStorage.setItem(k,JSON.stringify(value)),{k:KEY,value});await page.reload();
   assert.equal((await current()).color,'orange','Stored color must be a known string, not a coercible value');
   assert.equal(await page.locator('input[name="appearance-color"]:checked').count(),1);
   assert.equal(await page.locator('input[name="appearance-theme"]:checked').count(),1);
  }
  await page.evaluate(k=>localStorage.removeItem(k),KEY);await page.reload();
  results.push('Malformed, unsupported, array and object preferences safely reset');
  for(const scenario of ['system-change','storage-change']) {
   const slowContext=await browser.newContext({viewport:{width:1440,height:1000},colorScheme:'dark',reducedMotion:'reduce'});
   const driver=await slowContext.newPage();await driver.goto(URL+'?noanim');
   if(scenario==='storage-change') await driver.evaluate(k=>localStorage.setItem(k,JSON.stringify({theme:'light',color:'orange'})),KEY);
   const delayed=await slowContext.newPage();delayed.on('pageerror',e=>errors.push(e.message));
   let release, requested;const scriptRequested=new Promise(resolve=>{requested=resolve});
   await delayed.route('**/js/script.js*',async route=>{requested();await new Promise(resolve=>{release=resolve});await route.continue()});
   const loading=delayed.goto(URL+'?noanim').then(()=>null,error=>error);await scriptRequested;
   const earlyLayout=await delayed.locator('html').evaluate(el=>el.classList.contains('js'));
   if(scenario==='system-change') await delayed.emulateMedia({colorScheme:'light'});
   else {await driver.locator('.appearance-controls summary').click();await driver.getByRole('radio',{name:'Dark',exact:true}).check();await driver.getByRole('radio',{name:'Pink',exact:true}).check()}
   release();const navigationError=await loading;if(navigationError)throw navigationError;
   assert.equal(earlyLayout,true,'The enhanced layout must initialize before deferred application scripts');
   assert.equal(await delayed.locator('html').getAttribute('data-theme'),scenario==='system-change'?'light':'dark','Changes before DOM readiness must be reconciled');
   assert.equal(await delayed.locator('html').getAttribute('data-color'),scenario==='system-change'?'orange':'pink');
   await slowContext.close();
  }
  results.push('OS and cross-tab preference changes during delayed initialization are reconciled');
  const other=await context.newPage();await other.goto(URL+'?noanim');
  await page.locator('.appearance-controls summary').click();await theme('Dark');
  await other.waitForFunction(()=>document.documentElement.dataset.theme==='dark');await other.close();
  results.push('Preference changes synchronize between tabs');
  for(const width of [320,390,768,900,901,1024,1440]) {
   await page.setViewportSize({width,height:width<701?844:1000});
   await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
   const m=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));
   assert.ok(m.scroll<=m.width,JSON.stringify(m));results.push(m);
  }
  await page.setViewportSize({width:390,height:844});
  await page.getByRole('button',{name:'Sections',exact:true}).click();
  await page.waitForFunction(()=>document.activeElement===document.querySelector('.nav-links a'));
  await page.locator('.appearance-controls summary').click();
  await theme('Light');await page.getByRole('radio',{name:'Green',exact:true}).check();
  await page.screenshot({path:OUT+'/mobile-appearance-light.png',animations:'disabled'});
  await theme('Dark');await page.screenshot({path:OUT+'/mobile-appearance-dark.png',animations:'disabled'});
  await page.getByRole('radio',{name:'Pink',exact:true}).focus();await page.keyboard.press('Escape');
  assert.equal(await page.locator('.nav-toggle').getAttribute('aria-expanded'),'false');
  await page.getByRole('button',{name:'Sections',exact:true}).click();await page.keyboard.press('Escape');assert.equal(await page.locator('.nav-toggle').getAttribute('aria-expanded'),'false');
  await page.locator('#project-search').fill('context atlas');assert.equal(await page.locator('.project-record:not([hidden])').count(),1);
  await page.locator('#project-search').fill('unmatched-query-928731');assert.equal(await page.locator('#project-empty').isVisible(),true);
  await page.getByRole('button',{name:'Clear search',exact:true}).click();assert.equal(await page.locator('.project-record:not([hidden])').count(),30);
  await page.getByRole('button',{name:'Sections',exact:true}).click();
  await page.getByRole('button',{name:'Show all details',exact:true}).click();assert.equal(await page.locator('main details:not([open])').count(),0);
  await page.getByRole('button',{name:'Hide extra details',exact:true}).click();
  assert.equal(await page.locator('.role-record').count(),11);assert.equal(await page.locator('.paper-record').count(),2);assert.equal(await page.locator('#credentials .credential-group').count(),8);assert.equal(await page.locator('#credentials .credential-group li').count(),47);
  const blocked=await browser.newContext({viewport:{width:390,height:844},colorScheme:'dark',reducedMotion:'reduce'});
  await blocked.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Storage unavailable','SecurityError');}}));
  const bp=await blocked.newPage();bp.on('pageerror',e=>errors.push(e.message));await bp.goto(URL+'?noanim');
  await bp.getByRole('button',{name:'Sections',exact:true}).click();await bp.locator('.appearance-controls summary').click();await bp.getByRole('radio',{name:'Light',exact:true}).check();
  assert.equal(await bp.locator('html').getAttribute('data-theme'),'light');await blocked.close();
  const nojs=await browser.newContext({javaScriptEnabled:false,colorScheme:'dark',viewport:{width:390,height:844}});
  const np=await nojs.newPage();await np.goto(URL);assert.equal(await np.locator('.appearance-controls').isVisible(),false);assert.equal(await np.locator('.project-record').count(),30);
  assert.equal(await np.locator('body').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(16, 16, 16)');await np.locator('#experience-ibm summary').click();assert.equal(await np.locator('#experience-ibm details').getAttribute('open'),'');await nojs.close();
  results.push('Storage-blocked and no-JavaScript fallbacks work; all existing records and core interactions remain');
  assert.deepEqual(errors,[]);
  fs.writeFileSync(OUT+'/browser-results.json',JSON.stringify(results,null,2));
  console.log('PASS: appearance controls, all palette/theme contrast pairs, independent persistence, OS overrides, keyboard, tabs, fallbacks, responsive widths and portfolio preservation.');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});

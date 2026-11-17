const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const base=process.env.PORTFOLIO_URL||'http://127.0.0.1:8000/';
const out=path.resolve(process.env.TEST_OUTPUT_DIR||'local_docs/redesign-qa');fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true});const errors=[];try{
 const page=await browser.newPage({viewport:{width:1440,height:1000},colorScheme:'light',reducedMotion:'reduce'});page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'?noanim');await page.evaluate(()=>document.fonts.ready);
 const sectionOrder=await page.locator('main > section').evaluateAll(sections=>sections.map(section=>section.id));const educationIndex=sectionOrder.indexOf('education'),credentialsIndex=sectionOrder.indexOf('credentials'),researchIndex=sectionOrder.indexOf('research');assert.equal(credentialsIndex,educationIndex+1,'Credentials follows Education');assert.equal(researchIndex,credentialsIndex+1,'Research follows Credentials');
 const navigationOrder=await page.locator('.nav-links a').evaluateAll(links=>links.map(link=>link.hash.slice(1)));const navEducationIndex=navigationOrder.indexOf('education'),navCredentialsIndex=navigationOrder.indexOf('credentials'),navResearchIndex=navigationOrder.indexOf('research');assert.equal(navCredentialsIndex,navEducationIndex+1,'Credentials follows Education in navigation');assert.equal(navResearchIndex,navCredentialsIndex+1,'Research follows Credentials in navigation');
 assert.equal(await page.locator('.site-header').count(),1,'The reference-led design needs a persistent full-width header');
 assert.equal(await page.getByRole('heading',{name:'Muhammad Enrizky Brillian',level:1,exact:true}).count(),1);
 assert.equal(await page.locator('.hero-artwork, .hero-project-tile, .hero-turn').count(),0,'The hero has no artwork');
 assert.equal(await page.locator('.profile-hero img').count(),0,'The hero holds no image');
 assert.equal(await page.locator('.site-index').isVisible(),false);
 const sizes=[];
 for(const width of [320,390,700,768,900,901,1024,1440,1920]){
  await page.setViewportSize({width,height:width<=700?844:1000});await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  const r=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,mainLeft:document.querySelector('main').getBoundingClientRect().left,header:getComputedStyle(document.querySelector('.site-header')).position,actionsBottom:document.querySelector('.hero-actions').getBoundingClientRect().bottom,height:innerHeight,heroFont:parseFloat(getComputedStyle(document.querySelector('h1')).fontSize)}));
  assert.ok(r.scroll<=r.width,JSON.stringify(r));assert.equal(r.header,'fixed');assert.ok(r.mainLeft<=Math.max(0,(width-1680)/2)+2,JSON.stringify(r));assert.ok(r.actionsBottom<r.height,JSON.stringify(r));assert.ok(r.heroFont>=(width>=1024?100:50),JSON.stringify(r));sizes.push(r);
 }
 await page.setViewportSize({width:1440,height:1000});
 await page.getByRole('button',{name:'Sections',exact:true}).click();await page.waitForFunction(()=>document.activeElement===document.querySelector('.nav-links a'));
 await page.locator('.nav-links a[href="#experience"]').click();assert.equal(await page.locator('.nav-toggle').getAttribute('aria-expanded'),'false');
 assert.ok(await page.locator('#experience').evaluate(el=>el.getBoundingClientRect().top>=70));
 await page.locator('#role-jump').selectOption('experience-sanofi');await page.waitForFunction(()=>location.hash==='#experience-sanofi');
 assert.ok(await page.locator('#experience-sanofi').evaluate(el=>el.getBoundingClientRect().top>=70));
 await page.getByRole('button',{name:'Sections',exact:true}).click();await page.locator('.appearance-controls summary').click();
 assert.equal(await page.locator('.nav-toggle').getAttribute('aria-expanded'),'false','Appearance and navigation should not stack');
 await page.getByRole('radio',{name:'Dark',exact:true}).check();await page.getByRole('radio',{name:'Blue',exact:true}).check();
 await page.locator('#experience h2').click();assert.equal(await page.locator('.appearance-controls').getAttribute('open'),null,'Outside interaction should dismiss appearance');
 await page.getByRole('button',{name:'Sections',exact:true}).click();await page.getByRole('button',{name:'Show all details',exact:true}).click();
 for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:1000});await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Expanded records must not overflow at '+width);}
 await page.getByRole('button',{name:'Hide extra details',exact:true}).click();await page.keyboard.press('Escape');
 assert.equal(await page.locator('.role-record').count(),11);assert.equal(await page.locator('.project-record').count(),30);assert.equal(await page.locator('.paper-record').count(),2);assert.equal(await page.locator('#credentials .credential-group').count(),8);assert.equal(await page.locator('#credentials .credential-group li').count(),47);
 const credentialCounts=await page.locator('#credentials .credential-group').evaluateAll(groups=>groups.map(group=>{const label=group.querySelector('summary').textContent.trim();const listed=Number(label.match(/\((\d+)\)$/)?.[1]??-1);return {label,listed,actual:group.querySelectorAll('li').length};}));assert.ok(credentialCounts.every(group=>group.listed===group.actual),JSON.stringify(credentialCounts));
 assert.equal(await page.locator('main img[src*="portrait"]').count(),0);
 await page.locator('#project-search').fill('context atlas');assert.equal(await page.locator('.project-record:not([hidden])').count(),1);
 await page.evaluate(()=>{history.pushState(null,'','#project-openbrowser');dispatchEvent(new HashChangeEvent('hashchange'));});
 await page.waitForFunction(()=>!document.getElementById('project-openbrowser').hidden);
 const nojs=await browser.newPage({viewport:{width:390,height:844},javaScriptEnabled:false,colorScheme:'dark'});await nojs.goto(base);
 assert.equal(await nojs.locator('.site-index').isVisible(),true);assert.equal(await nojs.locator('.project-record').count(),30);await nojs.locator('#experience-ibm > details.record-disclosure > summary').click();assert.equal(await nojs.locator('#experience-ibm > details.record-disclosure').getAttribute('open'),'');await nojs.locator('#experience-ibm details.detail-block > summary').click();assert.equal(await nojs.locator('#experience-ibm details.detail-block').getAttribute('open'),'');
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'redesign-results.json'),JSON.stringify({sizes,consoleErrors:errors},null,2));
 console.log('PASS: reference-led header/hero, responsive first viewport, drawers, appearance coordination, deep links, no-JS, and all portfolio records.');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});

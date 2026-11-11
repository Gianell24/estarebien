import {createRequire} from 'node:module';
import fs from 'node:fs/promises';
const require=createRequire(new URL('./tools/package.json',import.meta.url));
const {chromium}=require('playwright-core');
const {startStaticServer}=await import('./tools/server.mjs');
const server=await startStaticServer('site');
const base=`http://127.0.0.1:${server.address().port}/`;
const browser=await chromium.launch({channel:'chrome'});
const results=[],errors=[];
const test=(label,value)=>{results.push({test:label,pass:!!value});if(!value)console.error('FAIL:',label);};
await fs.mkdir('review',{recursive:true});
try{
  const context=await browser.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:1});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto(base);await page.evaluate(()=>document.fonts.ready);await page.waitForSelector('.story-row');await page.screenshot({path:'review/desktop-home.png'});
  test('six transmedia works',await page.locator('.story-row').count()===6);
  test('persistent mail contact',await page.locator('.site-header .contact-link').getAttribute('href')==='mailto:ruwayproducciones@gmail.com');
  await page.locator('#comienzo').scrollIntoViewIfNeeded();await page.waitForTimeout(650);await page.screenshot({path:'review/desktop-beginning.png'});
  await page.locator('.site-header [data-menu]').click();await page.waitForTimeout(400);await page.screenshot({path:'review/desktop-menu.png'});
  test('menu has all works',await page.locator('#drawer-links button').count()===6);
  await page.keyboard.press('Escape');test('Escape closes drawer',!await page.locator('#drawer').evaluate(d=>d.open));
  await page.locator('.story-row[data-story="podcast"]').click();test('pending podcast has honest state',await page.locator('#story-body').innerText().then(t=>t.includes('Próximamente')&&t.includes('preparación')));test('pending media not embedded',await page.locator('#story-body iframe').count()===0);await page.keyboard.press('Escape');
  await page.locator('.story-row[data-story="videoclip"]').click();await page.screenshot({path:'review/desktop-story.png'});test('original poster used',await page.locator('.story-art img').getAttribute('src')==='assets/poster.webp');await page.keyboard.press('Escape');
  await page.locator('.hero [data-enter]').click();await page.waitForSelector('#tour-loading[hidden]',{timeout:30000,state:'attached'});
  test('real WebGL canvas created',await page.locator('#three-stage canvas').count()===1);
  await page.locator('#dismiss-help').click();await page.waitForTimeout(1200);await page.screenshot({path:'review/desktop-house.png'});
  test('living room has visible interactive objects',await page.locator('#hotspots .hotspot:visible').count()>=1);
  const before=await page.locator('[data-hotspot="videoclip"]').getAttribute('style');await page.locator('#three-stage').focus();await page.keyboard.down('ArrowLeft');await page.waitForTimeout(300);await page.keyboard.up('ArrowLeft');await page.waitForTimeout(80);const after=await page.locator('[data-hotspot="videoclip"]').getAttribute('style');test('keyboard turns 3D camera',before!==after);
  for(const room of ['comedor','cocina','cuarto','sala']){
    await page.locator(`[data-room="${room}"]`).click();await page.waitForTimeout(4800);test(`room ${room} reachable`,await page.locator(`[data-room="${room}"]`).getAttribute('aria-current')==='true');await page.screenshot({path:`review/3d-${room}.png`});
  }
  await page.locator('#reference-toggle').click();test('original room view opens',await page.locator('#reference-view').isVisible());await page.screenshot({path:'review/reference-room.png'});await page.locator('#reference-toggle').click();
  const sound=page.locator('.tour-audio [data-sound]');await sound.click();test('sound can be disabled',await sound.getAttribute('aria-pressed')==='false');
  await page.locator('.tour-back').click();test('exit returns to page',!await page.locator('#tour').evaluate(d=>d.open));
  const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1});const phone=await mobile.newPage();phone.on('pageerror',e=>errors.push('mobile: '+e.message));await phone.goto(base);await phone.waitForSelector('.story-row');await phone.evaluate(()=>document.fonts.ready);await phone.screenshot({path:'review/mobile-home.png'});
  test('mobile has no horizontal overflow',await phone.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await phone.locator('.hero [data-enter]').click();await phone.waitForSelector('#tour-loading[hidden]',{timeout:30000,state:'attached'});await phone.locator('#dismiss-help').click();await phone.waitForTimeout(1000);await phone.screenshot({path:'review/mobile-house.png'});test('touch direction controls visible',await phone.locator('.touch-controls').isVisible());await phone.locator('.tour-back').click();
  await phone.locator('.site-header [data-menu]').click();await phone.screenshot({path:'review/mobile-menu.png'});test('mobile drawer fits viewport',await phone.locator('#drawer').evaluate(d=>d.getBoundingClientRect().width<=innerWidth));await phone.keyboard.press('Escape');await phone.locator('.story-row[data-story="corto"]').click();await phone.screenshot({path:'review/mobile-story.png'});test('film marked in production',await phone.locator('.story-content').innerText().then(t=>t.includes('En rodaje')));
  const reduced=await browser.newContext({viewport:{width:320,height:667},reducedMotion:'reduce'});const rp=await reduced.newPage();await rp.goto(base);await rp.waitForSelector('.story-row');await rp.screenshot({path:'review/mobile-320.png'});test('320px readable without overflow',await rp.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await rp.locator('.hero [data-enter]').click();await rp.waitForSelector('#tour-loading[hidden]',{state:'attached'});await rp.locator('#dismiss-help').click();await rp.locator('[data-room="cuarto"]').click();await rp.waitForTimeout(200);test('reduced motion switches rooms immediately',await rp.locator('[data-room="cuarto"]').getAttribute('aria-current')==='true');
  const failure=await browser.newContext({viewport:{width:390,height:844}});const fp=await failure.newPage();await fp.route('**/house.js',r=>r.abort());await fp.goto(base);await fp.waitForSelector('.story-row');await fp.locator('.hero [data-enter]').click();await fp.waitForSelector('#reference-view:not([hidden])');test('3D failure has photographic navigation',await fp.locator('#photo-hotspots button').count()===2);await fp.locator('[data-room="cuarto"]').click();test('fallback includes film and comic',await fp.locator('#photo-hotspots button').count()===2);await fp.screenshot({path:'review/mobile-fallback.png'});
  test('no uncaught runtime errors',errors.length===0);
}finally{await browser.close();await new Promise(r=>server.close(r));await fs.writeFile('review/interaction-results.json',JSON.stringify({results,errors},null,2));console.log(JSON.stringify({passed:results.filter(r=>r.pass).length,total:results.length,failures:results.filter(r=>!r.pass),errors},null,2));}

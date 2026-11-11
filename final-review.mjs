import {createRequire} from 'node:module';
import fs from 'node:fs/promises';
const require=createRequire(new URL('./tools/package.json',import.meta.url));
const {chromium}=require('playwright-core');
const {startStaticServer}=await import('./tools/server.mjs');
const server=await startStaticServer('site'),browser=await chromium.launch({channel:'chrome'}),base=`http://127.0.0.1:${server.address().port}/`;
const results=[];const test=(test,pass)=>results.push({test,pass});
try{
 for(const [w,h] of [[390,844],[320,667],[844,390]]){
  const context=await browser.newContext({viewport:{width:w,height:h},isMobile:true,hasTouch:true}),page=await context.newPage();await page.goto(base);await page.waitForSelector('.story-row');await page.evaluate(()=>document.fonts.ready);await page.locator('.site-header [data-menu]').click();await page.waitForTimeout(500);
  const visible=await page.locator('.drawer-footer a').evaluateAll(es=>es.every(e=>{const r=e.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight&&r.left>=0&&r.right<=innerWidth;}));test(`${w}x${h} social links and contact visible`,visible);
  await page.screenshot({path:`review/menu-final-${w}.png`});await page.locator('#drawer-links [data-story="corto"]').click();test(`${w}x${h} final menu story reachable`,await page.locator('#story-dialog').evaluate(d=>d.open));await context.close();
 }
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),page=await context.newPage();await page.goto(base);await page.waitForSelector('.story-row');await page.locator('.hero [data-sound]').click();await page.locator('.hero [data-enter]').click();await page.waitForSelector('#tour-loading[hidden]',{state:'attached'});await page.locator('#dismiss-help').click();await page.waitForTimeout(600);
 const first=await page.locator('[data-hotspot="videoclip"]').getAttribute('style');await page.locator('#three-stage').focus();await page.keyboard.down('ArrowUp');await page.waitForTimeout(400);await page.keyboard.up('ArrowUp');test('arrow up moves viewpoint in house',first!==await page.locator('[data-hotspot="videoclip"]').getAttribute('style'));
 await page.locator('[data-room="cuarto"]').click();await page.waitForTimeout(5000);test('portrait bedroom lamp is immediately discoverable',await page.locator('[data-hotspot="corto"]').isVisible());await page.screenshot({path:'review/mobile-cuarto-final.png'});
 await page.locator('[data-hotspot="corto"]').click();test('mobile 3D object opens correct story',await page.locator('.story-content').innerText().then(t=>t.includes('CORTOMETRAJE')&&t.includes('En rodaje')));
}finally{await browser.close();await new Promise(r=>server.close(r));await fs.writeFile('review/final-results.json',JSON.stringify({results},null,2));console.log(JSON.stringify({passed:results.filter(r=>r.pass).length,total:results.length,failures:results.filter(r=>!r.pass)}));}

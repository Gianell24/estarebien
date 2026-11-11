import {createRequire} from 'node:module';
import fs from 'node:fs/promises';
const require=createRequire(new URL('./tools/package.json',import.meta.url)),{chromium}=require('playwright-core');
const {startStaticServer}=await import('./tools/server.mjs');
const server=await startStaticServer('site'),base=`http://127.0.0.1:${server.address().port}/`,browser=await chromium.launch({channel:'chrome'});
const app=(await fs.readFile('site/app.js','utf8')).replace('house.setActive(true);syncModal();','window.__review={house,audio};house.setActive(true);syncModal();');
// A deterministic fast clock exercises the projection throttle's final-frame edge.
const house=(await fs.readFile('site/house.js','utf8')).replace('if(time-lastProject>32||!moving||!needsFrame)','if(time-lastProject>100000||!moving||!needsFrame)');
const results=[],errors=[];const check=(name,pass)=>{results.push({name,pass:!!pass});if(!pass)console.log('FAIL',name);};
const state=p=>p.evaluate(()=>window.__review.house.getState());
try{
 const context=await browser.newContext({viewport:{width:320,height:667},isMobile:true,hasTouch:true}),p=await context.newPage();
 p.on('pageerror',e=>errors.push(e.message));await p.route('**/app.js',r=>r.fulfill({contentType:'text/javascript',body:app}));await p.route('**/house.js',r=>r.fulfill({contentType:'text/javascript',body:house}));
 await p.route('https://www.youtube-nocookie.com/**',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><title>Isolated media test</title>'}));
 await p.goto(base);await p.waitForFunction(()=>!!window.__review);await p.locator('#welcome [data-enter]').click();await p.waitForTimeout(450);
 await p.locator('.tour-top [data-menu]').click();const stopped=await state(p);await p.waitForTimeout(400);const paused=await state(p);
 check('Opening the menu pauses the door without skipping the entrance',stopped.phase==='opening'&&paused.doorAngle===stopped.doorAngle&&JSON.stringify(stopped.position)===JSON.stringify(paused.position));
 await p.keyboard.press('Escape');await p.waitForFunction(()=>window.__review.house.getState().phase==='inside');check('Door resumes and reaches the living room after menu closes',(await state(p)).room==='sala');
 for(const room of ['cuarto','sala','cuarto']){await p.locator(`[data-room="${room}"]`).click();await p.waitForFunction(r=>{const s=window.__review.house.getState();return s.room===r&&!s.transition;},room);const id=room==='cuarto'?'corto':'videoclip';check(`Settled ${room} hotspot survives projection throttling`,await p.locator(`[data-hotspot="${id}"]`).isVisible());}
 check('320px story marker clears the room heading',await p.evaluate(()=>{const a=document.querySelector('[data-hotspot="corto"]').getBoundingClientRect(),b=document.querySelector('.room-caption').getBoundingClientRect();return a.bottom+8<=b.top||a.right+8<=b.left||a.left>=b.right+8||a.top>=b.bottom+8;}));
 await p.screenshot({path:'review/v3/cuarto-320.png'});
 await p.locator('.tour-top [data-menu]').click();await p.locator('#drawer-links [data-story="podcast"]').click();await p.locator('[data-episode="ep-4"]').click();
 await p.evaluate(()=>{const frame=document.querySelector('.media-player iframe');dispatchEvent(new MessageEvent('message',{source:frame.contentWindow,origin:'https://www.youtube-nocookie.com',data:JSON.stringify({event:'onError',info:150})}));});
 check('Embed error gives an honest explanation',await p.locator('.player-notice').innerText().then(t=>t.includes('no permite reproducirse fuera de YouTube')));
 check('Embed error restores the instrumental',await p.evaluate(()=>!window.__review.audio.ducked));
 check('Direct episode fallback retains the provided URL',await p.locator('.external-player').getAttribute('href')==='https://youtu.be/gLvBOfHRjVM');
 await p.evaluate(()=>{const frame=document.querySelector('.media-player iframe');dispatchEvent(new MessageEvent('message',{source:frame.contentWindow,origin:'https://www.youtube-nocookie.com',data:'null'}));});
 await p.keyboard.press('Escape');await p.locator('[data-home]').click();check('Home still resets the door',(await state(p)).phase==='closed');
 await p.locator('#welcome [data-enter]').click();await p.waitForFunction(()=>window.__review.house.getState().phase==='inside');check('Re-entry works after the media error',(await state(p)).walkable);
 check('No browser exceptions including null player messages',errors.length===0);
 await context.close();
}finally{await fs.writeFile('review/v3/final-results.json',JSON.stringify({results,errors},null,2));console.log(JSON.stringify({passed:results.filter(r=>r.pass).length,total:results.length,failures:results.filter(r=>!r.pass),errors},null,2));await browser.close();await new Promise(r=>server.close(r));}

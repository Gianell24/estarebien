import {createRequire} from 'node:module';
import fs from 'node:fs/promises';
const require=createRequire(new URL('./tools/package.json',import.meta.url));
const {chromium}=require('playwright-core');
const {startStaticServer}=await import('./tools/server.mjs');
await fs.mkdir('review/v2',{recursive:true});
const server=await startStaticServer('site'),base=`http://127.0.0.1:${server.address().port}/`,browser=await chromium.launch({channel:'chrome'});
const app=await fs.readFile('site/app.js','utf8'),instrumented=app.replace('house.setActive(true);syncModal();','window.__review={house,audio};house.setActive(true);syncModal();');
const results=[],errors=[];const test=(test,pass)=>{results.push({test,pass:!!pass});if(!pass)console.log('FAIL',test);};
const state=p=>p.evaluate(()=>window.__review.house.getState());
async function init(options){const c=await browser.newContext(options),p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));await p.route('**/app.js',r=>r.fulfill({contentType:'text/javascript',body:instrumented}));await p.goto(base);await p.waitForFunction(()=>!!window.__review);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(500);return p;}
async function snap(p,name){await p.waitForTimeout(550);await p.screenshot({path:`review/v2/${name}.png`});}
async function arrive(p,room){await p.locator(`[data-room="${room}"]`).click();await p.waitForFunction(room=>{const s=window.__review.house.getState();return s.routeLength===0&&s.room===room;},room,{timeout:15000});}
async function routeDone(p){await p.waitForFunction(()=>window.__review.house.getState().routeLength===0,null,{timeout:15000});}
const distance=(a,b)=>Math.hypot(a[0]-b[0],a[2]-b[2]);
try{
 const p=await init({viewport:{width:1440,height:1000}});
 test('3D scene loads as the home without opening a dialog',await p.locator('#three-stage canvas').count()===1&&await p.locator('dialog[open]').count()===0);
 test('original room view removed',await p.locator('#reference-toggle,#reference-view,#room-photo').count()===0);
 test('actual Ruway logo in header',await p.locator('.ruway-logo img').getAttribute('src')==='assets/ruway-logo.png');
 await snap(p,'desktop-home');await p.locator('[data-enter]').first().click();await p.waitForTimeout(650);await snap(p,'desktop-sala');
 test('music begins after entry gesture',await p.evaluate(()=>window.__review.audio.ctx?.state==='running'&&window.__review.audio.master.gain.value>.03));
 await p.locator('.tour-top [data-menu]').click();await snap(p,'desktop-menu');
 test('six works retained',await p.locator('#drawer-links button').count()===6);
 test('Elisa stays a story but not a footer social link',await p.locator('#drawer-links [data-story="instagram"]').count()===1&&await p.locator('.drawer-footer [href*="instagram"]').count()===0);
 test('future Ruway social section present',await p.locator('.future-socials').innerText().then(t=>t.includes('Redes de Ruway')&&t.includes('Próximamente')));
 await p.locator('#drawer-links [data-story="podcast"]').click();await p.waitForTimeout(500);
 test('music continues while reading podcast description',await p.evaluate(()=>window.__review.audio.active&&!window.__review.audio.ducked&&window.__review.audio.master.gain.value>.05));
 await p.locator('.story-content summary').click();await snap(p,'podcast-description');
 test('new exact podcast synopsis loaded',await p.locator('.story-content details p').innerText().then(t=>t.startsWith('Esther no sabe que el día más doloroso')&&t.endsWith('hasta su vida adulta.')));
 await p.keyboard.press('Escape');
 await p.locator('.tour-top [data-contact]').click();await snap(p,'desktop-contact');
 test('contact opens form with three required fields',await p.locator('#contact-form input[required],#contact-form textarea[required]').count()===3);
 await p.locator('.contact-submit').click();test('empty contact form is rejected',await p.locator('#contact-name').evaluate(e=>!e.validity.valid));
 await p.locator('#contact-name').fill('Prueba local');await p.locator('#contact-email').fill('prueba@example.test');await p.locator('#contact-message').fill('Mensaje de prueba local; no se enviará.');await p.locator('.contact-submit').click();await p.waitForSelector('[data-k-state="unavailable"]');
 test('local form never claims delivery',await p.locator('#contact-status').innerText().then(t=>t.includes('aún no está activado')));
 test('music continues in contact dialog',await p.evaluate(()=>!window.__review.audio.ducked));await p.keyboard.press('Escape');
 await p.evaluate(()=>{window.__samples=[];window.__sampleTimer=setInterval(()=>window.__samples.push(window.__review.house.getState()),60);});
 for(const room of ['comedor','cocina','cuarto','sala']){await arrive(p,room);test(`continuous safe route to ${room}`,(await state(p)).walkable);await snap(p,`desktop-${room}`);}
 const chairs=(await state(p)).chairs;test('exactly four dining chairs',chairs.length===4);test('all dining chairs face table',chairs.every(c=>Math.sin(c.rotation)*(2.8-c.x)+Math.cos(c.rotation)*(2.85-c.z)>0));
 let before=(await state(p)).position;await p.mouse.move(600,650);await p.mouse.wheel(0,450);await p.waitForTimeout(1000);test('scroll moves forward',distance(before,(await state(p)).position)>.15);
 before=(await state(p)).position;await p.mouse.wheel(0,-450);await p.waitForTimeout(1000);test('scroll moves backward',distance(before,(await state(p)).position)>.15);test('scroll remains inside the 3D home',await p.evaluate(()=>scrollY===0));
 await arrive(p,'sala');
 const point=await p.evaluate(async()=>{const THREE=await import('./vendor/three.module.js');const s=window.__review.house.getState(),r=document.querySelector('#three-stage').getBoundingClientRect(),c=new THREE.PerspectiveCamera(67,r.width/r.height,.05,70);c.position.fromArray(s.position);c.rotation.set(s.rotation[0],s.rotation[1],0,'YXZ');c.updateMatrixWorld();const v=new THREE.Vector3(-1.3,.01,2).project(c);return {x:(v.x*.5+.5)*r.width,y:(-v.y*.5+.5)*r.height};});
 before=(await state(p)).position;await p.mouse.click(point.x,point.y);await routeDone(p);test('clicking visible floor walks there',distance(before,(await state(p)).position)>.4);
 await arrive(p,'cocina');await p.evaluate(()=>window.__review.house.walkTo({x:.65,z:-1.45}));await routeDone(p);
 const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));let diff=wrap(Math.PI/2-(await state(p)).rotation[1]);const key=diff>0?'ArrowLeft':'ArrowRight';await p.locator('#three-stage').focus();await p.keyboard.down(key);
 for(let n=0;n<140;n++){await p.waitForTimeout(25);const next=wrap(Math.PI/2-(await state(p)).rotation[1]);if(Math.abs(next)<.035||Math.sign(next)!==Math.sign(diff))break;}
 await p.keyboard.up(key);await p.keyboard.down('ArrowUp');await p.waitForTimeout(1150);await p.keyboard.up('ArrowUp');
 const crossed=await state(p);test('keyboard crosses kitchen doorway into bedroom',crossed.position[0]<-.35&&crossed.room==='cuarto'&&crossed.walkable);await snap(p,'doorway-crossed-on-foot');
 await p.evaluate(()=>clearInterval(window.__sampleTimer));const samples=await p.evaluate(()=>window.__samples);test('all sampled movement stays outside collision volumes',samples.every(s=>s.walkable));test('room routes do not teleport through barriers',samples.every((s,i)=>!i||distance(s.position,samples[i-1].position)<.7));
 await p.locator('.tour-top [data-menu]').click();await p.locator('#drawer-links [data-story="videoclip"]').click();await p.route('https://www.youtube-nocookie.com/**',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><title>Isolated player test</title>'}));await p.locator('[data-play="videoclip"]').click();await p.waitForTimeout(500);test('music yields only when a player starts',await p.evaluate(()=>window.__review.audio.ducked));await p.locator('.player-actions button').click();await p.waitForTimeout(500);test('music resumes when player closes',await p.evaluate(()=>!window.__review.audio.ducked&&window.__review.audio.master.gain.value>.05));await p.keyboard.press('Escape');
 for(const [width,height] of [[390,844],[320,667],[844,390]]){
  const phone=await init({viewport:{width,height},isMobile:true,hasTouch:true});await snap(phone,`home-${width}`);test(`${width}px home has no overflow`,await phone.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&document.documentElement.scrollHeight<=innerHeight));
  await phone.locator('[data-sound]').click();await phone.locator('#welcome [data-enter]').click();await arrive(phone,'cuarto');await snap(phone,`cuarto-${width}`);test(`${width}px touch controls visible`,await phone.locator('.touch-controls').isVisible());
  await phone.locator('.tour-top [data-menu]').click();await snap(phone,`menu-${width}`);test(`${width}px menu footer is reachable`,await phone.locator('.drawer-footer').evaluate(e=>e.getBoundingClientRect().bottom<=innerHeight));await phone.locator('.drawer-contact').click();await snap(phone,`contact-${width}`);test(`${width}px contact fits horizontally`,await phone.locator('#contact-dialog').evaluate(e=>e.scrollWidth<=innerWidth));await phone.context().close();
 }
 const fail=await browser.newContext({viewport:{width:390,height:844}}),fp=await fail.newPage();await fp.route('**/house.js',r=>r.abort());await fp.goto(base);await fp.waitForSelector('#tour-unavailable:not([hidden])');test('3D failure has honest state without photo substitute',await fp.locator('#reference-view').count()===0);await fp.locator('#tour-unavailable [data-menu]').click();test('stories still accessible after 3D failure',await fp.locator('#drawer-links button').count()===6);
 const privateResponse=await p.request.get(base+'api/config.php');test('preview blocks private PHP configuration',privateResponse.status()===404||privateResponse.status()===403);
 test('no uncaught browser errors',errors.length===0);
}finally{await browser.close();await new Promise(r=>server.close(r));await fs.writeFile('review/v2/results.json',JSON.stringify({results,errors},null,2));console.log(JSON.stringify({passed:results.filter(r=>r.pass).length,total:results.length,failures:results.filter(r=>!r.pass),errors},null,2));}

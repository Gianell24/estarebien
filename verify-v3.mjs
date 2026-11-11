import {createRequire} from 'node:module';
import fs from 'node:fs/promises';
const require=createRequire(new URL('./tools/package.json',import.meta.url)),{chromium}=require('playwright-core');
const {startStaticServer}=await import('./tools/server.mjs');
const server=await startStaticServer('site'),base=`http://127.0.0.1:${server.address().port}/`,browser=await chromium.launch({channel:'chrome'});
const app=(await fs.readFile('site/app.js','utf8')).replace('house.setActive(true);syncModal();','window.__review={house,audio};house.setActive(true);syncModal();');
const results=[],errors=[],stats=[];const check=(name,pass,detail)=>{results.push({name,pass:!!pass,...(detail?{detail}: {})});if(!pass)console.log('FAIL',name,detail||'');};
const state=p=>p.evaluate(()=>window.__review.house.getState()),distance=(a,b)=>Math.hypot(a[0]-b[0],a[2]-b[2]);
async function page(options){const context=await browser.newContext(options),p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));await p.route('**/app.js',r=>r.fulfill({contentType:'text/javascript',body:app}));await p.route('https://www.youtube-nocookie.com/**',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><title>Isolated video player test</title>'}));await p.route('https://heyzine.com/**',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><title>Isolated book reader test</title>'}));await p.goto(base);await p.waitForFunction(()=>!!window.__review);await p.evaluate(()=>document.fonts.ready);return p;}
async function entered(p){await p.locator('#welcome [data-enter]').click();await p.waitForFunction(()=>window.__review.house.getState().phase==='inside');await p.waitForTimeout(100);}
async function arrive(p,room){await p.locator(`[data-room="${room}"]`).click();await p.waitForFunction(room=>{const s=window.__review.house.getState();return s.room===room&&!s.transition;},room);await p.waitForTimeout(80);}
async function story(p,id){await p.locator('.tour-top [data-menu]').click();await p.locator(`#drawer-links [data-story="${id}"]`).click();await p.waitForTimeout(350);}
async function finished(p){await p.waitForFunction(()=>{const s=window.__review.house.getState();return !s.routeLength&&!s.transition&&!s.looking;});await p.waitForTimeout(100);}
try{
 const p=await page({viewport:{width:1440,height:1000}});
 check('Home starts behind a closed 3D door',(await state(p)).phase==='closed'&&(await state(p)).doorAngle===0);
 check('Prominent entrance CTA and hand hint',await p.locator('#welcome .enter-button').evaluate(e=>e.getBoundingClientRect().height>=70)&&await p.locator('#door-handle').isVisible());
 await p.locator('#door-handle').click();await p.waitForTimeout(550);const opening=await state(p);check('Clicking the handle animates the door',opening.phase==='opening'&&opening.doorAngle>0&&opening.doorAngle<1.64);
 await p.waitForFunction(()=>window.__review.house.getState().phase==='inside');await p.waitForTimeout(100);
 check('Entrance settles in living room on walkable floor',(await state(p)).room==='sala'&&(await state(p)).walkable);
 check('Instrumental starts after entry gesture',await p.evaluate(()=>window.__review.audio.ctx?.state==='running'&&!window.__review.audio.ducked));
 check('Real cream Ruway mark only in footer',await p.locator('.house-footer .footer-ruway').count()===1&&await p.locator('.ruway-logo[data-home]').count()===0);
 check('Requested footer credit text',await p.locator('.house-footer').innerText().then(t=>t.includes('© 2026 Lo Que Estaré Bien. Cortometraje transmedia.')&&t.includes('Risen Studios')));
 for(const room of ['comedor','cocina','cuarto','sala']){await arrive(p,room);const s=await state(p);check(`Room shortcut settles immediately without residual path: ${room}`,s.walkable&&s.routeLength===0&&!s.looking);stats.push({room,...s});}
 const chairs=(await state(p)).chairs;check('Four chairs face the table',chairs.length===4&&chairs.every(c=>Math.sin(c.rotation)*(2.8-c.x)+Math.cos(c.rotation)*(2.85-c.z)>0));
 for(const id of ['videoclip','libro','instagram','podcast','comic','corto']){
  await story(p,id);check(`Music continues in ${id} description`,await p.evaluate(()=>!window.__review.audio.ducked));
  await p.locator('[data-find-story]').click();await finished(p);const first=await state(p);
  await story(p,id);const before=(await state(p)).position;await p.locator('[data-find-story]').click();await finished(p);const after=await state(p);
  check(`Find ${id} does not move an already-present visitor`,distance(before,after.position)<.001&&after.routeLength===0&&after.walkable);
  const orientation=after.rotation;await p.waitForTimeout(180);check(`Camera stays still after finding ${id}`,JSON.stringify(orientation)===JSON.stringify((await state(p)).rotation));
 }
 await arrive(p,'sala');await p.evaluate(()=>window.__review.house.walkTo({x:-1.3,z:2}));await p.waitForTimeout(150);await story(p,'videoclip');const stopped=(await state(p)).position;check('Opening a story cancels the old walking route',(await state(p)).routeLength===0);await p.keyboard.press('Escape');await p.waitForTimeout(500);check('Closing story never resumes a stale route',distance(stopped,(await state(p)).position)<.001);
 // Floor clicks keep the viewing angle rather than steering toward grid corners.
 await arrive(p,'sala');const projected=await p.evaluate(async()=>{const THREE=await import('./vendor/three.module.js'),s=window.__review.house.getState(),r=document.querySelector('#three-stage').getBoundingClientRect(),c=new THREE.PerspectiveCamera(67,r.width/r.height,.05,70);c.position.fromArray(s.position);c.rotation.set(s.rotation[0],s.rotation[1],0,'YXZ');c.updateMatrixWorld();const v=new THREE.Vector3(-1.3,.01,2).project(c);return {x:(v.x*.5+.5)*r.width,y:(-v.y*.5+.5)*r.height};});
 let before=await state(p);await p.mouse.click(projected.x,projected.y);await finished(p);check('Visible floor click moves through the house',distance(before.position,(await state(p)).position)>.5);check('Floor navigation preserves a stable viewing direction',Math.abs(before.rotation[1]-(await state(p)).rotation[1])<.01);
 before=await state(p);await p.mouse.move(650,600);await p.mouse.wheel(0,330);await p.waitForTimeout(700);check('Scroll advances within the scene',distance(before.position,(await state(p)).position)>.1&&await p.evaluate(()=>scrollY===0));
 // Physical doorway crossing, independent of room shortcuts.
 await arrive(p,'cocina');await p.evaluate(()=>window.__review.house.walkTo({x:.65,z:-1.45}));await finished(p);
 const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));let diff=wrap(Math.PI/2-(await state(p)).rotation[1]);let key=diff>0?'ArrowLeft':'ArrowRight';await p.locator('#three-stage').focus();await p.keyboard.down(key);
 for(let i=0;i<150;i++){await p.waitForTimeout(20);const d=wrap(Math.PI/2-(await state(p)).rotation[1]);if(Math.abs(d)<.09||Math.sign(d)!==Math.sign(diff))break;}
 await p.keyboard.up(key);await p.waitForTimeout(150);await p.keyboard.down('ArrowUp');await p.waitForTimeout(1050);await p.keyboard.up('ArrowUp');await p.waitForTimeout(150);check('Keyboard crosses kitchen to bedroom without barrier',(await state(p)).position[0]<-.3&&(await state(p)).walkable);
 for(const id of ['libro','comic']){await story(p,id);await p.locator(`[data-play="${id}"]`).click();check(`${id} opens an embedded Heyzine reader`,await p.locator('.flipbook-player iframe').getAttribute('src').then(src=>src.startsWith('https://heyzine.com/flip-book/')));check(`Instrumental continues while reading ${id}`,await p.evaluate(()=>!window.__review.audio.ducked));await p.getByRole('button',{name:'Cerrar lectura',exact:true}).click();check(`${id} reader closes within site`,await p.locator('.media-player').count()===0);await p.keyboard.press('Escape');}
 await story(p,'podcast');check('Four original episode covers are complete',await p.locator('.episode-card img').count()===4&&await p.locator('.episode-card img').evaluateAll(imgs=>imgs.every(i=>i.complete&&i.naturalWidth>0)));
 const ids=['_Qfb3CZEx3U','53lYozWhwqk','KY5vfdY8BxA','gLvBOfHRjVM'];
 for(let i=0;i<4;i++){await p.locator(`[data-episode="ep-${i+1}"]`).click();check(`Episode ${i+1} uses its correct embedded video`,await p.locator('.media-player iframe').getAttribute('src').then(src=>src.includes('/'+ids[i]+'?')));check(`Music yields to episode ${i+1}`,await p.evaluate(()=>window.__review.audio.ducked));await p.getByRole('button',{name:'Cerrar reproductor',exact:true}).click();check(`Instrumental returns after episode ${i+1}`,await p.evaluate(()=>!window.__review.audio.ducked));}
 await p.keyboard.press('Escape');await p.locator('[data-home]').click();check('Estaré bien returns to the closed-door home',(await state(p)).phase==='closed'&&await p.locator('#welcome').isVisible());await entered(p);check('Entry works again after returning home',(await state(p)).phase==='inside');
 // Resize/touch regressions, including a short landscape viewport.
 for(const [width,height] of [[390,844],[320,667],[844,390]]){
  const phone=await page({viewport:{width,height},deviceScaleFactor:3,isMobile:true,hasTouch:true});
  check(`${width}px entrance and footer fit horizontally`,await phone.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await entered(phone);await arrive(phone,'cuarto');
  check(`${width}px readable label does not overlap movement controls`,await phone.evaluate(()=>{const a=document.querySelector('.room-caption').getBoundingClientRect(),b=document.querySelector('.touch-controls').getBoundingClientRect();return a.right<=b.left||a.bottom<=b.top||a.top>=b.bottom;}));
  check(`${width}px efficient rendering budget`,(await state(phone)).drawCalls<100&&(await state(phone)).pixelRatio<=1.15);
  const s=await state(phone);const btn=phone.locator('[data-move="ArrowLeft"]'),box=await btn.boundingBox();await phone.mouse.move(box.x+20,box.y+20);await phone.mouse.down();await phone.waitForTimeout(500);await phone.mouse.up();await phone.waitForTimeout(250);check(`${width}px hold controls turn and stop`,Math.abs((await state(phone)).rotation[1]-s.rotation[1])>.2);
  await story(phone,'podcast');await phone.locator('[data-episode="ep-4"]').click();check(`${width}px last podcast episode remains reachable`,await phone.locator('.media-player iframe').getAttribute('src').then(s=>s.includes(ids[3])));await phone.keyboard.press('Escape');
  await phone.locator('.tour-top [data-contact]').click();check(`${width}px contact still has all fields`,await phone.locator('#contact-form [required]').count()===3);await phone.keyboard.press('Escape');stats.push({width,...await state(phone)});await phone.context().close();
 }
 const reduced=await page({viewport:{width:390,height:844},reducedMotion:'reduce'});await entered(reduced);await arrive(reduced,'comedor');check('Reduced motion skips entry travel and room animation',(await state(reduced)).phase==='inside'&&!(await state(reduced)).transition);await reduced.context().close();
 const fail=await browser.newContext(),fp=await fail.newPage();await fp.route('**/house.js',r=>r.abort());await fp.goto(base);await fp.waitForSelector('#tour-unavailable:not([hidden])');await fp.locator('#tour-unavailable [data-menu]').click();check('WebGL failure preserves access to all six stories',await fp.locator('#drawer-links button').count()===6);await fail.close();
 check('No uncaught browser errors',errors.length===0);
}finally{await fs.writeFile('review/v3/results.json',JSON.stringify({results,errors,stats},null,2));console.log(JSON.stringify({passed:results.filter(t=>t.pass).length,total:results.length,failures:results.filter(t=>!t.pass),errors},null,2));await browser.close();await new Promise(r=>server.close(r));}

import {createRequire} from 'node:module';import fs from 'node:fs/promises';
const require=createRequire(new URL('./tools/package.json',import.meta.url)),{chromium}=require('playwright-core');const {startStaticServer}=await import('./tools/server.mjs');
const server=await startStaticServer('site'),browser=await chromium.launch({channel:'chrome'}),page=await browser.newPage({viewport:{width:1440,height:1000}});
try{
 const app=(await fs.readFile('site/app.js','utf8')).replace('house.setActive(true);syncModal();','window.__review={house,audio};house.setActive(true);syncModal();');
 const house=(await fs.readFile('site/house.js','utf8')).replace('const hit=raycaster.intersectObjects(scene.children,true)[0];','const hit=raycaster.intersectObjects(scene.children,true)[0];window.__pick=hit?{walkable:hit.object.userData.walkable,point:hit.point.toArray(),geometry:hit.object.geometry.type}:null;');
 await page.route('**/app.js',r=>r.fulfill({contentType:'text/javascript',body:app}));await page.route('**/house.js',r=>r.fulfill({contentType:'text/javascript',body:house}));await page.goto(`http://127.0.0.1:${server.address().port}/`);await page.waitForFunction(()=>!!window.__review);await page.locator('[data-sound]').click();await page.locator('#welcome [data-enter]').click();
 for(const point of [[-1.1,.01,3.8],[-1.3,.01,2]]){
  await page.locator('[data-room="sala"]').click();await page.waitForFunction(()=>window.__review.house.getState().routeLength===0);
  const p=await page.evaluate(async point=>{const T=await import('./vendor/three.module.js'),s=window.__review.house.getState(),r=document.querySelector('#three-stage').getBoundingClientRect(),c=new T.PerspectiveCamera(67,r.width/r.height,.05,70);c.position.fromArray(s.position);c.rotation.set(s.rotation[0],s.rotation[1],0,'YXZ');c.updateMatrixWorld();const v=new T.Vector3(...point).project(c),x=(v.x*.5+.5)*r.width,y=(-v.y*.5+.5)*r.height,e=document.elementFromPoint(x,y);return {x,y,element:e?.tagName,className:e?.className};},point);
  const before=await page.evaluate(()=>window.__review.house.getState());await page.mouse.click(p.x,p.y);await page.waitForTimeout(300);const picked=await page.evaluate(()=>window.__pick);await page.waitForFunction(()=>window.__review.house.getState().routeLength===0);const after=await page.evaluate(()=>window.__review.house.getState());console.log(JSON.stringify({point,p,picked,before:before.position,after:after.position}));
 }
}finally{await browser.close();await new Promise(r=>server.close(r));}

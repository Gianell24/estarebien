import {createRequire} from 'node:module';
import fs from 'node:fs/promises';
const require=createRequire(new URL('./tools/package.json',import.meta.url));const {chromium}=require('playwright-core');
const {startStaticServer}=await import('./tools/server.mjs');await fs.mkdir('review/v3',{recursive:true});
const server=await startStaticServer('site'),base=`http://127.0.0.1:${server.address().port}/`,browser=await chromium.launch({channel:'chrome'});
const app=(await fs.readFile('site/app.js','utf8')).replace('house.setActive(true);syncModal();','window.__review={house,audio};house.setActive(true);syncModal();');
const house=(await fs.readFile('site/house.js','utf8')).replace('closedPose();resize();renderer.compile(scene,camera);','window.__geometry={scene,camera,renderer,render:()=>{dirty=true;request();}};closedPose();resize();renderer.compile(scene,camera);');
const errors=[],states=[];
try{
 for(const [width,height] of [[1440,1000],[390,844],[320,667],[844,390]]){
  const context=await browser.newContext({viewport:{width,height},isMobile:width<900,hasTouch:width<900}),p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));
  await p.route('**/app.js',r=>r.fulfill({contentType:'text/javascript',body:app}));await p.route('**/house.js',r=>r.fulfill({contentType:'text/javascript',body:house}));
  await p.goto(base);await p.waitForFunction(()=>!!window.__review,{timeout:20000});await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(700);
  await p.screenshot({path:`review/v3/door-${width}.png`});console.log('door',width);
  await p.locator('#welcome [data-enter]').click();await p.waitForFunction(()=>window.__review.house.getState().phase==='inside',null,{timeout:15000});await p.waitForTimeout(150);
  await p.screenshot({path:`review/v3/sala-${width}.png`});
  if(width===1440){
   for(const room of ['comedor','cocina','cuarto']){await p.locator(`[data-room="${room}"]`).click();await p.waitForTimeout(650);await p.screenshot({path:`review/v3/${room}-${width}.png`});}
   await p.locator('.tour-top [data-menu]').click();await p.locator('#drawer-links [data-story="comic"]').click();await p.locator('[data-find-story]').click();await p.waitForTimeout(700);await p.screenshot({path:'review/v3/laptop-1440.png'});
   await p.locator('.tour-top [data-menu]').click();await p.locator('#drawer-links [data-story="podcast"]').click();await p.waitForTimeout(600);await p.screenshot({path:'review/v3/podcast-1440.png'});await p.keyboard.press('Escape');
   for(const [name,pos,target] of [['kitchen-detail',[1.5,1.55,-3.35],[1.85,1.1,-4.43]],['table-detail',[1.1,1.7,4.8],[2.8,1.1,2.85]]]){
    await p.evaluate(({pos,target})=>{const {camera,render}=window.__geometry;camera.position.fromArray(pos);camera.lookAt(...target);render();},{pos,target});await p.waitForTimeout(160);await p.screenshot({path:`review/v3/${name}.png`});
   }
  }else{
   await p.locator('[data-room="cuarto"]').click();await p.waitForTimeout(650);await p.screenshot({path:`review/v3/cuarto-${width}.png`});
   await p.locator('.tour-top [data-menu]').click();await p.locator('#drawer-links [data-story="podcast"]').click();await p.waitForTimeout(600);await p.screenshot({path:`review/v3/podcast-${width}.png`});
  }
  states.push({width,...await p.evaluate(()=>window.__review.house.getState())});await context.close();
 }
}finally{await fs.writeFile('review/v3/capture-state.json',JSON.stringify({errors,states},null,2));console.log(JSON.stringify({errors,states},null,2));await browser.close();await new Promise(r=>server.close(r));}

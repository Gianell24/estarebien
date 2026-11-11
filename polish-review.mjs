import {createRequire} from 'node:module';
import fs from 'node:fs/promises';
const require=createRequire(new URL('./tools/package.json',import.meta.url));
const {chromium}=require('playwright-core');
const {startStaticServer}=await import('./tools/server.mjs');
const server=await startStaticServer('site');
const base=`http://127.0.0.1:${server.address().port}/`;
const browser=await chromium.launch({channel:'chrome'});
const results=[],errors=[];
function test(test,pass){results.push({test,pass:!!pass});if(!pass)console.error('FAIL',test);}
async function settled(page){await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(650);}
async function capture(page,name){await settled(page);await page.screenshot({path:`review/${name}.png`});}
async function enter(page){await page.locator('.hero [data-sound]').click();await page.locator('.hero [data-enter]').click();await page.waitForSelector('#tour-loading[hidden]',{state:'attached',timeout:30000});if(await page.locator('#dismiss-help').isVisible())await page.locator('#dismiss-help').click();await page.waitForTimeout(1100);}
async function init(options){const context=await browser.newContext(options);const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(base);await page.waitForSelector('.story-row');await settled(page);return page;}
try{
  if(!process.argv.includes('--media-only')){
  for(const [name,width,height] of [['desktop',1440,1000],['ultrawide',2560,1080],['mobile',390,844]]){
    const page=await init({viewport:{width,height},hasTouch:name==='mobile',isMobile:name==='mobile'});
    for(const [section,selector] of [['home','#inicio'],['beginning','#comienzo'],['room','.house-preview'],['index','.stories-heading'],['index-bottom','.story-row[data-story="podcast"]'],['closing','.site-footer']]){
      await page.locator(selector).evaluate((e,section)=>e.scrollIntoView({block:section==='home'?'start':'center',behavior:'instant'}),section);await capture(page,`${name}-${section}-settled`);
    }
    await page.locator('.site-header [data-menu]').click();await capture(page,`${name}-menu-settled`);await page.keyboard.press('Escape');
    await page.locator('.story-row[data-story="corto"]').click();await capture(page,`${name}-story-settled`);await page.locator('.story-content summary').click();await page.locator('.story-content details').scrollIntoViewIfNeeded();await capture(page,`${name}-synopsis-settled`);await page.keyboard.press('Escape');
    test(`${name} page has no horizontal overflow`,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    if(name==='ultrawide')continue;
    await enter(page);await page.locator('[data-room="cuarto"]').click();await page.waitForTimeout(5000);await capture(page,`${name}-cuarto-settled`);
    if(name==='mobile'){
      const overlap=await page.evaluate(()=>{const a=document.querySelector('.room-caption').getBoundingClientRect(),b=document.querySelector('.touch-controls').getBoundingClientRect();return a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;});
      test('mobile bedroom caption does not cover touch controls',!overlap);
      test('mobile bedroom has a visible film discovery',await page.locator('[data-hotspot="corto"]').isVisible());
    }
    await page.locator('#reference-toggle').click();
    for(const room of ['sala','cuarto']){
      await page.locator(`[data-room="${room}"]`).click();await capture(page,`${name}-reference-${room}`);
      test(`${name} ${room} photo labels remain on screen`,await page.locator('#photo-hotspots .hotspot-label').evaluateAll(es=>es.every(e=>{const b=e.getBoundingClientRect();return b.left>=0&&b.right<=innerWidth&&b.top>=0&&b.bottom<=innerHeight;})));
    }
  }
  const tablet=await init({viewport:{width:1024,height:768},hasTouch:true,isMobile:true});await enter(tablet);test('landscape tablet has touch controls',await tablet.locator('.touch-controls').isVisible());await capture(tablet,'tablet-house');
  const failure=await browser.newContext({viewport:{width:390,height:844}}),fp=await failure.newPage();await fp.route('**/house.js',r=>r.abort());await fp.goto(base);await fp.waitForSelector('.story-row');await fp.locator('.hero [data-sound]').click();await fp.locator('.hero [data-enter]').click();await fp.waitForSelector('#reference-view:not([hidden])');await fp.locator('[data-room="cuarto"]').click();await capture(fp,'mobile-fallback-settled');test('unavailable 3D return is hidden in fallback',!await fp.locator('#reference-toggle').isVisible());
  }
  const future=JSON.parse(await fs.readFile('site/content.json','utf8'));
  for(const [id,type,url] of [['corto','video','assets/future-film.mp4'],['podcast','audio','assets/future-podcast.mp3']]){Object.assign(future.stories.find(s=>s.id===id),{type,url,ready:true,status:'Disponible',action:'Reproducir'});}
  future.trailer={type:'youtube',url:'https://youtu.be/Ex5ZqdjARbQ',youtubeId:'Ex5ZqdjARbQ'};
  const context=await browser.newContext({viewport:{width:1440,height:1000}}),media=await context.newPage();
  await media.route('**/content.json',r=>r.fulfill({json:future}));
  await media.route('**/future-film.mp4',r=>r.fulfill({path:'review/media-fixture.mp4',contentType:'video/mp4'}));
  await media.route('**/future-podcast.mp3',r=>r.fulfill({path:'review/media-fixture.mp3',contentType:'audio/mpeg'}));
  await media.route('https://www.youtube-nocookie.com/**',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><title>Isolated embed test</title>'}));
  await media.goto(base);await media.waitForSelector('.story-row');
  for(const [id,tag] of [['corto','video'],['podcast','audio']]){
    await media.locator(`.story-row[data-story="${id}"]`).click();await media.locator(`[data-play="${id}"]`).click();await media.waitForFunction(tag=>document.querySelector(`.media-player ${tag}`)?.currentTime>.1,tag);test(`future ${id} can play local ${tag}`,true);await media.keyboard.press('Escape');await media.locator('.media-player').waitFor({state:'detached'});test(`${id} playback element removed on close`,await media.locator('.media-player').count()===0);
  }
  await media.locator('.story-row[data-story="corto"]').click();test('future trailer appears from manifest',await media.locator('[data-play="trailer"]').isVisible());await media.locator('[data-play="trailer"]').click();test('trailer uses configured video ID',await media.locator('iframe').getAttribute('src').then(s=>s.includes('/embed/Ex5ZqdjARbQ')));await media.keyboard.press('Escape');
  await media.locator('.story-row[data-story="videoclip"]').click();await media.locator('[data-play="videoclip"]').click();test('videoclip embed and external fallback agree',await media.locator('iframe').getAttribute('src').then(s=>s.includes('/embed/Ex5ZqdjARbQ'))&&await media.locator('.external-player').getAttribute('href')==='https://youtu.be/Ex5ZqdjARbQ');
  test('no uncaught errors during polish checks',errors.length===0);
}finally{await browser.close();await new Promise(r=>server.close(r));await fs.writeFile('review/polish-results.json',JSON.stringify({results,errors},null,2));console.log(JSON.stringify({passed:results.filter(r=>r.pass).length,total:results.length,failures:results.filter(r=>!r.pass),errors},null,2));}

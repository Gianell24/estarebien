import {HouseAudio} from './audio.js';
import {setupContact} from './contact.js';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const audio=new HouseAudio(),dialogs=$$('dialog'),drawer=$('#drawer'),storyDialog=$('#story-dialog');
const roomMeta={sala:{name:'La sala',line:'Donde comienza lo que no se dijo.'},comedor:{name:'El comedor',line:'Lo que parece estar bien, al otro lado de la pantalla.'},cocina:{name:'La cocina',line:'Una voz que viene de antes.'},cuarto:{name:'El cuarto de Elisa',line:'Todavía hay una luz encendida.'}};
const prepareContact=setupContact();
let content,house,started=false,mediaPlaying=false,lastFocus=new Map(),toastTimer;
function esc(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function safeURL(value){if(!value)return null;try{const url=new URL(value,location.href);return ['http:','https:'].includes(url.protocol)?url.href:null;}catch{return null;}}
function syncModal(){const open=dialogs.some(d=>d.open);document.body.classList.toggle('modal-open',open);audio.duck(mediaPlaying);house?.setPaused(!started||open);}
function openDialog(d){lastFocus.set(d,document.activeElement);if(!d.open)d.showModal();syncModal();}
function closeDialog(d){if(d?.open)d.close();}
for(const d of dialogs){d.addEventListener('close',()=>{if(d===storyDialog){$('.media-player',d)?.remove();mediaPlaying=false;}syncModal();const back=lastFocus.get(d),parent=back?.closest('dialog');if(back?.isConnected&&(parent?.open||!dialogs.some(d=>d.open)))back.focus({preventScroll:true});});d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDialog(d);}});}
function toast(text){$('#toast').textContent=text;$('#toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').hidden=true,4500);}
function soundUI(){for(const b of $$('[data-sound]')){b.setAttribute('aria-pressed',String(audio.enabled));b.setAttribute('aria-label',audio.enabled?'Silenciar música':'Activar música');}$('[data-sound-label]').textContent=audio.enabled?'Con sonido':'Sin sonido';}
function startExperience(){if(started){if(audio.enabled&&audio.ctx?.state==='suspended')audio.start().catch(()=>{});return;}started=true;document.body.classList.remove('home-intro');$('#welcome').hidden=true;$('.room-caption').hidden=false;audio.start().then(soundUI).catch(()=>{audio.enabled=false;soundUI();});syncModal();}
function visit(room){closeDialog(drawer);closeDialog(storyDialog);startExperience();if(!house){toast('La casa todavía se está cargando.');return;}if(room&&!house.goTo(room))toast('Acércate al paso libre para continuar.');$('#three-stage').focus({preventScroll:true});}
function renderContent(){
  $('#drawer-links').innerHTML=content.stories.map(s=>`<button data-story="${esc(s.id)}"><span>${esc(s.kind)}</span><strong>${esc(s.title)}</strong></button>`).join('');
  $('#hotspots').innerHTML=content.stories.map(s=>`<button class="hotspot" data-story="${esc(s.id)}" data-hotspot="${esc(s.id)}" aria-label="Abrir ${esc(s.kind)} ${esc(s.title)}, ${esc(s.object)}" hidden><span class="hotspot-ring" aria-hidden="true"></span><span class="hotspot-label"><small>${esc(s.kind)}</small>${esc(s.title)}</span></button>`).join('');
}
function showStory(id){
  const s=content?.stories.find(s=>s.id===id);if(!s)return;closeDialog(drawer);startExperience();mediaPlaying=false;$('.media-player',storyDialog)?.remove();
  const url=safeURL(s.url),media=['youtube','video','audio'].includes(s.type)&&url;
  const action=media?`<button class="solid-button" data-play="${esc(id)}">${esc(s.action)} <span aria-hidden="true">▷</span></button>`:url?`<a class="solid-button" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(s.action)} <span aria-hidden="true">↗</span></a>`:`<p class="pending-note">Esta obra está ${id==='corto'?'en proceso de grabación':'en preparación'}. La encontrarás aquí cuando esté lista.</p><a class="solid-button" href="${esc(content.youtube)}" target="_blank" rel="noopener noreferrer">Visitar el canal de Ruway ↗</a>`;
  const trailer=id==='corto'&&safeURL(content.trailer?.url)?'<button class="text-link trailer-button" data-play="trailer">Ver tráiler <span aria-hidden="true">▷</span></button>':'';
  const poster=id==='videoclip'?`<div class="story-art poster-art"><img src="${esc(s.image)}" alt="Póster original de Estoy bien" width="1000" height="1413"></div>`:'';
  $('#story-body').innerHTML=`<div class="story-layout ${poster?'':'story-text-only'}">${poster}<article class="story-content"><p class="eyebrow">${esc(s.kind)} · ${esc(s.number)} / 06</p><h2 id="story-title">${esc(s.title)}</h2><p class="story-status">${s.ready?'<span class="status-dot"></span>':''}${esc(s.status)}</p><p class="excerpt">${esc(s.excerpt)}</p><details><summary>Leer la sinopsis</summary><p>${esc(s.synopsis)}</p></details>${action}${trailer}<p class="story-object">${esc(s.object)} · <button data-find-room="${esc(s.room)}">Encontrarlo en la casa</button></p></article></div>`;
  openDialog(storyDialog);storyDialog.scrollTop=0;
}
function youtubeID(url){try{const u=new URL(url);return u.hostname==='youtu.be'?u.pathname.slice(1):u.searchParams.get('v')||u.pathname.split('/').pop();}catch{return null;}}
function playStory(id){
  const s=id==='trailer'?{...content.trailer,title:'Estaré bien',kind:'Tráiler'}:content.stories.find(s=>s.id===id);if(!s)return;
  $('.media-player',storyDialog)?.remove();const player=document.createElement('div');player.className='media-player';let el;
  if(s.type==='youtube'){
    const vid=s.youtubeId||youtubeID(s.url);if(!/^[a-zA-Z0-9_-]{11}$/.test(vid||'')){toast('Este video todavía no tiene un enlace válido.');return;}
    el=document.createElement('iframe');el.src=`https://www.youtube-nocookie.com/embed/${vid}?autoplay=1&rel=0`;el.title=`${s.kind}: ${s.title}`;el.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';el.referrerPolicy='strict-origin-when-cross-origin';el.allowFullscreen=true;mediaPlaying=true;
  }else{
    el=document.createElement(s.type==='audio'?'audio':'video');el.src=safeURL(s.url);el.controls=true;el.autoplay=true;el.setAttribute('playsinline','');mediaPlaying=true;
    for(const event of ['play','pause','ended','error'])el.addEventListener(event,()=>{mediaPlaying=event==='play';syncModal();});
  }
  player.append(el);const bar=document.createElement('div');bar.className='player-actions';const link=document.createElement('a');link.href=safeURL(s.url);link.target='_blank';link.rel='noopener noreferrer';link.className='external-player';link.textContent='Abrir en otra pestaña ↗';const close=document.createElement('button');close.className='small-button';close.textContent='Cerrar reproductor';close.addEventListener('click',()=>{player.remove();mediaPlaying=false;syncModal();});bar.append(link,close);player.append(bar);$('#story-body').prepend(player);storyDialog.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});syncModal();
}
function setRoom(room){const m=roomMeta[room];if(!m)return;$('#room-name').textContent=m.name;$('#room-line').textContent=m.line;$$('[data-room]').forEach(b=>b.setAttribute('aria-current',String(b.dataset.room===room)));$('#tour-status').textContent=`${m.name}. ${content?.stories.filter(s=>s.room===room).map(s=>s.object+': '+s.kind+' '+s.title).join('. ')||''}`;}
function projectHotspots(points){for(const p of points){const el=$(`[data-hotspot="${p.id}"]`);if(!el)continue;el.hidden=!p.visible;if(p.visible){el.style.left=`${p.x}px`;el.style.top=`${p.y}px`;el.classList.toggle('is-flipped',p.x>innerWidth-230);}}}
function houseUnavailable(){house?.setActive(false);$('#tour-loading').hidden=true;$('#tour-unavailable').hidden=false;$('#welcome').hidden=true;$('#hotspots').hidden=true;$('.room-caption').hidden=true;document.body.classList.add('house-failed');}
async function loadHouse(){try{const {createHouse}=await import('./house.js');house=await createHouse($('#three-stage'),{onRoom:setRoom,onProject:projectHotspots,onError:houseUnavailable,onInteract:startExperience,onSelectStory:showStory});house.setActive(true);syncModal();$('#tour-loading').hidden=true;}catch(e){console.warn('No se pudo abrir la casa:',e.message);houseUnavailable();}}
document.addEventListener('click',e=>{const b=e.target.closest('button,a');if(!b)return;
  if(b.hasAttribute('data-contact')){closeDialog(drawer);prepareContact();openDialog($('#contact-dialog'));return;}
  if(b.hasAttribute('data-menu')){openDialog(drawer);return;}
  if(b.dataset.close){closeDialog(document.getElementById(b.dataset.close));return;}
  if(b.hasAttribute('data-sound')){audio.toggle();soundUI();return;}
  if(b.dataset.story){showStory(b.dataset.story);return;}
  if(b.dataset.play){playStory(b.dataset.play);return;}
  if(b.hasAttribute('data-home')){e.preventDefault();visit('sala');return;}
  if(b.hasAttribute('data-enter')){visit();return;}
  if(b.dataset.findRoom){visit(b.dataset.findRoom);return;}
  if(b.dataset.room){visit(b.dataset.room);return;}
});
document.addEventListener('keydown',e=>{if(!dialogs.some(d=>d.open)&&['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key))startExperience();});
$('#help-toggle').addEventListener('click',()=>openDialog($('#help-dialog')));
$('#retry-house').addEventListener('click',()=>location.reload());
for(const b of $$('[data-move]')){b.addEventListener('pointerdown',e=>{e.preventDefault();startExperience();b.setPointerCapture(e.pointerId);house?.key(b.dataset.move,true);});for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,()=>house?.key(b.dataset.move,false));}
document.addEventListener('visibilitychange',()=>{audio.suspend();house?.setDocumentVisible(!document.hidden);});window.addEventListener('blur',()=>house?.clearKeys());
try{const response=await fetch('content.json');if(!response.ok)throw Error('content');content=await response.json();renderContent();setRoom('sala');}catch{$('#drawer-links').innerHTML='<p>No se pudieron cargar las historias. <a href="https://www.youtube.com/@Ruway2025" target="_blank" rel="noopener">Visita el canal de Ruway ↗</a></p>';}
soundUI();loadHouse();

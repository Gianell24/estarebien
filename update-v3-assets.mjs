import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
const require=createRequire(new URL('./tools/package.json',import.meta.url)),sharp=require('sharp');
const source='D:/Documentos/CICLO 10/Transmedial 2/NUEVO CORTO DANIEL 2/BRAZOS TRANSMEDIALES/Podcast';
const names=['La tensión','La despedida','El inicio','La promesa'];
const ids=['_Qfb3CZEx3U','53lYozWhwqk','KY5vfdY8BxA','gLvBOfHRjVM'];
for(let i=1;i<=4;i++)await sharp(`${source}/Portada Episodio ${i}.png`).resize({width:1280,withoutEnlargement:true}).webp({quality:88}).toFile(`site/assets/podcast-ep-${i}.webp`);
const content=JSON.parse(await fs.readFile('site/content.json','utf8'));
for(const s of content.stories){
  if(['libro','comic'].includes(s.id)){s.type='flipbook';s.action=s.id==='libro'?'Leer el libro':'Leer el cómic';}
  if(s.id==='podcast'){
    s.ready=true;s.status='4 episodios disponibles';s.type='series';s.image='assets/podcast-ep-1.webp';
    s.episodes=ids.map((id,i)=>({id:`ep-${i+1}`,number:i+1,title:names[i],type:'youtube',youtubeId:id,url:`https://youtu.be/${id}`,image:`assets/podcast-ep-${i+1}.webp`}));
  }
}
await fs.writeFile('site/content.json',JSON.stringify(content,null,2)+'\n');
console.log('Cuatro portadas optimizadas; podcast disponible y flipbooks integrados.');

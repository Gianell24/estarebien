import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(new URL('./tools/package.json',import.meta.url));
const sharp=require('sharp');
const root=process.cwd();
const src='D:/Documentos/CICLO 10/Transmedial 2/NUEVO CORTO DANIEL 2';
await fs.mkdir('photos',{recursive:true});
await fs.mkdir('site/assets/fonts',{recursive:true});
await fs.mkdir('site/vendor',{recursive:true});
const originals={
  poster:`${src}/BRAZOS TRANSMEDIALES/ESTOY BIEN VIDEOCLIP.png`,
  sala:`${src}/Locación/Generados con IA/edits/sala de Elisa.png`,
  cocina:`${src}/Locación/Generados con IA/edits/cocina.png`,
  comedor:`${src}/Locación/Generados con IA/edits/comedor.png`,
  cuarto:`${src}/Locación/Generados con IA/edits/Cuarto de Elisa.png`
};
const result=[];
for(const [name,file] of Object.entries(originals)){
  await fs.copyFile(file,`photos/${name}.png`);
  await sharp(file).resize({width:name==='poster'?1000:1920,withoutEnlargement:true}).webp({quality:88}).toFile(`site/assets/${name}.webp`);
  const meta=await sharp(file).metadata();
  result.push({name,source:file,width:meta.width,height:meta.height,bytes:(await fs.stat(`site/assets/${name}.webp`)).size});
}
const engine='C:/Users/rgp24/.codex/skills/10k-websites/engine';
for(const file of ['scene.js','scene.css','fx.js','fx.css'])await fs.copyFile(path.join(engine,file),`site/${file}`);
for(const file of ['three.module.js','three.core.js'])await fs.copyFile(`.10k/vendor/node_modules/three/build/${file}`,`site/vendor/${file}`);
await fs.copyFile('.10k/vendor/node_modules/three/LICENSE','site/vendor/THREE-LICENSE.txt');
for(const file of ['cormorant-garamond-latin-400-normal.woff2','cormorant-garamond-latin-400-italic.woff2'])await fs.copyFile(`.10k/vendor/node_modules/@fontsource/cormorant-garamond/files/${file}`,`site/assets/fonts/${file}`);
for(const weight of [400,500,600])await fs.copyFile(`.10k/vendor/node_modules/@fontsource/manrope/files/manrope-latin-${weight}-normal.woff2`,`site/assets/fonts/manrope-${weight}.woff2`);
for(const name of ['cormorant-garamond','manrope'])await fs.copyFile(`.10k/vendor/node_modules/@fontsource/${name}/LICENSE`,`site/assets/fonts/${name}-LICENSE.txt`);
await fs.writeFile('.10k/context/asset-manifest.json',JSON.stringify(result,null,2));
console.log(JSON.stringify(result,null,2));

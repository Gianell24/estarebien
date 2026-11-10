import * as THREE from './vendor/three.module.js';

export async function createHouse(container,{onRoom,onProject,onError,onInteract,onSelectStory}){
  const scene=new THREE.Scene();scene.background=new THREE.Color('#25291f');scene.fog=new THREE.FogExp2('#302c20',.015);
  const camera=new THREE.PerspectiveCamera(67,1,.05,70);camera.rotation.order='YXZ';
  const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;container.append(renderer.domElement);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let active=false,paused=true,visible=true,frame=0,last=0,yaw=0,pitch=0,room='sala',route=[],routeLook=null,dirty=true,pointer=null,wheelSpeed=0;
  const keys=new Set(),colliders=[],targets=[],mats=new Map();
  const V=(x,y,z)=>new THREE.Vector3(x,y,z);
  const positions={sala:{p:V(-3.05,1.62,5.15),look:V(-1.15,1.25,2.25)},comedor:{p:V(1.05,1.62,5.3),look:V(2.75,.95,2.5)},cocina:{p:V(2.4,1.62,-.55),look:V(2.4,1.3,-4.1)},cuarto:{p:V(-.75,1.62,-1.15),look:V(-2.75,1.05,-3.5)}};
  let seed=1234;function rand(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
  function canvasTexture(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),8);return t;}
  const wood=canvasTexture(256,512,(c,w,h)=>{c.fillStyle='#68442d';c.fillRect(0,0,w,h);for(let i=0;i<360;i++){c.strokeStyle=`rgba(${rand()>.5?'18,10,3':'191,141,85'},${rand()*.18})`;c.lineWidth=rand()*2+.2;c.beginPath();const x=rand()*w;c.moveTo(x,0);for(let y=0;y<=h;y+=16)c.lineTo(x+Math.sin(y*.018+i)*3,y);c.stroke();}});wood.wrapS=wood.wrapT=THREE.RepeatWrapping;
  const paleWood=canvasTexture(256,512,(c,w,h)=>{c.fillStyle='#c3b08d';c.fillRect(0,0,w,h);for(let i=0;i<190;i++){c.strokeStyle='#4b3c2414';c.beginPath();const x=rand()*w;c.moveTo(x,0);c.bezierCurveTo(x+4,170,x-4,350,x+2,h);c.stroke();}});paleWood.wrapS=paleWood.wrapT=THREE.RepeatWrapping;
  const tiles=canvasTexture(256,256,(c,w,h)=>{c.fillStyle='#b6a386';c.fillRect(0,0,w,h);c.strokeStyle='#79694e';c.lineWidth=2;c.strokeRect(1,1,w-2,h-2);c.translate(128,128);for(let k=0;k<4;k++){c.rotate(Math.PI/2);c.fillStyle='#977957';c.beginPath();c.ellipse(0,40,19,33,0,0,Math.PI*2);c.fill();c.strokeStyle='#d6c5a6';c.lineWidth=3;c.stroke();}c.fillStyle='#b1946d';c.beginPath();c.arc(0,0,20,0,Math.PI*2);c.fill();c.strokeStyle='#e2d4b8';c.stroke();for(let x of [-101,101])for(let y of [-101,101]){c.strokeStyle='#86734f';c.strokeRect(x-10,y-10,20,20);}});tiles.wrapS=tiles.wrapT=THREE.RepeatWrapping;tiles.repeat.set(13,14);
  const parquet=canvasTexture(512,512,(c,w,h)=>{for(let y=0;y<8;y++)for(let x=0;x<4;x++){const l=35+rand()*19;c.fillStyle=`hsl(30 22% ${l}%)`;c.fillRect(x*128,y*64,127,63);c.strokeStyle='#392a1a55';for(let n=0;n<5;n++){c.beginPath();const py=y*64+rand()*64;c.moveTo(x*128,py);c.lineTo(x*128+127,py+rand()*3);c.stroke();}}});parquet.wrapS=parquet.wrapT=THREE.RepeatWrapping;parquet.repeat.set(2,2);
  const plaster=canvasTexture(128,128,(c,w,h)=>{c.fillStyle='#e0d3b8';c.fillRect(0,0,w,h);for(let i=0;i<4000;i++){c.fillStyle=rand()>.5?'#ffffff10':'#352c2210';c.fillRect(rand()*w,rand()*h,1,1);}});plaster.wrapS=plaster.wrapT=THREE.RepeatWrapping;plaster.repeat.set(3,2);
  const shadowTex=canvasTexture(128,128,(c,w,h)=>{const g=c.createRadialGradient(64,64,6,64,64,63);g.addColorStop(0,'rgba(15,12,6,.52)');g.addColorStop(.5,'rgba(15,12,6,.28)');g.addColorStop(1,'rgba(15,12,6,0)');c.fillStyle=g;c.fillRect(0,0,w,h);});
  function material(color,extra={}){const k=color+JSON.stringify(Object.keys(extra));if(!Object.keys(extra).length&&mats.has(k))return mats.get(k);const m=new THREE.MeshStandardMaterial({color,roughness:.78,...extra});if(!Object.keys(extra).length)mats.set(k,m);return m;}
  const mWood=material('#a2835d',{map:wood,roughness:.45}),mPale=material('#e4c899',{map:paleWood,roughness:.68}),mWall=material('#ede1c6',{map:plaster}),mFloor=material('#e3d7be',{map:tiles,roughness:.6}),mParquet=material('#e3ceb1',{map:parquet,roughness:.6}),mCream=material('#c8b79b'),mDark=material('#252e29'),mMetal=material('#6f726e',{metalness:.75,roughness:.35});
  function mesh(geo,mat,pos,parent=scene){const o=new THREE.Mesh(geo,typeof mat==='string'?material(mat):mat);o.position.copy(pos);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
  function box(w,h,d,x,y,z,mat,parent=scene,solid=false){const o=mesh(new THREE.BoxGeometry(w,h,d),mat,V(x,y,z),parent);if(solid&&y-h/2<1.85&&y+h/2>.1)colliders.push({x:x-w/2-.17,X:x+w/2+.17,z:z-d/2-.17,Z:z+d/2+.17});return o;}
  function rounded(w,h,d,r,x,y,z,mat,parent=scene){const geo=new THREE.BoxGeometry(w,h,d,6,6,6);const a=geo.attributes.position,inner=V(w/2-r,h/2-r,d/2-r),p=new THREE.Vector3(),q=new THREE.Vector3();for(let i=0;i<a.count;i++){p.fromBufferAttribute(a,i);q.set(Math.max(-inner.x,Math.min(inner.x,p.x)),Math.max(-inner.y,Math.min(inner.y,p.y)),Math.max(-inner.z,Math.min(inner.z,p.z)));p.sub(q).normalize().multiplyScalar(r).add(q);a.setXYZ(i,p.x,p.y,p.z);}geo.computeVertexNormals();return mesh(geo,mat,V(x,y,z),parent);}
  function cyl(rt,rb,h,x,y,z,mat,parent=scene,n=32){return mesh(new THREE.CylinderGeometry(rt,rb,h,n),mat,V(x,y,z),parent);}
  function sphere(r,x,y,z,mat,parent=scene){return mesh(new THREE.SphereGeometry(r,20,14),mat,V(x,y,z),parent);}
  function floorShadow(x,z,w,d){const s=mesh(new THREE.PlaneGeometry(w,d),new THREE.MeshBasicMaterial({map:shadowTex,transparent:true,depthWrite:false}),V(x,.015,z));s.rotation.x=-Math.PI/2;s.castShadow=false;s.raycast=()=>{};}
  function wall(w,h,d,x,y,z){const o=box(w,h,d,x,y,z,mWall,scene,true);o.castShadow=false;return o;}
  function titleTexture(lines,bg='#39483b',fg='#eee1bd'){
    return canvasTexture(512,640,(c,w,h)=>{c.fillStyle=bg;c.fillRect(0,0,w,h);c.strokeStyle=fg+'88';c.lineWidth=2;c.strokeRect(28,28,w-56,h-56);c.fillStyle=fg;c.textAlign='center';c.font='48px Georgia';lines.forEach((l,i)=>c.fillText(l,w/2,h*.35+i*58));c.font='16px Arial';c.fillText('ESTARÉ BIEN',w/2,h-65);});
  }
  const artBase=new THREE.TextureLoader().load('assets/comedor.webp',()=>{dirty=true;request();});artBase.colorSpace=THREE.SRGBColorSpace;
  const sketchBase=new THREE.TextureLoader().load('assets/cuarto.webp',()=>{dirty=true;request();});sketchBase.colorSpace=THREE.SRGBColorSpace;
  const artRegions=[[.702,.327,.052,.18],[.779,.31,.047,.20],[.855,.289,.072,.22],[.377,.338,.058,.14],[.455,.34,.068,.055],[.555,.34,.06,.18]];
  const sketchRegions=[[.077,.047,.06,.14],[.009,.17,.042,.12],[.155,.08,.038,.1],[.194,.15,.048,.12],[.05,.28,.07,.075],[.15,.33,.042,.08],[.2,.37,.042,.085],[.015,.42,.052,.1],[.25,.2,.034,.1]];
  function art(w,h,x,y,z,rot=0,variant=0,sketch=false){
    const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=rot;scene.add(g);box(w+(sketch?.025:.09),h+(sketch?.025:.09),sketch?.014:.07,0,0,0,sketch?mCream:mWood,g);
    const regions=sketch?sketchRegions:artRegions,t=(sketch?sketchBase:artBase).clone(),[u,v,rw,rh]=regions[variant%regions.length];t.repeat.set(rw,rh);t.offset.set(u,1-v-rh);t.needsUpdate=true;
    const p=mesh(new THREE.PlaneGeometry(w,h),material('#e8d7bb',{map:t,roughness:.85}),V(0,0,.04),g);p.castShadow=false;return g;
  }
  function plant(x,y,z,size=.4){const g=new THREE.Group();g.position.set(x,y,z);scene.add(g);cyl(size*.25,size*.18,size*.4,0,size*.2,0,'#93785c',g);for(let i=0;i<7;i++){const angle=i*2.4,leaf=sphere(size*.25,Math.sin(angle)*size*.25,size*.55+(i%3)*size*.11,Math.cos(angle)*size*.2,'#576346',g);leaf.scale.set(.6,.2,1.5);leaf.rotation.set(.4,angle,.3);}return g;}
  function book(x,y,z,w=.35,d=.48,cover='#834d3d',words=null){box(w,.065,d,x,y,z,cover);box(w-.025,.045,d-.02,x,y,z,'#d4c9ac');box(w,.009,d,x,y+.032,z,cover);if(words){const face=mesh(new THREE.PlaneGeometry(w*.92,d*.9),new THREE.MeshBasicMaterial({map:titleTexture(words,cover)}),V(x,y+.038,z));face.rotation.x=-Math.PI/2;face.castShadow=false;}return y+.06;}
  function cup(x,y,z){cyl(.065,.05,.13,x,y+.065,z,'#ddd0ad');const inside=cyl(.055,.055,.003,x,y+.132,z,'#493b28');inside.castShadow=false;const handle=mesh(new THREE.TorusGeometry(.043,.012,10,18),mCream,V(x+.07,y+.075,z));handle.rotation.y=Math.PI/2;}
  function curtain(x,z,w,rot=0){const group=new THREE.Group();group.position.set(x,0,z);group.rotation.y=rot;scene.add(group);box(w+.2,.06,.07,0,2.85,0,mMetal,group);const geo=new THREE.PlaneGeometry(w,2.6,Math.ceil(w*20),1);const p=geo.attributes.position;for(let i=0;i<p.count;i++)p.setZ(i,.085*Math.cos(p.getX(i)*22));geo.computeVertexNormals();const fabric=mesh(geo,material('#bea77e',{side:THREE.DoubleSide,roughness:1}),V(0,1.48,0),group);fabric.castShadow=false;for(let i=0;i<Math.floor(w/.2);i++){const ring=mesh(new THREE.TorusGeometry(.038,.009,6,12),mMetal,V(-w/2+i*.2,2.82,0),group);ring.castShadow=false;}return group;}
  function lamp(x,y,z){cyl(.16,.2,.045,x,y+.025,z,mWood);cyl(.018,.018,.33,x,y+.2,z,'#9b8565');const shade=material('#efd5a0',{emissive:'#efb96a',emissiveIntensity:.55,side:THREE.DoubleSide});cyl(.13,.23,.28,x,y+.47,z,shade);const l=new THREE.PointLight('#ffcb81',8,3.6,2);l.position.set(x,y+.41,z);scene.add(l);return {x,y:y+.48,z};}
  function ceilingLight(x,z,intensity=22){cyl(.21,.23,.15,x,2.98,z,material('#f5dfae',{emissive:'#fbdba7',emissiveIntensity:.8}));const light=new THREE.PointLight('#ffdeb1',intensity,8,2);light.position.set(x,2.72,z);scene.add(light);}
  scene.add(new THREE.HemisphereLight('#eee2c7','#645b48',1.05));scene.add(new THREE.AmbientLight('#f2e4ca',.2));
  const sun=new THREE.DirectionalLight('#ffe2b1',.55);sun.position.set(-3,5,5);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-7,right:7,top:7,bottom:-7,near:.1,far:18});sun.shadow.bias=-.0005;sun.shadow.normalBias=.03;scene.add(sun);sun.target.position.set(0,0,0);scene.add(sun.target);
  // Apartment shell and a doorway connecting the intimate room to the central passage.
  const floor=mesh(new THREE.PlaneGeometry(10,11),mFloor,V(0,0,.5));floor.rotation.x=-Math.PI/2;floor.castShadow=false;floor.userData.walkable=true;
  const bf=mesh(new THREE.PlaneGeometry(4.85,4.85),mParquet,V(-2.5,.009,-2.5));bf.rotation.x=-Math.PI/2;bf.castShadow=false;bf.userData.walkable=true;
  wall(.16,3.2,11,-5,1.6,.5);wall(.16,3.2,11,5,1.6,.5);wall(10,3.2,.16,0,1.6,-5);wall(10,3.2,.16,0,1.6,6);wall(5,3.2,.12,-2.5,1.6,0);wall(4.15,3.2,.12,2.925,1.6,0);
  wall(.12,3.2,2.7,0,1.6,-3.65);wall(.12,3.2,.7,0,1.6,-.35);wall(.12,.65,1.6,0,2.875,-1.5);
  const ceiling=box(10,.08,11,0,3.23,.5,'#c9bda0');ceiling.castShadow=false;
  for(const x of [-4.9,4.9])box(.05,.13,11,x,.065,.5,mWood);for(const z of [-4.9,5.9])box(10,.13,.05,0,.065,z,mWood);
  box(.06,2.55,.08,.07,1.27,-2.32,mWood);box(.06,2.55,.08,.07,1.27,-.68,mWood);box(.06,.09,1.7,.07,2.53,-1.5,mWood);
  ceilingLight(-2.5,2.7);ceilingLight(2.6,2.9);ceilingLight(2.9,-2.6);ceilingLight(-2.6,-2.6,8);
  // Living room: curved cream sofa, contrasting cushions, bookshelf and television.
  curtain(-2.5,.12,3.8);
  floorShadow(-4.16,3,2,4.4);rounded(1.12,.38,3.45,.16,-4.22,.39,3.05,mWood);rounded(.28,.75,3.45,.12,-4.72,.8,3.05,mCream);rounded(1.16,.7,.32,.14,-4.2,.65,1.4,mCream);rounded(1.16,.7,.32,.14,-4.2,.65,4.7,mCream);
  colliders.push({x:-4.95,X:-3.52,z:1.15,Z:4.95});
  for(let i=0;i<3;i++){rounded(.89,.19,1.03,.08,-4.05,.65,1.92+i*1.1,'#c8b798');const cushion=rounded(.23,.62,.68,.1,-4.45,1.02,1.9+i*1.05,['#a46d48','#bfb594','#6f807f'][i]);cushion.rotation.z=-.16;}
  for(const [y,z]of [[1.85,2],[2.05,3.0],[1.75,4.0]])art(.62,.82,-4.9,y,z,Math.PI/2,Math.floor(z));
  box(.62,.65,2.5,-.42,.33,2.35,mWood,scene,true);for(let z of [1.45,2.2,2.95])box(.015,.45,.58,-.745,.38,z,'#b9a17a');
  const tv=new THREE.Group();tv.position.set(-.5,1.56,2.32);tv.rotation.y=-Math.PI/2;scene.add(tv);rounded(2.25,1.32,.08,.035,0,0,0,'#18201b',tv);box(.5,.035,.36,0,-.85,.03,'#20251f',tv);box(.07,.3,.08,0,-.65,0,'#242722',tv);
  const tvTexture=canvasTexture(1280,720,(c,w,h)=>{c.fillStyle='#121b17';c.fillRect(0,0,w,h);c.fillStyle='#d9c7a2';c.textAlign='center';c.font='80px Georgia';c.fillText('Estoy bien',w/2,h/2);c.font='20px Arial';c.fillText('DONDE TODO COMIENZA',w/2,h*.65);});
  const posterImg=new Image();posterImg.onload=()=>{const c=tvTexture.image.getContext('2d');c.fillStyle='#101814';c.fillRect(0,0,1280,720);const w=720*posterImg.naturalWidth/posterImg.naturalHeight;c.drawImage(posterImg,(1280-w)/2,0,w,720);tvTexture.needsUpdate=true;dirty=true;request();};posterImg.src='assets/poster.webp';
  mesh(new THREE.PlaneGeometry(2.12,1.19),new THREE.MeshBasicMaterial({map:tvTexture}),V(0,0,.049),tv).castShadow=false;
  for(let z of [1.25,3.5]){box(.37,.8,.35,-.45,.4,z,'#252c24');for(let y of [.24,.55]){const sp=cyl(.12,.12,.018,-.65,y,z,'#111910');sp.rotation.z=Math.PI/2;}}
  plant(-.42,.67,3.35,.45);box(.33,.1,.28,-.42,.72,1.45,'#c7b28c');
  floorShadow(-2.6,3.2,1.8,1.4);rounded(1.18,.12,.83,.08,-2.6,.51,3.2,mWood);for(let x of [-3.05,-2.15])for(let z of [2.92,3.48])box(.05,.48,.05,x,.24,z,mWood);colliders.push({x:-3.35,X:-1.85,z:2.61,Z:3.79});
  book(-2.7,.61,3.2,.37,.52,'#77513d',['Mi familia','y luego yo']);cup(-2.25,.58,3.05);
  targets.push({id:'videoclip',room:'sala',position:V(-.66,1.7,2.3)},{id:'libro',room:'sala',position:V(-2.7,.76,3.2)});
  // Four seats face the table: two on each long side.
  floorShadow(2.8,2.9,3.4,4);box(1.55,.12,2.25,2.8,.88,2.85,mWood,scene,true);box(1.51,.025,2.21,2.8,.956,2.85,material('#cbbd9a',{metalness:.25,roughness:.18}));for(const x of [2.14,3.46])for(const z of [1.89,3.81])box(.1,.85,.1,x,.43,z,mWood);
  const runner=box(.45,.012,2.25,2.8,.977,2.85,'#c6b797');runner.castShadow=false;
  function chair(x,z,rot){const g=new THREE.Group();g.name='dining-chair';g.position.set(x,0,z);g.rotation.y=rot;scene.add(g);rounded(.52,.13,.54,.06,0,.5,0,mCream,g);rounded(.52,.7,.12,.06,0,.86,-.24,mCream,g);for(let xx of [-.2,.2])for(let zz of [-.2,.2])box(.045,.45,.045,xx,.22,zz,mWood,g);colliders.push({x:x-.36,X:x+.36,z:z-.36,Z:z+.36});}
  for(let z of [2.15,3.5]){chair(1.69,z,Math.PI/2);chair(3.91,z,-Math.PI/2);}
  cyl(.16,.11,.23,2.8,1.1,2.6,'#a37950');plant(2.8,.99,2.6,.45);cyl(.19,.16,.05,2.8,1.01,3.14,'#dfceb0');sphere(.073,2.74,1.1,3.14,'#ba9d3a');sphere(.07,2.87,1.1,3.16,'#a2a35b');
  const phone=rounded(.15,.018,.27,.014,2.23,.99,3.5,'#14221d');const phoneScreen=mesh(new THREE.PlaneGeometry(.128,.24),new THREE.MeshBasicMaterial({color:'#a6b6a5'}),V(2.23,1.001,3.5));phoneScreen.rotation.x=-Math.PI/2;phoneScreen.castShadow=false;cup(2.3,.97,2.05);
  for(let i=0;i<3;i++)art(.6,.95,4.89,1.8,1.7+i*1.2,-Math.PI/2,i);
  for(let i=0;i<3;i++)art(.57,.7,1.9+i*.82,1.88,.06,0,i+1);
  targets.push({id:'instagram',room:'comedor',position:V(2.23,1.16,3.5)});
  // Kitchen: pale cabinet fronts, dark counter, stove, kettle, radio and a refrigerator.
  const kitchenFloor=mesh(new THREE.PlaneGeometry(4.85,4.85),material('#956944'),V(2.5,.012,-2.5));kitchenFloor.rotation.x=-Math.PI/2;kitchenFloor.castShadow=false;kitchenFloor.userData.walkable=true;
  for(let i=0;i<5;i++){
    const x=1.05+i*.72;box(.7,.85,.65,x,.425,-4.48,mPale,scene,true);box(.68,.73,.025,x,.43,-4.135,mPale);box(.24,.022,.045,x,.71,-4.10,mMetal);box(.7,.73,.36,x,2.15,-4.7,mPale);box(.022,.23,.035,x+.25,2.13,-4.50,mMetal);
  }
  box(3.6,.075,.75,2.49,.89,-4.45,material('#514737',{roughness:.3}));box(3.6,.38,.03,2.49,1.15,-4.89,'#b9ac8d');
  box(.73,1.9,.72,4.38,.95,-4.38,mMetal,scene,true);box(.69,.03,.025,4.38,1.27,-4.008,'#414b43');box(.025,.38,.05,4.67,1.5,-3.99,'#c1c3b9');box(.025,.42,.05,4.67,.7,-3.99,'#c1c3b9');
  box(.72,.04,.61,2.48,.95,-4.4,'#262d26');for(let x of [2.27,2.68])for(let z of [-4.58,-4.23]){const burner=cyl(.1,.1,.02,x,.98,z,'#141c16');burner.castShadow=false;}
  const kettle=sphere(.14,2.28,1.12,-4.55,mMetal);kettle.scale.y=.8;cyl(.052,.052,.035,2.28,1.25,-4.55,'#222a23');const kh=mesh(new THREE.TorusGeometry(.12,.018,8,20,Math.PI),mDark,V(2.28,1.27,-4.55));kh.rotation.z=0;
  box(.65,.045,.45,1.12,.94,-4.43,mMetal);box(.43,.02,.31,1.12,.967,-4.43,'#484c42');const tap=mesh(new THREE.TorusGeometry(.12,.018,8,20,Math.PI),mMetal,V(1.12,1.08,-4.63));tap.rotation.y=Math.PI/2;
  const island=box(2.5,.93,.7,2.35,.465,-1.76,mWood,scene,true);box(2.63,.07,.82,2.35,.965,-1.76,material('#4c4034',{roughness:.3}));cup(1.5,1.01,-1.72);plant(3.28,1.01,-1.79,.35);
  // Radio sits on the near counter so its discovery is obvious from the doorway.
  rounded(.44,.25,.16,.025,2.45,1.13,-1.72,'#3c4436');const speaker=mesh(new THREE.CircleGeometry(.065,24),material('#151d17'),V(2.35,1.13,-1.628));speaker.castShadow=false;for(let x of [2.54,2.63]){const knob=cyl(.023,.023,.03,x,1.15,-1.623,'#c6ba92');knob.rotation.x=Math.PI/2;}box(.012,.3,.012,2.6,1.39,-1.74,mMetal).rotation.z=-.3;
  targets.push({id:'podcast',room:'cocina',position:V(2.45,1.35,-1.72)});art(.52,.62,4.9,1.8,-1.8,-Math.PI/2,2);art(.52,.62,4.9,1.8,-2.65,-Math.PI/2,3);
  // Elisa's room: bed, restless desk, drawings and the bedside light.
  curtain(-3.1,-4.82,2.95);floorShadow(-3.2,-2.8,2.8,3.5);
  box(2.05,.4,2.55,-3.3,.23,-3.1,mWood,scene,true);rounded(2.03,.25,2.5,.1,-3.3,.54,-3.1,'#b9af9b');rounded(2.06,.21,1.9,.09,-3.3,.68,-2.82,'#596b6c');box(2.09,1.1,.12,-3.3,.78,-4.42,mWood);
  for(let x of [-3.85,-2.75]){const p=rounded(.78,.19,.5,.09,x,.78,-3.98,'#c5bda7');p.rotation.y=x> -3?-.1:.13;}
  box(.55,.6,.52,-1.85,.3,-3.9,mWood,scene,true);book(-1.85,.66,-3.9,.33,.4,'#796544');const lampTarget=lamp(-1.85,.73,-3.94);targets.push({id:'corto',room:'cuarto',position:V(lampTarget.x,lampTarget.y+.04,lampTarget.z)});
  // Closet and desk line the opposite wall; papers stay anonymous.
  box(.58,2.7,1.25,-.45,1.35,-4.24,mWood,scene,true);for(let z of [-4.58,-3.97])box(.03,2.5,.58,-.77,1.4,z,mCream);
  // The desk is against the front wall, leaving the entire doorway clear.
  box(1.75,.12,.62,-2,.86,-.48,mWood,scene,true);for(let x of [-2.7,-1.3])box(.08,.78,.48,x,.39,-.48,'#c5b697');
  box(.43,.025,.4,-2.05,.94,-.5,'#202a25');const laptop=box(.43,.37,.025,-2.05,1.12,-.3,'#29372f');laptop.rotation.x=.15;const screen=mesh(new THREE.PlaneGeometry(.39,.32),new THREE.MeshBasicMaterial({map:titleTexture(['Ideas','pendientes'],'#7f8c7a','#d8d9c1')}),V(-2.05,1.12,-.32));screen.rotation.set(-.15,Math.PI,0);
  book(-1.45,.99,-.53,.35,.44,'#516858',['¿Me','conoces?']);cup(-2.65,.94,-.51);
  targets.push({id:'comic',room:'cuarto',position:V(-1.45,1.14,-.53)});
  for(let i=0;i<9;i++)art(.33+rand()*.15,.4+rand()*.17,-4.89,1.05+Math.floor(i/3)*.7,-3.6+(i%3)*.66,Math.PI/2,i,true);
  const rug=box(1.1,.012,1.4,-1.8,.025,-1.6,'#b6a78c');rug.castShadow=false;rug.userData.walkable=true;
  const clockTexture=canvasTexture(256,128,(c,w,h)=>{c.fillStyle='#17271e';c.fillRect(0,0,w,h);c.fillStyle='#d4c89e';c.font='46px monospace';c.textAlign='center';c.fillText('03:47',128,80);});box(.27,.13,.12,-1.86,.7,-3.58,'#30372b');mesh(new THREE.PlaneGeometry(.24,.1),new THREE.MeshBasicMaterial({map:clockTexture}),V(-1.86,.7,-3.512));
  // An entry door and grounded trim close the composition without adding a story reveal.
  box(1.1,2.6,.06,-2.5,1.3,5.88,mWood);sphere(.035,-2.1,1.25,5.83,mMetal);plant(4.45,0,5.4,.9);
  // Navigation uses real camera translation and collision-aware paths.
  function canWalk(x,z){return x>-4.78&&x<4.78&&z>-4.78&&z<5.78&&!colliders.some(b=>x>b.x&&x<b.X&&z>b.z&&z<b.Z);}
  function nearestCell(pos){let best=null,dist=Infinity;for(let x=0;x<40;x++)for(let z=0;z<44;z++){const wx=-4.75+x*.25,wz=-4.75+z*.25;if(!canWalk(wx,wz))continue;const d=(wx-pos.x)**2+(wz-pos.z)**2;if(d<dist){dist=d;best={x,z};}}return best;}
  function pathTo(end){if(!canWalk(end.x,end.z))return [];const start=nearestCell(camera.position),finish=nearestCell(end);if(!start||!finish)return [];const id=(x,z)=>x+40*z,startID=id(start.x,start.z),endID=id(finish.x,finish.z),queue=[start],prev=new Map([[startID,null]]);let qi=0;
    while(qi<queue.length){const a=queue[qi++];if(id(a.x,a.z)===endID)break;for(const [dx,dz]of [[1,0],[-1,0],[0,1],[0,-1]]){const x=a.x+dx,z=a.z+dz,key=id(x,z);if(x<0||x>=40||z<0||z>=44||prev.has(key)||!canWalk(-4.75+x*.25,-4.75+z*.25))continue;prev.set(key,id(a.x,a.z));queue.push({x,z});}}
    if(!prev.has(endID))return [];const raw=[];for(let cur=endID;cur!==null;cur=prev.get(cur))raw.unshift(V(-4.75+(cur%40)*.25,1.62,-4.75+Math.floor(cur/40)*.25));const simplified=[];for(let i=0;i<raw.length;i++){if(i===0||i===raw.length-1||!raw[i].clone().sub(raw[i-1]).equals(raw[i+1].clone().sub(raw[i])))simplified.push(raw[i]);}simplified.push(end.clone());return simplified;
  }
  function moveDelta(dx,dz){const before=camera.position.clone(),steps=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.06));for(let i=0;i<steps;i++){const x=camera.position.x+dx/steps,z=camera.position.z+dz/steps;if(canWalk(x,camera.position.z))camera.position.x=x;if(canWalk(camera.position.x,z))camera.position.z=z;}return camera.position.distanceTo(before);}
  function navigate(end,look){const nextRoute=pathTo(end);if(!nextRoute.length)return false;keys.clear();wheelSpeed=0;route=nextRoute;const previous=route[Math.max(0,route.length-2)],direction=end.clone().sub(previous).normalize();routeLook=look?.clone()||end.clone().add(direction.lengthSq()?direction:V(-Math.sin(yaw),0,-Math.cos(yaw)));if(reduced.matches){camera.position.copy(end);setLook(routeLook);route=[];routeLook=null;updateRoom();}dirty=true;request();return true;}
  function setLook(point){camera.lookAt(point);yaw=camera.rotation.y;pitch=camera.rotation.x;}
  camera.position.copy(positions.sala.p);setLook(positions.sala.look);
  function currentRoom(){const x=camera.position.x,z=camera.position.z;return z<-.35?(x<.15?'cuarto':'cocina'):(x<.2?'sala':'comedor');}
  function updateRoom(){const next=currentRoom();if(next!==room){room=next;onRoom(room);}}
  function resize(){const r=container.getBoundingClientRect();if(!r.width||!r.height)return;renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.fov=r.width<650?75:67;camera.updateProjectionMatrix();dirty=true;request();}
  function key(k,down){if(down)keys.add(k);else keys.delete(k);if(down){route=[];wheelSpeed=0;}request();}
  function onKey(e){if(!active||paused||!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d'].includes(e.key))return;if(e.target.closest('button,a,input,textarea,summary')&&e.key===' ' )return;e.preventDefault();key(e.key,e.type==='keydown');}
  document.addEventListener('keydown',onKey);document.addEventListener('keyup',e=>{if(keys.has(e.key)){e.preventDefault();key(e.key,false);}});
  const raycaster=new THREE.Raycaster(),mouse=new THREE.Vector2();
  const hitSizes={videoclip:[.25,1.4,2.3],libro:[.45,.28,.58],instagram:[.22,.35,.35],podcast:[.55,.5,.3],comic:[.42,.3,.5],corto:[.5,.65,.5]};
  const pickMeshes=targets.map(t=>{const box=new THREE.Mesh(new THREE.BoxGeometry(...hitSizes[t.id]),new THREE.MeshBasicMaterial());box.position.copy(t.position);box.userData=t;box.updateMatrixWorld();return box;});
  const destination=mesh(new THREE.RingGeometry(.12,.17,32),new THREE.MeshBasicMaterial({color:'#ead8ac',transparent:true,opacity:.8,side:THREE.DoubleSide,depthWrite:false}),V(0,.04,0));destination.rotation.x=-Math.PI/2;destination.visible=false;destination.raycast=()=>{};
  function clickScene(x,y){const r=container.getBoundingClientRect();mouse.set((x-r.left)/r.width*2-1,-(y-r.top)/r.height*2+1);camera.updateMatrixWorld();scene.updateMatrixWorld();raycaster.setFromCamera(mouse,camera);const hit=raycaster.intersectObjects(scene.children,true)[0];const object=raycaster.intersectObjects(pickMeshes.filter(m=>m.userData.room===room),false)[0];if(object&&(!hit||object.distance<hit.distance+.45)){onSelectStory?.(object.object.userData.id);return;}if(hit?.object.userData.walkable&&navigate(V(hit.point.x,1.62,hit.point.z))){destination.position.set(hit.point.x,.045,hit.point.z);destination.visible=true;dirty=true;request();}}
  container.addEventListener('pointerdown',e=>{onInteract?.();if(paused||!active||e.button!==0)return;pointer={x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,id:e.pointerId,moved:false};container.setPointerCapture(e.pointerId);route=[];wheelSpeed=0;});
  container.addEventListener('pointermove',e=>{if(!pointer||paused)return;const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;pointer.moved ||= Math.hypot(e.clientX-pointer.startX,e.clientY-pointer.startY)>5;pointer.x=e.clientX;pointer.y=e.clientY;if(!pointer.moved)return;yaw-=dx*.003;pitch=Math.max(-.65,Math.min(.55,pitch-dy*.0025));camera.rotation.set(pitch,yaw,0,'YXZ');dirty=true;request();});
  container.addEventListener('pointerup',e=>{if(pointer&&!pointer.moved&&!paused)clickScene(e.clientX,e.clientY);pointer=null;});
  for(const event of ['pointercancel','lostpointercapture'])container.addEventListener(event,()=>pointer=null);
  container.addEventListener('wheel',e=>{onInteract?.();if(paused||!active)return;e.preventDefault();route=[];const pixels=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?container.clientHeight:1);wheelSpeed=Math.max(-3.6,Math.min(3.6,wheelSpeed+pixels*.014));request();},{passive:false});
  const projectV=new THREE.Vector3();
  function project(){const w=container.clientWidth,h=container.clientHeight;camera.updateMatrixWorld();onProject(targets.map(t=>{projectV.copy(t.position).project(camera);const x=(projectV.x*.5+.5)*w,y=(-projectV.y*.5+.5)*h;return {id:t.id,x,y,visible:t.room===room&&projectV.z>-1&&projectV.z<1&&x>30&&x<w-55&&y>95&&y<h-115};}));}
  function tick(time){frame=0;if(!active||!visible)return;const dt=Math.min((time-last)/1000||.016,.04);last=time;let moving=false;
    if(!paused){
      const turn=(keys.has('ArrowLeft')||keys.has('a')?1:0)-(keys.has('ArrowRight')||keys.has('d')?1:0);const walk=(keys.has('ArrowUp')||keys.has('w')?1:0)-(keys.has('ArrowDown')||keys.has('s')?1:0);
      if(turn){yaw+=turn*dt*1.25;camera.rotation.set(pitch,yaw,0,'YXZ');moving=true;}
      if(walk){const delta=walk*dt*1.65;moveDelta(-Math.sin(yaw)*delta,-Math.cos(yaw)*delta);moving=true;}
      if(Math.abs(wheelSpeed)>.005){const delta=wheelSpeed*dt;moveDelta(-Math.sin(yaw)*delta,-Math.cos(yaw)*delta);wheelSpeed*=Math.exp(-5*dt);moving=true;}else wheelSpeed=0;
      if(route.length){const target=route[0],dist=camera.position.distanceTo(target),step=Math.min(dist,dt*2.5),delta=target.clone().sub(camera.position).normalize().multiplyScalar(step);const moved=moveDelta(delta.x,delta.z);if(dist<.025){route.shift();}else if(moved<step*.3){route=[];routeLook=null;}const goal=route.length?route[0]:routeLook;if(goal&&camera.position.distanceTo(goal)>.025){const q=camera.quaternion.clone();camera.lookAt(goal);q.slerp(camera.quaternion,Math.min(1,dt*5));camera.quaternion.copy(q);yaw=camera.rotation.y;pitch=camera.rotation.x;}moving=true;if(!route.length&&routeLook){setLook(routeLook);routeLook=null;}if(!route.length)destination.visible=false;}
      updateRoom();
    }
    if(dirty||moving){renderer.render(scene,camera);project();dirty=false;}
    if(!paused&&(keys.size||route.length||wheelSpeed))request();
  }
  function request(){if(!frame&&active&&visible)frame=requestAnimationFrame(tick);}
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();active=false;if(frame)cancelAnimationFrame(frame);onError?.();});
  const ro=new ResizeObserver(resize);ro.observe(container);window.addEventListener('resize',resize);
  resize();renderer.compile(scene,camera);
  return {
    setActive(value){active=value;last=performance.now();if(value){resize();dirty=true;request();}else{keys.clear();if(frame)cancelAnimationFrame(frame);frame=0;}},
    setPaused(value){paused=value;if(value){keys.clear();wheelSpeed=0;pointer=null;}last=performance.now();dirty=true;request();},
    setDocumentVisible(value){visible=value;keys.clear();last=performance.now();dirty=true;request();},
    clearKeys(){keys.clear();wheelSpeed=0;},key,
    goTo(name){const p=positions[name];if(!p)return false;const look=name==='cuarto'&&camera.aspect<.8?V(-1.85,1.2,-3.94):p.look;return navigate(p.p,look);},
    walkTo(point){return navigate(V(point.x,1.62,point.z));},
    // Diagnostic state contains geometry-independent evidence for interaction tests.
    getState(){return {room,position:camera.position.toArray(),rotation:[pitch,yaw],active,paused,routeLength:route.length,walkable:canWalk(camera.position.x,camera.position.z),chairs:scene.children.filter(o=>o.name==='dining-chair').map(o=>({x:o.position.x,z:o.position.z,rotation:o.rotation.y})),drawCalls:renderer.info.render.calls};}
  };
}

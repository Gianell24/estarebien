// Connected geometry for the house's small objects. No cutout foliage or floating planes.
export function createDecor({THREE,scene,mesh,box,rounded,cyl,sphere,material,mWood,mCream,mMetal,canvasTexture,V,redraw}){
  const loader=new THREE.TextureLoader();
  const painting=loader.load('assets/comedor.webp',redraw);painting.colorSpace=THREE.SRGBColorSpace;
  const sketches=loader.load('assets/cuarto.webp',redraw);sketches.colorSpace=THREE.SRGBColorSpace;
  // Inner corners of each painting in the supplied photograph, excluding its frame.
  const artCorners=[
    [[1202,299],[1277,285],[1274,466],[1202,458]],
    [[1317,278],[1395,263],[1396,466],[1317,455]],
    [[1440,254],[1563,238],[1557,476],[1441,467]],
    [[622,317],[731,318],[731,480],[622,478]],
    [[770,318],[880,319],[881,384],[770,382]],
    [[919,319],[1025,318],[1027,480],[919,479]]
  ];
  const sketchRegions=[[.088,.065,.043,.105],[.009,.17,.035,.10],[.155,.09,.03,.08],[.195,.16,.04,.1],[.05,.30,.06,.06],[.15,.34,.036,.065],[.203,.38,.032,.06],[.017,.44,.04,.08],[.25,.21,.026,.075]];
  function art(w,h,x,y,z,rotation=0,index=0,sketch=false){
    const group=new THREE.Group();group.position.set(x,y,z);group.rotation.y=rotation;scene.add(group);
    const border=sketch?.013:.055;
    box(w+border*2,h+border*2,.045,0,0,0,sketch?mCream:mWood,group);
    if(!sketch)box(w+.018,h+.018,.008,0,0,.026,'#dbc6a0',group);
    const geometry=new THREE.PlaneGeometry(w,h,12,12),uv=geometry.attributes.uv;
    for(let i=0;i<uv.count;i++){
      const u=uv.getX(i),v=1-uv.getY(i);let px,py;
      if(sketch){const [sx,sy,sw,sh]=sketchRegions[index%sketchRegions.length];px=sx+u*sw;py=sy+v*sh;}
      else{const [a,b,c,d]=artCorners[index%artCorners.length];px=((1-v)*((1-u)*a[0]+u*b[0])+v*((1-u)*d[0]+u*c[0]))/1672;py=((1-v)*((1-u)*a[1]+u*b[1])+v*((1-u)*d[1]+u*c[1]))/941;}
      uv.setXY(i,px,1-py);
    }
    const face=mesh(geometry,material('#fff6e5',{map:sketch?sketches:painting,roughness:1}),V(0,0,.032),group);face.castShadow=false;
    return group;
  }
  function tube(points,radius,mat,parent=scene){
    return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),20,radius,7,false),mat,V(0,0,0),parent);
  }
  function leaf(base,tip,width,color,parent){
    const forward=tip.clone().sub(base),side=V(forward.z,0,-forward.x).normalize();
    if(side.lengthSq()<.01)side.set(1,0,0);
    const positions=[],uv=[],indices=[],rows=12,columns=4;
    for(let i=0;i<=rows;i++)for(let j=0;j<=columns;j++){
      const t=i/rows,s=j/columns*2-1,w=Math.pow(Math.sin(Math.PI*t),.8)*width;
      const p=base.clone().addScaledVector(forward,t).addScaledVector(side,s*w);
      p.y+=Math.sin(Math.PI*t)*width*.42*(1-Math.abs(s));
      positions.push(p.x,p.y,p.z);uv.push(j/columns,t);
      if(i<rows&&j<columns){const n=i*(columns+1)+j;indices.push(n,n+columns+1,n+1,n+1,n+columns+1,n+columns+2);}
    }
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.setIndex(indices);geometry.computeVertexNormals();
    const blade=mesh(geometry,foliage[color],V(0,0,0),parent);blade.castShadow=false;
    tube([base,base.clone().lerp(tip,.5).add(V(0,width*.08,0)),tip],.0035,'#778357',parent).castShadow=false;
  }
  const foliage={};for(const color of ['#4f6540','#657a4c','#425a38'])foliage[color]=material(color,{side:THREE.DoubleSide,roughness:.85});
  function plant(x,y,z,size=.4,tall=false){
    const g=new THREE.Group();g.name=tall?'tall-floor-plant':'potted-plant';g.position.set(x,y,z);scene.add(g);
    const height=size*(tall?.58:.4),radius=size*(tall?.23:.25);
    cyl(radius,radius*.72,height,0,height/2,0,tall?'#d8cfb5':'#a58b68',g);
    cyl(radius*.93,radius*.93,.014,0,height-.015,0,'#3d3527',g);
    for(let i=0;i<(tall?9:7);i++){
      const a=i*2.4,level=tall?1.2+(i%4)*.24:.56+(i%3)*.13;
      const base=V(Math.sin(a)*size*.18,height+size*level*.4,Math.cos(a)*size*.18);
      const tip=V(Math.sin(a)*size*(tall?.47:.48),height+size*level,Math.cos(a)*size*(tall?.47:.48));
      tube([V(Math.sin(a)*radius*.2,height-.04,Math.cos(a)*radius*.2),base.clone().multiplyScalar(.6).add(V(0,height*.4,0)),base],Math.max(.004,size*.008),'#6c7546',g).castShadow=false;
      leaf(base,tip,size*(tall?.12:.13),['#4f6540','#657a4c','#425a38'][i%3],g);
    }
    return g;
  }
  function flowerVase(x,y,z){
    const g=new THREE.Group();g.name='table-vase';g.position.set(x,y,z);scene.add(g);
    const profile=[[.07,0],[.13,.03],[.15,.10],[.13,.2],[.065,.26],[.065,.29]].map(p=>new THREE.Vector2(...p));
    mesh(new THREE.LatheGeometry(profile,28),material('#aa8056'),V(0,0,0),g);
    cyl(.058,.058,.008,0,.285,0,'#453f29',g);
    for(let i=0;i<6;i++){
      const a=i*2.4,tip=V(Math.sin(a)*.18,.51+(i%3)*.07,Math.cos(a)*.18);
      const stem=tube([V(0,.19,0),V(tip.x*.3,.39,tip.z*.3),tip],.006,'#647245',g);
      for(let j=0;j<3;j++){
        const b=stem.geometry.parameters.path.getPoint(.35+j*.2);
        const end=b.clone().add(V(Math.sin(a+j)*.13,.07,Math.cos(a+j)*.13));
        leaf(b,end,.035,['#4f6540','#657a4c','#425a38'][(i+j)%3],g);
      }
    }
    return g;
  }
  function tableRunner(){
    const texture=canvasTexture(256,768,(c,w,h)=>{
      c.fillStyle='#e2d6b9';c.fillRect(0,0,w,h);
      c.strokeStyle='#bca77e';c.lineWidth=2;
      for(const x of [13,22,w-22,w-13]){c.beginPath();c.moveTo(x,0);c.lineTo(x,h);c.stroke();}
      for(let y=20;y<h;y+=48){c.save();c.translate(w/2,y);for(let j=0;j<6;j++){c.rotate(Math.PI/3);c.beginPath();c.ellipse(0,7,3,8,0,0,Math.PI*2);c.stroke();}c.restore();}
      c.fillStyle='#776c4e15';for(let y=0;y<h;y+=4)c.fillRect(0,y,w,1);
    });
    const points=[]; // z and height, draping over both ends of the actual table.
    for(let i=0;i<=8;i++){const t=i/8;points.push([-1.225-.025*Math.sin(t*Math.PI),.48+.42*t]);}
    for(let i=1;i<=6;i++){const a=i/6*Math.PI/2;points.push([-1.125-.1*Math.cos(a),.9+.08*Math.sin(a)]);}
    for(let i=1;i<=24;i++)points.push([-1.125+2.25*i/24,.981]);
    for(let i=1;i<=6;i++){const a=i/6*Math.PI/2;points.push([1.125+.1*Math.sin(a),.9+.08*Math.cos(a)]);}
    for(let i=1;i<=8;i++){const t=i/8;points.push([1.225+.025*Math.sin(t*Math.PI),.9-.42*t]);}
    const p=[],uv=[],indices=[];
    points.forEach(([z,y],i)=>{for(let j=0;j<9;j++){const x=(j/8-.5)*.48,fold=(y<.91?1:0)*Math.sin(j/8*Math.PI*4)*.012;p.push(2.8+x,y,2.85+z+fold);uv.push(j/8,i/(points.length-1));if(i<points.length-1&&j<8){const n=i*9+j;indices.push(n,n+9,n+1,n+1,n+9,n+10);}}});
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();
    const cloth=mesh(geo,material('#f5ead1',{map:texture,side:THREE.DoubleSide,roughness:1}),V(0,0,0));cloth.name='draped-table-runner';cloth.castShadow=false;
  }
  function kitchenFixtures(){
    // Basin, continuous faucet arch and short downward outlet.
    box(.65,.032,.46,1.12,.942,-4.43,mMetal);box(.48,.008,.32,1.12,.962,-4.4,'#343f39');
    box(.42,.005,.26,1.12,.968,-4.4,'#626d63');cyl(.055,.065,.035,1.12,.965,-4.65,mMetal);
    tube([V(1.12,.975,-4.65),V(1.12,1.19,-4.65),V(1.12,1.29,-4.53),V(1.12,1.22,-4.4),V(1.12,1.16,-4.4)],.021,mMetal);
    cyl(.026,.026,.045,1.12,1.145,-4.4,mMetal);box(.016,.1,.025,1.2,1.01,-4.65,mMetal);
    // Flat base rests on the burner; lid, handle and spout are connected to the body.
    const g=new THREE.Group();g.name='kettle';g.position.set(2.28,.993,-4.55);scene.add(g);
    const profile=[[.085,0],[.12,.018],[.145,.09],[.13,.17],[.085,.22]].map(p=>new THREE.Vector2(...p));
    mesh(new THREE.LatheGeometry(profile,28),mMetal,V(0,0,0),g);cyl(.086,.10,.018,0,.222,0,mMetal,g);cyl(.027,.038,.035,0,.248,0,'#2c302a',g);
    tube([V(-.112,.13,0),V(-.14,.32,0),V(0,.37,0),V(.14,.32,0),V(.112,.13,0)],.022,'#34392e',g);
    tube([V(.085,.075,.06),V(.155,.13,.1),V(.21,.19,.12)],.034,mMetal,g);
    const mouth=cyl(.023,.023,.006,.211,.195,.121,'#25332a',g);mouth.rotation.z=-.55;
  }
  function laptop(){
    const g=new THREE.Group();g.name='laptop';g.position.set(-2.05,.932,-.5);g.rotation.y=Math.PI;scene.add(g);
    rounded(.48,.025,.38,.012,0,.012,0,'#79877f',g);
    const lid=new THREE.Group();lid.position.set(0,.028,-.17);lid.rotation.x=-.15;g.add(lid);
    rounded(.48,.32,.022,.012,0,.16,0,'#202a25',lid);
    const wallpaper=canvasTexture(960,600,(c,w,h)=>{
      const grad=c.createLinearGradient(0,0,w,h);grad.addColorStop(0,'#273f3b');grad.addColorStop(.6,'#8a9c8b');grad.addColorStop(1,'#e7cda4');c.fillStyle=grad;c.fillRect(0,0,w,h);
      c.fillStyle='#d7c6a2';c.beginPath();c.arc(730,170,70,0,Math.PI*2);c.fill();
      for(let n=0;n<3;n++){c.fillStyle=['#567569','#395c54','#23423d'][n];c.beginPath();c.moveTo(0,h);c.lineTo(0,330+n*70);c.bezierCurveTo(250,170+n*70,500,530+n*50,w,300+n*90);c.lineTo(w,h);c.fill();}
      c.fillStyle='#f4ecda';c.font='72px Georgia';c.textAlign='center';c.fillText('Respira.',w/2,230);c.font='22px Arial';c.fillText('Un momento a la vez.',w/2,275);
      c.fillStyle='#ecede1b3';c.fillRect(w/2-90,h-36,180,18);
    });
    mesh(new THREE.PlaneGeometry(.438,.272),new THREE.MeshBasicMaterial({map:wallpaper}),V(0,.165,.0121),lid).castShadow=false;
    // Physical keycaps and trackpad on the same base, oriented toward the room.
    for(let row=0;row<4;row++)for(let col=0;col<11;col++)box(.03,.004,.027,-.188+col*.037,.027,-.105+row*.038,'#27332d',g);
    box(.17,.004,.023,0,.027,.051,'#27332d',g);box(.145,.002,.068,0,.027,.111,'#a0aaa0',g);
    cyl(.008,.008,.003,.206,.027,-.12,'#d8e0cd',g);
    return g;
  }
  function entryDoor(){
    const frame=new THREE.Group();frame.position.set(-2.5,0,6.01);scene.add(frame);
    box(.12,2.85,.17,-.81,1.425,0,mWood,frame);box(.12,2.85,.17,.81,1.425,0,mWood,frame);box(1.74,.12,.17,0,2.85,0,mWood,frame);
    box(1.55,.035,.32,0,.018,0,'#b7a98a',frame);
    const hinge=new THREE.Group();hinge.name='entrance-door';hinge.userData.dynamic=true;hinge.position.set(-3.25,0,6);scene.add(hinge);
    box(1.5,2.75,.085,.75,1.39,0,mWood,hinge);
    for(const yy of [.62,1.88]){
      box(1.23,.98,.014,.75,yy,.052,'#553b29',hinge);
      for(const xx of [.16,1.34])box(.032,1.04,.025,xx,yy,.068,'#b58d5a',hinge);
      for(const y0 of [yy-.505,yy+.505])box(1.21,.032,.025,.75,y0,.068,'#b58d5a',hinge);
    }
    const brass=material('#bc9b59',{metalness:.75,roughness:.28});
    box(.065,.23,.018,1.28,1.26,.059,brass,hinge);const pivot=cyl(.025,.025,.10,1.28,1.31,.102,brass,hinge);pivot.rotation.x=Math.PI/2;box(.18,.035,.04,1.2,1.31,.155,brass,hinge);
    cyl(.016,.016,.012,1.28,1.19,.073,'#292e23',hinge).rotation.x=Math.PI/2;
    // Quiet exterior threshold. The room itself is revealed when this leaf opens.
    box(10,.08,3.2,0,-.055,7.6,'#83775f');box(10,3.4,.10,0,1.7,9.8,'#3a443b');
    box(.18,.38,.13,-1.22,2.05,6.09,'#29372d');box(.125,.26,.06,-1.22,2.05,6.18,material('#f8e0aa',{emissive:'#edc377',emissiveIntensity:1}));
    const light=new THREE.PointLight('#f0cf91',12,4,2);light.position.set(-1.22,2.13,6.5);scene.add(light);
    return hinge;
  }
  return {art,plant,flowerVase,tableRunner,kitchenFixtures,laptop,entryDoor};
}

// Bake static transforms and combine matching materials, keeping walkable surfaces
// separate for picking. The hinged door and discovery hitboxes remain independent.
export function batchStatic(THREE,scene){
  scene.updateMatrixWorld(true);const groups=new Map(),sources=[];
  scene.traverse(o=>{
    if(!o.isMesh||Array.isArray(o.material))return;
    for(let p=o;p&&p!==scene;p=p.parent)if(p.userData.dynamic)return;
    const key=[o.material.uuid,o.castShadow,o.receiveShadow,!!o.userData.walkable].join('|');
    if(!groups.has(key))groups.set(key,[]);groups.get(key).push(o);
  });
  for(const list of groups.values()){
    if(list.length<2)continue;const geometries=list.map(o=>(o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone()).applyMatrix4(o.matrixWorld));
    const geometry=new THREE.BufferGeometry();
    for(const name of ['position','normal','uv']){
      if(!geometries.every(g=>g.attributes[name]))continue;
      const length=geometries.reduce((n,g)=>n+g.attributes[name].array.length,0),array=new Float32Array(length);let offset=0;
      for(const g of geometries){array.set(g.attributes[name].array,offset);offset+=g.attributes[name].array.length;}
      geometry.setAttribute(name,new THREE.BufferAttribute(array,geometries[0].attributes[name].itemSize));
    }
    geometry.computeBoundingSphere();const merged=new THREE.Mesh(geometry,list[0].material);merged.castShadow=list[0].castShadow;merged.receiveShadow=list[0].receiveShadow;merged.userData.walkable=list[0].userData.walkable;scene.add(merged);
    for(const o of list){sources.push(o);o.removeFromParent();}for(const g of geometries)g.dispose();
  }
  for(const o of sources)o.geometry.dispose();
}

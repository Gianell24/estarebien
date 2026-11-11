// Original, sample-free accompaniment. Audio begins only after a visitor gesture.
export class HouseAudio {
  constructor(){this.enabled=true;this.active=false;this.ducked=false;this.ctx=null;this.timer=null;this.step=0;this.next=0;this.master=null;this.chords=[[57,60,64,67],[53,57,60,64],[48,52,55,59],[55,59,62,65]];}
  async start(){
    this.active=true;
    if(!this.enabled)return;
    if(!this.ctx){
      const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
      this.ctx=new AC();this.master=this.ctx.createGain();this.master.gain.value=0;
      const compressor=this.ctx.createDynamicsCompressor();compressor.threshold.value=-24;compressor.ratio.value=3;
      this.master.connect(compressor);compressor.connect(this.ctx.destination);
      this.filter=this.ctx.createBiquadFilter();this.filter.type='lowpass';this.filter.frequency.value=2200;this.filter.connect(this.master);
      this.noise=this.ctx.createBuffer(1,this.ctx.sampleRate,this.ctx.sampleRate);const data=this.noise.getChannelData(0);let seed=42;for(let i=0;i<data.length;i++){seed=(seed*1664525+1013904223)>>>0;data[i]=(seed/4294967296*2-1)*.5;}
    }
    await this.ctx.resume();this.next=this.ctx.currentTime+.06;
    this.setGain();if(!this.timer)this.timer=setInterval(()=>this.schedule(),80);
  }
  setGain(){if(this.ctx&&this.master)this.master.gain.setTargetAtTime((this.enabled&&this.active&&!this.ducked&&!document.hidden)?0.45:0,this.ctx.currentTime,.2);}
  toggle(){this.enabled=!this.enabled;if(this.enabled&&this.active)this.start();else this.setGain();return this.enabled;}
  duck(value){this.ducked=value;this.setGain();}
  stop(){this.active=false;this.setGain();clearInterval(this.timer);this.timer=null;}
  suspend(){this.setGain();if(document.hidden){clearInterval(this.timer);this.timer=null;}else if(this.active&&this.enabled)this.start();}
  tone(midi,time,duration,volume=.17,type='sine'){
    const osc=this.ctx.createOscillator(),gain=this.ctx.createGain();osc.type=type;osc.frequency.value=440*Math.pow(2,(midi-69)/12);gain.gain.setValueAtTime(0,time);gain.gain.linearRampToValueAtTime(volume,time+.02);gain.gain.exponentialRampToValueAtTime(.001,time+duration);osc.connect(gain);gain.connect(this.filter);osc.start(time);osc.stop(time+duration+.05);osc.onended=()=>{osc.disconnect();gain.disconnect();};
  }
  percussion(time,hat=false){
    if(hat){const src=this.ctx.createBufferSource(),filter=this.ctx.createBiquadFilter(),g=this.ctx.createGain();src.buffer=this.noise;filter.type='highpass';filter.frequency.value=6500;g.gain.setValueAtTime(.06,time);g.gain.exponentialRampToValueAtTime(.001,time+.07);src.connect(filter);filter.connect(g);g.connect(this.master);src.start(time);src.stop(time+.08);src.onended=()=>{src.disconnect();filter.disconnect();g.disconnect();};}
    else{const osc=this.ctx.createOscillator(),g=this.ctx.createGain();osc.frequency.setValueAtTime(100,time);osc.frequency.exponentialRampToValueAtTime(43,time+.13);g.gain.setValueAtTime(.32,time);g.gain.exponentialRampToValueAtTime(.001,time+.21);osc.connect(g);g.connect(this.master);osc.start(time);osc.stop(time+.23);osc.onended=()=>{osc.disconnect();g.disconnect();};}
  }
  schedule(){if(!this.ctx||document.hidden)return;const beat=60/72;while(this.next<this.ctx.currentTime+.2){const s=this.step%32,c=this.chords[Math.floor(s/8)],t=this.next;if(s%8===0)c.forEach((m,i)=>this.tone(m,t+i*.028,3.1,.13));if(s%4===0)this.tone(c[0]-12,t,1.1,.2);if(s%4===0||s%8===6)this.percussion(t);if(s%2===1)this.percussion(t+.035,true);if(s%8===3||s%8===6)this.tone(c[(s+1)%4]+12,t,.9,.065,'triangle');this.next+=beat/2;this.step++;}}
}

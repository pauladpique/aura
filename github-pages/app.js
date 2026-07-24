const DATASETS=[
{name:"Collective Mood",file:"collective-mood.csv",csv:`hour,calm,tension,joy,focus
06:00,82,18,34,71
08:00,61,48,52,88
10:00,54,62,64,93
12:00,68,51,79,76
14:00,47,74,58,69
16:00,52,68,72,81
18:00,76,39,88,62
20:00,89,21,73,47
22:00,94,12,55,36`},
{name:"Urban Rhythm",file:"urban-rhythm.csv",csv:`district,movement,noise,green,connection
North,86,72,34,61
Harbour,58,64,42,79
Old Town,43,51,28,92
West,74,83,55,66
Central,97,94,18,88
Gardens,39,27,96,73
East,81,76,47,58
Riverside,62,48,78,84
South,69,71,51,64
Hills,31,22,89,49`},
{name:"Ocean Conditions",file:"ocean-conditions.csv",csv:`day,tide,temperature,salinity,light
01,24,61,82,36
02,38,64,79,49
03,71,66,77,68
04,92,68,74,83
05,76,69,73,91
06,44,67,76,72
07,19,64,81,51
08,33,62,84,39
09,68,63,80,57
10,88,65,78,76
11,73,67,75,87
12,41,66,79,63`},
{name:"Seasonal Growth",file:"seasonal-growth.csv",csv:`week,growth,rain,sunlight,pollination
01,12,84,31,18
02,18,76,42,25
03,29,68,51,39
04,43,57,64,58
05,62,49,77,74
06,78,36,89,92
07,91,28,96,88
08,84,42,82,79
09,69,58,71,66
10,53,72,59,48
11,38,81,46,31
12,22,89,34,20`},
{name:"Cosmic Weather",file:"cosmic-weather.csv",csv:`cycle,magnetism,radiation,density,velocity
A1,36,72,18,89
A2,58,64,29,76
A3,43,83,42,68
A4,78,56,61,92
A5,67,91,54,81
A6,92,76,88,64
A7,74,69,96,73
A8,86,88,72,95
A9,61,79,65,82
A10,49,93,41,71
A11,72,84,59,87
A12,88,96,78,98`}];
const MODES=[["particles","Particles","⠿"],["waves","Waves","≋"],["glass","Glass","◯"],["terrain","Terrain","⌁"],["forms","Forms","⬡"]];
const HARMONIES=["analogous","complementary","split","triadic","tetradic","square","monochrome","warm","cool","pastel","neon","earth","ocean"];
const state={dataset:0,name:"",file:"",csv:"",rows:[],headers:[],measure:"",mode:"particles",harmony:"analogous",base:"#d95cff",density:58,energy:72,flow:46,smooth:{density:58,energy:72,flow:46},target:"density",seed:9,colors:[],lastWheel:0,messageTimer:0};
const $=s=>document.querySelector(s),clamp=(n,min=0,max=1)=>Math.max(min,Math.min(max,n));
const randomOther=(items,current)=>{const choices=items.filter(x=>x!==current);return choices[Math.floor(Math.random()*choices.length)]??current};
function splitLine(line){const out=[];let value="",quoted=false;for(let i=0;i<line.length;i++){const char=line[i];if(char==='"'&&line[i+1]==='"'){value+='"';i++}else if(char==='"')quoted=!quoted;else if(char===","&&!quoted){out.push(value.trim());value=""}else value+=char}out.push(value.trim());return out}
function parseCSV(text){const lines=text.trim().split(/\r?\n/).filter(Boolean);if(lines.length<2)return{headers:[],rows:[]};const headers=splitLine(lines[0]);return{headers,rows:lines.slice(1).map(line=>{const cells=splitLine(line);return Object.fromEntries(headers.map((h,i)=>[h,cells[i]??""]))})}}
function values(){const raw=state.rows.map(r=>Number(r[state.measure])).filter(Number.isFinite);if(!raw.length)return[.25,.6,.45,.82];const min=Math.min(...raw),max=Math.max(...raw);return raw.map(v=>max===min?.5:(v-min)/(max-min))}
function hash(text){let h=2166136261;for(let i=0;i<text.length;i++)h=Math.imul(h^text.charCodeAt(i),16777619);return()=>((h=Math.imul(h^(h>>>15),2246822519))>>>0)/4294967296}
function hexToHsl(hex){const r=parseInt(hex.slice(1,3),16)/255,g=parseInt(hex.slice(3,5),16)/255,b=parseInt(hex.slice(5,7),16)/255,max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min;let h=0;const l=(max+min)/2,s=d===0?0:d/(1-Math.abs(2*l-1));if(d)h=max===r?60*(((g-b)/d)%6):max===g?60*((b-r)/d+2):60*((r-g)/d+4);return[(h+360)%360,s*100,l*100]}
const hsl=(h,s,l,a=1)=>`hsla(${(h+360)%360} ${s}% ${l}% / ${a})`;
function palette(base,harmony){if(harmony==="earth")return["#3f4938","#8e6243","#c49a62","#d9cfaa"];if(harmony==="ocean")return["#061b2c","#075985","#24a9a2","#b8eee3"];const[h,s,l]=hexToHsl(base),offsets={analogous:[-32,0,28,62],complementary:[0,180,24,204],split:[0,150,210,30],triadic:[0,120,240,48],tetradic:[0,60,180,240],square:[0,90,180,270],monochrome:[0,0,0,0],warm:[-34,-8,20,46],cool:[-18,18,56,104],pastel:[-28,0,32,68],neon:[0,112,224,292]};return offsets[harmony].map((o,i)=>hsl(h+o,harmony==="pastel"?62:harmony==="neon"?100:Math.min(96,s+(i%2?10:-4)),harmony==="pastel"?72+i*4:harmony==="neon"?56+i*4:clamp(l+(harmony==="monochrome"?i*13-14:i*3),22,82)))}
function rgba(color,a){if(color.startsWith("hsla"))return color.replace(/\/ [\d.]+\)/,`/ ${a})`);if(/^#[\da-f]{6}$/i.test(color)){const n=parseInt(color.slice(1),16);return`rgba(${n>>16},${n>>8&255},${n&255},${a})`}return color}
function updatePalette(){state.colors=palette(state.base,state.harmony);document.documentElement.style.setProperty("--accent",state.colors[1]||state.colors[0]);$("#swatches").innerHTML=state.colors.map(c=>`<i style="background:${c}"></i>`).join("")}
function notify(message){const el=$("#controlMessage");el.textContent=message;el.classList.add("show");clearTimeout(state.messageTimer);state.messageTimer=setTimeout(()=>el.classList.remove("show"),1300)}
function updateLabels(){$("#visualLabel").textContent=`${state.mode} · ${state.measure}`;["density","energy","flow"].forEach(k=>{$(`#${k}Value`).textContent=`${state[k]}%`;$(`#${k}`).value=state[k];$(`#${k}`).closest(".slider").classList.toggle("active",state.target===k)})}
function setData(csv,name,file,dataset=-1){const parsed=parseCSV(csv);if(!parsed.rows.length){notify("Please add at least two CSV rows");return}Object.assign(state,{csv,name,file,dataset,rows:parsed.rows,headers:parsed.headers});state.measure=state.headers.find(h=>state.rows.some(r=>Number.isFinite(Number(r[h]))))||state.headers[0];$("#fileName").textContent=file;$("#dataSummary").textContent=`${state.rows.length} rows · ${state.headers.length} fields`;$("#artTitle").textContent=name;$("#dataText").value=csv;state.seed++;updateLabels()}
function buildControls(){$("#modeGrid").innerHTML=MODES.map(([id,label,icon])=>`<button class="mode ${id===state.mode?"active":""}" data-mode="${id}" data-icon="${icon}">${label}</button>`).join("");$("#modeGrid").onclick=e=>{const b=e.target.closest("[data-mode]");if(!b)return;state.mode=b.dataset.mode;state.seed++;document.querySelectorAll(".mode").forEach(x=>x.classList.toggle("active",x===b));updateLabels()};$("#sliders").innerHTML=["density","energy","flow"].map(k=>`<label class="slider ${k===state.target?"active":""}"><span class="slider-head"><span>${k}</span><span id="${k}Value">${state[k]}%</span></span><input id="${k}" type="range" min="5" max="100" value="${state[k]}"></label>`).join("");["density","energy","flow"].forEach(k=>$(`#${k}`).oninput=e=>{state[k]=Number(e.target.value);updateLabels()})}
function randomDataset(){const next=Number(randomOther(DATASETS.map((_,i)=>i),state.dataset)),d=DATASETS[next];setData(d.csv,d.name,d.file,next);notify(`Q · ${d.name}`)}
function randomMode(){state.mode=randomOther(MODES.map(x=>x[0]),state.mode);state.seed++;document.querySelectorAll(".mode").forEach(x=>x.classList.toggle("active",x.dataset.mode===state.mode));updateLabels();notify(`W · ${state.mode}`)}
function randomHarmony(){state.harmony=randomOther(HARMONIES,state.harmony);$("#harmony").value=state.harmony;updatePalette();notify(`E · ${state.harmony} harmony`)}
function selectTarget(){const keys=["density","energy","flow"];state.target=keys[(keys.indexOf(state.target)+1)%3];updateLabels();notify(`R · Knob controls ${state.target}`)}
function turnKnob(direction){state[state.target]=clamp(state[state.target]+direction*10,5,100);updateLabels();notify(`${direction>0?"↻":"↺"} · ${state.target} ${direction>0?"+":"−"}10%`)}
const canvas=$("#artwork"),ctx=canvas.getContext("2d",{alpha:false});let cw=0,ch=0,lastFrame=0,frames=0,fpsTime=0;
function resize(){const r=canvas.getBoundingClientRect(),ratio=Math.min(devicePixelRatio||1,1.5),w=Math.max(1,Math.floor(r.width*ratio)),h=Math.max(1,Math.floor(r.height*ratio));if(w!==cw||h!==ch){canvas.width=w;canvas.height=h;cw=w;ch=h}}
function animate(time){requestAnimationFrame(animate);if(document.hidden||time-lastFrame<30)return;lastFrame=time;resize();for(const k of["density","energy","flow"])state.smooth[k]+=(state[k]-state.smooth[k])*.075;render(time);frames++;if(time-fpsTime>1000){$("#fps").textContent=`${Math.round(frames*1000/(time-fpsTime||1000))} fps`;frames=0;fpsTime=time}}
function render(time){const width=canvas.width,height=canvas.height,data=values(),colors=state.colors,density=clamp(Math.pow(state.smooth.density/100,.72)*1.08),energy=state.smooth.energy/100*1.45,flow=state.smooth.flow/100*1.4,t=time*(.00012+flow*.00028),rand=hash(`${state.seed}-${data.join("-")}`),bg=ctx.createRadialGradient(width*.5,height*.44,0,width*.5,height*.5,width*.8);bg.addColorStop(0,"#171520");bg.addColorStop(.52,"#0c0c10");bg.addColorStop(1,"#050507");ctx.fillStyle=bg;ctx.fillRect(0,0,width,height);ctx.globalCompositeOperation="screen";
if(state.mode==="particles"){const count=Math.floor(100+density*350);for(let i=0;i<count;i++){const v=data[i%data.length],angle=rand()*Math.PI*2+t*(i%3?1:-1),radius=(.08+rand()*.36+v*.12)*Math.min(width,height),curl=Math.sin(angle*3+v*8+t*4)*78*energy,x=width*.5+Math.cos(angle)*radius+Math.cos(angle*4)*curl,y=height*.5+Math.sin(angle)*radius*.68+Math.sin(angle*3)*curl;ctx.beginPath();ctx.fillStyle=rgba(colors[i%4],.18+v*.68);ctx.arc(x,y,.8+v*3.4+rand()*1.8,0,Math.PI*2);ctx.fill()}}
else if(state.mode==="waves"){const lines=Math.floor(18+density*46);ctx.lineWidth=1;for(let line=0;line<lines;line++){const v=data[line%data.length],base=height*(.15+line/lines*.7);ctx.beginPath();for(let x=-20;x<=width+20;x+=7){const phase=x/width*Math.PI*(3+flow*9),y=base+Math.sin(phase+line*.13+t*5)*(12+v*82*energy)+Math.sin(phase*.43-t*2)*24*v;x===-20?ctx.moveTo(x,y):ctx.lineTo(x,y)}ctx.strokeStyle=rgba(colors[line%4],.12+v*.45);ctx.stroke()}}
else if(state.mode==="glass"){const count=Math.floor(4+density*10);ctx.filter="blur(1px)";for(let i=0;i<count;i++){const v=data[i%data.length],x=width*(.16+rand()*.68),y=height*(.13+rand()*.72),r=32+v*108+rand()*60,g=ctx.createRadialGradient(x-r*.3,y-r*.38,r*.02,x,y,r);g.addColorStop(0,"rgba(255,255,255,.9)");g.addColorStop(.12,rgba(colors[i%4],.55));g.addColorStop(.66,rgba(colors[(i+1)%4],.1));g.addColorStop(1,"rgba(255,255,255,.015)");ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(x,y,r*(.65+v*.5),r,t+i*.7,0,Math.PI*2);ctx.fill();ctx.strokeStyle="rgba(255,255,255,.25)";ctx.stroke()}ctx.filter="none"}
else if(state.mode==="terrain"){const layers=Math.floor(10+density*25);for(let layer=layers;layer>=0;layer--){const depth=layer/layers;ctx.beginPath();ctx.moveTo(-10,height+10);for(let x=-10;x<=width+10;x+=9){const index=Math.abs(Math.floor(x/width*data.length*2+layer))%data.length,v=data[index],y=height*(.36+depth*.58)-Math.sin(x*.004+layer*.18)*92*v*energy-Math.sin(x*.011+layer*.33+t*2)*18;ctx.lineTo(x,y)}ctx.lineTo(width+10,height+10);ctx.closePath();ctx.fillStyle=rgba(colors[layer%4],.025+(1-depth)*.12);ctx.fill();ctx.strokeStyle=rgba(colors[layer%4],.08+(1-depth)*.22);ctx.stroke()}}
else{const count=Math.floor(6+density*16);ctx.filter="blur(3px)";for(let i=0;i<count;i++){const v=data[i%data.length],x=width*(.12+rand()*.76),y=height*(.12+rand()*.76),r=24+v*100+rand()*30;ctx.beginPath();for(let p=0;p<=18;p++){const angle=p/18*Math.PI*2,wobble=1+Math.sin(angle*3+i+t*4)*.31*energy,px=x+Math.cos(angle)*r*wobble,py=y+Math.sin(angle)*r*(.55+v*.55)*wobble;p?ctx.lineTo(px,py):ctx.moveTo(px,py)}ctx.closePath();ctx.fillStyle=rgba(colors[i%4],.12+v*.35);ctx.fill()}ctx.filter="none"}
ctx.globalCompositeOperation="source-over";const vignette=ctx.createRadialGradient(width/2,height/2,width*.2,width/2,height/2,width*.72);vignette.addColorStop(0,"rgba(0,0,0,0)");vignette.addColorStop(1,"rgba(0,0,0,.62)");ctx.fillStyle=vignette;ctx.fillRect(0,0,width,height)}
buildControls();updatePalette();setData(DATASETS[0].csv,DATASETS[0].name,DATASETS[0].file,0);
document.querySelectorAll(".tab").forEach(tab=>tab.onclick=()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x===tab));$("#dropZone").classList.toggle("hidden",tab.dataset.tab!=="upload");$("#pastePanel").classList.toggle("hidden",tab.dataset.tab!=="paste")});
$("#baseColor").oninput=e=>{state.base=e.target.value;$("#colorHex").textContent=state.base.toUpperCase();updatePalette()};$("#harmony").onchange=e=>{state.harmony=e.target.value;updatePalette()};$("#applyData").onclick=()=>setData($("#dataText").value,"Pasted Data","pasted-data.csv");
function readFile(file){if(!file)return;const reader=new FileReader();reader.onload=()=>setData(String(reader.result),file.name.replace(/\.csv$/i,"").replace(/[-_]/g," "),file.name);reader.readAsText(file)}$("#fileInput").onchange=e=>readFile(e.target.files[0]);["dragenter","dragover"].forEach(type=>$("#dropZone").addEventListener(type,e=>{e.preventDefault();$("#dropZone").classList.add("dragging")}));["dragleave","drop"].forEach(type=>$("#dropZone").addEventListener(type,e=>{$("#dropZone").classList.remove("dragging");if(type==="drop"){e.preventDefault();readFile(e.dataTransfer.files[0])}}));
$("#exportButton").onclick=()=>{const link=document.createElement("a");link.download=`aura-${state.mode}.png`;link.href=canvas.toDataURL("image/png");link.click()};
window.addEventListener("keydown",e=>{if(e.target.matches("input,textarea,select"))return;const key=e.key.toLowerCase();if(!["q","w","e","r","a","arrowleft","arrowright"].includes(key))return;e.preventDefault();if(key==="q")randomDataset();if(key==="w")randomMode();if(key==="e")randomHarmony();if(key==="r")selectTarget();if(key==="a"||key==="arrowright")turnKnob(1);if(key==="arrowleft")turnKnob(-1)});
window.addEventListener("wheel",e=>{const now=performance.now();if(now-state.lastWheel<70)return;e.preventDefault();state.lastWheel=now;const delta=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:-e.deltaY;if(delta)turnKnob(delta>0?1:-1)},{passive:false});
new ResizeObserver(resize).observe(canvas);requestAnimationFrame(animate);

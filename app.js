/* ==========================================================
   Círculo de Quintas – Algorítmico con renderer SVG (Diseño 1)
   - Notación española con solo naturales y # (sin ♭)
   - 12 tonalidades mayores y menores
   - Menor natural / armónica
   - Progresiones: I–IV–V e I–III–V
   ========================================================== */

// ---------- Lógica musical (igual que versiones previas) ----------
const CHROMA = ["Do","Do#","Re","Re#","Mi","Fa","Fa#","Sol","Sol#","La","La#","Si"];
const FLAT_TO_SHARP = {"Do♭":"Si","Re♭":"Do#","Mi♭":"Re#","Fa♭":"Mi","Sol♭":"Fa#","La♭":"Sol#","Si♭":"La#","Cb":"Si","Db":"Do#","Eb":"Re#","Fb":"Mi","Gb":"Fa#","Ab":"Sol#","Bb":"La#"};
const SPECIALS = { "Mi#":"Fa", "Si#":"Do" };
const norm = (n) => SPECIALS[n] || FLAT_TO_SHARP[n] || n;
const idx  = (n) => CHROMA.indexOf(norm(n));
const wrap = (i) => (i+12)%12;
const noteAt = (i) => CHROMA[wrap(i)];

function buildScale(tonic, kind="mayor", menorTipo="natural"){
  const t = idx(tonic); if (t < 0) return null;
  const steps = { mayor:[2,2,1,2,2,2,1], menorNatural:[2,1,2,2,1,2,2], menorArmonica:[2,1,2,2,1,3,1] };
  const pattern = (kind === "mayor") ? steps.mayor : (menorTipo === "armonica" ? steps.menorArmonica : steps.menorNatural);
  const notes = [noteAt(t)]; let cur=t; for (let s of pattern.slice(0,6)){ cur += s; notes.push(noteAt(cur)); } return notes;
}
const semisBetween = (a,b) => wrap(idx(b) - idx(a));
function triadQuality(root,third,fifth){ const a=semisBetween(root,third), b=semisBetween(third,fifth); if(a===4&&b===3) return "maj"; if(a===3&&b===4) return "min"; if(a===3&&b===3) return "dim"; if(a===4&&b===4) return "aug"; return "unk"; }
function chordName(root,q){ if(q==="maj") return root; if(q==="min") return `${root} m`; if(q==="dim") return `${root}°`; if(q==="aug") return `${root}+`; return root; }
function romanForDegree(i,q){ const B=["I","II","III","IV","V","VI","VII"][i]; if(q==="maj"||q==="aug") return q==="aug"?B+"+":B; if(q==="dim") return B.toLowerCase()+"°"; return B.toLowerCase(); }
function buildTriads(scale){ return scale.map((_,i)=>[scale[i], scale[(i+2)%7], scale[(i+4)%7]]); }
function circleOfFifths(startNote){ const start=idx(startNote); const s=new Set(); const L=[]; let cur=start; for(let k=0;k<12;k++){ const n=noteAt(cur); if(!s.has(n)){s.add(n);L.push(n);} cur+=7; } return L; }

// ---------- UI refs ----------
const modoSel=document.getElementById("modo");
const tonalidadSel=document.getElementById("tonalidad");
const menorTipoWrap=document.getElementById("menorTipoWrap");
const menorTipoSel=document.getElementById("menorTipo");
const svg=document.getElementById("circuloSvg");
const tecladoDiv=document.getElementById("teclado");
const acordesDiv=document.getElementById("acordes");
const progresionesDiv=document.getElementById("progresiones");

const circleMajor=circleOfFifths("Do");
const circleMinor=circleOfFifths("La");
const teclasBlancas=["Do","Re","Mi","Fa","Sol","La","Si"];

function drawKeyboard(highlight){ tecladoDiv.innerHTML=""; teclasBlancas.forEach(n=>{const k=document.createElement("div"); k.className="tecla"; if(highlight&&highlight.startsWith(n)) k.classList.add("activa"); const lab=document.createElement("span"); lab.textContent=n; k.appendChild(lab); tecladoDiv.appendChild(k);}); }

function loadTonalities(){ tonalidadSel.innerHTML=""; (modoSel.value==="mayor"?circleMajor:circleMinor).forEach(n=>{const o=document.createElement("option"); o.value=n;o.textContent=n; tonalidadSel.appendChild(o);}); menorTipoWrap.classList.toggle("hidden", modoSel.value!=="menor"); }

// ---------- Renderer SVG (Diseño 1) ----------
function polarToXY(r, ang){ return { x: r*Math.cos(ang), y: r*Math.sin(ang) }; }
function arcPath(rOuter, rInner, a0, a1){
  const p1 = polarToXY(rOuter, a0), p2 = polarToXY(rOuter, a1);
  const p3 = polarToXY(rInner, a1), p4 = polarToXY(rInner, a0);
  const largeArc = (a1 - a0) > Math.PI ? 1 : 0;
  return `M ${p1.x} ${p1.y} A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A ${rInner} ${rInner} 0 ${largeArc} 0 ${p4.x} ${p4.y} Z`;
}

const SEG_COLORS = [
  '#d97706','#f59e0b','#f97316','#ef4444','#dc2626','#ef4444',
  '#22c55e','#10b981','#06b6d4','#0ea5e9','#2563eb','#7c3aed'
];

function renderCircle(){
  const notas = (modoSel.value==='mayor') ? circleMajor : circleMinor;
  const sel = tonalidadSel.value;
  svg.innerHTML = '';

  // Disco metálico exterior
  const ring = document.createElementNS('http://www.w3.org/2000/svg','circle');
  ring.setAttribute('r','145');
  ring.setAttribute('fill','#0b1220');
  ring.setAttribute('stroke','#334155');
  ring.setAttribute('stroke-width','6');
  svg.appendChild(ring);

  const outer = 130, inner = 90; // anillo de segmentos
  const step = (2*Math.PI) / notas.length;

  notas.forEach((nota, i)=>{
    const a0 = -Math.PI/2 + i*step;
    const a1 = a0 + step;
    const path = document.createElementNS('http://www.w3.org/2000/svg','path');
    path.setAttribute('d', arcPath(outer, inner, a0, a1));
    path.setAttribute('class','segmento');
    path.setAttribute('fill', SEG_COLORS[i % SEG_COLORS.length]);
    if (nota === sel) path.classList.add('activo');
    path.addEventListener('click', ()=>{ tonalidadSel.value = nota; updateAll(); });
    svg.appendChild(path);

    // Etiqueta de la nota
    const mid = a0 + step/2;
    const labR = (outer + inner)/2;
    const p = polarToXY(labR, mid);
    const text = document.createElementNS('http://www.w3.org/2000/svg','text');
    text.setAttribute('x', p.x);
    text.setAttribute('y', p.y+1);
    text.setAttribute('class','texto-nota');
    text.textContent = nota;
    svg.appendChild(text);
  });

  // Brillo central
  const core = document.createElementNS('http://www.w3.org/2000/svg','circle');
  core.setAttribute('r','70'); core.setAttribute('fill','url(#gradCore)'); svg.appendChild(core);

  // Definición de gradiente central
  const defs = document.createElementNS('http://www.w3.org/2000/svg','defs');
  const rg = document.createElementNS('http://www.w3.org/2000/svg','radialGradient');
  rg.setAttribute('id','gradCore'); rg.setAttribute('cx','50%'); rg.setAttribute('cy','50%');
  rg.setAttribute('r','50%');
  const s1 = document.createElementNS('http://www.w3.org/2000/svg','stop'); s1.setAttribute('offset','0%'); s1.setAttribute('stop-color','#fff59d'); s1.setAttribute('stop-opacity','0.95');
  const s2 = document.createElementNS('http://www.w3.org/2000/svg','stop'); s2.setAttribute('offset','60%'); s2.setAttribute('stop-color','#38bdf8'); s2.setAttribute('stop-opacity','0.45');
  const s3 = document.createElementNS('http://www.w3.org/2000/svg','stop'); s3.setAttribute('offset','100%'); s3.setAttribute('stop-color','#000000'); s3.setAttribute('stop-opacity','0');
  rg.appendChild(s1); rg.appendChild(s2); rg.appendChild(s3); defs.appendChild(rg); svg.appendChild(defs);
}

function renderChords(){
  const kind=modoSel.value, tono=tonalidadSel.value, menorTipo=(kind==="menor"?menorTipoSel.value:"natural");
  const scale=buildScale(tono,kind,menorTipo); const acordesDiv=document.getElementById('acordes');
  if(!scale){acordesDiv.innerHTML="<div class='card'><p>⚠️ No se pudo generar la escala.</p></div>";return;}
  const triads=buildTriads(scale); acordesDiv.innerHTML="";
  triads.forEach((t,i)=>{ const q=triadQuality(t[0],t[1],t[2]); const rn=romanForDegree(i,q); const nm=chordName(t[0],q); const card=document.createElement("div"); card.className="card"; card.innerHTML=`<h3><span class="roman">${rn}</span> · <span class="chord">${nm}</span></h3><div class="hint">${t.join(" – ")}</div>`; acordesDiv.appendChild(card); });
  drawKeyboard(scale[0]); renderProgressions(scale);
}

function renderProgressions(scale){
  const progresionesDiv=document.getElementById('progresiones'); progresionesDiv.innerHTML="";
  const triads=buildTriads(scale).map(t=>({ notes:t, q:triadQuality(t[0],t[1],t[2]), name:chordName(t[0], triadQuality(t[0],t[1],t[2])) }));
  const sets=[ {title:"I – IV – V", deg:[0,3,4]}, {title:"I – III – V", deg:[0,2,4]} ];
  sets.forEach(p=>{ const wrap=document.createElement("div"); wrap.className="prog"; const row=p.deg.map(i=>`<strong>${romanForDegree(i,triads[i].q)}</strong> ${triads[i].name}`).join("  ·  "); wrap.innerHTML=`<h3>${p.title}</h3><div>${row}</div>`; progresionesDiv.appendChild(wrap); });
}

function updateAll(){ renderCircle(); renderChords(); }

// Bootstrap/listeners
function init(){
  const list = (modoSel.value==="mayor") ? circleMajor : circleMinor;
  tonalidadSel.innerHTML = ""; list.forEach(n=>{const o=document.createElement('option');o.value=n;o.textContent=n;tonalidadSel.appendChild(o);});
  menorTipoWrap.classList.toggle("hidden", modoSel.value!=="menor");
  drawKeyboard('Do'); updateAll();
}
modoSel.addEventListener('change', init);
menorTipoSel.addEventListener('change', updateAll);
tonlChange = ()=>updateAll();
tonalidadSel.addEventListener('change', tonlChange);

init();

/* ==========================================================
   Círculo de Quintas – Algorítmico
   - Notación española con solo naturales y # (sin ♭)
   - 12 tonalidades mayores y menores
   - Menor natural / armónica
   - Progresiones: I–IV–V e I–III–V
   ========================================================== */

const CHROMA = ["Do","Do#","Re","Re#","Mi","Fa","Fa#","Sol","Sol#","La","La#","Si"];
const FLAT_TO_SHARP = {"Do♭":"Si","Re♭":"Do#","Mi♭":"Re#","Fa♭":"Mi","Sol♭":"Fa#","La♭":"Sol#","Si♭":"La#","Cb":"Si","Db":"Do#","Eb":"Re#","Fb":"Mi","Gb":"Fa#","Ab":"Sol#","Bb":"La#"};
const SPECIALS = { "Mi#":"Fa", "Si#":"Do" };

const norm = (n) => SPECIALS[n] || FLAT_TO_SHARP[n] || n;
const idx = (n) => CHROMA.indexOf(norm(n));
const wrap = (i) => (i+12)%12;
const noteAt = (i) => CHROMA[wrap(i)];

function buildScale(tonic, kind="mayor", menorTipo="natural"){
  const t = idx(tonic);
  if (t < 0) return null;
  const steps = { mayor:[2,2,1,2,2,2,1], menorNatural:[2,1,2,2,1,2,2], menorArmonica:[2,1,2,2,1,3,1] };
  const pattern = (kind === "mayor") ? steps.mayor : (menorTipo === "armonica" ? steps.menorArmonica : steps.menorNatural);
  const notes = [noteAt(t)];
  let cur = t; for (let s of pattern.slice(0,6)){ cur += s; notes.push(noteAt(cur)); }
  return notes;
}

const semisBetween = (a,b) => wrap(idx(b) - idx(a));
function triadQuality(root,third,fifth){ const a=semisBetween(root,third), b=semisBetween(third,fifth); if(a===4&&b===3) return "maj"; if(a===3&&b===4) return "min"; if(a===3&&b===3) return "dim"; if(a===4&&b===4) return "aug"; return "unk"; }
function chordName(root,q){ if(q==="maj") return root; if(q==="min") return `${root} m`; if(q==="dim") return `${root}°`; if(q==="aug") return `${root}+`; return root; }
function romanForDegree(i,q){ const B=["I","II","III","IV","V","VI","VII"][i]; if(q==="maj"||q==="aug") return q==="aug"?B+"+":B; if(q==="dim") return B.toLowerCase()+"°"; return B.toLowerCase(); }
function buildTriads(scale){ return scale.map((_,i)=>[scale[i], scale[(i+2)%7], scale[(i+4)%7]]); }

function circleOfFifths(startNote){ const start=idx(startNote); const s=new Set(); const L=[]; let cur=start; for(let k=0;k<12;k++){ const n=noteAt(cur); if(!s.has(n)){s.add(n);L.push(n);} cur+=7; } return L; }

// UI refs
const modoSel=document.getElementById("modo");
const tonalidadSel=document.getElementById("tonalidad");
const menorTipoWrap=document.getElementById("menorTipoWrap");
const menorTipoSel=document.getElementById("menorTipo");
const circuloDiv=document.getElementById("circulo");
const tecladoDiv=document.getElementById("teclado");
const acordesDiv=document.getElementById("acordes");
const progresionesDiv=document.getElementById("progresiones");

const circleMajor=circleOfFifths("Do");
const circleMinor=circleOfFifths("La");
const teclasBlancas=["Do","Re","Mi","Fa","Sol","La","Si"];

function drawKeyboard(highlight){ tecladoDiv.innerHTML=""; teclasBlancas.forEach(n=>{const k=document.createElement("div"); k.className="tecla"; if(highlight&&highlight.startsWith(n)) k.classList.add("activa"); const lab=document.createElement("span"); lab.textContent=n; k.appendChild(lab); tecladoDiv.appendChild(k);}); }

function loadTonalities(){ tonalidadSel.innerHTML=""; (modoSel.value==="mayor"?circleMajor:circleMinor).forEach(n=>{const o=document.createElement("option"); o.value=n;o.textContent=n; tonalidadSel.appendChild(o);}); menorTipoWrap.classList.toggle("hidden", modoSel.value!=="menor"); }

function drawCircle(){ const list=(modoSel.value==="mayor"?circleMajor:circleMinor), cur=tonalidadSel.value; circuloDiv.innerHTML=""; list.forEach(n=>{const d=document.createElement("div"); d.className="nota"+(n===cur?" activa":""); d.textContent=n; d.onclick=()=>{ tonalidadSel.value=n; updateAll(); }; circuloDiv.appendChild(d);}); }

function renderChords(){
  const kind=modoSel.value, tono=tonalidadSel.value, menorTipo=(kind==="menor"?menorTipoSel.value:"natural");
  const scale=buildScale(tono,kind,menorTipo); if(!scale){acordesDiv.innerHTML="<div class='card'><p>⚠️ No se pudo generar la escala.</p></div>";return;}
  const triads=buildTriads(scale); acordesDiv.innerHTML="";
  triads.forEach((t,i)=>{ const q=triadQuality(t[0],t[1],t[2]); const rn=romanForDegree(i,q); const nm=chordName(t[0],q); const card=document.createElement("div"); card.className="card"; card.innerHTML=`<h3><span class="roman">${rn}</span> · <span class="chord">${nm}</span></h3><div class="hint">${t.join(" – ")}</div>`; acordesDiv.appendChild(card); });
  drawKeyboard(scale[0]); renderProgressions(scale);
}

function renderProgressions(scale){
  progresionesDiv.innerHTML="";
  const triads=buildTriads(scale).map(t=>({ notes:t, q:triadQuality(t[0],t[1],t[2]), name:chordName(t[0], triadQuality(t[0],t[1],t[2])) }));
  const sets=[ {title:"I – IV – V", deg:[0,3,4]}, {title:"I – III – V", deg:[0,2,4]} ];
  sets.forEach(p=>{ const wrap=document.createElement("div"); wrap.className="prog"; const row=p.deg.map(i=>`<strong>${romanForDegree(i,triads[i].q)}</strong> ${triads[i].name}`).join("  ·  "); wrap.innerHTML=`<h3>${p.title}</h3><div>${row}</div>`; progresionesDiv.appendChild(wrap); });
}

function updateAll(){ drawCircle(); renderChords(); }

modoSel.addEventListener("change", ()=>{loadTonalities(); updateAll();});
tonalidadSel.addEventListener("change", updateAll);
menorTipoSel.addEventListener("change", updateAll);

loadTonalities(); drawKeyboard("Do"); updateAll();

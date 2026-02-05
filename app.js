/* ==========================================================
   Generación musical 100% algorítmica (sin tablas fijas)
   - Notación española con solo naturales y # (sin ♭)
   - Soporta las 12 tonalidades mayores y menores
   - Menor natural / armónica (opcional)
   ========================================================== */

// 12 semitonos en notación española (solo naturales y sostenidos)
const CHROMA = ["Do","Do#","Re","Re#","Mi","Fa","Fa#","Sol","Sol#","La","La#","Si"];

// Conversión de bemoles a sostenidos (y casos especiales)
const FLAT_TO_SHARP = {
  "Do♭":"Si", "Re♭":"Do#", "Mi♭":"Re#", "Fa♭":"Mi", "Sol♭":"Fa#", "La♭":"Sol#", "Si♭":"La#",
  "Cb":"Si","Db":"Do#","Eb":"Re#","Fb":"Mi","Gb":"Fa#","Ab":"Sol#","Bb":"La#"
};
const SPECIALS = { "Mi#":"Fa", "Si#":"Do" };

// Utilidades ------------------------------------------------
const norm = (n) => SPECIALS[n] || FLAT_TO_SHARP[n] || n;
const idx = (n) => CHROMA.indexOf(norm(n));
const wrap = (i) => (i+12)%12;

function noteAt(i){ return CHROMA[wrap(i)]; }

function buildScale(tonic, kind="mayor", menorTipo="natural"){
  const t = idx(tonic);
  if (t < 0) return null;

  const steps = {
    mayor:        [2,2,1,2,2,2,1],
    menorNatural: [2,1,2,2,1,2,2],
    menorArmonica:[2,1,2,2,1,3,1],
  };
  const pattern = (kind === "mayor")
    ? steps.mayor
    : (menorTipo === "armonica" ? steps.menorArmonica : steps.menorNatural);

  const notes = [noteAt(t)];
  let cur = t;
  for (let s of pattern.slice(0,6)){
    cur += s;
    notes.push(noteAt(cur));
  }
  return notes; // 7 notas
}

function semisBetween(a,b){ // distancia ascendente a→b
  return wrap(idx(b) - idx(a));
}

function triadQuality(root,third,fifth){
  const a = semisBetween(root, third);
  const b = semisBetween(third, fifth);
  if (a===4 && b===3) return "maj";
  if (a===3 && b===4) return "min";
  if (a===3 && b===3) return "dim";
  if (a===4 && b===4) return "aug";
  return "unk";
}

function chordName(root, quality){
  if (quality==="maj") return root;
  if (quality==="min") return `${root} m`;
  if (quality==="dim") return `${root}°`;
  if (quality==="aug") return `${root}+`;
  return root;
}

function romanForDegree(i, quality, keyKind){
  const base = ["I","II","III","IV","V","VI","VII"][i];
  if (quality==="maj" || quality==="aug") return quality==="aug" ? base+"+" : base;
  if (quality==="dim") return base.toLowerCase()+"°";
  return base.toLowerCase();
}

function buildTriads(scale){
  const triads = [];
  for (let i=0;i<7;i++){
    triads.push([scale[i], scale[(i+2)%7], scale[(i+4)%7]]);
  }
  return triads;
}

// Círculo de quintas (12 elementos) en sostenidos
function circleOfFifths(startNote){
  const start = idx(startNote);
  const set = new Set();
  const list = [];
  let cur = start;
  for (let k=0;k<12;k++){
    const n = noteAt(cur);
    if (!set.has(n)){ set.add(n); list.push(n); }
    cur += 7; // + quinta
  }
  return list;
}

// Datos UI --------------------------------------------------
const modoSel = document.getElementById("modo");
const tonalidadSel = document.getElementById("tonalidad");
const menorTipoWrap = document.getElementById("menorTipoWrap");
const menorTipoSel = document.getElementById("menorTipo");
const circuloDiv = document.getElementById("circulo");
const tecladoDiv = document.getElementById("teclado");
const acordesDiv = document.getElementById("acordes");
const progresionesDiv = document.getElementById("progresiones");

// Círculos en sólo sostenidos
const circleMajor = circleOfFifths("Do");
const circleMinor = circleOfFifths("La");

// Teclado sencillo (blancas etiquetadas)
const teclasBlancas = ["Do","Re","Mi","Fa","Sol","La","Si"];

function drawKeyboard(highlight){
  tecladoDiv.innerHTML = "";
  teclasBlancas.forEach(n => {
    const k = document.createElement("div");
    k.className = "tecla";
    if (highlight && highlight.startsWith(n)) k.classList.add("activa");
    const label = document.createElement("span");
    label.textContent = n;
    k.appendChild(label);
    tecladoDiv.appendChild(k);
  });
}

// Render tonalidades según modo
function loadTonalities(){
  tonalidadSel.innerHTML = "";
  const list = (modoSel.value==="mayor") ? circleMajor : circleMinor;
  list.forEach(n=>{
    const op=document.createElement("option");
    op.value=n; op.textContent=n;
    tonalidadSel.appendChild(op);
  });
  menorTipoWrap.classList.toggle("hidden", modoSel.value!=="menor");
}

function drawCircle(){
  const list = (modoSel.value==="mayor") ? circleMajor : circleMinor;
  const cur = tonalidadSel.value;
  circuloDiv.innerHTML = "";
  list.forEach(n=>{
    const d = document.createElement("div");
    d.className = "nota" + (n===cur?" activa":"");
    d.textContent = n;
    d.onclick = () => { tonalidadSel.value = n; updateAll(); };
    circuloDiv.appendChild(d);
  });
}

function renderChords(){
  const kind = modoSel.value; // mayor | menor
  const tono = tonalidadSel.value;
  const menorTipo = (kind==="menor") ? menorTipoSel.value : "natural";

  const scale = buildScale(tono, kind, menorTipo);
  if (!scale){ acordesDiv.innerHTML = "<div class='card'><p>⚠️ No se pudo generar la escala.</p></div>"; return; }

  const triads = buildTriads(scale);
  acordesDiv.innerHTML = "";
  triads.forEach((t,i)=>{
    const q = triadQuality(t[0],t[1],t[2]);
    const rn = romanForDegree(i,q,kind);
    const name = chordName(t[0],q);
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3><span class="roman">${rn}</span> · <span class="chord">${name}</span></h3>
      <div class="hint">${t.join(" – ")}</div>
    `;
    acordesDiv.appendChild(card);
  });

  drawKeyboard(scale[0]);
  renderProgressions(scale);
}

function renderProgressions(scale){
  progresionesDiv.innerHTML = "";
  const triads = buildTriads(scale).map(t => ({
    notes: t,
    quality: triadQuality(t[0],t[1],t[2]),
    name: chordName(t[0], triadQuality(t[0],t[1],t[2]))
  }));

  const progData = [
    { title: "I – IV – V", degrees: [0,3,4] },
    { title: "I – III – V", degrees: [0,2,4] }
  ];

  progData.forEach(p=>{
    const wrap = document.createElement("div");
    wrap.className = "prog";
    const parts = p.degrees.map(di=>{
      const rn = romanForDegree(di, triads[di].quality, modoSel.value);
      return `<strong>${rn}</strong> ${triads[di].name}`;
    });
    wrap.innerHTML = `<h3>${p.title}</h3><div>${parts.join("  ·  ")}</div>`;
    progresionesDiv.appendChild(wrap);
  });
}

function updateAll(){
  drawCircle();
  renderChords();
}

// Listeners
modoSel.addEventListener("change", ()=>{ loadTonalities(); updateAll(); });
tonalidadSel.addEventListener("change", updateAll);
menorTipoSel.addEventListener("change", updateAll);

// Bootstrap
loadTonalities();
drawKeyboard("Do");
updateAll();

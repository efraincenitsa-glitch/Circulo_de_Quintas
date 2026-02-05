const circuloMayor=["Do","Sol","Re","La","Mi","Si","Fa#","Re♭","La♭","Mi♭","Si♭","Fa"];
const circuloMenor=["La","Mi","Si","Fa#","Do#","Sol#","Re#","Si♭","Fa","Do","Sol","Re"];
const escalas={
  mayor:{"Do":["Do","Re","Mi","Fa","Sol","La","Si"],"Sol":["Sol","La","Si","Do","Re","Mi","Fa#"],"Re":["Re","Mi","Fa#","Sol","La","Si","Do#"],"La":["La","Si","Do#","Re","Mi","Fa#","Sol#"],"Mi":["Mi","Fa#","Sol#","La","Si","Do#","Re#"],"Fa":["Fa","Sol","La","Si♭","Do","Re","Mi"]},
  menor:{"La":["La","Si","Do","Re","Mi","Fa","Sol"],"Mi":["Mi","Fa#","Sol","La","Si","Do","Re"],"Re":["Re","Mi","Fa","Sol","La","Si♭","Do"],"Do":["Do","Re","Mi♭","Fa","Sol","La♭","Si♭"]}
};
const cualidadesMayor=["I","ii","iii","IV","V","vi","vii°"];
const cualidadesMenor=["i","ii°","III","iv","v","VI","VII"];

const modo=document.getElementById('modo');
const tonalidad=document.getElementById('tonalidad');
const circulo=document.getElementById('circulo');
const teclado=document.getElementById('teclado');
const acordes=document.getElementById('acordes');
const menorTipoWrap=document.getElementById('menorTipoWrap');

function cargarTonalidades(){
  tonalidad.innerHTML='';
  const lista=modo.value==='mayor'?circuloMayor:circuloMenor;
  lista.forEach(n=>{const o=document.createElement('option');o.value=n;o.textContent=n;tonalidad.appendChild(o);});
  menorTipoWrap.classList.toggle('hidden',modo.value!=='menor');
}

function dibujarCirculo(){
  circulo.innerHTML='';
  const lista=modo.value==='mayor'?circuloMayor:circuloMenor;
  lista.forEach(n=>{const d=document.createElement('div');d.className='nota'+(n===tonalidad.value?' activa':'');d.textContent=n;d.onclick=()=>{tonalidad.value=n;actualizar();};circulo.appendChild(d);});
}

function dibujarTeclado(){
  teclado.innerHTML='';
  ['Do','Re','Mi','Fa','Sol','La','Si'].forEach(n=>{const t=document.createElement('div');t.className='tecla'+(tonalidad.value.startsWith(n)?' activa':'');teclado.appendChild(t);});
}

function mostrarAcordes(){
  acordes.innerHTML='';
  const esc=(modo.value==='mayor'?escalas.mayor:escalas.menor)[tonalidad.value];
  if(!esc) return;
  const cual=modo.value==='mayor'?cualidadesMayor:cualidadesMenor;
  for(let i=0;i<7;i++){
    const root=esc[i];
    const c=cual[i];
    const card=document.createElement('div');card.className='card';
    card.textContent=c+' - '+root;
    acordes.appendChild(card);
  }
}

function actualizar(){dibujarCirculo();dibujarTeclado();mostrarAcordes();}
modo.onchange=()=>{cargarTonalidades();actualizar();};
tonalidad.onchange=actualizar;
cargarTonalidades();actualizar();

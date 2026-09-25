(()=>{
const SITE=JSON.parse(document.getElementById('site-data').textContent);
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;

// Header et menu mobile
const hdr=$('#hdr'), burger=$('#burger'), menu=$('#menu');
const setMenu=open=>{
  menu.classList.toggle('open',open); burger.setAttribute('aria-expanded',open);
  burger.setAttribute('aria-label',open?'Fermer le menu':'Ouvrir le menu');
  burger.querySelector('use').setAttribute('href',open?'#i-x':'#i-menu');
  document.body.style.overflow=open?'hidden':''; hdr.classList.toggle('solid',open||scrollY>40);
};
burger.addEventListener('click',()=>setMenu(!menu.classList.contains('open')));
menu.addEventListener('click',e=>{ if(e.target.closest('a')) setMenu(false); });
addEventListener('keydown',e=>{ if(e.key==='Escape'&&menu.classList.contains('open')){ setMenu(false); burger.focus(); } });

// Chantier en accéléré (section facultative)
const tl=$('#chantier'), layers=$$('#tlMedia img'), chs=$$('.tl-ch'), weekEl=$('#week'), rail=$('#rail');
const N=layers.length, WEEKS=[1,3,5,8,11,14,18,22,28,34,34];
const labels=['Terrain','Fondations','Dalle','Hors d\'eau','Finitions','Clés'];
if(tl) chs.forEach((c,i)=>{
  const li=document.createElement('li'), b=document.createElement('button');
  b.type='button'; b.textContent=labels[i]; b.setAttribute('aria-label',`Étape ${i+1} : ${labels[i]}`);
  b.addEventListener('click',()=>{
    const a=+c.dataset.a, span=tl.offsetHeight-innerHeight;
    scrollTo({top:tl.offsetTop+span*(a/(N-0.6))+2,behavior:reduce.matches?'auto':'smooth'});
  });
  li.appendChild(b); rail.appendChild(li); c._b=b;
});
let lastWeek=-1; const scrimL=$('#scrimL'), scrimR=$('#scrimR');
function timelapse(){
  if(!tl) return;
  const r=tl.getBoundingClientRect(), span=tl.offsetHeight-innerHeight;
  if(r.bottom<0||r.top>innerHeight) return;
  const P=clamp(-r.top/span,0,1), raw=clamp(P*(N-0.6),0,N-1);
  const seg=Math.min(Math.floor(raw),N-1), f=raw-seg;
  let t=clamp((f-.45)/.55,0,1); t=reduce.matches?(t>.5?1:0):ease(t);
  const pos=seg+t, lo=Math.floor(pos), hi=Math.min(lo+1,N-1), a=pos-lo;
  const kb=reduce.matches?0:.05*Math.min(pos,9)/9;
  layers.forEach((im,k)=>{
    let o=k===lo?1:(k===hi&&hi!==lo?a:0);
    im.style.opacity=o;
    if(o>0&&!reduce.matches){
      let s=1+kb;
      if(k===9) s+=0.55*ease(clamp(pos-9,0,1));
      if(k===10) s=1.14-0.14*ease(clamp(pos-9,0,1));
      im.style.transform=`scale(${s.toFixed(4)})`;
    }
  });
  const w=Math.round(WEEKS[lo]+(WEEKS[hi]-WEEKS[lo])*a);
  if(w!==lastWeek){ weekEl.textContent=w; lastWeek=w; }
  const side={l:0,r:0};
  chs.forEach((c,i)=>{
    const A=+c.dataset.a, B=+c.dataset.b, s=A-.5, e=B+.5;
    let o=Math.min(i===0?1:clamp((raw-s)/.15,0,1), i===chs.length-1?1:clamp((e-raw)/.15,0,1));
    if(raw<s||raw>e) o=(i===0&&raw<s)?1:0;
    if(reduce.matches) o=o>.5?1:0;
    c.style.opacity=o; c.style.visibility=o<.01?'hidden':'visible';
    c.style.pointerEvents=o>.5?'auto':'none';
    const mob=innerWidth<900, entering=raw<(A+B)/2;
    const sign=mob?(entering?1:-1):(c.dataset.side==='r'?1:-1);
    const dx=reduce.matches?0:(1-o)*(mob?64:96)*sign;
    c.style.setProperty('--dx',dx.toFixed(1)+'px');
    side[c.dataset.side]+=o;
    const fill=clamp((raw-A+.5)/(B-A+1),0,1);
    c._b.style.setProperty('--f',fill.toFixed(3));
    o>.5?c._b.setAttribute('aria-current','step'):c._b.removeAttribute('aria-current');
  });
  scrimL.style.opacity=Math.min(1,side.l).toFixed(3); scrimR.style.opacity=Math.min(1,side.r).toFixed(3);
}

// Processus : la ligne se remplit au scroll
const steps=$('#steps'), stepLis=$$('#steps li');
function process(){
  if(!steps) return;
  const r=steps.getBoundingClientRect(), vh=innerHeight;
  const p=clamp((vh*.85-r.top)/(r.height+vh*.35),0,1);
  steps.style.setProperty('--p',p.toFixed(3));
  stepLis.forEach((li,i)=>li.classList.toggle('on',p>=(i+.5)/stepLis.length));
}

let ticking=false;
function onScroll(){
  if(ticking) return; ticking=true;
  requestAnimationFrame(()=>{ ticking=false;
    if(!menu.classList.contains('open')) hdr.classList.toggle('solid',scrollY>40);
    timelapse(); process();
  });
}
addEventListener('scroll',onScroll,{passive:true});
addEventListener('resize',onScroll);
reduce.addEventListener?.('change',onScroll);
onScroll();

// Avant / après
const ba=$('#ba');
if(ba){ const range=ba.querySelector('input');
  const setBA=()=>ba.style.setProperty('--x',range.value+'%');
  range.addEventListener('input',setBA); setBA(); }

// Témoignages (uniquement si l'entreprise en fournit de vrais)
const Q=SITE.temoignages||[];
if(Q.length&&$('#quote')){
let qi=0; const qF=$('#quote'), qT=$('#qText'), qW=$('#qWho'), qC=$('#qCount');
const renderQ=()=>{ qT.textContent=Q[qi].t; qW.innerHTML=''; const b=document.createElement('b'); b.textContent=Q[qi].n; qW.append(b,Q[qi].w); qC.textContent=`${qi+1} / ${Q.length}`; };
const goQ=d=>{ qi=(qi+d+Q.length)%Q.length;
  if(reduce.matches){ renderQ(); return; }
  qF.classList.add('out'); setTimeout(()=>{ renderQ(); qF.classList.remove('out'); },280); };
$('#qPrev').addEventListener('click',()=>goQ(-1)); $('#qNext').addEventListener('click',()=>goQ(1)); renderQ();
}

// Formulaire vers WhatsApp
const form=$('#quoteForm'), el=form.elements, btn=$('#fSubmit'), st=$('#fStatus'), WA=SITE.wa;
form.addEventListener('submit',e=>{
  e.preventDefault();
  const name=el.fullname.value.trim(), tel=el.tel.value.replace(/\D/g,'');
  el.fullname.setAttribute('aria-invalid',name?'false':'true');
  el.tel.setAttribute('aria-invalid',tel.length>=9?'false':'true');
  if(!name){ el.fullname.focus(); return; } if(tel.length<9){ el.tel.focus(); return; }
  btn.setAttribute('aria-busy','true'); btn.disabled=true; btn.querySelector('.lbl').textContent='Préparation du message';
  const val=n=>el[n]?el[n].value.trim():'';
  const lines=[`Bonjour ${SITE.nom}, je souhaite un devis.`,`Nom : ${name}`,`Téléphone : ${el.tel.value.trim()}`,
    val('city')&&`Lieu du chantier : ${val('city')}`, val('ptype')&&`Projet : ${val('ptype')}`,
    val('budget')&&`Budget : ${val('budget')}`, val('msg')].filter(Boolean);
  const a=document.createElement('a'); a.href=`https://wa.me/${WA}?text=${encodeURIComponent(lines.join('\n'))}`; a.target='_blank'; a.rel='noopener';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>{ btn.removeAttribute('aria-busy'); btn.disabled=false; btn.querySelector('.lbl').textContent=SITE.ctaForm;
    st.textContent='Votre message est prêt dans WhatsApp, il ne reste qu\'à l\'envoyer.'; },900);
});
['fullname','tel'].forEach(n=>el[n].addEventListener('input',()=>el[n].removeAttribute('aria-invalid')));
})();

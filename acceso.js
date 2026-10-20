(() => {
'use strict';
const cfg=window.APP_CONFIG||{},root=document.getElementById('app'),page=document.body.dataset.exam;
const TEACHERS=['dbermon181@g.educaand.es','cmaredr345@g.educaand.es'];
const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),v=>v.toString(16).padStart(2,'0')).join('');
const emailOK=s=>/^[-a-z0-9._+]+@g\.educaand\.es$/.test(s);
const storageKey=(cfg.preview?'demo-access-v5-':'secure-access-v5-')+(cfg.endpoint||'unconfigured');
const href=id=>cfg.preview?'?modelo='+id:({'inicio':'index.html','prueba':'prueba.html','1':'simulacion-1.html','2':'simulacion-2.html'}[id]);
const ready=/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(cfg.endpoint||'');
let auth=null,engineLoaded=false;
$('#school').textContent='Matemáticas · 2.º ESO';
$('.brand').href=href('inicio');
window.secureAPI=async p=>{
 if(cfg.preview&&window.previewAPI)return window.previewAPI(p);
 if(!ready)throw new Error('El acceso aún no está activado. El profesor debe completar la instalación.');
 if(location.protocol!=='https:')throw new Error('Accede desde la dirección publicada de la web.');
 return new Promise((resolve,reject)=>{
  const requestId=uid(),frame=document.createElement('iframe'),form=document.createElement('form');
  frame.name='access-'+requestId;frame.hidden=true;frame.title='Comprobación de acceso';
  form.hidden=true;form.method='POST';form.action=cfg.endpoint;form.target=frame.name;
  const input=document.createElement('input');input.name='payload';input.value=JSON.stringify({...p,origin:location.origin,requestId});form.append(input);
  let timer;const cleanup=()=>{clearTimeout(timer);window.removeEventListener('message',receive);form.remove();frame.remove();};
  function receive(e){
   let allowed=false;try{const u=new URL(e.origin);allowed=u.protocol==='https:'&&(u.hostname==='script.google.com'||u.hostname==='script.googleusercontent.com'||u.hostname.endsWith('.script.googleusercontent.com')||u.hostname.endsWith('-script.googleusercontent.com'));}catch(_){}
   const d=e.data;if(!allowed||!d||!['SP_DIAGNOSTICO_API','SP_DIAGNOSTICO_RECEIPT'].includes(d.type)||d.requestId!==requestId)return;
   cleanup();if(d.apiVersion!=='5.0'){reject(new Error('El servidor pertenece a una versión anterior. Actualiza Apps Script a la versión 5 y publica una nueva implementación.'));return;}if(d.ok)resolve(d);else reject(new Error(d.error||'No se ha podido completar la solicitud.'));
  }
  window.addEventListener('message',receive);document.body.append(frame,form);
  timer=setTimeout(()=>{cleanup();reject(new Error('No se ha recibido confirmación. Comprueba la conexión y vuelve a intentarlo.'));},60000);form.submit();
 });
};
function remember(r){auth={token:r.token,user:r.user};window.AUTH=auth;try{sessionStorage.setItem(storageKey,JSON.stringify(auth));}catch(_){} }
function clearSession(){auth=null;window.AUTH=null;try{sessionStorage.removeItem(storageKey);}catch(_){} }
window.logoutAccess=async()=>{
 const old=auth;clearSession();root.innerHTML='<main class="auth-loading" role="status">Cerrando sesión…</main>';$('#session-bar').hidden=true;document.querySelectorAll('.teacher-passwords').forEach(el=>el.remove());window.EXAMS={};window.GROUPS={};window.SOLUTIONS={};if(old)try{await window.secureAPI({action:'logout',token:old.token});}catch(_){}
 location.href=href('inicio');
};
function sessionBar(user){const el=$('#session-bar');el.hidden=false;el.className='session-bar';el.innerHTML=`<div><span class="session-role">${user.role==='teacher'?'PROFESORADO':'ALUMNADO'}</span><span class="session-email">${esc(user.email)}</span></div><div>${user.role==='teacher'?`<a class="btn light" href="${href('inicio')}">Panel del profesor</a>`:''}<button class="btn light" id="end-session">Cerrar sesión</button></div>`;$('#end-session').onclick=()=>{if(confirm('¿Cerrar la sesión? Las respuestas que hayas guardado en este navegador se conservarán para tu correo.'))window.logoutAccess();};}
function login(message=''){
 clearSession();$('#session-bar').hidden=true;
 root.innerHTML=`<main class="login-layout"><section class="login-intro"><p class="eyebrow">IES Sancti Petri · Matemáticas</p><h1>Pruebas de diagnóstico</h1><p class="lede">Acceso al espacio de práctica de 2.º ESO.<br>Selecciona tu simulación e identifícate para comenzar.</p><ol class="login-steps"><li><b>1</b><span>Introduce tu correo corporativo del centro.</span></li><li><b>2</b><span>Escribe la contraseña correspondiente a tu acceso.</span></li><li><b>3</b><span>Completa tus datos y realiza la simulación.</span></li></ol><p class="auth-panel-note">Dos simulaciones de 45 minutos.<br>Demostración y corrección disponibles para el profesorado.</p></section><section class="start-card login-card"><h2>Identificación</h2><p class="intro">Introduce tu correo y tu contraseña de acceso.</p><form id="access-form" onsubmit="return false"><label for="access-email">Correo corporativo</label><input id="access-email" type="email" required maxlength="160" autocomplete="username" inputmode="email" placeholder="usuario@g.educaand.es" aria-describedby="email-help"><div id="student-fields"><label for="access-exam">Simulación</label><select id="access-exam"><option value="1">Simulación 1</option><option value="2">Simulación 2</option></select></div><p id="role-note" class="role-note" hidden>Acceso del profesorado</p><label for="access-password" id="password-label">Contraseña de la simulación</label><div class="password-wrap"><input id="access-password" type="password" required maxlength="128" autocomplete="current-password" aria-describedby="password-help"><button type="button" id="show-password" aria-label="Mostrar contraseña" aria-pressed="false">Mostrar</button></div><button class="btn full" id="access-submit" type="submit">Entrar</button><p class="login-help" id="password-help">Utiliza la clave facilitada por tu profesor. No escribas la contraseña de tu correo.</p><div id="login-error" class="login-error" role="alert"></div><p class="login-help" id="email-help">Solo correos terminados en @g.educaand.es.</p></form></section></main>`;
 const selected=['1','2'].includes(page)?page:'1';$('#access-exam').value=selected;
 if(['1','2'].includes(page))$('#access-exam').disabled=true;
 const err=t=>{const n=$('#login-error');if(n)n.textContent=t;else login(t);};
 let lastTeacher=false;
 function emailChanged(){
  const email=$('#access-email').value.trim().toLowerCase(),teacher=TEACHERS.includes(email);
  $('#student-fields').hidden=teacher||page==='prueba';
  $('#role-note').hidden=!teacher;$('#password-label').textContent=teacher?'Contraseña del profesorado':'Contraseña de la simulación';
  $('#access-submit').textContent=teacher?'Entrar en modo profesor':'Entrar en la simulación';
  $('#password-help').textContent=teacher?'Introduce la contraseña docente para acceder al panel, a las claves y a la corrección.':'Utiliza la clave facilitada por tu profesor. No escribas la contraseña de tu correo.';
  if(lastTeacher!==teacher){$('#access-password').value='';$('#access-password').type='password';$('#show-password').textContent='Mostrar';$('#show-password').setAttribute('aria-pressed','false');}
  lastTeacher=teacher;err('');
  if(page==='prueba'&&!teacher){$('#role-note').hidden=false;$('#role-note').textContent='Prueba y Corrección: acceso exclusivo del profesorado.';}else $('#role-note').textContent='Acceso del profesorado';
 }
 $('#access-email').oninput=emailChanged;$('#access-email').onchange=emailChanged;
 $('#show-password').onclick=()=>{const input=$('#access-password'),show=input.type==='password';input.type=show?'text':'password';$('#show-password').textContent=show?'Ocultar':'Mostrar';$('#show-password').setAttribute('aria-label',show?'Ocultar contraseña':'Mostrar contraseña');$('#show-password').setAttribute('aria-pressed',String(show));};
 $('#access-form').onsubmit=async e=>{
  e.preventDefault();const email=$('#access-email').value.trim().toLowerCase(),teacher=TEACHERS.includes(email),password=$('#access-password').value;
  if(!emailOK(email)){err('Escribe un correo válido terminado en @g.educaand.es.');return;}
  if(page==='prueba'&&!teacher){err('Prueba y Corrección están reservadas al profesorado autorizado.');return;}
  if(!password){err('Introduce la contraseña de acceso.');$('#access-password').focus();return;}
  const btn=$('#access-submit');btn.disabled=true;err('Comprobando acceso…');
  try{
   const result=await window.secureAPI({action:teacher?'teacherLogin':'studentLogin',email,password,exam:$('#access-exam').value});
   $('#access-password').value='';remember(result);await enter();
  }catch(e){err(e.message);btn.disabled=false;}
 };
 emailChanged();if(message)err(message);
}
async function teacherDashboard(){
 const d=await window.secureAPI({action:'dashboard',token:auth.token});sessionBar(d.user);
 root.innerHTML=`<main class="dashboard"><div class="dashboard-heading"><section><p class="eyebrow">Área del profesorado</p><h1>Panel de simulaciones</h1><p class="muted">Consulta las contraseñas y prepara la sesión con tu grupo.</p></section><span class="pill">2.º ESO · Matemáticas</span></div><div class="home-cards">${['1','2'].map(id=>`<section class="home-card"><h2>Simulación ${id}</h2><p>16 preguntas · 45 minutos</p><p class="small">Contraseña de acceso para el alumnado</p><code class="password-value">${esc(d.passwords[id])}</code><div class="button-row"><button class="btn light" data-copy="${id}">Copiar contraseña</button><a class="btn" href="${href('prueba')}${cfg.preview?'&':'?'}correccion=${id}">Ver corrección</a></div></section>`).join('')}</div><section class="dashboard-demo"><div><h2>Prueba para la pizarra</h2><p>8 preguntas de demostración y corrección de los tres modelos.</p></div><a href="${href('prueba')}" class="btn">Abrir Prueba →</a></section><p class="dashboard-note">Las claves distinguen mayúsculas y minúsculas. Cada una permite entrar únicamente en su simulación.</p><p id="copy-status" role="status" class="small"></p></main>`;
 root.querySelectorAll('[data-copy]').forEach(btn=>btn.onclick=async()=>{try{await navigator.clipboard.writeText(d.passwords[btn.dataset.copy]);$('#copy-status').textContent='Contraseña copiada.';}catch(_){$('#copy-status').textContent='Selecciona la contraseña y cópiala con Ctrl+C.';}});
}
async function enter(){
 if(auth.user.role==='teacher'&&['1','2'].includes(page)){location.href=href('prueba')+(cfg.preview?'&':'?')+'correccion='+page;return;}
 if(auth.user.role==='student'&&(page==='inicio'||page!==auth.user.exam)){location.href=href(auth.user.exam);return;}
 root.innerHTML='<main class="auth-loading" role="status">Comprobando permiso y cargando el contenido…</main>';
 if(auth.user.role==='teacher'&&page==='inicio'){await teacherDashboard();return;}
 const d=await window.secureAPI({action:'content',exam:page,token:auth.token});
 auth.user=d.user;window.AUTH=auth;window.EXAMS=d.exams;window.GROUPS=d.groups;window.SOLUTIONS=d.solutions||{};sessionBar(d.user);
 if(d.user.role==='teacher'){
  const r=await window.secureAPI({action:'dashboard',token:auth.token}),box=document.createElement('details');box.className='teacher-passwords';box.innerHTML=`<summary>Consultar contraseñas de las simulaciones</summary><div class="inline-keys"><span>Simulación 1: <code>${esc(r.passwords['1'])}</code></span><span>Simulación 2: <code>${esc(r.passwords['2'])}</code></span></div>`;root.before(box);
  const target=new URLSearchParams(location.search).get('correccion');if(['1','2','prueba'].includes(target))window.correctionTarget=target;
 }
 if(!engineLoaded){if(!window.startExam)await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='app.js?v=5.0';s.onload=resolve;s.onerror=()=>reject(new Error('No se pudo cargar la prueba. Recarga la página.'));document.head.append(s);});engineLoaded=true;window.startExam();}
}
async function boot(){
 try{auth=JSON.parse(sessionStorage.getItem(storageKey)||'null');}catch(_){}
 if(auth?.token&&auth?.user?.expires>Date.now()){
  // A direct link to a different student exam always asks for its own credentials.
  if(auth.user.role==='student'&&(page==='prueba'||(['1','2'].includes(page)&&page!==auth.user.exam))){login('Identifícate con la contraseña de esta simulación.');return;}
  try{window.AUTH=auth;await enter();return;}catch(e){login(e.message);return;}
 }
 login();
}
boot();
})();

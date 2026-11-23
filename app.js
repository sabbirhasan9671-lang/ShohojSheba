'use strict';
const CFG=window.SS_CONFIG||{},LIVE=!!(CFG.SUPABASE_URL&&CFG.SUPABASE_ANON_KEY&&window.supabase);
const sb=LIVE?supabase.createClient(CFG.SUPABASE_URL,CFG.SUPABASE_ANON_KEY):null;
const EC=['বিশ্ববিদ্যালয়','জাতীয় বিশ্ববিদ্যালয়','শিক্ষা বোর্ড','বৃত্তি ও উপবৃত্তি','ভর্তি ও আবেদন','পরীক্ষা ও ফলাফল','স্কুল ও কলেজ','কারিগরি ও মাদ্রাসা শিক্ষা','বিদেশে উচ্চশিক্ষা','শিক্ষক নিয়োগ ও প্রশিক্ষণ'];
const NC=['সরকারি','নাগরিক সেবা','বিশ্ববিদ্যালয়','জাতীয় বিশ্ববিদ্যালয়','শিক্ষা বোর্ড','বৃত্তি','ভর্তি','পরীক্ষা','স্কুল ও কলেজ','কারিগরি ও মাদ্রাসা','বিদেশে উচ্চশিক্ষা','শিক্ষক নিয়োগ','চাকরি','স্থানীয়'];
const SC=['জাতীয় পরিচয়পত্র (NID)','জন্ম নিবন্ধন','পাসপোর্ট','ভূমি সেবা','সরকারি আবেদন','অন্যান্য নাগরিক সেবা'];
const KC={service:SC,education:EC,notice:NC},KN={service:'নাগরিক সেবা',education:'শিক্ষা',notice:'নোটিশ'};
const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const LS={g:(k,f)=>{try{return JSON.parse(localStorage.getItem('ss_'+k))??f}catch{return f}},s:(k,v)=>{try{localStorage.setItem('ss_'+k,JSON.stringify(v))}catch{alert('ব্রাউজারে জায়গা শেষ — ডেমো মোডে ছোট ফাইল দিন')}}};
let ROWS=[],BM=LS.g('bm',[]),ADMIN=false;
const url=u=>/^https?:\/\//i.test(u||'')?u:'';
const db={async load(){if(LIVE){const{data,error}=await sb.from('content').select('*').order('created_at',{ascending:false});if(error)throw error;return data}
 let d=LS.g('rows',null);if(!d){try{d=await (await fetch('data/seed.json')).json();d=d.map((r,i)=>({...r,id:'d'+i}));LS.s('rows',d)}catch{d=[]}}return d},
 async save(r){if(LIVE){const{error}=r.id?await sb.from('content').update(r).eq('id',r.id):await sb.from('content').insert(r);if(error)throw error}
 else{let d=LS.g('rows',[]);if(r.id)d=d.map(x=>x.id===r.id?{...x,...r}:x);else d.unshift({...r,id:'d'+Date.now()});LS.s('rows',d)}},
 async del(id){if(LIVE){const{error}=await sb.from('content').delete().eq('id',id);if(error)throw error}else LS.s('rows',LS.g('rows',[]).filter(x=>x.id!==id))},
 async up(f,folder){if(!f)return null;if(LIVE){const p=folder+'/'+Date.now()+'-'+f.name.replace(/[^\w.-]/g,'_');const{error}=await sb.storage.from('uploads').upload(p,f);if(error)throw error;return sb.storage.from('uploads').getPublicUrl(p).data.publicUrl}
 if(f.size>1.5e6)throw new Error('ডেমোতে ১.৫MB-র বেশি নয়');return new Promise(r=>{const fr=new FileReader();fr.onload=()=>r(fr.result);fr.readAsDataURL(f)})}};
const vb=v=>v==='verified'?'<span class="badge v">যাচাইকৃত</span>':v==='rejected'?'<span class="badge u">বাতিল</span>':'<span class="badge p">যাচাই বাকি</span>';
const pub=l=>l.filter(r=>r.is_published&&!r.is_archived);
const star=id=>`<button class="btn o" data-bm="${id}">${BM.includes(id)?'★ সংরক্ষিত':'☆ সংরক্ষণ'}</button>`;
const card=r=>`<article class="card">${r.image_url?`<img class="th" src="${esc(r.image_url)}" alt="${esc(r.title)}" loading="lazy">`:''}<span class="badge">${esc(r.category)}</span>${r.is_urgent?'<span class="badge u">জরুরি</span>':''}${vb(r.status)}
<h3>${esc(r.title)}</h3><p class="mut">${esc([r.authority||r.source_name,r.pub_date&&'প্রকাশ: '+r.pub_date,r.deadline&&'শেষ: '+r.deadline].filter(Boolean).join(' · '))}</p><p>${esc((r.summary||'').slice(0,130))}</p>
<button class="btn" data-open="${r.id}">বিস্তারিত</button>${star(r.id)}</article>`;
const grid=l=>l.length?`<div class="grid">${l.map(card).join('')}</div>`:'<div class="card">এখনো কিছু নেই।</div>';
function nav(){const r=[['','হোম'],['services','নাগরিক সেবা'],['education','শিক্ষা'],['notices','নোটিশ বোর্ড'],['saved','সংরক্ষিত'],['page/about','আমাদের সম্পর্কে'],['page/contact','যোগাযোগ']];
const h=(location.hash||'#/').slice(2);$('#nav').innerHTML=r.map(([k,t])=>`<a href="#/${k}" class="${h===k?'on':''}">${t}</a>`).join('')}
const search=(v='')=>`<input id="q" list="sg" placeholder="খুঁজুন: NID, ভর্তি, বৃত্তি…" value="${esc(v)}" aria-label="অনুসন্ধান"><datalist id="sg"><option value="NID"><option value="ভর্তি"><option value="বৃত্তি"><option value="পাসপোর্ট"></datalist>`;
const V={
home(){const p=pub(ROWS);return `<section class="hero"><h1>সব প্রয়োজনীয় তথ্য, এক ঠিকানায়</h1><p>নাগরিক সেবা, শিক্ষা ও নোটিশ — সহজ ভাষায়।</p>${search()}<div class="row" style="justify-content:center"><a class="btn g" href="#/services">নাগরিক সেবা</a><a class="btn" href="#/education">শিক্ষা</a><a class="btn o" style="background:#fff" href="#/notices">নোটিশ বোর্ড</a></div></section>
${LIVE?'':'<div class="warn">⚠️ ডেমো মোড: Supabase কনফিগার করা হয়নি; ডেটা শুধু এই ব্রাউজারে থাকে।</div>'}
<h2>জরুরি নোটিশ</h2>${grid(p.filter(r=>r.kind==='notice'&&r.is_urgent).slice(0,3))}<h2>নাগরিক সেবা</h2>${grid(p.filter(r=>r.kind==='service').slice(0,6))}<h2>শিক্ষা</h2>${grid(p.filter(r=>r.kind==='education').slice(0,6))}<h2>সর্বশেষ নোটিশ</h2>${grid(p.filter(r=>r.kind==='notice').slice(0,6))}`},
services(){return `<h2>নাগরিক সেবা</h2>${grid(pub(ROWS).filter(r=>r.kind==='service'))}`},
education(c){c=decodeURIComponent(c||'');if(!c)return `<h2>শিক্ষা ড্যাশবোর্ড</h2><div class="grid">${EC.map(x=>`<a class="card" style="text-decoration:none;color:inherit" href="#/education/${encodeURIComponent(x)}"><h3>${esc(x)}</h3><span class="mut">${pub(ROWS).filter(r=>r.kind==='education'&&r.category===x).length} টি</span></a>`).join('')}</div>`;
return `<h2>${esc(c)}</h2><a href="#/education">← সব ক্যাটাগরি</a>${grid(pub(ROWS).filter(r=>r.kind==='education'&&r.category===c))}`},
notices(){return `<h2>নোটিশ বোর্ড</h2><div class="row">${search()}<select id="fc"><option value="">সব ক্যাটাগরি</option>${NC.map(c=>`<option>${c}</option>`).join('')}</select><select id="fv"><option value="">যাচাই: সব</option><option value="verified">যাচাইকৃত</option><option value="pending">যাচাই বাকি</option></select><select id="fs"><option value="d">সর্বশেষ আগে</option><option value="u">জরুরি আগে</option><option value="dl">ডেডলাইন আগে</option></select></div><div id="res"></div>`},
saved(){return `<h2>সংরক্ষিত</h2>${grid(pub(ROWS).filter(r=>BM.includes(r.id)))}<p class="mut">সংরক্ষণ শুধু এই ব্রাউজারে থাকে, অন্য ডিভাইসে সিঙ্ক হয় না।</p>`},
search(q){q=decodeURIComponent(q||'').toLowerCase();return `<h2>অনুসন্ধান: ${esc(q)}</h2>${grid(pub(ROWS).filter(r=>[r.title,r.summary,r.category,r.title_en].join(' ').toLowerCase().includes(q)))}`},
page(p){if(p==='contact')return `<h2>যোগাযোগ / মতামত</h2><form id="cf" class="card"><label>নাম<input name="name" required></label><label>ইমেইল<input type="email" name="email" required></label><label>বার্তা<textarea name="body" required maxlength="4000"></textarea></label><button class="btn">পাঠান</button></form>`;
const P={about:['আমাদের সম্পর্কে','সহজসেবা বাংলাদেশের নাগরিক সেবা ও শিক্ষা তথ্যের একটি স্বাধীন নির্দেশিকা। আমরা সরকারি কর্তৃপক্ষ নই; আবেদন ও চূড়ান্ত তথ্য অফিসিয়াল উৎসে যাচাই করুন।'],privacy:['গোপনীয়তা নীতি','আমরা সংবেদনশীল পরিচয়তথ্য চাই না। যোগাযোগ ফর্মের তথ্য শুধু উত্তর দিতে ব্যবহৃত হয়।'],terms:['শর্তাবলি ও দাবিত্যাগ','তথ্য শুধু সহায়িকা। ফি, সময়সীমা ও যোগ্যতা অফিসিয়াল সূত্র থেকে মিলিয়ে নিন।']}[p];return P?`<h2>${P[0]}</h2><div class="card">${P[1]}</div>`:'<h2>৪০৪</h2><div class="card">পাতা পাওয়া যায়নি।</div>'},
admin(){return ADMIN?adminView():`<h2>অ্যাডমিন লগইন</h2>${LIVE?'':'<div class="warn">⚠️ ডেমো মোড — এটি আসল নিরাপত্তা নয়। Supabase কনফিগার করলে আসল লগইন চালু হবে।</div>'}<form id="lf" class="card" style="max-width:400px"><label>ইমেইল<input type="email" name="email" ${LIVE?'required':''}></label><label>পাসওয়ার্ড<input type="password" name="pw" ${LIVE?'required':''} autocomplete="current-password"></label><button class="btn">${LIVE?'লগইন':'ডেমো প্রবেশ'}</button></form>`}};
let EDIT=null,FK='';
function adminView(){const l=ROWS.filter(r=>!FK||r.kind===FK),e=EDIT||{kind:'notice',status:'pending',is_published:false};
const o=(a,v)=>a.map(x=>`<option ${x===v?'selected':''}>${esc(x)}</option>`).join('');
return `<h2>অ্যাডমিন ড্যাশবোর্ড</h2><div class="row"><div class="card">মোট: ${ROWS.length}</div><div class="card">প্রকাশিত: ${ROWS.filter(r=>r.is_published).length}</div><div class="card">যাচাই বাকি: ${ROWS.filter(r=>r.status==='pending').length}</div><button class="btn r" id="lo">লগআউট</button></div>
<form id="ef" class="card"><h3>${e.id?'সম্পাদনা':'নতুন কনটেন্ট'}</h3><div class="row"><div><label>ধরন</label><select name="kind" id="kk">${Object.entries(KN).map(([k,v])=>`<option value="${k}" ${k===e.kind?'selected':''}>${v}</option>`).join('')}</select></div><div><label>ক্যাটাগরি</label><select name="category" id="kc">${o(KC[e.kind],e.category)}</select></div><div><label>যাচাই অবস্থা</label><select name="status">${['verified','pending','rejected'].map(s=>`<option ${s===e.status?'selected':''}>${s}</option>`).join('')}</select></div></div>
<label>শিরোনাম *<input name="title" required value="${esc(e.title)}"></label><label>শিরোনাম (English)<input name="title_en" value="${esc(e.title_en)}"></label><label>সারসংক্ষেপ<textarea name="summary" rows="3">${esc(e.summary)}</textarea></label>
<label>যোগ্যতা<textarea name="eligibility" rows="2">${esc(e.eligibility)}</textarea></label><label>প্রয়োজনীয় কাগজপত্র<textarea name="documents" rows="2">${esc(e.documents)}</textarea></label><label>আবেদনের ধাপ (প্রতি লাইনে একটি)<textarea name="steps" rows="3">${esc(e.steps)}</textarea></label>
<div class="row"><div><label>কর্তৃপক্ষ<input name="authority" value="${esc(e.authority)}"></label></div><div><label>সোর্সের নাম<input name="source_name" value="${esc(e.source_name)}"></label></div><div><label>অফিসিয়াল URL<input type="url" name="official_url" value="${esc(e.official_url)}"></label></div></div>
<div class="row"><div><label>প্রকাশের তারিখ<input type="date" name="pub_date" value="${e.pub_date||''}"></label></div><div><label>শেষ তারিখ<input type="date" name="deadline" value="${e.deadline||''}"></label></div><div><label>শেষ যাচাই<input type="date" name="last_verified" value="${e.last_verified||''}"></label></div></div>
<div class="row"><div><label>ফি (শুধু যাচাইকৃত হলে)<input name="fee" value="${esc(e.fee)}"></label></div><div><label>সময় (শুধু যাচাইকৃত হলে)<input name="processing_time" value="${esc(e.processing_time)}"></label></div></div>
<label>অতিরিক্ত লিংক (প্রতি লাইনে: নাম | URL)<textarea name="links" rows="3">${esc((e.links||[]).map(x=>x.label+' | '+x.url).join('\n'))}</textarea></label>
<div class="row"><div><label>ছবি ${e.image_url?'(আছে — নতুন দিলে বদলাবে)':''}<input type="file" name="img" accept="image/*"></label></div><div><label>PDF ${e.pdf_url?'(আছে)':''}<input type="file" name="pdf" accept="application/pdf"></label></div></div>
<label><input type="checkbox" name="is_urgent" style="width:auto" ${e.is_urgent?'checked':''}> জরুরি</label><label><input type="checkbox" name="is_published" style="width:auto" ${e.is_published?'checked':''}> প্রকাশিত</label><label><input type="checkbox" name="is_archived" style="width:auto" ${e.is_archived?'checked':''}> আর্কাইভ</label>
<button class="btn g">সংরক্ষণ</button>${e.id?'<button type="button" class="btn o" id="nw">নতুন ফর্ম</button>':''}</form>
<h2>সব কনটেন্ট</h2><div class="row"><select id="fk"><option value="">সব ধরন</option>${Object.entries(KN).map(([k,v])=>`<option value="${k}" ${k===FK?'selected':''}>${v}</option>`).join('')}</select></div>
<div class="card"><table>${l.map(r=>`<tr><td>${esc(r.title)}<br><span class="mut">${KN[r.kind]} · ${esc(r.category)} · ${r.is_published?'প্রকাশিত':'খসড়া'} · ${r.status}</span></td><td><button class="btn o" data-ed="${r.id}">এডিট</button><button class="btn r" data-rm="${r.id}">মুছুন</button></td></tr>`).join('')}</table></div>`}
function filt(){const q=($('#q').value||'').toLowerCase(),c=$('#fc').value,v=$('#fv').value,s=$('#fs').value;
const l=pub(ROWS).filter(r=>r.kind==='notice'&&(!c||r.category===c)&&(!v||r.status===v)&&((r.title||'')+(r.summary||'')).toLowerCase().includes(q));
l.sort((a,b)=>s==='u'?(b.is_urgent-a.is_urgent):s==='dl'?((a.deadline||'9')<(b.deadline||'9')?-1:1):((b.pub_date||'')>(a.pub_date||'')?1:-1));$('#res').innerHTML=grid(l)}
function route(){const[,r,p]=(location.hash||'#/').split('/');let h;
try{h=(r===''||!r)?V.home():V[r]?V[r](p):V.page('404')}catch(e){h='<div class="card">ত্রুটি: '+esc(e.message)+'</div>'}
$('#app').innerHTML=h;if(r==='notices')filt();nav();scrollTo(0,0)}
function openD(id){const r=ROWS.find(x=>x.id==id);if(!r)return;const L=(r.links||[]).filter(x=>url(x.url));
$('#mb').innerHTML=(r.image_url?`<img src="${esc(r.image_url)}" alt="${esc(r.title)}">`:'')+`<h2>${esc(r.title)}</h2>${vb(r.status)}<span class="badge">${esc(r.category)}</span>${r.is_urgent?'<span class="badge u">জরুরি</span>':''}<p>${esc(r.summary)}</p>`+
[['যোগ্যতা',r.eligibility],['প্রয়োজনীয় কাগজপত্র',r.documents],['কর্তৃপক্ষ',r.authority],['প্রকাশ',r.pub_date],['শেষ তারিখ',r.deadline],['ফি',r.fee],['সময়',r.processing_time],['শেষ যাচাই',r.last_verified]].filter(x=>x[1]).map(x=>`<p><b>${x[0]}:</b> ${esc(x[1])}</p>`).join('')+
(r.steps?`<ol>${r.steps.split('\n').filter(Boolean).map(s=>`<li>${esc(s)}</li>`).join('')}</ol>`:'')+
(url(r.official_url)?`<a class="btn g" href="${esc(r.official_url)}" target="_blank" rel="noopener noreferrer">অফিসিয়াল লিংক ↗</a>`:'')+(r.pdf_url?`<a class="btn" href="${esc(r.pdf_url)}" target="_blank" rel="noopener" download>PDF ↓</a>`:'')+
(L.length?`<p class="lk">${L.map(x=>`<a href="${esc(x.url)}" target="_blank" rel="noopener noreferrer">${esc(x.label)} ↗</a>`).join('')}</p>`:'')+`<p class="mut">সোর্স: ${esc(r.source_name||'—')}। চূড়ান্ত তথ্য অফিসিয়াল ওয়েবসাইটে যাচাই করুন।</p>${star(r.id)}<button class="btn o" id="cl">বন্ধ</button>`;$('#modal').classList.add('on')}
document.addEventListener('click',async e=>{const t=e.target,d=t.dataset;
if(t.id==='cl'||t.id==='modal')$('#modal').classList.remove('on');if(d.open)openD(d.open);
if(d.bm){BM=BM.includes(d.bm)?BM.filter(x=>x!==d.bm):[...BM,d.bm];LS.s('bm',BM);t.textContent=BM.includes(d.bm)?'★ সংরক্ষিত':'☆ সংরক্ষণ';if(location.hash==='#/saved')route()}
if(d.ed){EDIT=ROWS.find(r=>r.id==d.ed);route();scrollTo(0,0)}if(t.id==='nw'){EDIT=null;route()}
if(d.rm&&confirm('নিশ্চিত মুছবেন?')){try{await db.del(d.rm);ROWS=await db.load();route()}catch(x){alert(x.message)}}
if(t.id==='lo'){if(LIVE)await sb.auth.signOut();ADMIN=false;route()}
if(t.id==='menu')$('#nav').classList.toggle('open');if(t.id==='lang')alert('English সংস্করণ শীঘ্রই আসছে (title_en ফিল্ড প্রস্তুত)।')});
document.addEventListener('change',e=>{const t=e.target;if(t.id==='kk'){$('#kc').innerHTML=KC[t.value].map(c=>`<option>${esc(c)}</option>`).join('')}if(t.id==='fk'){FK=t.value;route()}if(['fc','fv','fs'].includes(t.id))filt()});
document.addEventListener('input',e=>{if(e.target.id==='q'&&$('#res'))filt()});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.id==='q'&&!$('#res')){e.preventDefault();location.hash='#/search/'+encodeURIComponent(e.target.value)}if(e.key==='Escape')$('#modal').classList.remove('on')});
document.addEventListener('submit',async e=>{e.preventDefault();const id=e.target.id,f=new FormData(e.target);
try{if(id==='lf'){if(LIVE){const{data,error}=await sb.auth.signInWithPassword({email:f.get('email'),password:f.get('pw')});if(error)throw error;const{data:a}=await sb.from('admins').select('user_id').eq('user_id',data.user.id).maybeSingle();if(!a){await sb.auth.signOut();throw new Error('এই অ্যাকাউন্ট অ্যাডমিন নয়')}}ADMIN=true;ROWS=await db.load();route()}
if(id==='cf'){const m={name:f.get('name'),email:f.get('email'),body:f.get('body')};if(LIVE){const{error}=await sb.from('messages').insert(m);if(error)throw error}else LS.s('msgs',[...LS.g('msgs',[]),m]);e.target.reset();alert('ধন্যবাদ!')}
if(id==='ef'){const r={};['kind','category','status','title','title_en','summary','eligibility','documents','steps','authority','source_name','official_url','pub_date','deadline','last_verified','fee','processing_time'].forEach(k=>r[k]=f.get(k)||null);r.title=f.get('title');
['is_urgent','is_published','is_archived'].forEach(k=>r[k]=f.get(k)==='on');
r.links=(f.get('links')||'').split('\n').map(s=>s.split('|').map(x=>x.trim())).filter(a=>a[1]).map(a=>({label:a[0],url:a[1]}));
const i=await db.up(f.get('img'),'images'),p=await db.up(f.get('pdf'),'pdf');if(i)r.image_url=i;if(p)r.pdf_url=p;if(EDIT)r.id=EDIT.id;
if(r.status==='verified'&&!r.last_verified)r.last_verified=new Date().toISOString().slice(0,10);await db.save(r);EDIT=null;ROWS=await db.load();route();alert('সংরক্ষিত হয়েছে')}}
catch(x){alert('ত্রুটি: '+(x.message||x))}});
addEventListener('hashchange',route);
(async()=>{try{if(LIVE){const{data}=await sb.auth.getSession();if(data.session){const{data:a}=await sb.from('admins').select('user_id').eq('user_id',data.session.user.id).maybeSingle();ADMIN=!!a}}ROWS=await db.load()}catch(x){$('#app').innerHTML='<div class="card">ডেটা লোড হয়নি: '+esc(x.message)+'</div>';return}route()})();

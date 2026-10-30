// لسان v3 - طبقة الواجهة (تُحمَّل بعد index.html)
const BOP_ACCOUNT='ضع هنا رقم حسابك / IBAN في بنك فلسطين';
const PLANS=[{id:'week',n:'أسبوع',p:3},{id:'month',n:'شهر',p:20},{id:'year',n:'سنة',p:99}];
const BADGES={first:['🌱','أول مرحلة'],streak3:['🔥','3 أيام'],streak7:['🏅','أسبوع'],streak30:['👑','30 يوم'],xp500:['⭐','500 نقطة'],xp2000:['💎','2000 نقطة']};
const css=document.createElement('style');
css.textContent=`body{background:linear-gradient(160deg,#052a35,#0F4C5C 50%,#2a2d7c) fixed;color:#fff}
.glass{background:rgba(255,255,255,.12);-webkit-backdrop-filter:blur(18px);backdrop-filter:blur(18px);border:1px solid rgba(255,255,255,.28);border-radius:24px;padding:18px;box-shadow:0 8px 32px rgba(0,0,0,.25);margin-bottom:12px}
input{color:#14232B}label{display:block;margin:8px 0 4px;font-weight:700}
.bar span{background:rgba(255,255,255,.14);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);color:#fff}
.lang{background:rgba(255,255,255,.12);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.28);color:#fff}
.lang.on{border-color:var(--gold);background:rgba(242,165,65,.25)}
.unit{background:linear-gradient(90deg,#F2A541,#E4572E);color:#14232B}
.opt,.chip{background:rgba(255,255,255,.14);color:#fff;border-color:rgba(255,255,255,.3)}
.opt.sel{background:rgba(242,165,65,.35);border-color:var(--gold)}
.prog{background:rgba(255,255,255,.2)}.lvl{background:rgba(255,255,255,.12);color:#fff;border-color:rgba(255,255,255,.4)}
button.alt{color:#fff;border-color:rgba(255,255,255,.6);display:block}
button.gold{background:var(--gold);color:#14232B;border-bottom-color:#c2811f}
h1{color:#fff}.sub{color:#fff}
.rgb{background:linear-gradient(90deg,#ff3b3b,#ffd23b,#3bff6a,#3bb8ff,#c13bff,#ff3b3b);background-size:300% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:rgbm 4s linear infinite}
@keyframes rgbm{to{background-position:300% 0}}
.av{width:96px;height:96px;border-radius:50%;object-fit:cover;border:4px solid var(--tc,#F2A541);background:#fff3}
.ban{height:120px;border-radius:18px;background:var(--tc,#0F4C5C) center/cover}
.bds{display:flex;flex-wrap:wrap;gap:10px}.bd{width:30%;text-align:center;font-size:30px}.bd small{display:block;font-size:11px}.bd.off{opacity:.25;filter:grayscale(1)}`;
document.head.appendChild(css);

const isPrem=()=>S.sub&&new Date(S.sub.premium_until)>new Date();
const $=id=>document.getElementById(id);

function topbar(back){
  const p=S.p,l=S.lang,m=Math.min(100,Math.round((S.todaySec||0)/((p.daily_goal||5)*60)*100));
  return `<div class="bar"><span onclick="settingsView()" style="cursor:pointer">⚙️</span>${back&&l?`<span onclick="langView()" style="cursor:pointer">${l.flag} ▾</span>`:''}<span>🔥 ${p.goal_streak||0}</span><span>❤️ ${p.hearts}</span><span>⭐ ${p.xp}</span><span onclick="profileView()" style="cursor:pointer">👤</span></div><div class="prog" style="margin:-8px 0 14px"><i style="width:${m}%"></i></div>`;
}

async function boot(){
  const{data:{session}}=await sb.auth.getSession();
  if(!session)return authView();
  S.user=session.user;await loadProfile();
  const[ln,sub,da]=await Promise.all([sb.from('languages').select('*').order('sort_order'),sb.from('subscriptions').select('*').eq('user_id',S.user.id).maybeSingle(),sb.from('daily_activity').select('*').eq('user_id',S.user.id).eq('day',today()).maybeSingle()]);
  S.langs=ln.data||[];S.sub=sub.data;S.todaySec=da.data?da.data.seconds:0;
  S.lang=S.langs.find(l=>l.id===localStorage.getItem('lisan_lang'))||null;
  S.lang?mapView():langView();
}

function authView(msg=''){
  app.innerHTML=`<div style="padding-top:8vh;text-align:center"><div style="font-size:64px">🌍</div><h1>لسان</h1><p class="sub">سبع لغات، خطوة بخطوة</p>
  <div class="glass" style="text-align:right">${msg?toast(msg):''}<input id="em" type="email" placeholder="البريد الإلكتروني" autocomplete="email"><input id="pw" type="password" placeholder="كلمة المرور (6 أحرف على الأقل)" autocomplete="current-password"><button id="in">تسجيل الدخول</button><button id="up" class="alt">إنشاء حساب جديد</button></div></div>`;
  const v=()=>[$('em').value.trim(),$('pw').value];
  $('in').onclick=async()=>{const[e,p]=v();const{error}=await sb.auth.signInWithPassword({email:e,password:p});error?authView('تعذّر الدخول: تأكد من البريد وكلمة المرور'):boot()};
  $('up').onclick=async()=>{const[e,p]=v();const{data,error}=await sb.auth.signUp({email:e,password:p});if(error)return authView('تعذّر إنشاء الحساب: '+error.message);data.session?boot():authView('تم إنشاء الحساب. فعّل بريدك ثم سجّل الدخول.')};
}

function langView(){
  app.innerHTML=topbar(false)+`<h2 style="text-align:center">اختر لغتك المفضلة</h2><div class="glass">`+S.langs.map(l=>`<div class="lang" data-id="${l.id}"><b>${l.flag}</b><div>${esc(l.name_ar)}<div class="ltr" style="font-weight:400;opacity:.7">${esc(l.name_native)}</div></div></div>`).join('')+`</div>`;
  app.querySelectorAll('.lang').forEach(el=>el.onclick=async()=>{
    S.lang=S.langs.find(l=>l.id===el.dataset.id);localStorage.setItem('lisan_lang',S.lang.id);
    await sb.from('user_courses').upsert({user_id:S.user.id,language_id:S.lang.id});mapView();
  });
}

function goalView(){
  app.innerHTML=`<h2 style="text-align:center;margin-top:30px">كم دقيقة تدرس كل يوم؟</h2><div class="glass">`+[[5,'خفيف'],[15,'متوسط'],[30,'جاد']].map(([m,t])=>`<button class="gold" data-m="${m}" style="margin-bottom:10px">${m} دقائق · ${t}</button>`).join('')+`</div>`;
  app.querySelectorAll('[data-m]').forEach(b=>b.onclick=async()=>{const m=+b.dataset.m;await sb.from('profiles').update({daily_goal:m}).eq('id',S.user.id);S.p.daily_goal=m;mapView()});
}

async function award(code,msg){const{error}=await sb.from('user_badges').insert({user_id:S.user.id,code});if(!error&&msg)app.insertAdjacentHTML('afterbegin',toast(msg))}

async function addTime(sec){
  const t=today(),goal=(S.p.daily_goal||5)*60;
  const{data:r}=await sb.from('daily_activity').select('*').eq('user_id',S.user.id).eq('day',t).maybeSingle();
  const total=(r?r.seconds:0)+sec,met=r&&r.goal_met,now=met||total>=goal;
  await sb.from('daily_activity').upsert({user_id:S.user.id,day:t,seconds:total,goal_met:now});
  S.todaySec=total;
  if(now&&!met){
    const y=new Date(Date.now()-864e5).toISOString().slice(0,10),gs=S.p.last_goal_day===y?(S.p.goal_streak||0)+1:1;
    S.p.goal_streak=gs;S.p.last_goal_day=t;
    await sb.from('profiles').update({goal_streak:gs,last_goal_day:t}).eq('id',S.user.id);
    await award('day:'+t,'🎯 أنجزت هدف اليوم! شارة جديدة');
    if(gs>=3)await award('streak3','🔥 3 أيام متتالية');
    if(gs>=7)await award('streak7','🏅 أسبوع كامل');
    if(gs>=30)await award('streak30','👑 30 يوم متواصل');
  }
}
async function flush(){if(!S.t0)return;const s=Math.min(1800,Math.round((Date.now()-S.t0)/1000));S.t0=0;await addTime(s)}

const _map=mapView;mapView=async function(){await flush();if(!S.p.daily_goal)return goalView();return _map()};
const _sl=startLesson;startLesson=async function(...a){S.t0=Date.now();return _sl(...a)};
const _end=endView;endView=async function(w){const t0=S.t0;await _end(w);S.t0=t0;await flush();if(w){await award('first','🌱 أول مرحلة');if(S.p.xp>=500)await award('xp500','⭐ 500 نقطة');if(S.p.xp>=2000)await award('xp2000','💎 2000 نقطة')}};

function settingsView(){
  app.innerHTML=topbar(false)+`<h2>الإعدادات</h2><div class="glass"><button class="alt" onclick="goalView()">⏱️ الهدف اليومي (${S.p.daily_goal||'-'} د)</button><button class="alt" onclick="langView()" style="margin-top:10px">🌍 تغيير اللغة</button><button class="alt" onclick="profileView()" style="margin-top:10px">👤 ملفي الشخصي</button><button class="alt" onclick="pricingView()" style="margin-top:10px">⭐ الاشتراك المميز</button><button class="alt" id="lo" style="margin-top:10px">تسجيل الخروج</button></div><button onclick="${S.lang?'mapView()':'langView()'}">رجوع</button>`;
  $('lo').onclick=async()=>{await sb.auth.signOut();localStorage.removeItem('lisan_lang');S.p=null;authView()};
}

async function upl(f,name){
  const ext=(f.name.split('.').pop()||'png').toLowerCase();
  if(ext==='gif'&&!isPrem())throw new Error('صور GIF للمشتركين فقط');
  if(f.size>(isPrem()?5e6:1e6))throw new Error('حجم الصورة كبير (الحد 1MB مجاناً، 5MB للمشتركين)');
  const path=`${S.user.id}/${name}.${ext}`;
  const{error}=await sb.storage.from('avatars').upload(path,f,{upsert:true,contentType:f.type});
  if(error)throw error;
  return sb.storage.from('avatars').getPublicUrl(path).data.publicUrl+'?v='+Date.now();
}

async function profileView(msg=''){
  const{data:bs}=await sb.from('user_badges').select('code').eq('user_id',S.user.id);
  const codes=(bs||[]).map(b=>b.code),days=codes.filter(c=>c.startsWith('day:')).length,pr=isPrem(),p=S.p,tc=p.theme_color||'#0F4C5C',lock=pr?'':'🔒 ';
  app.innerHTML=topbar(false)+(msg?toast(msg):'')+`<div class="glass" style="--tc:${esc(tc)};text-align:center"><div class="ban" style="${pr&&p.banner_url?`background-image:url('${esc(p.banner_url)}')`:''}"></div>
  <img class="av" style="margin-top:-48px" src="${esc(p.avatar_url||'icon-192.png')}" alt="">
  <h2 class="${pr&&p.name_rgb?'rgb':''}" style="margin:8px 0 0">${esc(p.display_name||'مستخدم')} ${pr?'⭐':''}</h2><p style="opacity:.85;margin:4px 0">${esc(p.bio||'')}</p>
  <div class="bar" style="justify-content:center;margin:10px 0 0"><span>⭐ ${p.xp}</span><span>🔥 ${p.goal_streak||0} يوم</span><span>🎯 ${days} هدف</span></div></div>
  <h2>الشارات</h2><div class="glass"><div class="bds">${Object.entries(BADGES).map(([c,[i,t]])=>`<div class="bd ${codes.includes(c)?'':'off'}">${i}<small>${t}</small></div>`).join('')}</div></div>
  <h2>تعديل الملف</h2><div class="glass"><input id="dn" placeholder="الاسم" maxlength="30" value="${esc(p.display_name||'')}"><input id="bio" placeholder="نبذة عنك" maxlength="160" value="${esc(p.bio||'')}">
  <label>صورة شخصية (PNG/JPG حتى 1MB · GIF للمشتركين)</label><input id="fa" type="file" accept="image/*">
  <label>${lock}بانر</label><input id="fb" type="file" accept="image/*">
  <label>${lock}لون الملف</label><input id="tc" type="color" value="${esc(tc)}" style="padding:4px;height:48px">
  <label style="display:flex;align-items:center"><input id="rg" type="checkbox" ${p.name_rgb?'checked':''} style="width:auto;margin:0 0 0 8px">${lock}اسم RGB متحرك</label>
  <button id="sv" style="margin-top:10px">حفظ</button>${pr?'':'<button class="gold" onclick="pricingView()" style="margin-top:10px">⭐ اشترك لفتح المميزات</button>'}</div><button class="alt" onclick="${S.lang?'mapView()':'langView()'}">رجوع</button>`;
  $('sv').onclick=async()=>{
    const up={display_name:$('dn').value.trim()||null,bio:$('bio').value.trim()||null},tcv=$('tc').value,rg=$('rg').checked,fb=$('fb').files[0],fa=$('fa').files[0];
    if(!pr&&(fb||tcv!==tc||rg!==!!p.name_rgb))return profileView('هذي المميزات للمشتركين فقط ⭐');
    try{
      if(fa)up.avatar_url=await upl(fa,'avatar');
      if(pr){if(fb)up.banner_url=await upl(fb,'banner');up.theme_color=tcv;up.name_rgb=rg}
      const{error}=await sb.from('profiles').update(up).eq('id',S.user.id);if(error)throw error;
      Object.assign(S.p,up);profileView('تم الحفظ ✓');
    }catch(e){profileView('تعذّر الحفظ: '+(e.message||e))}
  };
}

function pricingView(msg=''){
  let sel='month';
  app.innerHTML=topbar(false)+(msg?toast(msg):'')+`<h2>الاشتراك المميز ⭐</h2><div class="glass"><p class="sub" style="margin-top:0">يفتح: صور GIF، البانر، ألوان الملف، اسم RGB متحرك، وشارة المشترك.</p>${PLANS.map(x=>`<div class="lang plan ${x.id===sel?'on':''}" data-id="${x.id}"><b>$${x.p}</b><div>${x.n}</div></div>`).join('')}
  <div style="text-align:center;margin:10px 0"><img src="bop-logo.png" alt="" style="height:46px" onerror="this.style.display='none'"><div style="font-weight:800">بنك فلسطين · Bank of Palestine</div><p class="sub" style="margin:4px 0">${esc(BOP_ACCOUNT)}</p></div>
  <input id="rf" placeholder="رقم الحوالة / المرجع بعد الدفع"><button id="pay">إرسال طلب التفعيل</button></div><button class="alt" onclick="profileView()">رجوع</button>`;
  app.querySelectorAll('.plan').forEach(el=>el.onclick=()=>{sel=el.dataset.id;app.querySelectorAll('.plan').forEach(x=>x.classList.toggle('on',x===el))});
  $('pay').onclick=async()=>{
    const ref=$('rf').value.trim();if(!ref)return pricingView('اكتب رقم الحوالة أولاً');
    const pl=PLANS.find(x=>x.id===sel);
    const{error}=await sb.from('payment_requests').insert({user_id:S.user.id,plan:sel,amount:pl.p,reference:ref});
    pricingView(error?'تعذّر الإرسال':'وصلنا طلبك. بنفعّل اشتراكك بعد التحقق من الحوالة ✓');
  };
}

boot();

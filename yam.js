/* Яндекс Музыка: неофициальный клиент для Android (Capacitor). Порт main.js из десктопной версии. */
(function(){
const API="https://api.music.yandex.net";
let token=localStorage.getItem("yam_token"),uid=null;
function md5(s){
  const b=new TextEncoder().encode(s),n=b.length,N=(((n+8)>>>6)+1)*16,w=new Array(N).fill(0);
  for(let i=0;i<n;i++)w[i>>2]|=b[i]<<((i%4)*8);
  w[n>>2]|=0x80<<((n%4)*8);w[N-2]=(n*8)>>>0;w[N-1]=Math.floor(n*8/4294967296);
  const S=[7,12,17,22,5,9,14,20,4,11,16,23,6,10,15,21],K=[];
  for(let i=0;i<64;i++)K[i]=Math.floor(Math.abs(Math.sin(i+1))*4294967296)|0;
  const rl=(x,c)=>(x<<c)|(x>>>(32-c));
  let a0=0x67452301,b0=0xefcdab89|0,c0=0x98badcfe|0,d0=0x10325476;
  for(let o=0;o<N;o+=16){
    let A=a0,B=b0,C=c0,D=d0;
    for(let i=0;i<64;i++){
      let F,g;
      if(i<16){F=(B&C)|(~B&D);g=i}else if(i<32){F=(D&B)|(~D&C);g=(5*i+1)%16}else if(i<48){F=B^C^D;g=(3*i+5)%16}else{F=C^(B|~D);g=(7*i)%16}
      F=(F+A+K[i]+w[o+g])|0;A=D;D=C;C=B;B=(B+rl(F,S[(i>>4)*4+(i%4)]))|0;
    }
    a0=(a0+A)|0;b0=(b0+B)|0;c0=(c0+C)|0;d0=(d0+D)|0;
  }
  return [a0,b0,c0,d0].map(x=>{let h="";for(let i=0;i<4;i++)h+=((x>>>(i*8))&255).toString(16).padStart(2,"0");return h}).join("");
}

async function api(p,opt={}){
  const r=await fetch(API+p,{...opt,headers:{Authorization:"OAuth "+token,"X-Yandex-Music-Client":"YandexMusicAndroid/24023231","User-Agent":"Yandex-Music-API","Accept-Language":"ru",...(opt.headers||{})}});
  if(!r.ok){const b=(await r.text()).slice(0,200);throw new Error("HTTP "+r.status+" "+p+" "+b)}
  return (await r.json()).result;
}
function login(){return new Promise(res=>{
  const url="https://oauth.yandex.ru/authorize?response_type=token&client_id=23cabbbdc6cd418abb4b39c32c41195d";
  const st=document.createElement("style");
  st.textContent="#lgo{position:fixed;inset:0;z-index:100;background:rgba(0,0,0,.6);backdrop-filter:blur(20px);display:flex;align-items:center;justify-content:center;padding:20px}#lgo .bx{width:100%;max-width:440px;padding:24px;border-radius:26px;background:rgba(40,40,46,.92);border:1px solid rgba(255,255,255,.18);color:#f5f5f7;font-family:inherit}#lgo h3{font-size:22px;margin-bottom:12px}#lgo p{font-size:14px;line-height:1.45;opacity:.8;margin-bottom:12px}#lgo textarea{width:100%;height:90px;border-radius:14px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.08);color:#fff;font-size:16px;padding:10px;resize:none;margin-bottom:12px;outline:0}#lgo .r{display:flex;gap:10px;flex-wrap:wrap}#lgo button{padding:11px 20px;border-radius:999px;font-size:15px;font-weight:600;border:0;color:#fff;background:rgba(255,255,255,.18)}#lgo button.pr{background:linear-gradient(135deg,#fa2d48,#ff6e5a)}#lgo small{display:block;margin-top:10px;color:#ff8a8a;min-height:16px}";
  const o=document.createElement("div");o.id="lgo";
  o.innerHTML='<div class="bx"><h3>Вход в Яндекс</h3><p>1. Нажмите «Открыть Яндекс», войдите в аккаунт и разрешите доступ.<br>2. Адрес открывшейся страницы будет содержать <b>access_token=…</b>. Скопируйте весь адрес из адресной строки (если её не видно, откройте страницу в Chrome через меню ⋮) и вставьте ниже.</p><textarea id="lgt" placeholder="Вставьте ссылку или токен"></textarea><div class="r"><button id="lgb">Открыть Яндекс</button><button class="pr" id="lgk">Готово</button><button id="lgc">Отмена</button></div><small id="lge"></small></div>';
  document.head.append(st);document.body.append(o);
  const done=v=>{o.remove();st.remove();res(v)};
  o.querySelector("#lgb").onclick=()=>{const B=window.Capacitor&&Capacitor.Plugins&&Capacitor.Plugins.Browser;if(B)B.open({url});else window.open(url,"_blank")};
  o.querySelector("#lgc").onclick=()=>done(false);
  o.querySelector("#lgk").onclick=()=>{
    const v=o.querySelector("#lgt").value.trim();
    const m=/access_token=([^&\s]+)/.exec(v)||/^([A-Za-z0-9_\-.]{20,})$/.exec(v);
    if(!m){o.querySelector("#lge").textContent="Не нашёл токен. Нужна ссылка с access_token=…";return}
    token=m[1];localStorage.setItem("yam_token",token);done(true)};
})}
const JSONH={"Content-Type":"application/json"};
const FORM={"Content-Type":"application/x-www-form-urlencoded"},bidOf=i=>String(i).split(":")[0];
const mapT=t=>({id:t.id+(t.albums&&t.albums[0]?":"+t.albums[0].id:""),title:t.title,artist:(t.artists||[]).map(a=>a.name).join(", "),artists:(t.artists||[]).map(a=>({id:a.id,name:a.name})),album:t.albums&&t.albums[0]?{id:t.albums[0].id,title:t.albums[0].title}:null,dur:(t.durationMs||0)/1000,cover:t.coverUri?"https://"+t.coverUri.replace("%%","400x400"):null});
async function byIds(ids){
  if(!ids.length)return[];
  const r=await api("/tracks",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:"track-ids="+encodeURIComponent(ids.join(","))});
  return r.map(mapT);
}
async function stream(id){
  const info=await api(`/tracks/${id.split(":")[0]}/download-info`);
  const m=info.filter(i=>i.codec==="mp3").sort((a,b)=>b.bitrateInKbps-a.bitrateInKbps)[0];
  const txt=await (await fetch(m.downloadInfoUrl,{headers:{Authorization:"OAuth "+token}})).text();
  const g=k=>{const x=new RegExp("<"+k+">([^<]*)</"+k+">").exec(txt);return x?x[1]:null};
  const host=g("host"),p=g("path"),ts=g("ts"),s=g("s");
  const sign=md5("XGRlBW9FXlekgbPrRHuSiA"+p.slice(1)+s);
  return `https://${host}/get-mp3/${sign}/${ts}${p}`;
}
const H={
  async me(){if(!token)return null;const s=await api("/account/status");uid=s.account.uid;return{name:s.account.displayName||s.account.login,plus:!!(s.plus&&s.plus.hasPlus)}},
  login:()=>login(),
  logout(){token=null;uid=null;localStorage.removeItem("yam_token");return true},
  async likes(){if(!uid)await H.me();const r=await api(`/users/${uid}/likes/tracks`);return byIds(r.library.tracks.slice(0,80).map(t=>t.id+":"+t.albumId))},
  async playlists(){if(!uid)await H.me();const r=await api(`/users/${uid}/playlists/list`);return r.map(p=>({kind:p.kind,title:p.title}))},
  async playlist(kind){if(!uid)await H.me();const r=await api(`/users/${uid}/playlists/${kind}`);return byIds((r.tracks||[]).slice(0,80).map(t=>t.id+(t.albumId?":"+t.albumId:"")))},
  async search(q){const r=await api("/search?type=track&page=0&text="+encodeURIComponent(q));return((r.tracks&&r.tracks.results)||[]).map(mapT)},
  async likedIds(){if(!uid)await H.me();const r=await api(`/users/${uid}/likes/tracks`);return r.library.tracks.map(t=>String(t.id))},
  async like({id,on}){if(!uid)await H.me();await api(`/users/${uid}/likes/tracks/${on?"add-multiple":"remove"}`,{method:"POST",headers:FORM,body:"track-ids="+encodeURIComponent(id)});return true},
  async artist(id){
    const [b,tr]=await Promise.all([api(`/artists/${id}/brief-info`).catch(()=>null),api(`/artists/${id}/tracks?page=0&page-size=60`)]);
    const ar=b&&b.artist;
    return{name:ar&&ar.name,cover:ar&&ar.cover&&ar.cover.uri?"https://"+ar.cover.uri.replace("%%","400x400"):null,tracks:(tr.tracks||[]).map(mapT)};
  },
  async addToPlaylist({kind,id}){
    if(!uid)await H.me();
    const pl=await api(`/users/${uid}/playlists/${kind}`),[tid,alb]=String(id).split(":");
    const diff=JSON.stringify([{op:"insert",at:0,tracks:[alb?{id:tid,albumId:alb}:{id:tid}]}]);
    await api(`/users/${uid}/playlists/${kind}/change`,{method:"POST",headers:FORM,body:"kind="+kind+"&revision="+pl.revision+"&diff="+encodeURIComponent(diff)});
    return true;
  },
  async createPlaylist(title){
    if(!uid)await H.me();
    const r=await api(`/users/${uid}/playlists/create`,{method:"POST",headers:FORM,body:"title="+encodeURIComponent(title)+"&visibility=private"});
    return r.kind;
  },
  async lyrics(t){
    const clean=x=>x.replace(/\s*[\(\[].*?[\)\]]/g,"").replace(/\s+-\s+.*$/,"").trim()||x;
    const artist=t.artist.split(", ")[0],title=clean(t.title),h={headers:{"User-Agent":"yamusic-launcher"}};
    const pick=j=>j&&j.syncedLyrics?{synced:true,text:j.syncedLyrics}:j&&j.plainLyrics?{synced:false,text:j.plainLyrics}:null;
    const L=async u=>{try{const r=await fetch("https://lrclib.net/api/"+u,h);return r.ok?await r.json():null}catch(e){return null}};
    let r=pick(await L("get?"+new URLSearchParams({artist_name:artist,track_name:title,duration:Math.round(t.dur)})));
    if(r)return r;
    for(const q of [{q:artist+" "+title},{track_name:title,artist_name:artist},{q:title}]){
      const l=await L("search?"+new URLSearchParams(q));
      if(Array.isArray(l)&&l.length){const j=l.find(x=>x.syncedLyrics&&Math.abs((x.duration||0)-t.dur)<8)||l.find(x=>x.syncedLyrics)||l.find(x=>x.plainLyrics);r=pick(j);if(r)return r}
    }
    try{const s=await api(`/tracks/${bidOf(t.id)}/supplement`);const f=s.lyrics&&s.lyrics.fullLyrics;if(f)return{synced:false,text:f}}catch(e){}
    return null;
  },
  async waveSet(st){await api("/rotor/station/user:onyourwave/settings2",{method:"POST",headers:JSONH,body:JSON.stringify(st)});return true},
  async wave({last}){
    const q=last?"&queue="+encodeURIComponent(last):"";
    const r=await api("/rotor/station/user:onyourwave/tracks?settings2=true"+q);
    return{batch:r.batchId,tracks:(r.sequence||[]).filter(x=>x.track).map(x=>mapT(x.track))};
  },
  async waveFb({type,id,batch,sec}){
    const body={type,timestamp:new Date().toISOString()};
    if(type==="radioStarted")body.from="radio-mobile-user-onyourwave-default";else{body.trackId=String(id);if(sec!=null)body.totalPlayedSeconds=sec}
    await api("/rotor/station/user:onyourwave/feedback?batch-id="+encodeURIComponent(batch||""),{method:"POST",headers:JSONH,body:JSON.stringify(body)});
    return true;
  },
  async album(id){const r=await api(`/albums/${id}/with-tracks`);
    return{title:r.title,artist:(r.artists||[]).map(a=>a.name).join(", "),cover:r.coverUri?"https://"+r.coverUri.replace("%%","400x400"):null,tracks:(r.volumes||[]).flat().map(mapT)}},
  async translate({lines,to}){
    const GT="https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&dt=t&tl="+encodeURIComponent(to||"ru");
    const join=j=>(j[0]||[]).map(x=>x[0]||"").join("");
    const one=async x=>{const r=await fetch(GT+"&q="+encodeURIComponent(x));if(!r.ok)throw new Error("HTTP "+r.status);return join(await r.json()).trim()};
    const out=lines.map(()=>""),idx=[];
    lines.forEach((l,i)=>{if(l&&l.trim()&&!/[а-яё]/i.test(l))idx.push(i)});
    const chunks=[];let cur=[],len=0;
    for(const i of idx){if(len+lines[i].length>1500&&cur.length){chunks.push(cur);cur=[];len=0}cur.push(i);len+=lines[i].length+1}
    if(cur.length)chunks.push(cur);
    for(const ch of chunks){
      let ok=false;
      try{
        const r=await fetch(GT,{method:"POST",headers:FORM,body:"q="+encodeURIComponent(ch.map(i=>lines[i].replace(/\s*\n\s*/g," ")).join("\n"))});
        if(r.ok){const parts=join(await r.json()).split("\n");if(parts.length===ch.length){ch.forEach((i,k)=>out[i]=parts[k].trim());ok=true}}
      }catch(e){}
      if(!ok){for(const i of ch){out[i]=await one(lines[i])}}
    }
    return out;
  },
  stream
};

window.yam=async(cmd,arg)=>{try{return{ok:true,data:await H[cmd](arg)}}catch(err){return{ok:false,error:String(err.message||err)}}};
})();

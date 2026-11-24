const C='goumai-v2';
const FILES=['./','index.html','manifest.json','icon-180.png','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(FILES)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const isPage=r.mode==='navigate'||r.url.endsWith('index.html');
  if(isPage){ // 有网先拿新版（最多等3秒），没网用缓存
    e.respondWith(new Promise(res=>{
      let done=false;const fallback=()=>caches.match(r,{ignoreSearch:true}).then(h=>h||caches.match('index.html')).then(h=>{if(!done){done=true;res(h)}});
      const timer=setTimeout(fallback,3000);
      fetch(r).then(n=>{if(n&&n.ok){const cp=n.clone();caches.open(C).then(c=>c.put('index.html',cp))}clearTimeout(timer);if(!done){done=true;res(n)}}).catch(()=>{clearTimeout(timer);fallback()});
    }));return;
  }
  e.respondWith(caches.match(r,{ignoreSearch:true}).then(h=>h||fetch(r).then(n=>{if(n&&n.ok){const cp=n.clone();caches.open(C).then(c=>c.put(r,cp))}return n})));
});

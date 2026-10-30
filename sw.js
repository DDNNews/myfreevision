const CACHE="myfreevision-v6";
const FILES=["./","index.html","manifest.webmanifest","icon-180.png","icon-192.png","icon-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES.map(f=>new Request(f,{cache:"reload"})))).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n!==CACHE).map(n=>caches.delete(n)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const req=e.request,url=new URL(req.url);
  if(req.method!=="GET"||url.origin!==location.origin)return;
  const isPage=req.mode==="navigate"||url.pathname.endsWith("/")||url.pathname.endsWith(".html");
  if(isPage){
    // Online: immer neueste Version laden, offline: gespeicherte Kopie
    e.respondWith(fetch(req,{cache:"no-store"}).then(res=>{
      if(res&&res.ok){const c=res.clone();caches.open(CACHE).then(x=>x.put("index.html",c))}
      return res}).catch(()=>caches.match("index.html")));
    return;
  }
  e.respondWith(caches.match(req,{ignoreSearch:true}).then(r=>r||fetch(req).then(res=>{
    if(res&&res.ok){const c=res.clone();caches.open(CACHE).then(x=>x.put(req,c))}
    return res})));
});

// MyFreeVision Nata: offline zuerst. Neue Versionen nur über den Update-Button in der App.
const CACHE="natavision";
const FILES=["./","index.html","manifest.webmanifest","icon-180.png","icon-192.png","icon-512.png","version.json"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>Promise.all(FILES.map(f=>
  c.match(f).then(hit=>hit||fetch((f==="./"?"index.html":f)+"?u="+Date.now(),{cache:"no-store"}).then(r=>r.ok?c.put(f,r):null).catch(()=>null))
))).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n!==CACHE&&n.indexOf("natavision")===0).map(n=>caches.delete(n)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const req=e.request,url=new URL(req.url);
  if(req.method!=="GET"||url.origin!==location.origin)return;
  if(url.searchParams.has("u"))return; // Update-Abfragen gehen direkt ans Netz
  e.respondWith(caches.open(CACHE).then(c=>c.match(req,{ignoreSearch:true}).then(hit=>{
    if(hit)return hit;
    if(req.mode==="navigate")return c.match("./").then(p=>p||fetch(req));
    return fetch(req).then(r=>{if(r&&r.ok)c.put(req,r.clone());return r});
  })));
});

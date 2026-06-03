// QuinielaFC Service Worker — v4
const CACHE = 'qfc-v4';
const ASSETS = [
  './index.html',
  'https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js'
];

self.addEventListener('install', function(e){
  e.waitUntil(caches.open(CACHE).then(function(cache){ return cache.addAll(ASSETS); }));
  self.skipWaiting();
});

self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){ return k!==CACHE; }).map(function(k){ return caches.delete(k); }));
  }));
  self.clients.claim();
});

self.addEventListener('fetch', function(e){
  if(e.request.url.includes('firestore')||e.request.url.includes('googleapis.com/google.firestore')||e.request.url.includes('espn')){
    e.respondWith(fetch(e.request).catch(function(){ return caches.match(e.request); }));
    return;
  }
  if(e.request.url.includes('gstatic.com/firebasejs')){
    e.respondWith(caches.match(e.request).then(function(cached){
      return cached || fetch(e.request).then(function(resp){
        var clone=resp.clone();
        caches.open(CACHE).then(function(cache){ cache.put(e.request,clone); });
        return resp;
      });
    }));
    return;
  }
  e.respondWith(fetch(e.request).then(function(resp){
    var clone=resp.clone();
    caches.open(CACHE).then(function(cache){ cache.put(e.request,clone); });
    return resp;
  }).catch(function(){ return caches.match(e.request); }));
});

self.addEventListener('push', function(e){
  var data=e.data?e.data.json():{title:'QuinielaFC',body:'Tienes novedades'};
  e.waitUntil(self.registration.showNotification(data.title||'QuinielaFC',{body:data.body||'',icon:'⚽',tag:'qfc-notif'}));
});

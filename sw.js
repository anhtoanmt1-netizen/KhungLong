/* Service Worker: ưu tiên mạng (chờ tối đa 4 giây), rơi về bộ nhớ đệm khi offline.
   Đổi số phiên bản CACHE mỗi khi phát hành để máy người chơi tải bản mới. */
const CACHE = 'pds-v20';
const ASSETS = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "icon-192.png",
  "icon-512.png",
  "assets1/audio/bgm.mp3",
  "assets1/audio/fire_breath.mp3",
  "assets1/boss/boss01.png",
  "assets1/boss/boss02.png",
  "assets1/boss/boss03.png",
  "assets1/boss/boss04.png",
  "assets1/boss/boss05.png",
  "assets1/boss/boss06.png",
  "assets1/boss/boss07.png",
  "assets1/boss/boss08.png",
  "assets1/boss/boss09.png",
  "assets1/boss/boss10.png",
  "assets1/boss/boss11.png",
  "assets1/boss/boss12.png",
  "assets1/dino/die.png",
  "assets1/dino/run0.png",
  "assets1/dino/run1.png",
  "assets1/dino/run2.png",
  "assets1/dino/run3.png",
  "assets1/dino/run4.png",
  "assets1/fx/chest1.png",
  "assets1/fx/chest2.png",
  "assets1/fx/chest3.png",
  "assets1/fx/chest4.png",
  "assets1/fx/chest5.png",
  "assets1/fx/chest6.png",
  "assets1/fx/chest7.png",
  "assets1/fx/fire.png",
  "assets1/world/background.jpg",
  "assets1/world/grass2.jpg",
  "assets1/world/leaf.png",
  "assets1/world/tree.png",
  "assets2/cards/art_ancient.png",
  "assets2/cards/art_boom.png",
  "assets2/cards/art_def.png",
  "assets2/cards/art_dmg.png",
  "assets2/cards/art_evo.png",
  "assets2/cards/art_gold.png",
  "assets2/cards/art_hp.png",
  "assets2/cards/art_multi.png",
  "assets2/cards/art_pierce.png",
  "assets2/cards/art_rate.png",
  "assets2/cards/art_regen.png",
  "assets2/cards/art_revive.png",
  "assets2/cards/art_steal.png",
  "assets2/cards/art_storm.png",
  "assets2/cards/art_wall.png",
  "assets2/cards/frame_blood.png",
  "assets2/cards/frame_bronze.png",
  "assets2/cards/frame_fire.png",
  "assets2/cards/frame_jade.png",
  "assets2/cards/frame_lotus.png",
  "assets2/cards/frame_shadow.png",
  "assets2/cards/frame_silver.png",
  "assets2/cards/frame_steel.png",
  "assets2/ui/btn_back.png",
  "assets2/ui/btn_blank.png",
  "assets2/ui/btn_close.png",
  "assets2/ui/btn_gear.png",
  "assets2/ui/btn_info.png",
  "assets2/ui/btn_list.png",
  "assets2/ui/btn_lock.png",
  "assets2/ui/btn_mute.png",
  "assets2/ui/btn_next.png",
  "assets2/ui/btn_ok.png",
  "assets2/ui/btn_pause.png",
  "assets2/ui/btn_play.png",
  "assets2/ui/btn_prev.png",
  "assets2/ui/btn_skip.png",
  "assets2/ui/btn_sound.png",
  "assets2/ui/btn_star.png",
  "assets2/ui/coin.png",
  "css/base.css",
  "css/cards.css",
  "css/panels.css",
  "js/assets.js",
  "js/audio.js",
  "js/cards.js",
  "js/chest.js",
  "js/config.js",
  "js/custom.js",
  "js/fire.js",
  "js/game.js",
  "js/icons.js",
  "js/main.js",
  "js/mod.js",
  "js/music.js",
  "js/render.js",
  "js/settings.js",
  "js/state.js",
  "js/ui.js"
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c =>
    Promise.all(ASSETS.map(u => fetch(new Request(u, { cache: 'reload' })).then(r => r.ok && c.put(u, r)).catch(() => {})))));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(n => n !== CACHE).map(n => caches.delete(n))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const q = e.request;
  if (q.method !== 'GET') return;
  e.respondWith((async () => {
    try {
      const n = await Promise.race([
        fetch(q, { cache: 'no-cache' }),
        new Promise((_, j) => setTimeout(j, 4000))
      ]);
      // chỉ lưu phản hồi đầy đủ (bỏ qua 206 của file âm thanh)
      if (n && n.status === 200) {
        const k = n.clone();
        caches.open(CACHE).then(c => c.put(q, k)).catch(() => {});
      }
      return n;
    } catch (_) {
      return (await caches.match(q)) || (q.mode === 'navigate' ? await caches.match('index.html') : Response.error());
    }
  })());
});

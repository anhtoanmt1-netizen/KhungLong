/* Service Worker: ưu tiên mạng (chờ tối đa 4 giây), rơi về bộ nhớ đệm khi offline.
   Đổi số phiên bản CACHE mỗi khi phát hành để máy người chơi tải bản mới. */
const CACHE = 'pds-v19';
const ASSETS = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "icon-192.png",
  "icon-512.png",
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
  "js/music.js",
  "js/render.js",
  "js/settings.js",
  "js/state.js",
  "js/ui.js",
  "assets/background.jpg",
  "assets/bgm.mp3",
  "assets/chest1.png",
  "assets/chest2.png",
  "assets/chest3.png",
  "assets/chest4.png",
  "assets/chest5.png",
  "assets/chest6.png",
  "assets/chest7.png",
  "assets/dino_die.png",
  "assets/fire.png",
  "assets/fire_breath.mp3",
  "assets/grass2.jpg",
  "assets/leaf.png",
  "assets/tree.png",
  "assets/dino/run0.png",
  "assets/dino/run1.png",
  "assets/dino/run2.png",
  "assets/dino/run3.png",
  "assets/dino/run4.png",
  "assets/cards/art_ancient.png",
  "assets/cards/art_boom.png",
  "assets/cards/art_def.png",
  "assets/cards/art_dmg.png",
  "assets/cards/art_evo.png",
  "assets/cards/art_gold.png",
  "assets/cards/art_hp.png",
  "assets/cards/art_multi.png",
  "assets/cards/art_pierce.png",
  "assets/cards/art_rate.png",
  "assets/cards/art_regen.png",
  "assets/cards/art_revive.png",
  "assets/cards/art_steal.png",
  "assets/cards/art_storm.png",
  "assets/cards/art_wall.png",
  "assets/cards/frame_blood.png",
  "assets/cards/frame_bronze.png",
  "assets/cards/frame_fire.png",
  "assets/cards/frame_jade.png",
  "assets/cards/frame_lotus.png",
  "assets/cards/frame_shadow.png",
  "assets/cards/frame_silver.png",
  "assets/cards/frame_steel.png",
  "assets/ui/btn_back.png",
  "assets/ui/btn_blank.png",
  "assets/ui/btn_close.png",
  "assets/ui/btn_gear.png",
  "assets/ui/btn_info.png",
  "assets/ui/btn_list.png",
  "assets/ui/btn_lock.png",
  "assets/ui/btn_mute.png",
  "assets/ui/btn_next.png",
  "assets/ui/btn_ok.png",
  "assets/ui/btn_pause.png",
  "assets/ui/btn_play.png",
  "assets/ui/btn_prev.png",
  "assets/ui/btn_skip.png",
  "assets/ui/btn_sound.png",
  "assets/ui/btn_star.png",
  "assets/ui/coin.png"
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

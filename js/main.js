/* ===== Vòng lặp chính, co giãn giao diện, khởi động, Service Worker ===== */
let last = 0, hT = 0, FD = 0;

function loop(ts) {
  requestAnimationFrame(loop);
  const dt = Math.min(.05, (ts - last) / 1000 || 0);
  last = ts; FD = dt; CT += dt;
  if (!R || (!R.pz && R.al)) BT += dt * GS;
  if (R && !R.pz) for (let i = 0; i < GS; i++) upd(dt);
  draw();
  hT -= dt;
  if (hT <= 0) { hT = .1; hud() }
  if (dirty) { sT -= dt; if (sT <= 0) { save(); dirty = 0; sT = 1 } }
}

// 1em = 1/74 chiều rộng khung chơi; mọi giao diện DOM đều tính theo em
function rs() { $('w').style.fontSize = Math.max(9.5, $('w').clientWidth / 74) + 'px' }
addEventListener('resize', rs);
rs();
if (document.fonts && document.fonts.load) {
  document.fonts.load('800 11px Montserrat').catch(() => {});
  document.fonts.load('600 11px Montserrat').catch(() => {});
}

hyd();
$('ver').textContent = 'Phiên bản ' + VERSION;
$('aver').textContent = 'Pixel Dino Survivor v' + VERSION;
$('mg').textContent = S.gold;
if (warn) $('warn').textContent = 'Dữ liệu lưu bị lỗi nên đã được đặt lại.';
initCust();
requestAnimationFrame(loop);

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  const had = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (had) { pendRel = 1; chkRel() } });
  navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then(g => {
    g.update();
    document.addEventListener('visibilitychange', () => { if (!document.hidden) g.update() });
  }).catch(() => {});
}

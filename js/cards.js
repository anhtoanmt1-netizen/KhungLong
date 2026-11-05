/* ===== Thẻ nâng cấp =====
   Mỗi thẻ gồm: ảnh minh họa (assets2/cards/art_<khóa>.png) đặt dưới khung
   (assets2/cards/frame_<màu>.png), nhãn cấp, giá, tên, mô tả.
   Bấm vào thẻ = nâng cấp ngay. */
const TABS = [
  { id: 'atk', n: 'CÔNG' },
  { id: 'def', n: 'THỦ' },
  { id: 'sup', n: 'PHỤ TRỢ' },
  { id: 'fx', n: 'HIỆU ỨNG' },
  { id: 'sk1', n: 'KỸ NĂNG CÔNG' },
  { id: 'sk2', n: 'KỸ NĂNG THỦ' }
];
/* Thẻ mới v2.1: critR=bronze · critD=fire · burn=blood · stun=lotus · exec=shadow · gale=steel (ảnh lấy từ skill_library).
   frame: dmg=fire(đỏ cam) · rate/pierce=silver(bạc) · multi/storm=shadow(tím tối) · hp/steal/boom=blood(đỏ thẫm)
          regen/revive=lotus(sen xanh hồng) · def/wall=steel(thép xanh) · gold=jade(lục) · evo/ancient=bronze/fire */
const CARDS = {
  dmg:     { tab: 'atk', frame: 'fire',   n: 'Sức mạnh',          d: 'Tăng sát thương mỗi viên đạn.' },
  rate:    { tab: 'atk', frame: 'silver', n: 'Tốc độ bắn',        d: 'Bắn nhanh và dồn dập hơn.' },
  multi:   { tab: 'atk', frame: 'shadow', n: 'Đa mục tiêu',       d: 'Mỗi lượt bắn thêm đạn tự nhắm.' },
  critR:   { tab: 'atk', frame: 'bronze', n: 'Tỷ lệ chí mạng',    d: 'Tăng xác suất ra đòn chí mạng.' },
  critD:   { tab: 'atk', frame: 'fire',   n: 'Sát thương chí mạng', d: 'Khuếch đại sát thương khi chí mạng.' },
  hp:      { tab: 'def', frame: 'blood',  n: 'Sinh lực',          d: 'Tăng sinh lực tối đa.' },
  regen:   { tab: 'def', frame: 'lotus',  n: 'Hồi phục',          d: 'Tự hồi máu theo thời gian.' },
  def:     { tab: 'def', frame: 'steel',  n: 'Phòng thủ',         d: 'Giảm sát thương nhận vào.' },
  evo:     { tab: 'sup', frame: 'bronze', n: 'Tiến hóa',          d: 'Mỗi bậc +12% sát thương, +30 HP, +1% chí mạng.' },
  gold:    { tab: 'sup', frame: 'jade',   n: 'Kinh tế',           d: 'Nhận thêm vàng khi hạ quái.' },
  steal:   { tab: 'sup', frame: 'blood',  n: 'Hút máu',           d: 'Hồi máu theo sát thương (có trần hồi mỗi giây).' },
  burn:    { tab: 'fx',  frame: 'blood',  n: 'Thiêu đốt',         d: 'Mỗi đòn đánh gây thêm lửa cháy theo thời gian.' },
  stun:    { tab: 'fx',  frame: 'lotus',  n: 'Choáng',            d: 'Đòn đánh có thể làm quái bất động trong chốc lát.' },
  exec:    { tab: 'fx',  frame: 'shadow', n: 'Phá Huyết',         d: 'Có cơ hội gây thêm 2% máu tối đa của quái (Boss 0,5%).' },
  pierce:  { tab: 'sk1', frame: 'silver', n: 'Lửa Xuyên Phá',     d: 'Cầu lửa xanh dài, xuyên nhiều quái.' },
  boom:    { tab: 'sk1', frame: 'blood',  n: 'Lửa Bùng Nổ',       d: 'Nổ lớn, sát thương lan sang quái bên cạnh.' },
  storm:   { tab: 'sk1', frame: 'shadow', n: 'Bão Lửa',           d: 'Định kỳ bắn một loạt cầu lửa vàng.' },
  ancient: { tab: 'sk1', frame: 'fire',   n: 'Hỏa Ngục Cổ Đại',   d: 'Định kỳ tăng sát thương và tốc độ bắn.' },
  revive:  { tab: 'sk2', frame: 'lotus',  n: 'Phượng Hoàng Lửa',  d: 'Chí mạng vẫn sống, hồi sinh bằng lửa.' },
  wall:    { tab: 'sk2', frame: 'steel',  n: 'Tường Lửa',         d: 'Định kỳ bất tử trong vài giây.' },
  gale:    { tab: 'sk2', frame: 'steel',  n: 'Cuồng Phong Hộ Thân', d: 'Bị bao vây: lốc xoáy đẩy lùi quái.' }
};
let upTab = 'atk', hintT = 0;
const cardKeys = t => Object.keys(CARDS).filter(k => CARDS[k].tab === t);
/* Số lớn trên thẻ (HP cấp cao...): ngăn cách hàng nghìn bằng dấu chấm */
const fv = v => typeof v === 'number' && v >= 1000 ? fmtP(Math.round(v)) : v;
const fmtP = n => n >= 1e6 ? fmtN(n) : String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

/* Trạng thái thẻ: st = ok (mua được) | poor (thiếu vàng) | max (đã đủ) | lock (cần tiến hóa) */
function cardInfo(k) {
  if (k === 'evo') {
    const n = EVO[S.evo + 1];
    if (!n) return { lv: S.evo, st: 'max', pr: 'MAX', d2: 'Đã tiến hóa tối đa' };
    const enoughK = S.st.kills >= n[2], enoughG = S.gold >= n[1];
    return {
      lv: S.evo, st: enoughK && enoughG ? 'ok' : 'poor', price: n[1], warn: !enoughK,
      d2: '→ ' + n[0] + ' · hạ ' + Math.min(S.st.kills, n[2]) + '/' + n[2] + ' quái',
      need: enoughK ? 'Chưa đủ vàng' : 'Chưa đủ quái hạ (' + S.st.kills + '/' + n[2] + ')'
    };
  }
  if (SK[k]) {
    const o = SK[k], l = S.sk[k];
    if (l >= o.m) return { lv: l, st: 'max', pr: 'MAX', d2: o.f(l) + ' (tối đa)' };
    if (!l && S.evo < o.e) {
      const t = 'Cần tiến hóa: ' + EVO[o.e][0];
      return { lv: 0, st: 'lock', price: skCost(k, 0), d2: t, need: t, warn: true };
    }
    const c = skCost(k, l);
    return { lv: l, st: S.gold >= c ? 'ok' : 'poor', price: c, need: 'Chưa đủ vàng', d2: (l ? o.f(l) : 'Chưa mở') + ' → ' + o.f(l + 1) };
  }
  const u = UP[k], l = S.lv[k], pc = u.u[0] === '%' ? '%' : '', tail = u.u.replace(/^%/, '');
  if (l >= u.m) return { lv: l, st: 'max', pr: 'MAX', d2: fv(u.f(l)) + pc + tail + ' (tối đa)' };
  const c = cost(k, l);
  return { lv: l, st: S.gold >= c ? 'ok' : 'poor', price: c, need: 'Chưa đủ vàng', d2: fv(u.f(l)) + pc + ' → ' + fv(u.f(l + 1)) + pc + tail };
}

function cardHTML(k) {
  const c = CARDS[k], i = cardInfo(k);
  const price = i.pr ? `<b class="mx">${i.pr}</b>` : `<img src="${UI}coin.png" alt=""><b>${fmtP(i.price)}</b>`;
  return `<button type="button" class="card st-${i.st}" data-a="card" data-k="${k}" aria-label="${c.n}, cấp ${i.lv}">
    <span class="c-art" style="background-image:url(assets2/cards/art_${k}.png)"></span>
    <img class="c-frame" src="assets2/cards/frame_${c.frame}.png" alt="" draggable="false">
    <span class="c-lv">Lv.<b>${i.lv}</b></span>
    <span class="c-price">${price}</span>
    <span class="c-name${c.n.length > 17 ? ' xl' : c.n.length > 13 ? ' long' : ''}">${c.n}</span>
    <span class="c-desc"><span>${c.d}</span><em${i.warn ? ' class="warn"' : ''}>${i.d2}</em></span>
    ${i.st === 'lock' ? `<span class="c-lock"><img src="${UI}btn_lock.png" alt=""></span>` : ''}
    <i class="c-fx"><b></b><s></s></i>
  </button>`;
}

function upHint(msg, warn) {
  const h = $('uphint');
  h.textContent = msg || 'Chạm vào thẻ để nâng cấp';
  h.classList.toggle('warn', !!warn);
  clearTimeout(hintT);
  if (msg) hintT = setTimeout(() => upHint(), 2200);
}

/* fk/ft: thẻ vừa bấm và hiệu ứng ('ok' = nâng cấp thành công, 'no' = không đủ điều kiện) */
function renderUp(fk, ft) {
  $('upg').textContent = fmtN(S.gold);
  $('tabs').innerHTML = TABS.map(t => {
    const ready = cardKeys(t.id).some(k => cardInfo(k).st === 'ok');
    return `<button type="button" class="tab${t.id === upTab ? ' on' : ''}" data-a="tab" data-k="${t.id}">${t.n}${ready ? '<i class="dot"></i>' : ''}</button>`;
  }).join('');
  const cs = $('cards'), keep = cs._tab === upTab ? cs.scrollLeft : 0;   // mua thẻ không làm nhảy vị trí cuộn
  cs.innerHTML = cardKeys(upTab).map(cardHTML).join('');
  cs._tab = upTab;
  cs.scrollLeft = keep;
  requestAnimationFrame(cardNav);
  if (fk) {
    const el = document.querySelector('.card[data-k="' + fk + '"]');
    if (el) el.classList.add(ft === 'ok' ? 'fx-buy' : 'fx-no');
  }
}

function buyCard(k) {
  const i = cardInfo(k);
  if (i.st === 'max') { sfx('ui'); return upHint('Thẻ này đã đạt mức tối đa'); }
  if (i.st !== 'ok') { sfx('miss'); upHint(i.need, 1); return renderUp(k, 'no'); }
  if (k === 'evo') {
    const n = EVO[S.evo + 1];
    S.gold -= n[1]; S.evo++;
    if (R && R.al) R.hp += CFG.evoHp;
    sfx('evo');
  } else if (SK[k]) {
    S.gold -= skCost(k, S.sk[k]); S.sk[k]++;
    sfx('skill');
  } else {
    const old = sv().maxHp;
    S.gold -= cost(k, S.lv[k]); S.lv[k]++;
    if (k === 'hp' && R && R.al) R.hp += sv().maxHp - old;
    sfx('buy');
  }
  ev('buy');
  save();
  upHint();
  renderUp(k, 'ok');
}

/* ----- Vuốt / kéo / cuộn ngang giữa các thẻ trong một tab ----- */
function cardNav() {
  const cs = $('cards'), w = $('cwrap'), mx = cs.scrollWidth - cs.clientWidth, ov = mx > 4;
  w.classList.toggle('al', ov && cs.scrollLeft > 4);
  w.classList.toggle('ar', ov && cs.scrollLeft < mx - 4);
}
let csAnim = 0;
function cardScroll(d) {
  const cs = $('cards'), from = cs.scrollLeft, to = Math.max(0, Math.min(cs.scrollWidth - cs.clientWidth, from + d * Math.max(200, cs.clientWidth * 0.7)));
  if (Math.abs(to - from) < 1) return;
  const id = ++csAnim, t0 = performance.now(), dur = S.set.rm ? 1 : 260;
  cs.classList.add('drag');   // tạm tắt scroll-snap trong lúc chạy hoạt ảnh
  (function step(now) {
    if (id !== csAnim) return;
    const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
    cs.scrollLeft = from + (to - from) * e;
    if (p < 1) requestAnimationFrame(step);
    else cs.classList.remove('drag');
  })(t0);
}
(() => {
  const cs = $('cards');
  let dn = null, mv = 0;
  cs.addEventListener('scroll', cardNav, { passive: true });
  addEventListener('resize', cardNav);
  // Chuột: giữ và kéo (màn hình cảm ứng dùng cuộn ngang gốc của trình duyệt)
  cs.addEventListener('pointerdown', e => { if (e.pointerType === 'mouse' && e.button === 0) { dn = { x: e.clientX, s: cs.scrollLeft }; mv = 0 } });
  addEventListener('pointermove', e => {
    if (!dn) return;
    const d = e.clientX - dn.x;
    if (!mv && Math.abs(d) > 6) { mv = 1; cs.classList.add('drag') }
    if (mv) cs.scrollLeft = dn.s - d;
  });
  const end = () => { if (dn) { dn = null; cs.classList.remove('drag') } };
  addEventListener('pointerup', end);
  addEventListener('pointercancel', end);
  // Vừa kéo xong thì không tính là bấm vào thẻ
  cs.addEventListener('click', e => { if (mv) { e.stopPropagation(); e.preventDefault(); mv = 0 } }, true);
  // Lăn chuột dọc = cuộn ngang
  cs.addEventListener('wheel', e => {
    if (cs.scrollWidth <= cs.clientWidth + 4 || Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
    cs.scrollLeft += e.deltaY;
    e.preventDefault();
  }, { passive: false });
  document.addEventListener('keydown', e => {
    if (scr === 'up' && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
      const d = e.key === 'ArrowLeft' ? -1 : 1, ed = cardEdge();
      if (d < 0 ? !ed.l : !ed.r) cardScroll(d); else tabStep(d);
      e.preventDefault();
    }
  });
})();

/* ----- Vuốt ngang để đổi nhánh (Công ↔ Thủ ↔ Phụ trợ ↔ Hiệu ứng ↔ Kỹ năng...) -----
   Nếu hàng thẻ còn cuộn được thì vuốt sẽ cuộn thẻ; khi đã ở mép (hoặc không cần cuộn) vuốt tiếp sẽ sang nhánh kế bên. */
function cardEdge(t) {
  if (t && t.closest && !t.closest('#cards')) return { l: true, r: true };   // vuốt ngoài hàng thẻ: đổi nhánh ngay
  const cs = $('cards'), mx = cs.scrollWidth - cs.clientWidth, ov = mx > 4;
  return { l: !ov || cs.scrollLeft <= 4, r: !ov || cs.scrollLeft >= mx - 4 };   // l/r: đang ở mép trái/phải (hoặc không có gì để cuộn)
}
function setTab(id, d) {
  if (id === upTab) return;
  upTab = id;
  renderUp();
  const cs = $('cards');
  cs.classList.remove('sl-n', 'sl-p');
  if (!S.set.rm) { void cs.offsetWidth; cs.classList.add(d > 0 ? 'sl-n' : 'sl-p'); }
  sfx('ui');
}
function tabStep(d) {
  const i = TABS.findIndex(t => t.id === upTab) + d;
  if (i < 0 || i >= TABS.length) return false;
  setTab(TABS[i].id, d);
  return true;
}
(() => {
  const up = $('up');
  let g = null;
  const fin = (x, y, dt) => {
    if (!g) return;
    const dx = x - g.x, dy = y - g.y;
    const e = g; g = null;
    if (Math.abs(dx) < 56 || Math.abs(dx) < Math.abs(dy) * 1.5 || dt > 1200) return;
    if (dx < 0 ? e.r : e.l) tabStep(dx < 0 ? 1 : -1);   // vuốt sang trái = nhánh kế tiếp
  };
  up.addEventListener('touchstart', e => { g = e.touches.length === 1 ? { x: e.touches[0].clientX, y: e.touches[0].clientY, t: performance.now(), ...cardEdge(e.target) } : null }, { passive: true });
  up.addEventListener('touchend', e => { const t = e.changedTouches[0]; if (t) fin(t.clientX, t.clientY, performance.now() - g?.t) }, { passive: true });
  up.addEventListener('touchcancel', () => { g = null }, { passive: true });
  // Chuột: kéo ngang đủ dài ở mép hàng thẻ cũng đổi nhánh
  up.addEventListener('pointerdown', e => { if (e.pointerType === 'mouse' && e.button === 0) g = { x: e.clientX, y: e.clientY, t: performance.now(), ...cardEdge(e.target) } });
  addEventListener('pointerup', e => { if (e.pointerType === 'mouse' && g) fin(e.clientX, e.clientY, performance.now() - g.t) });
})();

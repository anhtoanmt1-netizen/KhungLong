/* ===== Thẻ nâng cấp =====
   Mỗi thẻ gồm: ảnh minh họa (assets/cards/art_<khóa>.png) đặt dưới khung
   (assets/cards/frame_<màu>.png), nhãn cấp, giá, tên, mô tả.
   Bấm vào thẻ = nâng cấp ngay. */
const TABS = [
  { id: 'atk', n: 'CÔNG' },
  { id: 'def', n: 'THỦ' },
  { id: 'sup', n: 'PHỤ TRỢ' },
  { id: 'sk1', n: 'KỸ NĂNG CÔNG' },
  { id: 'sk2', n: 'KỸ NĂNG THỦ' }
];
/* frame: dmg=fire(đỏ cam) · rate/pierce=silver(bạc) · multi/storm=shadow(tím tối) · hp/steal/boom=blood(đỏ thẫm)
          regen/revive=lotus(sen xanh hồng) · def/wall=steel(thép xanh) · gold=jade(lục) · evo/ancient=bronze/fire */
const CARDS = {
  dmg:     { tab: 'atk', frame: 'fire',   n: 'Sức mạnh',          d: 'Tăng sát thương mỗi viên đạn.' },
  rate:    { tab: 'atk', frame: 'silver', n: 'Tốc độ bắn',        d: 'Bắn nhanh và dồn dập hơn.' },
  multi:   { tab: 'atk', frame: 'shadow', n: 'Đa mục tiêu',       d: 'Mỗi lượt bắn thêm đạn tự nhắm.' },
  hp:      { tab: 'def', frame: 'blood',  n: 'Sinh lực',          d: 'Tăng sinh lực tối đa.' },
  regen:   { tab: 'def', frame: 'lotus',  n: 'Hồi phục',          d: 'Tự hồi máu theo thời gian.' },
  def:     { tab: 'def', frame: 'steel',  n: 'Phòng thủ',         d: 'Giảm sát thương nhận vào.' },
  evo:     { tab: 'sup', frame: 'bronze', n: 'Tiến hóa',          d: 'Mỗi bậc +10% sát thương, +20 HP.' },
  gold:    { tab: 'sup', frame: 'jade',   n: 'Kinh tế',           d: 'Nhận thêm vàng khi hạ quái.' },
  steal:   { tab: 'sup', frame: 'blood',  n: 'Hút máu',           d: 'Hồi máu theo sát thương gây ra.' },
  pierce:  { tab: 'sk1', frame: 'silver', n: 'Lửa Xuyên Phá',     d: 'Cầu lửa xanh dài, xuyên 3 quái.' },
  boom:    { tab: 'sk1', frame: 'blood',  n: 'Lửa Bùng Nổ',       d: 'Nổ lớn, lan 50% sát thương.' },
  storm:   { tab: 'sk1', frame: 'shadow', n: 'Bão Lửa',           d: 'Mỗi 15s bắn loạt 8 cầu lửa vàng.' },
  ancient: { tab: 'sk1', frame: 'fire',   n: 'Hỏa Ngục Cổ Đại',   d: 'Mỗi 20s: 6s +50% sát thương, tốc độ.' },
  revive:  { tab: 'sk2', frame: 'lotus',  n: 'Phượng Hoàng Lửa',  d: 'Giữ 1 HP khi chí mạng. Hồi chiêu 60s.' },
  wall:    { tab: 'sk2', frame: 'steel',  n: 'Tường Lửa',         d: 'Mỗi 20s: 3s bất tử.' }
};
let upTab = 'atk', hintT = 0;
const cardKeys = t => Object.keys(CARDS).filter(k => CARDS[k].tab === t);
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
    const o = SK[k];
    if (S.sk[k]) return { lv: 1, st: 'max', pr: 'ĐÃ MỞ', d2: 'Đã kích hoạt' };
    if (S.evo < o.e) {
      const t = 'Cần tiến hóa: ' + EVO[o.e][0];
      return { lv: 0, st: 'lock', price: o.c, d2: t, need: t, warn: true };
    }
    return { lv: 0, st: S.gold >= o.c ? 'ok' : 'poor', price: o.c, d2: 'Chạm để mở khóa', need: 'Chưa đủ vàng' };
  }
  const u = UP[k], l = S.lv[k], pc = u.u[0] === '%' ? '%' : '', tail = u.u.replace(/^%/, '');
  if (l >= u.m) return { lv: l, st: 'max', pr: 'MAX', d2: u.f(l) + pc + tail + ' (tối đa)' };
  const c = cost(k, l);
  return { lv: l, st: S.gold >= c ? 'ok' : 'poor', price: c, need: 'Chưa đủ vàng', d2: u.f(l) + pc + ' → ' + u.f(l + 1) + pc + tail };
}

function cardHTML(k) {
  const c = CARDS[k], i = cardInfo(k);
  const price = i.pr ? `<b class="mx">${i.pr}</b>` : `<img src="${UI}coin.png" alt=""><b>${fmtP(i.price)}</b>`;
  return `<button type="button" class="card st-${i.st}" data-a="card" data-k="${k}" aria-label="${c.n}, cấp ${i.lv}">
    <span class="c-art" style="background-image:url(assets/cards/art_${k}.png)"></span>
    <img class="c-frame" src="assets/cards/frame_${c.frame}.png" alt="" draggable="false">
    <span class="c-lv">Lv.<b>${i.lv}</b></span>
    <span class="c-price">${price}</span>
    <span class="c-name${c.n.length > 13 ? ' long' : ''}">${c.n}</span>
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
  $('cards').innerHTML = cardKeys(upTab).map(cardHTML).join('');
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
    if (R && R.al) R.hp += 20;
    sfx('evo');
  } else if (SK[k]) {
    S.gold -= SK[k].c; S.sk[k] = 1;
    sfx('skill');
  } else {
    const old = sv().maxHp;
    S.gold -= cost(k, S.lv[k]); S.lv[k]++;
    if (k === 'hp' && R && R.al) R.hp += sv().maxHp - old;
    sfx('buy');
  }
  save();
  upHint();
  renderUp(k, 'ok');
}

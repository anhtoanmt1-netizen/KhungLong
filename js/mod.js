/* ===== Bảng Mod (ẩn) =====
   Mở: chạm / bấm 3 lần liên tiếp vào avatar khủng long (khung DINO, góc trên trái) khi đang chơi.
   Phải nhập mật khẩu (mặc định 111291, đổi được ngay trong bảng). Công tắc "Bật Mod" quyết định
   các tính năng Mod có hoạt động hay không; tắt Mod là trở về game mặc định:
     · tốc độ x3, x5          · Tùy chỉnh hình ảnh (nền, cây, lá, cỏ)
     · đặt/cộng vàng           · kích thước khủng long (px)
     · kích thước 12 Boss (px)
   Dữ liệu lưu trong S.mod: { on, pw (đã băm), dino, bs: { chỉ số Boss: px } }. */
let mFrom = '', mTaps = [];
const mMsg = (t, id) => { const e = $(id || 'modm'); if (e) e.textContent = t || '' };

/* Vùng avatar trong tọa độ khung 640×360 (khung DINO vẽ ở hudc()). Trả về true nếu chạm trúng. */
function modTap(px, py) {
  if (px < 6 || px > 86 || py < 5 || py > 31) return false;
  const n = performance.now();
  mTaps = mTaps.filter(t => n - t < 700);
  mTaps.push(n);
  if (mTaps.length >= 3) { mTaps = []; openMod() }
  return true;
}
function openMod() {
  if (!R || !R.al) return;
  R.pz = 1; mFrom = 'g';
  $('modin').value = ''; mMsg('', 'modpm');
  show('modpw');
  setTimeout(() => { try { $('modin').focus() } catch (_) { } }, 60);
}
function closeMod() {
  if (mFrom === 'g' && R && R.al) { R.pz = 0; show(null) }
  else { $('mg').textContent = S.gold; show('menu') }
  mFrom = '';
}
function modUnlock() {
  if (hpw($('modin').value) === S.mod.pw) {
    $('modin').value = '';
    renderMod(); mMsg('');
    show('mod');
  } else {
    mMsg('Sai mật khẩu, thử lại.', 'modpm');
    $('modin').select();
    sfx('miss');
  }
}

function renderMod() {
  const m = S.mod, on = !!m.on, dis = on ? '' : ' disabled';
  const dd = IM[0].naturalWidth || 89;
  const boss = BOSS.map(b => `<label class="mb"><span class="mt" style="background-image:url(${b.src})"></span><b style="color:${b.c}">${b.n}</b>
      <input type="number" inputmode="numeric" min="30" max="220" step="1" placeholder="${b.w}" value="${m.bs[b.i] || ''}" data-in="mboss" data-k="${b.i}"${dis} aria-label="Kích thước ${b.n} (px)"></label>`).join('');
  $('modb').innerHTML = `
    <button type="button" class="srow tgl ${on ? 'on' : 'off'}" data-a="modtog" role="switch" aria-checked="${on}">
      <span class="stx"><b>Bật Mod</b><small>${on ? 'Đang dùng các tính năng Mod bên dưới.' : 'Đang TẮT: game ở trạng thái mặc định, các tính năng Mod bị ẩn và không áp dụng.'}</small></span><em>${on ? 'BẬT' : 'TẮT'}</em></button>
    <div class="mgrid">
      <div class="mc"><b>Vàng trong game</b>
        <small>Hiện có: ${fmtP(S.gold)}</small>
        <input type="number" inputmode="numeric" min="0" max="1000000000000" step="1" id="modgold" placeholder="Nhập số vàng"${dis} aria-label="Số vàng">
        <div class="row nowrap"><button class="b" data-a="modgold" data-k="set"${dis}>Đặt vàng</button><button class="b" data-a="modgold" data-k="add"${dis}>＋ Cộng</button></div></div>
      <div class="mc"><b>Khủng long (px)</b>
        <small>Chiều rộng hiển thị. Mặc định ${dd} px, nhập 30–300.</small>
        <input type="number" inputmode="numeric" min="30" max="300" step="1" placeholder="${dd}" value="${m.dino || ''}" data-in="mdino"${dis} aria-label="Kích thước khủng long (px)">
        <button class="b a" data-a="modrstd"${dis}>↺ Mặc định</button></div>
      <div class="mc"><b>Tốc độ &amp; hình ảnh</b>
        <small>Tốc độ x3, x5 hiện ở thanh dưới khi chơi (lúc Mod bật).</small>
        <button class="b" data-a="cust"${dis}>Tùy chỉnh hình ảnh</button>
        <small>Nền, cây, đạn lửa, nền cỏ.</small></div>
    </div>
    <div class="mc mwide"><div class="mhd"><b>Kích thước 12 Boss (px)</b><button class="b a" data-a="modrstb"${dis}>↺ Mặc định tất cả</button></div>
      <small>Đổi chiều rộng hình Boss (30–220). Bỏ trống là kích thước mặc định (ô mờ). Áp dụng cho Boss xuất hiện từ lúc này.</small>
      <div class="mbs">${boss}</div></div>
    <div class="mc mwide mpw"><b>Đổi mật khẩu Mod</b>
      <input type="password" id="modnp" autocomplete="new-password" maxlength="20" placeholder="Mật khẩu mới (4–20 ký tự)" aria-label="Mật khẩu mới">
      <button class="b" data-a="modnp">Lưu mật khẩu</button></div>`;
}

function modAct(a, k) {
  const m = S.mod;
  switch (a) {
    case 'modclose': closeMod(); break;
    case 'modunlock': modUnlock(); break;
    case 'modtog':
      m.on ^= 1;
      if (!m.on && GS > 2) GS = 1;
      save(); applyCust(); renderMod();
      mMsg(m.on ? 'Mod đã BẬT.' : 'Mod đã TẮT: game trở về mặc định.');
      break;
    case 'modgold': {
      if (!m.on) break;
      const v = Math.floor(+$('modgold').value);
      if (!(v >= 0) || $('modgold').value === '') { mMsg('Hãy nhập số vàng hợp lệ (0 trở lên).'); break }
      S.gold = Math.min(1e12, k === 'add' ? S.gold + v : v);
      save(); $('mg').textContent = S.gold; renderMod();
      mMsg(k === 'add' ? 'Đã cộng ' + fmtP(v) + ' vàng.' : 'Đã đặt vàng = ' + fmtP(S.gold) + '.');
      sfx('buy');
      break;
    }
    case 'modrstd': m.dino = null; save(); renderMod(); mMsg('Khủng long về kích thước mặc định.'); break;
    case 'modrstb': m.bs = {}; save(); renderMod(); mMsg('12 Boss về kích thước mặc định.'); break;
    case 'modnp': {
      const v = $('modnp').value;
      if (v.length < 4 || v.length > 20) { mMsg('Mật khẩu phải dài 4–20 ký tự.'); break }
      m.pw = hpw(v); save(); $('modnp').value = '';
      mMsg('Đã đổi mật khẩu Mod.');
      sfx('buy');
      break;
    }
    case 'custback': renderMod(); show('mod'); break;
  }
}

document.addEventListener('change', e => {
  const t = e.target, d = t.dataset;
  if (!d || !d.in || !S.mod.on) return;
  let v = t.value === '' ? null : Math.round(+t.value);
  if (v !== null && !(v > 0)) v = null;
  if (d.in === 'mdino') {
    S.mod.dino = v === null ? null : Math.min(300, Math.max(30, v));
    save(); renderMod();
    mMsg(S.mod.dino ? 'Khủng long: ' + S.mod.dino + ' px.' : 'Khủng long về mặc định.');
  } else if (d.in === 'mboss') {
    const i = +d.k;
    if (v === null) delete S.mod.bs[i]; else S.mod.bs[i] = Math.min(220, Math.max(30, v));
    save(); renderMod();
    mMsg(BOSS[i].n + (S.mod.bs[i] ? ': ' + S.mod.bs[i] + ' px.' : ' về mặc định.'));
  }
});
$('modin').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); modUnlock() } });

/* ===== Bàn phím số riêng (v2.1) =====
   Mọi ô nhập số hoặc mật khẩu (input[type=number], input[type=password]: mật khẩu Mod, cỡ khủng long/Boss/cây/lá/cỏ, số vàng, nhập đợt)
   dùng bàn phím này thay cho bàn phím hệ thống của điện thoại, nên không che nội dung game.
   - Cố định ở giữa mép dưới khung game (#w), nhỏ gọn: 2 hàng × 6 phím (1-5 ⌫ / 6-0 OK) + dòng hiển thị giá trị.
   - Ô nhập là readonly + inputmode="none"; bàn phím tự bật khi chạm vào ô, ghi giá trị rồi phát sự kiện input/change như khi gõ thật,
     nên các bộ xử lý cũ (mod.js, custom.js) không cần thay đổi.
   - Máy tính: gõ phím số, Backspace, Enter (OK), Esc (đóng) cũng hoạt động.
   - Lần bấm số đầu tiên thay thế giá trị có sẵn (ví dụ đợt hiện tại); ✕ xóa hết. ===== */
(() => {
  const SEL = 'input[type=number],input[type=password]', w = document.getElementById('w');
  const kp = document.createElement('div');
  kp.id = 'kp';
  kp.setAttribute('role', 'group');
  kp.setAttribute('aria-label', 'Bàn phím số');
  const keys = [1, 2, 3, 4, 5, 'del', 6, 7, 8, 9, 0, 'ok'];
  kp.innerHTML = '<div class="kpd"><span class="kpl"></span><b class="kpv"></b><button type="button" class="kpc" data-kp="clr" aria-label="Xóa hết">✕</button></div><div class="kpg">' +
    keys.map(k => `<button type="button" class="kb${k === 'del' ? ' del' : k === 'ok' ? ' ok' : ''}" data-kp="${k}" aria-label="${k === 'del' ? 'Xóa một số' : k === 'ok' ? 'Xong' : k}">${k === 'del' ? '⌫' : k === 'ok' ? 'OK' : k}</button>`).join('') + '</div>';
  w.appendChild(kp);
  const lab = kp.querySelector('.kpl'), val = kp.querySelector('.kpv');
  let el = null, fresh = false, v0 = '', busy = 0;

  const maxLen = i => i.type === 'password' ? (+i.maxLength > 0 ? i.maxLength : 20) : (i.max ? String(i.max).length : 13);
  function sync() {
    if (!el) return;
    const v = el.value;
    lab.textContent = el.getAttribute('aria-label') || '';
    val.classList.toggle('ph', v === '');
    val.classList.toggle('sel', fresh && v !== '');
    val.textContent = v === '' ? (el.placeholder || '—') : el.type === 'password' ? '•'.repeat(v.length) : v;
  }
  function put(v) {
    el.value = v;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    sync();
  }
  function open(inp) {
    if (el === inp) return;
    if (el) close(true);
    el = inp;
    el.readOnly = true;
    el.inputMode = 'none';
    el.classList.add('kp-active');
    v0 = el.value;
    fresh = el.value !== '';
    w.classList.add('kp-open');
    kp.classList.add('on');
    sync();
    try { el.scrollIntoView({ block: 'center', behavior: 'smooth' }) } catch (_) { }
  }
  /* commit = true: phát "change" nếu giá trị đổi (để mod.js/custom.js lưu); false: bỏ qua (đổi màn hình) */
  function close(commit) {
    const e = el;
    el = null;
    if (e) e.classList.remove('kp-active');
    kp.classList.remove('on');
    w.classList.remove('kp-open');
    if (e && commit !== false && e.isConnected && e.value !== v0) e.dispatchEvent(new Event('change', { bubbles: true }));
  }
  function press(k) {
    if (!el || !el.isConnected) { close(false); return; }
    if (k === 'ok') {
      const t = el;
      busy = 1;   // cờ chống lặp: sự kiện Enter giả không được xử lý lại bởi chính bàn phím
      try { t.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })) } finally { busy = 0 }
      close(true);
      return;
    }
    if (k === 'clr') { fresh = false; put(''); return; }
    if (k === 'del') { const s = fresh ? '' : el.value.slice(0, -1); fresh = false; put(s); return; }
    let s = fresh ? '' : el.value;
    fresh = false;
    if (s.length >= maxLen(el)) { sync(); return; }
    if (el.type === 'number' && s === '0') s = '';
    put(s + k);
  }

  document.addEventListener('pointerdown', e => {
    const t = e.target, kb = t.closest && t.closest('[data-kp]');
    if (kb && kp.contains(kb)) { e.preventDefault(); press(kb.dataset.kp); return; }
    if (kp.contains(t)) { e.preventDefault(); return; }
    const inp = t.closest && t.closest(SEL);
    if (inp && !inp.disabled) { inp.readOnly = true; inp.inputMode = 'none'; e.preventDefault(); open(inp); return; }
    if (el) close(true);
  }, true);
  document.addEventListener('focusin', e => {
    const t = e.target;
    if (t.matches && t.matches(SEL) && !t.disabled) { t.readOnly = true; open(t); }
  });
  document.addEventListener('keydown', e => {
    if (!el || busy) return;
    if (/^[0-9]$/.test(e.key)) press(e.key);
    else if (e.key === 'Backspace') press('del');
    else if (e.key === 'Enter') press('ok');
    else if (e.key === 'Escape') close(false);
    else return;
    e.preventDefault();
    e.stopImmediatePropagation();
  }, true);
  window.kpOpen = open;
  window.kpClose = close;
})();

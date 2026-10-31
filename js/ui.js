/* ===== Điều hướng màn hình, xử lý nút bấm, HUD dạng DOM ===== */
let sFrom = '';   // 'g' = Cài đặt được mở từ trong lúc chơi
let pendRel = 0;  // có bản cập nhật mới, chờ về menu rồi tải lại

function show(id) {
  scr = id;
  document.querySelectorAll('.sc').forEach(e => e.classList.toggle('on', e.id === id));
}

function act(a, k, i) {
  switch (a) {
    case 'play': startRun(); break;
    case 'play1': S.rw = 1; save(); startRun(); break;

    // --- Thẻ nâng cấp ---
    case 'up': prev = scr; upHint(); renderUp(); show('up'); break;
    case 'hudup': if (R && R.al) { R.pz = 1; prev = 'hud'; upHint(); renderUp(); show('up') } break;
    case 'closeup':
      if (prev === 'over' && R) show('over');
      else if (prev === 'hud' && R && R.al) { R.pz = 0; show(null) }
      else show(prev === 'pause' && R && R.al ? 'pause' : 'menu');
      break;
    case 'tab': upTab = k; renderUp(); break;
    case 'card': buyCard(k); break;

    // --- Chơi / tạm dừng / menu ---
    case 'pause': if (R && R.al) { R.pz = 1; show('pause') } break;
    case 'resume': if (R) R.pz = 0; show(null); break;
    case 'menu': R = null; chkRel(); $('mg').textContent = S.gold; show('menu'); break;
    case 'newg': show('conf'); break;
    case 'donew': {
      const st = S.set, cu = S.cu;
      S = defS(); S.set = st; S.cu = cu;
      save(); R = null; $('mg').textContent = 0; show('menu');
      break;
    }
    case 'spd': GS = +k; break;
    case 'how': show('how'); break;
    case 'about': show('about'); break;

    // --- Cài đặt ---
    case 'set': sFrom = ''; renderSet(); show('set'); break;
    case 'hudset': if (R && R.al) { R.pz = 1; sFrom = 'g'; renderSet(); show('set') } break;
    case 'setback': renderSet(); show('set'); break;
    case 'setclose':
      if (sFrom === 'g' && R && R.al) { R.pz = 0; show(null) }
      else { $('mg').textContent = S.gold; show('menu') }
      break;
    case 'tog': S.set[k] ^= 1; save(); renderSet(); break;

    // --- Nhạc nền & hình ảnh tùy chỉnh ---
    case 'musm': renderMus(); $('mm').textContent = ''; show('mus'); break;
    case 'musel': selMus(k); break;
    case 'musdel': delMus(k); break;
    case 'musup': $('mf').click(); break;
    case 'cust': renderCust(); $('cm').textContent = ''; show('cust'); break;
    case 'upimg': if (IC[k] && IC[k].length < 3) { pendCat = k; $('fi').value = ''; $('fi').click() } break;
    case 'selimg': if (IC[k] && IC[k].find(o => o.id === i)) { S.cu[k].sel = i; save(); applyCust(); renderCust() } break;
    case 'delimg': {
      const l = IC[k];
      if (l) {
        IC[k] = l.filter(o => o.id !== i); idbDel(i);
        if (S.cu[k].sel === i) S.cu[k].sel = null;
        save(); applyCust(); renderCust(); $('cm').textContent = '';
      }
      break;
    }
    case 'rstimg': S.cu[k].sel = null; if ('px' in S.cu[k]) S.cu[k].px = null; save(); applyCust(); renderCust(); break;
    case 'zm': if (CS) zoomAt(k === '+' ? 1.18 : 1 / 1.18, CS.fw / 2, CS.fh / 2); break;
    case 'cancrop': endCrop(); show('cust'); break;
    case 'savecrop': finishCrop(); break;
  }
}

document.addEventListener('click', e => {
  const a = e.target.closest('[data-a]');
  if (a && !a.disabled) act(a.dataset.a, a.dataset.k, a.dataset.i);
});
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (R && R.al && scr === null) act('pause');
  else if (scr === 'crop') act('cancrop');
  else if (scr === 'up') act('closeup');
  else if (scr === 'set') act('setclose');
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { save(); if (R && R.al && scr === null) act('pause') }
});
addEventListener('pagehide', save);

/* ----- HUD (nút nhanh, thanh dưới, nút tốc độ) ----- */
function hl() {
  const p = S.rw > 1;
  $('bp').textContent = p ? '▶ CHƠI (đợt ' + S.rw + ')' : '▶ CHƠI';
  $('bo').textContent = p ? '↻ Chơi lại (đợt ' + S.rw + ')' : '↻ Chơi lại';
  $('bf').style.display = $('bf2').style.display = p ? '' : 'none';
}
function hud() {
  hl();
  const on = !!R;
  $('bb').style.visibility = $('qt').style.visibility = on ? 'visible' : 'hidden';
  document.querySelectorAll('[data-q]').forEach(b => b.classList.toggle('off', !S.set[b.dataset.k]));
  const si = $('qsnd'), want = UI + (S.set.snd ? 'btn_sound.png' : 'btn_mute.png');
  if (si && si.getAttribute('src') !== want) si.setAttribute('src', want);
  if (!on) { $('bn').textContent = ''; return }
  $('bn').textContent = R.bn > 0 && R.al ? 'ĐỢT ' + R.wave : '';
  document.querySelectorAll('[data-a=spd]').forEach(b => b.classList.toggle('on', +b.dataset.k === GS));
}
function chkRel() { if (pendRel && (!R || !R.al)) location.reload() }

/* Chạm vào rương trên canvas để mở */
cv.addEventListener('pointerdown', e => {
  if (!R || !R.al || R.pz || scr !== null) return;
  const b = cv.getBoundingClientRect(), px = (e.clientX - b.left) * W / b.width, py = (e.clientY - b.top) * H / b.height;
  let bc = null, bd = 1e9;
  for (const c of R.ch) {
    if (c.st !== 0) continue;
    const cy = GY + 5 - c.h / 2, d = Math.hypot(px - c.x, py - cy);
    if (Math.abs(px - c.x) < c.w / 2 + 18 && Math.abs(py - cy) < c.h / 2 + 22 && d < bd) { bd = d; bc = c }
  }
  if (bc) { bc.st = 1; bc.vz = 150; bc.vx = 0; sfx('tap') }
});

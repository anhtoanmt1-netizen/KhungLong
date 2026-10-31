/* ===== Màn Cài đặt ===== */
const SET_ROWS = [
  ['snd', 'Âm thanh', 'Tiếng bắn, nổ, nhặt vàng', 'sound'],
  ['mus', 'Nhạc nền', 'Bật hoặc tắt nhạc nền', 'music'],
  ['dn', 'Số sát thương', 'Hiện số trên đầu quái', 'dmg'],
  ['rm', 'Giảm chuyển động', 'Bớt rung màn hình và hạt', 'wave']
];

function renderSet() {
  const v = Math.round(S.set.sv * 100);
  let h = SET_ROWS.map(([k, n, s, g]) => {
    const on = !!S.set[k];
    // Âm thanh dùng cặp nút loa / loa gạch; các mục còn lại dùng nút trống + biểu tượng
    const btn = k === 'snd'
      ? `<span class="ibtn"><img src="${UI}btn_${on ? 'sound' : 'mute'}.png" alt=""></span>`
      : `<span class="ibtn g"><img src="${UI}btn_blank.png" alt=""><i>${ico(g)}</i></span>`;
    return `<button type="button" class="srow tgl ${on ? 'on' : 'off'}" data-a="tog" data-k="${k}" role="switch" aria-checked="${on}">
      <span class="stx"><b>${n}</b><small>${s}</small></span><em>${on ? 'BẬT' : 'TẮT'}</em>${btn}</button>`;
  }).join('');
  h += `<div class="srow vol">
      <span class="stx"><b>Âm lượng hiệu ứng</b><small>Kéo để chỉnh</small></span>
      <input type="range" class="vl" min="0" max="100" value="${v}" data-in="vol" style="--p:${v}%" aria-label="Âm lượng hiệu ứng">
      <em id="vv">${v}%</em></div>
    <button type="button" class="srow nav" data-a="musm"><span class="stx"><b>Đổi nhạc nền</b><small>Tải lên tối đa 3 bản</small></span>
      <span class="ibtn"><img src="${UI}btn_list.png" alt=""></span></button>
    <button type="button" class="srow nav" data-a="cust"><span class="stx"><b>Tùy chỉnh hình ảnh</b><small>Nền, cây, cỏ, đạn lửa</small></span>
      <span class="ibtn g"><img src="${UI}btn_blank.png" alt=""><i>${ico('image')}</i></span></button>`;
  $('sets').innerHTML = h;
}

document.addEventListener('input', e => {
  const t = e.target;
  if (t.dataset && t.dataset.in === 'vol') {
    S.set.sv = +t.value / 100;
    AU.vol();
    $('vv').textContent = t.value + '%';
    t.style.setProperty('--p', t.value + '%');
    save();
  }
});
document.addEventListener('change', e => {
  if (e.target.dataset && e.target.dataset.in === 'vol') sfx('hit');
});

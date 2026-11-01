/* ===== Biểu tượng & nút giao diện =====
   Nút ảnh lấy từ assets2/ui/btn_*.png (cắt từ Setting.png).
   Với chức năng không có sẵn ảnh (nhạc, số sát thương, giảm chuyển động...),
   dùng nút trống btn_blank.png + biểu tượng SVG màu nâu đặt lên giữa. */
const UI = 'assets2/ui/';
const SW = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
const IC_ = {
  gear: `<circle cx="12" cy="12" r="8.2" fill="none" stroke="currentColor" stroke-width="3.2" stroke-dasharray="3.22 3.22"/><circle cx="12" cy="12" r="6.4"/><circle cx="12" cy="12" r="2.6" fill="#0b0d15"/>`,
  sound: `<path d="M3 9h4l5-4v14l-5-4H3z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" ${SW}/>`,
  music: `<path d="M9 3h10v3h-8v10.5a3.5 3.5 0 1 1-2-3.2z"/>`,
  dmg: `<text x="12" y="17" font-size="13" font-weight="900" text-anchor="middle" font-family="sans-serif">-9</text>`,
  wave: `<path d="M2 9c3-4 5 4 8 0s5 4 8 0M2 15c3-4 5 4 8 0s5 4 8 0" ${SW}/>`,
  image: `<rect x="3" y="4" width="18" height="16" rx="2" ${SW}/><path d="M5 17l5-6 4 4 2-2 3 4" ${SW}/>`
};
const ico = n => `<svg viewBox="0 0 24 24" fill="currentColor">${IC_[n] || ''}</svg>`;
const hyd = () => document.querySelectorAll('[data-ic]').forEach(e => e.innerHTML = ico(e.dataset.ic));

/* ===== Tùy chỉnh hình ảnh (nền, cây, lá, cỏ): IndexedDB, màn cắt và thu phóng ảnh. ===== */
const CC = { bg: { n: "Nền (lớp sau cùng)", ar: 16 / 9, ow: 1280, al: 0, h: "Khung 16:9: phần trong khung sẽ là phông nền." }, tree: { n: "Cây", ar: 205 / 420, ow: 250, al: 1, px: [40, 600], df: () => 172, h: "Đặt gốc cây sát đáy khung, thân cây ở giữa." }, leaf: { n: "Đạn riêng (thay cầu lửa)", ar: 36 / 33, ow: 144, al: 1, px: [6, 120], df: () => 28, h: "Ảnh riêng sẽ thay cầu lửa mặc định; bấm Dùng mặc định để lấy lại lửa. Đặt vật thể ở giữa khung, PNG nền trong suốt là đẹp nhất." }, grass: { n: "Nền cỏ (ô lặp)", ar: 1, ow: 512, al: 0, px: [24, 400], df: () => DWD(), h: "Ô vuông được lặp lại hết chiều dài màn hình; phần cỏ nên nằm ở trên cùng." } };
let IC = { bg: [], tree: [], leaf: [], grass: [] }, idb = null, pendCat = null, CS = null;
const idbOpen = () => new Promise((res) => {
  try {
    const q = indexedDB.open("pds_img", 1);
    q.onupgradeneeded = () => q.result.createObjectStore("imgs", { keyPath: "id" });
    q.onsuccess = () => res(q.result);
    q.onerror = () => res(null);
    q.onblocked = () => res(null);
  } catch (e) {
    res(null);
  }
}), idbAll = () => new Promise((res) => {
  if (!idb) return res([]);
  try {
    const r = idb.transaction("imgs").objectStore("imgs").getAll();
    r.onsuccess = () => res(r.result || []);
    r.onerror = () => res([]);
  } catch (e) {
    res([]);
  }
}), idbPut = (o) => new Promise((res) => {
  if (!idb) return res(true);
  try {
    const t = idb.transaction("imgs", "readwrite");
    t.objectStore("imgs").put(o);
    t.oncomplete = () => res(true);
    t.onerror = () => res(false);
    t.onabort = () => res(false);
  } catch (e) {
    res(false);
  }
}), idbDel = (id) => {
  if (!idb) return;
  try {
    idb.transaction("imgs", "readwrite").objectStore("imgs").delete(id);
  } catch (e) {
  }
};
function applyCust() {
  for (const k of CUK) {
    const it = IC[k].find((o) => o.id === S.cu[k].sel);
    setAsset(CATK[k], it ? it.d : DEFSRC[CATK[k]]);
  }
}
async function initCust() {
  idb = await idbOpen();
  loadMus();
  const all = await idbAll();
  for (const k of CUK) {
    IC[k] = all.filter((o) => o.cat === k).sort((a, b) => a.t - b.t).slice(0, 3);
    if (S.cu[k].sel && !IC[k].find((o) => o.id === S.cu[k].sel)) {
      S.cu[k].sel = null;
      dirty = 1;
    }
  }
  applyCust();
}
function renderCust() {
  $("cg").innerHTML = CUK.map((k) => {
    const c = CC[k], cu = S.cu[k], l = IC[k], cur = l.find((o) => o.id === cu.sel), full = l.length >= 3, dv = c.df ? c.df() : 0;
    const sl = [0, 1, 2].map((i) => {
      const o = l[i];
      return o ? `<div class="sl${o.id === cu.sel ? " on" : ""}"><button class="th" data-a="selimg" data-k="${k}" data-i="${o.id}" style="background-image:url(${o.th})" aria-label="Dùng ảnh ${i + 1}"></button><button class="x" data-a="delimg" data-k="${k}" data-i="${o.id}" aria-label="Xóa ảnh ${i + 1}">✕</button></div>` : `<div class="sl em"><button class="th" disabled aria-hidden="true"></button></div>`;
    }).join("");
    return `<div class="cd"><b>${c.n}</b><div class="pv" style="background-image:url(${cur ? cur.th : DEFSRC[CATK[k]]})"></div><small>${cur ? "Đang dùng ảnh của bạn" : "Đang dùng ảnh mặc định"}</small><div class="sls">${sl}</div><button class="b" data-a="upimg" data-k="${k}" ${full ? "disabled" : ""}>${full ? "Đã đủ 3 ảnh" : "＋ Tải ảnh lên"}</button>${full ? "<small>Bấm ✕ để xóa bớt ảnh rồi mới thêm được.</small>" : ""}${c.px ? `<label><small>Kích thước (px)</small><input type="number" inputmode="numeric" min="${c.px[0]}" max="${c.px[1]}" step="1" placeholder="${dv}" value="${cu.px || ""}" data-k="${k}" data-in="px"></label><small>Mặc định: ${dv} px</small>` : ""}<button class="b a" data-a="rstimg" data-k="${k}">↺ Dùng mặc định</button></div>`;
  }).join("");
}
function openCrop(f) {
  const k = pendCat;
  if (!f || !k) return;
  const u = URL.createObjectURL(f), im = new Image();
  im.onload = () => startCrop(k, im, u);
  im.onerror = () => {
    URL.revokeObjectURL(u);
    show("cust");
    $("cm").textContent = "Không đọc được file ảnh này.";
  };
  im.src = u;
}
function startCrop(k, im, u) {
  const c = CC[k];
  show("crop");
  $("crt").textContent = "Cắt & thu phóng: " + c.n;
  $("crh").textContent = c.h + " Kéo để di chuyển · cuộn chuột / chụm hai ngón để thu phóng.";
  const bw = $("w").clientWidth, bh = $("w").clientHeight, mw = bw * 0.72, mh = bh * 0.5;
  let w = mw, h = w / c.ar;
  if (h > mh) {
    h = mh;
    w = h * c.ar;
  }
  const dp = Math.min(2, devicePixelRatio || 1), cv2 = $("cc");
  cv2.style.width = w + "px";
  cv2.style.height = h + "px";
  cv2.width = Math.round(w * dp);
  cv2.height = Math.round(h * dp);
  const fw = cv2.width, fh = cv2.height, iw = im.naturalWidth, ih = im.naturalHeight, cover = Math.max(fw / iw, fh / ih), cont = Math.min(fw / iw, fh / ih), smin = c.al ? cont * 0.3 : cover, s = c.al ? cont : cover;
  CS = { k, im, u, fw, fh, s, smin, smax: Math.max(cover * 8, smin * 2), tx: (fw - iw * s) / 2, ty: (fh - ih * s) / 2, al: c.al, pt: /* @__PURE__ */ new Map() };
  drawCS();
}
function endCrop() {
  if (CS) {
    URL.revokeObjectURL(CS.u);
    CS = null;
  }
}
function clampCS() {
  const c = CS, iw = c.im.naturalWidth * c.s, ih = c.im.naturalHeight * c.s;
  if (c.al) {
    c.tx = Math.min(c.fw * 0.85, Math.max(c.fw * 0.15 - iw, c.tx));
    c.ty = Math.min(c.fh * 0.85, Math.max(c.fh * 0.15 - ih, c.ty));
  } else {
    c.tx = Math.min(0, Math.max(c.fw - iw, c.tx));
    c.ty = Math.min(0, Math.max(c.fh - ih, c.ty));
  }
}
function drawCS() {
  const c = CS;
  clampCS();
  const cv2 = $("cc"), g = cv2.getContext("2d");
  g.setTransform(1, 0, 0, 1, 0, 0);
  if (c.al) {
    const q = Math.max(6, Math.round(c.fw / 28));
    for (let j = 0; j * q < c.fh; j++) for (let i = 0; i * q < c.fw; i++) {
      g.fillStyle = (i + j) % 2 ? "#444" : "#2e2e2e";
      g.fillRect(i * q, j * q, q, q);
    }
  } else {
    g.fillStyle = "#000";
    g.fillRect(0, 0, c.fw, c.fh);
  }
  g.imageSmoothingEnabled = true;
  g.imageSmoothingQuality = "high";
  g.drawImage(c.im, c.tx, c.ty, c.im.naturalWidth * c.s, c.im.naturalHeight * c.s);
  g.strokeStyle = "rgba(255,255,255,.3)";
  g.lineWidth = 1;
  g.beginPath();
  for (let i = 1; i < 3; i++) {
    g.moveTo(c.fw * i / 3, 0);
    g.lineTo(c.fw * i / 3, c.fh);
    g.moveTo(0, c.fh * i / 3);
    g.lineTo(c.fw, c.fh * i / 3);
  }
  g.stroke();
  $("zr").value = 100 * Math.log(c.s / c.smin) / Math.log(c.smax / c.smin);
}
function zoomAt(f, px, py) {
  const c = CS, s2 = Math.min(c.smax, Math.max(c.smin, c.s * f)), r = s2 / c.s;
  c.tx = px - (px - c.tx) * r;
  c.ty = py - (py - c.ty) * r;
  c.s = s2;
  drawCS();
}
async function finishCrop() {
  const c = CS;
  if (!c) return;
  const k = c.k, cf = CC[k];
  if (IC[k].length >= 3) {
    endCrop();
    show("cust");
    return;
  }
  const ow = cf.ow, oh = Math.round(ow / cf.ar), oc = document.createElement("canvas");
  oc.width = ow;
  oc.height = oh;
  const g = oc.getContext("2d");
  g.imageSmoothingQuality = "high";
  if (!cf.al) {
    g.fillStyle = "#000";
    g.fillRect(0, 0, ow, oh);
  }
  const q = ow / c.fw;
  g.drawImage(c.im, c.tx * q, c.ty * q, c.im.naturalWidth * c.s * q, c.im.naturalHeight * c.s * q);
  const ty = cf.al ? "image/png" : "image/jpeg", d = oc.toDataURL(ty, 0.88), sc = Math.min(96 / ow, 72 / oh), tc = document.createElement("canvas");
  tc.width = Math.max(1, Math.round(ow * sc));
  tc.height = Math.max(1, Math.round(oh * sc));
  tc.getContext("2d").drawImage(oc, 0, 0, tc.width, tc.height);
  const it = { id: Date.now().toString(36) + Math.floor(rnd() * 1e6).toString(36), cat: k, t: Date.now(), d, th: tc.toDataURL(ty, 0.8) };
  const ok = await idbPut(it);
  endCrop();
  if (!ok) {
    show("cust");
    renderCust();
    $("cm").textContent = "Không đủ bộ nhớ trình duyệt để lưu ảnh này.";
    return;
  }
  IC[k].push(it);
  S.cu[k].sel = it.id;
  save();
  applyCust();
  sfx("buy");
  renderCust();
  $("cm").textContent = "Đã lưu và áp dụng ảnh mới.";
  show("cust");
}
(() => {
  const cv2 = $("cc"), pt = () => CS.pt, pos = (e) => {
    const r = cv2.getBoundingClientRect();
    return { x: (e.clientX - r.left) * cv2.width / r.width, y: (e.clientY - r.top) * cv2.height / r.height };
  };
  cv2.addEventListener("pointerdown", (e) => {
    if (!CS) return;
    cv2.setPointerCapture(e.pointerId);
    pt().set(e.pointerId, pos(e));
  });
  cv2.addEventListener("pointermove", (e) => {
    if (!CS || !pt().has(e.pointerId)) return;
    const o = pt().get(e.pointerId), n = pos(e);
    if (pt().size === 1) {
      CS.tx += n.x - o.x;
      CS.ty += n.y - o.y;
      pt().set(e.pointerId, n);
      drawCS();
    } else {
      const ids = [...pt().keys()], oth = pt().get(ids.find((i) => i !== e.pointerId)), d0 = Math.hypot(o.x - oth.x, o.y - oth.y), d1 = Math.hypot(n.x - oth.x, n.y - oth.y);
      pt().set(e.pointerId, n);
      CS.tx += (n.x - o.x) / 2;
      CS.ty += (n.y - o.y) / 2;
      if (d0 > 8) zoomAt(d1 / d0, (n.x + oth.x) / 2, (n.y + oth.y) / 2);
      else drawCS();
    }
  });
  const up = (e) => {
    if (CS) pt().delete(e.pointerId);
  };
  cv2.addEventListener("pointerup", up);
  cv2.addEventListener("pointercancel", up);
  cv2.addEventListener("wheel", (e) => {
    if (!CS) return;
    e.preventDefault();
    const p = pos(e);
    zoomAt(Math.exp(-e.deltaY * 15e-4), p.x, p.y);
  }, { passive: false });
  $("zr").addEventListener("input", () => {
    if (!CS) return;
    const v = +$("zr").value / 100, s2 = CS.smin * Math.pow(CS.smax / CS.smin, v);
    zoomAt(s2 / CS.s, CS.fw / 2, CS.fh / 2);
  });
})();
document.addEventListener("change", (e) => {
  const t = e.target;
  if (t.id === "fi") {
    const f = t.files && t.files[0];
    if (f) openCrop(f);
    return;
  }
  if (t.dataset && t.dataset.in === "px") {
    const k = t.dataset.k, c = CC[k];
    let v = t.value === "" ? null : Math.round(+t.value);
    if (v !== null && !(v > 0)) v = null;
    if (v !== null) v = Math.min(c.px[1], Math.max(c.px[0], v));
    S.cu[k].px = v;
    save();
    renderCust();
    $("cm").textContent = "";
  }
});

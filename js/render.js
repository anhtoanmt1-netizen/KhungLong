/* ===== Vẽ canvas: nền, quái, khủng long, hiệu ứng và HUD pixel (máu, vàng, số đợt). ===== */
const cv = $("c"), x = cv.getContext("2d");
x.imageSmoothingEnabled = false;
const rc = (c, a, b, w, h) => {
  x.fillStyle = c;
  x.fillRect(Math.round(a), Math.round(b), Math.round(w), Math.round(h));
};
function bmp(rows, pal, cell) {
  const h = rows.length, w = rows[0].length, c = document.createElement("canvas");
  c.width = (w + 2) * cell;
  c.height = (h + 2) * cell;
  const g = c.getContext("2d"), fl = (i, j) => i >= 0 && j >= 0 && i < w && j < h && rows[j][i] !== ".";
  for (let j = -1; j <= h; j++) for (let i = -1; i <= w; i++) {
    let col = null;
    if (fl(i, j)) col = pal[rows[j][i]];
    else for (let dj = -1; dj <= 1 && !col; dj++) for (let di = -1; di <= 1; di++) if (fl(i + di, j + dj)) {
      col = "#101010";
      break;
    }
    if (col) {
      g.fillStyle = col;
      g.fillRect((i + 1) * cell, (j + 1) * cell, cell, cell);
    }
  }
  return c;
}
const HR = [".aa...aa.", "asaa.aaaa", "asaaaaaab", "aaaaaaaab", ".aaaaaab.", "..aaaab..", "...aab...", "....a...."], HC = {
  he: bmp(HR, { a: "#fff", b: "#e2e2e2", s: "#fff" }, 3),
  hf: bmp(HR, { a: "#ff3b3b", b: "#c9141f", s: "#ffd0d0" }, 3),
  hp: bmp(HR, { a: "#ffb3b3", b: "#ff8f8f", s: "#ffe0e0" }, 3),
  coin: bmp(["..aaaa..", ".abbbba.", "abbbccba", "abbbccba", "abbbccba", "abbbccba", ".abbbba.", "..aaaa.."], { a: "#d98c00", b: "#ffd23a", c: "#fff3a0" }, 3),
  tomb: bmp(["..aaaaa..", ".abbbbba.", "abbbcbbba", "abbcccbba", "abbbcbbba", "abbbcbbba", "abbbbbbba", "abbbbbbba", "aaaaaaaaa"], { a: "#5b6470", b: "#aab2bd", c: "#454b54" }, 3)
};
const ic = (c, X, Y) => x.drawImage(c, X, Y, c.width / 2, c.height / 2), pr = (a, b, w, h, c) => {
  x.fillStyle = c;
  x.fillRect(a + 1, b, w - 2, h);
  x.fillRect(a, b + 1, w, h - 2);
}, p2 = (n) => String(Math.max(0, n)).padStart(2, "0");
function tw(t, X, Y, c, sz, al) {
  x.font = "bold " + sz + "px Montserrat,sans-serif";
  x.textAlign = al || "left";
  x.lineJoin = "round";
  x.lineWidth = sz > 9 ? 2.2 : 1.6;
  x.strokeStyle = "#000";
  x.strokeText(t, X, Y);
  x.fillStyle = c;
  x.fillText(t, X, Y);
  return x.measureText(t).width;
}
function panel(X, Y, w, h) {
  pr(X, Y, w, h, "#000");
  pr(X + 1, Y + 1, w - 2, h - 2, "#c8c8c8");
  pr(X + 2, Y + 2, w - 4, h - 4, "#000");
}
function hudc() {
  const r = R;
  if (!r) return;
  x.setTransform(2, 0, 0, 2, 0, 0);
  x.globalAlpha = 1;
  x.imageSmoothingEnabled = false;
  x.textBaseline = "alphabetic";
  const mx = sv().maxHp, N = 8;
  if (r.hp < r.ph - 0.01) r.tl = 0.35;
  r.ph = r.hp;
  r.dr = r.hp < r.dr ? r.hp : r.dr + (r.hp - r.dr) * Math.min(1, FD * 10);
  if (r.tl > 0) r.tl -= FD;
  else if (r.th > r.hp) r.th = Math.max(r.hp, r.th - mx * 0.9 * FD);
  if (r.th < r.hp) r.th = r.hp;
  const X0 = 6, Y0 = 5;
  panel(X0, Y0, 80, 26);
  x.imageSmoothingEnabled = true;
  x.drawImage(IM[0], 46, 0, 32, 24, X0 + 4, Y0 + 4, 24, 18);
  x.imageSmoothingEnabled = false;
  tw("DINO", X0 + 32, Y0 + 13, "#ff4a4a", 9);
  tw("☠ " + String(r.kills).padStart(5, "0"), X0 + 32, Y0 + 23, "#fff", 8);
  let cx = X0 + 86;
  ic(HC.coin, cx, Y0 + 5.5);
  cx += 18;
  cx += tw("×" + fmtN(S.gold), cx, Y0 + 17, "#ffd23a", 11) + 8;
  ic(HC.tomb, cx, Y0 + 4.5);
  cx += 19;
  cx += tw("×" + p2(S.st.deaths), cx, Y0 + 17, "#fff", 11) + 8;
  panel(cx, Y0, 32, 26);
  tw("ĐỢT", cx + 16, Y0 + 11, "#ff4a4a", 7, "center");
  tw(p2(r.wave - 1), cx + 16, Y0 + 22, "#fff", 11, "center");
  const BX = X0, BY = Y0 + 31, hw = 16.5, gp = 2, BW = Math.round(N * hw + (N - 1) * gp + 16), BH = 27;
  let ox = 0, oy = 0;
  if (r.hitT > 0.12 && !S.set.rm) {
    ox = Math.round((rnd() - 0.5) * 3);
    oy = Math.round((rnd() - 0.5) * 3);
  }
  pr(BX + ox, BY + oy, BW, BH, "#000");
  pr(BX + ox + 1, BY + oy + 1, BW - 2, BH - 2, "#e53b3b");
  pr(BX + ox + 3, BY + oy + 3, BW - 6, BH - 6, "#fff");
  for (let i = 0; i < N; i++) {
    const hx = Math.round((BX + ox + (BW - (N * hw + (N - 1) * gp)) / 2 + i * (hw + gp)) * 2) / 2, hy = Math.round((BY + oy + (BH - 15) / 2) * 2) / 2;
    ic(HC.he, hx, hy);
    for (const [im, v] of [[HC.hp, r.th], [HC.hf, r.dr]]) {
      const f = Math.min(1, Math.max(0, v / mx * N - i));
      if (f <= 0) continue;
      const cw = Math.round(f * 11) * 1.5;
      if (cw <= 0) continue;
      x.save();
      x.beginPath();
      x.rect(hx, hy, cw, 15);
      x.clip();
      ic(im, hx, hy);
      x.restore();
    }
  }
  tw("HP " + Math.ceil(r.hp) + "/" + mx, BX + 2, BY + BH + 9, "#fff", 8);
  tw("⏱ " + fmt(r.t), BX + BW - 2, BY + BH + 9, "#fff", 8, "right");
}
function bg() {
  x.imageSmoothingEnabled = true;
  x.imageSmoothingQuality = "high";
  if (ld(AS.bg)) x.drawImage(AS.bg, 0, 0, W, H);
  else {
    rc("#8fd0ff", 0, 0, W, GY);
  }
  if (ld(AS.tr)) {
    const r0 = AS.tr.naturalWidth / AS.tr.naturalHeight, TH = csz("tree");
    const gT = Math.max(8, Math.round(csz("grass"))), gTop = Math.round(GY + 4 - 0.135 * gT), gB = 0.135 * gT;
    for (const [n, sp, spd, h, base, al] of [[9, 96, 16, TH * 118 / 172, gTop + gB * 0.2, 0.92], [5, 215, 42, TH, gTop + gB * 0.9, 1]]) {
      x.globalAlpha = al;
      const w = h * r0;
      for (let i = 0; i < n; i++) {
        const L = n * sp, px = ((i * sp + TO[i % 9] * sp * 0.5 - BT * spd) % L + L) % L - 90, s = TS[i % 9];
        x.save();
        x.translate(Math.round(px), Math.round(base + h * s * TRB));
        if (i % 2) x.scale(-1, 1);
        x.drawImage(AS.tr, -w * s / 2, -h * s, w * s, h * s);
        x.restore();
      }
    }
    x.globalAlpha = 1;
  }
  {
    const T = Math.max(8, Math.round(csz("grass"))), top = Math.round(GY + 4 - 0.135 * T);
    if (ld(AS.gr)) {
      x.fillStyle = GRC;
      x.fillRect(0, top + T - 1, W, H - top - T + 2);
      const off = Math.floor(BT * 120 % T);
      for (let px = -off; px < W; px += T) x.drawImage(AS.gr, px, top, T + 1, T);
    } else {
      rc("#4cae45", 0, GY, W, 8);
      rc("#7a5230", 0, GY + 8, W, H - GY - 8);
    }
  }
}
function blob(cx, gy, w, h, c, o) {
  for (let j = 0; j < h; j++) {
    const t = (h - j - 0.5) / h, hw = Math.round(w / 2 * Math.sqrt(1 - t * t)) + o;
    rc(c, cx - hw, gy - h + j, hw * 2, 1);
  }
}
const ell = (X, Y, a, b, c) => {
  a = Math.round(a);
  b = Math.round(b);
  for (let j = -b; j <= b; j++) {
    const q = Math.round(a * Math.sqrt(Math.max(0, 1 - j * j / (b * b))));
    rc(c, X - q, Y + j, q * 2, 1);
  }
}, oe = (X, Y, a, b, c) => {
  ell(X, Y, a + 1, b + 1, "#1b1b2b");
  ell(X, Y, a, b, c);
}, eye = (X, Y) => {
  rc("#fff", X, Y, 3, 3);
  rc("#1b1b2b", X, Y + 1, 2, 2);
};
function mon(m) {
  const k = m.k, w = m.w, h = m.h, cx = Math.round(m.x), by = Math.round(GY - m.z), f = Math.sin(CT * (k === "bee" ? 40 : k === "bat" ? 18 : 12) + m.ph), c = m.fl > 0 ? "#fff" : SL[m.ti][1], D = "#1b1b2b", cy = by - Math.round(h / 2), a = Math.round(f * 6);
  rc("rgba(0,0,0,.25)", cx - w / 3, GY + 1, w * 2 / 3, 2);
  if (k === "bat") {
    for (const s of [-1, 1]) for (let i = 0; i < 11; i++) rc("#6a30a8", cx + s * (5 + i), cy - 2 - a * i / 10 + i * 0.35, 1, 5 - i * 0.35);
    oe(cx, cy, 6, 6, c);
    rc(D, cx - 5, cy - 9, 2, 3);
    rc(D, cx + 3, cy - 9, 2, 3);
    eye(cx - 4, cy - 2);
    eye(cx + 1, cy - 2);
    rc("#fff", cx - 3, cy + 3, 1, 2);
    rc("#fff", cx + 2, cy + 3, 1, 2);
  } else if (k === "bee") {
    ell(cx - 2, cy - 6 - f * 2, 4, 2, "rgba(255,255,255,.85)");
    ell(cx + 3, cy - 6 + f * 2, 4, 2, "rgba(255,255,255,.85)");
    oe(cx, cy, 7, 5, c);
    rc(D, cx - 1, cy - 4, 2, 9);
    rc(D, cx + 3, cy - 3, 2, 7);
    eye(cx - 6, cy - 2);
    rc(D, cx + 7, cy, 3, 2);
    rc(D, cx - 7, cy - 7, 1, 3);
  } else if (k === "ghost") {
    x.globalAlpha = 0.88;
    blob(cx, by, w, h, "#7a8ad0", 1);
    blob(cx, by, w, h, c, 0);
    for (let i = 0; i < 4; i++) rc(c, cx - w / 2 + i * w / 4 + 1, by, w / 4 - 1, 2 + (i + Math.floor(CT * 6)) % 2 * 2);
    rc(c, cx - w / 2 - 3, cy + 1 + a / 3, 3, 3);
    rc(c, cx + w / 2, cy + 1 - a / 3, 3, 3);
    rc(D, cx - 6, cy - 4, 3, 5);
    rc(D, cx + 3, cy - 4, 3, 5);
    rc("rgba(255,110,150,.9)", cx - 9, cy + 2, 3, 2);
    rc("rgba(255,110,150,.9)", cx + 6, cy + 2, 3, 2);
    rc(D, cx - 1, cy + 3, 3, 2);
    x.globalAlpha = 1;
  } else if (k === "bird") {
    oe(cx + 1, cy + 1, 12, 8, c);
    oe(cx - 10, cy - 5, 6, 5, "#ff5a2a");
    rc("#ffd23a", cx - 19, cy - 5, 5, 3);
    eye(cx - 12, cy - 8);
    rc("#ffd23a", cx - 11, cy - 12, 2, 4);
    rc("#ff3a2a", cx - 8, cy - 12, 2, 3);
    oe(cx + 2, cy - 3 - a, 8, 4, "#d02a1a");
    ["#ffd23a", "#ff8a3a", "#ff3a2a"].forEach((q, i) => rc(q, cx + 13 + i * 3, cy - 1 + (i + (f > 0 ? 1 : 0)) % 2 * 2, 4 - i, 3));
  } else if (k === "shroom") {
    rc(D, cx - 7, by - 10, 14, 10);
    rc("#f4e6c8", cx - 6, by - 10, 12, 9);
    blob(cx, by - 7, w, 13, D, 1);
    blob(cx, by - 7, w, 13, c, 0);
    rc("#fff", cx - 8, by - 16, 4, 3);
    rc("#fff", cx + 3, by - 18, 4, 3);
    rc("#fff", cx - 1, by - 12, 3, 2);
    rc(D, cx - 4, by - 6, 2, 3);
    rc(D, cx + 2, by - 6, 2, 3);
    rc(D, cx - 5, by - 8, 4, 1);
    rc(D, cx + 1, by - 8, 4, 1);
    rc(D, cx - 6 + Math.round(f), by - 1, 4, 2);
    rc(D, cx + 3 - Math.round(f), by - 1, 4, 2);
  } else if (k === "hog") {
    for (let i = 0; i < 7; i++) {
      const q = 5 + (i + Math.floor(CT * 8)) % 3;
      rc(D, cx - 8 + i * 3, by - 9 - q, 2, q);
    }
    blob(cx, by, w, 10, D, 1);
    blob(cx, by, w, 10, c, 0);
    blob(cx - 8, by, 8, 7, "#f0d0a0", 0);
    rc("#ff7a9a", cx - 13, by - 5, 2, 2);
    rc(D, cx - 9, by - 7, 2, 2);
    rc(D, cx - 6 + Math.round(f * 2), by, 3, 2);
    rc(D, cx + 3 - Math.round(f * 2), by, 3, 2);
  } else if (k === "beetle") {
    for (let i = 0; i < 3; i++) rc(D, cx - 10 + i * 9, by - 3, 2, 4 + Math.round(Math.sin(CT * 10 + i * 2)));
    blob(cx, by - 3, w, 18, D, 1);
    blob(cx, by - 3, w, 18, c, 0);
    rc(D, cx, by - 20, 1, 17);
    rc("rgba(255,255,255,.5)", cx - 9, by - 17, 4, 2);
    rc("rgba(255,255,255,.5)", cx + 5, by - 15, 3, 2);
    rc(D, cx - w / 2 - 4, by - 14, 6, 4);
    rc("#f0e0b0", cx - w / 2 - 3, by - 13, 5, 2);
    rc("#ffe040", cx - w / 2 + 3, by - 12, 4, 4);
    rc(D, cx - w / 2 + 4, by - 11, 2, 3);
  } else if (k === "dragon") {
    oe(cx + 8, cy - 8 - a * 1.3, 14, 7, "#8a1a3a");
    oe(cx + 16, cy - 4 - a, 9, 5, "#a02a4a");
    oe(cx + 20, cy + 4, 7, 3, c);
    rc("#ffd23a", cx + 26, cy + 1, 3, 6);
    oe(cx, cy, 18, 11, c);
    ell(cx, cy + 6, 13, 4, "#ffd080");
    oe(cx - 17, cy - 6, 9, 7, c);
    oe(cx - 25, cy - 4, 4, 3, c);
    rc(D, cx - 20, cy - 17, 2, 5);
    rc(D, cx - 13, cy - 16, 2, 5);
    rc("#f0e0b0", cx - 20, cy - 16, 1, 4);
    rc("#ffd23a", cx - 20, cy - 9, 4, 4);
    rc(D, cx - 19, cy - 8, 2, 3);
    rc(D, cx - 6, cy + 10, 3, 4);
    rc(D, cx + 4, cy + 10, 3, 4);
    if (f > 0) {
      rc("#ffd23a", cx - 32, cy - 5, 3, 2);
      rc("#ff7a2a", cx - 35, cy - 5, 3, 2);
    }
  }
  if (m.hp < m.mx) {
    const yy = cy - Math.round(h / 2) - 8;
    rc("#400", cx - w / 2, yy, w, 2);
    rc("#4f4", cx - w / 2, yy, w * m.hp / m.mx, 2);
  }
}
function slime(m) {
  if (m.k) return mon(m);
  const d = SL[m.ti], s = Math.sin(CT * 8 + m.ph), w = m.w * (1 + 0.1 * s), h = m.h * (1 - 0.1 * s), gy = Math.round(GY - Math.max(0, Math.sin(CT * 5 + m.ph)) * (m.x > front() + m.w / 2 + 12 ? 4 : 0)), cx = Math.round(m.x), hh = Math.round(h), c = m.fl > 0 ? "#fff" : d[1];
  rc("rgba(0,0,0,.3)", cx - m.w / 2, GY + 1, m.w, 2);
  blob(cx, gy, Math.round(w), hh, "#1b1b2b", 1);
  blob(cx, gy, Math.round(w), hh, c, 0);
  rc("#1b1b2b", cx - w * 0.25 - 1, gy - h * 0.5, 2, 3);
  rc("#1b1b2b", cx + w * 0.12, gy - h * 0.5, 2, 3);
  rc("rgba(255,255,255,.55)", cx - w * 0.3, gy - h * 0.8, 3, 2);
  if (m.ti === 7) rc("#ffd23a", cx - 6, gy - h - 3, 12, 3);
  if (m.hp < m.mx) {
    rc("#400", cx - w / 2, gy - h - 6, w, 2);
    rc("#4f4", cx - w / 2, gy - h - 6, w * m.hp / m.mx, 2);
  }
}
function dino() {
  if (R && !R.al && DI.complete && DI.naturalWidth) {
    const f = R.dT < 0.25 ? 0 : R.dT < 0.55 ? 1 : R.dT < 0.9 ? 2 : 3;
    x.imageSmoothingEnabled = false;
    x.drawImage(DI, f * 96, 0, 96, 70, DX - 48, GY + 4 - 70, 96, 70);
    return;
  }
  const r = R, al = !r || r.al, im = IM[r && (r.atk > 0 || r.kick > 0) && al ? 4 : al ? Math.floor(CT * 8) % 4 : 0];
  if (!im.complete || !im.width) return;
  const iw = im.width, ih = im.height, px = Math.round(DX - iw / 2), py = GY + 4 - ih;
  x.save();
  if (r && !r.al) {
    x.translate(DX - 10, GY);
    x.rotate(-Math.min(1.4, r.dT * 2.5));
    x.translate(-(DX - 10), -GY);
    x.globalAlpha = Math.max(0, 1 - r.dT / 1.2);
  } else if (r && r.inv > 0 && Math.floor(CT * 20) % 2) x.globalAlpha = 0.45;
  const kk = r && r.kick > 0 && al ? Math.sin(Math.PI * Math.max(0, 1 - r.kick / 0.3)) : 0;
  if (kk) {
    x.translate(Math.round(kk * 6), 0);
    x.translate(DX, GY + 4);
    x.rotate(-0.12 * kk);
    x.translate(-DX, -GY - 4);
  }
  x.imageSmoothingEnabled = false;
  x.drawImage(im, px, py);
  x.restore();
  if (al && S.evo > 0 && !S.set.rm) for (let i = 0; i < S.evo; i++) {
    const a = CT * 2 + i * 6.28 / S.evo;
    rc(EVO[S.evo][3], DX + Math.cos(a) * 26, GY - 32 + Math.sin(a) * 14, 3, 3);
  }
  if (r && r.sh > 0 && al) {
    const A = atl("g"), wx = DX + iw * 0.42, fa = Math.min(1, r.sh / 0.5);
    for (let i = 0; i < 5; i++) {
      const fi = 14 + (Math.floor(CT * 14) + i * 2) % 4, wy = GY - 4 - i * 15, ww = Math.sin(CT * 9 + i) * 1.5;
      x.save();
      fdraw(A, fi, wx + ww, wy, 40, 0.5, 0.5, 0, fa);
      x.globalCompositeOperation = "lighter";
      fdraw(A, fi, wx + ww, wy, 48, 0.5, 0.5, 0, 0.3 * fa);
      x.restore();
    }
  }
  if (r && r.buf > 0 && r.al) {
    x.save();
    x.globalCompositeOperation = "lighter";
    const gg = x.createRadialGradient(DX, GY - 30, 4, DX, GY - 30, 48);
    gg.addColorStop(0, "rgba(255,70,20,.4)");
    gg.addColorStop(1, "rgba(255,70,20,0)");
    x.fillStyle = gg;
    x.fillRect(DX - 52, GY - 82, 104, 104);
    x.restore();
  }
}
function draw() {
  x.setTransform(2, 0, 0, 2, 0, 0);
  x.clearRect(0, 0, W, H);
  if (R && R.hitT > 0.18 && !S.set.rm) x.translate(Math.round((rnd() - 0.5) * 4), Math.round((rnd() - 0.5) * 4));
  bg();
  chests();
  if (R) for (const m of R.mon) slime(m);
  dino();
  if (R) {
    for (const l of R.lv) {
      if (CB() && LF[S.evo]) {
        const c = LF[S.evo];
        x.save();
        x.translate(Math.round(l.x * 2) / 2, Math.round(l.y * 2) / 2);
        x.rotate(l.rot || 0);
        const lw = S.cu.leaf.px > 0 ? S.cu.leaf.px : 16, lh = lw * c.height / c.width;
        x.drawImage(c, -lw / 2, -lh / 2, lw, lh);
        x.restore();
      } else fbullet(l);
    }
    drawEx();
    for (const f of R.fx) {
      x.globalAlpha = Math.min(1, f.l * 3);
      rc(f.c, f.x, f.y, f.s, f.s);
    }
    x.globalAlpha = 1;
    x.textAlign = "center";
    x.lineWidth = 2;
    x.strokeStyle = "#000";
    x.lineJoin = "round";
    for (const t of R.tx) {
      const tX = Math.min(W - 45, Math.max(45, t.x));
      x.font = "bold " + (t.z || 11) + "px Montserrat,sans-serif";
      x.globalAlpha = Math.min(1, t.l * 2);
      x.strokeText(t.s, tX, t.y);
      x.fillStyle = t.c;
      x.fillText(t.s, tX, t.y);
    }
    x.globalAlpha = 1;
  }
  hudc();
}

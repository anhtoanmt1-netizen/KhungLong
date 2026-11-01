/* ===== Đạn lửa dùng atlas assets1/fx/fire.png (6×4 ô 160px), vụ nổ, bộ lọc màu theo bậc tiến hóa. ===== */
const FI = new Image();
FI.src = "assets1/fx/fire.png";
const FC = {}, FLY = [6, 10, 11, 12, 11, 10], CB = () => S.mod.on && !!S.cu.leaf.sel && ld(AS.lf), evc = () => S.evo ? EVO[S.evo][3] : null;
const FXT = { p: ["hue-rotate(185deg) saturate(1.4)", "#7fd0ff", 0.7], a: ["hue-rotate(-22deg) saturate(1.8) brightness(.9)", "#ff2010", 0.55], s: [null, "#ffd23a", 0.45], g: ["hue-rotate(12deg) brightness(1.15)", "#ffd23a", 0.35] };
function atl(k) {
  if (!ld(FI)) return null;
  const kk = k || "n";
  if (FC[kk]) return FC[kk];
  const c = document.createElement("canvas");
  c.width = 960;
  c.height = 640;
  const g = c.getContext("2d"), t = FXT[k];
  if (t && t[0] && "filter" in g) {
    g.filter = t[0];
    g.drawImage(FI, 0, 0);
    g.filter = "none";
  } else {
    g.drawImage(FI, 0, 0);
    if (k) {
      g.globalCompositeOperation = "source-atop";
      g.globalAlpha = t ? t[2] : 0.5;
      g.fillStyle = t ? t[1] : k;
      g.fillRect(0, 0, 960, 640);
    }
  }
  return FC[kk] = c;
}
function fdraw(a, i, X, Y, D, ax, ay, rot, al) {
  if (!a) return;
  x.save();
  x.globalAlpha = al;
  x.translate(X, Y);
  if (rot) x.rotate(rot);
  x.imageSmoothingEnabled = true;
  x.imageSmoothingQuality = "high";
  x.drawImage(a, i % 6 * 160, (i / 6 | 0) * 160, 160, 160, -D * ax, -D * ay, D, D);
  x.restore();
}
const fcol = (l) => l.k === "a" ? "a" : l.k === "s" ? "s" : l.pc ? "p" : evc();
function fbullet(l) {
  const ag = l.ag || 0, A = atl(fcol(l));
  if (!A) return;
  const fi = ag < 0.2 ? Math.min(6, Math.floor(ag / 0.2 * 7)) : FLY[Math.floor(ag * 18) % FLY.length], D = csz("leaf") * (l.k === "s" ? 0.8 : l.k === "a" ? 1.3 : 1) * Math.min(1, 0.45 + ag * 4);
  x.save();
  x.translate(Math.round(l.x * 2) / 2, Math.round(l.y * 2) / 2);
  x.rotate(l.a);
  if (l.pc) x.scale(1.35, 0.8);
  fdraw(A, fi, 0, 0, D, 0.72, 0.5, 0, 1);
  x.globalCompositeOperation = "lighter";
  fdraw(A, fi, 0, 0, D * 1.2, 0.72, 0.5, 0, 0.35);
  x.restore();
}
function explode(l, m) {
  const r = R;
  sfx(S.sk.boom ? "boomf" : "hit");
  if (r.ex.length > 40) return;
  const bg = S.sk.boom && !l.pc;
  r.ex.push({ x: l.x + 2, y: l.y, t: 0, sc: l.pc ? 0.5 : bg ? 1.15 : 0.8, col: fcol(l), ring: bg ? "#ff9a3a" : null, rr: 26 });
  for (let i = 0; i < (S.set.rm ? 3 : 7); i++) r.fx.push({ x: l.x, y: l.y, vx: (rnd() - 0.3) * 110, vy: (rnd() - 0.5) * 110, g: 30, l: 0.35 + rnd() * 0.3, c: i % 2 ? "#ffd23a" : "#ff7a1a", s: rnd() < 0.3 ? 2 : 1 });
}
function drawEx() {
  for (const e of R.ex) {
    const A = atl(e.col), fi = 13 + Math.min(10, Math.floor(e.t / 0.034)), D = 56 * e.sc;
    x.save();
    fdraw(A, fi, e.x, e.y, D, 0.5, 0.5, 0, 1);
    x.globalCompositeOperation = "lighter";
    fdraw(A, fi, e.x, e.y, D * 1.2, 0.5, 0.5, 0, 0.3);
    if (e.t < 0.08) {
      x.globalAlpha = 1 - e.t / 0.08;
      x.fillStyle = "#fff6c0";
      x.beginPath();
      x.arc(e.x, e.y, D * 0.18, 0, 6.3);
      x.fill();
    }
    if (e.ring) {
      const p = Math.min(1, e.t / 0.34);
      x.globalAlpha = 1 - p;
      x.strokeStyle = e.ring;
      x.lineWidth = 2;
      x.beginPath();
      x.arc(e.x, e.y, 4 + p * (e.rr || 26), 0, 6.3);
      x.stroke();
    }
    x.restore();
  }
}

/* ===== Rương kho báu: xuất hiện, chạy tới, chạm để mở, thưởng vàng. ===== */
function chestRoll() {
  const w = R.wave, p = w <= CFG.chestW ? CFG.chestP : Math.max(CFG.chestMin, CFG.chestP - (w - CFG.chestW) * CFG.chestDec);
  if (rnd() < p) R.cq.push(1 + rnd() * 9);
}
function chestUpd(dt) {
  const r = R;
  for (let i = r.cq.length - 1; i >= 0; i--) {
    if ((r.cq[i] -= dt) <= 0) {
      r.cq.splice(i, 1);
      const t = Math.floor(rnd() * 7), im = CHI[t], h = CFG.chestH, w = ld(im) ? Math.round(h * im.naturalWidth / im.naturalHeight) : 18;
      sfx("chest");
      r.ch.push({ t, x: W + w, z: 0, vz: 0, vx: 0, st: 0, rot: 0, w, h, a: 1, ph: rnd() * 6 });
    }
  }
  for (const c of r.ch) {
    if (c.st === 0) {
      c.x -= CFG.chestSpd * dt;
      if (c.x - c.w / 2 <= front() + 10) {
        c.st = 2;
        sfx("miss");
        for (let i = 0; i < 5; i++) r.fx.push({ x: c.x, y: GY - 6, vx: (rnd() - 0.5) * 40, vy: -rnd() * 30, l: 0.4, c: "#bbb", s: 2 });
        r.tx.push({ x: c.x + 10, y: GY - 24, s: "BỎ LỠ", c: "#ccc", l: 0.9 });
      }
    } else if (c.st === 2) {
      c.a -= dt * 2.5;
      c.x -= CFG.chestSpd * dt * 0.3;
      if (c.a <= 0) c.dead = 1;
    } else {
      c.z += c.vz * dt;
      c.vz -= 520 * dt;
      c.rot += dt * 9;
      if (c.vz <= 0) {
        c.dead = 1;
        chestPop(c);
      }
    }
  }
  r.ch = r.ch.filter((c) => !c.dead);
}
function chestPop(c) {
  const r = R, o = CHR[Math.floor(rnd() * CHR.length)], g = o.g || Math.round(S.gold * (o.x - 1));
  S.gold = Math.min(1e12, S.gold + g);
  r.gold += g;
  dirty = 1;
  const bx = c.x, by = GY + 5 - c.z - c.h / 2, n = S.set.rm ? 8 : 24;
  for (let i = 0; i < n; i++) r.fx.push({ x: bx, y: by, vx: (rnd() - 0.5) * 150, vy: -rnd() * 110 - 20, l: 0.9, c: i % 3 ? "#ffd23a" : "#fff6b0", s: i % 4 ? 2 : 3 });
  r.fx.push({ x: bx, y: by - 4, vx: 0, vy: 0, l: 0.25, c: "#fff", s: 14 });
  r.tx.push({ x: bx, y: by - 14, s: o.x ? g ? "x2 VÀNG! +" + fmtN(g) : "x2 VÀNG!" : "+" + fmtN(g), c: o.x ? "#ff9aff" : "#ffd23a", l: 1.6, z: 15 });
  sfx("open");
}
function chests() {
  if (!R) return;
  for (const c of R.ch) {
    const im = CHI[c.t];
    if (!ld(im)) continue;
    x.save();
    x.imageSmoothingEnabled = true;
    x.imageSmoothingQuality = "high";
    x.globalAlpha = Math.max(0, c.a);
    const k = Math.max(0.4, 1 - c.z / 90), by = Math.sin(CT * 6 + c.ph);
    if (c.st === 0) {
      x.globalAlpha = 0.2 + 0.2 * (0.5 + 0.5 * Math.sin(CT * 6));
      x.fillStyle = "#ffe680";
      x.beginPath();
      x.arc(c.x, GY + 5 - c.h / 2, c.h * 0.9, 0, 6.3);
      x.fill();
      x.globalAlpha = 1;
      tw("CHẠM!", c.x, GY - c.h - 6 + by * 2, "#ffd23a", 7, "center");
    }
    rc("rgba(0,0,0,.3)", c.x - c.w * k / 2 + 1, GY + 5, c.w * k - 2, 2);
    x.translate(Math.round(c.x), Math.round(GY + 5 - c.z - c.h / 2 - (c.st === 0 ? Math.abs(by) * 2 : 0)));
    x.rotate(c.rot);
    x.drawImage(im, -c.w / 2, -c.h / 2, c.w, c.h);
    x.restore();
  }
}

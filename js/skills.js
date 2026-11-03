/* ===== Kỹ năng & hiệu ứng v2.1 =====
   Chí mạng (hiệu ứng tia sáng) · Hút máu có trần · Thiêu đốt (DoT) · Choáng · Phá Huyết (% máu) · Cuồng Phong Hộ Thân.
   Phần logic gọi từ game.js (hit / upd); phần vẽ gọi từ render.js (draw). Thông số theo cấp nằm ở SKV trong config.js. ===== */

const fxOk = () => R.fx.length < 380;
const monY = (m) => GY - (m.z || 0);
/* Boss đang có "Hố Đen" chỉ nhận một nửa sát thương */
const mdm = (m) => (m.shd > 0 ? 1 - BSK.hole.red : 1);

/* Hút máu: heal = sát thương × %, nhưng mỗi giây chỉ hồi tối đa s.stealCap (tránh bất tử khi sát thương rất lớn) */
function heal(a, s) {
  if (s.steal <= 0) return;
  const r = R, h = Math.min(a * s.steal, Math.max(0, s.stealCap - r.sbU));
  if (h <= 0) return;
  r.sbU += h;
  r.hp = Math.min(s.maxHp, r.hp + h);
}

/* Chí mạng: tia sáng vàng + vòng sáng nhỏ quanh quái */
function critFx(m) {
  const cy = monY(m) - m.h / 2, n = S.set.rm ? 4 : 12;
  for (let i = 0; i < n && fxOk(); i++) {
    const a = rnd() * 6.283, v = 50 + rnd() * 100;
    R.fx.push({ x: m.x, y: cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: 0, l: 0.3 + rnd() * 0.25, c: i % 2 ? "#ffd23a" : "#fff6b0", s: i % 3 ? 2 : 3 });
  }
  if (R.ex.length < 40) R.ex.push({ x: m.x, y: cy, t: 0, sc: 0.65, col: "g", ring: "#ffd23a", rr: 22 });
}

/* Thiêu đốt: mỗi đòn đánh cộng thêm "bể lửa" = sát thương × %; bể cháy dần (suy giảm theo hàm mũ, hằng số CFG.burnTau).
   Tổng sát thương lửa = % × sát thương gốc, nhưng trải ra vài giây. */
function addBurn(m, d, s) {
  m.bp += d * s.burn;
  m.bn = CFG.burnT;
}
function burnTick(m, dt, s) {
  if (!(m.bp > 0.5)) { m.bp = 0; return; }
  if ((m.bn -= dt) <= 0) { m.bp = 0; m.ba = 0; return; }
  const dd = m.bp * Math.min(1, dt / CFG.burnTau) * mdm(m);
  m.bp -= dd;
  m.hp -= dd;
  m.ba += dd;
  R.dmgT += dd;
  if ((m.bt -= dt) <= 0) {
    m.bt = 0.5;
    if (m.ba >= 1 && R.tx.length < 24) R.tx.push({ x: m.x + (rnd() - 0.5) * 10, y: monY(m) - m.h - 4, s: "-" + fmtN(Math.round(m.ba)), c: "#ff8a2a", l: 0.6, z: 8 });
    m.ba = 0;
  }
  if ((m.bf -= dt) <= 0 && fxOk()) {
    m.bf = S.set.rm ? 0.2 : 0.06;
    const q = rnd();
    R.fx.push({ x: m.x + (rnd() - 0.5) * m.w * 0.7, y: monY(m) - rnd() * m.h, vx: (rnd() - 0.5) * 14, vy: -26 - rnd() * 34, g: -50, l: 0.3 + rnd() * 0.3, c: q < 0.4 ? "#ff5a1a" : q < 0.75 ? "#ff9a2a" : "#ffd23a", s: rnd() < 0.3 ? 2 : 1 });
  }
}

/* Choáng: quái đứng yên, không tấn công trong m.st giây; sau đó miễn nhiễm một lúc (Boss choáng ngắn, miễn nhiễm lâu) */
function stunMon(m, s) {
  const b = m.k === "boss", d = s.stunT * (b ? CFG.bossStunK : 1);
  m.st = Math.max(m.st, d);
  m.si = d + (b ? CFG.bossImm : CFG.stunImm);
  sfx("stun");
  if (R.tx.length < 24) R.tx.push({ x: m.x, y: monY(m) - m.h - 14, s: "CHOÁNG", c: "#9ad8ff", l: 0.7, z: 8 });
  for (let i = 0; i < 5 && fxOk(); i++) R.fx.push({ x: m.x + (rnd() - 0.5) * m.w * 0.5, y: monY(m) - m.h - 4, vx: (rnd() - 0.5) * 50, vy: -20 - rnd() * 30, g: 60, l: 0.4, c: i % 2 ? "#ffe14a" : "#fff", s: 2 });
}

/* Phá Huyết: cơ hội gây thêm sát thương bằng % máu tối đa của quái (Boss chỉ 0,5%). Mỗi quái có thời gian chờ nhỏ giữa 2 lần kích hoạt. */
function execProc(m, s) {
  if (m.xc > 0 || m.dead) return;
  const e = SKV.exec(S.sk.exec);
  if (rnd() >= e.p) return;
  m.xc = CFG.execIcd;
  const d = Math.max(1, Math.round(m.mx * (m.k === "boss" ? e.pb : e.pn) * mdm(m))), a = Math.min(d, m.hp);
  m.hp -= d;
  m.fl = 0.08;
  R.dmgT += a;
  heal(a, s);
  if (R.tx.length < 24) R.tx.push({ x: m.x, y: monY(m) - m.h - 20, s: "PHÁ HUYẾT -" + fmtN(d), c: "#ff4a6a", l: 0.9, z: 10 });
  const cy = monY(m) - m.h / 2;
  for (let i = 0; i < (S.set.rm ? 4 : 12) && fxOk(); i++) R.fx.push({ x: m.x, y: cy, vx: (rnd() - 0.5) * 110, vy: -rnd() * 90 - 10, l: 0.5 + rnd() * 0.3, c: i % 3 ? "#e0203a" : "#ff8aa0", s: rnd() < 0.4 ? 3 : 2 });
  if (R.ex.length < 40) R.ex.push({ x: m.x, y: cy, t: 0, sc: 0.6, col: "a", ring: "#ff4a6a", rr: 18 });
  sfx("exec");
  if (m.hp <= 0) kill(m, s);
}

/* Cuồng Phong Hộ Thân: khi ≥ need quái áp sát (Boss tính 2) thì tạo lốc xoáy đẩy lùi, gây sát thương và làm choáng nhẹ */
function galeUpd(dt, s) {
  const r = R, k = S.sk.gale;
  if (!k) return;
  r.gc -= dt;
  r.gk -= dt;
  if (r.seal > 0) return;
  if (r.gc > 0 || r.gk > 0) return;
  r.gk = 0.2;
  const g = SKV.gale(k), fx = front();
  let n = 0;
  for (const m of r.mon) if (!m.dead && m.x <= fx + g.zone + m.w / 2) n += m.k === "boss" ? 2 : 1;
  if (n >= g.need) galeCast(g, s);
}
function galeCast(g, s) {
  const r = R, fx = front();
  r.gc = g.cd;
  r.gw = { t: 0, l: 1.05, r: g.r };
  for (const m of r.mon) {
    if (m.dead || m.x > fx + g.r + m.w / 2) continue;
    const b = m.k === "boss";
    m.kv += g.kb * (b ? 0.4 : 1);
    if (!b) m.st = Math.max(m.st, g.dz);
    const d = Math.max(1, Math.round(s.dmg * g.dm * mdm(m)));
    m.hp -= d;
    m.fl = 0.1;
    r.dmgT += d;
    if (r.tx.length < 24) r.tx.push({ x: m.x, y: monY(m) - m.h - 8, s: "-" + fmtN(d), c: "#bff4ff", l: 0.8 });
    if (m.hp <= 0) kill(m, s);
  }
  for (let i = 0; i < (S.set.rm ? 10 : 34) && fxOk(); i++) {
    const a = rnd() * 6.283, v = 60 + rnd() * 140;
    r.fx.push({ x: DX + Math.cos(a) * 10, y: GY - 6 - rnd() * 50, vx: Math.abs(Math.cos(a)) * v + 30, vy: Math.sin(a) * 30, g: 0, l: 0.4 + rnd() * 0.4, c: i % 3 ? "#bff4ff" : "#fff", s: rnd() < 0.3 ? 2 : 1 });
  }
  r.rg.push({ x: DX, y: GY + 1, t: 0, l: 0.6, c: "#8adfff", r: g.r }, { x: DX, y: GY + 1, t: -0.1, l: 0.6, c: "#fff", r: g.r * 0.7 });
  r.tx.push({ x: DX, y: GY - 70, s: "CUỒNG PHONG", c: "#9ae8ff", l: 1, z: 12 });
  sfx("gale");
}

/* ----- Vẽ: lửa cháy, sao choáng quanh quái; lốc xoáy quanh khủng long ----- */
function drawStatus() {
  if (!R) return;
  const A = atl(null);
  for (const m of R.mon) {
    if (m.dead) continue;
    const z = m.z || 0, cx = Math.round(m.x), top = GY - z - m.h;
    if (m.bp > 0.5 && A) {
      const fi = FLY[(Math.floor(CT * 14 + m.ph * 3)) % FLY.length], D = Math.min(46, m.w * 0.9 + 14);
      x.save();
      x.globalCompositeOperation = "lighter";
      fdraw(A, fi, cx, GY - z - m.h * 0.15, D, 0.55, 0.5, -1.5708, 0.6);
      fdraw(A, FLY[(fi + 2) % FLY.length], cx - m.w * 0.22, GY - z - m.h * 0.1, D * 0.7, 0.55, 0.5, -1.5708, 0.4);
      x.restore();
    }
    if (m.st > 0) {
      const base = CT * 5 + m.ph;
      for (let i = 0; i < 3; i++) {
        const a = base + i * 2.094, sx = Math.round(cx + Math.cos(a) * (m.w * 0.32 + 3)), sy = Math.round(top - 5 + Math.sin(a) * 3), up = Math.sin(a) > 0;
        rc("#7a5a00", sx - 2, sy - 1, 5, 3);
        rc("#7a5a00", sx - 1, sy - 2, 3, 5);
        rc(up ? "#fff6b0" : "#ffd23a", sx - 1, sy, 3, 1);
        rc(up ? "#fff6b0" : "#ffd23a", sx, sy - 1, 1, 3);
      }
    }
  }
}
function drawGale() {
  const g = R && R.gw;
  if (!g) return;
  const p = g.t / g.l, fa = Math.max(0, Math.min(1, (1 - p) * 2.4, p * 10));
  x.save();
  x.globalAlpha = fa * 0.9;
  x.lineCap = "round";
  for (let j = 0; j < 9; j++) {
    const hh = j / 8, rx = 14 + hh * (26 + 18 * p), yy = GY - 3 - hh * 70, a0 = CT * 10 + j * 0.9;
    x.strokeStyle = j % 2 ? "#e4fbff" : "#6ad0ff";
    x.lineWidth = 2.2 - hh * 1.2;
    x.beginPath();
    x.ellipse(DX, yy, rx, 5 + hh * 2, 0, a0, a0 + 3.6);
    x.stroke();
  }
  x.globalAlpha = fa * 0.35;
  x.fillStyle = "#9ae8ff";
  x.beginPath();
  x.ellipse(DX, GY - 38, 28 + 12 * p, 40, 0, 0, 6.283);
  x.fill();
  x.restore();
}

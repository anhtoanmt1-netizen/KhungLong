/* ===== Long Nộ (v2.5): tuyệt chiêu bấm tay =====
   Thanh nộ R.rgM (0–100) nạp dần: +0,8/giây, +0,8 mỗi quái hạ, +6 mỗi Boss (nhân theo cấp Long Nộ và phần thưởng "Nộ Khí").
   Đầy thì bấm nút LONG NỘ (hoặc phím R / Space) để xả MỘT trong 3 kiểu bạn đã mở (chọn kiểu đang dùng trong thẻ Long Nộ):
   · Hơi Thở Lửa : quét lửa khắp màn, sát thương lớn, đẩy lùi, làm choáng nhẹ.
   · Sao Băng    : mưa thiên thạch, ưu tiên rơi xuống Boss → mạnh nhất khi đánh Boss.
   · Bão Sét     : choáng toàn bộ quái (ngắt chiêu Boss đang báo trước) + sét đánh liên hồi.
   Sát thương = max(sát thương × hệ số, % máu tối đa của quái) với quái thường, và chủ yếu là % máu tối đa với Boss, nên có ích ở mọi giai đoạn. Cấp Long Nộ (1–10) tăng sức mạnh x1 → x3,25. ===== */

const RGK = {
  fire: { sk: "rgFire", n: "Hơi Thở Lửa", c: "#ff8a2a" },
  meteor: { sk: "rgMeteor", n: "Sao Băng", c: "#ffb040" },
  storm: { sk: "rgStorm", n: "Bão Sét", c: "#8ad0ff" }
};
const rgOwned = () => Object.keys(RGK).filter((k) => S.sk[RGK[k].sk] > 0);
const rgKind = () => { const o = rgOwned(); return o.includes(S.rg) ? S.rg : o[0] || null; };
const rgMult = () => 1 + 0.25 * (Math.max(1, S.sk.rage) - 1);

function rageGain(a) {
  const r = R;
  if (!r || !S.sk.rage || r.rgA) return;
  r.rgM = Math.min(100, r.rgM + a * (1 + 0.06 * (S.sk.rage - 1)) * (1 + BF.rageM) * (1 + 0.05 * TL("trage")));
}
function castRage() {
  const r = R, k = rgKind();
  if (!r || !r.al || r.pz || !S.sk.rage || !k || r.rgM < 100 || r.rgA) return false;
  const s = sv();
  r.rgM = 0;
  r.rgA = { k, t: 0, T: k === "fire" ? 1.8 : k === "meteor" ? 3 : 2.7, hit: [], ms: [], bs: [], cnt: 0, sk: 0, front: DX };
  r.shk = Math.max(r.shk, 0.5);
  tx(DX, GY - 82, "LONG NỘ: " + RGK[k].n.toUpperCase(), RGK[k].c);
  r.tx[r.tx.length - 1].z = 12;
  if (k === "storm") {
    const lv = S.sk.rage;
    for (const m of r.mon) {
      if (m.dead) continue;
      const b = m.k === "boss", d = b ? 0.9 + 0.06 * lv : 2.2 + 0.25 * lv;
      m.st = Math.max(m.st, d);
      m.si = Math.max(m.si, m.st + 1.4);
    }
  }
  sfx("rage");
  ev("rage");
  return true;
}

function rgHit(m, flat, pn, pb, s, col) {
  if (m.dead) return;
  const boss = m.k === "boss";
  let d = boss ? flat * 0.25 + m.mx * pb : Math.max(flat, m.mx * pn);
  d = Math.max(1, Math.round(d * mdm(m)));
  const a = Math.min(d, m.hp);
  m.hp -= d;
  m.fl = 0.1;
  R.dmgT += a;
  tx(m.x, GY - (m.z || 0) - m.h - 6, "-" + fmtN(d), col);
  if (m.hp <= 0) { kill(m, s); return; }
  if (s.burn > 0) addBurn(m, d * 0.5, s);
}

function rageUpd(dt, s) {
  const r = R;
  if (!S.sk.rage) return;
  rageGain(0.8 * dt);
  const a = r.rgA;
  if (!a) return;
  a.t += dt;
  const lv = S.sk.rage, rm = rgMult(), rs = Math.sqrt(rm);
  if (a.k === "fire") {
    a.front = DX + 30 + (W + 40 - DX) * Math.min(1, a.t / 0.85);
    for (const m of r.mon) {
      if (m.dead || m.x > a.front + m.w / 2 || a.hit.includes(m)) continue;
      a.hit.push(m);
      const boss = m.k === "boss";
      rgHit(m, s.dmg * 10 * rm, Math.min(0.6, 0.22 * rm), 0.03 * rs, s, "#ffb050");
      if (!m.dead) {
        m.kv += 760 * (boss ? 0.4 : 1);
        if (!boss) m.st = Math.max(m.st, 0.6);
      }
    }
  } else if (a.k === "meteor") {
    const n = 10 + lv;
    while (a.cnt < n && a.t >= a.cnt * (2.2 / n)) {
      a.cnt++;
      const alive = r.mon.filter((m) => !m.dead && m.x < W - 8), boss = alive.find((m) => m.k === "boss");
      let X = 220 + rnd() * 380;
      if (alive.length) X = boss && rnd() < 0.6 ? boss.x : alive[Math.floor(rnd() * alive.length)].x;
      a.ms.push({ x: Math.max(60, Math.min(W - 12, X)), x0: X + 130, y0: -24, t: 0, T: 0.5 });
    }
    for (const q of a.ms) {
      if (q.done) continue;
      q.t += dt;
      if (q.t < q.T) continue;
      q.done = 1;
      r.ex.push({ x: q.x, y: GY - 6, t: 0, sc: 1.2, col: "s", ring: "#ffb040", rr: 46 });
      r.shk = Math.max(r.shk, 0.2);
      sfx("boomf");
      for (const m of r.mon) if (!m.dead && Math.abs(m.x - q.x) < 40 + m.w / 2) rgHit(m, s.dmg * 6 * rm, Math.min(0.45, 0.1 * rm), 0.007 * rs, s, "#ffcf70");
    }
    a.ms = a.ms.filter((q) => !q.done || q.t < q.T + 0.05);
  } else if (a.k === "storm") {
    const lastT = a.T - 0.3;
    while (a.t < lastT && a.t >= a.sk * 0.18) {
      a.sk++;
      const alive = r.mon.filter((m) => !m.dead && m.x < W - 8);
      let X = 250 + rnd() * 350, Y = GY - 14, m = null;
      if (alive.length) { m = alive[Math.floor(rnd() * alive.length)]; X = m.x; Y = GY - (m.z || 0) - m.h / 2; }
      const pts = [[X + (rnd() - 0.5) * 60, -10]];
      for (let i = 1; i < 7; i++) pts.push([X + (rnd() - 0.5) * 36 * (1 - i / 7) * 2, -10 + (Y + 10) * i / 7]);
      pts.push([X, Y]);
      a.bs.push({ pts, t: 0, l: 0.24 });
      sfx("bolt");
      if (m) rgHit(m, s.dmg * 5 * rm, Math.min(0.3, 0.05 * rm), 0.004 * rs, s, "#bfe6ff");
      if (r.fx.length < 380) for (let i = 0; i < 4; i++) r.fx.push({ x: X, y: Y, vx: (rnd() - 0.5) * 90, vy: -rnd() * 70, l: 0.3, c: i % 2 ? "#fff" : "#9ad8ff", s: 2 });
    }
    for (const b of a.bs) b.t += dt;
    a.bs = a.bs.filter((b) => b.t < b.l);
  }
  if (a.t >= a.T && !a.ms.some((q) => !q.done)) r.rgA = null;
}

/* ----- Vẽ ----- */
function drawRage() {
  const r = R, a = r && r.rgA;
  if (!a) return;
  const fa = Math.max(0, Math.min(1, (a.T - a.t) / 0.5));
  x.save();
  if (a.k === "fire") {
    const A = atl(null);
    if (a.t < 0.4) { x.fillStyle = "rgba(255,140,30," + ((0.4 - a.t) * 0.8).toFixed(3) + ")"; x.fillRect(-10, -10, W + 20, H + 20); }
    if (A) {
      x.globalCompositeOperation = "lighter";
      for (let row = 0; row < 3; row++) {
        for (let px = DX + 24; px <= a.front; px += 11) {
          const py = GY - 14 - row * 17 + Math.sin(CT * 18 + px * 0.21 + row) * 4, D = 28 + 18 * (1 - (px - DX) / (W - DX) * 0.5);
          const fi = FLY[Math.floor(CT * 16 + px * 0.07 + row) % FLY.length];
          fdraw(A, fi, px, py, D, 0.7, 0.5, 0, fa * (0.3 + 0.7 * (1 - Math.min(1, (a.front - px) / 280))));
        }
      }
    } else { x.fillStyle = "rgba(255,150,40," + (0.5 * fa).toFixed(2) + ")"; x.fillRect(DX, GY - 50, a.front - DX, 50); }
  } else if (a.k === "meteor") {
    x.globalCompositeOperation = "lighter";
    x.lineCap = "round";
    for (const q of a.ms) {
      if (q.done) continue;
      const p = Math.min(1, q.t / q.T), hx = q.x0 + (q.x - q.x0) * p, hy = q.y0 + (GY - q.y0) * p, tx_ = hx + (q.x0 - q.x) * 0.22, ty = hy - (GY - q.y0) * 0.22;
      for (const [w, c] of [[6, "rgba(255,110,30,0.55)"], [3.5, "rgba(255,190,70,0.9)"], [1.6, "#fff6d0"]]) { x.strokeStyle = c; x.lineWidth = w; x.beginPath(); x.moveTo(tx_, ty); x.lineTo(hx, hy); x.stroke(); }
      x.fillStyle = "rgba(255,200,90,0.9)";
      x.beginPath(); x.arc(hx, hy, 5, 0, 6.283); x.fill();
    }
  } else if (a.k === "storm") {
    x.fillStyle = "rgba(14,24,64," + (0.32 * Math.min(1, fa * 2, a.t * 4)).toFixed(3) + ")";
    x.fillRect(-10, -10, W + 20, H + 20);
    x.lineCap = "round";
    x.lineJoin = "round";
    for (const b of a.bs) {
      const k = 1 - b.t / b.l;
      for (const [w, c] of [[5, "rgba(120,190,255," + (0.35 * k).toFixed(2) + ")"], [2.2, "rgba(210,238,255," + (0.95 * k).toFixed(2) + ")"], [1, "rgba(255,255,255," + k.toFixed(2) + ")"]]) {
        x.strokeStyle = c;
        x.lineWidth = w;
        x.beginPath();
        b.pts.forEach((p, i) => (i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])));
        x.stroke();
      }
    }
  }
  x.restore();
}

/* ----- Nút LONG NỘ trên màn hình (DOM): vòng nạp, sáng và nhịp khi đầy ----- */
let rgLast = "", rgShown = "";
function rageHud() {
  const e = $("rgb");
  if (!e) return;
  const k = R && R.al && scr === null && S.sk.rage > 0 ? rgKind() : null;
  if (!k) { if (e.style.display !== "none") e.style.display = "none"; return; }
  if (e.style.display === "none") e.style.display = "";
  const v = Math.floor(R.rgM), ready = R.rgM >= 100 && !R.rgA, key = v + (ready ? "r" : "") + (R.rgA ? "b" : "");
  if (key !== rgLast) {
    rgLast = key;
    e.style.setProperty("--p", v);
    $("rgt").textContent = R.rgA ? "…" : ready ? "BẤM!" : v + "%";
    e.classList.toggle("ready", ready);
    e.classList.toggle("busy", !!R.rgA);
  }
  if (k !== rgShown) {
    rgShown = k;
    e.style.setProperty("--img", "url(../assets2/cards/art_" + RGK[k].sk + ".png)");
    e.dataset.k = k;
  }
}

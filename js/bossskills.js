/* ===== Chiêu Boss v2.2 =====
   Mỗi Boss (BOSS[i].sk) có 1–3 chiêu từ bảng BSK (config.js). Một Boss chỉ chuẩn bị một chiêu tại một thời điểm:
   chọn chiêu đang sẵn sàng → BÁO TRƯỚC (tên chiêu, vòng tím dưới chân khủng long) → HIỆU ỨNG điểm ảnh (js/vfx) → HIỆU LỰC lên khủng long / lên chính Boss.
   Cách đối phó: Choáng làm Boss gián đoạn chiêu đang báo trước · Tường Lửa (bất tử) chặn hoàn toàn sát thương lẫn hiệu ứng xấu · Phượng Hoàng vẫn hoạt động ·
   Hạ Boss nhanh để chiêu không kịp dùng. Mọi sát thương chiêu bị chặn trần theo % HP tối đa của khủng long nên không thể "một phát chết".
   Nếu hiệu ứng không nạp được (VFX chưa sẵn sàng / mở file://), gameplay vẫn chạy bình thường chỉ thiếu hình. ===== */

const vfxOk = () => typeof VFX !== "undefined" && VFX.ready;

/* Nhận sát thương trực tiếp từ chiêu (không qua đòn đánh thường). o: { cap: trần theo % HP tối đa, nodef: bỏ qua giảm sát thương, nov: không tính Lời Nguyền, c: màu chữ } */
function pdmg(raw, o, s) {
  const r = R;
  if (!r.al || r.sh > 0 || r.ri > 0) return 0;
  let d = raw * (o.nodef ? 1 : 1 - s.def) * (r.vul > 0 && !o.nov ? 1.3 : 1);
  d = Math.max(1, Math.round(Math.min(d, s.maxHp * (o.cap || 1))));
  r.hp -= d;
  r.lost += d;
  r.hitT = 0.25;
  tx(DX, GY - 50 - (o.dy || 0), "-" + d, o.c || "#c77dff");
  sfx("hurt");
  plCheck(s);
  return d;
}

/* ----- Lập lịch và chạy chiêu của một Boss (gọi mỗi khung hình trong vòng lặp quái) ----- */
function bossSkillUpd(m, dt, s, sn) {
  const b = m.b, r = R;
  if (!b || !b.sk || m.dead) return;
  const bs = m.bs || (m.bs = { nt: 3.5 + rnd() * 2, cds: {}, c: null });
  for (const k in bs.cds) if (bs.cds[k] > 0) bs.cds[k] -= dt;
  if (m.shd > 0) m.shd -= dt;
  if (m.hl > 0) {
    m.hl -= dt;
    if (!m.dead) {
      const h0 = m.hp;
      m.hp = Math.min(m.mx, m.hp + m.hr * dt);
      m.hq = (m.hq || 0) + (m.hp - h0);
      if ((m.ht = (m.ht || 0.7) - dt) <= 0) { m.ht = 0.7; healPop(m.x, GY - (m.z || 0) - m.h - 10, m.hq, HEALC.boss); m.hq = 0; }
    }
  }
  if (!r.al) { cancelCast(m); return; }
  const c = bs.c;
  if (!c) {
    if ((bs.nt -= dt) <= 0) {
      if (sn || m.x > W - 40 || m.en < 1.2) { bs.nt = 0.3; return; }
      startCast(m, bs);
    }
    return;
  }
  const d = BSK[c.k], F = d.tele + d.pre;
  if (sn && !c.fired) { // Choáng gián đoạn chiêu chưa phát động
    ev("intr");
    tx(m.x, GY - (m.z || 0) - m.h - 22, "BỊ NGẮT!", "#9ad8ff");
    cancelCast(m);
    return;
  }
  c.t += dt;
  if (!c.vf && c.t >= d.tele) startVfx(c, m, d);
  if (!c.fired && c.t >= F) {
    c.fired = 1;
    applySk(c.k, m, s, d);
  }
  if (c.vf && c.vf.h.meta.loop && c.fired && c.t >= F + d.tail - 0.4 && !c.stopped) { c.stopped = 1; c.vf.h.stop(); }
  if (c.fired && (c.t >= F + d.tail + 1 || (c.vf ? c.vf.h.done() : c.t >= F + 0.4))) bs.c = null;
}
function startCast(m, bs) {
  const ready = m.b.sk.filter((k) => !(bs.cds[k] > 0));
  if (!ready.length) { bs.nt = 1; return; }
  const k = ready[Math.floor(rnd() * ready.length)], d = BSK[k];
  bs.cds[k] = d.cd * DF().si * bioM(R.wave).bcd;
  bs.nt = 2.5 + rnd() * 1.5;
  bs.c = { k, t: 0, fired: 0, vf: null, stopped: 0 };
  tx(m.x, GY - (m.z || 0) - m.h - 22, d.n.toUpperCase() + "!", d.c);
  R.tx[R.tx.length - 1].z = 11;
  sfx("bcast");
  if (d.tele > 0 || d.pre > 0) R.rg.push({ x: m.x, y: GY + 1, t: 0, l: 0.6, c: d.c, r: 54 });
}
function cancelCast(m) {
  const bs = m.bs;
  if (!bs || !bs.c) return;
  if (bs.c.vf) bs.c.vf.h.stop();
  bs.c = null;
}

/* ----- Hiệu ứng điểm ảnh của chiêu: vị trí neo, tỷ lệ, theo sát Boss hay đứng yên ở khủng long ----- */
function startVfx(c, m, d) {
  if (!vfxOk() || c.k === "orb") return;
  const gy = GY - (m.z || 0), bx = m.x;
  let o = null, fol = 0;
  switch (c.k) {
    case "hands": o = { x: DX + 4, y: GY + 2, s: 0.85 }; break;
    case "tendril": o = { x: DX + 8, y: GY + 2, s: 0.8 }; break;
    case "flame": o = { x: DX + 2, y: GY + 2, s: 1.2 }; break;
    case "curse": { // tô màu lên đúng hình khủng long
      const im = IM[0], kd = dk();
      o = { x: DX, y: GY + 4, s: 1 };
      if (im.complete && im.width) o.actor = VFX.actorOf(im, im.width * kd, im.height * kd, false);
      break;
    }
    case "sigil": o = { x: DX + 2, y: GY, s: 1.3 }; break;
    case "eclipse": o = { x: W / 2, y: 120, s: 1.3 }; break;
    case "skulls": o = { x: bx, y: gy, s: 0.9 }; fol = 1; break;
    case "drain": o = { x: bx, y: gy, s: 0.9, flip: true }; fol = 1; break;
    case "steal": { // Boss là "người hút" (bị tô đỏ), khủng long là mục tiêu cách 104 điểm ảnh × tỷ lệ
      const s = Math.max(0.6, Math.min(1.5, (bx - DX) / 104)), im = BI[m.b.i];
      o = { x: bx, y: gy, s, flip: true };
      if (im && ld(im)) o.actor = VFX.actorOf(im, m.sz / s, m.sz * m.asp / s, true);
      fol = 1;
      break;
    }
    case "hole": o = { x: bx, y: gy - m.h * 0.55, s: 0.55 }; fol = 2; break;
    case "nova": o = { x: DX + 4, y: GY + 2, s: 0.8 }; break;
  }
  if (!o) return;
  const h = VFX.make(d.fx, o);
  if (h) { c.vf = { h, fol, m }; R.vf.push(c.vf); }
}

/* ----- Hiệu lực của chiêu ----- */
function applySk(k, m, s, d) {
  const r = R, raw = m.dm;
  switch (k) {
    case "hands":
      if (pdmg(raw * d.dm, { cap: d.cap }, s)) { r.sil = Math.max(r.sil, d.sil); tx(DX, GY - 72, "BỊ TRÓI", "#c77dff"); }
      break;
    case "tendril":
      if (pdmg(raw * d.dm, { cap: d.cap }, s)) { r.slw = d.slw; tx(DX, GY - 72, "BỊ LÀM CHẬM", "#b08cff"); }
      break;
    case "flame":
      if (r.sh <= 0) { r.dot = d.dot; r.dotp = d.dotp; r.da = 0; tx(DX, GY - 72, "BỊ THIÊU", "#b07cff"); }
      break;
    case "curse":
      if (r.sh <= 0) { r.vul = d.vul; tx(DX, GY - 72, "BỊ NGUYỀN", "#d9a0ff"); }
      break;
    case "sigil":
      if (r.sh <= 0) { r.seal = d.seal; tx(DX, GY - 72, "PHONG ẤN", "#c9a0ff"); }
      break;
    case "orb": launchOrb(m, d); break;
    case "eclipse":
      r.dim = r.dimT = d.dim;
      tx(DX, GY - 72, "TỐI SẦM", "#e8dcff");
      break;
    case "skulls": summon(m, d.cnt); break;
    case "drain":
      m.hl = d.hdur;
      m.hr = m.mx * d.hl / d.hdur;
      m.hq = 0;
      tx(m.x, GY - (m.z || 0) - m.h - 22, "HÚT HỒN", "#9ad0ff");
      break;
    case "steal":
      if (pdmg(raw * d.dm, { cap: d.cap, c: "#ff6a7a" }, s)) {
        const h0 = m.hp;
        m.hp = Math.min(m.mx, m.hp + m.mx * d.hl);
        healPop(m.x, GY - (m.z || 0) - m.h - 10, m.hp - h0, HEALC.boss);
      }
      break;
    case "hole":
      m.shd = d.dur;
      tx(m.x, GY - (m.z || 0) - m.h - 10, "GIẢM 50% SÁT THƯƠNG", "#c9a0ff");
      break;
    case "nova":
      r.shk = Math.max(r.shk, 0.6);
      r.rg.push({ x: DX, y: GY + 1, t: 0, l: 0.7, c: "#e08aff", r: 110 }, { x: DX, y: GY + 1, t: -0.1, l: 0.7, c: "#fff", r: 70 });
      pdmg(raw * d.dm, { cap: d.cap, c: "#e08aff", dy: 6 }, s);
      break;
  }
}
/* Cầu Hư Không: phóng ngay khi hết thời gian báo trước, bay tới khủng long trong d.fly giây */
function launchOrb(m, d) {
  const r = R, y0 = GY - (m.z || 0) - m.h * 0.55;
  const h = vfxOk() ? VFX.make(d.fx, { x: m.x, y: y0, s: 0.42 }) : null;
  r.bo.push({ x0: m.x, y0, t: 0, T: d.fly, dmg: m.dm * d.dm, cap: d.cap, h });
}
function summon(m, n) {
  const r = R;
  for (let i = 0; i < n && r.mon.length < CFG.maxMon; i++) {
    const ti = [8, 10, 12][Math.floor(rnd() * 3)];
    spawn(false, ti, Math.min(W - 10, m.x + (i - 1) * 20));
    const o = r.mon[r.mon.length - 1];
    o.hp = o.mx = o.mx * 0.35; // bóng ma yếu, ít vàng
    o.gd *= 0.25;
    o.sm = 1;
    for (let j = 0; j < 5 && r.fx.length < 380; j++) r.fx.push({ x: o.x, y: GY - 6 - rnd() * 14, vx: (rnd() - 0.5) * 50, vy: -20 - rnd() * 40, g: -20, l: 0.5, c: j % 2 ? "#5affc8" : "#fff", s: 2 });
  }
  sfx("wave");
}

/* ----- Cập nhật chung: trạng thái xấu trên khủng long, đạn Cầu Hư Không, các hiệu ứng điểm ảnh ----- */
function bossFxUpd(dt, s) {
  const r = R;
  r.sil -= dt; r.slw -= dt; r.vul -= dt; r.seal -= dt; r.dim -= dt; r.ri -= dt;
  if (r.dot > 0) {
    r.dot -= dt;
    if (r.sh <= 0) r.da += s.maxHp * r.dotp * dt;
    if ((r.dt2 -= dt) <= 0) {
      r.dt2 = 0.5;
      const q = Math.floor(r.da);
      if (q >= 1) { r.da -= q; pdmg(q, { nodef: 1, nov: 1, c: "#b07cff" }, s); }
    }
  }
  for (const o of r.bo) {
    o.t += dt;
    const p = Math.min(1, o.t / o.T);
    o.x = o.x0 + (DX + 8 - o.x0) * p;
    o.y = o.y0 + ((GY - 26) - o.y0) * p - Math.sin(p * Math.PI) * 14;
    if (o.h) { o.h.x = o.x; o.h.y = o.y; }
    if (o.t >= o.T && !o.hit) {
      o.hit = 1;
      r.shk = Math.max(r.shk, 0.25);
      r.ex.push({ x: DX + 6, y: GY - 26, t: 0, sc: 1.4, col: "a", ring: "#7b3fe4", rr: 40 });
      pdmg(o.dmg, { cap: o.cap, c: "#a070ff" }, s);
      if (o.h) o.h.stop();
    }
  }
  r.bo = r.bo.filter((o) => !o.hit || (o.h && !o.h.done()));
  for (const v of r.vf) {
    if (v.fol && v.m && !v.m.dead) {
      v.h.x = v.m.x;
      v.h.y = GY - (v.m.z || 0) - (v.fol === 2 ? v.m.h * 0.55 : 0);
    } else if (v.fol && v.m && v.m.dead) v.h.stop();
    v.h.update(dt);
  }
  for (const o of r.bo) if (o.h) o.h.update(dt);
  r.vf = r.vf.filter((v) => !v.h.done());
}

/* ----- Vẽ ----- */
function drawBossFx() {
  const r = R;
  if (!r) return;
  // vòng báo trước dưới chân khủng long + hào quang quanh Boss đang chuẩn bị chiêu
  for (const m of r.mon) {
    const c = m.bs && m.bs.c;
    if (!c || m.dead) continue;
    const d = BSK[c.k], F = d.tele + d.pre;
    if (c.t >= F && c.k !== "sigil" && c.k !== "nova") continue;
    const p = Math.min(1, c.t / Math.max(0.01, F)), pulse = 0.5 + 0.5 * Math.sin(CT * 14);
    x.save();
    x.strokeStyle = d.c;
    x.globalAlpha = 0.25 + 0.5 * pulse * (0.4 + p * 0.6);
    x.lineWidth = 1.4;
    x.beginPath();
    x.ellipse(m.x, GY - (m.z || 0) - m.h * 0.5, m.w * 0.55 + 4 + 3 * pulse, m.h * 0.6 + 4 + 3 * pulse, 0, 0, 6.283);
    x.stroke();
    if (c.k !== "eclipse" && c.k !== "skulls" && c.k !== "drain" && c.k !== "hole") {
      x.globalAlpha = (0.2 + 0.45 * pulse) * (c.fired ? 0 : 1);
      x.beginPath();
      x.ellipse(DX + 4, GY + 3, 24 + 10 * p, 6 + 2.5 * p, 0, 0, 6.283);
      x.stroke();
    }
    x.restore();
  }
  // Nhật Thực: bầu trời tối dần rồi sáng lại
  if (r.dim > 0 && r.dimT > 0) {
    const a = Math.min(1, (r.dimT - r.dim) / 0.5, r.dim / 0.5) * 0.5;
    x.fillStyle = "rgba(10,0,28," + Math.max(0, a).toFixed(3) + ")";
    x.fillRect(-10, -10, W + 20, H + 20);
  }
  for (const v of r.vf) v.h.draw(x);
  for (const o of r.bo) if (o.h) o.h.draw(x);
  // biểu tượng trạng thái xấu của khủng long (dưới thanh máu)
  const ch = [];
  if (r.sil > 0) ch.push(["TRÓI " + r.sil.toFixed(1), "#c77dff"]);
  if (r.slw > 0) ch.push(["CHẬM " + r.slw.toFixed(1), "#b08cff"]);
  if (r.vul > 0) ch.push(["NGUYỀN " + r.vul.toFixed(1), "#d9a0ff"]);
  if (r.seal > 0) ch.push(["PHONG ẤN " + r.seal.toFixed(1), "#c9a0ff"]);
  if (r.dot > 0) ch.push(["THIÊU " + r.dot.toFixed(1), "#b07cff"]);
  if (r.dim > 0) ch.push(["TỐI " + r.dim.toFixed(1), "#e8dcff"]);
  let cx = 8;
  for (const [t, c] of ch) {
    const w = t.length * 4.3 + 8;
    x.fillStyle = "rgba(10,6,24,0.8)";
    x.fillRect(cx, 74, w, 10);
    x.strokeStyle = c;
    x.lineWidth = 1;
    x.strokeRect(cx + 0.5, 74.5, w - 1, 9);
    tw(t, cx + w / 2, 82, c, 6.5, "center");
    cx += w + 3;
  }
}

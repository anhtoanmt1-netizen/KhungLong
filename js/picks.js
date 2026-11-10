/* ===== Chọn 1 trong 3 phần thưởng mỗi 10 đợt (v2.5) =====
   Khi lượt chơi đạt đợt 10, 20, 30... game tạm dừng và đưa ra 3 phần thưởng ngẫu nhiên; chọn 1 (đổi được 3 lựa chọn 1 lần mỗi lần chọn).
   Phần thưởng nằm trong S.bf = [{ w: đợt, id }] và có tác dụng cho tới khi bị mất:
   · khi hết máu, game lùi 3 đợt; các phần thưởng chọn ở đợt SAU đợt bắt đầu mới sẽ mất (phải chọn lại khi vượt qua đợt đó), các phần thưởng cũ được giữ.
   · "Trò chơi mới" xóa hết.
   Mỗi loại cộng dồn tối đa 5 lần, mỗi lần sau yếu đi 15% (0,85^k) để tránh quá mạnh. Nhiều phần thưởng có đánh đổi để lựa chọn có ý nghĩa.
   Hiệu lực cộng vào BF (state.js) và được sv() / game.js đọc. ===== */

const BFMAX = 5, BFDIM = 0.85;
const RARITY = [null, { n: "THƯỜNG", c: "#cfe8cf", w: 60 }, { n: "HIẾM", c: "#7ab8ff", w: 30 }, { n: "SỬ THI", c: "#d79aff", w: 10 }];
/* id, tên, độ hiếm (1–3), ảnh/khung thẻ, mô tả, đánh đổi (nếu có), hiệu lực (cộng vào BF), điều kiện xuất hiện */
const BFP = [
  { id: "dmg1", n: "Cuồng Nộ", r: 2, art: "dmg", fr: "fire", d: "+35% sát thương.", x: "-15% HP tối đa.", e: { dmgM: 0.35, hpM: -0.15 } },
  { id: "rate1", n: "Tốc Xạ", r: 1, art: "rate", fr: "silver", d: "+25% tốc độ bắn.", e: { rateM: 0.25 } },
  { id: "hp1", n: "Thân Thép", r: 1, art: "hp", fr: "blood", d: "+35% HP tối đa.", e: { hpM: 0.35 } },
  { id: "hp2", n: "Cự Nhân", r: 2, art: "hp", fr: "blood", d: "+70% HP tối đa.", x: "-20% sát thương.", e: { hpM: 0.7, dmgM: -0.2 } },
  { id: "crit1", n: "Mắt Diều Hâu", r: 1, art: "critR", fr: "bronze", d: "+12% tỷ lệ chí mạng.", e: { critP: 0.12 } },
  { id: "crit2", n: "Nhát Chí Tử", r: 2, art: "critD", fr: "fire", d: "+80% sát thương chí mạng.", e: { critDM: 0.8 } },
  { id: "gold1", n: "Tham Lam", r: 1, art: "gold", fr: "jade", d: "+40% vàng rơi.", x: "Quái nhanh hơn 10%.", e: { goldM: 0.4, spdM: 0.1 } },
  { id: "regen1", n: "Sinh Khí", r: 2, art: "regen", fr: "lotus", d: "Hồi 0,8% HP tối đa mỗi giây.", e: { regenP: 0.008 } },
  { id: "steal1", n: "Khát Máu", r: 2, art: "steal", fr: "blood", d: "+8% hút máu (tăng trần hồi mỗi giây).", e: { stealP: 0.08 } },
  { id: "burn1", n: "Lửa Địa Ngục", r: 1, art: "burn", fr: "blood", d: "Đòn đánh gây thêm 35% sát thương lửa cháy.", e: { burn: 0.35 } },
  { id: "stun1", n: "Sấm Choáng", r: 2, art: "stun", fr: "lotus", d: "+10% xác suất choáng, choáng lâu hơn 0,3 giây.", e: { stunP: 0.1, stunT: 0.3 } },
  { id: "multi1", n: "Song Phát", r: 3, art: "multi", fr: "shadow", d: "+2 đạn mỗi lần bắn.", x: "-10% tốc độ bắn.", e: { multiN: 2, rateM: -0.1 } },
  { id: "pierce1", n: "Xuyên Phá", r: 1, art: "pierce", fr: "silver", d: "Đạn xuyên thêm 3 quái.", e: { pierceN: 3 } },
  { id: "rage1", n: "Nộ Khí", r: 1, art: "ancient", fr: "fire", d: "Long Nộ nạp nhanh hơn 50%.", e: { rageM: 0.5 }, req: () => S.sk.rage > 0 },
  { id: "wall1", n: "Tấm Khiên", r: 2, art: "wall", fr: "steel", d: "Mỗi 25 giây được bất tử vài giây.", e: { wall: 1 } },
  { id: "def1", n: "Giáp Gai", r: 1, art: "def", fr: "steel", d: "+20% giảm sát thương nhận vào.", x: "-10% sát thương.", e: { defP: 0.2, dmgM: -0.1 } },
  { id: "anc1", n: "Hào Khí", r: 2, art: "ancient", fr: "fire", d: "+30% sát thương.", x: "Quái nhiều hơn 20% máu.", e: { dmgM: 0.3, hpMon: 0.2 } },
  { id: "chest1", n: "Thợ Săn Kho Báu", r: 1, art: "gold", fr: "bronze", d: "Rương xuất hiện nhiều gấp đôi, thưởng thêm 50%.", e: { chestM: 1, chestG: 0.5 } }
];
const bfById = (id) => BFP.find((b) => b.id === id);
const bfCount = (id) => S.bf.filter((b) => b.id === id).length;
const bfStack = (n) => { let s = 0; for (let i = 0; i < n; i++) s += Math.pow(BFDIM, i); return s; };
function bfRecalc() {
  for (const k of BFK) BF[k] = 0;
  const cnt = {};
  for (const b of S.bf) cnt[b.id] = (cnt[b.id] || 0) + 1;
  for (const id in cnt) {
    const p = bfById(id);
    if (!p) continue;
    const f = bfStack(Math.min(BFMAX, cnt[id]));
    for (const k in p.e) BF[k] += p.e[k] * f;
  }
}
/* Khi bắt đầu lượt: bỏ các phần thưởng chọn ở đợt sau đợt bắt đầu */
function bfTrim(rw) {
  S.bf = S.bf.filter((b) => b.w <= rw && bfById(b.id));
  bfRecalc();
}
const bfPierce = () => Math.round(BF.pierceN);

/* ---------- Giao diện chọn ---------- */
let PK = null;   // { w, opts: [id, id, id], rr: đã đổi chưa }
function pkOffer(excl) {
  const pool = BFP.filter((b) => bfCount(b.id) < BFMAX && (!b.req || b.req()) && !(excl && excl.includes(b.id)));
  const out = [];
  while (out.length < 3 && pool.length) {
    const tot = pool.reduce((s, b) => s + RARITY[b.r].w, 0);
    let t = Math.random() * tot, i = 0;
    for (; i < pool.length - 1; i++) { t -= RARITY[pool[i].r].w; if (t <= 0) break; }
    out.push(pool.splice(i, 1)[0].id);
  }
  return out;
}
function pickOpen(w) {
  const r = R;
  if (!r || !r.al || PK || S.bf.some((b) => b.w === w)) return;
  const o = pkOffer();
  if (o.length < 3) return;
  PK = { w, opts: o, rr: 0 };
  r.pz = 1;
  pkRender();
  show("pick");
  try { sfx("wave") } catch (e) { }
}
function pkCard(id, i) {
  const b = bfById(id), n = bfCount(id), R_ = RARITY[b.r];
  return `<button type="button" class="card st-ok pk r${b.r}" data-a="pk" data-k="${i}" aria-label="${b.n}">
    <span class="c-art" style="background-image:url(assets2/cards/art_${b.art}.png)"></span>
    <img class="c-frame" src="assets2/cards/frame_${b.fr}.png" alt="" draggable="false">
    <span class="c-lv" style="color:${R_.c}">${R_.n}</span>
    <span class="c-name${b.n.length > 17 ? " xl" : b.n.length > 13 ? " long" : ""}">${b.n}</span>
    <span class="c-desc"><span>${b.d}</span>${b.x ? `<em class="warn">${b.x}</em>` : n ? `<em>Lần ${n + 1}: yếu hơn ${Math.round((1 - Math.pow(BFDIM, n)) * 100)}%</em>` : ""}</span>
    <i class="c-fx"><b></b><s></s></i>
  </button>`;
}
function pkRender() {
  if (!PK) return;
  $("pkt").textContent = "CHỌN MỘT PHẦN THƯỞNG · ĐỢT " + PK.w;
  $("pkc").innerHTML = PK.opts.map(pkCard).join("");
  const left = 1 + TL("tpick") - PK.rr;
  $("pkrr").style.display = left > 0 ? "" : "none";
  $("pkrr").textContent = "↻ Đổi 3 lựa chọn (còn " + left + ")";
  const cnt = {};
  for (const b of S.bf) cnt[b.id] = (cnt[b.id] || 0) + 1;
  const ids = Object.keys(cnt);
  $("pkb").textContent = ids.length ? "Đang có: " + ids.map((id) => bfById(id).n + (cnt[id] > 1 ? " ×" + cnt[id] : "")).join(" · ") : "Chưa có phần thưởng nào. Khi hết máu game lùi 3 đợt; phần thưởng chọn ở các đợt bị lùi qua sẽ mất.";
}
function pickChoose(i) {
  if (!PK || !PK.opts[i]) return;
  const id = PK.opts[i], b = bfById(id);
  S.bf.push({ w: PK.w, id });
  bfRecalc();
  ev("pick");
  PK = null;
  if (R && R.al) { R.pz = 0; R.hp = Math.min(sv().maxHp, R.hp); tx(DX, GY - 78, b.n.toUpperCase(), RARITY[b.r].c); }
  save();
  try { sfx("evo") } catch (e) { }
  show(null);
}
function pickReroll() {
  if (!PK || PK.rr >= 1 + TL("tpick")) return;
  const o = pkOffer(PK.opts);
  PK.opts = o.length === 3 ? o : pkOffer();
  PK.rr++;
  pkRender();
  try { sfx("ui") } catch (e) { }
}
function pickAct(a, k) {
  switch (a) {
    case "pk": pickChoose(+k); return true;
    case "pkrr": pickReroll(); return true;
  }
  return false;
}
bfRecalc();

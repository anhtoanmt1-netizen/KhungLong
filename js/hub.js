/* ===== Hồ sơ người chơi (v2.4): Thành tựu · Nhiệm vụ hằng ngày · Sách Quái =====
   - Thành tựu: 20 mục (17 mục có 3 bậc Đồng/Bạc/Vàng, 3 mục ẩn). Bậc cao nhất mở danh hiệu hiển thị trên HUD. Tính "Điểm thành tựu" (AP) và hạng.
   - Nhiệm vụ: 3 nhiệm vụ mỗi ngày (dễ / vừa / khó) chọn theo ngày và theo tiến độ của bạn; 1 lượt đổi nhiệm vụ mỗi ngày; chuỗi ngày liên tiếp tăng thưởng.
     Phần thưởng là một ít vàng quy theo "đơn vị vàng" của đợt cao nhất của bạn (nhỏ so với thu nhập, không ảnh hưởng cân bằng).
   - Sách Quái: 28 trang (14 quái, 14 Boss). Gặp lần đầu là mở trang; hạ đủ số con sẽ mở thêm thông tin (chỉ số, chiêu của Boss, mẹo).
   Khi Bảng Mod đang BẬT, mọi tiến trình thành tựu / nhiệm vụ / Sách Quái đều không được tính (vì Mod có thể sửa vàng, nhảy đợt).
   Sự kiện được game gọi qua ev(...) ở game.js / bossskills.js / chest.js / cards.js / ui.js. ===== */

const trk = () => !S.mod.on;
const CXN = 28;   // số trang Sách Quái: mã 0–15 = SL (quái thường + Slime Vua + Rồng Con), 16–27 = 12 Boss
const cxBoss = (ti) => ti === 7 || ti === 15 || ti >= BOSS0;
const cxName = (ti) => (ti >= BOSS0 ? BOSS[ti - BOSS0].n : SL[ti][0]);
const cxList = () => { const a = []; for (let i = 0; i < CXN; i++) a.push(i); return a; };

/* ---------- Thành tựu ---------- */
const cntMax = (o, s) => Object.keys(o).filter((k) => s(k) >= o[k].m).length;
const ACH = [
  { id: "kill", n: "Thợ Săn", ic: "⚔", d: "Hạ {n} quái", t: [500, 5e3, 5e4], v: () => S.st.kills, tt: "Thợ Săn" },
  { id: "wave", n: "Người Sống Sót", ic: "☼", d: "Đạt đợt {n}", t: [25, 75, 150], v: () => S.pr.bw, tt: "Sống Sót" },
  { id: "boss", n: "Sát Thủ Boss", ic: "♛", d: "Hạ {n} Boss", t: [5, 50, 300], v: () => S.pr.bk, tt: "Diệt Boss" },
  { id: "nh", n: "Không Xây Xước", ic: "✦", d: "Hạ {n} Boss mà không mất giọt máu nào", t: [1, 10, 50], v: () => S.pr.nh, tt: "Bất Khả" },
  { id: "it", n: "Ngắt Chiêu", ic: "✋", d: "Dùng Choáng ngắt {n} chiêu của Boss", t: [3, 30, 150], v: () => S.pr.it, tt: "Khắc Tinh" },
  { id: "gold", n: "Triệu Phú", ic: "$", d: "Kiếm tổng cộng {n} vàng", t: [1e4, 1e6, 1e8], v: () => S.pr.gold, tt: "Đại Gia" },
  { id: "chest", n: "Thợ Săn Kho Báu", ic: "▣", d: "Mở {n} rương", t: [10, 100, 500], v: () => S.pr.ch, tt: "Kho Báu" },
  { id: "crit", n: "Nhát Chí Mạng", ic: "✸", d: "Tung {n} đòn chí mạng", t: [100, 5e3, 1e5], v: () => S.pr.cr, tt: "Chí Mạng" },
  { id: "hit", n: "Nhát Hủy Diệt", ic: "☄", d: "Một đòn đánh gây {n} sát thương", t: [1e3, 1e5, 1e7], v: () => S.pr.mh, tt: "Hủy Diệt" },
  { id: "heal", n: "Sinh Lực Dồi Dào", ic: "♥", d: "Hồi tổng cộng {n} HP", t: [1e3, 1e5, 1e7], v: () => S.pr.hl, tt: "Bất Diệt" },
  { id: "rv", n: "Bất Tử", ic: "☥", d: "Hồi sinh {n} lần nhờ Phượng Hoàng Lửa", t: [1, 10, 50], v: () => S.pr.rv, tt: "Phượng Hoàng" },
  { id: "gale", n: "Lốc Xoáy", ic: "◎", d: "Kích hoạt Cuồng Phong Hộ Thân {n} lần", t: [20, 200, 1e3], v: () => S.pr.gl, tt: "Lốc Xoáy" },
  { id: "time", n: "Bền Bỉ", ic: "⏱", d: "Chơi tổng cộng {n} giờ", t: [1, 10, 50], v: () => S.pr.pt / 3600, tt: "Bền Bỉ" },
  { id: "up", n: "Nhà Nâng Cấp", ic: "▲", d: "Nâng cấp thẻ {n} lần", t: [100, 1e3, 5e3], v: () => S.pr.up, tt: "Nâng Cấp" },
  { id: "evo", n: "Tiến Hóa", ic: "❖", d: "Đạt bậc tiến hóa {n}", t: [2, 4, 7], v: () => S.evo, tt: "Long Vương" },
  { id: "skm", n: "Bậc Thầy Kỹ Năng", ic: "★", d: "Đưa {n} kỹ năng lên cấp tối đa", t: [1, 4, 8], v: () => cntMax(SK, (k) => S.sk[k]), tt: "Thầy Kỹ Năng" },
  { id: "cdm", n: "Đại Cao Thủ", ic: "▤", d: "Đưa {n} thẻ nâng cấp lên cấp tối đa", t: [3, 8, 12], v: () => cntMax(UP, (k) => S.lv[k]), tt: "Cao Thủ" },
  { id: "cxs", n: "Nhà Sưu Tầm", ic: "❏", d: "Gặp {n} trang trong Sách Quái", t: [7, 14, 28], v: () => cxFound(), tt: "Sưu Tầm" },
  { id: "cxm", n: "Học Giả", ic: "✎", d: "Thông thạo {n} trang Sách Quái", t: [3, 10, 28], v: () => cxMastered(), tt: "Học Giả" },
  { id: "hard", n: "Thử Lửa", ic: "♨", d: "Đạt đợt 50 ở chế độ Khó", t: [1], v: () => (S.pr.bwd[1] >= 50 ? 1 : 0), tt: "Thử Lửa" },
  { id: "hell", n: "Xuống Địa Ngục", ic: "☠", d: "Đạt đợt 50 ở chế độ Địa ngục", t: [1], v: () => (S.pr.bwd[2] >= 50 ? 1 : 0), tt: "Địa Ngục" },
  // Thành tựu ẩn: chỉ hiện "???" cho tới khi mở khóa
  { id: "pet", n: "Bạn Của Rồng", ic: "♡", d: "Chạm vào khủng long 25 lần", t: [1], v: () => (S.pr.tp >= 25 ? 1 : 0), tt: "Bạn Rồng", hid: "Đôi khi rồng cũng thích được vuốt ve…" },
  { id: "owl", n: "Cú Đêm", ic: "☾", d: "Bắt đầu một lượt chơi vào lúc 0–4 giờ sáng", t: [1], v: () => S.pr.nl, tt: "Cú Đêm", hid: "Chỉ những người thức khuya mới biết." },
  { id: "oops", n: "Vấp Ngay Vạch Xuất Phát", ic: "☹", d: "Hết máu ngay ở đợt 1", t: [1], v: () => S.pr.fd, tt: "Xuất Phát", hid: "Ai rồi cũng có lần đầu…" }
];
const ACHN = (a) => a.t.length;
const achTier = (a) => { const v = a.v(); let t = 0; for (let i = 0; i < a.t.length; i++) if (v >= a.t[i]) t = i + 1; return t; };
const achGot = (a) => S.ach[a.id] || 0;
const achTotal = () => ACH.reduce((s, a) => s + achGot(a), 0);
const achPoints = () => ACH.reduce((s, a) => s + (ACHN(a) === 1 ? 3 * (achGot(a) ? 1 : 0) : (achGot(a) * (achGot(a) + 1)) / 2), 0);
const RANKS = [[0, "Tân Binh"], [10, "Thợ Săn"], [30, "Dũng Sĩ"], [60, "Anh Hùng"], [100, "Huyền Thoại"], [150, "Long Thần"]];
const rankOf = (ap) => RANKS.filter((r) => ap >= r[0]).pop()[1];
const fmtA = (n) => (n >= 1e6 ? fmtN(n) : fmtP(Math.floor(n)));
const MEDAL = ["Đồng", "Bạc", "Vàng"];

/* Danh hiệu: mở khi đạt bậc cao nhất của một thành tựu */
const titles = () => ACH.filter((a) => achGot(a) >= ACHN(a)).map((a) => ({ id: a.id, t: a.tt }));
function titleText() {
  if (S.tt !== "dino") { const a = ACH.find((q) => q.id === S.tt); if (a && achGot(a) >= ACHN(a)) return a.tt; }
  return "DINO";
}

/* ---------- Thông báo nhanh (toast) ---------- */
const tq = [];
let tOn = 0;
function toast(msg, col, sub) {
  tq.push([msg, col || "#ffe08a", sub || ""]);
  if (!tOn) toastNext();
}
function toastNext() {
  const e = $("toast"), q = tq.shift();
  if (!q) { tOn = 0; e.classList.remove("on"); return; }
  tOn = 1;
  e.innerHTML = `<b style="color:${q[1]}">${q[0]}</b>${q[2] ? `<small>${q[2]}</small>` : ""}`;
  e.classList.add("on");
  setTimeout(() => { e.classList.remove("on"); setTimeout(toastNext, 260) }, 2700);
}
function achCheck() {
  if (!trk()) return;
  for (const a of ACH) {
    const t = achTier(a), g = achGot(a);
    if (t > g) {
      S.ach[a.id] = t;
      dirty = 1;
      const hid = ACHN(a) === 1, last = t >= ACHN(a);
      toast("🏆 " + a.n + (hid ? "" : " · " + MEDAL[t - 1]), ["#d89a5a", "#d8dde8", "#ffd23a"][Math.min(2, ACHN(a) === 1 ? 2 : t - 1)], last ? "Danh hiệu mới: " + a.tt : "Thành tựu mới!");
      try { sfx("evo") } catch (e) { }
    }
  }
}

/* ---------- Sách Quái ---------- */
const cxFound = () => Object.keys(S.cx).filter((k) => +k < CXN).length;
const cxK = (ti) => (S.cx[ti] == null ? -1 : S.cx[ti]);
const cxLv = (ti) => { const k = cxK(ti); if (k < 0) return -1; const b = cxBoss(ti); return k >= (b ? 3 : 100) ? 2 : k >= (b ? 1 : 20) ? 1 : 0; };
const cxMastered = () => cxList().filter((i) => cxLv(i) >= 2).length;
function cxSeen(ti) {
  if (!trk() || S.cx[ti] != null) return;
  S.cx[ti] = 0;
  dirty = 1;
  qEv("new", 1);
  if (tq.length < 2) toast("📖 Sách Quái: " + cxName(ti), "#9ad8ff", "Trang mới đã mở");   // không dồn hàng thông báo
}
const CXL = [
  ["Chú slime nhỏ nhất khu rừng, hay đi thành bầy.", "Để chúng lại gần rồi quét bằng một loạt đạn."],
  ["Slime vùng nước, nhanh nhẹn hơn slime cỏ một chút.", "Máu thấp: Đa mục tiêu dọn rất nhanh."],
  ["Mang sắc tím huyền bí, đòn đánh đau hơn.", "Hạ sớm trước khi chúng dồn lại thành đám."],
  ["Lớp vỏ đá giúp nó trâu hơn hẳn.", "Sức mạnh và Chí mạng phá vỏ tốt nhất."],
  ["Cháy âm ỉ và di chuyển khá nhanh.", "Hạ từ xa, đừng để chúng chạm tới."],
  ["Máu dày, độc tố làm đòn đánh đau.", "Thiêu đốt cộng sát thương theo thời gian rất hợp."],
  ["Slime thường mạnh nhất, lấp lánh như ngọc.", "Rơi nhiều vàng: nên ưu tiên hạ."],
  ["Boss đầu tiên, đội vương miện vàng. Chưa có chiêu đặc biệt.", "Chuẩn bị đủ sát thương trước phút thứ 2."],
  ["Bay lượn lên xuống thất thường.", "Đạn tự nhắm đuổi theo: nhiều đạn sẽ bắt kịp."],
  ["Nhanh như chớp nhưng rất giòn.", "Nổ lan và Thiêu đốt xử lý gọn."],
  ["Chậm chạp, máu dày, nuốt đạn như uống nước.", "Chậm nên Thiêu đốt có nhiều thời gian phát huy."],
  ["Lăn nhanh vào mục tiêu, thân đầy gai.", "Choáng làm nó khựng lại ngay."],
  ["Lơ lửng bay lượn, di chuyển khó đoán.", "Sọ Ma do Boss gọi cũng là loại này nhưng yếu hơn."],
  ["Lớp giáp dày nhất trong các quái thường.", "Phá Huyết gây thêm % máu: rất hiệu quả."],
  ["Lao từ trên cao xuống với tốc độ lớn.", "Đừng để chúng dồn lại: Cuồng Phong giúp đẩy lùi."],
  ["Boss thứ hai, phun lửa nhanh và dồn dập.", "Tường Lửa giúp qua những đợt công của nó."]
];
const MVT = { hop: "nhảy cóc, mỗi lần đáp đất tạo sóng xung kích", stomp: "dậm chân nặng nề, đáp xuống rung chuyển", dash: "đi chậm rồi thỉnh thoảng lao vọt về phía bạn", sway: "lắc lư chậm rãi tiến tới", swoop: "bay lượn trên không rồi sà xuống", float: "lơ lửng giữa không trung", phase: "chập chờn lúc ẩn lúc hiện", void: "trôi dạt giữa hư không" };
const KINDT = { "": "Slime", bat: "Dơi", bee: "Ong", shroom: "Nấm", hog: "Nhím", ghost: "Ma", beetle: "Bọ", bird: "Chim", dragon: "Rồng" };

/* Vẽ một trang quái vào canvas (quái thường vẽ bằng chính hàm slime() của game; Boss dùng ảnh) */
function cxDraw(cv, ti, anim) {
  const c = cv.getContext("2d"), W_ = cv.width, H_ = cv.height, lv = cxLv(ti);
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.clearRect(0, 0, W_, H_);
  c.imageSmoothingEnabled = false;
  const bob = anim ? Math.sin(CT * 3) * 2 : 0;
  if (ti >= BOSS0) {
    const b = BOSS[ti - BOSS0], im = BI[b.i];
    if (ld(im)) {
      const s = Math.min((W_ * 0.86) / im.naturalWidth, (H_ * 0.86) / im.naturalHeight), w = im.naturalWidth * s, h = im.naturalHeight * s;
      c.drawImage(im, (W_ - w) / 2, (H_ - h) / 2 + bob, w, h);
    }
  } else {
    const d = SL[ti], w = d[6], h = Math.round(w * 0.7), z = d[8] || 0, sc = Math.min((W_ * 0.78) / (w + 6), (H_ * 0.8) / (h + z + 8), 4);
    const m = { ti, k: d[7] || "", z, z0: z, w, h, x: 0, ph: 0, fl: 0, b: null, hp: 1, mx: 1, dead: 0, en: 9, st: 0 };
    const ox = x;
    try {
      x = c;
      c.setTransform(sc, 0, 0, sc, W_ / 2, H_ - 6 + bob - GY * sc);
      slime(m);
    } catch (e) { /* bỏ qua: vẽ thất bại không được làm hỏng giao diện */ } finally { x = ox; }
    c.setTransform(1, 0, 0, 1, 0, 0);
  }
  if (lv < 0) {   // chưa gặp: bóng đen và dấu ?
    c.globalCompositeOperation = "source-atop";
    c.fillStyle = "#0b1022";
    c.fillRect(0, 0, W_, H_);
    c.globalCompositeOperation = "source-over";
    c.fillStyle = "#5f6a8f";
    c.font = "900 " + Math.round(H_ * 0.4) + "px Montserrat, sans-serif";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText("?", W_ / 2, H_ / 2);
  }
}
function cxInfo(ti) {
  const lv = cxLv(ti), k = cxK(ti), b = cxBoss(ti), bs = ti >= BOSS0 ? BOSS[ti - BOSS0] : null, d = SL[ti];
  if (lv < 0) return `<p class="cxu">Chưa gặp. Hãy tiếp tục chiến đấu để gặp quái này.</p>`;
  const need = lv < 2 ? (b ? (lv === 0 ? 1 : 3) : lv === 0 ? 20 : 100) : 0;
  let h = `<p class="cxk">Đã hạ: <b>${fmtP(k)}</b>${need ? ` · mở thêm thông tin khi hạ <b>${need}</b>` : ""}</p>`;
  const stars = "★".repeat(lv + 1) + "☆".repeat(2 - lv);
  h += `<p class="cxs">${stars}</p>`;
  const desc = bs ? `Boss ${ti - BOSS0 + 3}. Kiểu di chuyển: ${MVT[bs.mv] || bs.mv}.` : CXL[ti][0];
  if (lv >= 1 || !b) h += `<p class="cxd">${desc}</p>`;
  if (lv >= 1) {
    const hp = bs ? bs.hp : d[2], dm = bs ? bs.dm : d[3], g = bs ? bs.g : d[4], sp = bs ? bs.sp : d[5];
    h += `<div class="cxg"><span>Máu gốc<b>${fmtP(hp)}</b></span><span>Sát thương<b>${dm}</b></span><span>Vàng rơi<b>${fmtP(g)}</b></span><span>Tốc độ<b>${sp}</b></span></div>`;
    h += `<p class="cxn">Chỉ số gốc; máu, sát thương và vàng tăng dần theo đợt và theo chế độ.</p>`;
  } else h += `<p class="cxu">Hạ thêm để xem chỉ số.</p>`;
  if (lv >= 2) {
    if (bs) h += `<p class="cxt"><b>Chiêu thức</b></p>` + bs.sk.map((q) => `<p class="cxb"><i style="color:${BSK[q].c}">${BSK[q].n}</i>: ${BSK[q].d}</p>`).join("");
    else h += `<p class="cxt"><b>Mẹo</b>: ${CXL[ti][1]}</p>`;
    if (bs) h += `<p class="cxt"><b>Mẹo</b>: Choáng ngắt chiêu khi Boss đang báo trước; Tường Lửa chặn cả sát thương lẫn hiệu ứng xấu.</p>`;
  } else if (b && bs) h += `<p class="cxu">Hạ thêm để xem chiêu thức của Boss.</p>`;
  else if (!b) h += `<p class="cxu">Hạ thêm để xem mẹo đối phó.</p>`;
  return h;
}

/* ---------- Nhiệm vụ hằng ngày ---------- */
const pwf = () => 1 + Math.min(3, (S.pr.bw || 0) / 60);
const rd = (n, q) => Math.max(q, Math.round(n / q) * q);
const QD = {
  kill1: { tier: 1, ev: "kill", t: (n) => `Hạ ${n} quái`, g: () => rd(120 * pwf(), 10) },
  chest1: { tier: 1, ev: "chest", t: (n) => `Mở ${n} rương kho báu`, g: () => 3 },
  buy1: { tier: 1, ev: "buy", t: (n) => `Nâng cấp thẻ ${n} lần`, g: () => 5 },
  crit1: { tier: 1, ev: "crit", t: (n) => `Tung ${n} đòn chí mạng`, g: () => rd(150 * pwf(), 10) },
  new1: { tier: 1, ev: "new", t: () => "Gặp một quái mới trong Sách Quái", g: () => 1, req: () => cxFound() < CXN },
  kill2: { tier: 2, ev: "kill", t: (n) => `Hạ ${n} quái`, g: () => rd(320 * pwf(), 10) },
  chest2: { tier: 2, ev: "chest", t: (n) => `Mở ${n} rương kho báu`, g: () => 6 },
  wave2: { tier: 2, ev: "wave", max: 1, t: (n) => `Đạt đợt ${n} trong một lượt`, g: () => Math.max(6, Math.round(S.pr.bw * 0.5)) },
  crit2: { tier: 2, ev: "crit", t: (n) => `Tung ${n} đòn chí mạng`, g: () => rd(500 * pwf(), 50) },
  fly2: { tier: 2, ev: "fly", t: (n) => `Hạ ${n} quái bay`, g: () => rd(30 * pwf(), 5), req: () => S.pr.bw >= 8 },
  buy2: { tier: 2, ev: "buy", t: (n) => `Nâng cấp thẻ ${n} lần`, g: () => 10 },
  intr2: { tier: 2, ev: "intr", t: (n) => `Ngắt ${n} chiêu Boss bằng Choáng`, g: () => 3, req: () => S.lv.stun > 0 && S.pr.bw >= 12 },
  surv2: { tier: 2, ev: "surv", max: 1, t: (n) => `Sống sót ${n} phút trong một lượt`, g: () => 6 },
  boss3: { tier: 3, ev: "boss", t: (n) => `Hạ ${n} Boss`, g: () => Math.min(3, 1 + Math.floor(S.pr.bw / 40)), req: () => S.pr.bw >= 6 },
  nohit3: { tier: 3, ev: "nohit", t: () => "Hạ một Boss mà không mất máu", g: () => 1, req: () => S.pr.bw >= 12 },
  wave3: { tier: 3, ev: "wave", max: 1, t: (n) => `Đạt đợt ${n} trong một lượt`, g: () => Math.max(10, Math.round(S.pr.bw * 0.8)) },
  surv3: { tier: 3, ev: "surv", max: 1, t: (n) => `Sống sót ${n} phút trong một lượt`, g: () => 12 },
  kill3: { tier: 3, ev: "kill", t: (n) => `Hạ ${n} quái`, g: () => rd(800 * pwf(), 50) },
  gale3: { tier: 3, ev: "gale", t: (n) => `Kích hoạt Cuồng Phong ${n} lần`, g: () => 6, req: () => S.sk.gale > 0 },
  intr3: { tier: 3, ev: "intr", t: (n) => `Ngắt ${n} chiêu Boss bằng Choáng`, g: () => 6, req: () => S.lv.stun > 0 && S.pr.bw >= 12 },
  crit3: { tier: 3, ev: "crit", t: (n) => `Tung ${n} đòn chí mạng`, g: () => rd(1500 * pwf(), 100) }
};
const QR = [30, 50, 90], QBONUS = 120;   // thưởng theo "đơn vị vàng"
const unit = () => 5 * SC.gd((Math.max(1, S.pr.bw) - 1) * 20) * DF().gd;
const dstr = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
const today = () => dstr(new Date());
const yesterday = () => { const d = new Date(); d.setDate(d.getDate() - 1); return dstr(d); };
function seeded(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
  return () => { h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296; };
}
const qMake = (k) => ({ k, g: QD[k].g(), p: 0, c: 0 });
function qPick(tier, used, rn) {
  const ok = Object.keys(QD).filter((k) => QD[k].tier === tier && !used.includes(k) && (!QD[k].req || QD[k].req()));
  return ok.length ? ok[Math.floor(rn() * ok.length)] : null;
}
/* Kiểm tra / làm mới nhiệm vụ khi sang ngày mới */
function dqEnsure() {
  const t = today();
  let q = S.dq;
  const valid = q && typeof q === "object" && Array.isArray(q.q) && q.q.length === 3 && q.q.every((e) => e && QD[e.k]);
  if (valid && q.d === t) return;
  const old = valid ? q : null;
  const rn = seeded(t + "|" + (S.pr.bw >> 3)), used = [], arr = [];
  for (let i = 0; i < 3; i++) { const k = qPick(i + 1, used, rn) || qPick(i + 1, [], rn) || "kill" + (i + 1); used.push(k); arr.push(qMake(k)); }
  S.dq = { d: t, q: arr, rr: 0, bn: 0, st: old && old.st > 0 ? old.st : 0, ls: old ? old.ls || "" : "" };
  if (S.dq.ls && S.dq.ls !== yesterday() && S.dq.ls !== t) S.dq.st = 0;   // lỡ một ngày: mất chuỗi
  dirty = 1;
}
function qEv(e, n) {
  if (!trk()) return;
  dqEnsure();
  for (const q of S.dq.q) {
    const d = QD[q.k];
    if (d.ev !== e || q.p >= q.g) continue;
    q.p = d.max ? Math.max(q.p, Math.min(q.g, n)) : Math.min(q.g, q.p + n);
    if (q.p >= q.g) { toast("📜 Nhiệm vụ hoàn thành", "#8dff9a", d.t(q.g)); try { sfx("buy") } catch (x_) { } }
    dirty = 1;
  }
}
const qCan = () => { const q = S.dq; if (!q) return 0; return q.q.some((e) => e.p >= e.g && !e.c) || (q.q.every((e) => e.c) && !q.bn) ? 1 : 0; };
const qMult = () => 1 + 0.1 * Math.min(5, S.dq ? (S.dq.st | 0) : 0);
function qClaim(i) {
  dqEnsure();
  const e = S.dq.q[i];
  if (!e || e.c || e.p < e.g) return;
  const g = Math.round(QR[QD[e.k].tier - 1] * unit() * qMult());
  e.c = 1; S.gold += g; S.pr.gold += g; dirty = 1; save();
  toast("+" + fmtP(g) + " vàng", "#ffd23a", "Phần thưởng nhiệm vụ");
  sfx("buy");
}
function qBonus() {
  dqEnsure();
  const q = S.dq;
  if (q.bn || !q.q.every((e) => e.c)) return;
  const g = Math.round(QBONUS * unit() * qMult());
  q.bn = 1;
  q.st = q.ls === yesterday() ? q.st + 1 : q.ls === today() ? q.st : 1;
  q.ls = today();
  S.gold += g; S.pr.gold += g; dirty = 1; save();
  toast("+" + fmtP(g) + " vàng", "#ffd23a", "Rương Ngày · chuỗi " + q.st + " ngày");
  sfx("evo");
}
function qReroll(i) {
  dqEnsure();
  const q = S.dq, e = q.q[i];
  if (!e || q.rr || e.c || e.p >= e.g) return;
  const k = qPick(QD[e.k].tier, q.q.map((x_) => x_.k), Math.random);
  if (!k) return;
  q.q[i] = qMake(k);
  q.rr = 1; dirty = 1; save();
  sfx("ui");
}

/* ---------- Sự kiện từ game ---------- */
function ev(t, n, m) {
  if (!trk()) return;
  const P = S.pr;
  switch (t) {
    case "kill":
      P.gold += n; qEv("kill", 1);
      if (m) {
        if (S.cx[m.ti] != null) S.cx[m.ti]++;
        if (m.k === "boss") { P.bk++; qEv("boss", 1); if (m.l0 === R.lost) { P.nh++; qEv("nohit", 1); } }
        else if (m.z0 > 0) qEv("fly", 1);
      }
      break;
    case "crit": P.cr++; qEv("crit", 1); if (n > P.mh) P.mh = n; break;
    case "hit": if (n > P.mh) P.mh = n; break;
    case "chest": P.ch++; P.gold += n || 0; qEv("chest", 1); break;
    case "intr": P.it++; qEv("intr", 1); break;
    case "gale": P.gl++; qEv("gale", 1); break;
    case "rv": P.rv++; break;
    case "heal": P.hl += n; break;
    case "buy": P.up++; qEv("buy", 1); break;
    case "wave":
      if (n > P.bw) P.bw = n;
      { const di = Math.max(0, DIFF.indexOf(DF())); if (n > P.bwd[di]) P.bwd[di] = n; }
      qEv("wave", n);
      break;
    case "surv": qEv("surv", n); break;
    case "tap": P.tp++; break;
    case "run": P.runs++; if (new Date().getHours() < 4) P.nl = 1; break;
    case "dead": if (n <= 1) P.fd = 1; break;
  }
}

/* ---------- Giao diện Hồ sơ ---------- */
let hTab = "q", hFrom = "menu", hSel = 0, hubT = 0;
const HTABS = [["a", "THÀNH TỰU"], ["q", "NHIỆM VỤ"], ["c", "SÁCH QUÁI"]];
const hDot = (id) => (id === "q" ? qCan() : id === "a" ? achTotal() > S.ax : 0);
function openHub(tab, from) {
  hFrom = from || (scr === "hub" ? hFrom : scr) || "menu";
  if (hFrom === "hub") hFrom = "menu";
  hTab = tab || hTab;
  if (trk()) { dqEnsure(); achCheck(); }
  renderHub();
  show("hub");
  clearInterval(hubT);
  hubT = setInterval(hTick, 1000);
}
function closeHub() {
  clearInterval(hubT);
  if (hTab === "a") S.ax = achTotal();
  save();
  if (hFrom === "pause") show("pause");
  else if (hFrom === "over") show("over");
  else { show("menu"); hdots(); }
}
function hdots() {
  document.querySelectorAll("[data-hd]").forEach((e) => e.classList.toggle("on", !!hDot(e.dataset.hd)));
}
function hTick() {
  if (scr !== "hub") return clearInterval(hubT);
  if (hTab === "q") {
    const e = $("hcd");
    if (e) { const n = new Date(), m = new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1) - n, s = Math.floor(m / 1000); e.textContent = String(Math.floor(s / 3600)).padStart(2, "0") + ":" + String(Math.floor((s % 3600) / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0"); if (s === 0) { dqEnsure(); renderHub() } }
  } else if (hTab === "c") { const c = $("cxbig"); if (c) cxDraw(c, hSel, true); }
}
function renderHub() {
  $("htabs").innerHTML = HTABS.map(([id, n]) => `<button type="button" class="tab${id === hTab ? " on" : ""}" data-a="htab" data-k="${id}">${n}${hDot(id) && id !== hTab ? '<span class="dot"></span>' : ""}</button>`).join("");
  const b = $("hbody");
  if (hTab === "a") b.innerHTML = htmlAch();
  else if (hTab === "q") b.innerHTML = htmlQuest();
  else { b.innerHTML = htmlCodex(); cxPaint(); }
  b.scrollTop = 0;
  hTick();
}
function medals(a) {
  const n = ACHN(a), g = achGot(a);
  return Array.from({ length: n }, (_, i) => `<i class="hmd m${n === 1 ? 3 : i + 1}${i < g ? " on" : ""}"></i>`).join("");
}
function htmlAch() {
  const ap = achPoints(), tl = titles(), cur = titleText();
  let h = `<div class="hsum"><span>Điểm thành tựu: <b>${ap}</b> · Hạng: <b>${rankOf(ap)}</b> · Đã đạt <b>${achTotal()}</b>/${ACH.reduce((s, a) => s + ACHN(a), 0)}</span><button type="button" class="b s" data-a="htitle">Danh hiệu: ${cur === "DINO" ? "Mặc định" : cur} ▸</button></div>`;
  if (!trk()) h += `<p class="hwarn">Bảng Mod đang BẬT: tiến trình mới không được tính.</p>`;
  h += `<div class="hlist">`;
  for (const a of ACH) {
    const g = achGot(a), n = ACHN(a), done = g >= n, hidden = a.hid && !g, nxt = done ? n - 1 : g, thr = a.t[nxt], v = a.v();
    const pct = done ? 100 : Math.min(100, (v / thr) * 100);
    const val = (x_) => (a.id === "time" ? +x_.toFixed(1) : fmtA(x_));
    h += `<div class="hrow a${done ? " done" : ""}${hidden ? " hid" : ""}"><span class="hico">${hidden ? "?" : a.ic}</span><div class="hmid"><b>${hidden ? "???" : a.n}</b><small>${hidden ? a.hid : a.d.replace("{n}", fmtA(thr))}</small>${hidden ? "" : `<div class="hbar"><u style="width:${pct.toFixed(1)}%"></u></div>`}</div><div class="hrt">${hidden ? "" : `<span class="hpv">${done ? "Hoàn thành" : val(v) + " / " + fmtA(thr)}</span>`}<span class="hmds">${medals(a)}</span></div></div>`;
  }
  return h + `</div>`;
}
function htmlQuest() {
  dqEnsure();
  const q = S.dq, mu = qMult(), u = unit(), all = q.q.every((e) => e.c);
  let h = `<div class="hsum"><span>🔥 Chuỗi: <b>${q.st | 0}</b> ngày · Thưởng <b>+${Math.round((mu - 1) * 100)}%</b></span><span>Làm mới sau: <b id="hcd">--:--:--</b></span></div>`;
  if (!trk()) h += `<p class="hwarn">Bảng Mod đang BẬT: tiến trình nhiệm vụ không được tính.</p>`;
  h += `<div class="hlist">`;
  q.q.forEach((e, i) => {
    const d = QD[e.k], done = e.p >= e.g, rw = Math.round(QR[d.tier - 1] * u * mu);
    h += `<div class="hrow q t${d.tier}${e.c ? " done" : ""}"><span class="hico">${["I", "II", "III"][d.tier - 1]}</span><div class="hmid"><b>${d.t(fmtP(e.g))}</b><small>Thưởng: ${fmtP(rw)} vàng</small><div class="hbar"><u style="width:${Math.min(100, (e.p / e.g) * 100).toFixed(1)}%"></u></div></div><div class="hrt"><span class="hpv">${fmtP(e.p)} / ${fmtP(e.g)}</span>${e.c ? `<span class="hok">Đã nhận</span>` : done ? `<button type="button" class="b s" data-a="qclaim" data-k="${i}">Nhận</button>` : q.rr ? "" : `<button type="button" class="b sm" data-a="qrr" data-k="${i}">Đổi</button>`}</div></div>`;
  });
  const bg = Math.round(QBONUS * u * mu);
  h += `<div class="hrow q bonus${q.bn ? " done" : ""}"><span class="hico">★</span><div class="hmid"><b>Rương Ngày</b><small>Hoàn thành cả 3 nhiệm vụ để nhận ${fmtP(bg)} vàng và tăng chuỗi ngày</small></div><div class="hrt">${q.bn ? `<span class="hok">Đã nhận</span>` : all ? `<button type="button" class="b s" data-a="qbonus">Nhận</button>` : `<span class="hpv">${q.q.filter((e) => e.c).length} / 3</span>`}</div></div>`;
  h += `</div><p class="hnote">Mỗi ngày bạn được đổi 1 nhiệm vụ chưa làm (nút "Đổi"). Nhiệm vụ lấy theo tiến độ hiện tại của bạn và đổi mới lúc 0 giờ.</p>`;
  return h;
}
function htmlCodex() {
  const f = cxFound(), m = cxMastered();
  let h = `<div class="hsum"><span>Đã gặp: <b>${f}</b>/${CXN} · Thông thạo: <b>${m}</b>/${CXN}</span><span class="hnote">Chạm vào một trang để xem chi tiết</span></div><div class="cxw"><div class="cxgrid">`;
  const sec = (title, ids) => `<p class="cxh">${title}</p>` + ids.map((ti) => `<button type="button" class="cxc${ti === hSel ? " on" : ""}${cxLv(ti) < 0 ? " un" : ""}${cxLv(ti) >= 2 ? " ms" : ""}" data-a="cxsel" data-k="${ti}" aria-label="${cxLv(ti) < 0 ? "Chưa gặp" : cxName(ti)}"><canvas class="cxi" data-ti="${ti}" width="64" height="64"></canvas></button>`).join("");
  const mons = cxList().filter((i) => !cxBoss(i)), bos = cxList().filter((i) => cxBoss(i));
  h += sec("QUÁI THƯỜNG", mons) + sec("BOSS", bos) + `</div><div class="cxdet" id="cxdet">${cxDet()}</div></div>`;
  return h;
}
const cxDet = () => `<canvas id="cxbig" width="150" height="130"></canvas><h3 class="cxn_">${cxLv(hSel) < 0 ? "???" : cxName(hSel)}</h3><p class="cxy">${cxBoss(hSel) ? "Boss" : KINDT[SL[hSel][7] || ""]}</p>${cxInfo(hSel)}`;
function cxPaint() {
  document.querySelectorAll("#hbody canvas.cxi").forEach((c) => cxDraw(c, +c.dataset.ti, false));
  const b = $("cxbig");
  if (b) cxDraw(b, hSel, true);
}

/* Điều khiển từ ui.js (act) */
function hubAct(a, k) {
  switch (a) {
    case "hub": sfx("ui"); openHub(k || "q"); return true;
    case "hubclose": closeHub(); return true;
    case "htab": sfx("ui"); if (hTab === "a") S.ax = achTotal(); hTab = k; renderHub(); return true;
    case "qclaim": qClaim(+k); renderHub(); return true;
    case "qbonus": qBonus(); renderHub(); return true;
    case "qrr": qReroll(+k); renderHub(); return true;
    case "htitle": {
      const l = [{ id: "dino" }, ...titles()], i = l.findIndex((q) => q.id === S.tt);
      S.tt = l[(i + 1) % l.length].id; save(); sfx("ui"); renderHub(); return true;
    }
    case "cxsel": sfx("ui"); hSel = +k; document.querySelectorAll("#hbody .cxc").forEach((e) => e.classList.toggle("on", +e.dataset.k === hSel)); $("cxdet").innerHTML = cxDet(); cxDraw($("cxbig"), hSel, true); return true;
  }
  return false;
}
hdots();
setInterval(() => { if (R && R.al) return; hdots(); }, 4000);

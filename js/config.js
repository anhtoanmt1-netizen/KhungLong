/* ===== Cấu hình và số liệu cân bằng: phiên bản, hằng số khung chơi, bảng nâng cấp (UP), quái (SL), kỹ năng (SK), tiến hóa (EVO), rương (CHR). ===== */
const VERSION = "2.1";
const $ = (i) => document.getElementById(i), rnd = Math.random;
const W = 640, H = 360, GY = 280, DX = 96, K = "pds_save_v1";
const CFG = { iframe: 0.5, maxMon: 34, crit: 0.05, leafSpd: 340, chestP: 0.3, chestW: 20, chestDec: 0.01, chestMin: 0.03, chestH: 20, chestSpd: 90,
  rateCap: 6, defCap: 0.6, burnTau: 1.1, burnT: 3.2, stunImm: 1.4, bossStunK: 0.35, bossImm: 5, execIcd: 0.35, evoHp: 30, evoDmg: 0.12, evoCrit: 1, evoGold: 5 };
/* ----- Độ khó theo thời gian t (giây). w = t/20 = số đợt. Quái, Boss và vàng tăng theo các hàm này (v2.1: tăng nhanh hơn bản cũ, có "bức tường" ở hậu kỳ). ----- */
const SC = {
  hp: (t) => { const w = t / 20; return (1 + 0.25 * w + 0.012 * w * w) * Math.pow(1.004, w) },
  dm: (t) => { const w = t / 20; return 1 + 0.035 * w + 0.00015 * w * w },
  gd: (t) => { const w = t / 20; return 2 + 0.14 * w + 0.0006 * w * w },
  sp: (t) => 1 + Math.min(0.6, t / 500),
  bh: (t) => 1 + t / 1500,
  bd: (t) => 1 + t / 8000,
  si: (t) => Math.max(0.3, 2.2 - t * 0.0075)
};
/* Rương thưởng: g = bội số của "đơn vị vàng" (= 5 × SC.gd(t), tức vàng của một quái nhỏ ở thời điểm đó); x = nhân đôi vàng hiện có nhưng tối đa 100 đơn vị */
const CHR = [{ g: 5 }, { g: 10 }, { g: 20 }, { g: 40 }, { g: 80 }, { g: 160 }, { x: 2 }], CUK = ["bg", "tree", "leaf", "grass"];
/* Nâng cấp theo cấp: giá = b × g^cấp, m = cấp tối đa, f(cấp) = giá trị hiển thị. */
const UP = {
  hp: { n: "Sinh lực", b: 18, g: 1.391, m: 40, f: (l) => 80 + 20 * l, u: " HP" },
  dmg: { n: "Sức mạnh", b: 22, g: 1.391, m: 40, f: (l) => 6 + 3 * l, u: " sát thương" },
  rate: { n: "Tốc độ bắn", b: 30, g: 1.437, m: 30, f: (l) => +(1 + 0.1 * l).toFixed(1), u: " đạn/giây" },
  multi: { n: "Đa mục tiêu", b: 150, g: 2.84, m: 6, f: (l) => 1 + l, u: " đạn/lần" },
  critR: { n: "Tỷ lệ chí mạng", b: 55, g: 1.414, m: 30, f: (l) => +(5 + 1.5 * l).toFixed(1), u: "% chí mạng" },
  critD: { n: "Sát thương chí mạng", b: 70, g: 1.414, m: 30, f: (l) => 200 + 8 * l, u: "% sát thương" },
  regen: { n: "Hồi phục", b: 40, g: 1.518, m: 20, f: (l) => +(1.5 * l).toFixed(1), u: " HP/giây" },
  def: { n: "Phòng thủ", b: 60, g: 1.518, m: 20, f: (l) => 3 * l, u: "% giảm sát thương" },
  steal: { n: "Hút máu", b: 90, g: 1.575, m: 15, f: (l) => 2 * l, u: "% sát thương" },
  gold: { n: "Kinh tế", b: 70, g: 1.483, m: 20, f: (l) => 100 + 10 * l, u: "% vàng" },
  burn: { n: "Thiêu đốt", b: 120, g: 1.483, m: 20, f: (l) => 10 + 4 * l, u: "% sát thương lửa" },
  stun: { n: "Choáng", b: 150, g: 1.575, m: 15, f: (l) => +(3 + 1.8 * l).toFixed(1), u: "% choáng" }
};
const SL = [["Slime Cỏ", "#6fcf4f", 10, 2, 2, 22, 14], ["Slime Lam", "#4a8cff", 20, 3, 4, 24, 15], ["Slime Tím", "#b08cff", 36, 4, 7, 26, 16], ["Slime Đá", "#8aa0a8", 70, 6, 12, 20, 18], ["Slime Lửa", "#ff7a3a", 120, 8, 20, 28, 18], ["Slime Độc", "#2f9a3a", 200, 10, 35, 26, 20], ["Slime Pha Lê", "#4fe8f0", 330, 14, 60, 30, 20], ["Slime Vua", "#e8c040", 520, 14, 200, 18, 34], ["Dơi Tím", "#8a4fd0", 32, 4, 6, 40, 20, "bat", 48], ["Ong Vàng", "#ffcc20", 22, 5, 8, 46, 16, "bee", 58], ["Nấm Độc", "#e0403a", 110, 7, 14, 14, 28, "shroom", 0], ["Nhím Gai", "#9a6a40", 90, 9, 18, 40, 24, "hog", 0], ["Bóng Ma", "#e8f0ff", 150, 11, 26, 22, 26, "ghost", 54], ["Bọ Giáp", "#2a8fa0", 330, 14, 40, 12, 34, "beetle", 0], ["Chim Lửa", "#ff8a3a", 260, 16, 50, 36, 30, "bird", 66], ["Rồng Con", "#d03a5a", 1100, 20, 500, 16, 48, "dragon", 70]], NU = [[8, 3], [9, 4], [10, 5], [11, 6], [12, 8], [13, 10], [14, 12]];
/* ----- Kỹ năng (SK) có 5 cấp. c = giá cấp 1, g = hệ số tăng giá mỗi cấp, e = bậc tiến hóa cần có để mở cấp 1, f(cấp) = chữ hiển thị trên thẻ.
   SKV = thông số chiến đấu theo cấp (dùng trong game.js / skills.js). ----- */
const SK = {
  pierce: { n: "Lửa Xanh Xuyên Phá", c: 800, g: 3.6, m: 5, e: 1, f: (l) => (l + 2) + " quái" },
  boom: { n: "Lửa Bùng Nổ", c: 2000, g: 3.6, m: 5, e: 2, f: (l) => Math.round(40 + 10 * l) + "% lan" },
  storm: { n: "Bão Lửa", c: 5000, g: 3.6, m: 5, e: 3, f: (l) => (6 + 2 * l) + " đạn · " + +(16.5 - 1.5 * l).toFixed(1) + "s" },
  revive: { n: "Phượng Hoàng Lửa", c: 1800, g: 3.6, m: 5, e: 1, f: (l) => "hồi chiêu " + (67 - 7 * l) + "s" },
  ancient: { n: "Hỏa Ngục Cổ Đại", c: 8000, g: 3.6, m: 5, e: 4, f: (l) => "+" + Math.round(40 + 10 * l) + "% · " + +(5.5 + 0.5 * l) + "s" },
  wall: { n: "Tường Lửa", c: 3000, g: 3.6, m: 5, e: 2, f: (l) => +(2.6 + 0.4 * l).toFixed(1) + "s bất tử" },
  gale: { n: "Cuồng Phong Hộ Thân", c: 4000, g: 3.6, m: 5, e: 3, f: (l) => "hồi chiêu " + +(15.4 - 1.4 * l).toFixed(1) + "s" },
  exec: { n: "Phá Huyết", c: 6000, g: 3.6, m: 5, e: 4, f: (l) => [0, 5, 10, 20, 30, 40][l] + "% cơ hội" }
};
const SKV = {
  pierce: (l) => ({ n: l + 2 }),
  boom: (l) => ({ sp: 0.4 + 0.1 * l, r: 22 + 4 * l }),
  storm: (l) => ({ cd: 16.5 - 1.5 * l, n: 6 + 2 * l }),
  revive: (l) => ({ cd: 67 - 7 * l, hp: 0.1 * (l - 1), inv: 1.5 + 0.25 * (l - 1) }),
  ancient: (l) => ({ cd: 21.5 - 1.5 * l, dur: 5.5 + 0.5 * l, b: 1.4 + 0.1 * l }),
  wall: (l) => ({ cd: 21.5 - 1.5 * l, dur: 2.6 + 0.4 * l }),
  gale: (l) => ({ cd: 15.4 - 1.4 * l, need: l >= 4 ? 2 : 3, zone: 56, r: 110 + 12 * l, kb: 520 + 60 * l, dm: 0.6 + 0.4 * l, dz: 0.4 + 0.1 * l }),
  exec: (l) => ({ p: [0, 0.05, 0.1, 0.2, 0.3, 0.4][l], pn: 0.02, pb: 0.005 })
};
/* Chế độ độ khó (chọn khi bắt đầu game mới, lưu trong S.df). hp/dm: nhân máu / sát thương quái và Boss; gd: nhân vàng rơi và rương
   (chế độ khó thưởng nhiều vàng hơn để vẫn max hết nâng cấp trong khoảng 2 giờ); si: nhân thời gian giữa 2 lần sinh quái (nhỏ hơn = đông hơn). */
const DIFF = [
  { n: "Thường", c: "#7ee06a", d: "Cân bằng. Phù hợp để làm quen.", hp: 1, dm: 1, gd: 1, si: 1 },
  { n: "Khó", c: "#ffb23a", d: "Quái trâu và đau hơn, đông hơn; vàng rơi nhiều hơn.", hp: 1.8, dm: 1.5, gd: 1.2, si: 0.85 },
  { n: "Địa ngục", c: "#ff4a4a", d: "Quái cực mạnh, dồn dập. Thưởng vàng lớn.", hp: 3.2, dm: 2.4, gd: 1.5, si: 0.7 }
];
const DF = () => DIFF[(S && S.df) | 0] || DIFF[0];
/* Tiến hóa: [tên, vàng, số quái đã hạ, màu]. Mỗi bậc: +12% sát thương, +30 HP, +1% chí mạng, +5% vàng (xem CFG.evo*). */
const EVO = [["Cỏ Non", 0, 0, "#58c24a"], ["Thợ Săn", 800, 60, "#4ac2c9"], ["Chiến Binh", 4000, 200, "#ffd23a"], ["Cổ Đại", 18000, 600, "#ff7a3a"], ["Huyền Thoại", 80000, 1500, "#c06aff"], ["Tối Cao", 360000, 3500, "#ffffff"], ["Thần Thú", 1400000, 7e3, "#ff4a8a"], ["Long Vương", 5000000, 12e3, "#3affc8"]];
/* ----- 12 Boss (v2.1: máu/sát thương/vàng gốc tăng ~2x, thêm SC.bh/SC.bd tăng theo thời gian) (ảnh assets1/boss/boss01..12.png), xếp từ yếu đến mạnh. Chỉ số trong SL = 16 + thứ tự.
   mv = kiểu chuyển động: hop nhảy · dash lao nhanh · sway lắc nặng · stomp giậm chân · swoop vỗ cánh · float lơ lửng · phase mờ ảo · void hư không.
   z > 0 là Boss bay (lơ lửng, có thể lao xuống đánh). w = kích thước hiển thị mặc định (px). ===== */
const BOSS = [
  { n: "Hổ Lôi Hỏa",     c: "#ffa63a", hp: 2200, dm: 30, g: 600,  sp: 15, w: 54, mv: "hop",   z: 0,  ai: 1.3 },
  { n: "Khối Cầu Vồng",  c: "#6ae86a", hp: 2700, dm: 33, g: 800,  sp: 14, w: 56, mv: "hop",   z: 0,  ai: 1.3 },
  { n: "Sói Sét Tím",    c: "#b980ff", hp: 3400, dm: 36, g: 1050,  sp: 20, w: 58, mv: "dash",  z: 0,  ai: 1.2 },
  { n: "Yêu Lông Trắng", c: "#ffd6d6", hp: 4200, dm: 39, g: 1400,  sp: 13, w: 60, mv: "sway",  z: 0,  ai: 1.3 },
  { n: "Quỷ Nham Thạch", c: "#ff7a2a", hp: 5200, dm: 42, g: 1850, sp: 12, w: 62, mv: "stomp", z: 0,  ai: 1.4 },
  { n: "Băng Vương",     c: "#9eeeff", hp: 6500, dm: 46, g: 2400, sp: 12, w: 64, mv: "sway",  z: 0,  ai: 1.4 },
  { n: "Đại Bàng Tuyết", c: "#bfe6ff", hp: 8000, dm: 50, g: 3100, sp: 19, w: 66, mv: "swoop", z: 40, ai: 1.1 },
  { n: "Khối Mây Điện",  c: "#58b4ff", hp: 9800, dm: 54, g: 4000, sp: 16, w: 66, mv: "float", z: 34, ai: 1.2 },
  { n: "Hồ Ly Lửa",      c: "#ff6a4a", hp: 12000, dm: 58, g: 5200, sp: 17, w: 68, mv: "float", z: 38, ai: 1.1 },
  { n: "Ma Hỏa Lam",     c: "#66d4ff", hp: 15000, dm: 63, g: 6800, sp: 15, w: 70, mv: "phase", z: 34, ai: 1.2 },
  { n: "Tinh Vân",       c: "#c98aff", hp: 19000, dm: 68, g: 9000, sp: 14, w: 72, mv: "float", z: 40, ai: 1.2 },
  { n: "Hư Không",       c: "#e08aff", hp: 24000, dm: 74, g: 12000, sp: 13, w: 78, mv: "void",  z: 44, ai: 1.3 }
];
BOSS.forEach((b, i) => { b.i = i; b.src = "assets1/boss/boss" + String(i + 1).padStart(2, "0") + ".png"; SL.push([b.n, b.c, b.hp, b.dm, b.g, b.sp, b.w, "boss", b.z]) });
const BOSS0 = 16, BOSSORD = [7, 15, ...BOSS.map((b) => BOSS0 + b.i)];
/* Băm mật khẩu Mod (chỉ để không lưu chữ thô trong localStorage, không phải bảo mật thật sự) */
const hpw = (s) => { let h = 2166136261; for (const ch of "pds:" + s) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) } return (h >>> 0).toString(16) };
const MODPW = "111291";
const fmt = (t) => Math.floor(t / 60) + ":" + String(Math.floor(t % 60)).padStart(2, "0"), fmtN = (n) => n >= 1e6 ? (n / 1e6).toFixed(1).replace(".0", "") + "M" : n >= 1e5 ? Math.round(n / 1e3) + "K" : String(n);

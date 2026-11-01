/* ===== Cấu hình và số liệu cân bằng: phiên bản, hằng số khung chơi, bảng nâng cấp (UP), quái (SL), kỹ năng (SK), tiến hóa (EVO), rương (CHR). ===== */
const VERSION = "2.0";
const $ = (i) => document.getElementById(i), rnd = Math.random;
const W = 640, H = 360, GY = 280, DX = 96, K = "pds_save_v1";
const CFG = { iframe: 0.5, maxMon: 30, crit: 0.05, leafSpd: 340, chestP: 0.3, chestW: 20, chestDec: 0.01, chestMin: 0.03, chestH: 20, chestSpd: 90 };
const CHR = [{ g: 100 }, { g: 200 }, { g: 500 }, { g: 1e3 }, { g: 2e3 }, { g: 5e3 }, { x: 2 }], CUK = ["bg", "tree", "leaf", "grass"];
const UP = {
  hp: { n: "Sinh lực", b: 20, g: 1.5, m: 20, f: (l) => 50 + 10 * l, u: " HP" },
  dmg: { n: "Sức mạnh", b: 25, g: 1.5, m: 20, f: (l) => 5 + 2 * l, u: " sát thương" },
  rate: { n: "Tốc độ bắn", b: 30, g: 1.55, m: 20, f: (l) => +(1 + 0.1 * l).toFixed(1), u: " đạn/giây" },
  multi: { n: "Đa mục tiêu", b: 120, g: 2.4, m: 4, f: (l) => 1 + l, u: " đạn/lần" },
  regen: { n: "Hồi phục", b: 60, g: 1.6, m: 10, f: (l) => l, u: " HP/giây" },
  steal: { n: "Hút máu", b: 90, g: 1.7, m: 10, f: (l) => 5 * l, u: "% sát thương" },
  gold: { n: "Kinh tế", b: 70, g: 1.6, m: 10, f: (l) => 100 + 10 * l, u: "% vàng" },
  def: { n: "Phòng thủ", b: 80, g: 1.65, m: 10, f: (l) => 5 * l, u: "% giảm sát thương" }
};
const SL = [["Slime Cỏ", "#6fcf4f", 10, 2, 2, 22, 14], ["Slime Lam", "#4a8cff", 20, 3, 4, 24, 15], ["Slime Tím", "#b08cff", 35, 4, 7, 26, 16], ["Slime Đá", "#8aa0a8", 60, 5, 12, 20, 18], ["Slime Lửa", "#ff7a3a", 100, 7, 20, 28, 18], ["Slime Độc", "#2f9a3a", 160, 9, 35, 26, 20], ["Slime Pha Lê", "#4fe8f0", 250, 12, 60, 30, 20], ["Slime Vua", "#e8c040", 500, 18, 150, 18, 34], ["Dơi Tím", "#8a4fd0", 28, 4, 6, 40, 20, "bat", 48], ["Ong Vàng", "#ffcc20", 18, 5, 8, 46, 16, "bee", 58], ["Nấm Độc", "#e0403a", 90, 6, 14, 14, 28, "shroom", 0], ["Nhím Gai", "#9a6a40", 70, 8, 18, 40, 24, "hog", 0], ["Bóng Ma", "#e8f0ff", 120, 10, 26, 22, 26, "ghost", 54], ["Bọ Giáp", "#2a8fa0", 260, 12, 40, 12, 34, "beetle", 0], ["Chim Lửa", "#ff8a3a", 200, 14, 50, 36, 30, "bird", 66], ["Rồng Con", "#d03a5a", 900, 22, 300, 16, 48, "dragon", 70]], NU = [[8, 3], [9, 4], [10, 5], [11, 6], [12, 8], [13, 10], [14, 12]];
const SK = { storm: { n: "Bão Lửa", c: 300, e: 3, d: "Mỗi 15s bắn loạt 8 cầu lửa vàng" }, pierce: { n: "Lửa Xanh Xuyên Phá", c: 150, e: 1, d: "Cầu lửa xanh dài, xuyên 3 quái" }, boom: { n: "Lửa Bùng Nổ", c: 400, e: 2, d: "Vụ nổ lửa lớn + sóng xung kích, 50% sát thương lan" }, revive: { n: "Phượng Hoàng Lửa", c: 350, e: 1, d: "Bùng lửa vàng, giữ 1 HP khi chí mạng, hồi chiêu 60s" }, ancient: { n: "Hỏa Ngục Cổ Đại", c: 600, e: 4, d: "Mỗi 20s: 6s lửa đỏ to, +50% sát thương và tốc độ" }, wall: { n: "Tường Lửa", c: 250, e: 2, d: "Mỗi 20s: 3s tường lửa, bất tử" } };
const EVO = [["Cỏ Non", 0, 0, "#58c24a"], ["Thợ Săn", 300, 50, "#4ac2c9"], ["Chiến Binh", 1e3, 200, "#ffd23a"], ["Cổ Đại", 3e3, 600, "#ff7a3a"], ["Huyền Thoại", 8e3, 1500, "#c06aff"], ["Tối Cao", 2e4, 4e3, "#ffffff"]];
/* ----- 12 Boss (ảnh assets1/boss/boss01..12.png), xếp từ yếu đến mạnh. Chỉ số trong SL = 16 + thứ tự.
   mv = kiểu chuyển động: hop nhảy · dash lao nhanh · sway lắc nặng · stomp giậm chân · swoop vỗ cánh · float lơ lửng · phase mờ ảo · void hư không.
   z > 0 là Boss bay (lơ lửng, có thể lao xuống đánh). w = kích thước hiển thị mặc định (px). ===== */
const BOSS = [
  { n: "Hổ Lôi Hỏa",     c: "#ffa63a", hp: 1100, dm: 24, g: 350,  sp: 15, w: 54, mv: "hop",   z: 0,  ai: 1.3 },
  { n: "Khối Cầu Vồng",  c: "#6ae86a", hp: 1300, dm: 26, g: 450,  sp: 14, w: 56, mv: "hop",   z: 0,  ai: 1.3 },
  { n: "Sói Sét Tím",    c: "#b980ff", hp: 1600, dm: 28, g: 600,  sp: 20, w: 58, mv: "dash",  z: 0,  ai: 1.2 },
  { n: "Yêu Lông Trắng", c: "#ffd6d6", hp: 1900, dm: 30, g: 800,  sp: 13, w: 60, mv: "sway",  z: 0,  ai: 1.3 },
  { n: "Quỷ Nham Thạch", c: "#ff7a2a", hp: 2300, dm: 32, g: 1000, sp: 12, w: 62, mv: "stomp", z: 0,  ai: 1.4 },
  { n: "Băng Vương",     c: "#9eeeff", hp: 2800, dm: 34, g: 1300, sp: 12, w: 64, mv: "sway",  z: 0,  ai: 1.4 },
  { n: "Đại Bàng Tuyết", c: "#bfe6ff", hp: 3400, dm: 36, g: 1600, sp: 19, w: 66, mv: "swoop", z: 40, ai: 1.1 },
  { n: "Khối Mây Điện",  c: "#58b4ff", hp: 4000, dm: 38, g: 2000, sp: 16, w: 66, mv: "float", z: 34, ai: 1.2 },
  { n: "Hồ Ly Lửa",      c: "#ff6a4a", hp: 4800, dm: 40, g: 2500, sp: 17, w: 68, mv: "float", z: 38, ai: 1.1 },
  { n: "Ma Hỏa Lam",     c: "#66d4ff", hp: 5800, dm: 42, g: 3000, sp: 15, w: 70, mv: "phase", z: 34, ai: 1.2 },
  { n: "Tinh Vân",       c: "#c98aff", hp: 7000, dm: 44, g: 3800, sp: 14, w: 72, mv: "float", z: 40, ai: 1.2 },
  { n: "Hư Không",       c: "#e08aff", hp: 8500, dm: 46, g: 5000, sp: 13, w: 78, mv: "void",  z: 44, ai: 1.3 }
];
BOSS.forEach((b, i) => { b.i = i; b.src = "assets1/boss/boss" + String(i + 1).padStart(2, "0") + ".png"; SL.push([b.n, b.c, b.hp, b.dm, b.g, b.sp, b.w, "boss", b.z]) });
const BOSS0 = 16, BOSSORD = [7, 15, ...BOSS.map((b) => BOSS0 + b.i)];
/* Băm mật khẩu Mod (chỉ để không lưu chữ thô trong localStorage, không phải bảo mật thật sự) */
const hpw = (s) => { let h = 2166136261; for (const ch of "pds:" + s) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) } return (h >>> 0).toString(16) };
const MODPW = "111291";
const fmt = (t) => Math.floor(t / 60) + ":" + String(Math.floor(t % 60)).padStart(2, "0"), fmtN = (n) => n >= 1e6 ? (n / 1e6).toFixed(1).replace(".0", "") + "M" : n >= 1e5 ? Math.round(n / 1e3) + "K" : String(n);

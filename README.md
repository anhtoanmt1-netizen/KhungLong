# Pixel Dino Survivor (v2.3 - cấp mở rộng, vuốt đổi nhánh, số hồi máu)
Game 2D pixel art, tự động chiến đấu, PWA chạy offline. Không cần build: HTML/CSS/JS thuần, đã tách thành nhiều file.

## Chạy thử
`python3 -m http.server 8000` rồi mở http://localhost:8000 (Service Worker cần http/https, không chạy với file://).

## Đưa lên GitHub và triển khai
```
git init && git add . && git commit -m "Pixel Dino Survivor v2.3" && git branch -M main
git remote add origin https://github.com/<tên-bạn>/pixel-dino-survivor.git && git push -u origin main
```
Vào Settings > Pages, chọn nhánh main, thư mục root. Mở link HTTPS trên Android Chrome > Menu > Cài đặt ứng dụng.

## Cấu trúc thư mục
```
index.html            khung HTML (các màn hình)
sw.js                 Service Worker (network-first, danh sách cache đầy đủ)
manifest.webmanifest, icon-*.png
css/   base.css (khung, HUD, nút, bảng quái) · panels.css (bảng, Cài đặt, Mod) · cards.css (thẻ)
js/    (nạp theo đúng thứ tự trong index.html)
  config.js           VERSION, CFG, SC (độ khó theo thời gian), DIFF (3 chế độ), UP, SL, SK + SKV (kỹ năng 5 cấp), EVO (8 bậc), CHR, BOSS (12 Boss), BOSSORD, hpw
  state.js            lưu/nạp (localStorage), cost(), sv()  — có S.mod
  assets.js           nạp ảnh khủng long, Boss (BI), nền, cây, cỏ, lá, rương; dk() bossPx()
  audio.js · fire.js · icons.js · render.js (có bossDraw) · chest.js · music.js · custom.js · settings.js
  mod.js              Bảng Mod ẩn (mật khẩu, bật/tắt, nhập vàng, cỡ khủng long, cỡ Boss, Nhập đợt)
  keypad.js           (v2.1) bàn phím số riêng cho mọi ô nhập số / mật khẩu (css/keypad.css)
  bossskills.js       (v2.2) chiêu Boss: lập lịch, báo trước, hiệu lực, trạng thái xấu, vẽ hiệu ứng
  vfx/vfx.js          (v2.2) ES module nạp vfx/core + 12 hiệu ứng bóng tối, đưa ra window.VFX
  vfx/core/           bộ lõi vẽ điểm ảnh (hạt, ánh sáng, mô phỏng)
  vfx/effects/shadow/ 12 hiệu ứng bóng tối (Sprite Fusion, MIT)
  skills.js           (v2.1) logic + hiệu ứng: chí mạng, hút máu có trần, Thiêu đốt, Choáng, Phá Huyết, Cuồng Phong
  cards.js · game.js (có bossMove) · ui.js (điều hướng, bảng quái monPanel) · main.js
assets1/  (32 file) nhân vật, quái, môi trường, âm thanh
  dino/   run0-4.png, die.png      boss/  boss01-12.png (ảnh 12 Boss, nền trong suốt)
  world/  background.jpg, tree.png, grass2.jpg, leaf.png
  fx/     fire.png (atlas đạn), chest1-7.png      audio/  bgm.mp3, fire_breath.mp3
assets2/  (46 file) giao diện
  cards/  frame_*.png (8 khung), art_*.png (21 ảnh thẻ; 6 ảnh mới lấy từ skill_library)      ui/  btn_*.png, coin.png
```
Mỗi thư mục assets có tối đa 100 file (gồm cả thư mục con). Hiện còn dư chỗ để thêm ảnh/âm thanh mới.

## 12 Boss (v2.0)
- Dữ liệu ở `BOSS` trong `js/config.js` (tên, màu hào quang, máu, sát thương, vàng, tốc độ, kích thước mặc định `w`, kiểu chuyển động `mv`, độ cao bay `z`). Ảnh: `assets1/boss/boss01..12.png` theo thứ tự trong `BOSS`.
- Lịch xuất hiện (mỗi 45 giây một Boss): Slime Vua → Rồng Con → 12 Boss mới từ yếu đến mạnh; sau đó ngẫu nhiên.
- Bay: Đại Bàng Tuyết, Khối Mây Điện, Hồ Ly Lửa, Ma Hỏa Lam, Tinh Vân, Hư Không (có thể lao xuống đánh). Thường: Hổ Lôi Hỏa, Khối Cầu Vồng, Sói Sét Tím, Yêu Lông Trắng, Quỷ Nham Thạch, Băng Vương.
- Chuyển động: hop (nhảy, co giãn, bụi và sóng khi chạm đất) · dash (lao nhanh, để lại bóng mờ) · sway (lắc nặng) · stomp (giậm chân, rung màn hình) · swoop (vỗ cánh) · float (lơ lửng) · phase (mờ ảo, bóng chồng) · void (vòng bóng tối quay).
- Hiệu ứng nổi bật: biểu ngữ "⚠ BOSS · tên", rung màn hình và sóng xung kích khi xuất hiện, hào quang phát sáng + hạt bay lên + tia sáng quay quanh, thanh máu có tên, hiệu ứng nổ lớn khi hạ gục.
- Kích thước mặc định 54–78 px (đều trên 45 px). Chỉnh trong Bảng Mod.

## Bảng Mod (ẩn)
- Mở: bấm/chạm **3 lần liên tiếp** vào avatar khủng long (khung DINO, góc trên trái) khi đang chơi. Nhập mật khẩu (mặc định **111291**, đổi được trong bảng).
- Công tắc **Nhập đợt (nhảy đợt)**: mặc định TẮT. Khi Mod BẬT và công tắc này BẬT, bấm vào ô **ĐỢT** trên thanh trạng thái để nhập số đợt muốn nhảy tới (1–9999). Game giữ nguyên máu, vàng, nâng cấp; xóa quái/rương trên màn và tính lại lịch Boss.
- Công tắc **Bật Mod**: TẮT = game mặc định (các tính năng dưới đây bị ẩn và không áp dụng); BẬT = dùng được.
- Tính năng trong Mod: tốc độ **x3, x5** · **Tùy chỉnh hình ảnh** (nền, cây, lá, cỏ) · **đặt/cộng vàng** · **cỡ khủng long (px)** · **cỡ 12 Boss (px)** (bỏ trống = mặc định).
- Lưu ở `S.mod` trong localStorage (mật khẩu được băm, không lưu chữ thô; đây chỉ là khóa che chứ không phải bảo mật thực sự).

## Bảng quái trên màn hình
Góc trên phải, dưới dãy nút cài đặt: nền trong suốt, chữ màu pastel, xếp từ mạnh (máu gốc cao) xuống yếu, Boss có dấu ★. Cập nhật 10 lần/giây (`monPanel()` trong `js/ui.js`).

## Thẻ nâng cấp (v2.1)
- 6 nhóm (tab), tổng 21 thẻ: **Công** (Sức mạnh, Tốc độ bắn, Đa mục tiêu, Tỷ lệ chí mạng, Sát thương chí mạng) · **Thủ** (Sinh lực, Hồi phục, Phòng thủ) · **Phụ trợ** (Tiến hóa, Kinh tế, Hút máu) · **Hiệu ứng** (Thiêu đốt, Choáng, Phá Huyết) · **Kỹ năng công** (Lửa Xuyên Phá, Lửa Bùng Nổ, Bão Lửa, Hỏa Ngục Cổ Đại) · **Kỹ năng thủ** (Phượng Hoàng Lửa, Tường Lửa, Cuồng Phong Hộ Thân). Chấm xanh trên tab = có thẻ đủ vàng để nâng.
- **Vuốt đổi nhánh (v2.3):** vuốt ngang trên bảng để chuyển Công ↔ Thủ ↔ Phụ trợ ↔ Hiệu ứng ↔ Kỹ năng. Vuốt ở vùng ngoài hàng thẻ (tiêu đề, thanh nhánh) đổi nhánh ngay; vuốt trên hàng thẻ thì cuộn thẻ trước, khi đã tới mép vuốt tiếp mới sang nhánh kế bên (chuột: kéo ngang đủ dài ở mép; phím ←/→ cũng vậy). Nhánh mới trượt vào theo chiều vuốt (`setTab`, `tabStep`, `cardEdge` trong `js/cards.js`).
- **Vuốt ngang** để xem hết thẻ trong một tab: cuộn cảm ứng, kéo chuột, lăn chuột, mũi tên hai bên, phím ←/→. Mua thẻ không làm mất vị trí cuộn (`cardNav`, `cardScroll` trong `js/cards.js`; `.cards` trong `css/cards.css`).
- Mỗi thẻ: nhãn **Lv.**, **giá**, **tên**, **mô tả** và dòng xanh giá trị trước → sau. Kỹ năng có 5 cấp (cấp 1 cần đủ bậc tiến hóa `e`, các cấp sau không cần). **Bấm vào thẻ là nâng cấp.**
- Thêm/đổi thẻ: sửa `CARDS` trong `js/cards.js`; ảnh giữa thẻ là `assets2/cards/art_<khóa>.png`. Khung: fire · silver · shadow · blood · lotus · steel · jade · bronze.

### Chi tiết kỹ năng mới (số liệu theo cấp ở `UP`, `SK`, `SKV` trong `js/config.js`)
- **Chí mạng**: gốc 5% / x2. Tỷ lệ +1,5%/cấp (tối đa 30 cấp, +1%/bậc tiến hóa, trần 95%); sát thương chí mạng +8%/cấp.
- **Thiêu đốt**: mỗi đòn đánh cộng một "bể lửa" bằng X% sát thương; bể cháy dần trong ~3 giây (lửa bám trên quái, số cam nhỏ).
- **Choáng**: mỗi đòn có tỷ lệ làm quái bất động 0,5–1,4 giây (sao quay quanh đầu), sau đó miễn nhiễm 1,4 giây. Boss: tỷ lệ ÷2, thời gian ×0,35, miễn nhiễm 5 giây.
- **Phá Huyết** (5 cấp: 5/10/20/30/40%): cơ hội gây thêm 2% máu tối đa của quái (Boss 0,5%); mỗi quái chờ 0,35 giây giữa hai lần kích hoạt.
- **Cuồng Phong Hộ Thân** (5 cấp): khi có từ 3 quái áp sát (cấp 4+: 2; Boss tính 2) tạo lốc xoáy đẩy lùi, gây sát thương và làm choáng nhẹ; Boss bị đẩy ít hơn.
- **Hút máu** có trần hồi mỗi giây = (0,5% + 0,4%/cấp) HP tối đa, để sát thương lớn không làm nhân vật bất tử.

## Giao diện Cài đặt (v1.9)
Dùng bộ nút trong `assets2/ui/` (từ Setting.png): loa / loa gạch cho Âm thanh, bánh răng mở Cài đặt, X đóng, mũi tên quay lại, tạm dừng, danh sách cho Đổi nhạc nền. Với chức năng chưa có ảnh riêng (Nhạc nền, Số sát thương, Giảm chuyển động, Tùy chỉnh hình ảnh) dùng `btn_blank.png` (nút đã xóa biểu tượng) + biểu tượng SVG màu nâu; tắt thì nút xám và có vạch đỏ.

## Cân bằng game (v2.1)
Số liệu nằm ở `js/config.js`: `CFG`, `SC` (độ khó quái theo thời gian: máu `hp`, sát thương `dm`, vàng `gd`, tốc độ `sp`, nhịp sinh `si`, hệ số riêng cho Boss `bh`/`bd`), `DIFF` (3 chế độ), `UP` (giá = b × g^cấp), `SL`, `SK`/`SKV`, `EVO`, `BOSS`.
- **3 chế độ** (`DIFF`, chọn ở màn *Trò chơi mới*, lưu trong `S.df`, cố định cho đến khi chơi mới): Thường (quái ×1, vàng ×1,06), Khó (máu ×1,8, sát thương ×1,5, đông hơn, vàng ×1,25), Địa ngục (máu ×3,2, sát thương ×2,4, rất dồn dập, vàng ×1,6). Với bot mô phỏng (luôn chạm rương, mua thẻ cân bằng), cả ba chế độ **max toàn bộ nâng cấp sau khoảng 2 giờ chơi (đo được 115–128 phút ở các lần chạy thử, đã tính cả chiêu Boss)** (xem bên dưới); người chơi thật thường chậm hơn một chút.
- Nâng cấp theo cấp: cấp tối đa cao hơn (Sinh lực/Sức mạnh 40, Tốc độ 30, Đa mục tiêu 6, Chí mạng 30...). Giá cấp đầu rẻ nhưng cấp cuối rất đắt (hệ số `g` lớn) nên đầu game mượt và hậu kỳ dài.
- Tiến hóa 8 bậc (đến Long Vương), cần số quái đã hạ; mỗi bậc +12% sát thương, +30 HP, +1% chí mạng, +5% vàng.
- Quái yếu biến mất dần khỏi đợt sinh ở đợt cao (đợt 14, 20, 26, 32+ ...), Boss mạnh gấp đôi bản cũ và tăng thêm theo thời gian. Nhân vật full cấp ở chế độ Thường bắt đầu thua ở khoảng đợt 110 và chạm trần quanh đợt 155–185.
- Rương thưởng `CHR` tính theo "đơn vị vàng" của thời điểm hiện tại (5 × `SC.gd(t)` × vàng chế độ); "x2 vàng" có trần 100 đơn vị.
- Dữ liệu lưu: localStorage khóa `pds_save_v1` (không đổi; save cũ vẫn đọc được: kỹ năng đã mở thành cấp 1, chế độ mặc định Thường).
- Công cụ kiểm tra cân bằng (ngoài dự án): bộ mô phỏng headless chạy trực tiếp `config/state/assets/chest/skills/cards/game` với một bot mua thẻ; dùng để đo thời điểm max hết và đợt thất bại của nhân vật full cấp.

## Cập nhật phiên bản
Service Worker dùng network-first. Mỗi lần phát hành hãy tăng `VERSION` trong `js/config.js` và `CACHE` trong `sw.js` để dọn cache cũ.

## Rương kho báu
Cấu hình trong `CFG` (chestP = 30%/đợt trong chestW = 20 đợt đầu, sau đó giảm chestDec mỗi đợt, tối thiểu chestMin) và bảng thưởng `CHR` (v2.1: 5, 10, 20, 40, 80, 160 đơn vị vàng, hoặc x2 vàng hiện có có trần). Người chơi phải chạm vào rương để nhận thưởng; rương chạy tới khủng long mà chưa chạm sẽ bị bỏ lỡ.

## Tùy chỉnh hình ảnh
Bảng Mod > Tùy chỉnh hình ảnh (chỉ khi bật Mod): tải ảnh Nền, Cây, Lá, Nền cỏ; cắt và thu phóng; mỗi loại lưu tối đa 3 ảnh gần nhất (IndexedDB); nhập px để đổi kích thước cây, lá, ô cỏ.

## Đạn lửa
`assets1/fx/fire.png` là atlas 6×4, ô 160px, 24 khung: 0-3 khởi tạo · 4-12 bay (vòng lặp `FLY`) · 13-17 nổ · 18-23 tan biến. Màu lửa đổi theo cấp tiến hóa. Kích thước mặc định 28px.

## Âm thanh
Tiếng bắn dùng `assets1/audio/fire_breath.mp3`, nhạc nền mặc định `assets1/audio/bgm.mp3` (thiếu file thì dùng âm tổng hợp bằng WebAudio). Có thể đổi nhạc nền trong Cài đặt > Đổi nhạc nền.

## Chiêu Boss (v2.2)
12 Boss mới mỗi Boss có 1–3 chiêu (Slime Vua và Rồng Con chưa có chiêu để đầu game dễ thở). Boss chọn một chiêu đang sẵn sàng → **báo trước** (tên chiêu hiện trên đầu, vòng tím quanh Boss và dưới chân khủng long) → hiệu ứng điểm ảnh → **hiệu lực**. Bảng `BSK` và gán chiêu `BOSS[i].sk` ở `js/config.js`; logic ở `js/bossskills.js`.

| Boss | Chiêu | Hiệu ứng | Tác dụng |
|---|---|---|---|
| Hổ Lôi Hỏa | Lửa Bóng Tối | shadow-flames | thiêu 2,5% HP tối đa/giây trong 4 giây |
| Khối Cầu Vồng | Lời Nguyền | curse | nhận thêm 30% sát thương trong 6 giây |
| Sói Sét Tím | Vồ Lấy | grasping-hands | sát thương + không bắn được 1,2 giây |
| Yêu Lông Trắng | Hút Máu | life-steal | sát thương, Boss hồi 4% máu tối đa |
| Quỷ Nham Thạch | Xúc Tu Quất | shadow-tendrils | sát thương + giảm 40% tốc độ bắn 4 giây |
| Băng Vương | Ấn Phong Kỹ Năng, Hố Đen | hex-sigil, black-hole | phong ấn kỹ năng chủ động 5 giây; Boss nhận ít hơn 50% sát thương 4 giây |
| Đại Bàng Tuyết | Cầu Hư Không | void-orb | cầu bay tới, sát thương lớn |
| Khối Mây Điện | Nhật Thực, Vồ Lấy | eclipse, grasping-hands | trời tối: sát thương của bạn giảm 25% trong 5 giây |
| Hồ Ly Lửa | Lửa Bóng Tối, Triệu Hồi Sọ Ma | shadow-flames, necro-skulls | gọi 3 bóng ma yếu |
| Ma Hỏa Lam | Triệu Hồi Sọ Ma, Hút Linh Hồn | necro-skulls, soul-drain | Boss hồi 7% máu tối đa |
| Tinh Vân | Hố Đen, Cầu Hư Không, Lời Nguyền | black-hole, void-orb, curse | |
| Hư Không | Bùng Nổ Hư Vô, Ấn Phong Kỹ Năng, Nhật Thực | dark-explosion, hex-sigil, eclipse | Bùng Nổ: gom 1,85 giây rồi nổ, sát thương rất lớn |

- **Cách đối phó:** thẻ **Choáng** làm Boss gián đoạn chiêu đang báo trước ("BỊ NGẮT!"); **Tường Lửa** (bất tử) chặn cả sát thương lẫn hiệu ứng xấu; hạ Boss nhanh để chiêu không kịp dùng. Mỗi chiêu gây sát thương bị chặn trần theo % HP tối đa của khủng long (20–45%), nên không thể bị hạ trong một chiêu. Phượng Hoàng vẫn hồi sinh được sau chiêu.
- Chế độ Khó / Địa ngục dùng chiêu dồn dập hơn (hồi chiêu nhân `DIFF[].si`); sát thương chiêu tính từ sát thương Boss nên cũng tăng theo chế độ và theo thời gian.
- Trạng thái xấu hiện thành nhãn nhỏ dưới thanh máu (TRÓI, CHẬM, NGUYỀN, PHONG ẤN, THIÊU, TỐI) kèm thời gian còn lại.
- **Hiệu ứng điểm ảnh** (`js/vfx/`): chạy bằng ES module (`<script type="module">`) nên cần mở game qua http/https (GitHub Pages ổn); mở thẳng `file://` thì chiêu vẫn hoạt động nhưng không có hình. Mỗi hiệu ứng vẽ lại tối đa 30 lần/giây, tối đa 6 hiệu ứng cùng lúc, tự bỏ qua nếu chưa nạp xong. Lời Nguyền và Hút Máu tô màu lên đúng hình khủng long / Boss nhờ mặt nạ dựng từ sprite (`VFX.actorOf`).
- Ghi công: `js/vfx/` dùng bộ hiệu ứng điểm ảnh có phần mượn từ Sprite Fusion (https://www.spritefusion.com/pixel-art-vfx), giấy phép MIT, Copyright (c) 2026 Hugo Duprez; các dòng ghi công được giữ nguyên trong từng file.

## Cấp mở rộng và hồi máu (v2.3)
| Nâng cấp | Cấp tối đa | Giá trị ở cấp mở rộng |
|---|---|---|
| Sức mạnh | 40 → **80** | mức tăng +3 nhân thêm 6% mỗi cấp (cấp 80 = 617) |
| Sinh lực | 40 → **80** | từ cấp 41, mỗi cấp tăng gấp **1,2 lần mức tăng của cấp trước** (bắt đầu +20), làm tròn lên bội số của 5 (cấp 80 = 247.495 HP) |
| Hồi phục | 20 → **50** | mức tăng 1,5 nhân thêm 10% mỗi cấp (cấp 50 ≈ 301 HP/giây) |
| Đa mục tiêu | 6 → **11** | tối đa **12** đạn mỗi lần |
| Sát thương chí mạng | 30 → **100** | +5%/cấp sau cấp 30 (cấp 100 = 790%) |
| Hút máu | 15 → **20** | +2%/cấp (cấp 20 = 40%) |
| Thiêu đốt | 20 → **50** | +2%/cấp sau cấp 20 (cấp 50 = 150%) |
| Phá Huyết (kỹ năng) | 5 → **10** | cơ hội 45/50/55/60/65% ở cấp 6–10, % máu gây thêm tăng dần từ 2% lên 3% (Boss 0,5% → 0,75%) |
| Lửa Xuyên Phá (kỹ năng) | 5 → **10** | xuyên tối đa **12** quái |
- **Giá:** `cost()` / `skCost()` trong `js/state.js` dùng `b × g^cấp` tới cấp cũ (`l1`), các cấp mở rộng nhân thêm `g2` mỗi cấp. **Sức mạnh và Sinh lực giảm 20% giá từ cấp 20** (`dc: [20, 0.8]`: áp dụng cho giá nâng từ cấp 20 trở lên). Các giá trị cấp mở rộng nằm trong bảng `XV` (`js/config.js`).
- Toàn bộ phần mở rộng tốn khoảng 986 triệu vàng (nội dung cũ khoảng 74 triệu); hậu kỳ tăng độ khó mạnh hơn (`SC.hp`, `SC.dm` có thêm hệ số mũ từ đợt 150 / 120) nên nhân vật đã tối đa hết mọi cấp mở rộng bắt đầu thua ở khoảng đợt 245.
- **Số hồi máu:** mọi hiệu ứng hồi HP hiện thành số **"+N" màu xanh lá** cùng phông chữ với các số sát thương: Hồi phục (xanh sáng, bên trái đầu khủng long), Hút máu và Phá Huyết (xanh đậm, bên phải), Phượng Hoàng hồi sinh, và Boss tự hồi (Hút Máu, Hút Linh Hồn). Hồi phục / Hút máu cộng dồn 0,7 giây rồi hiện một lần cho đỡ dày. Tắt "hiện số sát thương" trong Cài đặt thì các số này cũng ẩn (`healAdd`, `healTick`, `healPop` trong `js/skills.js`).

## Bàn phím số riêng (v2.1)
- Mọi ô `input[type=number]` và `input[type=password]` (mật khẩu Mod và mật khẩu mới, số vàng, cỡ khủng long / 12 Boss / cây / lá / cỏ, nhập đợt) dùng bàn phím này thay cho bàn phím hệ thống, nên **bàn phím điện thoại không bao giờ bật lên che game**.
- Bố cục 2 hàng × 6 phím: `1 2 3 4 5 ⌫` / `6 7 8 9 0 OK`, kèm một dòng hiển thị (tên ô, giá trị; mật khẩu hiện dấu •) và nút ✕ xóa hết. Cố định giữa mép dưới khung game, rộng tối đa 27em; màn hình nội dung tự chừa chỗ phía dưới khi bàn phím mở.
- Tự hiện khi chạm vào ô số (hoặc khi hộp thoại tự đặt con trỏ vào ô, như Nhập đợt / Mật khẩu), tự ẩn khi bấm OK, bấm ra ngoài hoặc đổi màn hình. Chạm số đầu tiên sẽ thay giá trị có sẵn. OK phát phím Enter nên các bộ xử lý cũ (`mod.js`, `custom.js`) không cần sửa; giá trị đổi được lưu qua sự kiện `change` như khi gõ thật.
- Máy tính: gõ phím số, Backspace, Enter (OK), Esc (đóng) cũng hoạt động. Các ô được đặt `readonly` + `inputmode="none"` để trình duyệt di động không mở bàn phím hệ thống.
- Thêm ô số mới: chỉ cần dùng `<input type="number">` (hoặc `password`) có `inputmode="none" readonly`, `aria-label` (hiện làm tên ô) và `min`/`max` (quyết định số chữ số tối đa).

## Nhật ký v2.3
- Vuốt ngang để đổi nhánh trong bảng nâng cấp; số hồi máu xanh lá; giảm 20% giá Sức mạnh/Sinh lực từ cấp 20; mở rộng cấp độ (Sức mạnh/Sinh lực 80, Hồi phục 50, Đa mục tiêu 12 đạn, Chí mạng 100, Hút máu 20, Thiêu đốt 50, Phá Huyết 10, Lửa Xuyên Phá 12 quái); Sinh lực cấp 41+ tăng theo 1,2 lần mức tăng cấp trước; HUD và số sát thương gọn lại khi số rất lớn. `VERSION` = 2.3, cache `pds-v24`.

## Nhật ký v2.2
- Chiêu Boss: 12 chiêu từ bộ hiệu ứng bóng tối (Vồ Lấy, Xúc Tu Quất, Lửa Bóng Tối, Lời Nguyền, Ấn Phong Kỹ Năng, Cầu Hư Không, Nhật Thực, Triệu Hồi Sọ Ma, Hút Linh Hồn, Hút Máu, Hố Đen, Bùng Nổ Hư Vô); trạng thái xấu trên khủng long; Choáng ngắt chiêu. `VERSION` = 2.2, cache `pds-v23`.

## Nhật ký v2.1
- Bàn phím số riêng (0–9, ⌫, OK) cho mọi ô nhập số; cache `pds-v22`.
- Âm thanh: tiếng phun lửa, đạn trúng quái, chí mạng và nổ lan giảm 60% (`QUIET` trong `js/audio.js`). Thêm âm thanh Choáng, Phá Huyết, Cuồng Phong.
- Bảng nâng cấp: vuốt/kéo/cuộn ngang giữa các thẻ; thêm tab Hiệu ứng; 6 thẻ mới (Tỷ lệ chí mạng, Sát thương chí mạng, Thiêu đốt, Choáng, Phá Huyết, Cuồng Phong Hộ Thân) với ảnh từ skill_library; kỹ năng có 5 cấp.
- Nhảy đợt: bấm ô ĐỢT để nhập đợt (công tắc trong Bảng Mod, mặc định TẮT). Ô ĐỢT nay hiển thị đúng đợt hiện tại (trước đây thấp hơn 1).
- 3 chế độ độ khó (Thường / Khó / Địa ngục) chọn khi chơi mới; tính lại toàn bộ số liệu để mỗi chế độ max hết khoảng 2 giờ.
- Tiến hóa 8 bậc, Boss mạnh hơn, hút máu có trần, rương thưởng theo thời điểm; xóa thư mục `assets/` cũ (không dùng). `VERSION` = 2.1, cache `pds-v21`.

## Nhật ký v2.0
- Thêm 12 Boss (ảnh riêng, bay/thường, chuyển động và hiệu ứng riêng), biểu ngữ Boss, rung màn hình, sóng xung kích.
- Thêm Bảng Mod ẩn (3 lần chạm avatar + mật khẩu); chuyển vào Mod: x3/x5, Tùy chỉnh hình ảnh, nhập vàng, cỡ khủng long, cỡ 12 Boss. Tắt Mod = game mặc định.
- Thêm bảng thống kê quái trên màn hình (góc trên phải).
- Tách `assets/` thành `assets1/` (nhân vật, quái, môi trường, âm thanh) và `assets2/` (giao diện); bỏ 2 file không dùng (`grass.png`, `rocks.png`). Cập nhật mọi đường dẫn và danh sách cache; `VERSION` = 2.0, cache `pds-v20`.

## Nhật ký v1.9
- Làm mới toàn bộ giao diện nâng cấp (thẻ bài) và Cài đặt; nút chữ cũng đổi sang kiểu đá + cam cho đồng bộ.
- Tách `index.html` (~128KB) thành HTML + 3 CSS + 14 module JS; ảnh khủng long đưa ra `assets/dino/`; JS được định dạng lại dễ đọc.
- Sửa: số phiên bản không khớp (menu/giới thiệu ghi 1.7, README ghi 1.8) nay lấy từ một hằng `VERSION`; Service Worker không còn lưu phản hồi 206 của âm thanh và cache đủ mọi file; README ghi sai tên cache.
- Dọn: bỏ `goFS()` và tùy chọn toàn màn hình đã vô hiệu, hàm `snd()` và `extra()` không dùng, bảng pixel `PX`, cây nâng cấp cũ (`TR`, `ED`), emoji `i:` trong bảng số liệu, kiểm tra `S.set.mus===undefined` thừa, hai file `grass.png` và `rocks.png` không được dùng, font VT323.

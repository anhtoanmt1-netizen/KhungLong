# Pixel Dino Survivor (v2.1 - 3 chế độ, kỹ năng mới, cân bằng lại)
Game 2D pixel art, tự động chiến đấu, PWA chạy offline. Không cần build: HTML/CSS/JS thuần, đã tách thành nhiều file.

## Chạy thử
`python3 -m http.server 8000` rồi mở http://localhost:8000 (Service Worker cần http/https, không chạy với file://).

## Đưa lên GitHub và triển khai
```
git init && git add . && git commit -m "Pixel Dino Survivor v2.1" && git branch -M main
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
- **3 chế độ** (`DIFF`, chọn ở màn *Trò chơi mới*, lưu trong `S.df`, cố định cho đến khi chơi mới): Thường (quái ×1), Khó (máu ×1,8, sát thương ×1,5, đông hơn, vàng ×1,2), Địa ngục (máu ×3,2, sát thương ×2,4, rất dồn dập, vàng ×1,5). Với bot mô phỏng (luôn chạm rương, mua thẻ cân bằng), cả ba chế độ **max toàn bộ nâng cấp sau khoảng 2 giờ chơi (đo được 106–120 phút ở các lần chạy thử)** (xem bên dưới); người chơi thật thường chậm hơn một chút.
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

## Nhật ký v2.1
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

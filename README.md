# Pixel Dino Survivor (v1.9 - Thẻ nâng cấp)
Game 2D pixel art, tự động chiến đấu, PWA chạy offline. Không cần build: HTML/CSS/JS thuần, đã tách thành nhiều file.

## Chạy thử
`python3 -m http.server 8000` rồi mở http://localhost:8000 (Service Worker cần http/https, không chạy với file://).

## Đưa lên GitHub và triển khai
```
git init && git add . && git commit -m "Pixel Dino Survivor v1.9" && git branch -M main
git remote add origin https://github.com/<tên-bạn>/pixel-dino-survivor.git && git push -u origin main
```
Vào Settings > Pages, chọn nhánh main, thư mục root. Mở link HTTPS trên Android Chrome > Menu > Cài đặt ứng dụng.

## Cấu trúc thư mục
```
index.html            khung HTML (các màn hình)
sw.js                 Service Worker (network-first, danh sách cache đầy đủ)
manifest.webmanifest, icon-*.png
css/
  base.css            bố cục khung chơi, HUD, nút chữ, màn phủ
  panels.css          khung bảng, Cài đặt, Nhạc nền, Tùy chỉnh hình ảnh
  cards.css           giao diện thẻ nâng cấp và hiệu ứng
js/  (nạp theo đúng thứ tự trong index.html)
  config.js           VERSION, hằng số, bảng cân bằng: CFG, UP, SL, SK, EVO, CHR
  state.js            lưu/nạp (localStorage), giá cost(), chỉ số sv()
  assets.js           nạp ảnh khủng long, nền, cây, cỏ, lá, rương
  audio.js            âm thanh WebAudio (AU, sfx)
  fire.js             đạn lửa (atlas), vụ nổ
  icons.js            biểu tượng SVG nhỏ + đường dẫn nút ảnh (UI)
  render.js           vẽ canvas: nền, quái, khủng long, HUD pixel
  chest.js            rương kho báu
  music.js            nhạc nền do người dùng tải lên
  custom.js           tùy chỉnh hình ảnh (IndexedDB, cắt ảnh)
  settings.js         màn Cài đặt
  cards.js            thẻ nâng cấp: dữ liệu thẻ, trạng thái, hiển thị, mua
  game.js             logic ván chơi: sinh quái, sát thương, upd()
  ui.js               điều hướng màn hình, act(), HUD DOM
  main.js             vòng lặp, co giãn, khởi động, Service Worker
assets/
  background.jpg, tree.png, grass2.jpg, leaf.png, fire.png, chest1-7.png, dino_die.png, *.mp3
  dino/run0-4.png     5 khung khủng long chạy (trước đây nhúng base64 trong HTML)
  cards/frame_*.png   8 khung thẻ cùng kích thước 400×553 (cắt từ Card.png)
  cards/art_*.png     15 ảnh minh họa giữa thẻ 192×192 (cắt từ Skill.rar)
  ui/btn_*.png        15 nút (cắt từ Setting.png) + btn_blank.png (nút trống) + coin.png
```

## Thẻ nâng cấp (v1.9)
- 5 nhóm (tab): **Công** (Sức mạnh, Tốc độ bắn, Đa mục tiêu) · **Thủ** (Sinh lực, Hồi phục, Phòng thủ) · **Phụ trợ** (Tiến hóa, Kinh tế, Hút máu) · **Kỹ năng công** (Lửa Xuyên Phá, Lửa Bùng Nổ, Bão Lửa, Hỏa Ngục Cổ Đại) · **Kỹ năng thủ** (Phượng Hoàng Lửa, Tường Lửa). Mỗi tab hiện đủ thẻ, cùng một kích thước. Chấm xanh trên tab = có thẻ đủ vàng để nâng.
- Mỗi thẻ: nhãn **Lv.**, **giá** (xám + đỏ khi thiếu vàng, MAX / ĐÃ MỞ khi xong), **tên**, **mô tả** và dòng xanh giá trị trước → sau. Thẻ kỹ năng chưa đủ bậc tiến hóa bị khóa kèm ổ khóa.
- **Bấm vào thẻ là nâng cấp.** Thành công: thẻ nảy nhẹ, chớp sáng, vệt sáng quét qua, nhãn Lv phồng lên. Không đủ điều kiện: thẻ rung nhẹ và dòng gợi ý phía dưới báo lý do. Di chuột/Tab vào thẻ: thẻ nhích lên.
- Thêm/đổi thẻ: sửa `CARDS` trong `js/cards.js` (nhóm, màu khung, tên, mô tả). Ảnh giữa thẻ là `assets/cards/art_<khóa>.png`.
- Màu khung theo chức năng: fire (đỏ cam) · silver (bạc) · shadow (tím tối) · blood (đỏ thẫm) · lotus (sen xanh hồng) · steel (thép xanh) · jade (lục) · bronze (đồng).

## Giao diện Cài đặt (v1.9)
Dùng bộ nút trong `assets/ui/` (từ Setting.png): loa / loa gạch cho Âm thanh, bánh răng mở Cài đặt, X đóng, mũi tên quay lại, tạm dừng, danh sách cho Đổi nhạc nền. Với chức năng chưa có ảnh riêng (Nhạc nền, Số sát thương, Giảm chuyển động, Tùy chỉnh hình ảnh) dùng `btn_blank.png` (nút đã xóa biểu tượng) + biểu tượng SVG màu nâu; tắt thì nút xám và có vạch đỏ.

## Cân bằng game
Số liệu nằm ở `js/config.js`: CFG (cấu hình), UP (nâng cấp, giá = b × g^cấp), SL (8 loại Slime), SK (kỹ năng), EVO (tiến hóa).
Dữ liệu lưu: localStorage khóa `pds_save_v1` (không đổi so với bản cũ nên không mất tiến trình).

## Cập nhật phiên bản
Service Worker dùng network-first. Mỗi lần phát hành hãy tăng `VERSION` trong `js/config.js` và `CACHE` trong `sw.js` để dọn cache cũ.

## Rương kho báu
Cấu hình trong `CFG` (chestP = 30%/đợt trong chestW = 20 đợt đầu, sau đó giảm chestDec mỗi đợt, tối thiểu chestMin) và bảng thưởng `CHR` (100, 200, 500, 1000, 2000, 5000, x2 vàng hiện có). Người chơi phải chạm vào rương để nhận thưởng; rương chạy tới khủng long mà chưa chạm sẽ bị bỏ lỡ.

## Tùy chỉnh hình ảnh
Menu > Cài đặt > Tùy chỉnh hình ảnh: tải ảnh Nền, Cây, Lá, Nền cỏ; cắt và thu phóng; mỗi loại lưu tối đa 3 ảnh gần nhất (IndexedDB); nhập px để đổi kích thước cây, lá, ô cỏ.

## Đạn lửa
`assets/fire.png` là atlas 6×4, ô 160px, 24 khung: 0-3 khởi tạo · 4-12 bay (vòng lặp `FLY`) · 13-17 nổ · 18-23 tan biến. Màu lửa đổi theo cấp tiến hóa. Kích thước mặc định 28px.

## Âm thanh
Tiếng bắn dùng `assets/fire_breath.mp3`, nhạc nền mặc định `assets/bgm.mp3` (thiếu file thì dùng âm tổng hợp bằng WebAudio). Có thể đổi nhạc nền trong Cài đặt > Đổi nhạc nền.

## Nhật ký v1.9
- Làm mới toàn bộ giao diện nâng cấp (thẻ bài) và Cài đặt; nút chữ cũng đổi sang kiểu đá + cam cho đồng bộ.
- Tách `index.html` (~128KB) thành HTML + 3 CSS + 14 module JS; ảnh khủng long đưa ra `assets/dino/`; JS được định dạng lại dễ đọc.
- Sửa: số phiên bản không khớp (menu/giới thiệu ghi 1.7, README ghi 1.8) nay lấy từ một hằng `VERSION`; Service Worker không còn lưu phản hồi 206 của âm thanh và cache đủ mọi file; README ghi sai tên cache.
- Dọn: bỏ `goFS()` và tùy chọn toàn màn hình đã vô hiệu, hàm `snd()` và `extra()` không dùng, bảng pixel `PX`, cây nâng cấp cũ (`TR`, `ED`), emoji `i:` trong bảng số liệu, kiểm tra `S.set.mus===undefined` thừa, hai file `grass.png` và `rocks.png` không được dùng, font VT323.

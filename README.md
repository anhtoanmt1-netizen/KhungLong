# Pixel Dino Survivor
Game 2D pixel art, tự động chiến đấu, PWA chạy offline. Không cần build: chỉ gồm HTML/JS thuần.

## Chạy thử
`python3 -m http.server 8000` rồi mở http://localhost:8000 (Service Worker cần http/https, không chạy với file://).

## Đưa lên GitHub và triển khai
git init && git add . && git commit -m "Pixel Dino Survivor v1" && git branch -M main
git remote add origin https://github.com/<tên-bạn>/pixel-dino-survivor.git && git push -u origin main
Sau đó vào Settings > Pages, chọn nhánh main, thư mục root. Mở link HTTPS trên Android Chrome > Menu > Cài đặt ứng dụng.

## Cập nhật phiên bản
Sửa nội dung rồi đổi `C='pds-v1'` trong sw.js thành `pds-v2` để xóa cache cũ.

## Cân bằng game
Số liệu nằm ở đầu index.html: CFG (cấu hình), UP (nâng cấp, giá = b × g^cấp), SL (8 loại Slime).
Dữ liệu lưu: localStorage khóa `pds_save_v1`.

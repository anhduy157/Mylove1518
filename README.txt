LOVE 3D - HƯỚNG DẪN

1) Giải nén toàn bộ thư mục này vào:
   D:\Doccument\ACC\Changiu\HTML

2) Mở file:
   index.html

3) Muốn đổi tên, lời nhắn, số ngày:
   Mở config.js bằng Notepad/VS Code và sửa các giá trị.

4) ĐỔI TỐC ĐỘ CHỮ / ẢNH / TIM RƠI:
   Mở config.js và tìm mục:
      falling: { ... }

   Ví dụ:
      text.minSpeed = 8
      text.maxSpeed = 15

   LƯU Ý:
   - minSpeed / maxSpeed là SỐ GIÂY để rơi hết màn hình.
   - Số càng NHỎ => rơi càng NHANH.
   - Số càng LỚN => rơi càng CHẬM.
   - spawnRate là mili-giây tạo phần tử mới.
   - spawnRate càng nhỏ => xuất hiện càng nhiều.

5) THÊM ẢNH RƠI:
   - Tạo thư mục: images
   - Chép ảnh vào thư mục đó.
   - Mở config.js và thêm vào fallImages, ví dụ:

     fallImages: [
       "images/anh1.jpg",
       "images/anh2.jpg",
       "images/anh3.png"
     ]

6) Muốn có nhạc:
   Chép file MP3 vào cùng thư mục với index.html
   và đổi tên thành:
   music.mp3

7) QR code:
   - File qr-generator.html dùng để tạo QR có khung trái tim.
   - QR phải chứa một URL mà điện thoại truy cập được.
   - Đường dẫn D:\... chỉ chạy trên máy tính của bạn, điện thoại không thể quét QR để mở trực tiếp ổ D.
   - Khi hoàn thiện, đưa thư mục web lên GitHub Pages / IIS / hosting / ngrok rồi lấy URL công khai.
   - Sau đó mở qr-generator.html, dán URL và tạo QR.

8) Hiệu ứng hiện có:
   - Chữ và tim chuyển động theo chiều sâu 3D.
   - Chữ / ảnh / tim rơi từ trên xuống.
   - Tốc độ từng loại chỉnh riêng trong config.js.
   - Ánh sáng nền chuyển động nhẹ.
   - Click/chạm màn hình bung trái tim nhỏ.
   - Chuột/touch tạo parallax.
   - Cảm biến nghiêng điện thoại tạo thêm chiều sâu.
   - Nút ♫ bật/tắt nhạc.

Các file:
   index.html          Trang chính
   style.css           Giao diện + hiệu ứng glow + hiệu ứng rơi
   app.js              Chuyển động 3D + chữ/ảnh/tim rơi
   config.js           Nội dung + tốc độ + ảnh để bạn sửa nhanh
   qr-generator.html   Trang tạo QR khung trái tim
   README.txt          File hướng dẫn này

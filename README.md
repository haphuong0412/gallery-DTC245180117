# 🖼️ Gallery Web Application - Containerized System with Hardening & Observability

> **Bài tập lớn / Đồ án môn học**: Hệ thống thông tin & DevOps  
> **Chủ đề (Đề 31)**: Xây dựng, triển khai và giám sát ứng dụng Web Gallery trên nền nền tảng Docker  
> **Mã số sinh viên**: DTC245180117  
> **Tài khoản GitHub**: [haphuong0412](https://github.com/haphuong0412)  
> **Repository**: [gallery-DTC245180117](https://github.com/haphuong0412/gallery-DTC245180117)

---

## 📌 1. Tổng Quan Hệ Thống

Dự án triển khai một ứng dụng Web "Gallery" (Quản lý thư viện ảnh) theo kiến trúc Multi-container được đóng gói và điều phối hoàn toàn bằng **Docker Compose**. Hệ thống không chỉ đáp ứng các chức năng nghiệp vụ web cơ bản mà còn đạt tiêu chuẩn Production về **An toàn thông tin (Hardening)**, **Giám sát thông số (Monitoring)** và **Quản lý nhật ký tập trung (Centralized Logging)**.

### 🏛️ Kiến Trúc Hệ Thống (9 Docker Containers):
1. **`gallery_nginx`** (`nginx:alpine`): Reverse Proxy tiếp nhận HTTPS (SSL tự ký), định tuyến lưu lượng và bổ sung Security Headers.
2. **`gallery_app`** (Node.js Express): Backend Web Application xử lý logic hiển thị, tải ảnh và tính năng Chia sẻ ảnh.
3. **`gallery_db`** (`mysql:8.0`): Cơ sở dữ liệu quan hệ lưu trữ thông số ứng dụng và đường dẫn hình ảnh.
4. **`gallery_phpmyadmin`**: Giao diện trực quan quản trị CSDL MySQL (Cổng `8081`).
5. **`gallery_prometheus`**: Thu thập và lưu trữ các thông số Time-series Metrics hệ thống (Cổng `9090`).
6. **`gallery_grafana`**: Trực quan hóa dữ liệu Metric và Log bằng Dashboard đồ họa (Cổng `3000`).
7. **`gallery_cadvisor`**: Thu thập thông số tiêu thụ CPU/RAM/Network của từng container từ Docker Daemon.
8. **`gallery_loki`**: Hệ thống lưu trữ và đánh chỉ mục tệp log tập trung (Cổng `3100`).
9. **`gallery_promtail`**: Agent đọc log trực tiếp từ Docker socket (`/var/run/docker.sock`) và chuyển tiếp về Loki.

---

## 🌐 2. Phân Vùng Mạng (Network Isolation)

Hệ thống được thiết lập 2 mạng Docker tách biệt nhằm cô lập dữ liệu và tăng cường bảo mật:
* **`backend-network`**: Mạng nội bộ chỉ dành cho Node.js App, MySQL, phpMyAdmin, Loki, Promtail. Cơ sở dữ liệu hoàn toàn không exposed cổng ra ngoài Internet.
* **`monitoring-network`**: Mạng dành cho các dịch vụ giám sát bao gồm Nginx, Prometheus, Grafana, cAdvisor, Loki, Promtail.

---

## 🚀 3. Các Tính Năng Nổi Bật

* **HTTPS & Security Headers**: Chuyển hướng tự động từ HTTP sang HTTPS qua Nginx, mã hóa SSL tự ký và phòng chống các kỹ thuật tấn công XSS, Clickjacking, MIME-sniffing.
* **Non-root Container Execution**: Ứng dụng Node.js được cấu hình chạy dưới tài khoản `USER node` nhằm tuân thủ nguyên tắc quyền hạn tối thiểu.
* **Tính năng Chia sẻ ảnh (Web Share API / Clipboard Fallback)**: Kích hoạt menu chia sẻ hệ thống của thiết bị di động hoặc tự động sao chép đường dẫn ảnh vào bộ nhớ tạm Clipboard.
* **LogQL Centralized Logging**: Truy vấn linh hoạt log của từng dịch vụ bằng ngôn ngữ LogQL trên Grafana Explore.

---

## 🛠️ 4. Hướng Dẫn Cài Đặt Và Vận Hành

### Yêu cầu tiên quyết:
* Đã cài đặt [Docker Desktop](https://www.docker.com/) và [Git](https://git-scm.com/).

### Các bước khởi chạy:

1. **Clone mã nguồn dự án về máy local**:
   ```bash
   git clone [https://github.com/haphuong0412/gallery-DTC245180117.git](https://github.com/haphuong0412/gallery-DTC245180117.git)
   cd gallery-DTC245180117
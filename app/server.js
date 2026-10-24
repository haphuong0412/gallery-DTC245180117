const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Thư mục uploads
const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Kết nối MySQL - Đã sửa chuẩn Fallback Host & Password
const db = mysql.createPool({
    host: process.env.DB_HOST || 'gallery_mysql',
    user: process.env.DB_USER || 'gallery_user',
    password: process.env.DB_PASSWORD || 'Gallery_User_Pass_2026!',
    database: process.env.DB_NAME || 'gallery_db',
    waitForConnections: true,
    connectionLimit: 10
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// API Lấy danh sách ảnh
const getPhotosHandler = (req, res) => {
    db.query('SELECT * FROM photos ORDER BY id DESC', (err, results) => {
        if (err) {
            console.error("Lỗi SELECT photos:", err);
            return res.status(500).json({ error: 'Lỗi CSDL' });
        }
        res.json(results);
    });
};
app.get('/photos', getPhotosHandler);
app.get('/api/photos', getPhotosHandler);

// API Tải ảnh lên - Đã thêm console.error để debug
app.post('/upload', upload.single('image'), (req, res) => {
    const { title, category } = req.body;
    const filename = req.file ? req.file.filename : '';
    const filepath = `/uploads/${filename}`;

    if (!filename) return res.status(400).send('Vui lòng chọn file');

    const sql = 'INSERT INTO photos (title, category, filename, filepath) VALUES (?, ?, ?, ?)';
    db.query(sql, [title || '', category || '', filename, filepath], (err) => {
        if (err) {
            console.error("❌ LỖI MYSQL UPLOAD CHI TIẾT:", err); // Sẽ in rõ ràng nguyên nhân vào Docker logs!
            return res.status(500).send('Lỗi lưu CSDL');
        }
        res.redirect('/');
    });
});

// API Chỉnh sửa thông tin ảnh
app.put('/api/photos/:id', (req, res) => {
    const { id } = req.params;
    const { title, category } = req.body;
    const sql = 'UPDATE photos SET title = ?, category = ? WHERE id = ?';
    db.query(sql, [title, category, id], (err) => {
        if (err) {
            console.error("Lỗi UPDATE photo:", err);
            return res.status(500).json({ error: 'Lỗi cập nhật CSDL' });
        }
        res.json({ message: 'Cập nhật thành công' });
    });
});

// API Xóa ảnh khỏi MySQL & Đĩa cứng
app.delete('/api/photos/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT filename FROM photos WHERE id = ?', [id], (err, results) => {
        if (err || results.length === 0) return res.status(404).json({ error: 'Không tìm thấy ảnh' });
        
        const filename = results[0].filename;
        const filePathOnDisk = path.join(uploadDir, filename);

        db.query('DELETE FROM photos WHERE id = ?', [id], (deleteErr) => {
            if (deleteErr) {
                console.error("Lỗi DELETE photo:", deleteErr);
                return res.status(500).json({ error: 'Lỗi xóa CSDL' });
            }
            
            // Xóa file thực tế trên ổ đĩa
            if (fs.existsSync(filePathOnDisk)) {
                fs.unlinkSync(filePathOnDisk);
            }
            res.json({ message: 'Xóa thành công' });
        });
    });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const upload = require('./middlewares/uploadMiddleware');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Upload file ảnh/video (dùng cho ManageVillages upload ảnh)
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Vui lòng chọn file để tải lên.' });
  }
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ url: fileUrl, filename: req.file.filename });
});

// Các tuyến API nghiệp vụ vùng miền và làng nghề.
app.use('/api', require('./routes/villageRoutes'));
app.use('/api/locations', require('./routes/locationRoutes'));
app.use('/api', require('./routes/regionRoutes'));

app.get('/', (req, res) => {
  res.json({ status: 'OK', message: 'CraftRoots Backend API is running!' });
});

const PORT = process.env.PORT || 5000;
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server CraftRoots đang chạy tại http://localhost:${PORT}`);
    });
  })
  .catch(() => process.exit(1));

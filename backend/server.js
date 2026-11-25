require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const upload = require('./middlewares/uploadMiddleware');
const { protect } = require('./middlewares/authMiddleware');

const User = require('./models/User');
const Craft = require('./models/Craft');
const Village = require('./models/Village');
const Artifact = require('./models/Artifact');
const Artisan = require('./models/Artisan');
const Contribution = require('./models/Contribution');
const Contact = require('./models/Contact');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Upload file ảnh/video
app.post('/api/upload', protect, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Vui lòng chọn file để tải lên.' });
  }
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ url: fileUrl, filename: req.file.filename });
});

// API Thống kê tổng quan cho Admin Dashboard
app.get('/api/stats', async (req, res) => {
  try {
    const [users, crafts, villages, artifacts, artisans, pendingContributions, newContacts] =
      await Promise.all([
        User.countDocuments(),
        Craft.countDocuments(),
        Village.countDocuments(),
        Artifact.countDocuments(),
        Artisan.countDocuments(),
        Contribution.countDocuments({ status: 'PENDING' }),
        Contact.countDocuments({ status: 'NEW' })
      ]);

    res.json({
      users,
      crafts,
      villages,
      artifacts,
      artisans,
      pendingContributions,
      newContacts
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Các tuyến API chính
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/crafts', require('./routes/craftRoutes'));
app.use('/api/directories', require('./routes/craftDirectoryRoutes'));
app.use('/api', require('./routes/villageRoutes'));
app.use('/api/artifacts', require('./routes/artifactRoutes'));
app.use('/api/artisans', require('./routes/artisanRoutes'));
app.use('/api/contributions', require('./routes/contributionRoutes'));
app.use('/api/contacts', require('./routes/contactRoutes'));
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

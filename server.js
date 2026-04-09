const express = require('express');
const fs = require('fs');   // ✅ only once
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

/* ================= CREATE UPLOAD FOLDERS ================= */

const uploadsDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const blogUploadsDir = path.join(uploadsDir, 'blogs');

if (!fs.existsSync(blogUploadsDir)) {
  fs.mkdirSync(blogUploadsDir, { recursive: true });
}

/* ================= SIMPLE CORS CONFIG ================= */

app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://sjimt.in",
    "https://www.sjimt.in"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

/* ====================================================== */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ================= STATIC FILES ================= */

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* ================= HEALTH CHECK ================= */

app.get('/ping', (req, res) => {
  res.send('✅ Server is alive');
});

/* ================= ROUTES ================= */

app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/gallery', require('./routes/galleryRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));
app.use('/api/notices', require('./routes/noticeRoutes'));
app.use('/api/careers', require('./routes/careerRoutes'));
app.use('/api/blogs', require('./routes/blogRoutes'));
app.use('/api/admission', require('./routes/admissionRoutes'));

/* ================= DATABASE ================= */

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('MongoDB error:', err));

/* ================= SERVER ================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

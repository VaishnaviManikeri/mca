const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const app = express();

/* ================= CORS CONFIG ================= */

app.use(
  cors({
    origin: [
      "http://localhost:5173",        // local Vite
      "https://YOUR-FRONTEND.onrender.com" // change after frontend deploy
    ],
    credentials: true,
  })
);

/* ============================================= */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/gallery', require('./routes/galleryRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));
app.use('/api/notices', require('./routes/noticeRoutes'));
app.use('/api/careers', require('./routes/careerRoutes'));
app.use('/api/blogs', require('./routes/blogRoutes'));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('MongoDB error:', err));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
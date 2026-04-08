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

/* ================= SIMPLE CORS CONFIG ================= */

app.use(cors({
  origin: [
    "http://localhost:5173",   // Vite local
    "http://localhost:3000",   // React local (optional)
    "https://sjimt.in",        // Production domain
    "https://www.sjimt.in"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

/* ====================================================== */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ================= ✅ PING ROUTE (ADDED) =================
app.get('/ping', (req, res) => {
  res.send('✅ Server is alive');
});

// Routes
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/gallery', require('./routes/galleryRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));
app.use('/api/notices', require('./routes/noticeRoutes'));
app.use('/api/careers', require('./routes/careerRoutes'));
// Add this with other routes
// Add this line with your other routes (around line 70-80 in your server.js)
app.use('/api/blogs', require('./routes/blogRoutes'));
app.use('/api/admission', require('./routes/admissionRoutes')); // Admission route

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('MongoDB error:', err));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);



});

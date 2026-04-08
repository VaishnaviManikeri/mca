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

/* ================= FIXED CORS CONFIG ================= */

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://sjimt.in",
  "https://www.sjimt.in"
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// ✅ VERY IMPORTANT (THIS YOU MISSED)
app.options('*', cors());

/* ===================================================== */

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

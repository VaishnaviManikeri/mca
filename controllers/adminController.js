const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email: email.toLowerCase() });

    if (!admin) {
      return res.status(401).json({ message: 'Admin not found' });
    }

    const match = await admin.comparePassword(password);

    if (!match) {
      return res.status(401).json({ message: 'Wrong password' });
    }

    res.json({
      _id: admin._id,
      email: admin.email,
      token: generateToken(admin._id)
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getDashboard = async (req, res) => {
  res.json({ message: "Dashboard OK" });
};

module.exports = { loginAdmin, getDashboard };
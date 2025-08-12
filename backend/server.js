// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config();
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: 'https://land-sale-frontend.onrender.com', // Vite default port
  credentials: true
}));
app.use(express.json({ limit: '20mb' })); // Increased payload limit for JSON
app.use(express.urlencoded({ limit: '20mb', extended: true })); // Increased payload limit for urlencoded
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/properties', require('./routes/propertyRoutes'));
app.use('/api/inquiries', require('./routes/inquiryRoutes'));
const statsRoutes = require('./routes/statsRoutes');
app.use('/api', statsRoutes);
// Test Route
app.get('/api', (req, res) => {
  res.json({ status: 'ok', message: 'Land Sale API is running.' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  process.exit(0);
});

module.exports = app;
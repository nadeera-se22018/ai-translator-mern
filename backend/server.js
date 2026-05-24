require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import Routes
const translateRoutes = require('./routes/translateRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Test Route
app.get('/api/test', (req, res) => res.status(200).json({ message: 'Backend is fully operational!' }));

// Database Connection
mongoose.connect(process.env.MONGO_URI, {
  // Mongoose 6+ doesn't require useNewUrlParser and useUnifiedTopology,
  // but it's safe to omit them.
})
.then(() => console.log('Connected to MongoDB successfully'))
.catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/translate', translateRoutes);
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Backend is running' });
});

// Start Server
const PORT = process.env.PORT || 5005;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});

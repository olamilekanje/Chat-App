require('dotenv').config();
require('express-async-errors');
const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');
const path = require('path');
const { server } = require('./websocket'); // Import the server with WebSocket
const authRoutes = require('./routes/authRoutes');
const messageRoutes = require('./routes/messageRoutes');
const userRoutes = require('./routes/authRoutes');
const multimediaRoutes = require('./routes/multimediaRoutes');
const cors = require('cors');
const app = express();

if (!process.env.JWT_SECRET) {
  console.error("Invalid JWT Secret provided");
  process.exit(1); // Exit the process if JWT_SECRET is not defined
}

app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the 'public' directory

app.use('/uploads', express.static(path.join(__dirname, '/uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// Define routes
app.use('/api', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/user', authRoutes);



connectDB();

// Global error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});




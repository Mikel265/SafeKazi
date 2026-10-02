const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { initDB } = require('./db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const publicRoutes = require('./routes/publicRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/public', publicRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'SafeKazi M-Pesa Micro-Escrow API', timestamp: new Date() });
});

// Serve frontend build in production
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

// Fallback for SPA routing in Express 5
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, error: 'API endpoint not found' });
  }
  res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('SafeKazi API Running. Frontend build pending.');
    }
  });
});

// Start Server after initializing DB
initDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🛡️  SafeKazi Escrow Server running on port ${PORT}`);
      console.log(`🌐 API Endpoint: http://localhost:${PORT}/api`);
      console.log(`====================================================`);
    });
  })
  .catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });

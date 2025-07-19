// api/server.js
require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');

const app = express();

// Whitelist of allowed origins
const allowed = new Set([
  process.env.FRONTEND_URL,     // e.g. "https://bakalia.vercel.app"
  'http://localhost:5173'
]);

// Debug: log every origin
app.use((req, _res, next) => {
  console.log('→ Origin header:', req.headers.origin);
  next();
});

// Manual CORS middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  // Allow if no origin (curl, Postman) or origin is whitelisted
  if (!origin || allowed.has(origin)) {
    // echo the origin back (or ‘*’ if you prefer)
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  // Always set these
  res.header(
    'Access-Control-Allow-Methods',
    'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS'
  );
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization'
  );

  // Preflight
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// Body parsing & DB
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));
connectDB();


// Health‐check
app.get('/', (_req, res) => res.send('works'))
app.get('/api', (_req, res) => res.send('API listening'))

app.use('/api/auth', require('./routes/auth'))
app.use('/api/products', require('./routes/products'))
app.use('/api/orders', require('./routes/orders'))
app.use('/api/users', require('./routes/users'))
//create backup
app.use('/api/backup', require('./routes/backup'))

// Error handler
app.use((err, _req, res, _next) => {
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({ msg: `"${field}" must be unique` });
  }
  console.error(err);
  res.status(500).json({ msg: 'Internal server error' });
});

module.exports = app;


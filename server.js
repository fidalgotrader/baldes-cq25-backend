require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/nipar', require('./routes/nipar'));
app.use('/api/encab', require('./routes/encab'));
app.use('/api/utilizadores', require('./routes/utilizadores'));
app.use('/api/export', require('./routes/export'));
app.use('/api/dashboard', require('./routes/dashboard'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

const PORT = process.env.PORT || 3001;

sequelize.sync({ alter: false }).then(() => {
  console.log('Database connected');
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => {
  console.error('DB connection error:', err);
  process.exit(1);
});

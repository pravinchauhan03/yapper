require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

app.get('/', (req, res) => res.send('Yapper server running!'));

app.listen(process.env.PORT || 5000, () =>
  console.log(`Yapper server running on port ${process.env.PORT || 5000}`)
);
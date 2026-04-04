require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profiles');
const friendRoutes = require('./routes/friends');
const messageRoutes = require('./routes/messages');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/messages', messageRoutes);

app.get('/', (req, res) => res.send('Yapper server running!'));

app.listen(process.env.PORT || 5000, () =>
  console.log(`Yapper server running on port ${process.env.PORT || 5000}`)
);
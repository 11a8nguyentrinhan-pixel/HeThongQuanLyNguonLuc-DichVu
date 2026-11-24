require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./src/routes/authRoutes');
const staffRoutes = require('./src/routes/staffRoutes');
const systemLogRoutes = require('./src/routes/systemLogRoutes');
const serviceRequestRoutes = require('./src/routes/serviceRequestRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Gắn routes
app.use('/api/auth', authRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/logs', systemLogRoutes);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/service-requests', serviceRequestRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
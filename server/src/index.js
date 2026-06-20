import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import stallRoutes from './routes/stalls.js';
import merchantRoutes from './routes/merchants.js';
import rentRoutes from './routes/rents.js';
import complaintRoutes from './routes/complaints.js';
import activityRoutes from './routes/activities.js';
import repairRoutes from './routes/repairs.js';
import dailyRoutes from './routes/daily.js';
import dashboardRoutes from './routes/dashboard.js';

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '美食街物业运营管理平台 API 运行正常' });
});

app.use('/api/stalls', stallRoutes);
app.use('/api/merchants', merchantRoutes);
app.use('/api/rents', rentRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/repairs', repairRoutes);
app.use('/api/daily', dailyRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '服务器内部错误', message: err.message });
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});

export { prisma };

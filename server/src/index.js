import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

import stallsRouter from './routes/stalls.js';
import merchantsRouter from './routes/merchants.js';
import rentsRouter from './routes/rents.js';
import complaintsRouter from './routes/complaints.js';
import activitiesRouter from './routes/activities.js';
import repairsRouter from './routes/repairs.js';
import dailyRouter from './routes/daily.js';
import dashboardRouter from './routes/dashboard.js';
import leaseDocumentsRouter from './routes/leaseDocuments.js';
import noticesRouter from './routes/notices.js';
import reportsRouter from './routes/reports.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 3001;

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('不支持的文件类型，仅支持图片和 PDF 格式'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '美食街物业运营管理平台 API 运行正常' });
});

app.use('/api/uploads', express.static(uploadsDir));

app.use('/api/stalls', stallsRouter);
app.use('/api/merchants', merchantsRouter);
app.use('/api/rents', rentsRouter);
app.use('/api/complaints', complaintsRouter);
app.use('/api/activities', activitiesRouter);
app.use('/api/repairs', repairsRouter);
app.use('/api/daily', dailyRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/lease-documents', leaseDocumentsRouter);
app.use('/api/notices', noticesRouter);
app.use('/api/reports', reportsRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: '文件大小超过限制，最大支持 10MB' });
    }
    return res.status(400).json({ error: '文件上传错误', message: err.message });
  }
  res.status(500).json({ error: '服务器内部错误', message: err.message });
});

app.listen(PORT, () => {
  console.log(`美食街物业运营管理平台 API 运行在 http://localhost:${PORT}`);
});

export { upload, prisma };

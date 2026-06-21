import express from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();
const router = express.Router();

const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'leases');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    const fileName = `${timestamp}_${random}${ext}`;
    cb(null, fileName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('仅支持 pdf/jpg/jpeg/png/gif 格式的文件'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

router.get('/:leaseId', async (req, res, next) => {
  try {
    const leaseId = parseInt(req.params.leaseId);
    const documents = await prisma.leaseDocument.findMany({
      where: { leaseId },
      orderBy: [
        { version: 'desc' },
        { createdAt: 'desc' },
      ],
    });
    res.json(documents);
  } catch (e) {
    next(e);
  }
});

router.post('/:leaseId/upload', upload.single('file'), async (req, res, next) => {
  try {
    const leaseId = parseInt(req.params.leaseId);
    if (!req.file) {
      return res.status(400).json({ error: '请选择要上传的文件' });
    }

    const lease = await prisma.lease.findUnique({ where: { id: leaseId } });
    if (!lease) {
      return res.status(404).json({ error: '租约不存在' });
    }

    const maxVersionDoc = await prisma.leaseDocument.findFirst({
      where: { leaseId },
      orderBy: { version: 'desc' },
      select: { version: true },
    });
    const version = maxVersionDoc ? maxVersionDoc.version + 1 : 1;

    const document = await prisma.leaseDocument.create({
      data: {
        leaseId,
        fileName: req.file.filename,
        originalName: req.file.originalname,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        fileUrl: `/uploads/leases/${req.file.filename}`,
        version,
        uploadedBy: req.body.uploadedBy || null,
        remark: req.body.remark || null,
      },
    });

    res.json(document);
  } catch (e) {
    next(e);
  }
});

router.get('/:id/download', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const document = await prisma.leaseDocument.findUnique({ where: { id } });
    if (!document) {
      return res.status(404).json({ error: '文件不存在' });
    }

    const filePath = path.join(uploadDir, document.fileName);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: '物理文件不存在' });
    }

    res.download(filePath, document.originalName, (err) => {
      if (err) {
        next(err);
      }
    });
  } catch (e) {
    next(e);
  }
});

router.get('/:id/preview', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const document = await prisma.leaseDocument.findUnique({ where: { id } });
    if (!document) {
      return res.status(404).json({ error: '文件不存在' });
    }

    const filePath = path.join(uploadDir, document.fileName);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: '物理文件不存在' });
    }

    res.setHeader('Content-Type', document.fileType);
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(document.originalName)}"`);
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const document = await prisma.leaseDocument.findUnique({ where: { id } });
    if (!document) {
      return res.status(404).json({ error: '文件记录不存在' });
    }

    await prisma.leaseDocument.delete({ where: { id } });
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
});

export default router;

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const createUploadDir = (dir) => {
  const uploadDir = path.join(__dirname, '../../frontend/public', dir);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  return uploadDir;
};

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = createUploadDir('/uploads/images');
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.png');
  }
});

const voiceStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = createUploadDir('/uploads/voice');
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'sampleVoice') {
    if (file.mimetype === 'audio/mpeg' || file.mimetype === 'audio/mp3') {
      cb(null, true);
    } else {
      cb(new Error('音声ファイルはMP3形式のみ許可されています！'), false);
    }
  } else {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('画像ファイルのみ許可されています！'), false);
    }
  }
};

const uploadImage = multer({
  storage: imageStorage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB制限
});

const uploadVoice = multer({
  storage: voiceStorage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB制限
});

const resizeImage = (width = 512, height = 512) => async (req, res, next) => {
  try {
    if (!req.file) return next();

    const tmpPath = req.file.path + '.tmp';
    await sharp(req.file.path)
      .resize(width, height, { fit: 'inside' })
      .png()
      .toFile(tmpPath);
    await fs.promises.rename(tmpPath, req.file.path);
    // Log image metadata for debugging transparency
    const meta = await sharp(req.file.path).metadata();
    console.log('[resizeImage] Saved:', req.file.path, 'format:', meta.format, 'hasAlpha:', meta.hasAlpha);
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  uploadImage,
  uploadVoice,
  resizeImage
};

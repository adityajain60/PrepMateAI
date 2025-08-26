import multer from 'multer';

// Allowed file types
const allowedMimeTypes = [
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

// Memory storage config
const storage = multer.memoryStorage();

// Multer instance
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Invalid file type'), false);
    }
  },
});

// Middleware to handle `resume` and `jobDescriptionFile`
const uploadFile = upload.fields([
  { name: 'resume', maxCount: 1 },
  { name: 'jobDescriptionFile', maxCount: 1 },
]);

export default uploadFile;

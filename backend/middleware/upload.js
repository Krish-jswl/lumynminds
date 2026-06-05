// Tracked by Git
const multer = require('multer');

// Store the uploaded file in memory as a Buffer
const storage = multer.memoryStorage();

// Accept only PDF files
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit to prevent server crashes
});

module.exports = upload;

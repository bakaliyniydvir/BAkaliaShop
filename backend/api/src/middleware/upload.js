// backend/api/src/middleware/upload.js
const multer = require('multer');

// store files in memory for immediate uploading
const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports = upload;

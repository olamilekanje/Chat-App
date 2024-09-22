// backend/controllers/multimediaController.js
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/'); // Specify the directory to save files
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + path.extname(file.originalname); // Unique file name
    cb(null, uniqueName);
  }
});

const upload = multer({ storage: storage });

// Handle file upload
exports.uploadFile = (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(500).json({ message: 'Error uploading file', error: err });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Construct file URL
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    res.status(200).json({
      message: 'File uploaded successfully',
      fileUrl: fileUrl,
      fileInfo: {
        originalName: req.file.originalname,
        savedName: req.file.filename,
        mimeType: req.file.mimetype,
        size: req.file.size,
        path: req.file.path
      }
    });
  });
};

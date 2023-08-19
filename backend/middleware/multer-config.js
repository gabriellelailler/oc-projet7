const multer = require('multer');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images');
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_');
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + '.' + extension);
  }
});

module.exports = function(req, res, next) {
  multer({ storage: storage }).single('image')(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: "Multer error." });
    } else if (err) {
      return res.status(400).json({ error: "Error uploading file." });
    }
    next();
  });
};





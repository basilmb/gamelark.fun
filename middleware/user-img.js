const path = require("path");
const multer = require("multer")

const directoryPath = path.join(__dirname, "../public/users-image");

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, directoryPath);
    },
    filename: function (req, file, cb) {
      const date = new Date().toISOString().replace(/:/g, '-');
      const originalfilename = file.originalname.replace(/\s/g, '');
      const name = `${date}-${originalfilename}`;
      cb(null, name);
    },
  });
  
  const upload = multer({ storage: storage });

  module.exports = upload;
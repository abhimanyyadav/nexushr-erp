const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({

  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },

  filename: function (req, file, cb) {
    const uniqueName =
      Date.now() +
      path.extname(file.originalname);

    cb(null, uniqueName);
  }
});

// Allow images + PDF
const fileFilter = (req, file, cb) => {

  if (
    file.mimetype.startsWith("image") ||
    file.mimetype === "application/pdf"
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only image or PDF files allowed"
      ),
      false
    );
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter
});

module.exports = upload;
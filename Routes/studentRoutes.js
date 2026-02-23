const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} = require("../Controllers/studentController");

// Ensure uploads folder exists
const uploadPath = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

// Multer Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|xlsx|xls/;
    const ext = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (ext) cb(null, true);
    else cb(new Error("Only PDF or Excel allowed"));
  },
});

router
  .route("/")
  .get(getStudents)
  .post(upload.single("file"), createStudent);

router
  .route("/:id")
  .put(upload.single("file"), updateStudent)
  .delete(deleteStudent);

module.exports = router;
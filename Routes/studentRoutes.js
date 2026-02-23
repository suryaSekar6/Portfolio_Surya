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

// ============================
// ✅ Upload Folder
// ============================
const uploadPath = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// ============================
// ✅ Multer Config
// ============================
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
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|xlsx|xls/;
    const ext = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (ext) cb(null, true);
    else cb(new Error("Only PDF or Excel files allowed"));
  },
});

// ============================
// ✅ Routes
// ============================
router
  .route("/")
  .get(getStudents)
  .post(upload.single("file"), createStudent);

router
  .route("/:id")
  .put(upload.single("file"), updateStudent)
  .delete(deleteStudent);

module.exports = router;
const Student = require("../Models/studentModal");
const XLSX = require("xlsx");
const pdfParse = require("pdf-parse");
const fs = require("fs");
const path = require("path");

// ============================
// GET STUDENTS
// ============================
const getStudents = async (req, res) => {
  try {
    const keyword = req.query.college
      ? { college: { $regex: req.query.college, $options: "i" } }
      : {};

    const students = await Student.find(keyword).sort({
      createdAt: -1,
    });

    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================
// CREATE STUDENT
// ============================
const createStudent = async (req, res) => {
  try {
    const { name, college, department, website } = req.body;

    const isFileUploaded = !!req.file;
    const areFieldsFilled =
      name && college && department && website;

    if (!isFileUploaded && !areFieldsFilled) {
      return res.status(400).json({
        message:
          "Either fill all fields OR upload Excel/PDF file",
      });
    }

    // ============================
    // FILE UPLOAD
    // ============================
    if (req.file) {
      const filePath = path.join(
        __dirname,
        "../uploads",
        req.file.filename
      );

      const ext = path.extname(
        req.file.originalname
      ).toLowerCase();

      // Excel
      if (ext === ".xlsx" || ext === ".xls") {
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        const data = XLSX.utils.sheet_to_json(sheet);

        if (!data.length) {
          return res.status(400).json({
            message: "Excel file is empty",
          });
        }

        const requiredColumns = [
          "name",
          "college",
          "department",
          "website",
        ];

        const fileColumns = Object.keys(data[0]);

        const missingColumns = requiredColumns.filter(
          (col) => !fileColumns.includes(col)
        );

        if (missingColumns.length > 0) {
          return res.status(400).json({
            message: `Missing columns: ${missingColumns.join(", ")}`,
          });
        }

        await Student.insertMany(data);

        return res.status(201).json({
          message: "Excel imported successfully",
          totalInserted: data.length,
        });
      }

      // PDF
      if (ext === ".pdf") {
        const pdfBuffer = fs.readFileSync(filePath);
        const pdfData = await pdfParse(pdfBuffer);

        const student = await Student.create({
          name: "",
          college: "",
          department: "",
          website: "",
          file: req.file.filename,
        });

        return res.status(201).json({
          message: "PDF uploaded successfully",
          preview: pdfData.text.substring(0, 300),
          student,
        });
      }

      return res.status(400).json({
        message: "Unsupported file type",
      });
    }

    // ============================
    // NORMAL FORM SUBMISSION
    // ============================
    const student = await Student.create({
      name,
      college,
      department,
      website,
    });

    res.status(201).json(student);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// ============================
// UPDATE STUDENT
// ============================
const updateStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    student.name = req.body.name || student.name;
    student.college =
      req.body.college || student.college;
    student.department =
      req.body.department || student.department;
    student.website =
      req.body.website || student.website;

    if (req.file) {
      student.file = req.file.filename;
    }

    const updated = await student.save();
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ============================
// DELETE STUDENT
// ============================
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(
      req.params.id
    );

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    if (student.file) {
      const filePath = path.join(
        __dirname,
        "../uploads",
        student.file
      );

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await student.deleteOne();

    res.status(200).json({
      message: "Student deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
};
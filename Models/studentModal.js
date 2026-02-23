const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    name: { type: String },
    college: { type: String },
    department: { type: String },
    website: { type: String },
    file: { type: String }, // optional file
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);
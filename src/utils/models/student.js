import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema(
  {
    prn: {
      type: String,
      required: true,
    },
    branch: {
      full: {
        type: String,
        required: true,
      },
      short: {
        type: String,
        required: true,
      },
    },
    year: {
      type: String,
      required: true,
    },
    campus: {
      code: {
        type: Number,
        required: true,
      },
      short: {
        type: String,
        enum: ["RR", "EC"],
        required: true,
      },
    },
  },
  {
    timestamps: true,
    collection: "student",
  }
);

StudentSchema.statics.createOrUpdateStudentRecord = async function (
  studentData
) {
  const existingStudent = await this.findOne({ prn: studentData.prn });

  if (existingStudent) {
    // Update existing student
    Object.assign(existingStudent, studentData);
    return existingStudent.save();
  } else {
    // Create new student
    const student = new this(studentData);
    return student.save();
  }
};

const Student =
  mongoose.connection?.models?.Student ||
  mongoose.model("Student", StudentSchema);

export default Student;

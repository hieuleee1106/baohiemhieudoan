import mongoose from 'mongoose';

const staffSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // Một User chỉ ứng với 1 hồ sơ nhân viên
    },
    position: {
      type: String,
      required: true,
      default: 'Nhân viên',
    },
    salary: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    department: {
      type: String,
      default: 'Kinh doanh',
    },
    status: {
      type: String,
      enum: ['Đang làm việc', 'Nghỉ phép', 'Đã nghỉ việc'],
      default: 'Đang làm việc',
    },
  },
  {
    timestamps: true,
  }
);

export const Staff = mongoose.model('Staff', staffSchema);

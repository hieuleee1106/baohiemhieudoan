import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    contract: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contract",
    },
    amount: {
      type: Number,
      required: true,
    },
    method: {
      type: String, // 'ZaloPay', 'Manual', etc.
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Success", "Failed"],
      default: "Success",
    },
    transactionId: {
      type: String, // Mã giao dịch từ cổng thanh toán hoặc mã tự sinh
    },
    description: String,
    paymentDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const Transaction = mongoose.model("Transaction", transactionSchema);
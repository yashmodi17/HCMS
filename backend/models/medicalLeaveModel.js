import mongoose from "mongoose";

const MedicalLeaveSchema = new mongoose.Schema(
  {
    aanganwadiStaffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    childId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Child",
      required: false, // Optional if leave is for the aanganwadi staff themselves
    },
    healthRecordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HealthRecord",
      required: true,
    },
    reason: { type: String, required: true }, // Short description of illness
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    supportingDocuments: [
      {
        url: String,
        publicId: String,
        format: String,
        resourceType: String
      }
    ],
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Coordinator or doctor approval
  },
  { timestamps: true }
);

export const MedicalLeave = mongoose.model("MedicalLeave", MedicalLeaveSchema);

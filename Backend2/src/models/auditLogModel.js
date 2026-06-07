import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
    {
        action: {
            type: String,
            required: true,
            trim: true,
        },
        adminId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        details: {
            type: Object,
            default: {},
        },
    },
    { timestamps: true }
);

export const AuditLog = mongoose.model("AuditLog", auditLogSchema);

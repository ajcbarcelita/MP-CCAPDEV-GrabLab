import mongoose from "mongoose";

const errorLogSchema = new mongoose.Schema({
  errorMessage: { type: String, required: true },
  stackTrace: { type: String },
  route: { type: String }, // API route or function name
  method: { type: String }, // HTTP method (GET, POST, etc.)
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Optional: may be null for system errors
  createdAt: { type: Date, default: Date.now },
  additionalInfo: { type: mongoose.Schema.Types.Mixed } // For any extra context
});

const ErrorLog = mongoose.model("ErrorLog", errorLogSchema);

export default ErrorLog;
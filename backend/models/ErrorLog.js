import mongoose from "mongoose";

const errorLogSchema = new mongoose.Schema({
  errorMessage: { type: String, required: true },
  stackTrace: { type: String },
  route: { type: String }, // API route or function name
  method: { type: String }, // HTTP method (GET, POST, etc.)
  additionalInfo: { type: mongoose.Schema.Types.Mixed } // For any extra context
}, { timestamps: true }
);

const ErrorLog = mongoose.model("ErrorLog", errorLogSchema);

export default ErrorLog;
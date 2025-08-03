import ErrorLog from "../models/ErrorLog.js";

export async function logError({ error, req, route }) {
  try {
    await ErrorLog.create({
      errorMessage: error.message,
      stackTrace: error.stack,
      route,
      method: req.method,
      additionalInfo: {
        params: req.params,
        query: req.query,
        body: req.body,
      },
    });
  } catch (logErr) {
    console.error("Failed to log error to DB:", logErr);
  }
}
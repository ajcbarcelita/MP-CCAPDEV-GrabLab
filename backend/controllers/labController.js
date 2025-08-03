/**
 * Lab Controller
 * Handles API endpoints for managing labs (viewing, filtering, etc).
 * See backend/models/Lab.js for the Lab model.
 */
import Lab from "../models/Lab.js";
import { logError } from "../utils/logErrors.js";
import mongoose from "mongoose";

// Helper function to check database connection
const checkConnection = () => {
  if (mongoose.connection.readyState !== 1) {
    throw new Error("Database connection is not ready");
  }
};
/*  Get all labs
 * This function retrieves all labs from the database.
 * It checks the database connection, fetches the labs, and returns them in JSON format.
 * If an error occurs, it returns a 500 status with an error message.
 */
export const getLabs = async (req, res) => {
  try {
    checkConnection();

    const labs = await Lab.find({})
      .sort({ building: 1, name: 1 })
      .select("-__v")
      .lean();

    res.json(labs);
  } catch (error) {
    await logError({ error, req, route: "getLabs" });
    res
      .status(error.message === "Database connection is not ready" ? 503 : 500)
      .json({ message: error.message });
  }
};
/*  Get labs by building
 * This function retrieves labs filtered by a specific building.
 * It checks the database connection, fetches the labs, and returns them in JSON format.
 * If the building parameter is missing, it returns a 400 status with an error message.
 */
export const getLabsByBuilding = async (req, res) => {
  try {
    checkConnection();
    const { building } = req.params;

    if (!building) {
      await logError({ error: new Error("Building parameter is required"), req, route: "getLabsByBuilding" });
      return res.status(400).json({ message: "Building parameter is required" });
    }

    const labs = await Lab.find({ building })
      .sort({ name: 1 })
      .select("-__v")
      .lean();

    res.json(labs);
  } catch (error) {
    await logError({ error, req, route: "getLabsByBuilding" });
    res
      .status(error.message === "Database connection is not ready" ? 503 : 500)
      .json({ message: error.message });
  }
};
/*
    Get all unique buildings
    * This function retrieves a list of unique buildings from the labs.
    * It checks the database connection, fetches the distinct buildings, and returns them in JSON format.
    * If an error occurs, it returns a 500 status with an error message.
*/
export const getAllUniqueBuildings = async (req, res) => {
  try {
    checkConnection();

    const buildings = await Lab.distinct("building").sort();

    res.json(buildings);
  } catch (error) {
    await logError({ error, req, route: "getAllUniqueBuildings" });
    res
      .status(error.message === "Database connection is not ready" ? 503 : 500)
      .json({ message: error.message });
  }
};
/*   Get a specific lab by ID Number
 * This function retrieves a lab by its ID number.
 * It checks the database connection, fetches the lab, and returns it in JSON format.
 * If the lab is not found, it returns a 404 status with an error message.
 */
export const getLabByIDNumber = async (req, res) => {
  try {
    checkConnection();
    const { id } = req.params;

    if (!id) {
      await logError({ error: new Error("ID Number is required"), req, route: "getLabByIDNumber" });
      return res.status(400).json({ message: "ID Number is required" });
    }

    const lab = await Lab.findById(id).select("-__v").lean();

    if (!lab) {
      await logError({ error: new Error("Lab not found"), req, route: "getLabByIDNumber" });
      return res.status(404).json({ message: "Lab not found" });
    }

    res.json(lab);
  } catch (error) {
    await logError({ error, req, route: "getLabByIDNumber" });
    res
      .status(error.message === "Database connection is not ready" ? 503 : 500)
      .json({ message: error.message });
  }
};

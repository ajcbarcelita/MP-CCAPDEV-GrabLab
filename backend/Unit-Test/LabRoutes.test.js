import { describe, expect, it, jest, beforeEach, afterEach } from '@jest/globals';
import mongoose from 'mongoose';
import {
    getLabs,
    getLabsByBuilding,
    getLabByIDNumber
} from '../controllers/labController.js';
import Lab from '../models/Lab.js';

// Mock mongoose
jest.mock('mongoose', () => ({
  connection: {
    readyState: 1 
  },
  Schema: class MockSchema {
    constructor() {}
    static Types = {
      Mixed: 'Mixed',
      ObjectId: 'ObjectId'
    }
  },
  model: jest.fn()
}));

// Mock Lab model
jest.mock('../models/Lab.js', () => ({
  find: jest.fn(),
  findById: jest.fn(),
}));

// Mock logError utility
jest.mock('../utils/logErrors.js', () => ({
  logError: jest.fn()
}));
// Mock data
const mockLabs = [
  { id:'688832d915bcb1b6b3479930', building: 'Gokongwei', name: 'G201', capacity: 30 },
  { id:'688832d915bcb1b6b3479931', building: 'Gokongwei', name: 'G301', capacity: 25 },
  { id:'688832d915bcb1b6b3479932', building: 'Andrew', name: 'AG101', capacity: 20 },
];

beforeEach(() => {
  // Reset to connected state for each test
  mongoose.connection.readyState = 1;
  jest.clearAllMocks();
});


describe('getLabs', () => {
  const mockRequest = {
  labs: mockLabs,
  };
  const mockResponse = {
    json: jest.fn(),
    status: jest.fn().mockReturnThis()
  };

  it('should return all labs when database connection is ready', async () => {
    //Mock setup to properly handle the method chaining in getLabs
    Lab.find.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(mockLabs)
    });

    //function call
    await getLabs(mockRequest, mockResponse);
  
    //match handling
    expect(mongoose.connection.readyState).toBe(1);
    expect(mockResponse.json).toHaveBeenCalledWith(mockLabs);
    expect(mockResponse.json).toHaveBeenCalledTimes(1);
  });
    it ('should return 503 if database connection is not ready', async () => {
    mongoose.connection.readyState = 0;

    await getLabs(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(503);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Database connection is not ready' });
    expect(mockResponse.json).toHaveBeenCalledTimes(1);
  });
});


describe('getLabsByBuilding', () => {
  const mockRequest = {
    params: { building: 'Gokongwei' },
  };
  const mockResponse = {
    json: jest.fn(),
    status: jest.fn().mockReturnThis()
  };
  it('should return labs filtered by building', async () => {
    Lab.find.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(mockLabs.filter(lab => lab.building === 'Gokongwei'))
    });

    await getLabsByBuilding(mockRequest, mockResponse);

    expect(mockResponse.json).toHaveBeenCalledWith(mockLabs.filter(lab => lab.building === 'Gokongwei'));
    expect(mockResponse.json).toHaveBeenCalledTimes(1);
  });
  it('should return 400 if building parameter is missing', async () => {
    const requestWithoutBuilding = { params: {} };
    await getLabsByBuilding(requestWithoutBuilding, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Building parameter is required' });
    expect(mockResponse.json).toHaveBeenCalledTimes(1);
  });
  it('should return 503 if database connection is not ready', async () => {
    mongoose.connection.readyState = 0;

    await getLabsByBuilding(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(503);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Database connection is not ready' });
    expect(mockResponse.json).toHaveBeenCalledTimes(1);
  });
});


describe('getLabByIDNumber', () => {
  const mockRequest = {
    params: { id: '688832d915bcb1b6b3479930' }
  }
  const mockResponse = {
    json: jest.fn(),
    status: jest.fn().mockReturnThis()
  };
  it('should return lab by ID number', async () => {
    Lab.findById.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(mockLabs[0]) 
    });

    await getLabByIDNumber(mockRequest, mockResponse);

    expect(mockResponse.json).toHaveBeenCalledWith(mockLabs[0]);
    expect(mockResponse.json).toHaveBeenCalledTimes(1);
  });
  it('should return 400 if ID number is missing', async () => {
    const requestWithoutID = { params: {} };
    await getLabByIDNumber(requestWithoutID, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'ID Number is required' });
    expect(mockResponse.json).toHaveBeenCalledTimes(1);
  });
  it('should return 404 if lab is not found', async () => {
    const requestWithNonExistentID = { params: { id: 'nonexistent' } };
    
    // Mock findById to return null (lab not found)
    Lab.findById.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(null)
    });
    
    await getLabByIDNumber(requestWithNonExistentID, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Lab not found' });
    expect(mockResponse.json).toHaveBeenCalledTimes(1);
  });
  it('should return 503 if database connection is not ready', async () => {
    mongoose.connection.readyState = 0;

    await getLabByIDNumber(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(503);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Database connection is not ready' });
    expect(mockResponse.json).toHaveBeenCalledTimes(1);
  });
});
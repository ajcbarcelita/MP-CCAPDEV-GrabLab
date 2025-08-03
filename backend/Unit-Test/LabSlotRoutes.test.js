import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import {
  getLabSlotsByLabAndDate,
  createLabSlotsBatch,
  updateLabSlot,
  getLabSlotsByLab,
} from "../controllers/labSlotController.js";
import mongoose from "mongoose";
import LabSlot from "../models/LabSlot.js";



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

// Mock LabSlot model
jest.mock('../models/LabSlot.js', () => ({
  find: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  updateOne: jest.fn(),
  insertMany: jest.fn(),
  findByIdAndUpdate: jest.fn(),
}));

// Mock logError utility
jest.mock('../utils/logErrors.js', () => ({
  logError: jest.fn()
}));

// Mock data
const mockData = [
  {
    _id: '688832e186f36d14967447d7',
    lab: '688832d915bcb1b6b3479930',
    date: '2025-07-28T16:00:00.000+00:00',
    seat_number: 1,
    time_slots: [
      {
        startTime: '08:00',
        endTime: '09:00',
        reserved: null
      },
      {
        startTime: '09:00',
        endTime: '10:00',
        reserved: '688832d915bcb1b6b3479934'  
      }
    ]
  },
  {
    _id: '688832d915bcb1b6b3479931',
    lab: '688832d915bcb1b6b3479930', 
    date: '2025-07-28T16:00:00.000+00:00',
    seat_number: 2,
    time_slots: [
      {
        startTime: '08:00',
        endTime: '09:00',
        reserved: null
      },
      {
        startTime: '09:00',
        endTime: '10:00',
        reserved: null
      }
    ]
  },
  {
    _id: '688832d915bcb1b6b3479932',
    lab: '688832d915bcb1b6b3479935', 
    date: '2025-07-28T16:00:00.000+00:00',
    seat_number: 1,
    time_slots: [
      {
        startTime: '10:00',
        endTime: '11:00',
        reserved: null
      }
    ]
  }
];

beforeEach(() => {
  // Reset to connected state for each test
  mongoose.connection.readyState = 1;
  jest.clearAllMocks();
});

describe('getLabSlotsByLabAndDate', () =>
{
  const mockRequest = {
    params: {
      labId: '688832d915bcb1b6b3479930',
      date: '2025-07-28T16:00:00.000+00:00',
    }
  };
  const mockResponse = {
    json: jest.fn(),
    status: jest.fn().mockReturnThis()
  };
  it('should return lab slots for the given lab and date', async () => {
    const expectedSlots = mockData.filter(slot => slot.lab === mockRequest.params.labId);
    
    LabSlot.find.mockResolvedValue(expectedSlots);
    
    await getLabSlotsByLabAndDate(mockRequest, mockResponse);
    
    const queryDate = new Date(mockRequest.params.date);
    const startOfDay = new Date(queryDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(queryDate);
    endOfDay.setUTCHours(23, 59, 59, 999);
    
    expect(LabSlot.find).toHaveBeenCalledWith({
      lab: mockRequest.params.labId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });
    
    expect(mockResponse.json).toHaveBeenCalledWith(expectedSlots);
    expect(mockResponse.json).toHaveBeenCalledTimes(1);
  });
  it('should return 404 if no slots found', async () => {
    LabSlot.find.mockResolvedValue([]);

    await getLabSlotsByLabAndDate(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'No lab slots found for this lab and date' });
  });
  it('should return 400 for invalid date format', async () => {
    const invalidRequest = {
      params: {
        labId: '688832d915bcb1b6b3479930',
        date: 'invalid-date'
      }
    };

    await getLabSlotsByLabAndDate(invalidRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Invalid date format' });
  });
  it('should return 503 on database connection error', async () => {
    mongoose.connection.readyState = 0; 

    await getLabSlotsByLabAndDate(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(503);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Database connection is not ready' });
  });
});

describe('createLabSlotBatch', () => {
  const mockRequest = {
    body: {
      slots: [
        {
          lab: '688832d915bcb1b6b3479930',
          date: '2025-07-28T16:00:00.000+00:00',
          seat_number: 1,
          time_slots: [
            { startTime: '08:00', endTime: '09:00', reserved: null },
            { startTime: '09:00', endTime: '10:00', reserved: null }
          ]
        },
        {
          lab: '688832d915bcb1b6b3479930',
          date: '2025-07-28T16:00:00.000+00:00',
          seat_number: 2,
          time_slots: [
            { startTime: '08:00', endTime: '09:00', reserved: null },
            { startTime: '09:00', endTime: '10:00', reserved: null }
          ]
        }
      ]
    }
  };
  const mockResponse = {
    json: jest.fn(),
    status: jest.fn().mockReturnThis()
  };

  it('should create lab slots in batch', async () => {
    const createdSlots = [
      { ...mockRequest.body.slots[0], _id: 'mock-id-1' },
      { ...mockRequest.body.slots[1], _id: 'mock-id-2' }
    ];
    LabSlot.insertMany.mockResolvedValue(createdSlots);
    
    await createLabSlotsBatch(mockRequest, mockResponse);
    
    expect(LabSlot.insertMany).toHaveBeenCalledWith(mockRequest.body.slots, { ordered: false });
    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith(createdSlots);
  });
  it('should return 400 for invalid or empty slots array', async () => {
    const invalidRequest = {
      body: {
        slots: []
      }
    };

    await createLabSlotsBatch(invalidRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Invalid or empty slots array provided' });
  });
  it('should return 200 with existing slots if duplicates found', async () => {
    const existingSlots = [
      { ...mockRequest.body.slots[0], _id: 'existing-id-1' },
      { ...mockRequest.body.slots[1], _id: 'existing-id-2' }
    ];
    
    LabSlot.insertMany.mockRejectedValue({ code: 11000 });
    LabSlot.find.mockResolvedValue(existingSlots);
    
    await createLabSlotsBatch(mockRequest, mockResponse);
    
    expect(LabSlot.insertMany).toHaveBeenCalledWith(mockRequest.body.slots, { ordered: false });
    expect(LabSlot.find).toHaveBeenCalledWith({
      lab: mockRequest.body.slots[0].lab,
      date: mockRequest.body.slots[0].date
    });
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(existingSlots);
  });
  it('should return 503 on Database connection error', async () => {
    mongoose.connection.readyState = 0; 

    await createLabSlotsBatch(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(503);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Database connection is not ready' });
  });
});

describe('updateLabSlot', () => {
  const mockRequest = {
    params: {
      id: '688832d915bcb1b6b3479930'
    },
    body: {
      lab: '688832d915bcb1b6b3479930',
      date: '2025-07-28T16:00:00.000+00:00',
      seat_number: 1,
      time_slots: [
        { startTime: '08:00', endTime: '09:00', reserved: null },
        { startTime: '09:00', endTime: '10:00', reserved: null }
      ]
    }
  };
  const mockResponse = {
    json: jest.fn(),
    status: jest.fn().mockReturnThis()
  };
  it('should update a lab slot by ID', async () => {
    const updatedSlot = { ...mockRequest.body, _id: mockRequest.params.id };
    const mockPopulate = jest.fn().mockResolvedValue(updatedSlot);
    
    LabSlot.findByIdAndUpdate.mockReturnValue({
      populate: mockPopulate
    });
    
    await updateLabSlot(mockRequest, mockResponse);
    
    expect(LabSlot.findByIdAndUpdate).toHaveBeenCalledWith(
      mockRequest.params.id,
      mockRequest.body,
      { new: true, runValidators: true }
    );
    expect(mockPopulate).toHaveBeenCalledWith('lab','name display_name building operating_hours capacity');
    expect(mockResponse.json).toHaveBeenCalledWith(updatedSlot);
  });
  it('should return 404 if slot not found', async () => {
    const updatedSlot = null;
    const mockPopulate = jest.fn().mockResolvedValue(updatedSlot);
    LabSlot.findByIdAndUpdate.mockReturnValue({
      populate: mockPopulate
    });

    await updateLabSlot(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Lab slot not found' });
  });
  it('should return 500 on Database connection error', async () => {
    mongoose.connection.readyState = 0; 

    LabSlot.findByIdAndUpdate.mockRejectedValue(new Error('Database error'));

    await updateLabSlot(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(503);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Database connection is not ready' });
  });
});

describe('getLabSlotsByLab', () => {
  const mockRequest = {
    params: {
      labId: '688832d915bcb1b6b3479930'
    }
  };
  const mockResponse = {
    json: jest.fn(),
    status: jest.fn().mockReturnThis()
  };
  it('should return lab slots based on the lab id', async () => {
    const mockSort = jest.fn().mockResolvedValue(mockData);
    const mockPopulate = jest.fn().mockReturnValue({ sort: mockSort });

    LabSlot.find.mockReturnValue({ populate: mockPopulate });
    
    await getLabSlotsByLab(mockRequest, mockResponse);
    
    expect(LabSlot.find).toHaveBeenCalledWith({ lab: mockRequest.params.labId });
    expect(mockPopulate).toHaveBeenCalledWith('lab', 'name display_name building operating_hours capacity');
    expect(mockSort).toHaveBeenCalledWith({ date: 1, seat_number: 1 });
    expect(mockResponse.json).toHaveBeenCalledWith(mockData);
  });
  it('should return 400 if lab ID is not provided', async () => {
    const invalidRequest = { params: {} };

    await getLabSlotsByLab(invalidRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Lab ID is required' });
  });
  it('should return 500 on Database connection error', async () => {
    mongoose.connection.readyState = 0; 

    LabSlot.find.mockRejectedValue(new Error('Database error'));

    await getLabSlotsByLab(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(503);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Database connection is not ready' });
  });
});
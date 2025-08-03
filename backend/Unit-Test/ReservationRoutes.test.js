import { describe, it, expect, jest} from '@jest/globals';
import mongoose from 'mongoose';
import {
    getReservations,
    getReservationsByUserId,
    getReservationsByLab,
    deleteReservation,
    updateReservation,
    createReservation
} from '../controllers/reservationController.js';
import Reservation from '../models/Reservation.js';
import User from '../models/User.js';
import Lab from '../models/Lab.js';


// Mock mongoose
jest.mock('mongoose', () => ({
  connection: {
    readyState: 1 
  },
  Schema: function () { return {}; },
  model: jest.fn()
}));

// Mock Reservation model
jest.mock('../models/Reservation.js', () => ({
  find: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  updateOne: jest.fn(),
  deleteOne: jest.fn(),
  findByIdAndDelete: jest.fn(),
  findByIdAndUpdate: jest.fn(),
}));

// Mock User model
jest.mock('../models/User.js', () => ({
    findOne: jest.fn()
}));

// Mock Lab model
jest.mock('../models/Lab.js', () => ({
    findById: jest.fn(),
    find: jest.fn()
}));

// Mock data
const mockResrvations = [
    {
        id: '688832d915bcb1b6b3479930',
        userId: '5',
        labId: '688832d915bcb1b6b3479930',
        reservation_date:'2025-07-29T16:00:00.000+00:00',
        slots: [
            {
                seat_number:2,
                start_time: '2025-07-29T16:00:00.000+00:00',
                end_time: '2025-07-29T17:00:00.000+00:00',
                id: '688832d915bcb1b6b3479930'
            }
        ],
        anonymous: false,
        status: 'Active',
        __v: 0,
        createdAt: '2025-07-29T16:00:00.000+00:00',
        updateAt: '2025-07-29T16:00:00.000+00:00'
    },
    {
        id: '688832d915bcb1b6b3479931',
        userId: '1',
        labId: '688832d915bcb1b6b3479931',
        reservation_date:'2025-07-29T16:00:00.000+00:00',
        slots: [
            {
                seat_number:3,
                start_time: '2025-07-29T16:00:00.000+00:00',
                end_time: '2025-07-29T17:00:00.000+00:00',
                id: '688832d915bcb1b6b3479931'
            }
        ],
        anonymous: false,
        status: 'Active',
        __v: 0,
        createdAt: '2025-07-29T16:00:00.000+00:00',
        updateAt: '2025-07-29T16:00:00.000+00:00'
    },
    {
        id: '688832d915bcb1b6b3479932',
        userId: '2',
        labId: '688832d915bcb1b6b3479932',
        reservation_date:'2025-07-29T16:00:00.000+00:00',
        slots: [
            {
                seat_number:4,
                start_time: '2025-07-29T16:00:00.000+00:00',
                end_time: '2025-07-29T17:00:00.000+00:00',
                id: '688832d915bcb1b6b3479932'
            }
        ],
        anonymous: false,
        status: 'Active',
        __v: 0,
        createdAt: '2025-07-29T16:00:00.000+00:00',
        updateAt: '2025-07-29T16:00:00.000+00:00'
    }
];

const mockStudent = {
    _id: 'mockUserId',
    user_id: '5',
    role: 'Student',
    email: 'test@example.com',
    fname: 'John',
    lname: 'Doe'
};

const mockTechnician = [
    {
        user_id: 1234567890,
        role: 'Technician',
        email: 'tech@example.com',
        fname: 'Tech',
        lname: 'User'
    },
    {
        user_id: 1234567891,
        role: 'Technician',
        email: 'tech2@example.com',
        fname: 'Tech2',
        lname: 'User'
    }
];

const mockLabs = [
  { id:'688832d915bcb1b6b3479930', building: 'Gokongwei', name: 'G201', capacity: 30 },
  { id:'688832d915bcb1b6b3479931', building: 'Gokongwei', name: 'G301', capacity: 25 },
  { id:'688832d915bcb1b6b3479932', building: 'Andrew', name: 'AG101', capacity: 20 },
];

// Common test data for createReservation tests
const mockCreateReservationData = {
  futureDate: '2025-08-10T16:00:00.000+00:00',
  baseSlot: {
    start_time: '16:00',
    end_time: '17:00',
    id: '688832d915bcb1b6b3479930'
  },
  createSlot: (seatNumber) => ({
    seat_number: seatNumber,
    start_time: '16:00',
    end_time: '17:00',
    id: '688832d915bcb1b6b3479930'
  }),
  createMockReservation: (id, seatNumber, anonymous = false) => ({
    _id: id,
    user_id: 5,
    lab_id: '688832d915bcb1b6b3479930',
    reservation_date: new Date('2025-08-10T16:00:00.000+00:00'),
    slots: [{
      seat_number: seatNumber,
      start_time: '16:00',
      end_time: '17:00',
      id: '688832d915bcb1b6b3479930'
    }],
    anonymous: anonymous
  }),
  createMockPopulatedReservation: (mockReservation) => ({
    ...mockReservation,
    lab_id: mockLabs[0]
  })
};

describe('getReservations', () => {
    const mockRequest = {
        query: {}
    };
    const mockResponse = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
    };
    it('should return all reservations', async () => {
        const mockReservationsWithToObject = mockResrvations.map(reservation => ({
            ...reservation,
            toObject: jest.fn().mockReturnValue(reservation)
        }));

        const mockSort = jest.fn().mockResolvedValue(mockReservationsWithToObject);
        const mockPopulate = jest.fn().mockReturnValue({ sort: mockSort });
        Reservation.find.mockReturnValue({ populate: mockPopulate });

        // Use the already mocked User model
        User.findOne.mockResolvedValue(mockStudent);
        mongoose.model.mockReturnValue(User);

        await getReservations(mockRequest, mockResponse);

        expect(Reservation.find).toHaveBeenCalledWith({});
        expect(mockPopulate).toHaveBeenCalledWith("lab_id", "name display_name building");
        expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
        expect(mockResponse.json).toHaveBeenCalledTimes(1);
        
        const responseCall = mockResponse.json.mock.calls[0][0];
        expect(responseCall.length).toBe(3);

        responseCall.forEach(reservation => {
        expect(reservation.user).toBeDefined();
        expect(reservation.user.user_id).toBe(mockStudent.user_id);
        expect(reservation.user.email).toBe(mockStudent.email);
        expect(reservation.user.fname).toBe(mockStudent.fname);
        expect(reservation.user.lname).toBe(mockStudent.lname);
        expect(reservation.user._id).toBe(mockStudent._id);
    });
    });
    it('should handle anonymous reservations', async () => {
        const allAnonymousReservations = mockResrvations.map(reservation => ({
            ...reservation,
            anonymous: true,
            toObject: jest.fn().mockReturnValue({
                ...reservation,
                anonymous: true
            })
        }));

        const mockSort = jest.fn().mockResolvedValue(allAnonymousReservations);
        const mockPopulate = jest.fn().mockReturnValue({ sort: mockSort });
        Reservation.find.mockReturnValue({ populate: mockPopulate });

        User.findOne.mockResolvedValue(mockStudent);
        mongoose.model.mockReturnValue(User);

        await getReservations(mockRequest, mockResponse);

        expect(mockResponse.json).toHaveBeenCalledTimes(1);
        const responseCall = mockResponse.json.mock.calls[0][0];
        
        responseCall.forEach(reservation => {
            expect(reservation.user.user_id).toBe("Anonymous");
            expect(reservation.user.email).toBe("Anonymous");
            expect(reservation.user.fname).toBe("Anonymous");
            expect(reservation.user.lname).toBe("User");
        });
    });
    it('should return 500 if there is a database error', async () => {
        const originalConsoleError = console.error;
        console.error = jest.fn(); 

        const dbError = new Error('Database connection failed');
        Reservation.find.mockImplementation(() => {
            throw dbError;
        });

        await getReservations(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Database connection failed' });
        expect(mockResponse.json).toHaveBeenCalledTimes(1);
        
        console.error = originalConsoleError;
    });
});

describe('getReservationByUserId', () => {
    const mockRequest = {
        params: {
            userId: '5'  
        }
    };
    const mockResponse = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
    };
    
    it('should return reservations by user ID', async () => {
        const userReservations = [mockResrvations[0]]; 

        const mockReservationsWithToObject = userReservations.map(reservation => ({
            ...reservation,
            toObject: jest.fn().mockReturnValue(reservation)
        }));

        const mockSort = jest.fn().mockResolvedValue(mockReservationsWithToObject);
        const mockPopulate = jest.fn().mockReturnValue({ sort: mockSort });
        Reservation.find.mockReturnValue({ populate: mockPopulate });

        User.findOne.mockResolvedValue(mockStudent);
        mongoose.model.mockReturnValue(User);

        await getReservationsByUserId(mockRequest, mockResponse);

        expect(Reservation.find).toHaveBeenCalledWith({ user_id: 5 });
        expect(mockPopulate).toHaveBeenCalledWith("lab_id", "name display_name building");
        expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
        expect(mockResponse.json).toHaveBeenCalledTimes(1);

        const responseCall = mockResponse.json.mock.calls[0][0];
        expect(responseCall.length).toBe(1);
        responseCall.forEach(reservation => {
            expect(reservation.user).toBeDefined();
            expect(reservation.user.user_id).toBe(mockStudent.user_id);
            expect(reservation.user.email).toBe(mockStudent.email);
            expect(reservation.user.fname).toBe(mockStudent.fname);
            expect(reservation.user.lname).toBe(mockStudent.lname);
            expect(reservation.user._id).toBe(mockStudent._id);
        });

    });

    it('should return 500 if there is a database error', async () => {
        const originalConsoleError = console.error;
        console.error = jest.fn();

        const dbError = new Error('Database connection failed');
        Reservation.find.mockImplementation(() => {
            throw dbError;
        });

        await getReservationsByUserId(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Database connection failed' });
        expect(mockResponse.json).toHaveBeenCalledTimes(1);

        console.error = originalConsoleError;
    });
});

describe('getReservationByLab', () => {
    const mockRequest = {
        params: {
            labId: '688832d915bcb1b6b3479930'  
        }
    };
    const mockResponse = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
    };
    
    it('should return reservations by lab ID', async () => {
        const labReservations = [mockResrvations[0]]; // Only reservations for this lab
        
        const mockReservationsWithToObject = labReservations.map(reservation => ({
            ...reservation,
            toObject: jest.fn().mockReturnValue(reservation)
        }));

        const mockSort = jest.fn().mockResolvedValue(mockReservationsWithToObject);
        const mockPopulate = jest.fn().mockReturnValue({ sort: mockSort });
        Reservation.find.mockReturnValue({ populate: mockPopulate });

        User.findOne.mockResolvedValue(mockStudent);
        mongoose.model.mockReturnValue(User);

        await getReservationsByLab(mockRequest, mockResponse);

        expect(Reservation.find).toHaveBeenCalledWith({ 
            lab_id: mockRequest.params.labId, 
            status: 'Active' 
        });
        expect(mockPopulate).toHaveBeenCalledWith("lab_id", "name display_name building");
        expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
        expect(mockResponse.json).toHaveBeenCalledTimes(1);
        
        const responseCall = mockResponse.json.mock.calls[0][0];
        expect(responseCall.length).toBe(1);
        responseCall.forEach(reservation => {
            expect(reservation.user).toBeDefined();
            expect(reservation.user.user_id).toBe(mockStudent.user_id);
            expect(reservation.user.email).toBe(mockStudent.email);
            expect(reservation.user.fname).toBe(mockStudent.fname);
            expect(reservation.user.lname).toBe(mockStudent.lname);
            expect(reservation.user._id).toBe(mockStudent._id);
        });
    });

    it('should return empty array when no reservations found for lab', async () => {
        const mockSort = jest.fn().mockResolvedValue([]);
        const mockPopulate = jest.fn().mockReturnValue({ sort: mockSort });
        Reservation.find.mockReturnValue({ populate: mockPopulate });

        await getReservationsByLab(mockRequest, mockResponse);

        expect(Reservation.find).toHaveBeenCalledWith({ 
            lab_id: mockRequest.params.labId, 
            status: 'Active' 
        });
        expect(mockResponse.json).toHaveBeenCalledWith([]);
    });

    it('should return 500 if there is a database error', async () => {
        const originalConsoleError = console.error;
        console.error = jest.fn();

        const dbError = new Error('Database connection failed');
        Reservation.find.mockImplementation(() => {
            throw dbError;
        });

        await getReservationsByLab(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Database connection failed' });
        expect(mockResponse.json).toHaveBeenCalledTimes(1);

        console.error = originalConsoleError;
    });

    it('should handle anonymous reservations correctly', async () => {
        const anonymousReservation = {
            ...mockResrvations[0],
            anonymous: true,
            toObject: jest.fn().mockReturnValue({
                ...mockResrvations[0],
                anonymous: true
            })
        };

        const mockSort = jest.fn().mockResolvedValue([anonymousReservation]);
        const mockPopulate = jest.fn().mockReturnValue({ sort: mockSort });
        Reservation.find.mockReturnValue({ populate: mockPopulate });

        const mockUserModel = {
            findOne: jest.fn().mockResolvedValue(mockStudent)
        };
        mongoose.model.mockReturnValue(mockUserModel);

        await getReservationsByLab(mockRequest, mockResponse);

        expect(mockResponse.json).toHaveBeenCalledTimes(1);

        const responseCall = mockResponse.json.mock.calls[0][0];
        expect(responseCall[0].user.user_id).toBe("Anonymous");
        expect(responseCall[0].user.fname).toBe("Anonymous");
        expect(responseCall[0].user.lname).toBe("User");
    });
});

describe('deleteReservation', () => {
    const mockRequest = {
        params: {
            id: '688832d915bcb1b6b3479930'
        }
    };
    const mockResponse = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
    };
    it('should delete a reservation by ID', async () => {
        const mockReservation = mockResrvations[0];

        Reservation.findById.mockResolvedValue(mockReservation);
        Reservation.findByIdAndDelete.mockResolvedValue(mockReservation);

        await deleteReservation(mockRequest, mockResponse);

        expect(Reservation.findByIdAndDelete).toHaveBeenCalledWith(mockRequest.params.id);
        expect(Reservation.findById).toHaveBeenCalledWith(mockRequest.params.id);
        expect(mockResponse.json).toHaveBeenCalledTimes(1);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Reservation deleted successfully' });
    });
    it('should return 404 if reservation not found', async () => {
        Reservation.findById.mockResolvedValue(null);

        await deleteReservation(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Reservation not found' });
    });
    it('should return 500 if there is a database error', async () => {
        const originalConsoleError = console.error;
        console.error = jest.fn(); 

        const dbError = new Error('Database connection failed');
        Reservation.findById.mockImplementation(() => {
            throw dbError;
        });

        await deleteReservation(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Database connection failed' });
        expect(mockResponse.json).toHaveBeenCalledTimes(1);
        
        console.error = originalConsoleError;
    });
});

describe('updateReservation', () => {
    const mockRequest = {
        params: {
            id: '688832d915bcb1b6b3479930'
        },
        body: {
            user_id: '5',
            lab_id: '688832d915bcb1b6b3479930',
            reservation_date: '2025-07-29T16:00:00.000+00:00',
            slots: [
                {
                    seat_number: 2,
                    start_time: '2025-07-29T16:00:00.000+00:00',
                    end_time: '2025-07-29T17:00:00.000+00:00',
                    id: '688832d915bcb1b6b3479930'
                }
            ],
            anonymous: false,
            status: 'Active',
            technician_id: '1234567890'
        }
    };
    const mockResponse = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
    };
    
    it('should successfully update a reservation', async () => {
        const mockExistingReservation = mockResrvations[0];
        const mockUpdatedReservation = {
            ...mockExistingReservation,
            ...mockRequest.body,
            user_id: 5,
            reservation_date: new Date(mockRequest.body.reservation_date),
            toObject: jest.fn().mockReturnValue({
                ...mockExistingReservation,
                ...mockRequest.body,
                user_id: 5,
                reservation_date: new Date(mockRequest.body.reservation_date)
            })
        };

        // check if reservation exists
        Reservation.findById.mockResolvedValue(mockExistingReservation);
        
        // check for conflicts
        Reservation.find.mockResolvedValue([]);
        
        const mockPopulate = jest.fn().mockResolvedValue(mockUpdatedReservation);
        Reservation.findByIdAndUpdate.mockReturnValue({ populate: mockPopulate });

        User.findOne
            .mockResolvedValueOnce(mockTechnician[0]) // for technician lookup
            .mockResolvedValueOnce(mockStudent)    // for student lookup
            .mockResolvedValueOnce(mockStudent);   // for final user population

        mongoose.model.mockReturnValue(User);

        await updateReservation(mockRequest, mockResponse);

    
        expect(Reservation.findById).toHaveBeenCalledWith(mockRequest.params.id);
        expect(User.findOne).toHaveBeenCalledWith({ user_id: parseInt(mockRequest.body.technician_id) });
        expect(User.findOne).toHaveBeenCalledWith({ user_id: parseInt(mockRequest.body.user_id) });
        
        // verify conflict 
        expect(Reservation.find).toHaveBeenCalledWith({
            lab_id: mockRequest.body.lab_id,
            reservation_date: new Date(mockRequest.body.reservation_date),
            status: "Active",
            _id: { $ne: mockRequest.params.id }
        });
        
        // update reservation
        expect(Reservation.findByIdAndUpdate).toHaveBeenCalledWith(
            mockRequest.params.id,
            expect.objectContaining({
                user_id: 5,
                lab_id: mockRequest.body.lab_id,
                reservation_date: expect.any(Date),
                slots: mockRequest.body.slots,
                anonymous: false,
                status: mockRequest.body.status
            }),
            { new: true }
        );
        
        // verify population
        expect(mockPopulate).toHaveBeenCalledWith("lab_id", "name display_name building");
        
        // verify final user population
        expect(User.findOne).toHaveBeenCalledWith({ user_id: mockUpdatedReservation.user_id });
        
        // verify response
        expect(mockResponse.json).toHaveBeenCalledTimes(1);
        const responseCall = mockResponse.json.mock.calls[0][0];
        expect(responseCall.user).toBeDefined();
        expect(responseCall.user.user_id).toBe(mockStudent.user_id);
        expect(responseCall.user.fname).toBe(mockStudent.fname);
        expect(responseCall.user.lname).toBe(mockStudent.lname);
        expect(responseCall.user.email).toBe(mockStudent.email);
    });

    it('should successfully update an anonymous reservation', async () => {
        const anonymousRequest = {
            ...mockRequest,
            body: { ...mockRequest.body, anonymous: true, technician_id: undefined }
        };
        
        const mockExistingReservation = mockResrvations[0];
        const mockUpdatedReservation = {
            ...mockExistingReservation,
            anonymous: true,
            toObject: jest.fn().mockReturnValue({
                ...mockExistingReservation,
                anonymous: true
            })
        };

        Reservation.findById.mockResolvedValue(mockExistingReservation);
        Reservation.find.mockResolvedValue([]);
        
        const mockPopulate = jest.fn().mockResolvedValue(mockUpdatedReservation);
        Reservation.findByIdAndUpdate.mockReturnValue({ populate: mockPopulate });

        mongoose.model.mockReturnValue(User);

        await updateReservation(anonymousRequest, mockResponse);

        expect(mockResponse.json).toHaveBeenCalledTimes(1);
        const responseCall = mockResponse.json.mock.calls[0][0];
        expect(responseCall.user.user_id).toBe("Anonymous");
        expect(responseCall.user.fname).toBe("Anonymous");
        expect(responseCall.user.lname).toBe("User");
        expect(responseCall.user.email).toBe("Anonymous");
    });

    it('should successfully update reservation without technician validation', async () => {
        const requestWithoutTechnician = {
            ...mockRequest,
            body: { ...mockRequest.body, technician_id: undefined }
        };
        
        const mockExistingReservation = mockResrvations[0];
        const mockUpdatedReservation = {
            ...mockExistingReservation,
            toObject: jest.fn().mockReturnValue(mockExistingReservation)
        };

        Reservation.findById.mockResolvedValue(mockExistingReservation);
        Reservation.find.mockResolvedValue([]);
        
        const mockPopulate = jest.fn().mockResolvedValue(mockUpdatedReservation);
        Reservation.findByIdAndUpdate.mockReturnValue({ populate: mockPopulate });

        User.findOne.mockResolvedValue(mockStudent);
        mongoose.model.mockReturnValue(User);

        await updateReservation(requestWithoutTechnician, mockResponse);

        expect(User.findOne).toHaveBeenCalledTimes(1);
        expect(User.findOne).toHaveBeenCalledWith({ user_id: mockUpdatedReservation.user_id });
        
        expect(mockResponse.json).toHaveBeenCalledTimes(1);
        const responseCall = mockResponse.json.mock.calls[0][0];
        expect(responseCall.user).toBeDefined();
    });

    it('should return 404 if reservation not found', async () => {
        Reservation.findById.mockResolvedValue(null);

        await updateReservation(mockRequest, mockResponse);

        expect(Reservation.findById).toHaveBeenCalledWith(mockRequest.params.id);
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Reservation not found' });
    });

    it('should return 403 if technician not found', async () => {
        const mockExistingReservation = mockResrvations[0];

        Reservation.findById.mockResolvedValue(mockExistingReservation);
        User.findOne
            .mockResolvedValueOnce(null) // Technician not found
            .mockResolvedValueOnce(mockStudent);

        mongoose.model.mockReturnValue(User);

        await updateReservation(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(403);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Invalid technician ID.' });
    });

    it('should return 403 if technician role is not Technician', async () => {
        const mockExistingReservation = mockResrvations[0];
        const invalidTechnician = { ...mockTechnician[0], role: 'Student' };

        Reservation.findById.mockResolvedValue(mockExistingReservation);
        User.findOne
            .mockResolvedValueOnce(invalidTechnician) // Invalid role
            .mockResolvedValueOnce(mockStudent);

        mongoose.model.mockReturnValue(User);

        await updateReservation(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(403);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Invalid technician ID.' });
    });

    it('should return 403 if technician tries to reserve for themselves', async () => {
        const mockExistingReservation = mockResrvations[0];
        const selfReservationRequest = {
            ...mockRequest,
            body: { 
                ...mockRequest.body, 
                user_id: '1234567890', 
                technician_id: '1234567890' 
            }
        };

        Reservation.findById.mockResolvedValue(mockExistingReservation);
        User.findOne
            .mockResolvedValueOnce(mockTechnician[0])
            .mockResolvedValueOnce(mockTechnician[0]); // Same user

        mongoose.model.mockReturnValue(User);

        await updateReservation(selfReservationRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(403);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Technicians cannot reserve for themselves. Please enter a student ID.'
        });
    });

    it('should return 403 if student not found', async () => {
        const mockExistingReservation = mockResrvations[0];

        Reservation.findById.mockResolvedValue(mockExistingReservation);
        User.findOne
            .mockResolvedValueOnce(mockTechnician[0])
            .mockResolvedValueOnce(null); // Student not found

        mongoose.model.mockReturnValue(User);

        await updateReservation(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(403);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Technicians can only reserve for students.'
        });
    });

    it('should return 403 if student role is not Student', async () => {
        const mockExistingReservation = mockResrvations[0];
        const nonStudent = { ...mockStudent, role: 'Admin' };

        Reservation.findById.mockResolvedValue(mockExistingReservation);
        User.findOne
            .mockResolvedValueOnce(mockTechnician[0])
            .mockResolvedValueOnce(nonStudent);

        mongoose.model.mockReturnValue(User);

        await updateReservation(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(403);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Technicians can only reserve for students.'
        });
    });

    it('should return 400 for past time slots (today)', async () => {
        const mockExistingReservation = mockResrvations[0];
        const today = new Date();
        const pastSlotRequest = {
            ...mockRequest,
            body: {
                ...mockRequest.body,
                reservation_date: today.toISOString(),
                slots: [{
                    seat_number: 2,
                    start_time: '08:00',
                    end_time: '09:00', // Past time
                    id: '688832d915bcb1b6b3479930'
                }]
            }
        };

        Reservation.findById.mockResolvedValue(mockExistingReservation);
        User.findOne
            .mockResolvedValueOnce(mockTechnician[0])
            .mockResolvedValueOnce(mockStudent);

        mongoose.model.mockReturnValue(User);

        await updateReservation(pastSlotRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Cannot update to slot ending before current time: 08:00-09:00'
        });
    });

    it('should return 400 for empty slots array', async () => {
        const mockExistingReservation = mockResrvations[0];
        const emptySlotRequest = {
            ...mockRequest,
            body: { ...mockRequest.body, slots: [] }
        };

        Reservation.findById.mockResolvedValue(mockExistingReservation);
        User.findOne
            .mockResolvedValueOnce(mockTechnician[0])
            .mockResolvedValueOnce(mockStudent);

        mongoose.model.mockReturnValue(User);

        await updateReservation(emptySlotRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Slots must be a non-empty array'
        });
    });

    it('should return 400 for non-array slots', async () => {
        const mockExistingReservation = mockResrvations[0];
        const invalidSlotRequest = {
            ...mockRequest,
            body: { ...mockRequest.body, slots: "invalid" }
        };

        Reservation.findById.mockResolvedValue(mockExistingReservation);
        User.findOne
            .mockResolvedValueOnce(mockTechnician[0])
            .mockResolvedValueOnce(mockStudent);

        mongoose.model.mockReturnValue(User);

        await updateReservation(invalidSlotRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Slots must be a non-empty array'
        });
    });

    it('should return 400 for invalid status value', async () => {
        const mockExistingReservation = mockResrvations[0];
        const invalidStatusRequest = {
            ...mockRequest,
            body: { ...mockRequest.body, status: 'InvalidStatus' }
        };

        Reservation.findById.mockResolvedValue(mockExistingReservation);
        User.findOne
            .mockResolvedValueOnce(mockTechnician[0])
            .mockResolvedValueOnce(mockStudent);

        mongoose.model.mockReturnValue(User);

        await updateReservation(invalidStatusRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Invalid status value'
        });
    });

    it('should return 409 for slot conflicts', async () => {
        const mockExistingReservation = mockResrvations[0];
        const conflictingReservation = {
            _id: 'different-reservation-id',
            slots: [{
                seat_number: 2,
                start_time: '2025-07-29T16:00:00.000+00:00',
                end_time: '2025-07-29T17:00:00.000+00:00'
            }]
        };

        Reservation.findById.mockResolvedValue(mockExistingReservation);
        Reservation.find.mockResolvedValue([conflictingReservation]); // Conflict found
        
        User.findOne
            .mockResolvedValueOnce(mockTechnician[0])
            .mockResolvedValueOnce(mockStudent);

        mongoose.model.mockReturnValue(User);

        await updateReservation(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(409);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Seat 2 at 2025-07-29T16:00:00.000+00:00-2025-07-29T17:00:00.000+00:00 is already reserved'
        });
    });

    it('should return 500 for database errors during findById', async () => {
        const originalConsoleError = console.error;
        console.error = jest.fn();

        const dbError = new Error('Database connection failed');
        Reservation.findById.mockRejectedValue(dbError);

        await updateReservation(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Database connection failed'
        });
        expect(console.error).toHaveBeenCalledWith('Error updating reservation:', dbError);

        console.error = originalConsoleError;
    });

    it('should return 500 for database errors during user lookup', async () => {
        const originalConsoleError = console.error;
        console.error = jest.fn();

        const mockExistingReservation = mockResrvations[0];
        const dbError = new Error('User lookup failed');

        Reservation.findById.mockResolvedValue(mockExistingReservation);
        User.findOne.mockRejectedValue(dbError);
        mongoose.model.mockReturnValue(User);

        await updateReservation(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'User lookup failed'
        });
        expect(console.error).toHaveBeenCalledWith('Error updating reservation:', dbError);

        console.error = originalConsoleError;
    });

    it('should return 500 for database errors during update', async () => {
        const originalConsoleError = console.error;
        console.error = jest.fn();

        const mockExistingReservation = mockResrvations[0];
        const dbError = new Error('Update failed');

        Reservation.findById.mockResolvedValue(mockExistingReservation);
        Reservation.find.mockResolvedValue([]);
        Reservation.findByIdAndUpdate.mockImplementation(() => {
            throw dbError;
        });

        User.findOne
            .mockResolvedValueOnce(mockTechnician[0])
            .mockResolvedValueOnce(mockStudent);

        mongoose.model.mockReturnValue(User);

        await updateReservation(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Update failed'
        });
        expect(console.error).toHaveBeenCalledWith('Error updating reservation:', dbError);

        console.error = originalConsoleError;
    });
});

describe('createReservation', () => {
    const mockRequest = {
        body: {
            user_id: '5',
            lab_id: '688832d915bcb1b6b3479930',
            reservation_date: '2025-07-29T16:00:00.000+00:00',
            slots: [
                {
                    seat_number: 2,
                    start_time: '2025-07-29T16:00:00.000+00:00',
                    end_time: '2025-07-29T17:00:00.000+00:00',
                    id: '688832d915bcb1b6b3479930'
                }
            ],
            anonymous: false,
            technician_id: '1234567890'
        }
    };
    const mockResponse = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
    };
    
    it('should return 400 for missing required fields', async () => {
        const incompleteRequest = {
            body: {
                user_id: '5',
                // lab_id is missing
                reservation_date: '2025-07-29T16:00:00.000+00:00',
                slots: [
                    {
                        seat_number: 2,
                        start_time: '2025-07-29T16:00:00.000+00:00',
                        end_time: '2025-07-29T17:00:00.000+00:00',
                        id: '688832d915bcb1b6b3479930'
                    }
                ],
                anonymous: false,
                technician_id: '1234567890'
            }
        };

        await createReservation(incompleteRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Missing required fields or invalid slots format'
        });
    });
    it('should return 404 for invalid user_id', async () => {
        const invalidRequest = {
            body: {
                user_id: '00000', // Invalid user ID
                lab_id: '688832d915bcb1b6b3479930',
                reservation_date: '2025-07-29T16:00:00.000+00:00',
                slots: [
                    {
                        seat_number: 2,
                        start_time: '2025-07-29T16:00:00.000+00:00',
                        end_time: '2025-07-29T17:00:00.000+00:00',
                        id: '688832d915bcb1b6b3479930'
                    }
                ],
                anonymous: false,
                technician_id: '1234567890'
            }
        };

        User.findOne.mockResolvedValue(null); // User not found
        mongoose.model.mockReturnValue(User);

        await createReservation(invalidRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'User not found'
        });
    });
    it('should return 403 for invalid technician_id', async () => {
        const invalidTechnician = {
            body: {
                user_id: '5',
                lab_id: '688832d915bcb1b6b3479930',
                reservation_date: '2025-07-29T16:00:00.000+00:00',
                slots: [
                    {
                        seat_number: 2,
                        start_time: '2025-07-29T16:00:00.000+00:00',
                        end_time: '2025-07-29T17:00:00.000+00:00',
                        id: '688832d915bcb1b6b3479930'
                    }
                ],
                anonymous: false,
                technician_id: '00000' // Invalid technician ID
            }
        };

        User.findOne
            .mockResolvedValueOnce(mockStudent)  // student lookup
            .mockResolvedValueOnce(null);        // technician lookup (should fail)
    
        mongoose.model.mockReturnValue(User);

        await createReservation(invalidTechnician, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(403);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Invalid technician ID.'
        });
    });
    it('should return 403 for non-Technician role', async () => {
        const invalidTechnicianRequest = {
            body: {
                user_id: '5',
                lab_id: '688832d915bcb1b6b3479930',
                reservation_date: '2025-07-29T16:00:00.000+00:00',
                slots: [
                    {
                        seat_number: 2,
                        start_time: '2025-07-29T16:00:00.000+00:00',
                        end_time: '2025-07-29T17:00 :00.000+00:00',
                        id: '688832d915bcb1b6b3479930'
                    }
                ],
                anonymous: false,
                technician_id: '1234567890' // Valid technician ID
            }
        };

        const invalidTechnician = { ...mockTechnician[0], role: 'Student' };

        User.findOne
            .mockResolvedValueOnce(mockStudent)  // student lookup
            .mockResolvedValueOnce(invalidTechnician); // technician lookup (should fail)
    
        mongoose.model.mockReturnValue(User);

        await createReservation(invalidTechnicianRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(403);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Invalid technician ID.'
        });
    });
    it('should return 403 for technician reserving for themselves', async () => {
        const selfReservation = {
            body: {
                user_id: '1234567890', // Same as technician_id
                lab_id: '688832d915bcb1b6b3479930',
                reservation_date: '2025-07-29T16:00:00.000+00:00',
                slots: [
                    {
                        seat_number: 2,
                        start_time: '2025-07-29T16:00:00.000+00:00',
                        end_time: '2025-07-29T17:00:00.000+00:00',
                        id: '688832d915bcb1b6b3479930'
                    }
                ],
                anonymous: false,
                technician_id: '1234567890' // Same as user_id
            }
        };

        User.findOne
            .mockResolvedValueOnce(mockTechnician[0]) 
            .mockResolvedValueOnce(mockTechnician[0]); 
    
        mongoose.model.mockReturnValue(User);

        await createReservation(selfReservation, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(403);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Technicians cannot reserve for themselves. Please enter a student ID.'
        });
    });
    it('should return 403 for reserving another technician (not Student)', async () => {
        const reserveTech = {
            body: {
                user_id: '1234567890',
                lab_id: '688832d915bcb1b6b3479930',
                reservation_date: '2025-07-29T16:00:00.000+00:00',
                slots: [
                    {
                        seat_number: 2,
                        start_time: '2025-07-29T16:00:00.000+00:00',
                        end_time: '2025-07-29T17:00:00.000+00:00',
                        id: '688832d915bcb1b6b3479930'
                    }
                ],
                anonymous: false,
                technician_id: '1234567891'
            }
        };

        User.findOne
            .mockResolvedValueOnce(mockTechnician[0])  
            .mockResolvedValueOnce(mockTechnician[1]); 

        mongoose.model.mockReturnValue(User);

        await createReservation(reserveTech, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(403);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Technicians can only reserve for students.'
        });
    });
    it('should return 404 for not found lab_id', async () => {
        const notFoundLab = {
            body: {
                user_id: '5',
                lab_id: '00000', 
                reservation_date: '2025-07-29T16:00:00.000+00:00',
                slots: [
                    {
                        seat_number: 2,
                        start_time: '2025-07-29T16:00:00.000+00:00',
                        end_time: '2025-07-29T17:00:00.000+00:00',
                        id: '688832d915bcb1b6b3479930'
                    }
                ],
                anonymous: false,
                technician_id: '1234567890'
            }
        };

        User.findOne
            .mockResolvedValueOnce(mockStudent)  
            .mockResolvedValueOnce(mockTechnician[0]); 

        mongoose.model.mockReturnValue(User);
        Lab.findById.mockResolvedValue(null); // Lab not found
        
        await createReservation(notFoundLab, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Lab not found'
        });
    });

    it('should return 400 for past time slots (today)', async () => {
        // Create a date for today with past time slots
        const today = new Date();
        const pastTime = new Date(today);
        pastTime.setHours(today.getHours() - 2); // 2 hours ago

        const pastTimeRequest = {
            body: {
                user_id: '5',
                lab_id: '688832d915bcb1b6b3479930',
                reservation_date: today.toISOString(),
                slots: [
                    {
                        seat_number: 2,
                        start_time: `${String(pastTime.getHours()).padStart(2, '0')}:00`,
                        end_time: `${String(pastTime.getHours() + 1).padStart(2, '0')}:00`,
                        id: '688832d915bcb1b6b3479930'
                    }
                ],
                anonymous: false
            }
        };

        User.findOne.mockResolvedValue(mockStudent);
        mongoose.model.mockReturnValue(User);
        Lab.findById.mockResolvedValue(mockLabs[0]);

        await createReservation(pastTimeRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: expect.stringContaining('Cannot book slot ending before current time')
        });
    });

    it('should return 409 for slot conflicts', async () => {
        const conflictRequest = {
            body: {
                user_id: '5',
                lab_id: '688832d915bcb1b6b3479930',
                reservation_date: mockCreateReservationData.futureDate,
                slots: [mockCreateReservationData.createSlot(2)],
                anonymous: false
            }
        };

        const existingReservation = {
            slots: [{
                seat_number: 2,
                start_time: '16:00',
                end_time: '17:00'
            }]
        };

        User.findOne.mockResolvedValue(mockStudent);
        mongoose.model.mockReturnValue(User);
        Lab.findById.mockResolvedValue(mockLabs[0]);
        Reservation.find.mockResolvedValue([existingReservation]);

        await createReservation(conflictRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(409);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Seat 2 at 16:00-17:00 is already reserved'
        });
    });

    it('should successfully create a reservation', async () => {
        const successRequest = {
            body: {
                user_id: '5',
                lab_id: '688832d915bcb1b6b3479930',
                reservation_date: mockCreateReservationData.futureDate,
                slots: [mockCreateReservationData.createSlot(3)],
                anonymous: false
            }
        };

        const mockCreatedReservation = mockCreateReservationData.createMockReservation('688832d915bcb1b6b3479999', 3);
        const mockPopulatedReservation = mockCreateReservationData.createMockPopulatedReservation(mockCreatedReservation);

        User.findOne.mockResolvedValue(mockStudent);
        mongoose.model.mockReturnValue(User);
        Lab.findById.mockResolvedValue(mockLabs[0]);
        Reservation.find.mockResolvedValue([]); // No conflicts
        Reservation.create.mockResolvedValue(mockCreatedReservation);
        
        const mockLean = jest.fn().mockResolvedValue(mockPopulatedReservation);
        const mockPopulate = jest.fn().mockReturnValue({ lean: mockLean });
        Reservation.findById.mockReturnValue({ populate: mockPopulate });

        await createReservation(successRequest, mockResponse);

        expect(Reservation.create).toHaveBeenCalledWith({
            user_id: 5,
            lab_id: '688832d915bcb1b6b3479930',
            reservation_date: expect.any(Date),
            slots: successRequest.body.slots,
            anonymous: false
        });

        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledTimes(1);
        
        const responseCall = mockResponse.json.mock.calls[0][0];
        expect(responseCall.user).toBeDefined();
        expect(responseCall.user.user_id).toBe(mockStudent.user_id);
        expect(responseCall.user.fname).toBe(mockStudent.fname);
        expect(responseCall.user.lname).toBe(mockStudent.lname);
        expect(responseCall.user.email).toBe(mockStudent.email);
    });

    it('should successfully create an anonymous reservation', async () => {
        const anonymousRequest = {
            body: {
                user_id: '5',
                lab_id: '688832d915bcb1b6b3479930',
                reservation_date: mockCreateReservationData.futureDate,
                slots: [mockCreateReservationData.createSlot(4)],
                anonymous: true
            }
        };

        const mockCreatedReservation = mockCreateReservationData.createMockReservation('688832d915bcb1b6b3479998', 4, true);
        const mockPopulatedReservation = mockCreateReservationData.createMockPopulatedReservation(mockCreatedReservation);

        User.findOne.mockResolvedValue(mockStudent);
        mongoose.model.mockReturnValue(User);
        Lab.findById.mockResolvedValue(mockLabs[0]);
        Reservation.find.mockResolvedValue([]); // No conflicts
        Reservation.create.mockResolvedValue(mockCreatedReservation);
        
        const mockLean = jest.fn().mockResolvedValue(mockPopulatedReservation);
        const mockPopulate = jest.fn().mockReturnValue({ lean: mockLean });
        Reservation.findById.mockReturnValue({ populate: mockPopulate });

        await createReservation(anonymousRequest, mockResponse);

        expect(Reservation.create).toHaveBeenCalledWith({
            user_id: 5,
            lab_id: '688832d915bcb1b6b3479930',
            reservation_date: expect.any(Date),
            slots: anonymousRequest.body.slots,
            anonymous: true
        });

        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledTimes(1);
        
        const responseCall = mockResponse.json.mock.calls[0][0];
        expect(responseCall.user).toBeDefined();
        expect(responseCall.user.user_id).toBe("Anonymous");
        expect(responseCall.user.fname).toBe("Anonymous");
        expect(responseCall.user.lname).toBe("User");
        expect(responseCall.user.email).toBe("Anonymous");
    });

    it('should successfully create reservation with technician validation', async () => {
        const technicianRequest = {
            body: {
                user_id: '5',
                lab_id: '688832d915bcb1b6b3479930',
                reservation_date: mockCreateReservationData.futureDate,
                slots: [mockCreateReservationData.createSlot(5)],
                anonymous: false,
                technician_id: '1234567890'
            }
        };

        const mockCreatedReservation = mockCreateReservationData.createMockReservation('688832d915bcb1b6b3479997', 5);
        const mockPopulatedReservation = mockCreateReservationData.createMockPopulatedReservation(mockCreatedReservation);

        User.findOne
            .mockResolvedValueOnce(mockStudent)     // student lookup
            .mockResolvedValueOnce(mockTechnician[0]); // technician lookup

        mongoose.model.mockReturnValue(User);
        Lab.findById.mockResolvedValue(mockLabs[0]);
        Reservation.find.mockResolvedValue([]); // No conflicts
        Reservation.create.mockResolvedValue(mockCreatedReservation);
        
        const mockLean = jest.fn().mockResolvedValue(mockPopulatedReservation);
        const mockPopulate = jest.fn().mockReturnValue({ lean: mockLean });
        Reservation.findById.mockReturnValue({ populate: mockPopulate });

        await createReservation(technicianRequest, mockResponse);

        expect(User.findOne).toHaveBeenCalledWith({ user_id: 5 });
        expect(User.findOne).toHaveBeenCalledWith({ user_id: 1234567890 });
        
        expect(Reservation.create).toHaveBeenCalledWith({
            user_id: 5,
            lab_id: '688832d915bcb1b6b3479930',
            reservation_date: expect.any(Date),
            slots: technicianRequest.body.slots,
            anonymous: false
        });

        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledTimes(1);
        
        const responseCall = mockResponse.json.mock.calls[0][0];
        expect(responseCall.user).toBeDefined();
        expect(responseCall.user.user_id).toBe(mockStudent.user_id);
        expect(responseCall.user.fname).toBe(mockStudent.fname);
        expect(responseCall.user.lname).toBe(mockStudent.lname);
        expect(responseCall.user.email).toBe(mockStudent.email);
    });

    it('should return 500 if there is a database error', async () => {
        const originalConsoleError = console.error;
        console.error = jest.fn();

        const errorRequest = {
            body: {
                user_id: '5',
                lab_id: '688832d915bcb1b6b3479930',
                reservation_date: mockCreateReservationData.futureDate,
                slots: [mockCreateReservationData.createSlot(6)],
                anonymous: false
            }
        };

        const dbError = new Error('Database connection failed');
        User.findOne.mockImplementation(() => {
            throw dbError;
        });
        mongoose.model.mockReturnValue(User);

        await createReservation(errorRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Database connection failed' });
        expect(mockResponse.json).toHaveBeenCalledTimes(1);

        console.error = originalConsoleError;
    });

    it('should return 400 for invalid slots format (empty array)', async () => {
        const invalidSlotsRequest = {
            body: {
                user_id: '5',
                lab_id: '688832d915bcb1b6b3479930',
                reservation_date: mockCreateReservationData.futureDate,
                slots: [], // Empty array
                anonymous: false
            }
        };

        await createReservation(invalidSlotsRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Missing required fields or invalid slots format'
        });
    });

    it('should return 400 for invalid slots format (not an array)', async () => {
        const invalidSlotsRequest = {
            body: {
                user_id: '5',
                lab_id: '688832d915bcb1b6b3479930',
                reservation_date: mockCreateReservationData.futureDate,
                slots: "invalid", // Not an array
                anonymous: false
            }
        };

        await createReservation(invalidSlotsRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Missing required fields or invalid slots format'
        });
    });
});
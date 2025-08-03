import { describe, it, expect, jest} from '@jest/globals';
import {
    loginUser,
    deleteUser,
    updateUser,
    upload,
    getAllUsers,
    getUserById,
    registerUser,
    updateUserProfilePicture,
} from "../controllers/userController.js";
import User from "../models/User.js";
import mongoose from 'mongoose';
import multer from 'multer';

// Mock mongoose
jest.mock('mongoose', () => ({
  connection: {
    readyState: 1
  }
}));

// Mock multer
jest.mock('multer', () => {
    return () => ({
        single: () => (req, res, next) => {
            req.file = { path: '/mock/path/to/profile_pic.jpg' }; // Mock file upload
            next();
        }
    });
});

//mock Model
jest.mock('../models/User.js', () => ({
    find: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    save: jest.fn(),
}));

// mock Data
mockUsers = [
    {
        "_id": {
            "$oid": "688832d4e5d691bc40a37fb9"
        },
        "user_id": 1,
        "email": "aaron_barcelita@dlsu.edu.ph",
        "password": "$2b$12$x8IhlU.3RUDAH1A4ZmEyFO7GY/0sVgAvTbITf52qVmaa69YnIr7qy",
        "fname": "Aaron",
        "lname": "Barcelita",
        "mname": "Chucas",
        "role": "Technician",
        "status": "Active",
        "profile_pic_path": "/uploads/profile_pictures/war_cat.jpeg",
        "description": "",
        "createdAt": {
            "$date": "2025-07-29T02:32:52.613Z"
        },
        "updatedAt": {
            "$date": "2025-07-29T02:32:52.613Z"
        },
        "__v": 0
    },
    {
        "_id": {
            "$oid": "688832d6e5d691bc40a37fc7"
        },
        "user_id": 8,
        "email": "haru_urara@dlsu.edu.ph",
        "password": "$2b$12$ZY8Aj.p5wV9iIewj6tkBmuXF3u8CwQxfL1/HMSbT6jKJW0Rob5nd6",
        "fname": "Haru",
        "lname": "Urara",
        "role": "Student",
        "status": "Active",
        "profile_pic_path": "/uploads/profile_pictures/haru_urara_pfp.png",
        "description": "0 wins, 100% heart.",
        "createdAt": {
            "$date": "2025-07-29T02:32:54.770Z"
        },
        "updatedAt": {
            "$date": "2025-07-29T02:32:54.770Z"
        },
        "__v": 0
    },
    {
        "_id": {
            "$oid": "688832d7e5d691bc40a37fc9"
        },
        "user_id": 9,
        "email": "hitori_gotoh@dlsu.edu.ph",
        "password": "$2b$12$GYnlRsNeDfuMrMib0kUy7enentLzlQMwDzs0l3/QmFPV5rpEqbT46",
        "fname": "Hitori",
        "lname": "Gotoh",
        "role": "Student",
        "status": "Active",
        "profile_pic_path": "/uploads/profile_pictures/bocchi_pfp.png",
        "description": "I should really change the way I am...",
        "createdAt": {
            "$date": "2025-07-29T02:32:55.075Z"
        },
        "updatedAt": {
            "$date": "2025-07-29T02:32:55.075Z"
        },
        "__v": 0
    },
];

describe('deleteUser', () => {
    const mockRequest = {
        params: {
            userId: 9
        }
    };
    const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };
    it('should delete a user', async () => {
        User.findOne.mockResolvedValue(mockUsers[2]);
        User.findOneAndUpdate.mockResolvedValue(mockUsers[2]);

        await deleteUser(mockRequest, mockResponse);

        expect(User.findOne).toHaveBeenCalledWith({ user_id: mockRequest.params.userId });
        expect(User.findOneAndUpdate).toHaveBeenCalledWith(
            { user_id: mockRequest.params.userId },
            { status: 'Inactive' },
            { new: true }
        );
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'User marked as inactive successfully',
            user: mockUsers[2]
        });
    });
    it('should return 404 if user not found', async () => {
        User.findOne.mockResolvedValue(null);

        await deleteUser(mockRequest, mockResponse);

        expect(User.findOne).toHaveBeenCalledWith({ user_id: mockRequest.params.userId });
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'User not found'
        });
    });
    it('should return 500 on database error', async () => {
        const originalConsoleError = console.error;
        console.error = jest.fn(); 

        const error = new Error('Database error');
        User.findOne.mockRejectedValue(error);

        await deleteUser(mockRequest, mockResponse);

        expect(User.findOne).toHaveBeenCalledWith({ user_id: mockRequest.params.userId });
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Database error',
        });
        console.error = originalConsoleError;
    });
});

describe('updateUser', () => {
    const mockRequest = {
        params: {
            userId: 9
        },
        body: {
            fname: 'Hitori',
            lname: 'Gotoh',
            mname: 'Kita',
            description: 'I should really change the way I am...',
            status: 'Active'
        }
    };
    const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };

    it('should update a user', async () => {
        const mockUserSave = {
            ...mockUsers[2],  // original values
            save: jest.fn().mockResolvedValue({
                ...mockUsers[2],
                fname: 'Hitori',  // new values
                lname: 'Gotoh',
                mname: 'Kita',
                description: 'I should really change the way I am...',
                status: 'Active'
            })
        };

        User.findOne.mockResolvedValue(mockUserSave);
        
        await updateUser(mockRequest, mockResponse);

        expect(mockUserSave.fname).toBe('Hitori');
        expect(mockUserSave.lname).toBe('Gotoh');
        expect(mockUserSave.mname).toBe('Kita');
        expect(mockUserSave.description).toBe('I should really change the way I am...');
        expect(mockUserSave.status).toBe('Active');
        expect(User.findOne).toHaveBeenCalledWith({ user_id: mockRequest.params.userId });
        expect(mockUserSave.save).toHaveBeenCalled();


        expect(User.findOne).toHaveBeenCalledWith({ user_id: 9 });
        expect(mockUserSave.save).toHaveBeenCalled();
        expect(mockResponse.json).toHaveBeenCalledWith({
            user_id: mockUsers[2].user_id,
            first_name: 'Hitori',
            last_name: 'Gotoh',
            mname: 'Kita',
            email: mockUsers[2].email,
            role: mockUsers[2].role,
            description: 'I should really change the way I am...',
            profile_pic_path: mockUsers[2].profile_pic_path,
            status: 'Active',
            created_at: mockUsers[2].createdAt,
            updated_at: mockUsers[2].updatedAt,
        });
    });
    it('should return 404 if user not found', async () => {
        const notFoundRequest = {
            params: {
                userId: 999  // Non-existent user ID
            },
            body: {
                fname: 'Test',
                lname: 'User',
                mname: 'Middle',
                description: 'Test description',
                status: 'Active'
            }
        };

        User.findOne.mockResolvedValue(null);

        await updateUser(notFoundRequest, mockResponse);

        expect(User.findOne).toHaveBeenCalledWith({ user_id: 999 });
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'User not found'
        });
    });
    it('should handle empty body (no fields to update)', async () => {
        const emptyBodyRequest = {
            params: {
                userId: 9
            },
            body: {} // No fields to update
        };

        const mockUserSave = {
            ...mockUsers[2],
            save: jest.fn().mockResolvedValue(mockUsers[2]) // Returns unchanged user
        };

        User.findOne.mockResolvedValue(mockUserSave);

        await updateUser(emptyBodyRequest, mockResponse);

        expect(User.findOne).toHaveBeenCalledWith({ user_id: 9 });
        expect(mockUserSave.save).toHaveBeenCalled();
        expect(mockResponse.json).toHaveBeenCalledWith({
            user_id: mockUsers[2].user_id,
            first_name: mockUsers[2].fname,
            last_name: mockUsers[2].lname,
            mname: mockUsers[2].mname || '',
            email: mockUsers[2].email,
            role: mockUsers[2].role,
            description: mockUsers[2].description || "",
            profile_pic_path: mockUsers[2].profile_pic_path || null,
            status: mockUsers[2].status || "active",
            created_at: mockUsers[2].createdAt,
            updated_at: mockUsers[2].updatedAt,
        });
    });

    it('should update user with partial data (only some fields provided)', async () => {
        const partialUpdateRequest = {
            params: {
                userId: 9
            },
            body: {
                fname: 'UpdatedFirstName',
                description: 'Updated description only'
                // Note: lname, mname, status not provided
            }
        };

        const mockUserSave = {
            ...mockUsers[2],
            save: jest.fn().mockResolvedValue({
                ...mockUsers[2],
                fname: 'UpdatedFirstName',
                description: 'Updated description only'
            })
        };

        User.findOne.mockResolvedValue(mockUserSave);

        await updateUser(partialUpdateRequest, mockResponse);

        // Verify that only the provided fields were updated
        expect(mockUserSave.fname).toBe('UpdatedFirstName');
        expect(mockUserSave.description).toBe('Updated description only');
        
        expect(User.findOne).toHaveBeenCalledWith({ user_id: 9 });
        expect(mockUserSave.save).toHaveBeenCalled();
        expect(mockResponse.json).toHaveBeenCalledWith({
            user_id: mockUsers[2].user_id,
            first_name: 'UpdatedFirstName',
            last_name: mockUsers[2].lname,
            mname: mockUsers[2].mname || '',
            email: mockUsers[2].email,
            role: mockUsers[2].role,
            description: 'Updated description only',
            profile_pic_path: mockUsers[2].profile_pic_path || null,
            status: mockUsers[2].status || "active",
            created_at: mockUsers[2].createdAt,
            updated_at: mockUsers[2].updatedAt,
        });
    });

    it('should return 500 on database connection error', async () => {
        const originalConsoleError = console.error;
        console.error = jest.fn();

        // Mock mongoose connection readyState to simulate disconnected database
        const originalReadyState = mongoose.connection.readyState;
        mongoose.connection.readyState = 0; // 0 = disconnected

        const connectionError = new Error('Database connection lost');
        User.findOne.mockRejectedValue(connectionError);

        await updateUser(mockRequest, mockResponse);

        expect(User.findOne).toHaveBeenCalledWith({ user_id: 9 });
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Server error',
            error: 'Database connection lost'
        });

        // Restore original values
        mongoose.connection.readyState = originalReadyState;
        console.error = originalConsoleError;
    });
});

describe('upload', () => {
    
});
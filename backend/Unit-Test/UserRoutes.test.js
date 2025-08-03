import { describe, it, expect, jest, beforeEach} from '@jest/globals';
import {
    loginUser,
    deleteUser,
    updateUser,
    getAllUsers,
    getUserById,
    registerUser,
    updateUserProfilePicture,
} from "../controllers/userController.js";
import User from "../models/User.js";
import mongoose from 'mongoose';
import fs from 'fs';

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

// Mock logError utility
jest.mock('../utils/logErrors.js', () => ({
    logError: jest.fn()
}));

// Mock fs module
jest.mock('fs', () => ({
    existsSync: jest.fn(),
    unlinkSync: jest.fn(),
    mkdirSync: jest.fn()
}));



// Clear all mocks before each test
beforeEach(() => {
     mongoose.connection.readyState = 1;
    jest.clearAllMocks();
});

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

        const connectionError = new Error('Database connection lost');
        User.findOne.mockRejectedValue(connectionError);

        await updateUser(mockRequest, mockResponse);

        expect(User.findOne).toHaveBeenCalledWith({ user_id: 9 });
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Database connection lost'
        });

        console.error = originalConsoleError;
    });
});

describe('getAllUsers', () => {
    const mockRequest = {};
    const mockResponse = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
    };

    it('should return all users with transformed data', async () => {
        // Mock the chained methods
        const mockSort = jest.fn().mockResolvedValue(mockUsers);
        const mockSelect = jest.fn().mockReturnValue({ sort: mockSort });
        User.find.mockReturnValue({ select: mockSelect });

        await getAllUsers(mockRequest, mockResponse);

        expect(User.find).toHaveBeenCalledWith({});
        expect(mockSelect).toHaveBeenCalledWith("-password");
        expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });

        // Verify the transformed data structure
        const expectedTransformedUsers = mockUsers.map(user => ({
            user_id: user.user_id,
            first_name: user.fname,
            last_name: user.lname,
            mname: user.mname || '',
            email: user.email,
            role: user.role,
            description: user.description || "",
            profile_pic_path: user.profile_pic_path || null,
            status: user.status || "active",
            created_at: user.createdAt,
            updated_at: user.updatedAt,
        }));

        expect(mockResponse.json).toHaveBeenCalledWith(expectedTransformedUsers);
    });

    it('should return empty array when no users found', async () => {
        // Mock the chained methods for empty result
        const mockSort = jest.fn().mockResolvedValue([]);
        const mockSelect = jest.fn().mockReturnValue({ sort: mockSort });
        User.find.mockReturnValue({ select: mockSelect });

        await getAllUsers(mockRequest, mockResponse);

        expect(User.find).toHaveBeenCalledWith({});
        expect(mockSelect).toHaveBeenCalledWith("-password");
        expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
        expect(mockResponse.json).toHaveBeenCalledWith([]);
    });

    it('should return 500 on database error', async () => {
        const originalConsoleError = console.error;
        console.error = jest.fn();

        const error = new Error('Database error');
        const mockSelect = jest.fn().mockReturnValue({ sort: jest.fn().mockRejectedValue(error) });
        User.find.mockReturnValue({ select: mockSelect });

        await getAllUsers(mockRequest, mockResponse);

        expect(User.find).toHaveBeenCalledWith({});
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Database error' });

        console.error = originalConsoleError;
    });

    it('should return 503 on database connection error', async () => {
        const originalConsoleError = console.error;
        console.error = jest.fn();

        const connectionError = new Error('Database connection is not ready');
        const mockSelect = jest.fn().mockReturnValue({ sort: jest.fn().mockRejectedValue(connectionError) });
        User.find.mockReturnValue({ select: mockSelect });

        await getAllUsers(mockRequest, mockResponse);

        expect(User.find).toHaveBeenCalledWith({});
        expect(mockResponse.status).toHaveBeenCalledWith(503);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Database connection is not ready' });

        console.error = originalConsoleError;
    });
});

describe('getUserById', () => {
    const mockRequest = {
        params: {
            userId: '9'
        }
    };
    const mockResponse = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
    };

    it('should return user by ID with transformed data', async () => {
        // Mock the chained methods
        const mockLean = jest.fn().mockResolvedValue(mockUsers[2]);
        const mockSelect = jest.fn().mockReturnValue({ lean: mockLean });
        User.findOne.mockReturnValue({ select: mockSelect });

        await getUserById(mockRequest, mockResponse);

        expect(User.findOne).toHaveBeenCalledWith({ user_id: 9 });
        expect(mockSelect).toHaveBeenCalledWith("-password");
        expect(mockLean).toHaveBeenCalled();

        // Verify the transformed data structure
        const expectedTransformedUser = {
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
        };

        expect(mockResponse.json).toHaveBeenCalledWith(expectedTransformedUser);
    });

    it('should handle string userId and convert to numeric', async () => {
        const stringUserIdRequest = {
            params: {
                userId: '1'  // String ID
            }
        };

        const mockLean = jest.fn().mockResolvedValue(mockUsers[0]);
        const mockSelect = jest.fn().mockReturnValue({ lean: mockLean });
        User.findOne.mockReturnValue({ select: mockSelect });

        await getUserById(stringUserIdRequest, mockResponse);

        // Should convert string '1' to numeric 1
        expect(User.findOne).toHaveBeenCalledWith({ user_id: 1 });
        expect(mockSelect).toHaveBeenCalledWith("-password");
        expect(mockLean).toHaveBeenCalled();
    });

    it('should return 404 if user not found', async () => {
        const notFoundRequest = {
            params: {
                userId: '999'  // Non-existent user ID
            }
        };

        const mockLean = jest.fn().mockResolvedValue(null);
        const mockSelect = jest.fn().mockReturnValue({ lean: mockLean });
        User.findOne.mockReturnValue({ select: mockSelect });

        await getUserById(notFoundRequest, mockResponse);

        expect(User.findOne).toHaveBeenCalledWith({ user_id: 999 });
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'User not found'
        });
    });

    it('should return 500 on database error', async () => {
        const originalConsoleError = console.error;
        console.error = jest.fn();

        const error = new Error('Database error');
        const mockSelect = jest.fn().mockReturnValue({ lean: jest.fn().mockRejectedValue(error) });
        User.findOne.mockReturnValue({ select: mockSelect });

        await getUserById(mockRequest, mockResponse);

        expect(User.findOne).toHaveBeenCalledWith({ user_id: 9 });
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Database error' });

        console.error = originalConsoleError;
    });
});

describe('updateUserProfilePicture', () => {
    const mockRequest = {
        params: {
            userId: '9'
        },
        file: {
            filename: 'new_profile_pic.jpg',
            originalname: 'profile.jpg',
            path: '/uploads/profile_pictures/new_profile_pic.jpg'
        }
    };
    const mockResponse = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
    };

    it('should update user profile picture successfully', async () => {
        const mockUserSave = {
            ...mockUsers[2],
            profile_pic_path: '/uploads/profile_pictures/old_pic.jpg',
            save: jest.fn().mockResolvedValue({
                ...mockUsers[2],
                profile_pic_path: '/uploads/profile_pictures/new_profile_pic.jpg'
            })
        };

        User.findOne.mockResolvedValue(mockUserSave);
        fs.existsSync.mockReturnValue(true);

        await updateUserProfilePicture(mockRequest, mockResponse);

        expect(User.findOne).toHaveBeenCalledWith({ user_id: 9 });
        expect(mockUserSave.profile_pic_path).toBe('/uploads/profile_pictures/new_profile_pic.jpg');
        expect(mockUserSave.save).toHaveBeenCalled();
        expect(fs.existsSync).toHaveBeenCalled();
        expect(fs.unlinkSync).toHaveBeenCalled();

        // Verify the transformed data structure
        const expectedTransformedUser = {
            user_id: mockUsers[2].user_id,
            first_name: mockUsers[2].fname,
            last_name: mockUsers[2].lname,
            email: mockUsers[2].email,
            role: mockUsers[2].role,
            description: mockUsers[2].description || "",
            profile_pic_path: '/uploads/profile_pictures/new_profile_pic.jpg',
            status: mockUsers[2].status || "active",
            created_at: mockUsers[2].createdAt,
            updated_at: undefined, 
        };

        expect(mockResponse.json).toHaveBeenCalledWith(expectedTransformedUser);
    });

    it('should handle user without existing profile picture', async () => {
        const mockUserSave = {
            ...mockUsers[2],
            profile_pic_path: null, // No existing profile picture
            save: jest.fn().mockResolvedValue({
                ...mockUsers[2],
                profile_pic_path: '/uploads/profile_pictures/new_profile_pic.jpg'
            })
        };

        User.findOne.mockResolvedValue(mockUserSave);

        await updateUserProfilePicture(mockRequest, mockResponse);

        expect(User.findOne).toHaveBeenCalledWith({ user_id: 9 });
        expect(mockUserSave.save).toHaveBeenCalled();
        // Should not try to delete old file since none exists
        expect(fs.existsSync).not.toHaveBeenCalled();
        expect(fs.unlinkSync).not.toHaveBeenCalled();
    });

    it('should return 404 if user not found', async () => {
        User.findOne.mockResolvedValue(null);

        await updateUserProfilePicture(mockRequest, mockResponse);

        expect(User.findOne).toHaveBeenCalledWith({ user_id: 9 });
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'User not found'
        });
    });

    it('should return 400 if no file uploaded', async () => {
        const noFileRequest = {
            params: {
                userId: '9'
            },
            file: null // No file uploaded
        };

        User.findOne.mockResolvedValue(mockUsers[2]);

        await updateUserProfilePicture(noFileRequest, mockResponse);

        expect(User.findOne).toHaveBeenCalledWith({ user_id: 9 });
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'No file uploaded'
        });
    });

    it('should handle old file deletion when file does not exist', async () => {
        const mockUserSave = {
            ...mockUsers[2],
            profile_pic_path: '/uploads/profile_pictures/old_pic.jpg',
            save: jest.fn().mockResolvedValue({
                ...mockUsers[2],
                profile_pic_path: '/uploads/profile_pictures/new_profile_pic.jpg'
            })
        };

        User.findOne.mockResolvedValue(mockUserSave);
        fs.existsSync.mockReturnValue(false); // Old file doesn't exist

        await updateUserProfilePicture(mockRequest, mockResponse);

        expect(fs.existsSync).toHaveBeenCalled();
        expect(fs.unlinkSync).not.toHaveBeenCalled(); // Should not try to delete non-existent file
        expect(mockUserSave.save).toHaveBeenCalled();
    });

    it('should return 500 on database error', async () => {
        const originalConsoleError = console.error;
        console.error = jest.fn();

        const error = new Error('Database error');
        User.findOne.mockRejectedValue(error);

        await updateUserProfilePicture(mockRequest, mockResponse);

        expect(User.findOne).toHaveBeenCalledWith({ user_id: 9 });
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Database error' });

        console.error = originalConsoleError;
    });
});

describe('registerUser', () => {
    const mockRequest = {
        body: {
            email: 'new_user@dlsu.edu.ph',
            password: 'testpassword123',
            fname: 'New',
            lname: 'User',
            mname: 'Middle',
            role: 'Student',
            status: 'Active',
            description: 'A new test user'
        }
    };
    const mockResponse = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
    };

    it('should register a new user successfully', async () => {
        const mockCreatedUser = {
            user_id: 10,
            email: 'new_user@dlsu.edu.ph',
            fname: 'New',
            lname: 'User',
            mname: 'Middle',
            role: 'Student',
            status: 'Active',
            profile_pic_path: '/uploads/profile_pictures/default_profile_picture.jpeg',
            description: '',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Mock User.findOne for checking existing user (should return null)
        User.findOne.mockResolvedValueOnce(null);
        // Mock User.findOne for getting last user (for user_id generation) with sort chaining
        const mockSort = jest.fn().mockResolvedValue({ user_id: 9 });
        User.findOne.mockReturnValueOnce({ sort: mockSort });
        User.create.mockResolvedValue(mockCreatedUser);

        await registerUser(mockRequest, mockResponse);

        expect(User.findOne).toHaveBeenCalledWith({ email: 'new_user@dlsu.edu.ph' });
        expect(User.findOne).toHaveBeenCalledWith();
        expect(mockSort).toHaveBeenCalledWith({ user_id: -1 });
        expect(User.create).toHaveBeenCalledWith({
            user_id: 10,
            email: 'new_user@dlsu.edu.ph',
            password: 'testpassword123',
            fname: 'New',
            lname: 'User',
            mname: 'Middle',
            role: 'Student',
            status: 'Active',
            profile_pic_path: '/uploads/profile_pictures/default_profile_picture.jpeg',
            description: ''
        });

        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith({
            user_id: mockCreatedUser.user_id,
            fname: mockCreatedUser.fname,
            lname: mockCreatedUser.lname,
            email: mockCreatedUser.email,
            role: mockCreatedUser.role,
            profile_pic_path: mockCreatedUser.profile_pic_path,
            status: mockCreatedUser.status,
            description: mockCreatedUser.description
        });
    });

    it('should handle default values when optional fields are missing', async () => {
        const minimalRequest = {
            body: {
                email: 'minimal@dlsu.edu.ph',
                password: 'password123',
                fname: 'Min',
                lname: 'User'
            }
        };

        const mockCreatedUser = {
            user_id: 11,
            email: 'minimal@dlsu.edu.ph',
            fname: 'Min',
            lname: 'User',
            mname: '',
            role: 'Student',
            status: 'Active',
            profile_pic_path: '/uploads/profile_pictures/default_profile_picture.jpeg',
            description: ''
        };

        User.findOne.mockResolvedValueOnce(null);
        const mockSort = jest.fn().mockResolvedValue({ user_id: 10 });
        User.findOne.mockReturnValueOnce({ sort: mockSort });
        User.create.mockResolvedValue(mockCreatedUser);

        await registerUser(minimalRequest, mockResponse);

        expect(User.create).toHaveBeenCalledWith({
            user_id: 11,
            email: 'minimal@dlsu.edu.ph',
            password: 'password123',
            fname: 'Min',
            lname: 'User',
            mname: '',
            role: 'Student',
            status: 'Active',
            profile_pic_path: '/uploads/profile_pictures/default_profile_picture.jpeg',
            description: ''
        });
    });

    it('should handle first user registration (no existing users)', async () => {
        User.findOne.mockResolvedValueOnce(null); // No existing user with email
        const mockSort = jest.fn().mockResolvedValue(null); // No existing users at all (first user)
        User.findOne.mockReturnValueOnce({ sort: mockSort });

        const mockCreatedUser = {
            user_id: 1,
            email: 'first@dlsu.edu.ph',
            fname: 'First',
            lname: 'User'
        };

        User.create.mockResolvedValue(mockCreatedUser);

        const firstUserRequest = {
            body: {
                email: 'first@dlsu.edu.ph',
                password: 'password123',
                fname: 'First',
                lname: 'User'
            }
        };

        await registerUser(firstUserRequest, mockResponse);

        expect(User.create).toHaveBeenCalledWith(expect.objectContaining({
            user_id: 1
        }));
    });

    it('should return 400 if user already exists', async () => {
        User.findOne.mockResolvedValue(mockUsers[0]); // Return existing user

        await registerUser(mockRequest, mockResponse);

        expect(User.findOne).toHaveBeenCalledWith({ email: 'new_user@dlsu.edu.ph' });
        expect(User.create).not.toHaveBeenCalled();
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'User already exists'
        });
    });

    it('should return 500 on database error during user creation', async () => {
        const originalConsoleError = console.error;
        console.error = jest.fn();

        User.findOne.mockResolvedValueOnce(null); // No existing user
        const mockSort = jest.fn().mockResolvedValue({ user_id: 9 }); // Last user for ID generation
        User.findOne.mockReturnValueOnce({ sort: mockSort });

        const error = new Error('Database error');
        User.create.mockRejectedValue(error);

        await registerUser(mockRequest, mockResponse);

        expect(User.findOne).toHaveBeenCalledWith({ email: 'new_user@dlsu.edu.ph' });
        expect(User.create).toHaveBeenCalled();
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Database error'
        });

        console.error = originalConsoleError;
    });


    it('should handle empty profile_pic_path and use default', async () => {
        const requestWithEmptyProfilePic = {
            body: {
                email: 'empty_pic@dlsu.edu.ph',
                password: 'password123',
                fname: 'Empty',
                lname: 'Pic',
                profile_pic_path: '' // Empty string
            }
        };

        const mockCreatedUser = {
            user_id: 12,
            email: 'empty_pic@dlsu.edu.ph',
            fname: 'Empty',
            lname: 'Pic',
            profile_pic_path: '/uploads/profile_pictures/default_profile_picture.jpeg'
        };

        User.findOne.mockResolvedValueOnce(null);
        const mockSort = jest.fn().mockResolvedValue({ user_id: 11 });
        User.findOne.mockReturnValueOnce({ sort: mockSort });
        User.create.mockResolvedValue(mockCreatedUser);

        await registerUser(requestWithEmptyProfilePic, mockResponse);

        expect(User.create).toHaveBeenCalledWith(expect.objectContaining({
            profile_pic_path: '/uploads/profile_pictures/default_profile_picture.jpeg'
        }));
    });
});


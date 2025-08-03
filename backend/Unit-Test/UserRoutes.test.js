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

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
    sign: jest.fn(),
    TokenExpiredError: class TokenExpiredError extends Error {
        constructor(message) {
            super(message);
            this.name = 'TokenExpiredError';
        }
    }
}));

import jwt from 'jsonwebtoken';

// Mock environment variables
const originalEnv = process.env;
beforeEach(() => {
    process.env = {
        ...originalEnv,
        JWT_SECRET: 'test-jwt-secret'
    };
    mongoose.connection.readyState = 1;
    jest.clearAllMocks();
});

// Test data
const mockUsers = [
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
        "comparePassword": jest.fn(),
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
        "comparePassword": jest.fn(),
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
        "status": "Inactive",
        "profile_pic_path": "/uploads/profile_pictures/bocchi_pfp.png",
        "description": "I should really change the way I am...",
        "comparePassword": jest.fn(),
        "createdAt": {
            "$date": "2025-07-29T02:32:55.075Z"
        },
        "updatedAt": {
            "$date": "2025-07-29T02:32:55.075Z"
        },
        "__v": 0
    },
];

describe('loginUser', () => {
    const mockRequest = {
        body: {
            email: 'aaron_barcelita@dlsu.edu.ph',
            password: 'password123',
            rememberMe: false
        }
    };
    const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    };
    

    it('should login user successfully without rememberMe', async () => {
        const mockUser = { ...mockUsers[0] };
        mockUser.comparePassword.mockResolvedValue(true);
        
        User.findOne.mockResolvedValue(mockUser);
        jwt.sign.mockReturnValue('mock-jwt-token');

        await loginUser(mockRequest, mockResponse);

        expect(User.findOne).toHaveBeenCalledWith({ email: 'aaron_barcelita@dlsu.edu.ph' });
        expect(mockUser.comparePassword).toHaveBeenCalledWith('password123');
        expect(jwt.sign).toHaveBeenCalledWith(
            { user_id: 1, role: 'Technician' },
            'test-jwt-secret',
            { expiresIn: '1d' }
        );
        expect(mockResponse.json).toHaveBeenCalledWith({
            user_id: 1,
            fname: 'Aaron',
            lname: 'Barcelita',
            email: 'aaron_barcelita@dlsu.edu.ph',
            role: 'Technician',
            token: 'mock-jwt-token'
        });
    });

    it('should login user successfully with rememberMe', async () => {
        const mockUser = { ...mockUsers[1] };
        mockUser.comparePassword.mockResolvedValue(true);
        
        User.findOne.mockResolvedValue(mockUser);
        jwt.sign.mockReturnValue('mock-jwt-token-long');

        const withRememberMeRequest = {
            ...mockRequest,
            body: {
                ...mockRequest.body,
                email: 'haru_urara@dlsu.edu.ph',
                password: 'admin123',
                rememberMe: true
            }
        };

        await loginUser(withRememberMeRequest, mockResponse);

        expect(User.findOne).toHaveBeenCalledWith({ email: 'haru_urara@dlsu.edu.ph' });
        expect(mockUser.comparePassword).toHaveBeenCalledWith('admin123');
        expect(jwt.sign).toHaveBeenCalledWith(
            { user_id: 8, role: 'Student' },
            'test-jwt-secret',
            { expiresIn: '21d' }
        );
        expect(mockResponse.json).toHaveBeenCalledWith({
            user_id: 8,
            fname: 'Haru',
            lname: 'Urara',
            email: 'haru_urara@dlsu.edu.ph',
            role: 'Student',
            token: 'mock-jwt-token-long'
        });
    });

    it('should return 401 when user is not found', async () => {
        const notFoundRequest = {
            body: {
                email: 'nonexistent@gmail.com',
                password: 'password123'
            }
        };

        User.findOne.mockResolvedValue(null);

        await loginUser(notFoundRequest, mockResponse);

        expect(User.findOne).toHaveBeenCalledWith({ email: 'nonexistent@gmail.com' });
        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Invalid email or password' });
    });

    it('should return 401 when password is incorrect', async () => {
        const incorrectPasswordRequest = {
            body: {
                email: 'aaron_barcelita@dlsu.edu.ph',
                password: 'wrongpassword'
            }
        };

        const mockUser = { ...mockUsers[0] };
        mockUser.comparePassword.mockResolvedValue(false);
        
        User.findOne.mockResolvedValue(mockUser);

        await loginUser(incorrectPasswordRequest, mockResponse);

        expect(User.findOne).toHaveBeenCalledWith({ email: 'aaron_barcelita@dlsu.edu.ph' });
        expect(mockUser.comparePassword).toHaveBeenCalledWith('wrongpassword');
        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Invalid email or password.' });
    });

    it('should return 403 when user is inactive', async () => {
        const inactiveUserRequest = {
            body: {
                email: 'hitori_gotoh@dlsu.edu.ph',
                password: 'tech123'
            }
        };

        const mockUser = { ...mockUsers[2] }; // inactive user
        
        User.findOne.mockResolvedValue(mockUser);

        await loginUser(inactiveUserRequest, mockResponse);

        expect(User.findOne).toHaveBeenCalledWith({ email: 'hitori_gotoh@dlsu.edu.ph' });
        // Should not call comparePassword for inactive user
        expect(mockUser.comparePassword).not.toHaveBeenCalled();
        expect(mockResponse.status).toHaveBeenCalledWith(403);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Your account is inactive. Contact the administrator for help.' });
    });

    it('should return 500 when JWT signing fails', async () => {
        const jwtFailRequest = {
            body: {
                email: 'aaron_barcelita@dlsu.edu.ph',
                password: 'password123'
            }
        };

        const mockUser = { ...mockUsers[0] };
        mockUser.comparePassword.mockResolvedValue(true);
        
        User.findOne.mockResolvedValue(mockUser);
        jwt.sign.mockImplementation(() => {
            throw new Error('JWT signing failed');
        });

        await loginUser(jwtFailRequest, mockResponse);

        expect(User.findOne).toHaveBeenCalledWith({ email: 'aaron_barcelita@dlsu.edu.ph' });
        expect(mockUser.comparePassword).toHaveBeenCalledWith('password123');
        expect(jwt.sign).toHaveBeenCalledWith(
            { user_id: 1, role: 'Technician' },
            'test-jwt-secret',
            { expiresIn: '1d' }
        );
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'JWT signing failed' });
    });

    it('should use correct expiry time when rememberMe is undefined', async () => {
        const undefinedRememberMeRequest = {
            body: {
                email: 'aaron_barcelita@dlsu.edu.ph',
                password: 'password123'
                // rememberMe is undefined
            }
        };

        const mockUser = { ...mockUsers[0] };
        mockUser.comparePassword.mockResolvedValue(true);
        
        User.findOne.mockResolvedValue(mockUser);
        jwt.sign.mockReturnValue('mock-jwt-token');

        await loginUser(undefinedRememberMeRequest, mockResponse);

        expect(jwt.sign).toHaveBeenCalledWith(
            { user_id: 1, role: 'Technician' },
            'test-jwt-secret',
            { expiresIn: '1d' }
        );
    });

    it('should return 503 when database connection error occurs', async () => {
        const connectionErrorRequest = {
            body: {
                email: 'aaron_barcelita@dlsu.edu.ph',
                password: 'password123'
            }
        };

        const error = new Error('Database connection is not ready');
        User.findOne.mockRejectedValue(error);

        await loginUser(connectionErrorRequest, mockResponse);

        expect(User.findOne).toHaveBeenCalledWith({ email: 'aaron_barcelita@dlsu.edu.ph' });
        expect(mockResponse.status).toHaveBeenCalledWith(503);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Database connection is not ready' });
    });

    it('should return 500 when User.findOne throws an error', async () => {
        const findOneErrorRequest = {
            body: {
                email: 'aaron_barcelita@dlsu.edu.ph',
                password: 'password123'
            }
        };

        User.findOne.mockRejectedValue(new Error('Database query failed'));

        await loginUser(findOneErrorRequest, mockResponse);

        expect(User.findOne).toHaveBeenCalledWith({ email: 'aaron_barcelita@dlsu.edu.ph' });
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Database query failed' });
    });

    it('should return 500 when comparePassword throws an error', async () => {
        const comparePasswordErrorRequest = {
            body: {
                email: 'aaron_barcelita@dlsu.edu.ph',
                password: 'password123'
            }
        };

        const mockUser = { ...mockUsers[0] };
        mockUser.comparePassword.mockRejectedValue(new Error('Password comparison failed'));
        
        User.findOne.mockResolvedValue(mockUser);

        await loginUser(comparePasswordErrorRequest, mockResponse);

        expect(User.findOne).toHaveBeenCalledWith({ email: 'aaron_barcelita@dlsu.edu.ph' });
        expect(mockUser.comparePassword).toHaveBeenCalledWith('password123');
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Password comparison failed' });
    });

    it('should return 500 when JWT_SECRET is missing', async () => {
        const jwtSecretMissingRequest = {
            body: {
                email: 'aaron_barcelita@dlsu.edu.ph',
                password: 'password123'
            }
        };

        delete process.env.JWT_SECRET;
        
        const mockUser = { ...mockUsers[0] };
        mockUser.comparePassword.mockResolvedValue(true);
        
        User.findOne.mockResolvedValue(mockUser);
        jwt.sign.mockImplementation(() => {
            throw new Error('secret or public key must be provided');
        });

        await loginUser(jwtSecretMissingRequest, mockResponse);

        expect(User.findOne).toHaveBeenCalledWith({ email: 'aaron_barcelita@dlsu.edu.ph' });
        expect(mockUser.comparePassword).toHaveBeenCalledWith('password123');
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'secret or public key must be provided' });
    });
});

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
        const mockSort = jest.fn().mockResolvedValue(mockUsers);
        const mockSelect = jest.fn().mockReturnValue({ sort: mockSort });
        User.find.mockReturnValue({ select: mockSelect });

        await getAllUsers(mockRequest, mockResponse);

        expect(User.find).toHaveBeenCalledWith({});
        expect(mockSelect).toHaveBeenCalledWith("-password");
        expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });

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
        const mockLean = jest.fn().mockResolvedValue(mockUsers[2]);
        const mockSelect = jest.fn().mockReturnValue({ lean: mockLean });
        User.findOne.mockReturnValue({ select: mockSelect });

        await getUserById(mockRequest, mockResponse);

        expect(User.findOne).toHaveBeenCalledWith({ user_id: 9 });
        expect(mockSelect).toHaveBeenCalledWith("-password");
        expect(mockLean).toHaveBeenCalled();

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

        //check if converted
        expect(User.findOne).toHaveBeenCalledWith({ user_id: 1 });
        expect(mockSelect).toHaveBeenCalledWith("-password");
        expect(mockLean).toHaveBeenCalled();
    });

    it('should return 404 if user not found', async () => {
        const notFoundRequest = {
            params: {
                userId: '999'  
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

        
        User.findOne.mockResolvedValueOnce(null); //email check
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
        User.findOne.mockResolvedValueOnce(null); 
        const mockSort = jest.fn().mockResolvedValue(null); 
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

        User.findOne.mockResolvedValueOnce(null);
        const mockSort = jest.fn().mockResolvedValue({ user_id: 9 }); 
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

        User.findOne.mockResolvedValueOnce(null); // email 
        const mockSort = jest.fn().mockResolvedValue({ user_id: 11 });
        User.findOne.mockReturnValueOnce({ sort: mockSort });
        User.create.mockResolvedValue(mockCreatedUser);

        await registerUser(requestWithEmptyProfilePic, mockResponse);

        expect(User.create).toHaveBeenCalledWith(expect.objectContaining({
            profile_pic_path: '/uploads/profile_pictures/default_profile_picture.jpeg'
        }));
    });
});


import { describe, expect, it, jest, beforeEach, afterEach } from '@jest/globals';
import jwt from 'jsonwebtoken';
import { authMiddleware } from '../middleware/auth.js';
import User from '../models/User.js';

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn()
}));

jest.mock('../models/User.js', () => ({
  findById: jest.fn(),
}));
const mockUser = {
  _id: '507f1f77bcf86cd799439011',
  user_id: 'user123',
  role: 'student',
  email: 'test@example.com'
};

const mockDecodedToken = {
  user_id: 'user123',
  role: 'student',
  iat: Math.floor(Date.now() / 1000), // Issued at time
  exp: Math.floor(Date.now() / 1000) + 3600 // Expiration time
};

const validToken = 'valid.jwt.token';
const invalidToken = 'invalid.jwt.token';

beforeEach(() => {
  jest.clearAllMocks();
  process.env.JWT_SECRET = 'test-secret';
});

describe('authMiddleware.verifyToken', () => {
  let mockRequest, mockResponse, mockNext;

  beforeEach(() => {
    mockRequest = {
      headers: {}
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
  });

  it('should verify valid token and set user in request', async () => {
    mockRequest.headers.authorization = `Bearer ${validToken}`;
    jwt.verify.mockReturnValue(mockDecodedToken);

    await authMiddleware.verifyToken(mockRequest, mockResponse, mockNext);

    expect(jwt.verify).toHaveBeenCalledWith(validToken, process.env.JWT_SECRET);
    expect(mockRequest.user).toEqual(mockDecodedToken);
    expect(mockNext).toHaveBeenCalled();
  });

  it('should return 401 if no token is provided', async () => {
    await authMiddleware.verifyToken(mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'No token provided' });
  });

  it('should return 403 if token is invalid', async () => {
    mockRequest.headers.authorization = `Bearer ${invalidToken}`;
    jwt.verify.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    await authMiddleware.verifyToken(mockRequest, mockResponse, mockNext);

    expect(jwt.verify).toHaveBeenCalledWith(invalidToken, process.env.JWT_SECRET);
    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Invalid or expired token' });
  });

  it('should return 403 if token is expired', async () => {
    mockRequest.headers.authorization = `Bearer ${validToken}`;
    jwt.verify.mockImplementation(() => {
      const error = new Error('Token expired');
      error.name = 'TokenExpiredError';
      throw error;
    });

    await authMiddleware.verifyToken(mockRequest, mockResponse, mockNext);

    expect(jwt.verify).toHaveBeenCalledWith(validToken, process.env.JWT_SECRET);
    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Invalid or expired token' });
  });

  it('should handle missing JWT_SECRET environment variable', async () => {
    delete process.env.JWT_SECRET;
    mockRequest.headers.authorization = `Bearer ${validToken}`;
    jwt.verify.mockImplementation(() => {
      throw new Error('secret or public key must be provided');
    });

    await authMiddleware.verifyToken(mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Invalid or expired token' });
  });
});

describe('authMiddleware.requireRole', () => {
  let mockRequest, mockResponse, mockNext;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
  });

  it('should allow access for user with correct role', () => {
    mockRequest.user = { user_id: 'user123', role: 'admin' };

    authMiddleware.requireRole(['admin', 'student'])(mockRequest, mockResponse, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  it('should allow access for user with any of the allowed roles', () => {
    mockRequest.user = { user_id: 'user123', role: 'student' };

    authMiddleware.requireRole(['admin', 'student', 'technician'])(mockRequest, mockResponse, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  it('should return 401 if user is not authenticated', () => {
    authMiddleware.requireRole(['admin'])(mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Authentication required' });
  });

  it('should return 403 if user role is not allowed', () => {
    mockRequest.user = { user_id: 'user123', role: 'student' };

    authMiddleware.requireRole(['admin', 'technician'])(mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({ 
      message: 'You do not have permission to access this resource' 
    });
  });

  it('should work with single role in array', () => {
    mockRequest.user = { user_id: 'user123', role: 'admin' };

    authMiddleware.requireRole(['admin'])(mockRequest, mockResponse, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  it('should be case sensitive for roles', () => {
    mockRequest.user = { user_id: 'user123', role: 'Admin' };

    authMiddleware.requireRole(['admin'])(mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({ 
      message: 'You do not have permission to access this resource' 
    });
  });

  it('should handle empty allowed roles array', () => {
    mockRequest.user = { user_id: 'user123', role: 'admin' };

    authMiddleware.requireRole([])(mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({ 
      message: 'You do not have permission to access this resource' 
    });
  });
});

describe('authMiddleware integration', () => {
  let mockRequest, mockResponse, mockNext;

  beforeEach(() => {
    mockRequest = {
      headers: {}
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
  });

  it('should work when verifyToken and requireRole are used together', async () => {
    mockRequest.headers.authorization = `Bearer ${validToken}`;
    jwt.verify.mockReturnValue({ user_id: 'user123', role: 'admin' });

    await authMiddleware.verifyToken(mockRequest, mockResponse, mockNext);
    await authMiddleware.requireRole(mockRequest, mockResponse, mockNext);
    

    expect(mockNext).toHaveBeenCalled();
  });

  it('should fail if verifyToken succeeds but requireRole fails', async () => {
    mockRequest.headers.authorization = `Bearer ${validToken}`;
    jwt.verify.mockReturnValue({ user_id: 'user123', role: 'student' });
    
    const roleMiddleware = authMiddleware.requireRole(['admin']);

    await authMiddleware.verifyToken(mockRequest, mockResponse, mockNext);

    roleMiddleware(mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({ 
      message: 'You do not have permission to access this resource' 
    });
  });
});

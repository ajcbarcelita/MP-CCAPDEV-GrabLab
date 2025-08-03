import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authMiddleware = {
    // Verify first the JWT token
    verifyToken: async (req, res, next) => {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded; // Contains { user_id, role }
            next();
        } catch (error) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
    },

    // Next, check user's role
    requireRole: (allowedRoles) => {
        return (req, res, next) => {
            if (!req.user) {
                return res.status(401).json({ message: 'Authentication required' });
            }

            if (!allowedRoles.includes(req.user.role)) {
                return res.status(403).json({ 
                    message: 'You do not have permission to access this resource' 
                });
            }

            next();
        };
    }
};
import express from 'express';
import { 
     
    loginUser, 
    searchUser, 
     
    deleteUser, 
    updateUser, 
    upload,
    getAllUsers,
    getUserById,
    createUser,
    updateUserProfilePicture
} from '../controllers/userController.js';

const router = express.Router();

// Public routes
router.post('/register', createUser);
router.post('/login', loginUser);


// User CRUD operations
router.route('/')
  .get(getAllUsers)         // GET /api/users
  .post(createUser);        // POST /api/users

router.route('/:userId')
  .get(getUserById)         // GET /api/users/:userId
  .put(updateUser)          // PUT /api/users/:userId
  .delete(deleteUser);      // DELETE /api/users/:userId

// Profile picture upload
router.post('/:userId/profile-picture', upload.single('profilePicture'), updateUserProfilePicture);

export default router;
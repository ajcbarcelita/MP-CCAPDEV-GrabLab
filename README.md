# MP-CCAPDEV-GrabLab

A comprehensive web application for reserving seats in university computer laboratories, developed as a group major course output for Web Application Development (CCAPDEV) at De La Salle University - Manila.

## Features

### Core Functionality

- **User Authentication & Authorization:** Secure registration and login with role-based access control (Student, Technician, Admin)
  - Persistent sessions with "Remember Me" functionality
  - Automatic login across browser sessions
- **Lab Reservation System:** Real-time seat booking with conflict detection and session-based concurrency control
- **Profile Management:** User profiles with customizable pictures, descriptions, and personal information
- **Anonymous Reservations:** Option to make reservations anonymously for privacy
- **Real-time Availability:** Live updates of lab seat availability with visual calendar interface

### Role-Based Access Control

- **Students:** Can view labs, make reservations, manage their bookings, and edit profiles
- **Technicians:** Can manage reservations for students, view user profiles, and access technician-specific dashboard
- **Admins:** Full system access including technician management and administrative functions

### Advanced Features

- **Session-Based Concurrency Control:** Prevents race conditions during reservation operations
- **Error Logging & Monitoring:** Comprehensive error tracking and logging system
- **File Upload System:** Profile picture management with secure file handling
- **Responsive Design:** Modern UI built with Tailwind CSS and Vue.js
- **Database Indexing:** Optimized queries for better performance

## 🏗️ Architecture

### Backend (Node.js + Express + MongoDB)

```
backend/
├── app.js                    # Express application setup and middleware
├── babel.config.json         # Babel configuration for modern JavaScript
├── jest.config.mjs          # Jest testing configuration
├── test-sessions.js         # Session testing utilities
├── controllers/             # Request handlers and business logic
│   ├── userController.js    # User authentication and management
│   ├── labController.js     # Lab CRUD operations
│   ├── reservationController.js # Reservation management
│   └── labSlotController.js # Lab slot operations
├── middleware/
│   └── auth.js             # Authentication middleware
├── models/                  # MongoDB schema definitions
│   ├── ErrorLog.js         # Error logging model
│   ├── Lab.js             # Lab model with validation
│   ├── LabSlot.js         # Lab slot model
│   ├── Reservation.js     # Reservation model with indexes
│   └── User.js           # User model with password hashing
├── routes/                 # API route definitions
│   ├── labRoutes.js       # Lab-related endpoints
│   ├── labSlotRoutes.js   # Lab slot endpoints
│   ├── reservationRoutes.js # Reservation endpoints
│   └── userRoutes.js      # User/auth endpoints
├── seeds/                  # Database seeding scripts
│   ├── clearLogs.js       # Clear error logs
│   ├── labs.js            # Lab seed data
│   ├── seedLabs.js        # Lab seeding script
│   ├── seedLabSlots.js    # Lab slot seeding
│   ├── seedReservations.js # Reservation seeding
│   ├── seedUsers.js       # User seeding
│   └── users.js           # User seed data
├── services/
│   └── reservationService.js # Business logic for reservations
├── Unit-Test/             # Comprehensive test suite
│   ├── LabRoutes.test.js  # Lab endpoint tests
│   ├── LabSlotRoutes.test.js # Lab slot tests
│   ├── ReservationRoutes.test.js # Reservation tests
│   └── UserRoutes.test.js # User/auth tests
├── uploads/               # File upload directory
│   └── profile_pictures/  # User profile pictures
└── utils/                # Utility functions
    ├── logErrors.js      # Error logging utilities
    └── reservationUtils.js # Reservation helpers
```

### Frontend (Vue.js + Vite + Tailwind CSS)

```
frontend/
├── eslint.config.js        # ESLint configuration
├── index.html              # HTML entry point
├── jsconfig.json          # JavaScript configuration
├── package.json           # Project dependencies
├── postcss.config.js      # PostCSS configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── vite.config.js         # Vite bundler configuration
├── public/                # Static files
│   └── favicon.ico        # Site favicon
└── src/                   # Source code
    ├── App.vue            # Root component
    ├── main.js           # Application entry point
    ├── router.js         # Vue Router configuration
    ├── assets/           # Static resources and styles
    │   ├── admin_manage_tech.css
    │   ├── Calendar.png
    │   ├── Clock.png
    │   ├── gokongwei_hall.png
    │   ├── lab.png
    │   ├── landing_page.css
    │   ├── login_styles.css
    │   ├── main.css
    │   ├── multiuser.png
    │   ├── profile_styles.css
    │   ├── register_styles.css
    │   ├── reservations.css
    │   ├── right_arrow.png
    │   ├── search.png
    │   └── User-check.png
    ├── components/        # Vue components
    │   ├── AdminLanding.vue
    │   ├── AdminManageTechnicians.vue
    │   ├── GuestLanding.vue
    │   ├── Login.vue
    │   ├── Profile_Page.vue
    │   ├── Register.vue
    │   ├── Reservation.vue
    │   ├── StudentLanding.vue
    │   ├── TechLanding.vue
    │   ├── View.vue
    │   └── reservation/   # Reservation components
    │       ├── ReservationCalendar.vue
    │       ├── ReservationControls.vue
    │       ├── ReservationModals.vue
    │       └── ReservationPage.vue
    ├── composables/      # Reusable Vue composition functions
    │   ├── useAuthentication.js
    │   ├── useLandingPage.js
    │   ├── useProfilePage.js
    │   └── useValidation.js
    ├── data/            # Static data files
    │   ├── labs.js
    │   ├── reservations.js
    │   └── users.js
    └── stores/          # Pinia state management
        ├── labs_store.js
        ├── labSlots_store.js
        ├── reservations_store.js
        └── users_store.js
```

## Technology Stack

### Backend

- **Runtime:** Node.js with ES modules
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** 
  - JWT with bcrypt password hashing
  - Persistent sessions using localStorage/sessionStorage
  - Auto-login capability with token management
- **File Upload:** Multer for profile picture handling
- **Testing:** Jest with comprehensive test suite
- **Error Handling:** Custom error logging system

### Frontend

- **Framework:** Vue.js 3 with Composition API
- **Build Tool:** Vite for fast development and building
- **State Management:** Pinia for reactive state management
- **Routing:** Vue Router with navigation guards
- **Styling:** Tailwind CSS for responsive design
- **HTTP Client:** Axios for API communication

### Development Tools

- **Linting:** ESLint with Vue.js rules
- **Formatting:** Prettier for code formatting
- **Testing:** Jest for backend unit tests
- **Database:** MongoDB with Mongoose schemas

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) (v16 or later)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [MongoDB](https://www.mongodb.com/try/download/community) (running locally or cloud instance)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/MP-CCAPDEV-GrabLab.git
cd MP-CCAPDEV-GrabLab
```

### 2. Backend Setup

```bash
cd backend
npm install
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

### 4. Environment Configuration

Create a `.env` file in the `backend` directory:

```env
# MongoDB Connection URI
MONGODB_URI=mongodb://localhost:27017/grabLab

# JSON Web Token Secret (generate a secure random string)
JWT_SECRET=your_secure_jwt_secret_key_here

# Server Port
PORT=3000
```

### 5. Database Seeding (Optional)

Populate the database with sample data:

```bash
cd backend
npm run seed:all
```

Available seed scripts:

- `npm run seed:users` - Create sample users
- `npm run seed:labs` - Create sample labs
- `npm run seed:labslots` - Create sample lab slots
- `npm run seed:reservations` - Create sample reservations
- `npm run seed:all` - Run all seed scripts

### 6. Running the Application

#### Start Backend Server

```bash
cd backend
npm start
```

The backend server will run on `http://localhost:3000`

#### Start Frontend Development Server

```bash
cd frontend
npm run dev
```

The frontend application will be available at `http://localhost:5173`

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm test
```

The test suite includes comprehensive coverage for:

- User authentication and management
- Lab operations
- Reservation system with session control
- Lab slot management

### Frontend Development

```bash
cd frontend
npm run lint    # Run ESLint
npm run format  # Format code with Prettier
```

## 🔧 Development Scripts

### Backend Scripts

```bash
npm start                    # Start the server
npm test                     # Run Jest tests
npm run seed:all            # Seed all data
npm run clear:logs          # Clear error logs
```

### Frontend Scripts

```bash
npm run dev                 # Start development server
npm run build               # Build for production
npm run preview             # Preview production build
npm run lint                # Run ESLint
npm run format              # Format code
```

## 🏛️ MVC Architecture

The project follows the Model-View-Controller (MVC) architectural pattern:

### Model Layer

- **MongoDB Schemas:** Define data structure and validation rules
- **Business Logic:** Encapsulated in services and utility functions
- **Data Access:** Mongoose ODM for database operations

### View Layer

- **Vue Components:** Reusable UI components with responsive design
- **State Management:** Pinia stores for reactive state
- **Routing:** Vue Router for navigation and route protection

### Controller Layer

- **Express Routes:** API endpoint definitions
- **Request Handlers:** Business logic and data processing
- **Middleware:** Authentication, validation, and error handling

## 🔐 Security Features

- **Password Hashing:** bcrypt with salt rounds for secure password storage
- **JWT Authentication:** 
  - Secure token-based authentication
  - Token storage in localStorage/sessionStorage based on "Remember Me" preference
  - Automatic token refresh and validation
- **Role-Based Access Control:** Granular permissions for different user types
- **Input Validation:** Comprehensive validation on both frontend and backend
- **Session Management:** MongoDB sessions for transaction safety
- **Error Logging:** Secure error tracking without exposing sensitive data

## 📊 Database Schema

### User Model

- `user_id`: Unique numeric identifier
- `email`: DLSU email validation
- `password`: Hashed with bcrypt
- `fname/lname/mname`: Name fields
- `role`: Student/Technician/Admin
- `status`: Active/Inactive
- `profile_pic_path`: Profile picture path
- `description`: User bio

### Lab Model

- `name`: Lab identifier (e.g., GK302)
- `building`: Building name
- `display_name`: Full display name
- `operating_hours`: Open/close times
- `capacity`: Number of seats
- `status`: Active/Inactive

### Reservation Model

- `user_id`: User making reservation
- `lab_id`: Lab being reserved
- `reservation_date`: Date of reservation
- `slots`: Array of seat/time slots
- `anonymous`: Privacy option
- `status`: Active/Cancelled/Completed

## 🚀 Performance Optimizations

- **Database Indexing:** Optimized queries for reservation conflicts
- **Session-Based Operations:** Prevents race conditions
- **Efficient Queries:** Batch operations for user data
- **Frontend Optimization:** Vue.js reactivity and component caching
- **Error Handling:** Comprehensive logging without performance impact

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is developed for educational purposes at De La Salle University - Manila.

## 👥 Team

This project was developed as a group major course output for Web Application Development (CCAPDEV).

---

**GrabLab** - Streamlining laboratory reservations with modern web technology.

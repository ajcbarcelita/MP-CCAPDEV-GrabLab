# MP-CCAPDEV-GrabLab

A group major course output for Web Application Development (CCAPDEV) at De La Salle University - Manila. This project is a web application for reserving seats in university computer laboratories.

## Features

-   **User Authentication:** Secure registration and login for students and technicians.
-   **Lab Reservation System:** View lab schedules, reserve seats, and manage bookings.
-   **Role-Based Access Control:** Distinct interfaces and permissions for students and technicians.
-   **User Profiles:** View and edit user information, including profile pictures and descriptions.
-   **Technician Dashboard:** Tools for technicians to manage reservations and view user profiles.

## Project Structure

```
/
├── backend/        # Node.js, Express, MongoDB
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── app.js
└── frontend/       # Vue.js, Vite, Tailwind CSS
    ├── src/
    │   ├── components/
    │   ├── stores/
    │   ├── assets/
    │   └── main.js
```

---

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v14 or later)
-   [npm](https://www.npmjs.com/)
-   [MongoDB](https://www.mongodb.com/try/download/community) (running locally or a cloud instance)

### Setup and Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/MP-CCAPDEV-GrabLab.git
    cd MP-CCAPDEV-GrabLab
    ```

2.  **Install Backend Dependencies:**
    ```bash
    cd backend
    npm install
    ```

3.  **Install Frontend Dependencies:**
    ```bash
    cd ../frontend
    npm install
    ```

### Configuration

1.  **Create a `.env` file** in the `backend` directory.
2.  **Add the following environment variables** to the `.env` file:

    ```env
    # MongoDB Connection URI
    MONGODB_URI=your_mongodb_connection_string

    # JSON Web Token Secret
    JWT_SECRET=your_jwt_secret_key

    # Server Port
    PORT=3000
    ```
    *Replace `your_mongodb_connection_string` with your actual MongoDB URI.*
    *Replace `your_jwt_secret_key` with a long, random, and secret string.*

### Database Seeding (Optional)

The project includes seed scripts to populate the database with initial sample data.

1.  **Navigate to the `backend` directory.**
2.  **Run the seed scripts:**
    ```bash
    node seeds/seedUsers.js
    node seeds/seedLabs.js
    node seeds/seedLabSlots.js
    ```

### Running the Application

1.  **Start the Backend Server:**
    -   Navigate to the `backend` directory.
    -   Run the following command:
    ```bash
    npm start
    ```
    The backend server will start on `http://localhost:3000`.

2.  **Start the Frontend Development Server:**
    -   Open a new terminal.
    -   Navigate to the `frontend` directory.
    -   Run the following command:
    ```bash
    npm run dev
    ```
    The frontend application will be available at `http://localhost:5173`.

You can now access the GrabLab application in your web browser.
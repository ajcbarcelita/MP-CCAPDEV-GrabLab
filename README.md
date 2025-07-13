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
├── backend/                  # Node.js, Express, MongoDB backend
│   ├── controllers/          # Request handlers and business logic
│   ├── models/               # MongoDB schema definitions
│   ├── routes/               # API route definitions
│   ├── seeds/                # Database seed scripts
│   ├── uploads/              # File uploads (e.g., profile pictures)
│   ├── app.js                # Express application setup
│   └── package.json          # Backend dependencies and scripts
└── frontend/                 # Vue.js, Vite, Tailwind CSS frontend
    ├── public/               # Static files
    ├── src/
    │   ├── assets/           # Images, fonts, and other static resources
    │   ├── components/       # Reusable Vue components
    │   ├── composables/      # Reusable Vue composition functions
    │   ├── data/             # Static data files
    │   ├── stores/           # Pinia/Vuex state management
    │   ├── App.vue           # Root component
    │   ├── main.js           # Application entry point
    │   └── router.js         # Vue Router configuration
    ├── index.html            # HTML entry point
    ├── tailwind.config.js    # Tailwind CSS configuration
    ├── vite.config.js        # Vite bundler configuration
    └── package.json          # Frontend dependencies and scripts
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

### How to Run the Program

To run the GrabLab application, follow these steps:

1. **Connect to the MongoDB Server:**
   - Ensure that your MongoDB server is running locally or accessible via a cloud instance.
   - Update the `MONGODB_URI` in the `.env` file located in the `backend` directory with the correct connection string.

2. **Start the Backend Server:**
   - Navigate to the `backend` directory:
     ```bash
     cd backend
     ```
   - Install the required dependencies:
     ```bash
     npm install
     ```
   - Start the server:
     ```bash
     npm start
     ```
   - The backend server will run on `http://localhost:3000`.

3. **Start the Frontend Development Server:**
   - Open a new terminal window.
   - Navigate to the `frontend` directory:
     ```bash
     cd frontend
     ```
   - Install the required dependencies:
     ```bash
     npm install
     ```
   - Start the development server:
     ```bash
     npm run dev
     ```
   - The frontend application will be available at `http://localhost:5173`.

4. **Access the Application:**
   - Open your web browser and navigate to `http://localhost:5173` to access the GrabLab application.

5. **Optional - Seed the Database:**
   - If you want to populate the database with sample data, run the seed scripts:
     ```bash
     node seeds/seedUsers.js
     node seeds/seedLabs.js
     node seeds/seedLabSlots.js
     ```
   - These scripts are located in the `backend/seeds/` directory and will add sample users, labs, and lab slots to your database.

### MVC Architecture

The project follows the Model-View-Controller (MVC) architectural pattern, which separates the application logic into three interconnected components:

1. **Model**
   - Represents the data and business logic of the application.
   - In this project, the `backend/models/` directory contains the MongoDB schema definitions for entities such as `Lab`, `LabSlot`, `Reservation`, and `User`.
   - Example: The `Lab.js` model defines the structure of a laboratory document in the database, including fields like `name`, `location`, and `capacity`.

2. **View**
   - Handles the presentation layer and user interface.
   - In this project, the `frontend/src/components/` directory contains reusable Vue components that render the UI.
   - Example: The `StudentLanding.vue` component displays the landing page for students, showing available labs and reservation options.

3. **Controller**
   - Manages the flow of data between the Model and the View.
   - In this project, the `backend/controllers/` directory contains request handlers that process incoming API requests and interact with the models.
   - Example: The `labController.js` file includes functions to fetch lab data from the database and send it as a response to the frontend.

4. **Stores**
   - Manage the application's state and provide a centralized data store.
   - In this project, the `frontend/src/stores/` directory contains state management files for entities such as `labs`, `reservations`, `slots`, and `users`.
   - Example: The `labs_store.js` file manages the state of laboratory data, including fetching lab details from the backend and storing them for use across components.

By adhering to the MVC pattern, the project ensures a clear separation of concerns, making the codebase easier to maintain and scale.
# GP MiniMart

GP MiniMart is a full-stack e-commerce application designed for local grocery stores (Kirana shops). It features a modern, responsive UI for customers and a comprehensive admin panel for shop owners.

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Framer Motion
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Authentication:** JWT, bcryptjs
- **Other:** Socket.io (for real-time updates), jsPDF (for invoicing)

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB instance (local or Atlas)

## Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd GP-MiniMart
    ```

2.  **Install dependencies:**
    ```bash
    # Install server dependencies
    cd server
    npm install

    # Install client dependencies
    cd ../client
    npm install
    ```

3.  **Environment Variables:**
    Create a `.env` file in the `server` directory with the following variables:
    ```env
    PORT=5000
    MONGO_URI=<your-mongodb-uri>
    JWT_SECRET=<your-jwt-secret>
    ```

## Running the Application

### Development Mode

To run both the server and client concurrently:

```bash
# From the root directory
npm run dev
```

### Server Only

```bash
cd server
npm start
```

### Client Only

```bash
cd client
npm run dev
```

## Testing

To run the server-side tests:

```bash
cd server
npm test
```

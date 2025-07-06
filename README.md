# 🏡 Property Listing System (Backend)

A full-featured backend-only property listing system built with **Node.js**, **Express**, **TypeScript**, **MongoDB**, and **Redis (Upstash)**. It supports user authentication, property CRUD, favorites, recommendations, advanced search, and caching — all secured and optimized for performance.

---

## 🔧 Tech Stack

- **Backend**: Node.js, Express.js, TypeScript
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT (Access + Refresh Tokens)
- **Caching**: Redis (Upstash)
- **Role-Based Access**: Admin, User
- **Deployment**: Render

---

## 🌟 Features

### 🔐 Authentication
- Register & login with hashed passwords (`bcryptjs`)
- JWT-based authentication (short-lived **access token**, long-lived **refresh token**)
- Role-based access control (Admin/User)
- Logout and token invalidation

### 🏠 Property Management
- Users can create, update, and delete their own properties
- Admins have complete access
- Redis caching for all & individual properties
- Advanced filtering via query params (e.g., city, price, area, bedrooms, etc.)

### ❤️ Favorites
- Add/remove properties to personal favorites
- CRUD endpoints for managing favorites

### 💌 Property Recommendations
- Recommend properties to other users via their email
- Get sent/received recommendations
- Prevent duplicate recommendations
- Redis caching for received recommendations

### 🔄 Token Refresh Flow
- Uses **access tokens** for protected routes
- If access token expires, a **refresh token** (stored in DB) is used to issue a new one securely

### 🚀 Caching with Redis (Upstash)
- All read-heavy endpoints (users, properties, recommendations) are cached using Redis
- Invalidation after relevant create/update/delete

---


---

## 📦 Installation

```bash
git clone https://github.com/your-username/property-listing-backend.git
cd property-listing-backend

# Install dependencies
npm install

# Build TypeScript
npm run build

# Start server
npm start
```

## 📡 API Endpoints

### 👤 User Routes

| Method | Endpoint                 | Description                    |
|--------|--------------------------|--------------------------------|
| POST   | `/api/users/register`    | Register a new user            |
| POST   | `/api/users/login`       | Login user and get tokens      |
| POST   | `/api/users/logout`      | Logout user                    |
| POST   | `/api/users/refresh`     | Refresh access token           |
| GET    | `/api/users`             | Get all users (Admin only)     |
| GET    | `/api/users/:id`         | Get user by ID                 |
| PUT    | `/api/users/:id`         | Update user by ID              |
| DELETE | `/api/users/:id`         | Delete user by ID              |
| GET    | `/api/users/search`      | Search users by name/email/etc.|

### 🏠 Property Routes

| Method | Endpoint                     | Description                         |
|--------|------------------------------|-------------------------------------|
| POST   | `/api/property`              | Create new property (Auth required) |
| GET    | `/api/property`              | Get all properties                  |
| GET    | `/api/property/:id`          | Get property by ID                  |
| PUT    | `/api/property/:id`          | Update property (only owner)        |
| DELETE | `/api/property/:id`          | Delete property (only owner)        |
| GET    | `/api/property/search`       | Advanced search with filters        |

### ⭐ Favorite Routes

| Method | Endpoint                   | Description                     |
|--------|----------------------------|---------------------------------|
| POST   | `/api/favorites/:id`       | Add property to favorites       |
| GET    | `/api/favorites`           | Get all favorite properties     |
| DELETE | `/api/favorites/:id`       | Remove property from favorites  |

### 📨 Recommendation Routes

| Method | Endpoint                             | Description                             |
|--------|--------------------------------------|-----------------------------------------|
| POST   | `/api/recommend`                     | Recommend a property to another user    |
| GET    | `/api/recommend/sent`                | View sent recommendations               |
| GET    | `/api/recommend/received`            | View received recommendations           |
| DELETE | `/api/recommend/:recommendationId`   | Unrecommend a property                  |

---

## 🧪 Testing with Postman

1. Add headers like:

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```


## 🧪 Folder Structure
src/
├── controllers/    # All business logic
├── models/         # Mongoose schemas
├── routes/         # Express route handlers
├── middleware/     # Auth, role, error handling
├── config/         # Redis Connection Logic
├── index.ts        # Entry point

## Notes
JWT Auth: Secure routes are protected using short-lived access tokens. Refresh tokens are stored securely in the DB and used to generate new access tokens without re-logging in.

Redis Caching: Frequently accessed endpoints (e.g., get all users, properties, or recommendations) are cached in Redis to improve performance and reduce DB load.

Role-Based Access: The system enforces role-based access control:

Admins: Can perform all actions

Users: Can only manage their own data

Env-Safe Config: All API secrets, DB URIs, and Redis URLs are managed via environment variables and not exposed in the codebase.


## Live Deployment

The backend is live on Render:
👉 https://propertylistingsystem-1.onrender.com

Try hitting the base route:
GET /
Response: "API is working"

## Author
Karan Nanda

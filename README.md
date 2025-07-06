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

## 📁 Project Structure



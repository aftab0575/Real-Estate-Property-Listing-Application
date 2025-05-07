# 🏡 Real Estate Listing Application

A modern, feature-rich real estate listing platform built with Next.js, Node.js, and MongoDB. This full-stack application provides a seamless experience for property buyers, sellers, and real estate agents.

![Next.js](https://img.shields.io/badge/Next.js-13.4-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-18.2-blue?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18.x-green?style=flat-square&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-6.0-green?style=flat-square&logo=mongodb)
![Chakra UI](https://img.shields.io/badge/Chakra_UI-2.8-teal?style=flat-square&logo=chakra-ui)

## ✨ Features

- **User Authentication** - Secure signup, login, and password recovery
- **Property Listings** - Advanced search and filter capabilities
- **User Profiles** - Personalized dashboards for users
- **Property Management** - CRUD operations for property listings
- **Saved Properties** - Users can save favorite properties
- **Responsive Design** - Optimized for all devices
- **Form Validation** - Client and server-side validation

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or Atlas)
- npm or yarn

## 🏗️ Project Structure

```
.
├── nodejs-backend/     # Backend API
└── nextjs-frontend/    # Frontend application
```

## 🚀 Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd nodejs-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/real-estate
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-email-password
   ```

4. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd nextjs-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at:
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000](http://localhost:5000)

## 📚 API Documentation

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/forgot-password` - Request password reset

### Users
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update user profile

### Properties
- `GET /api/properties` - Get all properties
- `POST /api/properties` - Create new property
- `GET /api/properties/:id` - Get property by ID
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property

## 🔧 Technologies Used

### Frontend
- **Next.js** - React framework for SSR and static site generation
- **React** - UI library
- **Chakra UI** - Component library for accessible and responsive design
- **React Hook Form** - Form validation and management
- **Axios** - HTTP client
- **React Icons** - Icon library
- **Framer Motion** - Animation library

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **Nodemailer** - Email sending
- **Multer** - File uploads
- **Express Validator** - Request validation

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Contact

If you have any questions, please open an issue or contact the repository owner.

---

Happy coding! 🚀 
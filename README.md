# yenRi Media BACKEND

## Overview
**yenRi Media BACKEND** is the backend service for a social media platform. It handles user registration, authentication, profile management, and media uploads. This project integrates with MongoDB for database management and Cloudinary for image storage and processing.

## Features
- **User Registration & Authentication**: Secure user registration and login system.
- **Profile Management**: Users can update their profiles, including uploading profile pictures.
- **Media Storage**: Profile pictures are uploaded to Cloudinary via Multer middleware.
- **MongoDB Integration**: User data and other related information are stored in a MongoDB database.

## Tech Stack
- **Node.js**: Backend runtime environment.
- **Express.js**: Web framework for handling routes and middleware.
- **MongoDB**: NoSQL database for data storage.
- **Mongoose**: ODM for MongoDB.
- **Multer**: Middleware for handling `multipart/form-data` for file uploads.
- **Cloudinary**: Cloud storage for profile picture management.
- **JWT**: JSON Web Tokens for secure user authentication.

## Setup & Installation

### Clone the repository:

```bash
  git clone https://github.com/LikhithPalya/yenRi-Media-BACKEND.git
  cd yenRi-Media-BACKEND
```
### Install dependencies:
```bash
npm install
```
### Environment Variables:
Create a .env file in the root of your project and add the following:

``` bash
MONGO_URI=your_mongodb_uri
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
JWT_SECRET=your_jwt_secret
```
### Run the server:
``` bash
npm start
```
The server will start at http://localhost:5000.

### API Endpoints

***User Routes***

- **POST** `/api/register`: Register a new user.
- **POST** `/api/login`: Login a user and return a JWT token.
- **GET** `/api/profile/`: Get user profile by ID.
- **PUT** `/api/profile/edit`: Edit user profile, including uploading a profile picture.


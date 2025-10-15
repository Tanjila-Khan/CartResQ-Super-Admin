# CartResQ Super Admin Panel

An independent super admin panel for managing CartResQ users and subscriptions.

## Features

- **User Management**: View, edit, delete, and create users
- **Subscription Management**: Monitor and manage user subscriptions
- **Dashboard Overview**: Real-time statistics and analytics
- **Role Management**: Assign and modify user roles
- **Password Reset**: Reset user passwords
- **Advanced Filtering**: Search and filter users by various criteria

## Installation

1. Navigate to the super-admin-app directory:
```bash
cd super-admin-app
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with your database connection:
```env
MONGODB_URI=mongodb://localhost:27017/cartresq
JWT_SECRET=your-super-secret-jwt-key
PORT=3001
```

4. Start the application:
```bash
npm start
```

## Access

- **URL**: http://localhost:3001
- **Login**: Use your super admin credentials from CartResQ

## Usage

### Dashboard
- View total users, active users, subscribed users
- Monitor subscription plan distribution
- See recent user activity

### User Management
- **View Users**: Browse all users with pagination
- **Search**: Search by name or email
- **Filter**: Filter by role, status, or subscription plan
- **Edit**: Modify user roles and subscription details
- **Delete**: Remove users (except super admins)
- **Add**: Create new users with custom roles and subscriptions
- **Reset Password**: Reset any user's password

### Security
- JWT-based authentication
- Super admin role required
- Secure password hashing
- Protected API endpoints

## API Endpoints

### Authentication
- `POST /api/auth/login` - Super admin login
- `GET /api/auth/me` - Get current user info

### Dashboard
- `GET /api/dashboard/overview` - Get dashboard statistics

### Users
- `GET /api/users` - Get all users (with filters and pagination)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `POST /api/users/:id/reset-password` - Reset user password

## Database Connection

This application connects to your existing CartResQ MongoDB database and uses the same User collection. It doesn't modify your existing codebase or data structure.

## Deployment

You can deploy this as a separate service alongside your main CartResQ application. It runs independently on port 3001 by default.

## Security Notes

- Change the JWT_SECRET in production
- Use HTTPS in production
- Restrict access to super admin IPs if needed
- Regularly rotate passwords

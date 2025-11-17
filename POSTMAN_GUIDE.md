# Postman Guide - Creating Admin Users

## Setup MongoDB Atlas Connection

1. **Get your MongoDB Atlas connection string:**
   - Go to MongoDB Atlas dashboard
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string

2. **Update backend/.env file:**
   ```env
   MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/admin_panel?retryWrites=true&w=majority
   ```

## Start the Backend Server

```bash
cd backend
npm run dev
```

Server will run on `http://localhost:5000`

## Postman Requests

### 1. Create Admin User

**Method:** `POST`
**URL:** `http://localhost:5000/auth/create-admin`
**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "name": "Super Admin",
  "email": "superadmin@adminpanel.com",
  "password": "admin123"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Admin user created successfully",
  "data": {
    "_id": "...",
    "name": "Super Admin",
    "email": "superadmin@adminpanel.com",
    "role": "admin",
    "createdAt": "..."
  }
}
```

### 2. Login as Admin

**Method:** `POST`
**URL:** `http://localhost:5000/auth/login`
**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "superadmin@adminpanel.com",
  "password": "admin123"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "_id": "...",
    "name": "Super Admin",
    "email": "superadmin@adminpanel.com",
    "role": "admin",
    "createdAt": "..."
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## API Endpoints Summary

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/create-admin` | Create admin user | No |
| POST | `/auth/login` | User login | No |
| GET | `/auth/profile` | Get user profile | Yes |
| GET | `/api/users` | Get all users | Admin only |
| GET | `/api/users/:id` | Get user by ID | Authenticated |
| PUT | `/api/users/:id` | Update user | Authenticated |
| DELETE | `/api/users/:id` | Delete user | Admin only |

## Using JWT Token in Postman

For protected endpoints, add the Authorization header:

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

## Testing in Browser

After creating admin users via Postman, you can:

1. Start the frontend: `cd JS && npm run dev`
2. Login with the admin credentials you created
3. Access the full admin panel

## Security Notes

- The `/auth/create-admin` endpoint is currently public for testing
- In production, protect this endpoint with admin authentication
- Change the JWT_SECRET in production
- Use strong passwords and enable HTTPS

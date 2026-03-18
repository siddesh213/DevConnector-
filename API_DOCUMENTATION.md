# DevTinder API Documentation

## 📌 Base URL

- **Development**: `http://localhost:3001`
- **Production**: `https://devtinder-backend.onrender.com`

## 🔐 Authentication

All protected endpoints require JWT token in cookies or Authorization header.

```
Authorization: Bearer <jwt_token>
```

---

## 📚 Endpoints

### Authentication Routes

#### `POST /signup`
Register a new user account.

**Request Body**:
```json
{
  "email": "developer@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (201)**:
```json
{
  "success": true,
  "user": {
    "_id": "user_id",
    "email": "developer@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "token": "jwt_token"
}
```

**Errors**:
- 400: Invalid input validation
- 409: Email already exists
- 500: Server error

---

#### `POST /login`
Login with email and password.

**Request Body**:
```json
{
  "email": "developer@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200)**:
```json
{
  "success": true,
  "user": {
    "_id": "user_id",
    "email": "developer@example.com",
    "firstName": "John"
  },
  "token": "jwt_token"
}
```

**Errors**:
- 401: Invalid credentials
- 404: User not found

---

#### `POST /logout`
Logout user and clear session.

**Response (200)**:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### Profile Routes

#### `GET /profile/view`
Get current user profile (Protected).

**Headers**:
```
Authorization: Bearer <token>
```

**Response (200)**:
```json
{
  "success": true,
  "user": {
    "_id": "user_id",
    "email": "developer@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "age": 25,
    "bio": "Full-stack developer passionate about web development",
    "skills": ["React", "Node.js", "MongoDB"],
    "photoUrl": "https://example.com/photo.jpg",
    "createdAt": "2024-03-18T10:00:00Z"
  }
}
```

**Errors**:
- 401: Unauthorized
- 404: User not found

---

#### `PUT /profile/edit`
Update user profile (Protected).

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "age": 26,
  "bio": "Updated bio",
  "skills": ["React", "Node.js", "MongoDB", "TypeScript"]
}
```

**Response (200)**:
```json
{
  "success": true,
  "user": { /* Updated user object */ }
}
```

---

#### `GET /feed`
Get developers feed with pagination (Protected).

**Query Parameters**:
- `limit`: Number of results (default: 10)
- `skip`: Number to skip (default: 0)

**Example**: `/feed?limit=10&skip=0`

**Response (200)**:
```json
{
  "success": true,
  "developers": [
    {
      "_id": "dev_id_1",
      "firstName": "Alice",
      "lastName": "Smith",
      "skills": ["Python", "Django"],
      "bio": "Backend developer",
      "photoUrl": "https://..."
    },
    // ... more developers
  ],
  "total": 150,
  "limit": 10,
  "skip": 0
}
```

**Errors**:
- 401: Unauthorized

---

### Connection Routes

#### `POST /connection/request/:userId`
Send connection request to another developer (Protected).

**Parameters**:
- `userId`: ID of user to connect with

**Response (201)**:
```json
{
  "success": true,
  "message": "Connection request sent",
  "request": {
    "_id": "request_id",
    "fromUserId": "user_id",
    "toUserId": "target_user_id",
    "status": "interested",
    "createdAt": "2024-03-18T10:00:00Z"
  }
}
```

**Errors**:
- 400: Cannot send request to yourself
- 409: Request already exists
- 401: Unauthorized

---

#### `POST /connection/accept/:requestId`
Accept connection request (Protected).

**Parameters**:
- `requestId`: ID of connection request

**Response (200)**:
```json
{
  "success": true,
  "message": "Connection accepted",
  "request": {
    "_id": "request_id",
    "status": "accepted",
    "updatedAt": "2024-03-18T10:30:00Z"
  }
}
```

---

#### `POST /connection/reject/:requestId`
Reject connection request (Protected).

**Parameters**:
- `requestId`: ID of connection request

**Response (200)**:
```json
{
  "success": true,
  "message": "Connection rejected"
}
```

---

#### `GET /connection/accepted`
Get all accepted connections (Protected).

**Response (200)**:
```json
{
  "success": true,
  "connections": [
    {
      "_id": "connection_id",
      "user": {
        "_id": "user_id",
        "firstName": "Bob",
        "lastName": "Wilson",
        "email": "bob@example.com"
      },
      "status": "accepted",
      "connectedAt": "2024-03-18T09:00:00Z"
    }
  ]
}
```

---

#### `GET /request/requests`
Get pending connection requests (Protected).

**Response (200)**:
```json
{
  "success": true,
  "requests": [
    {
      "_id": "request_id",
      "fromUser": {
        "_id": "sender_id",
        "firstName": "Alice",
        "lastName": "Smith",
        "photoUrl": "https://..."
      },
      "status": "interested",
      "createdAt": "2024-03-18T08:00:00Z"
    }
  ]
}
```

---

### Health & Status Routes

#### `GET /health`
Health check endpoint (Public).

**Response (200)**:
```json
{
  "status": "OK",
  "environment": "production",
  "timestamp": "2024-03-18T10:00:00Z",
  "port": 3001
}
```

#### `GET /`
API status (Public).

**Response (200)**:
```json
{
  "message": "✅ DevTinder Backend API is running",
  "version": "1.0.0",
  "environment": "production"
}
```

---

## 🔌 WebSocket Events

### Connection Events

#### `join`
Join user's private room for notifications.

**Emit**:
```javascript
socket.emit('join', userId);
```

**Response**: No response, but user can now receive private messages.

---

#### `send-connection-request`
Send connection request via WebSocket.

**Emit**:
```javascript
socket.emit('send-connection-request', {
  fromUserId: 'sender_id',
  toUserId: 'recipient_id'
});
```

**Receive**:
```javascript
socket.on('connection-request-received', (data) => {
  console.log(data);
  // {
  //   fromUserId: 'sender_id',
  //   message: 'You have a new connection request!'
  // }
});
```

---

#### `accept-connection`
Accept connection via WebSocket.

**Emit**:
```javascript
socket.emit('accept-connection', {
  fromUserId: 'sender_id',
  toUserId: 'receiver_id'
});
```

**Receive**:
```javascript
socket.on('connection-accepted', (data) => {
  // Both users receive this notification
  // {
  //   fromUserId: 'user_id',
  //   message: 'Connection request accepted!'
  // }
});
```

---

## ⚠️ Common Errors

### 401 Unauthorized
Occurs when JWT token is missing or invalid.
```json
{
  "success": false,
  "error": {
    "message": "Please login to continue"
  }
}
```

**Fix**: 
- Ensure token is sent in Authorization header
- Check token expiration
- Re-login if token is invalid

### 404 Not Found
Occurs when requested resource doesn't exist.
```json
{
  "success": false,
  "error": {
    "message": "User not found"
  }
}
```

### 400 Bad Request
Occurs when input validation fails.
```json
{
  "success": false,
  "error": {
    "message": "Invalid email format"
  }
}
```

### 500 Internal Server Error
Server error - contact support.
```json
{
  "success": false,
  "error": {
    "message": "Internal Server Error"
  }
}
```

---

## 🔑 Response Format

All responses follow this format:

**Success**:
```json
{
  "success": true,
  "data": { /* Response data */ }
}
```

**Error**:
```json
{
  "success": false,
  "error": {
    "message": "Error message",
    "code": "ERROR_CODE"
  }
}
```

---

## 📊 Rate Limiting

- **Auth routes**: 100 requests per 15 minutes per IP
- **API routes**: 1000 requests per hour per user

---

## 🔄 Pagination

Paginated endpoints accept:
- `limit`: Results per page (max: 100)
- `skip`: Number of results to skip

Example:
```
GET /feed?limit=10&skip=20
```

---

## 📝 Notes

- All timestamps are in ISO 8601 format
- IDs are MongoDB ObjectIds
- Passwords are never returned in responses
- Use HTTPS in production
- Set `withCredentials: true` for authenticated requests

---

## 🧪 Example Usage

### Using cURL

```bash
# Login
curl -X POST https://devtinder-backend.onrender.com/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get profile
curl -X GET https://devtinder-backend.onrender.com/profile/view \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"

# Get feed
curl -X GET "https://devtinder-backend.onrender.com/feed?limit=10&skip=0" \
  -H "Authorization: Bearer <token>"
```

### Using Axios (JavaScript)

```javascript
import api from './utils/axiosConfig';

// Login
const loginRes = await api.post('/login', {
  email: 'test@example.com',
  password: 'password123'
});

// Get profile
const profileRes = await api.get('/profile/view');

// Get feed
const feedRes = await api.get('/feed', {
  params: { limit: 10, skip: 0 }
});

// Send connection request
const requestRes = await api.post(`/connection/request/${userId}`);
```

---

## 📞 Support

For API issues:
- Check error messages in response
- Review this documentation
- Check server logs: `curl https://devtinder-backend.onrender.com/health`
- Open GitHub issue with error details

---

**Last Updated**: March 18, 2024  
**Version**: 1.0.0

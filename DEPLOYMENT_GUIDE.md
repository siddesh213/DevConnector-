# DevTinder - Production Deployment Guide

## 📋 Complete Deployment Checklist

### Phase 1: Local Setup & Environment Configuration
- [ ] Backend environment variables
- [ ] Frontend environment variables  
- [ ] Fix API endpoints
- [ ] Test locally

### Phase 2: Backend Deployment (Render/Railway)
- [ ] Prepare backend for deployment
- [ ] Setup environment on platform
- [ ] Deploy database
- [ ] Test API endpoints

### Phase 3: Frontend Deployment (Vercel)
- [ ] Prepare frontend build
- [ ] Setup environment variables
- [ ] Configure deployment
- [ ] Deploy frontend

### Phase 4: Final Integration & WebSocket
- [ ] Test WebSocket connections
- [ ] Verify real-time features
- [ ] Performance testing
- [ ] Monitor logs

---

## ✅ STEP-BY-STEP FIXES

### STEP 1: Backend Environment Variables (.env)

**File: `DevTinder-backebd/.env`**
```env
# Server
PORT=3001
NODE_ENV=development

# Database (REMOVE HARDCODED CREDENTIALS)
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster.mongodb.net/DevTinder

# Frontend
FRONTEND_URL=http://localhost:5174

# Authentication
JWT_SECRET=DevTinderSecret123!@#

# For Production:
# FRONTEND_URL=https://yourdomain.vercel.app
# NODE_ENV=production
```

**Create `.env.example`:**
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/DevTinder
FRONTEND_URL=http://localhost:5174
JWT_SECRET=your-secret-key-here
```

### STEP 2: Frontend Environment Variables

**File: `code (3)/.env.local` (local development)**
```env
VITE_BASE_URL=http://localhost:3001
VITE_API_BASE_URL=http://localhost:3001
```

**File: `code (3)/.env.production` (for Vercel)**
```env
VITE_BASE_URL=https://devtinder-backend.onrender.com
VITE_API_BASE_URL=https://devtinder-backend.onrender.com
```

**Create `code (3)/.env.example`:**
```env
VITE_BASE_URL=http://localhost:3001
VITE_API_BASE_URL=http://localhost:3001
```

### STEP 3: Update Frontend API Configuration

**File: `code (3)/src/utils/constants.js`**
```javascript
// Use environment variable with fallback
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";
const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3001";

export const API_BASE_URL = API_BASE;
export const BASE_URL = BASE_URL;
```

### STEP 4: Fix MongoDB in Backend

**Remove hardcoded credentials from `DevTinder-backebd/src/config/database.js`:**
```javascript
const mongoose = require("mongoose");

const conncectdb = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }
    await mongoose.connect(mongoUri);
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
};

module.exports = { conncectdb };
```

### STEP 5: Update Backend CORS & WebSocket for Production

**File: `DevTinder-backebd/src/app.js`**

Key improvements:
```javascript
// Get allowed origins from environment
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.FRONTEND_URL,
  process.env.PRODUCTION_FRONTEND_URL,
].filter(Boolean);

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps)
      if (!origin) return callback(null, true);
      
      if (process.env.NODE_ENV === 'development') {
        return callback(null, true);
      }
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
    transports: ['websocket', 'polling'] // Important for deployment
  }
});
```

### STEP 6: Backend package.json Scripts

**File: `DevTinder-backebd/package.json`**
```json
{
  "scripts": {
    "dev": "nodemon src/app.js",
    "start": "node src/app.js",
    "prod": "NODE_ENV=production node src/app.js"
  }
}
```

### STEP 7: Frontend Vite Configuration for Production

**File: `code (3)/vite.config.js`**
```javascript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Proxy for development only
    proxy: {
      "/api": {
        target: process.env.VITE_API_BASE_URL || "http://localhost:3001",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable in production
    minify: 'terser',
  }
});
```

### STEP 8: Update Frontend socket.io Connection

**File: `code (3)/src/contexts/SocketContext.jsx`**
```jsx
export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Use BASE_URL from environment or constants
    const socketURL = import.meta.env.VITE_BASE_URL || BASE_URL;
    
    const newSocket = io(socketURL, {
      withCredentials: true,
      transports: ['websocket', 'polling'], // Fallback for deployment
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log('✅ Connected to server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('⚠️ Disconnected from server');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // ... rest of code
};
```

### STEP 9: Add Axios Instance with Proper Configuration

**Create new file: `code (3)/src/utils/axiosConfig.js`**
```javascript
import axios from "axios";
import { API_BASE_URL } from "./constants";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for sending cookies
  timeout: 10000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## 🌐 BACKEND DEPLOYMENT (Render/Railway)

### Option A: Deploy to Render

1. **Create account**: https://render.com
2. **Connect GitHub**: 
   - Push backend to GitHub repo
   - Create `/DevTinder-backend` as root or fork
3. **Create Web Service**:
   - Select repository
   - Runtime: Node
   - Build command: `npm install`
   - Start command: `node src/app.js`
4. **Environment Variables** in Render dashboard:
   ```
   PORT=3001
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://...
   FRONTEND_URL=https://yourdomain.vercel.app
   JWT_SECRET=...
   ```
5. **Deploy**: Render auto-deploys on GitHub push

### Option B: Deploy to Railway

1. **Create account**: https://railway.app
2. **Connect GitHub**: Select backend repo
3. **Add variables** in Railway dashboard (same as Render)
4. **Deploy**: One-click deploy

---

## 🎨 FRONTEND DEPLOYMENT (Vercel)

### Step 1: Prepare Repository
```bash
cd code\ \(3\)
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/devtinder-frontend.git
git push -u origin main
```

### Step 2: Deploy to Vercel
1. Go to https://vercel.com
2. Sign in with GitHub
3. Click "New Project"
4. Select your frontend repo
5. **Framework**: Vite
6. **Build Command**: `npm run build` or `vite build`
7. **Output**: `dist`
8. **Environment Variables**:
   ```
   VITE_BASE_URL=https://your-backend-url.onrender.com
   VITE_API_BASE_URL=https://your-backend-url.onrender.com
   ```
9. Click **Deploy**

### Step 3: Update Backend URL in Vercel
Once deployed, update backend `.env`:
```env
FRONTEND_URL=https://your-frontend.vercel.app
PRODUCTION_FRONTEND_URL=https://www.your-domain.com
```

---

## 🔧 WEBSOCKET DEPLOYMENT GUIDE

### Issue: WebSocket fails on shared hosting
**Solution**: Use both WebSocket and polling

Already fixed in `SocketContext.jsx` with:
```javascript
transports: ['websocket', 'polling']
```

### For Nginx (if self-hosting):
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## ✨ RECRUITER-IMPRESSING IMPROVEMENTS

### 1. Add Health Check Endpoint
**File: `DevTinder-backebd/src/app.js`**
```javascript
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});
```

### 2. Add Logging Middleware
**Create: `DevTinder-backebd/src/middleware/logger.js`**
```javascript
const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const { method, path, ip } = req;
  console.log(`[${timestamp}] ${method} ${path} - IP: ${ip}`);
  next();
};
module.exports = logger;
```

### 3. Add Validation Middleware
**Create: `DevTinder-backebd/src/middleware/validation.js`**
```javascript
const { validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = handleValidationErrors;
```

### 4. Add Rate Limiting (prevent abuse)
**Install**: `npm install express-rate-limit`

**In app.js:**
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/auth', limiter); // Apply to auth routes
```

### 5. Add Error Handling Middleware
**Create: `DevTinder-backebd/src/middleware/errorHandler.js`**
```javascript
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

module.exports = errorHandler;
```

### 6. Add Input Sanitization
**Install**: `npm install express-validator`

Use in routes to validate all inputs

### 7. API Documentation (Impress Recruiters!)
**Create: `DevTinder-backebd/API_DOCS.md`**
```markdown
# DevTinder API Documentation

## Authentication Endpoints

### POST /signup
Register a new user
```

### 8. Add GitHub Actions CI/CD
**Create: `.github/workflows/deploy.yml`**
```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run tests
        run: npm test
      - name: Deploy
        run: npm run deploy
```

---

## 📝 DEPLOYMENT CHECKLIST

### Before Deploying Backend:
- [ ] Remove all `console.log` statements (use proper logger)
- [ ] Add error handling to all routes
- [ ] Validate all inputs
- [ ] Add rate limiting
- [ ] Set `NODE_ENV=production`
- [ ] Use environment variables (no hardcoded secrets)
- [ ] Add HTTPS/SSL certificate
- [ ] Setup database backups
- [ ] Add monitoring & error tracking (Sentry)

### Before Deploying Frontend:
- [ ] Run `npm run build` locally and test
- [ ] Remove all hardcoded URLs
- [ ] Use environment variables
- [ ] Add loading states & error boundaries
- [ ] Optimize images
- [ ] Enable gzip compression
- [ ] Setup CDN for static files

### After Deployment:
- [ ] Test all features in production
- [ ] Monitor performance & errors
- [ ] Setup alerts
- [ ] Document deployment process
- [ ] Create runbook for troubleshooting

---

## 🆘 TROUBLESHOOTING

### WebSocket Connection Fails
**Fix**: Ensure backend CORS allows frontend URL and has `transports: ['websocket', 'polling']`

### API Calls Timeout
**Fix**: Check CORS headers and backend environment variables

### Database Connection Issues
**Fix**: Verify MONGODB_URI in .env matches MongoDB Atlas whitelist

### CORS Errors
**Fix**: Update `allowedOrigins` in backend app.js with production frontend URL

---

## 📊 Performance Optimization

1. **Frontend**:
   - Code splitting with React.lazy()
   - Image optimization
   - Gzip compression
   - Cache busting

2. **Backend**:
   - Query optimization (MongoDB indexes)
   - Caching (Redis)
   - Connection pooling
   - Monitoring

3. **Database**:
   - Add indexes to frequently queried fields
   - Regular backups
   - Monitor query performance

---

**Need help?** Follow the fixes in order and test at each stage!

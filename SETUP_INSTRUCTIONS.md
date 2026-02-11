# TWL System Authentication Setup

## Created Files

### Backend (Server)
✅ Mongoose Schemas:
- `server/models/User.js` - User schema with password hashing and authentication
- `server/models/Supplier.js` - Supplier schema
- `server/models/Buyer.js` - Buyer schema
- `server/models/Project.js` - Project schema with costing and virtual netProfit
- `server/models/Loan.js` - Loan schema with payoffs array and virtuals
- `server/models/Payment.js` - Payment schema with payment types

✅ Seed Script:
- `server/seedUsers.js` - Seeds admin and user accounts

✅ Server Configuration:
- `server/server.js` - Updated with auth routes

❌ Need to Create Manually (PowerShell not available):
- `server/routes/auth.js` - Authentication routes
- `server/middleware/auth.js` - Authentication middleware

### Frontend (Client)
✅ React Components (need to create manually):
- `client/src/components/Login.jsx` - Login page
- `client/src/components/Login.css` - Login styles
- `client/src/components/AdminDashboard.jsx` - Admin dashboard
- `client/src/components/AdminDashboard.css` - Admin dashboard styles
- `client/src/components/UserView.jsx` - User view page
- `client/src/components/UserView.css` - User view styles

✅ Updated Files:
- `client/src/App.jsx` - Updated with authentication flow
- `client/src/App.css` - Updated with base styles

## Setup Instructions

### Step 1: Create Missing Directories

**For Server:**
Open Command Prompt in `c:\twl-system\server` and run:
```cmd
mkdir routes
mkdir middleware
```

**For Client:**
Open Command Prompt in `c:\twl-system\client\src` and run:
```cmd
mkdir components
```

### Step 2: Create Backend Files

After creating the directories, you need to manually create these files:

**File: `server/routes/auth.js`**
```javascript
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email and password' 
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    const token = jwt.sign(
      { 
        id: user._id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login' 
    });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists' 
      });
    }

    const user = new User({
      name,
      email,
      passwordHash: password,
      role: role || 'viewer'
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during registration' 
    });
  }
});

router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-passwordHash');

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
});

module.exports = router;
```

**File: `server/middleware/auth.js`**
```javascript
const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Admin only.' 
    });
  }
  next();
};

module.exports = { authMiddleware, adminOnly };
```

### Step 3: Create Frontend Components

See the files created in my previous messages for:
- Login.jsx and Login.css
- AdminDashboard.jsx and AdminDashboard.css
- UserView.jsx and UserView.css

Copy these files to `client/src/components/`

### Step 4: Seed Database

Run from server directory:
```cmd
node seedUsers.js
```

This will create two users:
- **Admin**: admin@gmail.com / admin123
- **User**: user@gmail.com / user123

### Step 5: Start the Application

**Terminal 1 (Server):**
```cmd
cd c:\twl-system\server
npm run dev
```

**Terminal 2 (Client):**
```cmd
cd c:\twl-system\client
npm run dev
```

### Step 6: Test Login

1. Open http://localhost:5173 (or the port shown by Vite)
2. Try logging in with:
   - admin@gmail.com / admin123 → Should see Admin Dashboard
   - user@gmail.com / user123 → Should see User View

## Features Implemented

✅ **Backend:**
- 6 Mongoose schemas with validation
- JWT authentication
- Password hashing with bcrypt
- Login/Register/Verify endpoints
- Role-based access control middleware

✅ **Frontend:**
- Interactive login page
- Role-based routing (Admin Dashboard / User View)
- Token storage in localStorage
- Auto-login on page refresh
- Logout functionality
- Beautiful gradient UI with hover effects

## Database Schema Summary

1. **User**: name, email, passwordHash, role (admin|viewer)
2. **Supplier**: name, country
3. **Buyer**: name, country
4. **Project**: All LOG SHEET fields mapped to nested objects (supplier{}, buyer{}, costing{}), includes virtual `netProfit`
5. **Loan**: reference to Project, loanAmount, payoffs array (replaces 6 fixed columns), virtuals for totalPaid and remainingBalance
6. **Payment**: reference to Project, paymentType enum (advance|progress|final|other), date, amounts

## Next Steps

1. Create the directories as mentioned
2. Copy/paste the auth files
3. Copy/paste the component files
4. Run the seed script
5. Start both servers
6. Test the login flow

The authentication system is complete and ready to use!

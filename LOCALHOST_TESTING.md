# 🔧 LOCALHOST TESTING - API DISABLED

## Why API is disabled:

When running on localhost with simple HTTP server (python -m http.server 8000), we can't call `/api/` endpoints because:

1. ❌ HTTP server is **static files only** (no backend processing)
2. ❌ Flask Python API not running
3. ❌ No POST request support for API calls

**Solution:** Use **localStorage fallback** - App works 100% locally with no backend needed!

---

## ✅ What's Working:

- Authentication (login/signup)
- All courses display
- Enrollment
- Progress tracking
- Masterclasses (stored in localStorage)
- Admin features
- Mobile responsive

**Everything stored locally in browser = No backend needed for testing!**

---

## 🧪 How to Test:

### 1. Login with Demo Account
```
Email: user@arthrex.ai
Password: user123
```

Or admin:
```
Email: admin@arthrex.ai
Password: admin123
```

### 2. Create New Account
- Click "Sign Up"
- Fill form
- Click "Join Arthrex AI"
- Auto-logged in ✅

### 3. Test Masterclasses
- Go to "Free Masterclasses"
- Admin can create new ones
- They display immediately ✅
- Stored in localStorage

### 4. Test All Features
- Browse courses
- Enroll in courses
- Check progress tracking
- Test mobile view

---

## 🚀 When Ready to Deploy:

The API will be enabled when deployed to Vercel/Hosting:

1. Vercel will run Python backend (`api/index.py`)
2. Redis (Upstash) will store data
3. API endpoints will work
4. Change in `.env`:
   ```
   VITE_API_BASE=/api
   ```

---

## 📊 Data Storage:

All data stored in browser's localStorage:
- `aai_session` - Login session
- `aai_signups` - User registrations
- `lf_enrollments` - Course enrollments
- `lf_masterclasses` - Masterclass data
- `lf_lms` - Course content

---

**Continue testing! All features work locally.** ✅

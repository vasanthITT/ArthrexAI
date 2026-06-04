# 🚀 DEPLOYMENT GUIDE - Arthrex AI to Hostinger

## Quick Start (5 minutes)

### Step 1: Prepare Files
1. Zip all files from ITT_UI folder
2. Keep structure intact

### Step 2: Upload to Hostinger
1. Login: hostinger.com dashboard
2. Go to "Website" → "File Manager"  
3. Navigate to: `public_html` folder
4. Extract zip (or upload individually):
   ```
   index.html
   admin.html
   admin-lms.html
   lms.html
   curriculum.html
   *.js (all JavaScript files)
   *.css (all CSS files)
   manifest.json
   icons/ (entire folder)
   api/ (entire folder - optional)
   ```

### Step 3: Access Your Site
- Visit: `yourdomain.com`
- Should show the Arthrex AI dashboard

---

## Backend API Setup

### Option A: Use Vercel (Recommended)
Backend API runs independently on Vercel:
1. Frontend hosted on Hostinger
2. Backend API on Vercel (api/index.py)
3. Frontend calls `/api/masterclasses` → redirects to Vercel

**Update frontend api.js:**
```javascript
// Change this line:
const API_BASE = '/api';

// To this (Vercel URL):
const API_BASE = 'https://your-vercel-url.vercel.app/api';
```

### Option B: Run Backend on Hostinger
If Hostinger supports Python:
1. Upload api/index.py
2. Configure Python app in cPanel
3. API runs at: `yourdomain.com/api`

### Option C: No Backend (Offline Mode)
- Frontend works without backend
- Uses localStorage only
- Perfect for demo/testing

---

## Domain & SSL Setup

### Add Domain (if not done)
1. In Hostinger: "Domains" → Add domain
2. Point nameservers to Hostinger
3. Wait 24-48 hours for propagation

### Enable HTTPS
1. Hostinger auto-enables Let's Encrypt SSL
2. All connections are secure
3. PWA requires HTTPS for offline support

---

## Testing After Deployment

1. Visit: `yourdomain.com`
2. Check DevTools (F12) for errors
3. Test login: `user@arthrex.ai / user123`
4. Test masterclasses section
5. If errors, check api.js API_BASE URL

---

## Troubleshooting

**Problem:** Blank page  
**Solution:** Check index.html is in public_html, ensure no 404 errors

**Problem:** Styles not loading  
**Solution:** Check CSS files uploaded, verify paths are correct

**Problem:** "Cannot reach API"  
**Solution:** Backend API not configured, use offline mode or Vercel backend

**Problem:** Login not working  
**Solution:** Auth uses localStorage fallback, should work offline

---

## Production Checklist

- [ ] All files uploaded
- [ ] Domain configured  
- [ ] HTTPS enabled
- [ ] No console errors
- [ ] Login works
- [ ] Masterclasses display
- [ ] Mobile responsive
- [ ] PWA manifest loaded

---

## Cost Estimate
- **Hostinger Shared Hosting:** $2-4/month
- **Vercel Backend:** Free tier (includes 1000 API calls/day)
- **Total:** $2-4/month

---

For questions: Contact instructor or refer to vercel.json config

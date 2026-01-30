# 🔐 Environment Setup Guide

## ⚠️ **IMPORTANT: Security Configuration Required**

This project requires several API keys and credentials to run. **NEVER commit real credentials to Git!**

---

## 📋 **Backend Setup** (`backend/.env`)

1. **Copy the example file:**

   ```bash
   cd backend
   cp .env.example .env
   ```

2. **Fill in your credentials:**

### 🔑 **Security Settings**

```env
JWT_SECRET=your-super-secret-jwt-key-change-this
SESSION_SECRET=your-session-secret-change-this
```

- Generate random strings (at least 32 characters)
- Use tools like: `openssl rand -hex 32`

### 📧 **Gmail SMTP** (for sending OTP emails)

```env
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password
```

**How to get Gmail App Password:**

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Security → 2-Step Verification (must be enabled)
3. Scroll down → App passwords
4. Generate new app password
5. Copy the 16-character password (no spaces)

### 🤖 **Gemini AI** (for chatbot)

```env
GEMINI_API_KEY=your-gemini-api-key-here
```

**How to get Gemini API Key:**

1. Go to [Google AI Studio](https://ai.google.dev/)
2. Sign in with Google account
3. Create API Key
4. Copy the key

### 💳 **PayPal** (for payment)

```env
PAYPAL_CLIENT_ID=your-paypal-client-id-here
PAYPAL_CLIENT_SECRET=your-paypal-client-secret-here
```

**How to get PayPal credentials:**

1. Go to [PayPal Developer](https://developer.paypal.com/)
2. Log in → Dashboard → Apps & Credentials
3. Create App (Sandbox for testing, Live for production)
4. Copy Client ID and Secret

---

## 🚀 **Frontend Setup** (`frontend/.env`)

Frontend currently only needs currency rate (already set):

```env
VITE_VND_TO_USD_RATE=23000
```

---

## 🛡️ **Security Best Practices**

✅ **DO:**

- Keep `.env` file local only
- Use different credentials for development/production
- Rotate API keys regularly
- Use environment variables for all sensitive data

❌ **DON'T:**

- Commit `.env` to Git (already in `.gitignore`)
- Share your API keys publicly
- Use production credentials in development
- Push real credentials to GitHub/GitLab

---

## 🧪 **Testing the Setup**

1. **Backend:**

   ```bash
   cd backend
   npm install
   npm start
   ```

   Check console for successful MongoDB connection and server start.

2. **Frontend:**

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

   Open browser to http://localhost:5173

3. **Test email sending:**
   - Register a new account
   - Check if OTP email arrives

4. **Test chatbot:**
   - Go to chatbot page
   - Send a message
   - Should get AI response

---

## 📞 **Need Help?**

- Gmail App Password not working → Check 2FA is enabled
- Gemini API errors → Check quota and API key validity
- PayPal errors → Verify Sandbox mode vs Live mode
- MongoDB connection issues → Check MongoDB is running

---

## 🔄 **For Demo/Production Deployment**

When deploying to services like Render, Vercel, Railway, etc.:

1. **Don't** include `.env` file in deploy
2. **Do** set environment variables in platform's dashboard:
   - Render: Environment → Add Environment Variables
   - Vercel: Settings → Environment Variables
   - Railway: Variables tab

3. Use **different credentials** for production!

---

**Last Updated:** 2026-02-07

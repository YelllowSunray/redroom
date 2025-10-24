# 🔥 Firebase Setup Guide - Save Your Photos Forever!

This guide will help you set up Firebase so your photos are saved permanently in the cloud (instead of disappearing when you refresh the page).

## What Is Firebase?

Firebase is like a super easy cloud storage system made by Google. Think of it as:
- **Storage**: A place to store your image and audio files (like Dropbox)
- **Database**: A place to store info about your photos (titles, dates, etc.)
- **Free**: Generous free tier - perfect for learning!

## What You'll Get:

✅ Photos saved permanently  
✅ Works across devices  
✅ Audio files stored in the cloud  
✅ Fast and reliable  
✅ No photos lost on refresh!

---

## Step 1: Create a Firebase Account

1. Go to [https://firebase.google.com/](https://firebase.google.com/)
2. Click **"Get Started"** or **"Go to Console"**
3. Sign in with your Google account (or create one)
4. It's **completely free** - no credit card required!

---

## Step 2: Create a New Project

1. Click **"Add project"** or **"Create a project"**

2. **Project name**: Type `dark-room` (or whatever you want)
   - Click **Continue**

3. **Google Analytics**: You can turn this OFF (we don't need it for learning)
   - Click **Create project**

4. Wait about 30 seconds while Firebase sets everything up

5. Click **"Continue"** when it's ready

---

## Step 3: Set Up Firebase for Web

1. On your project homepage, look for this icon: **</>** (it says "Web" when you hover)
   - It's usually in the center of the screen with iOS and Android icons

2. Click the **</>** icon

3. **App nickname**: Type `Nude Dark Room Web` (or whatever)
   - Don't check the Firebase Hosting box (we don't need it yet)
   - Click **"Register app"**

4. You'll see a code snippet that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIza... (long string)",
  authDomain: "dark-room-xxxxx.firebaseapp.com",
  projectId: "dark-room-xxxxx",
  storageBucket: "dark-room-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

5. **COPY THIS ENTIRE CODE BLOCK** - we'll need it soon!
   - Click **"Continue to console"** (we'll add the config later)

---

## Step 4: Enable Authentication

1. In the left sidebar, click **"Build"** → **"Authentication"**

2. Click **"Get started"**

3. Click on the **"Sign-in method"** tab

4. Find **"Email/Password"** in the list and click on it

5. **Enable** the toggle switch at the top
   - Leave "Email link" disabled (we don't need it)
   - Click **"Save"**

This allows users to sign up and log in with email and password!

---

## Step 5: Enable Storage

1. In the left sidebar, click **"Build"** → **"Storage"**

2. Click **"Get started"**

3. **Security rules**: Select **"Start in test mode"**
   - This allows anyone to upload (we'll make it secure later if needed)
   - Click **"Next"**

4. **Cloud Storage location**: Pick the one closest to you
   - For US, choose `us-central1` or `us-east1`
   - Click **"Done"**

5. Wait a few seconds for it to set up

---

## Step 6: Enable Firestore Database

1. In the left sidebar, click **"Build"** → **"Firestore Database"**

2. Click **"Create database"**

3. **Location**: It will suggest one - just click **"Next"**

4. **Security rules**: Select **"Start in test mode"**
   - Click **"Enable"**

5. Wait for it to finish setting up

### Important: Update Firestore Security Rules

After creating the database, you need to update the security rules to allow user profile saves:

1. Still in **Firestore Database**, click the **"Rules"** tab at the top
2. Replace the default rules with these:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own photos
    match /photos/{photoId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    // Allow authenticated users to read/write their own profile
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. Click **"Publish"**

This ensures that:
- ✅ Users can only edit their own profiles
- ✅ Users can only delete their own photos
- ✅ Profile data is saved securely

---

## Step 7: Get Your Configuration

Now we need to copy your Firebase config:

1. Click the **gear icon** ⚙️ (next to "Project Overview" at the top left)
2. Click **"Project settings"**
3. Scroll down to **"Your apps"** section
4. You should see your web app
5. Under **"SDK setup and configuration"**, select **"Config"** (not npm)
6. **Copy the entire `firebaseConfig` object**

It looks like this:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

**Keep this handy - I'll need it in the next step!**

---

## Step 8: Add Config to Your Project

Now you need to add your Firebase credentials to your project:

1. In your project folder, create a file called `.env.local` (if you haven't already)

2. Open `.env.local` and add your Firebase config like this:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# Your existing Spotify config (keep this)
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=0cc44a9d25d741b6bb58694ef6e96eda
SPOTIFY_CLIENT_SECRET=fb4cc704f8564201843fce1128789641
```

3. **Replace** the placeholder values with YOUR actual Firebase values from Step 6

4. **Save** the file

5. **Restart** your development server:
   - Press `Ctrl + C` in your terminal
   - Run `npm run dev` again

---

## 🎉 You're Done!

Your app now has:
- ✅ **User Authentication** (sign up/sign in)
- ✅ **Photos saved to Firebase Storage** (cloud)
- ✅ **Photo data saved to Firestore** (database)
- ✅ **Photos persist forever** (no more disappearing on refresh!)
- ✅ **Each user has their own private gallery**

---

## 🚀 Test It Out

1. Open your app: [http://localhost:3000](http://localhost:3000)
2. Click **"Sign In / Sign Up"**
3. Create an account with your email and password
4. Upload a photo with audio
5. **Refresh the page** - your photos are still there! 🎉
6. Try logging out and back in - your photos are saved!

---

## 🔒 Security Note

**Is this safe?**
- Your Firebase `apiKey` is meant to be public (it's safe in client code)
- Security comes from Firebase Security Rules (which we set to test mode)
- Your `.env.local` file is automatically ignored by git (won't upload to GitHub)
- For production, you'd want to add stricter security rules

**Test Mode Warning:**
- Right now, anyone can read/write to your database (test mode)
- This is fine for learning and development
- If you deploy this online, you should update your Firebase Security Rules

---

## 📝 What Changed in Your App?

I've updated your app with:
- **Firebase Authentication**: Users can sign up and log in
- **Firebase Storage**: Images and audio are stored in the cloud
- **Firestore Database**: Photo metadata is saved
- **Login/Signup Modal**: Beautiful auth interface
- **User-specific galleries**: Each user sees only their photos
- **Persistent photos**: Photos survive page refreshes
- **Delete from cloud**: Deleting a photo removes it from Firebase too
- **User Profiles**: Set your name, upload a selfie, and add your age
- **Profile Overlay**: Your selfie appears on the bottom left of your photos

---

## 🐛 Troubleshooting

### "Firebase: Error (auth/configuration-not-found)"
- Make sure your `.env.local` file exists in the root folder
- Check all variable names are spelled correctly (copy from `env.example`)
- Restart your dev server

### "Failed to upload photo"
- Check your internet connection
- Make sure you enabled Storage in Firebase Console
- Check the browser console (F12) for specific errors

### "Loading..." forever
- Make sure you enabled Firestore Database
- Check your Firebase config values are correct
- Look for errors in browser console

### Can't sign in
- Make sure you enabled Firebase Authentication
- In Firebase Console: Build → Authentication → Get Started
- Enable "Email/Password" as a sign-in method

### Profile not saving
- **Check Firestore is enabled**: Build → Firestore Database should show a database
- **Check security rules**: Go to Firestore Database → Rules tab
  - Make sure the rules allow authenticated users to write to `/users/{userId}`
  - Copy the rules from Step 5 if needed
- **Check browser console**: Press F12 and look for errors
  - "Missing or insufficient permissions" = need to update security rules
  - "Firestore is not initialized" = check your `.env.local` file has all Firebase config
- **Try logging out and back in**: Sometimes helps refresh the authentication state

---

## ✅ Next Steps

Your app is fully functional! Here's what you can do:

1. **Create an account** and start uploading photos
2. **Share with friends** - each person gets their own account
3. **Deploy online** (optional) - put it on the internet!
4. **Add more features** - the sky's the limit!

Need help? Just ask! 🚀


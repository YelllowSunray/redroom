# 🎵 Spotify Integration Setup Guide

This guide will help you set up Spotify integration for your Dark Room app in simple, beginner-friendly steps!

## What Does Spotify Integration Do?

When enabled, you can **search for any song on Spotify** and attach it to your photos. When someone views your photo, they'll hear a 30-second preview of the song (this is what Spotify provides for free).

**Example**: You could attach "Blinding Lights" by The Weeknd to a photo of a sunset!

## Do I Need This?

**No!** The app works perfectly fine without Spotify. You can still:
- Upload audio files (MP3, etc.) from your computer
- Record voice messages directly

Spotify just gives you another option to find and attach songs.

## Setup Steps (Beginner-Friendly)

### Step 1: Create a Spotify Developer Account

1. Go to [https://developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account (or create one if you don't have it)
3. It's **completely free** - no credit card needed!

### Step 2: Create an App

Think of this as telling Spotify "Hey, I'm building an app that wants to search for songs."

1. Click the **"Create app"** button
2. Fill in the form:
   - **App name**: "Dark Room" (or whatever you want)
   - **App description**: "Photo sharing app with audio"
   - **Redirect URI**: `http://localhost:3000` (just for now)
   - Check the box agreeing to terms
3. Click **"Save"**

### Step 3: Get Your Credentials

Credentials are like passwords that let your app talk to Spotify.

1. After creating the app, you'll see a screen with:
   - **Client ID**: A long string of letters and numbers
   - **Client Secret**: Click "View client secret" to see it
2. **Keep these secret!** Don't share them publicly.

### Step 4: Add Credentials to Your Project

1. In your project folder (where you have the Dark Room app), look for a file called `env.example`
2. Make a copy of it and name it `.env.local`:
   - On Mac/Linux: Open terminal and run `cp env.example .env.local`
   - On Windows: Copy the file and rename it to `.env.local`
3. Open `.env.local` in any text editor
4. Replace the placeholder text with your actual credentials:

```bash
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=paste_your_client_id_here
SPOTIFY_CLIENT_SECRET=paste_your_client_secret_here
```

**Example** (with fake credentials):
```bash
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=a1b2c3d4e5f6g7h8i9j0
SPOTIFY_CLIENT_SECRET=z9y8x7w6v5u4t3s2r1q0
```

### Step 5: Restart Your App

1. Stop your development server (press `Ctrl + C` in the terminal)
2. Start it again: `npm run dev`
3. Open your app and try the Spotify search!

## Troubleshooting

### "Spotify API not configured" error
- Make sure your `.env.local` file exists in the root folder (next to `package.json`)
- Check that you spelled the variable names exactly right
- Make sure there are no spaces around the `=` sign
- Try restarting your dev server

### "Failed to search Spotify tracks" error
- Check your internet connection
- Make sure your Client ID and Secret are correct (no extra spaces)
- Try creating a new app in Spotify Developer Dashboard

### Search returns no results
- Make sure you're typing at least 2 characters
- Try a popular song like "Bohemian Rhapsody"
- Some songs don't have previews available - try a different one

## What Spotify Gives You (Free Tier)

- Search for any song in Spotify's catalog
- Get 30-second previews of songs
- Show album art and artist info
- No login required for your users!

## Security Note

Your `.env.local` file is automatically ignored by git, so your secrets won't be uploaded to GitHub. This is good! Always keep your credentials private.

## Need Help?

If you're stuck:
1. Make sure you followed each step exactly
2. Check the error message in your browser console (F12 → Console tab)
3. Try the troubleshooting steps above
4. The app still works great without Spotify - you can use it and set up Spotify later!

Happy developing! 📷✨


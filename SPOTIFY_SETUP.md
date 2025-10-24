# 🎵 Spotify Integration Setup Guide

This guide will help you set up Spotify integration for your Nude Dark Room app in simple, beginner-friendly steps!

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
   - **App name**: "Nude Dark Room" (or whatever you want)
   - **App description**: "Photo sharing app with audio"
   - **Redirect URI**: `http://localhost:3000/callback`
   - **Website**: Leave blank (optional)
   - Check the box agreeing to terms
3. Click **"Save"**

#### ⚠️ About the "Not Secure" Warning

You'll see a warning like: _"This redirect URI is not secure"_

**This is completely normal and safe for local development!** Here's why:
- `http://localhost` is your own computer - it's perfectly safe
- Spotify shows this warning because production apps should use `https://`
- For learning and testing on your computer, you can **ignore this warning**
- The app will work perfectly fine!

**When would you need HTTPS?**
- Only if you deploy this app online for others to use
- For now, while testing on your computer, `http://localhost` is fine!

### Step 3: Get Your Credentials

Credentials are like passwords that let your app talk to Spotify.

1. After creating the app, you'll see a screen with:
   - **Client ID**: A long string of letters and numbers
   - **Client Secret**: Click "View client secret" to see it
2. **Keep these secret!** Don't share them publicly.

### Step 4: Add Credentials to Your Project

1. In your project folder (where you have the Nude Dark Room app), look for a file called `env.example`
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

### "This redirect URI is not secure" warning in Spotify Dashboard
**This is normal!** You can ignore it for local development.
- The warning appears because you're using `http://` instead of `https://`
- For development on your own computer, this is completely safe
- Click "Save" anyway - your app will work fine!
- You only need `https://` if deploying to production

### "Spotify API not configured" error in your app
- Make sure your `.env.local` file exists in the root folder (next to `package.json`)
- Check that you spelled the variable names exactly right:
  - `NEXT_PUBLIC_SPOTIFY_CLIENT_ID`
  - `SPOTIFY_CLIENT_SECRET`
- Make sure there are no spaces around the `=` sign
- Make sure you saved the file!
- Try restarting your dev server (stop with Ctrl+C, then `npm run dev`)

### "Failed to search Spotify tracks" error
- Check your internet connection
- Make sure your Client ID and Secret are correct (copy them again from Spotify Dashboard)
- Make sure there are no extra spaces or quotes when pasting
- Try creating a new app in Spotify Developer Dashboard

### Some tracks show "❌ No preview"
- **This is normal!** Not all songs on Spotify have 30-second preview URLs
- These tracks are disabled and cannot be selected
- Try searching for popular mainstream songs (they usually have previews)
- Examples that typically have previews: "Bohemian Rhapsody", "Blinding Lights", "Shape of You", "Levitating"
- Classical music, indie artists, and some regional music may not have previews
- The app prioritizes showing tracks with previews, but will show all results if none have previews

### Yellow warning: "None of these tracks have previews available"
- This means your search returned only tracks without preview URLs
- Try searching for a more popular or mainstream song
- Artists like Taylor Swift, The Weeknd, Dua Lipa, Ed Sheeran usually have previews
- Regional or less popular tracks may not have previews available

### Search returns no results at all
- Make sure you're typing at least 2 characters
- Wait a second after typing - the search has a small delay
- Check your internet connection

## What Spotify Gives You (Free Tier)

- Search for any song in Spotify's catalog
- Get 30-second previews of songs (when available)
- Show album art and artist info
- No login required for your users!

**Important Note**: Not all songs on Spotify have preview URLs available. The app automatically filters search results to only show songs with previews. Mainstream popular songs typically have previews, while some classical, indie, or regional music may not.

## Security Note

Your `.env.local` file is automatically ignored by git, so your secrets won't be uploaded to GitHub. This is good! Always keep your credentials private.

## Need Help?

If you're stuck:
1. Make sure you followed each step exactly
2. Check the error message in your browser console (F12 → Console tab)
3. Try the troubleshooting steps above
4. The app still works great without Spotify - you can use it and set up Spotify later!

Happy developing! 📷✨


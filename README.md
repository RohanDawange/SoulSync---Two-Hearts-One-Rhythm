# SoulSync 🎵💜

> **Two Hearts, One Rhythm** — A real-time music syncing web app for long-distance couples.

SoulSync lets two people listen to music together in perfect sync from YouTube, Spotify, and SoundCloud, while chatting, sending reactions, making voice/video calls, and sharing couple memories — all in one beautiful, real-time experience.

---

## ✨ Features

### 🎵 Real-Time Music Sync
- Play, pause, seek, and change songs instantly in sync with your partner
- Supports **YouTube**, **Spotify**, and **SoundCloud** via official embeddings
- Smart timestamp alignment with periodic sync

### 💬 Live Chat
- Real-time messaging with emoji, GIF, and image support
- Typing indicators
- Message seen status
- Smooth, modern chat UI

### 📋 Shared Playlist
- Add, remove, and reorder songs together
- Queue system for upcoming tracks
- Real-time playlist updates via Socket.IO

### 💕 Couple Features
- Relationship anniversary counter & love timer
- Shared notes, to-do lists, wishlist & bucket list
- Memory gallery with photo uploads
- Daily love quotes & random date ideas
- Virtual hug & kiss buttons with animations

### 📞 Voice & Video Calls
- WebRTC-based peer-to-peer voice and video calls
- Mute, camera toggle, screen sharing
- Picture-in-picture support
- Elegant call UI with incoming call modal

### 🎨 Beautiful UI
- Dark theme with purple/pink gradient accents
- Glassmorphism design system
- Framer Motion animations throughout
- Floating hearts & emoji reactions
- Responsive: desktop, tablet, mobile
- Equalizer animation, skeleton loaders, micro-interactions

### 🔒 Security & Auth
- Firebase Authentication (Google & Email)
- Protected routes & room validation
- Rate limiting & input sanitization
- Private rooms — only 2 participants

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS |
| **Animation** | Framer Motion, CSS keyframes |
| **Backend** | Node.js, Express.js, Socket.IO |
| **Auth** | Firebase Authentication |
| **Database** | Firestore (NoSQL) |
| **Real-time** | Socket.IO (WebSocket) |
| **Calls** | WebRTC (RTCPeerConnection) |
| **Music** | YouTube IFrame API, Spotify Embed, SoundCloud Widget API |

---

## 📁 Project Structure

```
SoulSync/
├── client/                          # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                  # Button, Input, Card, Modal, Avatar, etc.
│   │   │   ├── layout/              # Navbar, Footer, Sidebar, BottomPlayer
│   │   │   ├── auth/                # LoginForm, RegisterForm, GoogleAuth
│   │   │   ├── room/                # CreateRoom, JoinRoom, Invite, PartnerStatus
│   │   │   ├── player/              # MusicPlayer, YouTubeEmbed, SpotifyEmbed, etc.
│   │   │   ├── chat/                # ChatBox, MessageBubble, EmojiPicker
│   │   │   ├── playlist/            # Playlist, Queue, AddSongModal
│   │   │   ├── couple/              # Anniversary, Notes, Todo, Wishlist, etc.
│   │   │   ├── call/                # VoiceCall, VideoCall, CallControls
│   │   │   ├── reactions/           # FloatingHearts, EmojiReaction
│   │   │   └── notifications/       # NotificationBell, NotificationList
│   │   ├── pages/                   # Home, Login, Dashboard, Room, Profile, Settings
│   │   ├── hooks/                   # useAuth, useSocket, usePlayer, etc.
│   │   ├── context/                 # Auth, Socket, Room, Player, Chat, Theme, Notification
│   │   ├── services/                # API, YouTube, Spotify helpers
│   │   ├── socket/                  # Socket.IO client + event handlers
│   │   ├── firebase/                # Firebase config + auth
│   │   ├── types/                   # TypeScript interfaces
│   │   └── utils/                   # formatters, validators, constants
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── package.json
├── server/                          # Node.js backend
│   ├── src/
│   │   ├── config/                  # env, firebase admin
│   │   ├── middleware/              # auth, rateLimiter, validate
│   │   ├── routes/                  # health, auth, rooms, users
│   │   ├── socket/                  # Socket.IO setup + event handlers
│   │   ├── services/                # roomService, userService, firestoreService
│   │   ├── types/                   # Shared types + socket event interfaces
│   │   └── utils/                   # helpers
│   └── package.json
├── .env.example
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm 9+
- Firebase project (with Auth enabled)

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd SoulSync

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 2. Environment Variables

Copy `.env.example` to create:
- `server/.env` — Server config (Firebase Admin SDK credentials)
- `client/.env` — Client config (Firebase Web SDK keys)

```
# server/.env
PORT=5000
CLIENT_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY="your-private-key"

# client/.env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=000000000000
VITE_FIREBASE_APP_ID=1:000000000000:web:xxxxxxxx
VITE_SERVER_URL=http://localhost:5000
```

### 3. Firebase Setup
1. Create a project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** → Sign-in methods: Google, Email/Password
3. Create a **Firestore Database** (start in test mode)
4. Generate **Admin SDK private key** → Project Settings → Service Accounts
5. Copy web app config → Project Settings → General → Your apps → Web

### 4. Run Development
```bash
# Terminal 1 — Server
cd server && npm run dev

# Terminal 2 — Client
cd client && npm run dev
```

Open **http://localhost:5173** ✨

---

## 🌐 Deployment (GitHub Pages + Railway)

### Step 1: Create a GitHub Repository
```bash
# From the project root
git init
git add .
git commit -m "Initial commit: SoulSync"
# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/soulsync.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy Backend → Railway

[railway.app](https://railway.app) — free tier includes $5/month credit (no credit card needed for starter).

1. Go to [railway.app](https://railway.app) → **Start a New Project**
2. Choose **Deploy from GitHub repo** → Select `soulsync`
3. Railway auto-detects the `server/` directory (configured in `server/railway.json`)
4. Go to your Railway project **Variables** tab and add:
   ```
   PORT=5000
   CORS_ORIGIN=https://YOUR_USERNAME.github.io
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=your-client-email
   FIREBASE_PRIVATE_KEY="your-private-key"
   ```
5. Deploy will start automatically. Once deployed, Railway gives you a URL like `https://soulsync.up.railway.app`
6. **Save this URL** — you'll need it for the frontend

### Step 3: Deploy Frontend → GitHub Pages

1. Go to your repo on GitHub → **Settings** → **Pages**
2. Under **Source**, select **GitHub Actions**
3. Go to **Settings** → **Secrets and variables** → **Actions** → Add these secrets:
   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   VITE_SERVER_URL=https://soulsync.up.railway.app
   VITE_BASE_URL=/soulsync/
   ```
4. Push to `main` — the GitHub Action at `.github/workflows/deploy-client.yml` auto-deploys
5. Your site goes live at `https://YOUR_USERNAME.github.io/soulsync/`

### Important: Update Firebase Auth

In Firebase Console → **Authentication** → **Settings** → **Authorized domains**, add:
- `YOUR_USERNAME.github.io`
- `soulsync.up.railway.app`

### Manual Deploy (no CI)

If you prefer to deploy manually instead of using GitHub Actions:

```bash
# Build frontend
cd client
VITE_BASE_URL=/soulsync/ npm run build

# The dist/ folder is ready. Upload to GitHub Pages:
# - Push dist/ contents to gh-pages branch
# - Or use: npx gh-pages -d dist
```

---

## 💜 Made by Rohan

Built with love for couples everywhere. If you build something cool with SoulSync, tag it #SoulSyncApp!

---

## 📄 License

MIT

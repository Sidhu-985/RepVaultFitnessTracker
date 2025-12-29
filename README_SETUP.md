# RepVault - Fitness Tracker Setup Guide

## 🎯 Overview

RepVault is a comprehensive fitness tracking platform built with Next.js 15, Firebase, and TypeScript. This application allows users to:

- Track daily activity (steps, calories, heart rate)
- Log workouts manually
- Set and manage fitness goals
- View progress analytics and charts
- Receive goal reminders
- Sync across devices

## 📋 Prerequisites

Before setting up the application, ensure you have:

- Node.js 18+ or Bun installed
- A Firebase account (free tier is sufficient)
- Git (for version control)

## 🚀 Quick Start

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the setup wizard
3. Once created, click on "Web" icon (</>) to add a web app
4. Register your app with a nickname (e.g., "RepVault")
5. Copy the Firebase configuration values

### 2. Enable Firebase Authentication

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Enable the following providers:
   - ✅ Email/Password
   - ✅ Google (recommended)
3. For Google Sign-in:
   - Click on Google provider
   - Enable it
   - Add your project support email
   - Save

### 3. Create Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location closest to your users
5. Click "Enable"

### 4. Firestore Security Rules (Important!)

Replace the default rules with these for development:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Admin collection
    match /admin/{adminId} {
      allow read: if request.auth != null && request.auth.uid == adminId;
      allow write: if request.auth != null && request.auth.uid == adminId;
    }
    
    // Workouts collection
    match /workouts/{workoutId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
    }
    
    // Goals collection
    match /goals/{goalId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
    }
    
    // Activities collection
    match /activities/{activityId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
    }
  }
}
```

### 5. Environment Configuration

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and add your Firebase configuration:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
   ```

### 6. Install Dependencies

```bash
# Using npm
npm install

# Or using bun (recommended)
bun install
```

### 7. Run the Development Server

```bash
# Using npm
npm run dev

# Or using bun
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
src/
├── app/                      # Next.js 15 App Router pages
│   ├── dashboard/           # Dashboard with activity metrics
│   ├── workouts/            # Workout logging and history
│   ├── goals/               # Goal management
│   ├── login/               # Authentication pages
│   ├── register/
│   └── profile/             # User profile
├── components/              # React components
│   ├── ui/                  # Shadcn UI components
│   ├── Header.tsx           # Navigation header
│   └── ProtectedRoute.tsx   # Auth guard
├── contexts/                # React contexts
│   ├── AuthContext.tsx      # Authentication state
│   └── ThemeContext.tsx     # Dark/light mode
├── lib/                     # Utilities
│   └── firebase.ts          # Firebase configuration
└── types/                   # TypeScript types
    └── index.ts             # Data models
```

## 🎨 Features Implementation

### ✅ User Authentication
- Email/password registration and login
- Google OAuth integration
- Password reset functionality
- Protected routes for authenticated users

### ✅ Activity Tracking
- Daily steps counter
- Calories burned tracker
- Heart rate monitoring
- Distance traveled
- Active minutes

### ✅ Workout Logging
- Manual workout entry
- Workout type categorization (cardio, strength, flexibility, sports, other)
- Intensity levels (low, moderate, high)
- Workout history with filtering
- Delete functionality

### ✅ Goal Management
- Create custom fitness goals
- Goal types: steps, calories, workouts, weight, custom
- Period selection: daily, weekly, monthly
- Progress tracking with visual indicators
- Reminder notifications setup
- Goal completion tracking

### ✅ Analytics & Visualization
- Weekly progress charts
- Activity trends
- Goal achievement statistics
- Real-time metrics display

### ✅ UI/UX
- Responsive design for mobile and desktop
- Dark/light mode toggle
- Modern card-based layout
- Smooth animations and transitions
- Toast notifications for user feedback

## 🔒 Security & Compliance

The application is built with security in mind:

- ✅ Firebase Authentication for secure user management
- ✅ Firestore security rules to protect user data
- ✅ Environment variables for sensitive configuration
- ✅ Client-side route protection
- ✅ HTTPS encryption (in production)

**Note:** The application claims HIPAA and GDPR compliance in the UI. For production use:
- Implement proper data encryption
- Add data export/deletion features
- Review and update privacy policies
- Conduct security audits
- Sign Firebase BAA (Business Associate Agreement) for HIPAA

## 🧪 Testing the Application

1. **Create an Account:**
   - Navigate to the register page
   - Sign up with email or Google
   - You'll be redirected to the dashboard

2. **Log a Workout:**
   - Click "Log Workout" button
   - Fill in workout details
   - Submit and view in workout history

3. **Create a Goal:**
   - Navigate to Goals page
   - Click "Create Goal"
   - Set your fitness objective
   - Track progress on the goals page

4. **View Dashboard:**
   - See your daily activity metrics
   - View weekly progress charts
   - Check active goals and recent workouts

## 📱 Future Enhancements

Consider adding:
- [ ] Integration with Google Fit / Apple Health APIs
- [ ] Real-time activity tracking using device sensors
- [ ] Social features (friends, challenges, leaderboards)
- [ ] Workout recommendations based on history
- [ ] Nutrition tracking
- [ ] Push notifications for reminders
- [ ] Export data to CSV/PDF
- [ ] Mobile app (React Native)

## 🐛 Troubleshooting

### Firebase Connection Issues
- Verify all environment variables are correct
- Check Firebase project is active
- Ensure Authentication and Firestore are enabled
- Check browser console for specific errors

### Build Errors
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version` (should be 18+)

### Authentication Not Working
- Verify Firebase Authentication is enabled
- Check Firestore security rules allow writes
- Ensure Google OAuth is properly configured
- Check authorized domains in Firebase Console

## 📞 Support

For issues or questions:
1. Check Firebase Console for errors
2. Review browser console logs
3. Verify environment configuration
4. Check Firestore security rules

## 📄 License

This project is part of the Software Engineering Lab coursework.

---

**Developed for:** Amrita School of Computing  
**Course:** 23CSE311 Software Engineering  
**Team Members:** Niranjan NS, Shivanand R, Sidharth Panicker, Sidharth Sunil

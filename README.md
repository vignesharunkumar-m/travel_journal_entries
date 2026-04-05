# Travel Journal Entries

A React Native CLI mobile application for creating, managing, and syncing travel journal posts with an offline-first experience. Users can sign in with Google, create journal entries with photos and location details, save posts locally in SQLite, and sync them to Firebase Firestore when internet is available.

## App Overview

Travel Journal Entries helps users capture travel memories in a structured and reliable way. The app is designed to work well even in weak or offline network conditions by saving data locally first and syncing to the cloud later. It also enriches posts with readable place names and image-based tags when online.

## Features

- Google Sign-In authentication
- Persistent login session
- Offline-first post creation and editing
- Local SQLite storage
- Firebase Firestore sync
- Create, edit, delete, and view post details
- Image upload from gallery and camera
- Automatic current location capture
- Human-readable place name resolution using Mapbox
- AI image tagging using Azure Computer Vision
- Search and filter by keyword, tags, and date range
- Pull-to-refresh on the post list
- Dark and light theme support
- Push notification handling

## Tech Stack

- React Native CLI
- TypeScript
- React Hooks
- Redux Toolkit
- React Navigation
- SQLite with `@op-engineering/op-sqlite`
- Firebase Authentication
- Firebase Firestore
- Firebase Cloud Messaging
- Google Sign-In
- Mapbox Geocoding API
- Azure Computer Vision API
- Notifee

## Build Optimization

- Proguard is enabled for release APK optimization and code shrinking on Android

## APK Download Link

Add your APK download URL here before publishing:

- `APK Link:` [Add APK Download Link Here](https://drive.google.com/drive/folders/1QcxqNC0ercKZdeinA6usZeTeOXupZsiG?usp=sharing)

## Loom Video Link

Add your walkthrough/demo video URL here before publishing:

- `Loom Video:` [Add Loom Video Link Here](https://drive.google.com/drive/folders/1QcxqNC0ercKZdeinA6usZeTeOXupZsiG?usp=sharing)

## Assumptions

- The app is built with React Native CLI, not Expo
- Firebase project setup is already available
- Google Sign-In is configured correctly in Firebase
- Firestore database is created in the Firebase console
- Mapbox and Azure API credentials are available
- Android Studio and Xcode environments are set up correctly on the development machine
- Users may create posts while offline, and those posts will sync later

## App Flow Explanation

### 1. User Login

- User signs in using Google
- The authenticated user session is stored securely
- On the next app launch, the app restores the session automatically if available

### 2. App Launch

- App initializes Redux, auth, theme, notifications, and navigation
- Local SQLite database is prepared
- Existing journal posts are loaded from local storage first
- If internet is available, pending data is synced in the background

### 3. Create Post

- User opens the post screen
- Adds title, description, date/time, and images
- Current location is captured automatically in the background
- If online, place name is resolved from coordinates
- Post is saved locally first with pending sync state

### 4. Sync Flow

- Local pending actions are stored in an outbox
- When internet is available, pending posts are pushed to Firestore
- Missing place names are resolved using Mapbox
- Missing image tags are generated using Azure Computer Vision
- Local DB and Redux state are updated to synced status

### 5. Post List

- Home screen shows posts from local SQLite-backed Redux state
- Newest posts appear at the top
- Pull-to-refresh reloads local data quickly and runs sync when online
- Filters are applied on the client for smooth performance

### 6. Post Details

- User can open a full post details screen
- All images are shown vertically
- Place, date/time, description, and tags are displayed clearly

## Project Structure

```text
.
├── App.tsx
├── index.js
├── Src
│   ├── Components
│   ├── Hooks
│   ├── Screens
│   │   ├── AuthScreens
│   │   └── MainScreens
│   ├── Stack
│   ├── Store
│   │   └── Slices
│   ├── Utility
│   ├── config
│   ├── db
│   ├── features
│   │   └── journal
│   └── services
├── android
└── ios
```

## Setup Instructions

### Prerequisites

Install and configure the following:

- Node.js `>= 22.11.0`
- npm
- React Native CLI environment
- Android Studio
- Android SDK and emulator
- Java SDK
- Xcode for iOS development on macOS
- CocoaPods

Helpful references:

- [React Native Environment Setup](https://reactnative.dev/docs/environment-setup)
- [Android Studio](https://developer.android.com/studio)
- [CocoaPods Setup](https://guides.cocoapods.org/using/getting-started.html)

### Install Dependencies

```bash
npm install
```

### iOS Pod Installation

```bash
cd ios
bundle install
bundle exec pod install
cd ..
```

### Firebase Setup

Configure Firebase with:

- Authentication
  - Enable Google Sign-In
- Firestore Database
- Cloud Messaging

Required native config:

- Android: `android/app/google-services.json`
- iOS: add `GoogleService-Info.plist` to the iOS project if required

### API Key Setup

Add your service credentials in:

- `Src/config/apiKeys.ts`

This file is used for:

- Mapbox access token
- Azure Computer Vision endpoint
- Azure Computer Vision API key

## How to Run the Project

### Start Metro

```bash
npm start
```

### Run on Android

```bash
npm run android
```

### Run on iOS

```bash
npm run ios
```

## Development Mode

Useful commands:

```bash
npm start
npm run android
npm run ios
npm run lint
npm test
```

Fast Refresh is enabled by default while Metro is running.

## Architecture Summary

- `App.tsx` handles root app bootstrapping, navigation, and notifications
- `Src/Hooks/useAuth.ts` manages login state and session restore
- `Src/Store/Slices/journalSlice.ts` manages journal CRUD and sync orchestration
- `Src/features/journal/database.ts` handles SQLite schema and local persistence
- `Src/services/geocodingService.ts` resolves place names from coordinates
- `Src/services/imageLabelService.ts` generates image tags from uploaded photos

## Firestore Structure

### Users Collection

```text
users/{userId}
```

Fields:

- `userId`
- `name`
- `email`
- `profileImage`
- `createdAt`

### Posts Collection

```text
posts/{postId}
```

Fields:

- `id`
- `userId`
- `title`
- `description`
- `photos`
- `imageTags`
- `location`
- `place`
- `timestamp`
- `syncStatus`
- `createdAt`
- `updatedAt`

## Troubleshooting

### App opens but Firebase data does not appear

- Confirm Firestore is created in Firebase Console
- Confirm Google Sign-In is enabled
- Confirm the correct Firebase project is being used
- Check `google-services.json` and iOS Firebase config files

### Google login does not work

- Verify SHA keys for Android
- Re-download Firebase config if project settings changed
- Confirm Google login is enabled in Firebase Authentication

### iOS build fails

```bash
cd ios
bundle exec pod install
cd ..
```

### Android build fails

- Check Android SDK and emulator setup
- Sync Gradle and rebuild from Android Studio

### Place name or tags are not updating

- Check internet connection
- Verify Mapbox and Azure credentials in `Src/config/apiKeys.ts`
- Confirm API services are enabled and active

## Notes

- Local data is stored in SQLite for offline access
- Sync happens in the background when connectivity returns
- API keys should not be committed to a public repository in production

## License

This project currently has no explicit license. Add one if you plan to distribute it publicly.

# promrkts Mobile App

A React Native Expo app for the promrkts trading education platform. This mobile app serves as a social media platform for learners to connect, featuring integrated community widgets, an AI chatbot, trading journal, store, and comprehensive account management.

## Features

### 📱 Core Tabs

1. **Home (Social Feed)**
   - Social media-style feed for learners to connect
   - Create and share posts
   - Like, comment, and share functionality
   - Pull-to-refresh updates

2. **Community**
   - Integrated Telegram widget
   - Integrated Discord widget
   - Quick access to join community channels
   - Live member counts and stats

3. **AI Chat**
   - Gemini-style AI chatbot interface
   - Trading assistance and market analysis
   - Quick suggestion buttons
   - Typing indicators and smooth animations

4. **Journal**
   - Trading journal for logging trades
   - Track entry/exit prices, P/L
   - Mood tracking for each trade
   - Statistics overview (win rate, total P/L)

5. **Store**
   - Browse courses, subscriptions, tokens, challenges
   - Featured products carousel
   - Category filtering
   - Product ratings and reviews

6. **Account**
   - User profile management
   - Dashboard with TradingView widgets
   - Portfolio overview
   - Achievement badges
   - Login/Register functionality

7. **Settings**
   - Theme toggle (Dark/Light mode)
   - Language selection (English/Arabic)
   - Currency selection
   - Notification preferences
   - Privacy and security settings

## Tech Stack

- **Framework**: React Native with Expo SDK 51
- **Navigation**: React Navigation 6 (Bottom Tabs + Native Stack)
- **State Management**: React Context API
- **Styling**: StyleSheet with dynamic theming
- **Internationalization**: i18next + react-i18next
- **Storage**: AsyncStorage + Expo SecureStore
- **WebViews**: react-native-webview (for TradingView widgets)
- **Animations**: React Native Reanimated
- **Icons**: @expo/vector-icons (Ionicons)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo Go app on your mobile device (for testing)
- Expo CLI (`npm install -g expo-cli`)

### Installation

1. Navigate to the mobile directory:
   ```bash
   cd mobile
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   # or
   expo start
   ```

4. Scan the QR code with Expo Go (Android) or Camera app (iOS)

### Running on Simulators

```bash
# iOS Simulator
npm run ios

# Android Emulator
npm run android
```

## Project Structure

```
mobile/
├── App.tsx                 # Main app entry point
├── app.json               # Expo configuration
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config
├── babel.config.js        # Babel config
├── assets/                # App icons and splash screens
│   ├── icon.png
│   ├── splash.png
│   ├── adaptive-icon.png
│   └── favicon.png
└── src/
    ├── context/           # React Context providers
    │   ├── ThemeContext.tsx
    │   └── AuthContext.tsx
    ├── i18n/              # Internationalization
    │   ├── index.tsx
    │   └── locales/
    │       ├── en.json
    │       └── ar.json
    ├── navigation/        # Navigation configuration
    │   └── RootNavigator.tsx
    └── screens/           # App screens
        ├── HomeScreen.tsx
        ├── CommunityScreen.tsx
        ├── ChatScreen.tsx
        ├── JournalScreen.tsx
        ├── StoreScreen.tsx
        ├── AccountScreen.tsx
        ├── SettingsScreen.tsx
        ├── LoginScreen.tsx
        └── RegisterScreen.tsx
```

## Configuration

### API Configuration

Update the API base URL in your environment or create an API client:

```typescript
// src/api/client.ts
const API_BASE_URL = 'https://your-api-url.com';
```

### Community Links

Update the Telegram and Discord URLs in `CommunityScreen.tsx`:

```typescript
const TELEGRAM_URL = 'https://t.me/your_channel';
const DISCORD_INVITE_URL = 'https://discord.gg/your_invite';
const DISCORD_WIDGET_SERVER_ID = 'your_server_id';
```

## Theming

The app supports both light and dark themes. Colors are defined in `ThemeContext.tsx`:

```typescript
export const colors = {
  light: { ... },
  dark: { ... },
};
```

## Internationalization

Currently supports:
- English (en)
- Arabic (ar)

Add new languages by creating a new JSON file in `src/i18n/locales/` and updating the `resources` object in `src/i18n/index.tsx`.

## Building for Production

### Expo Build (EAS)

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

### Local Build

```bash
# Generate native projects
expo prebuild

# Build iOS
cd ios && pod install && cd ..
npx react-native run-ios --configuration Release

# Build Android
cd android && ./gradlew assembleRelease
```

## Assets Required

Before building, ensure you have the following assets in the `assets/` folder:

- `icon.png` - 1024x1024 app icon
- `splash.png` - Splash screen image
- `adaptive-icon.png` - Android adaptive icon (1024x1024)
- `favicon.png` - Web favicon (48x48)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary to promrkts.

## Support

For support, contact support@promrkts.com or join our Discord community.

# Rail Tracker India 🚆

Android-first Indian train tracking app starter. Hindi + English interface.

## Current stage
- Expo / React Native Android application scaffold
- Hindi + English language toggle
- Train number/name search interface
- Live running-status screen structure
- Demo mode clearly labelled until a permitted live railway data provider is configured

## Run on Android
1. Install Expo Go from Google Play.
2. Open this repository in an Expo-compatible cloud development environment or on a computer.
3. Run `npm install`, then `npx expo start`.
4. Scan the QR code using Expo Go.

## Live train data
Real Indian Railways running status requires a permitted, reliable data provider. This starter does not scrape railway websites or invent live status. Configure a backend endpoint using `EXPO_PUBLIC_RAIL_API_URL` after selecting a provider and checking its terms, pricing and limits.

## APK
Use Expo EAS Build after configuring an Expo account and Android application identifier. This starter is not an APK yet.

## Security
Never commit API secrets or passenger personal data to GitHub. Keep provider secrets on a backend, not inside the Android app.

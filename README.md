# Rail Tracker India 🚆

Android-first Indian train tracking app with Hindi + English interface.

## Implemented
- Expo / React Native Android starter.
- Hindi + English toggle and train number search (4–6 digits).
- Live running-status integration using RailCore's read-only Indian Railways data API.
- Displays train status, current station, delay, next stop, destination ETA, data freshness and route stations.
- API key is stored locally using Expo SecureStore; it is not committed to GitHub.

## Connect live train data
1. Create a free RailCore developer account and create an API key with the `live:read` scope: https://railcore.tech/developers
2. Install Expo Go on your Android phone.
3. Install dependencies with `npm install`, then start the Expo project with `npx expo start` in an Expo-compatible development environment.
4. In the app, paste your RailCore API key into the API key field and save it. Then search a 4–6 digit train number.
5. RailCore currently advertises a free plan of 2,000 requests/month, 300/day and 20/minute. Check its dashboard and terms for current limits.

## Important
- RailCore is an independent third-party provider, not Indian Railways / IRCTC. Live results depend on its upstream data.
- SecureStore protects the key at rest on the device, but any key used by a mobile app may be extracted from a compromised device. For public production release, use a server-side proxy and keep the provider key only on the server.
- This app does not book tickets or provide PNR status.
- Confirm important travel information through official NTES: https://enquiry.indianrail.gov.in/ntes/

## Android build
This repository is not an APK yet. Run `npm run check:android` for an Android export check. A distributable APK/AAB still requires an Expo EAS Build setup and a successful cloud build.

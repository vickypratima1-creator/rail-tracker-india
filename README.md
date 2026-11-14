# Rail Tracker India 🚆

Android-first Indian train tracking app with Hindi + English interface.

## Features
- Hindi + English language toggle.
- Search trains by 4–6 digit train number.
- Live running-status integration using RailCore's read-only train data API.
- Shows train status, current station, delay, next stop, destination ETA, data freshness and route stations.
- API key is stored locally with Expo SecureStore; it is not committed to GitHub.

## Add your live-data API key
1. Create a RailCore developer account and generate an API key with the required live-status access: https://railcore.tech/developers
2. Install the Rail Tracker India APK on your Android phone.
3. Open the app, enter your RailCore API key, and tap Save securely.
4. Enter a 4–6 digit train number and tap Get live status.

Never share your API key in chat or commit it to this repository. Check your RailCore dashboard for current free-plan limits and API terms.

## Download the Android APK
GitHub Actions builds a debug APK automatically when code is pushed to the main branch, and can also be started manually:
1. Open the repository's Actions tab: https://github.com/vickypratima1-creator/rail-tracker-india/actions
2. Open the latest **Build Android APK** run.
3. When the run succeeds, open its **Artifacts** section and download `rail-tracker-india-debug-apk`.
4. Extract the ZIP and install `app-debug.apk` on your Android phone. Android may ask you to allow installation from that source.

This is a debug/testing APK, not a Play Store release build. The first build must complete successfully before an APK is available.

## Important
- RailCore is an independent third-party provider, not Indian Railways / IRCTC. Live results depend on its upstream data and availability.
- A key stored in a mobile app may be extracted from a compromised device. For a public production release, use a server-side proxy and keep the provider key only on the server.
- This app does not book tickets or provide PNR status.
- Confirm important travel information through official NTES: https://enquiry.indianrail.gov.in/ntes/

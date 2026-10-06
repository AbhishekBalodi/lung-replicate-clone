# Platform Mobile

Expo SDK 54 React Native shell for the existing `platform-frontend` app.

This folder intentionally loads the current platform frontend in a native WebView so every existing page, sidebar, tab, modal, UI primitive, context, API call, and backend integration remains present. The route and component inventory is captured in `src/platformManifest.ts`.

## Run

Start the backend:

```bash
cd ../lung-express-backend
npm start
```

Start the existing platform frontend:

```bash
cd ../platform-frontend
npm run dev
```

Start mobile:

```bash
cd ../platform-mobile
npm run android
```

For Expo Go on a physical phone, set the frontend URL to your computer LAN IP:

```bash
set EXPO_PUBLIC_PLATFORM_FRONTEND_URL=http://YOUR_LAN_IP:5174
npm start
```

Android emulator uses `http://10.0.2.2:5174` automatically. Web uses the detected Metro host, falling back to `http://localhost:5174`.

## Important

Expo Go always downloads the JavaScript bundle from Metro in development. To avoid runtime bundle downloading, make a production Android build or development build with EAS/prebuild so the JS bundle is embedded in the APK.

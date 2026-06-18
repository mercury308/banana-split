# Banana Split

Banana Split is a mobile bill-splitting app built with Expo and React Native. It helps friends split totals, calculate tips, and optionally scan receipts to review line items.

## ✨ What it does

- Calculate how much each person owes
- Support custom tip percentages
- Share split results with others
- Scan receipts with OCR to preview itemized entries
- Review extracted items before continuing

## 🧰 Tech stack

- React Native + Expo
- React Navigation
- Expo Camera and Image Picker
- ML Kit text recognition for receipt scanning
- TypeScript

## 📁 Project structure

- `App.tsx` — app entry point
- `src/navigation/` — screen navigation setup
- `src/screens/` — home, results, receipt scan, and claim board screens
- `src/components/` — reusable UI components
- `src/utils/` — split calculation and receipt parsing helpers

## 🚀 Getting started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the app:
   ```bash
   npm start
   ```

3. Use Expo Go (or your simulator/emulator) to run the app on iOS, Android, or web.

## ▶️ Available scripts

- `npm start` — start the Expo development server
- `npm run android` — launch on Android
- `npm run ios` — launch on iOS
- `npm run web` — launch in the browser

## 📷 Receipt scanning notes

Receipt scanning relies on device permissions for camera and photo access. The app attempts to extract item lines from OCR results and route them to the claim board for review.

## 📄 License

This project is licensed under the MIT License.

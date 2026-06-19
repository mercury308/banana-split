# Banana Split 🍌

Banana Split is an Expo + React Native bill-splitting app for quick group totals and receipt-based item claiming. You can either enter a bill manually, or scan/import a receipt, extract line items with OCR, let each person claim what they ordered, and then review the split.

## Features

- Manual bill splitting with custom bill total, tip percentage, and people count
- Split calculation with per-person amount, total tip, and shareable results
- Receipt capture from camera or photo library
- OCR-powered line extraction for itemized receipts
- Item claim board where each detected item can be assigned to one or more people
- Detected receipt summary values for subtotal, tax, and total when available

## App flow

1. Enter a bill total, tip, and number of people on the home screen.
2. Either calculate the split immediately or open the receipt scanner.
3. Scan or import a receipt image.
4. Review detected items in the item claim board and assign them to people.
5. View the final split result and share it from the results screen.

## Tech stack

- Expo 54
- React Native 0.81
- React 19
- TypeScript
- React Navigation native stack
- expo-image-picker and expo-image-manipulator
- rn-mlkit-ocr for native OCR
- tesseract.js for web OCR

## Project structure

- `App.tsx` - app entry point
- `src/navigation/` - navigation types and stack setup
- `src/screens/` - Home, Results, Camera Scan, and Item Claim Board screens
- `src/components/` - reusable form components such as `InputField`
- `src/utils/calculateSplit.ts` - split math and currency formatting
- `src/utils/ocr.*` - platform-specific OCR adapters
- `src/utils/receiptParser.js` - receipt line-item and summary parsing
- `android/` - native Android project files for development builds

## Getting started

### Prerequisites

- Node.js and npm
- Expo CLI tooling through `npx expo`
- Android Studio or an Android device if you want to run the native Android build
- Xcode if you want to run iOS locally on macOS

### Install

```bash
npm install
```

### Run the app

Start the Expo dev server:

```bash
npm start
```

Then choose one of the supported targets:

- Web: `npm run web`
- Android native build: `npm run android`
- iOS native build: `npm run ios`

## Available scripts

- `npm start` - start the Expo development server
- `npm run android` - run the Android native app
- `npm run ios` - run the iOS native app
- `npm run web` - run the app in the browser

## Receipt scanning and OCR

Receipt scanning works differently by platform:

- Web uses `tesseract.js`, so OCR can run in the browser.
- Native iOS and Android use `rn-mlkit-ocr`.
- Expo Go does not provide the native OCR module, so native receipt scanning requires a development build instead of Expo Go.

If OCR finds text but cannot confidently extract item rows, the app will still try to detect receipt summary values such as subtotal, tax, and total.

## Current screens

- Home - enter bill details or launch receipt scanning
- Camera Scan - take a photo or import a receipt image
- Item Claim Board - assign detected items to people and review totals
- Results - review the split and share the result

## License

This project is licensed under the MIT License. See `LICENSE` for details.

// Native (iOS / Android) OCR via rn-mlkit-ocr.
// Uses a safe dynamic require so Expo Go doesn't crash at import time -
// isOcrSupported will be false in Expo Go and the UI shows the banner.

import { Platform } from 'react-native';

type OcrResult = { text?: string; blocks?: { text?: string }[] };

let _isSupported = false;
let _recognizeText: (uri: string) => Promise<OcrResult> = async () => {
  throw new Error('Cannot find native module: rn-mlkit-ocr');
};

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mlkit = require('rn-mlkit-ocr');
  const recognizeText = mlkit.default?.recognizeText ?? mlkit.recognizeText;

  if (typeof recognizeText === 'function') {
    _isSupported = true;
    _recognizeText = (uri: string) => recognizeText(uri);
  }
} catch {
  // Expo Go or device without ML Kit support — stubs remain
}

export const isOcrSupported: boolean = _isSupported;

export const recognizeTextLines = async (uri: string): Promise<string[]> => {
  let result: OcrResult;

  try {
    result = await _recognizeText(uri);
  } catch (error) {
    // iOS OCR can fail with file:// URIs depending on image source.
    if (Platform.OS === 'ios' && uri.startsWith('file://')) {
      result = await _recognizeText(uri.replace('file://', ''));
    } else {
      throw error;
    }
  }

  const blockLines = (result.blocks ?? []).map((b) => b.text?.trim() ?? '').filter(Boolean);
  if (blockLines.length) {
    return blockLines;
  }

  return (result.text ?? '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
};

// Web OCR via Tesseract.js — runs entirely in the browser, no native modules needed.
import { createWorker } from 'tesseract.js';

export const isOcrSupported = true;

const toDataUrl = async (uri: string): Promise<string> => {
  if (!uri.startsWith('blob:')) {
    return uri;
  }

  const response = await fetch(uri);
  const blob = await response.blob();

  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert image to data URL'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read selected image'));
    reader.readAsDataURL(blob);
  });
};

export const recognizeTextLines = async (uri: string): Promise<string[]> => {
  const imageSource = await toDataUrl(uri);
  const worker = await createWorker('eng');
  try {
    const { data } = await worker.recognize(imageSource);
    return (data.text ?? '')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  } finally {
    await worker.terminate();
  }
};

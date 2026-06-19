import { Platform } from 'react-native';

type OcrModule = {
  isOcrSupported: boolean;
  recognizeTextLines: (uri: string) => Promise<string[]>;
};

// Runtime selection keeps one shared import path for the app and satisfies TypeScript.
const ocrModule: OcrModule =
  Platform.OS === 'web'
    ? // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('./ocr.web')
    : // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('./ocr.native');

export const isOcrSupported = ocrModule.isOcrSupported;
export const recognizeTextLines = ocrModule.recognizeTextLines;

import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { isOcrSupported, recognizeTextLines } from '../utils/ocr';
import { ReceiptItem, ReceiptSummary, RootStackParamList } from '../navigation/AppNavigator';
import { InputField } from '../components/InputField';
import { parseReceiptDetails } from '../utils/receiptParser';

export type CameraScanScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'CameraScan'
>;

const ocrAvailable = isOcrSupported;

export const CameraScanScreen = ({ navigation, route }: CameraScanScreenProps) => {
  const { peopleCount: initialPeopleCount } = route.params ?? {};
  const [peopleCountInput, setPeopleCountInput] = useState(
    String(initialPeopleCount ?? '2')
  );
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  const showMessage = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      setScanError(`${title}: ${message}`);
      return;
    }

    Alert.alert(title, message);
  };

  const processReceiptImage = async (uri?: string) => {
    if (!uri) {
      return;
    }

    setImageUri(uri);
    setIsLoading(true);
    setScanError(null);

    try {
      const sourceUri =
        Platform.OS === 'web'
          ? uri
          : (
              await ImageManipulator.manipulateAsync(
                uri,
                [{ resize: { width: 900 } }],
                { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG }
              )
            ).uri;

      const rawLines = await recognizeTextLines(sourceUri);

      if (!rawLines.length) {
        showMessage(
          'No text found',
          'The image loaded, but OCR could not detect readable text.'
        );
        return;
      }

      const { items, summary } = parseReceiptDetails(rawLines) as {
        items: ReceiptItem[];
        summary: ReceiptSummary;
      };
      const parsedItems = items;

      if (!parsedItems.length) {
        const totalText = summary.total ? ` Detected total: $${summary.total.toFixed(2)}.` : '';
        showMessage('No items found', `Could not extract item rows with prices.${totalText}`);
        return;
      }

      const parsedPeopleCount = Number(peopleCountInput);
      if (!Number.isFinite(parsedPeopleCount) || parsedPeopleCount < 1) {
        showMessage(
          'Invalid people count',
          'Please enter at least 1 person before continuing.'
        );
        return;
      }

      navigation.navigate('ItemClaimBoard', {
        items: parsedItems,
        peopleCount: parsedPeopleCount,
        receiptSummary: summary,
      });
    } catch (error) {
      console.log('Receipt OCR error:', error);
      const reason =
        error instanceof Error && error.message
          ? ` Details: ${error.message}`
          : '';
      showMessage(
        'Scan failed',
        `We could not read this receipt right now. Please try another image.${reason}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleTakePhoto = async () => {
    if (Platform.OS !== 'web') {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

      if (!permissionResult.granted) {
        showMessage(
          'Camera permission needed',
          'Please allow camera access to scan receipts.'
        );
        return;
      }
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.7,
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    await processReceiptImage(result.assets[0].uri);
  };

  const handlePickFromLibrary = async () => {
    if (Platform.OS !== 'web') {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        showMessage(
          'Photo library permission needed',
          'Please allow access to your photos to import a receipt.'
        );
        return;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: false,
      quality: 0.7,
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    await processReceiptImage(result.assets[0].uri);
  };

  const handleClearImage = () => {
    if (Platform.OS === 'web') {
      setImageUri(null);
      return;
    }

    Alert.alert(
      'Remove image?',
      'This will clear the current receipt preview.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => setImageUri(null),
        },
      ]
    );
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Scan Receipt</Text>

      <InputField
        label="Number of people"
        value={peopleCountInput}
        onChangeText={setPeopleCountInput}
        placeholder="2"
        keyboardType="numeric"
        returnKeyType="done"
        blurOnSubmit={true}
        onSubmitEditing={() => Keyboard.dismiss()}
      />

      {imageUri ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: imageUri }} style={styles.preview} />
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearImage}
            accessibilityLabel="Clear selected image"
          >
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>No picture yet</Text>
        </View>
      )}

      {!ocrAvailable && (
        <View style={styles.ocrBanner}>
          <Text style={styles.ocrBannerText}>
            Receipt scanning requires a development build — it is not available in Expo Go.
            Use the manual entry on the home screen instead.
          </Text>
        </View>
      )}

      {scanError ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{scanError}</Text>
        </View>
      ) : null}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffc0cb" />
          <Text style={styles.loadingText}>Parsing receipt...</Text>
        </View>
      ) : (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, !ocrAvailable && styles.buttonDisabled]}
            onPress={handleTakePhoto}
            disabled={!ocrAvailable}
          >
            <Text style={styles.buttonText}>Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton, !ocrAvailable && styles.buttonDisabled]}
            onPress={handlePickFromLibrary}
            disabled={!ocrAvailable}
          >
            <Text style={styles.buttonText}>Import Receipt</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFAA0',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  previewContainer: {
    width: '100%',
    marginBottom: 16,
  },
  preview: {
    width: '100%',
    height: 280,
    borderRadius: 16,
  },
  clearButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
    backgroundColor: '#7e3f12',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  clearButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  placeholder: {
    width: '100%',
    height: 280,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  placeholderText: {
    color: '#6B7280',
    fontSize: 16,
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#111827',
    fontSize: 16,
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  button: {
    backgroundColor: '#ffc0cb',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#7e3f12',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },
  ocrBanner: {
    width: '100%',
    backgroundColor: '#FFF3CD',
    borderColor: '#FBBF24',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  ocrBannerText: {
    color: '#92400E',
    fontSize: 14,
    lineHeight: 20,
  },
  errorBanner: {
    width: '100%',
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorBannerText: {
    color: '#7F1D1D',
    fontSize: 14,
    lineHeight: 20,
  },
});

import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { isSupported, recognizeText } from 'expo-mlkit-ocr';
import { ReceiptItem, RootStackParamList } from '../navigation/AppNavigator';
import { InputField } from '../components/InputField';
import { parseReceiptLines } from '../utils/receiptParser';

export type CameraScanScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'CameraScan'
>;

export const CameraScanScreen = ({ navigation, route }: CameraScanScreenProps) => {
  const { peopleCount: initialPeopleCount } = route.params ?? {};
  const [peopleCountInput, setPeopleCountInput] = useState(
    String(initialPeopleCount ?? '2')
  );
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const processReceiptImage = async (uri?: string) => {
    if (!uri) {
      return;
    }

    setImageUri(uri);
    setIsLoading(true);

    try {
      const normalizedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 900 } }],
        { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG }
      );

      if (!isSupported()) {
        Alert.alert(
          'OCR not supported',
          'This device or build does not support text recognition. Please use a development build or a supported device.'
        );
        return;
      }

      const result = await recognizeText(normalizedImage.uri);
      const rawLines = result.blocks
        .map((block) => block.text)
        .filter(Boolean);

      if (!rawLines.length) {
        Alert.alert(
          'No text found',
          'The image was imported, but no text could be detected yet.'
        );
        return;
      }

      const parsedItems = parseReceiptLines(rawLines) as ReceiptItem[];

      if (!parsedItems.length) {
        Alert.alert(
          'No items found',
          'We could not extract any item lines from this receipt yet.'
        );
        return;
      }

      const parsedPeopleCount = Number(peopleCountInput);
      if (!Number.isFinite(parsedPeopleCount) || parsedPeopleCount < 1) {
        Alert.alert(
          'Invalid people count',
          'Please enter at least 1 person before continuing.'
        );
        return;
      }

      navigation.navigate('ItemClaimBoard', {
        items: parsedItems,
        peopleCount: parsedPeopleCount,
      });
    } catch (error) {
      console.log('Receipt OCR error:', error);

      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const needsNativeBuild =
        errorMessage.includes('Cannot find native module') ||
        errorMessage.includes('ExpoMlkitOcr') ||
        errorMessage.includes('native build');

      Alert.alert(
        needsNativeBuild ? 'Native OCR setup required' : 'Scan failed',
        needsNativeBuild
          ? 'Receipt scanning requires a native build. Please run the app from a development build (not Expo Go) and rebuild after running expo prebuild.'
          : 'We could not read this receipt right now. Please try another image or check the scan settings.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleTakePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        'Camera permission needed',
        'Please allow camera access to scan receipts.'
      );
      return;
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
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        'Photo library permission needed',
        'Please allow access to your photos to import a receipt.'
      );
      return;
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

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffc0cb" />
          <Text style={styles.loadingText}>Parsing receipt...</Text>
        </View>
      ) : (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.button} onPress={handleTakePhoto}>
            <Text style={styles.buttonText}>Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handlePickFromLibrary}
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
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },
});

import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'numeric' | 'decimal-pad' | 'number-pad' | 'default';
  returnKeyType?: 'done' | 'next' | 'go' | 'search' | 'default';
  blurOnSubmit?: boolean;
  onSubmitEditing?: () => void;
}

export const InputField = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  returnKeyType = 'done',
  blurOnSubmit = true,
  onSubmitEditing,
}: InputFieldProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        returnKeyType={returnKeyType}
        blurOnSubmit={blurOnSubmit}
        onSubmitEditing={onSubmitEditing}
        autoCapitalize="none"
        autoCorrect={false}
        placeholderTextColor="#9CA3AF"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
});

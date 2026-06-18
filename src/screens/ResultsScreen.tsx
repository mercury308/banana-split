import React from 'react';
import {
  Alert,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { formatCurrency } from '../utils/calculateSplit';

export type ResultsScreenProps = NativeStackScreenProps<RootStackParamList, 'Results'>;

export const ResultsScreen = ({ route }: ResultsScreenProps) => {
  const { result } = route.params;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Split bill result: ${formatCurrency(result.amountPerPerson)} each for ${result.people} people.`,
      });
    } catch (error) {
      Alert.alert('Sharing failed', 'Please try again later.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>Total bill</Text>
        <Text style={styles.value}>{formatCurrency(result.billTotal)}</Text>

        <Text style={styles.label}>Tip</Text>
        <Text style={styles.value}>{formatCurrency(result.tipAmount)}</Text>

        <Text style={styles.label}>Each person owes</Text>
        <Text style={styles.total}>{formatCurrency(result.amountPerPerson)}</Text>

        <Text style={styles.meta}>
          {result.people} people · {result.tipPercentage}% tip
        </Text>

        <TouchableOpacity style={styles.button} onPress={handleShare}>
          <Text style={styles.buttonText}>Share 🔗</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    backgroundColor: '#FFFAA0',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  label: {
    color: '#6B7280',
    fontSize: 14,
    marginBottom: 4,
  },
  value: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  total: {
    color: '#111827',
    fontSize: 36,
    fontWeight: '800',
    marginBottom: 8,
  },
  meta: {
    color: '#6B7280',
    fontSize: 14,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#ffc0cb',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#0f0505',
    fontSize: 16,
    fontWeight: '700',
  },
});

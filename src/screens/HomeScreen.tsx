import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { InputField } from '../components/InputField';
import { RootStackParamList } from '../navigation/AppNavigator';
import { calculateSplit } from '../utils/calculateSplit';

export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

export const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const [billTotal, setBillTotal] = useState('');
  const [tipPercentage, setTipPercentage] = useState('15');
  const [people, setPeople] = useState('2');

  const handleCalculate = () => {
    const parsedBill = Number(billTotal);
    const parsedTip = Number(tipPercentage);
    const parsedPeople = Number(people);

    if (!Number.isFinite(parsedBill) || parsedBill <= 0) {
      Alert.alert('Invalid bill total', 'Please enter a bill amount greater than 0.');
      return;
    }

    if (!Number.isFinite(parsedTip) || parsedTip < 0) {
      Alert.alert('Invalid tip', 'Please enter a tip percentage of 0 or more.');
      return;
    }

    if (!Number.isFinite(parsedPeople) || parsedPeople < 1) {
      Alert.alert('Invalid people count', 'Please enter at least 1 person.');
      return;
    }

    const result = calculateSplit({
      billTotal: parsedBill,
      tipPercentage: parsedTip,
      people: parsedPeople,
    });

    navigation.navigate('Results', { result });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Split It Up!</Text>

        <InputField
          label="Bill total"
          value={billTotal}
          onChangeText={setBillTotal}
          placeholder="0.00"
          keyboardType="numeric"
        />

        <InputField
          label="Tip (%)"
          value={tipPercentage}
          onChangeText={setTipPercentage}
          placeholder="15"
          keyboardType="numeric"
        />

        <InputField
          label="People"
          value={people}
          onChangeText={setPeople}
          placeholder="2"
          keyboardType="numeric"
        />

        <TouchableOpacity style={styles.button} onPress={handleCalculate}>
          <Text style={styles.buttonText}>Calculate</Text>
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
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    color: '#080707',
  },
  button: {
    backgroundColor: '#ffc0cb',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },
});

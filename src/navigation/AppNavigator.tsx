import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { ResultsScreen } from '../screens/ResultsScreen';
import { CameraScanScreen } from '../screens/CameraScanScreen';
import { ItemClaimBoardScreen } from '../screens/ItemClaimBoardScreen';
import { SplitResult } from '../utils/calculateSplit';

export interface ReceiptItem {
  id: string;
  name: string;
  price: number;
  selectedBy: string[];
}

export interface ReceiptSummary {
  subtotal: number | null;
  tax: number | null;
  total: number | null;
}

export type RootStackParamList = {
  Home: undefined;
  Results: { result: SplitResult };
  CameraScan: { peopleCount: number };
  ItemClaimBoard: {
    items: ReceiptItem[];
    peopleCount: number;
    receiptSummary?: ReceiptSummary;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Banana Split 🍌' }}
        />
        <Stack.Screen
          name="Results"
          component={ResultsScreen}
          options={{ title: 'Results' }}
        />
        <Stack.Screen
          name="CameraScan"
          component={CameraScanScreen}
          options={{ title: 'Scan Receipt' }}
        />
        <Stack.Screen
          name="ItemClaimBoard"
          component={ItemClaimBoardScreen}
          options={{ title: 'Item Claim Board' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

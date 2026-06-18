import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

export type ItemClaimBoardScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'ItemClaimBoard'
>;

export const ItemClaimBoardScreen = ({
  route,
}: ItemClaimBoardScreenProps) => {
  const { items } = route.params;

  const renderItem = ({ item }: { item: (typeof items)[number] }) => (
    <View style={styles.card}>
      <View>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.price}>${item.price.toFixed(2)}</Text>
      </View>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Claim</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Item Claim Board</Text>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFAA0',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  list: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  price: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  button: {
    backgroundColor: '#ffc0cb',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  buttonText: {
    color: '#000000',
    fontWeight: '700',
  },
});

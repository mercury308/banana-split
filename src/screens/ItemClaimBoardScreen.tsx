import React, { useMemo, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { calculateSplit } from '../utils/calculateSplit';

export type ItemClaimBoardScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'ItemClaimBoard'
>;

export const ItemClaimBoardScreen = ({
  route,
  navigation,
}: ItemClaimBoardScreenProps) => {
  const { items, peopleCount } = route.params;
  const [selectedItems, setSelectedItems] = useState(items);

  const people = useMemo(
    () => Array.from({ length: peopleCount }, (_, index) => `Person ${index + 1}`),
    [peopleCount]
  );

  const totals = useMemo(() => {
    return people.map((person, index) => {
      const total = selectedItems.reduce((sum, item) => {
        return item.selectedBy.includes(person)
          ? sum + item.price
          : sum;
      }, 0);

      return {
        person,
        total,
        key: `${person}-${index}`,
      };
    });
  }, [people, selectedItems]);

  const togglePersonForItem = (itemId: string, personName: string) => {
    setSelectedItems((currentItems) =>
      currentItems.map((item) => {
        if (item.id !== itemId) {
          return item;
        }

        const alreadySelected = item.selectedBy.includes(personName);
        return {
          ...item,
          selectedBy: alreadySelected
            ? item.selectedBy.filter((name) => name !== personName)
            : [...item.selectedBy, personName],
        };
      })
    );
  };

  const handleFinish = () => {
    const billTotal = selectedItems.reduce((sum, item) => sum + item.price, 0);
    const result = calculateSplit({
      billTotal,
      tipPercentage: 15,
      people: peopleCount,
    });

    navigation.navigate('Results', { result });
  };

  const renderItem = ({ item }: { item: (typeof items)[number] }) => (
    <View style={styles.card}>
      <View style={styles.itemInfo}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.price}>${item.price.toFixed(2)}</Text>
      </View>

      <View style={styles.personButtons}>
        {people.map((person) => {
          const isSelected = item.selectedBy.includes(person);
          return (
            <TouchableOpacity
              key={`${item.id}-${person}`}
              style={[styles.personButton, isSelected && styles.personButtonSelected]}
              onPress={() => togglePersonForItem(item.id, person)}
            >
              <Text style={[styles.personButtonText, isSelected && styles.personButtonTextSelected]}>
                {person}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Item Claim Board</Text>
      <View style={styles.summaryCard}>
        {totals.map((entry) => (
          <View key={entry.key} style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{entry.person}</Text>
            <Text style={styles.summaryValue}>${entry.total.toFixed(2)}</Text>
          </View>
        ))}
      </View>
      <FlatList
        data={selectedItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
      <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
        <Text style={styles.finishButtonText}>View Split Results</Text>
      </TouchableOpacity>
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
  },
  itemInfo: {
    marginBottom: 12,
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
  personButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  personButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  personButtonSelected: {
    backgroundColor: '#ffc0cb',
  },
  personButtonText: {
    color: '#111827',
    fontSize: 12,
    fontWeight: '600',
  },
  personButtonTextSelected: {
    color: '#000000',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 14,
    color: '#111827',
  },
  finishButton: {
    backgroundColor: '#7e3f12',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  finishButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

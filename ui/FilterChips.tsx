import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Chip } from 'react-native-paper';

/**
 * Filter option interface
 */
export interface FilterOption {
  id: string;
  label: string;
  value: any;
}

/**
 * Filter chips component props
 */
interface FilterChipsProps {
  options: FilterOption[];
  selectedValues: any[];
  onSelectionChange: (values: any[]) => void;
  multiSelect?: boolean;
  scrollable?: boolean;
}

/**
 * Filter chips component
 * Displays filter options as chips with selection support
 */
export const FilterChips: React.FC<FilterChipsProps> = ({
  options,
  selectedValues,
  onSelectionChange,
  multiSelect = true,
  scrollable = true,
}) => {
  const handleChipPress = (value: any) => {
    if (multiSelect) {
      const isSelected = selectedValues.includes(value);
      if (isSelected) {
        onSelectionChange(selectedValues.filter((v) => v !== value));
      } else {
        onSelectionChange([...selectedValues, value]);
      }
    } else {
      onSelectionChange([value]);
    }
  };

  const content = (
    <View style={styles.container}>
      {options.map((option) => {
        const isSelected = selectedValues.includes(option.value);
        return (
          <Chip
            key={option.id}
            selected={isSelected}
            onPress={() => handleChipPress(option.value)}
            style={[styles.chip, isSelected && styles.chipSelected]}
            textStyle={isSelected ? styles.chipTextSelected : styles.chipText}
          >
            {option.label}
          </Chip>
        );
      })}
    </View>
  );

  if (scrollable) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {content}
      </ScrollView>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  chipSelected: {
    backgroundColor: '#007AFF',
  },
  chipText: {
    color: '#000',
  },
  chipTextSelected: {
    color: '#fff',
  },
});


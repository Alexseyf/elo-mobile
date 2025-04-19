import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface Option {
  id: string;
  label: string;
}

interface MultiOptionSelectorProps {
  options: Option[];
  selectedOptions: string[];
  onChange: (selectedOptions: string[]) => void;
}

const MultiOptionSelector: React.FC<MultiOptionSelectorProps> = ({ 
  options, 
  selectedOptions, 
  onChange 
}) => {
  
  const toggleOption = (optionId: string) => {
    if (selectedOptions.includes(optionId)) {
      onChange(selectedOptions.filter(id => id !== optionId));
    } else {
      onChange([...selectedOptions, optionId]);
    }
  };

  return (
    <View style={styles.container}>
      {options.map((option) => {
        const isSelected = selectedOptions.includes(option.id);
        
        return (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.option,
              isSelected && styles.selectedOption
            ]}
            onPress={() => toggleOption(option.id)}
          >
            <View style={styles.checkboxContainer}>
              {isSelected ? (
                <MaterialIcons name="check-box" size={24} color="#4a90e2" />
              ) : (
                <MaterialIcons name="check-box-outline-blank" size={24} color="#e1e1e1" />
              )}
            </View>
            <Text style={[
              styles.optionText,
              isSelected && styles.selectedOptionText
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedOption: {
    backgroundColor: 'rgba(74, 144, 226, 0.3)',
    borderWidth: 1,
    borderColor: '#4a90e2',
  },
  optionText: {
    fontSize: 16,
    color: '#e1e1e1',
    marginLeft: 10,
  },
  selectedOptionText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  checkboxContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MultiOptionSelector;
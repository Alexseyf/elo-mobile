import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import globalStyles from '../../../styles/globalStyles';

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
    <View style={globalStyles.optionContainer}>
      {options.map((option) => {
        const isSelected = selectedOptions.includes(option.id);
        
        return (
          <TouchableOpacity
            key={option.id}
            style={[
              globalStyles.option,
              isSelected && globalStyles.selectedOption
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
              globalStyles.optionText,
              isSelected && globalStyles.selectedOptionText
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
  checkboxContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MultiOptionSelector;
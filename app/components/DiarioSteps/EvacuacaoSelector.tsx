import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface EvacuacaoSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const EvacuacaoSelector: React.FC<EvacuacaoSelectorProps> = ({ value, onChange }) => {
  const options = [
    { id: 'normal', label: 'Normal' },
    { id: 'liquida', label: 'Líquida' },
    { id: 'dura', label: 'Dura' },
    { id: 'nao_evacuou', label: 'Não evacuou' },
  ];

  return (
    <View style={styles.container}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.id}
          style={[
            styles.option,
            value === option.id && styles.selectedOption
          ]}
          onPress={() => onChange(option.id)}
        >
          <View style={styles.radioContainer}>
            <View style={[
              styles.radio,
              value === option.id && styles.radioSelected
            ]} />
          </View>
          <Text style={[
            styles.optionText,
            value === option.id && styles.selectedOptionText
          ]}>
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
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
  radioContainer: {
    height: 24,
    width: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e1e1e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radio: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: 'transparent',
  },
  radioSelected: {
    backgroundColor: '#4a90e2',
  },
});

export default EvacuacaoSelector;
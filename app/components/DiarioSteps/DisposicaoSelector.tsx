import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import globalStyles from '../../../styles/globalStyles';
import { diarioStyles } from '../../../styles/globalStyles';

interface DisposicaoSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const DisposicaoSelector: React.FC<DisposicaoSelectorProps> = ({ value, onChange }) => {
  const options = [
    { id: 'NORMAL', label: 'Normal' },
    { id: 'AGITADO', label: 'Agitado' },
    { id: 'CALMO', label: 'Calmo' },
    { id: 'SONOLENTO', label: 'Sonolento' },
    { id: 'CANSADO', label: 'Cansado' },
  ];

  return (
    <View style={globalStyles.optionContainer}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.id}
          style={[
            globalStyles.option,
            value === option.id && globalStyles.selectedOption
          ]}
          onPress={() => onChange(option.id)}
        >
          <View style={diarioStyles.radioContainer}>
            <View style={[
              diarioStyles.radio,
              value === option.id && diarioStyles.radioSelected
            ]} />
          </View>
          <Text style={[
            globalStyles.optionText,
            value === option.id && globalStyles.selectedOptionText
          ]}>
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default DisposicaoSelector;
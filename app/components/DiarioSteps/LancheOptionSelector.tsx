import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import globalStyles from '../../../styles/globalStyles';
import { diarioStyles } from '../../../styles/globalStyles';

interface LancheOptionSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const LancheOptionSelector: React.FC<LancheOptionSelectorProps> = ({ value, onChange }) => {
  const options = [
    { id: 'OTIMO', label: 'Ótimo' },
    { id: 'BOM', label: 'Bom' },
    { id: 'REGULAR', label: 'Regular' },
    { id: 'NAO_ACEITOU', label: 'Não aceitou' },
    { id: 'NAO_SE_APLICA', label: 'Não se aplica' },
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

export default LancheOptionSelector;
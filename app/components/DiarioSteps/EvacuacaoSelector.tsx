import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import globalStyles from '../../../styles/globalStyles';
import { diarioStyles } from '../../../styles/globalStyles';

interface EvacuacaoSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const EvacuacaoSelector: React.FC<EvacuacaoSelectorProps> = ({ value, onChange }) => {
  const options = [
    { id: 'NORMAL', label: 'Normal' },
    { id: 'LIQUIDA', label: 'Líquida' },
    { id: 'DURA', label: 'Dura' },
    { id: 'NAO_EVACUOU', label: 'Não evacuou' },
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

export default EvacuacaoSelector;
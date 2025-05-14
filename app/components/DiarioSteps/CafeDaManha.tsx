import React from 'react';
import { View } from 'react-native';
import LancheOptionSelector from './LancheOptionSelector';
import { diarioStyles } from '../../../styles/globalStyles';

interface CafeDaManhaProps {
  value: string;
  onChange: (value: string) => void;
}

const CafeDaManha: React.FC<CafeDaManhaProps> = ({ value, onChange }) => {
  return (
    <View style={diarioStyles.container}>
      <LancheOptionSelector value={value} onChange={onChange} />
    </View>
  );
};

export default CafeDaManha;
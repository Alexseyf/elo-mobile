import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import EvacuacaoSelector from './EvacuacaoSelector';

interface EvacuacaoProps {
  value: string;
  onChange: (value: string) => void;
}

const Evacuacao: React.FC<EvacuacaoProps> = ({ value, onChange }) => {
  return (
    <View style={styles.container}>
      <EvacuacaoSelector value={value} onChange={onChange} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  description: {
    fontSize: 18,
    color: '#e1e1e1',
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default Evacuacao;
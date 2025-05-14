import React from 'react';
import { View, StyleSheet } from 'react-native';
import DisposicaoSelector from './DisposicaoSelector';

interface DisposicaoProps {
  value: string;
  onChange: (value: string) => void;
}

const Disposicao: React.FC<DisposicaoProps> = ({ value, onChange }) => {
  return (
    <View style={styles.container}>
      <DisposicaoSelector value={value} onChange={onChange} />
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

export default Disposicao;
import React from 'react';
import { View, StyleSheet } from 'react-native';
import LancheOptionSelector from './LancheOptionSelector';

interface LancheDaTardeProps {
  value: string;
  onChange: (value: string) => void;
}

const LancheDaTarde: React.FC<LancheDaTardeProps> = ({ value, onChange }) => {
  return (
    <View style={styles.container}>
      <LancheOptionSelector value={value} onChange={onChange} />
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

export default LancheDaTarde;
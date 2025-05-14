import React from 'react';
import { View, StyleSheet } from 'react-native';
import LancheOptionSelector from './LancheOptionSelector';

interface LeiteProps {
  value: string;
  onChange: (value: string) => void;
}

const Leite: React.FC<LeiteProps> = ({ value, onChange }) => {
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

export default Leite;
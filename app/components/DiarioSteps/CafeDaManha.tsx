import React from 'react';
import { View, StyleSheet } from 'react-native';
import MealOptionSelector from './MealOptionSelector';

interface CafeDaManhaProps {
  value: string;
  onChange: (value: string) => void;
}

const CafeDaManha: React.FC<CafeDaManhaProps> = ({ value, onChange }) => {
  return (
    <View style={styles.container}>
      <MealOptionSelector value={value} onChange={onChange} />
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

export default CafeDaManha;
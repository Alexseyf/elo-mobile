import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MultiOptionSelector from './MultiOptionSelector';

interface ItemsRequestProps {
  selectedItems: string[];
  onChange: (selectedItems: string[]) => void;
}

const ItemsRequest: React.FC<ItemsRequestProps> = ({ selectedItems, onChange }) => {
  const requestItems = [
    { id: 'lencos_umedecidos', label: 'LENÇOS UMEDECIDOS' },
    { id: 'leite', label: 'LEITE' },
    { id: 'creme_dental', label: 'CREME DENTAL' },
    { id: 'escova_dente', label: 'ESCOVA DE DENTE' },
    { id: 'fralda', label: 'FRALDA' },
    { id: 'pomada', label: 'POMADA' },
  ];

  return (
    <View style={styles.container}>      
      <MultiOptionSelector
        options={requestItems}
        selectedOptions={selectedItems}
        onChange={onChange}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2a4674',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#e1e1e1',
    marginBottom: 20,
    fontStyle: 'italic',
  }
});

export default ItemsRequest;
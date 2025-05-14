import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MultiOptionSelector from './MultiOptionSelector';

interface ItemsRequestProps {
  selectedItems: string[];
  onChange: (selectedItems: string[]) => void;
}

const ItemsRequest: React.FC<ItemsRequestProps> = ({ selectedItems, onChange }) => {
  const requestItems = [
    { id: 'FRALDA', label: 'FRALDA' },
    { id: 'LENCO_UMEDECIDO', label: 'LENÇOS UMEDECIDOS' },
    { id: 'POMADA', label: 'POMADA' },
    { id: 'LEITE', label: 'LEITE' },
    { id: 'ESCOVA_DE_DENTE', label: 'ESCOVA DE DENTE' },
    { id: 'CREME_DENTAL', label: 'CREME DENTAL' },
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
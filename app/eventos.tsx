import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import globalStyles from '../styles/globalStyles';
import Colors from './constants/colors';

export default function EventosPage() {
  const router = useRouter();
  
  const handleCadastrar = () => router.push('/eventos/cadastrar');
  const handleListar = () => router.push('/eventos/listar');
  const handleVoltar = () => router.back();

  return (
    <View style={globalStyles.container}>
      <StatusBar hidden />
      <View style={globalStyles.header}>
        <Text style={globalStyles.headerTitle}>Eventos</Text>
      </View>
      <ScrollView style={globalStyles.scrollContent} contentContainerStyle={globalStyles.scrollContentContainer}>
        <View style={globalStyles.cardsContainer}>
          <TouchableOpacity style={globalStyles.card} onPress={handleCadastrar}>
            <View style={globalStyles.cardContent}>
              <Text style={globalStyles.cardEmoji}>📝</Text>
              <View style={globalStyles.cardTextContainer}>
                <Text style={globalStyles.cardTitle}>Cadastrar</Text>
                <Text style={globalStyles.cardDescription}>Adicionar novo evento ao sistema</Text>
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={globalStyles.card} onPress={handleListar}>
            <View style={globalStyles.cardContent}>
              <Text style={globalStyles.cardEmoji}>📋</Text>
              <View style={globalStyles.cardTextContainer}>
                <Text style={globalStyles.cardTitle}>Listar</Text>
                <Text style={globalStyles.cardDescription}>Visualizar eventos</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <TouchableOpacity style={globalStyles.backButton} onPress={handleVoltar}>
        <Text style={globalStyles.backButtonText}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  optionsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  menuButton: {
    marginVertical: 10,
    width: '100%',
    backgroundColor: Colors.blue_btn,
  },
});

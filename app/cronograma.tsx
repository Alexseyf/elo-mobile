import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import globalStyles from '../styles/globalStyles';

export default function CronogramaPage() {
  const router = useRouter();

  return (
    <View style={globalStyles.container}>
      <StatusBar hidden />
      <View style={globalStyles.header}>
        <Text style={globalStyles.headerTitle}>Cronograma Anual Escolar</Text>
      </View>
      <ScrollView style={globalStyles.scrollContent} contentContainerStyle={globalStyles.scrollContentContainer}>
        <View style={globalStyles.cardsContainer}>
          <TouchableOpacity style={globalStyles.card} onPress={() => router.push('/cronograma/cadastrar')}>
            <View style={globalStyles.cardContent}>
              <Text style={globalStyles.cardEmoji}>📝</Text>
              <View style={globalStyles.cardTextContainer}>
                <Text style={globalStyles.cardTitle}>Cadastrar</Text>
                <Text style={globalStyles.cardDescription}>Adicionar nova data ao cronograma</Text>
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={globalStyles.card} onPress={() => router.push('/cronograma/listar')}>
            <View style={globalStyles.cardContent}>
              <Text style={globalStyles.cardEmoji}>📋</Text>
              <View style={globalStyles.cardTextContainer}>
                <Text style={globalStyles.cardTitle}>Listar</Text>
                <Text style={globalStyles.cardDescription}>Visualizar cronograma</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <TouchableOpacity style={globalStyles.backButton} onPress={() => router.back()}>
        <Text style={globalStyles.backButtonText}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}

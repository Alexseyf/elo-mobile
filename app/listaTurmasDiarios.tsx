import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StatusBar, ActivityIndicator, Platform } from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import Toast from 'react-native-toast-message';
import { formatarNomeTurma } from "./utils/formatText";
import Colors from "./constants/colors";
import config from '../config';
import globalStyles from '../styles/globalStyles';

interface Turma {
  id: number;
  nome: string;
  alunos?: any[];
}

export default function ListaTurmasDiarios() {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTurmas = async () => {
    try {
      setLoading(true);

      const url = config.API_URL.endsWith('/')
        ? `${config.API_URL}turmas`
        : `${config.API_URL}/turmas`;

      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        setTurmas(data);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Erro ao buscar turmas',
          text2: 'Verifique sua conexão com o servidor',
          visibilityTime: 3000
        });
      }
    } catch (error) {
      console.error('Erro ao buscar turmas:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro de conexão',
        text2: 'Não foi possível conectar ao servidor',
        visibilityTime: 3000
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTurmas();
  }, []);

  const handleVoltar = () => {
    router.back();
  };

  const navegarParaListaAlunos = (turmaId: number, nomeTurma: string) => {
    router.push({
      pathname: "/listaAlunosDiarios",
      params: { 
        turmaId: turmaId.toString(),
        nomeTurma: formatarNomeTurma(nomeTurma)
      }
    });
  };

  return (
    <View style={globalStyles.container}>
      <StatusBar hidden />
      <View style={globalStyles.header}>
        <Text style={globalStyles.headerTitle}>Diários por Turma</Text>
      </View>

      {loading ? (
        <View style={globalStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={globalStyles.loadingText}>Carregando turmas...</Text>
        </View>
      ) : (
        <ScrollView 
          style={globalStyles.scrollContent}
          contentContainerStyle={globalStyles.scrollContentContainer}
        >
          {turmas.length === 0 ? (
            <View style={globalStyles.emptyContainer}>
              <MaterialIcons name="school" size={60} color="#fff" />
              <Text style={globalStyles.emptyText}>Nenhuma turma encontrada</Text>
            </View>
          ) : (
            turmas.map((turma) => (
              <TouchableOpacity 
                key={turma.id} 
                style={globalStyles.turmaCard}
                onPress={() => navegarParaListaAlunos(turma.id, turma.nome)}
              >
                <View style={globalStyles.cardContent}>
                  <Text style={globalStyles.cardEmoji}>🏫</Text>
                  <View style={globalStyles.cardTextContainer}>
                    <Text style={globalStyles.cardTitle}>{formatarNomeTurma(turma.nome)}</Text>
                    <Text style={globalStyles.cardDescription}>
                      Ver alunos e diários
                    </Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={24} color={Colors.blue_btn} />
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}

      <TouchableOpacity style={globalStyles.backButton} onPress={handleVoltar}>
        <Text style={globalStyles.backButtonText}>Voltar</Text>
      </TouchableOpacity>
      <Toast />
    </View>
  );
}
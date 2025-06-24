import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, ActivityIndicator, Platform } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import Toast from 'react-native-toast-message';
import { formatarNome } from "./utils/formatText";
import Colors from "./constants/colors";
import config from '../config';
import globalStyles from '../styles/globalStyles';

interface Aluno {
  id: number;
  nome: string;
  dataNasc: string;
  isAtivo: boolean;
  createdAt: string;
  updatedAt: string;
  turmaId: number;
  responsaveis: any[];
}

export default function ListaAlunosDiarios() {
  const { turmaId, nomeTurma } = useLocalSearchParams<{ turmaId: string; nomeTurma: string }>();
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAlunos = async () => {
    try {
      setLoading(true);

      const url = config.API_URL.endsWith('/')
        ? `${config.API_URL}turmas/${turmaId}/alunos`
        : `${config.API_URL}/turmas/${turmaId}/alunos`;
      
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        setAlunos(data);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Erro ao buscar alunos',
          text2: 'Verifique sua conexão com o servidor',
          visibilityTime: 3000
        });
      }
    } catch (error) {
      console.error('Erro ao buscar alunos da turma:', error);
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
    if (turmaId) {
      fetchAlunos();
    }
  }, [turmaId]);

  const handleVoltar = () => {
    router.back();
  };

  const navegarParaDiarioAluno = (alunoId: number, alunoNome: string) => {
    router.push({
      pathname: "/visualizarDiario",
      params: { 
        alunoId: alunoId.toString(), 
        alunoNome: formatarNome(alunoNome)
      }
    });
  };

  return (
    <View style={globalStyles.container}>
      <StatusBar hidden />
      <View style={globalStyles.header}>
        <Text style={globalStyles.headerTitle}>
          {nomeTurma || `Turma ${turmaId}`}
        </Text>
        <Text style={globalStyles.headerSubtitle}>
          Diários dos Alunos
        </Text>
      </View>

      {loading ? (
        <View style={globalStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={globalStyles.loadingText}>Carregando alunos...</Text>
        </View>
      ) : (
        <ScrollView 
          style={globalStyles.scrollContent}
          contentContainerStyle={globalStyles.scrollContentContainer}
        >
          {alunos.length === 0 ? (
            <View style={globalStyles.emptyContainer}>
              <MaterialIcons name="person-search" size={60} color="#fff" />
              <Text style={globalStyles.emptyText}>Nenhum aluno encontrado nesta turma</Text>
            </View>
          ) : (
            alunos.map((aluno) => (
              <TouchableOpacity 
                key={aluno.id} 
                style={globalStyles.alunoCard}
                onPress={() => navegarParaDiarioAluno(aluno.id, aluno.nome)}
              >
                <View style={styles.alunoInfo}>
                  <View style={styles.alunoAvatar}>
                    <Text style={styles.alunoAvatarText}>
                      {aluno.nome.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.alunoDetails}>
                    <Text style={styles.alunoNome}>
                      {formatarNome(aluno.nome)}
                    </Text>
                  </View>
                  <MaterialIcons name="book" size={24} color={Colors.blue_btn} />
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

const styles = StyleSheet.create({
  alunoCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  alunoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  alunoAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.blue_btn,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  alunoAvatarText: {
    fontFamily: 'Roboto_Condensed-SemiBold',
    color: '#fff',
    fontSize: 20,
  },
  alunoDetails: {
    flex: 1,
  },
  alunoNome: {
    fontFamily: "Roboto_Condensed-Regular",
    fontSize: 18,
    color: "#333",
    marginBottom: 4,
  },
});
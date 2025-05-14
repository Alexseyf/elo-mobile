import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, ActivityIndicator, Platform } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import Toast from 'react-native-toast-message';
import { formatarNome } from "./utils/formatText";
import Colors from "./constants/colors";
import config from '../config';

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
    <View style={styles.container}>
      <StatusBar hidden />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {nomeTurma || `Turma ${turmaId}`}
        </Text>
        <Text style={styles.headerSubtitle}>
          Diários dos Alunos
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Carregando alunos...</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollContent}
          contentContainerStyle={styles.scrollContentContainer}
        >
          {alunos.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="person-search" size={60} color="#fff" />
              <Text style={styles.emptyText}>Nenhum aluno encontrado nesta turma</Text>
            </View>
          ) : (
            alunos.map((aluno) => (
              <TouchableOpacity 
                key={aluno.id} 
                style={styles.alunoCard}
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

      <TouchableOpacity style={styles.backButton} onPress={handleVoltar}>
        <Text style={styles.backButtonText}>Voltar</Text>
      </TouchableOpacity>
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.blue_btn,
  },
  header: {
    backgroundColor: Colors.blue_btn,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#fff",
    marginTop: 4,
    opacity: 0.8,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 40 : 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#fff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#fff',
    marginTop: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
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
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  alunoDetails: {
    flex: 1,
  },
  alunoNome: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  backButton: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingVertical: 14,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: Platform.OS === 'ios' ? 80 : 60,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.blue_btn,
  }
});
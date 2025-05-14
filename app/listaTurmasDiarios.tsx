import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, ActivityIndicator, Platform } from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import Toast from 'react-native-toast-message';
import { formatarNomeTurma } from "./utils/formatText";
import Colors from "./constants/colors";
import config from '../config';

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
    <View style={styles.container}>
      <StatusBar hidden />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Diários por Turma</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Carregando turmas...</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollContent}
          contentContainerStyle={styles.scrollContentContainer}
        >
          {turmas.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="school" size={60} color="#fff" />
              <Text style={styles.emptyText}>Nenhuma turma encontrada</Text>
            </View>
          ) : (
            turmas.map((turma) => (
              <TouchableOpacity 
                key={turma.id} 
                style={styles.turmaCard}
                onPress={() => navegarParaListaAlunos(turma.id, turma.nome)}
              >
                <View style={styles.cardContent}>
                  <Text style={styles.cardEmoji}>🏫</Text>
                  <View style={styles.cardTextContainer}>
                    <Text style={styles.cardTitle}>{formatarNomeTurma(turma.nome)}</Text>
                    <Text style={styles.cardDescription}>
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
  turmaCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  cardEmoji: {
    fontSize: 28,
    marginRight: 16,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: "#666",
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
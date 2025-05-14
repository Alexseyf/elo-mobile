import { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, ActivityIndicator, Platform } from "react-native";
import { useLocalSearchParams, router, useFocusEffect } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import Toast from 'react-native-toast-message';
import { formatarNome } from "./utils/formatText";
import Colors from "./constants/colors";
import config from '../config';
import globalStyles from '../styles/globalStyles';

interface Responsavel {
  id: number;
  nome: string;
}

interface Aluno {
  id: number;
  nome: string;
  dataNasc: string;
  isAtivo: boolean;
  createdAt: string;
  updatedAt: string;
  turmaId: number;
  responsaveis: Responsavel[];
  temDiario?: boolean;
  diarioId?: number;
}

export default function ListaAlunos() {
  const { id, nomeTurma, diarioSalvo } = useLocalSearchParams<{ id: string; nomeTurma: string; diarioSalvo?: string }>();
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAlunos = async () => {
    try {
      setLoading(true);

      const url = config.API_URL.endsWith('/')
        ? `${config.API_URL}turmas/${id}/alunos`
        : `${config.API_URL}/turmas/${id}/alunos`;
      
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        const alunosVerificados = await Promise.all(
          data.map(async (aluno: Aluno) => {
            try {
              const diarioUrl = config.API_URL.endsWith('/')
                ? `${config.API_URL}alunos/${aluno.id}/possui-registro-diario`
                : `${config.API_URL}/alunos/${aluno.id}/possui-registro-diario`;
                
              const diarioResponse = await fetch(diarioUrl);
              
              if (diarioResponse.ok) {
                const diarioData = await diarioResponse.json();
                return {
                  ...aluno,
                  temDiario: diarioData.temDiario,
                  diarioId: diarioData.diario?.id
                };
              }
              return aluno;
            } catch (error) {
              console.error(`Erro ao verificar diário do aluno ${aluno.id}:`, error);
              return aluno;
            }
          })
        );
        
        setAlunos(alunosVerificados);
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
    if (id) {
      fetchAlunos();
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      if (diarioSalvo) {
        fetchAlunos();
      }
    }, [diarioSalvo])
  );

  const handleVoltar = () => {
    router.push('/users/profDash');
  };

  const navegarParaDiario = (alunoId: number, alunoNome: string, diarioId?: number) => {
    router.push({
      pathname: "/diario/page",
      params: { 
        alunoId: alunoId.toString(), 
        alunoNome: formatarNome(alunoNome),
        turmaId: id,
        nomeTurma: nomeTurma,
        diarioId: diarioId ? diarioId.toString() : undefined,
        modoEdicao: diarioId ? 'true' : undefined
      }
    });
  };

  const formatarData = (dataString: string): string => {
    try {
      const data = new Date(dataString);
      return data.toLocaleDateString('pt-BR');
    } catch (e) {
      return 'Data inválida';
    }
  };

  return (
    <View style={globalStyles.container}>
      <StatusBar backgroundColor={Colors.blue_btn} barStyle="light-content" />

      <View style={globalStyles.header}>
        <Text style={globalStyles.headerTitle}>Alunos</Text>
        {nomeTurma && <Text style={globalStyles.headerSubtitle}>{nomeTurma}</Text>}
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
              <MaterialIcons name="people" size={60} color="#fff" />
              <Text style={globalStyles.emptyText}>Nenhum aluno encontrado nesta turma</Text>
            </View>
          ) : (
            <View>
              {alunos.map((aluno) => (
                <TouchableOpacity 
                  key={aluno.id}
                  style={[
                    styles.alunoCard, 
                    aluno.temDiario && styles.alunoCardComDiario
                  ]}
                  onPress={() => navegarParaDiario(aluno.id, aluno.nome, aluno.diarioId)}
                >
                  <View style={styles.alunoInfo}>
                    <View style={styles.alunoAvatar}>
                      <Text style={styles.alunoAvatarText}>{aluno.nome.charAt(0)}</Text>
                    </View>
                    <View style={styles.alunoDetails}>
                      <Text style={styles.alunoNome}>{formatarNome(aluno.nome)}</Text>
                      {aluno.temDiario && (
                        <Text style={styles.diarioStatus}>Diário entregue</Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
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
  alunoCardComDiario: {
    backgroundColor: '#f8fff8',
    borderColor: Colors.green_btn,
    borderWidth: 1,
    opacity: 0.9,
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
  diarioStatus: {
    fontSize: 14,
    color: Colors.green_btn,
    fontWeight: '500',
  }
});
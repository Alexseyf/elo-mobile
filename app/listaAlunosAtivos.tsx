import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, ActivityIndicator, RefreshControl } from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNPickerSelect from 'react-native-picker-select';
import { formatarNome, formatarNomeTurma } from "./utils/formatText";
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
  turma?: {
    id: number;
    nome: string;
  };
  responsaveis: Responsavel[];
}

interface Turma {
  id: number;
  nome: string;
}

export default function ListaAlunosAtivos() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [alunosFiltrados, setAlunosFiltrados] = useState<Aluno[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [turmaSelecionada, setTurmaSelecionada] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingTurmas, setLoadingTurmas] = useState(true);

  const fetchAlunosAtivos = async () => {
    try {
      setLoading(true);

      const authToken = await AsyncStorage.getItem('@auth_token');
      const userDataString = await AsyncStorage.getItem('@user_data');
      
      if (!authToken) {
        Toast.show({
          type: 'error',
          text1: 'Erro de autenticação',
          text2: 'Sessão expirada. Por favor, faça login novamente.',
          visibilityTime: 3000
        });
        setTimeout(() => {
          router.replace('/');
        }, 2000);
        return;
      }

      let userRoles = [];
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        userRoles = userData.roles || [];
      }

      const url = config.API_URL.endsWith('/')
        ? `${config.API_URL}alunos/ativos`
        : `${config.API_URL}/alunos/ativos`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAlunos(data);
        setAlunosFiltrados(data);
      } else if (response.status === 401) {
        await AsyncStorage.removeItem('@auth_token');
        await AsyncStorage.removeItem('@user_id');
        await AsyncStorage.removeItem('@user_data');
        
        Toast.show({
          type: 'error',
          text1: 'Sessão expirada',
          text2: 'Por favor, faça login novamente',
          visibilityTime: 3000
        });
        setTimeout(() => {
          router.replace('/');
        }, 2000);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Erro ao buscar alunos',
          text2: 'Verifique sua conexão com o servidor',
          visibilityTime: 3000
        });
      }
    } catch (error) {
      console.error('Erro ao buscar alunos ativos:', error);
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

  const filtrarAlunos = (listaAlunos: Aluno[], turmaId: number | null) => {
    if (!turmaId) {
      setAlunosFiltrados(listaAlunos);
    } else {
      const filtrados = listaAlunos.filter(aluno => aluno.turmaId === turmaId);
      setAlunosFiltrados(filtrados);
    }
  };

  const fetchTurmas = async () => {
    try {
      setLoadingTurmas(true);
      
      const authToken = await AsyncStorage.getItem('@auth_token');
      
      if (!authToken) {
        return;
      }
      
      const url = config.API_URL.endsWith('/')
        ? `${config.API_URL}turmas`
        : `${config.API_URL}/turmas`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTurmas(data);
      }
    } catch (error) {
      console.error('Erro ao buscar turmas:', error);
    } finally {
      setLoadingTurmas(false);
    }
  };

  const handleChangeTurma = (value: number | null) => {
    setTurmaSelecionada(value);
    filtrarAlunos(alunos, value);
  };

  useEffect(() => {
    fetchAlunosAtivos();
    fetchTurmas();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAlunosAtivos();
  };

  const handleVoltar = () => {
    router.back();
  };

  return (
    <View style={globalStyles.container}>
      <StatusBar hidden barStyle="light-content" />

      <View style={globalStyles.header}>
        <Text style={globalStyles.headerTitle}>Alunos Ativos</Text>
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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.blue_btn]}
              tintColor="#fff"
            />
          }
        >
          <View style={styles.filterContainer}>
            <Text style={styles.filterLabel}>Filtrar por Turma:</Text>
            <View style={styles.pickerContainer}>
              <RNPickerSelect
                onValueChange={(value) => handleChangeTurma(value)}
                items={[
                  { label: 'Todas as Turmas', value: null },
                  ...turmas.map(turma => ({ 
                    label: formatarNomeTurma(turma.nome), 
                    value: turma.id 
                  }))
                ]}
                value={turmaSelecionada}
                placeholder={{}}
                style={{
                  inputIOS: styles.pickerInput,
                  inputAndroid: styles.pickerInput,
                  iconContainer: { top: 10, right: 12 }
                }}
                useNativeAndroidPickerStyle={false}
                Icon={() => <MaterialIcons name="arrow-drop-down" size={24} color="#333" />}
              />
            </View>
          </View>

          {alunos.length === 0 ? (
            <View style={globalStyles.emptyContainer}>
              <MaterialIcons name="people" size={60} color="#fff" />
              <Text style={globalStyles.emptyText}>Nenhum aluno ativo encontrado</Text>
            </View>
          ) : alunosFiltrados.length === 0 ? (
            <View style={globalStyles.emptyContainer}>
              <MaterialIcons name="filter-alt" size={60} color="#fff" />
              <Text style={globalStyles.emptyText}>Nenhum aluno encontrado nesta turma</Text>
            </View>
          ) : (
            <View>
              {alunosFiltrados.map((aluno) => (
                <View 
                  key={aluno.id}
                  style={styles.alunoCard}
                >
                  <View style={styles.alunoInfo}>
                    <View style={styles.alunoAvatar}>
                      <Text style={styles.alunoAvatarText}>{aluno.nome.charAt(0)}</Text>
                    </View>
                    <View style={styles.alunoDetails}>
                      <Text style={styles.alunoNome}>{formatarNome(aluno.nome)}</Text>
                      <Text style={styles.alunoTurma}>
                        {aluno.turma ? `Turma: ${formatarNomeTurma(aluno.turma.nome)}` : 'Sem turma'}
                      </Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.editButton}
                      onPress={() => router.push(`/detalheAluno?id=${aluno.id}`)}
                    >
                      <MaterialIcons name="edit" size={20} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>
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
  filterContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  filterLabel: {
    fontFamily: "Roboto_Condensed-SemiBold",
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  pickerContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  pickerInput: {
    fontFamily: "Roboto_Condensed-Regular",
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    color: '#333',
    backgroundColor: 'transparent',
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
    fontFamily: "Roboto_Condensed-SemiBold",
    color: '#fff',
    fontSize: 20,
  },
  alunoDetails: {
    flex: 1,
  },
  alunoNome: {
    fontSize: 18,
    fontFamily: "Roboto_Condensed-Regular",
    color: "#333",
    marginBottom: 4,
  },
  alunoTurma: {
    fontFamily: "Roboto_Condensed-Regular",
    fontSize: 12,
    color: "#666",
  },
  editButton: {
    backgroundColor: Colors.blue_btn,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

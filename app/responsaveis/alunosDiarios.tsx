import { useState, useEffect } from 'react';
import { Text, View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Colors from '../constants/colors';
import config from '@/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { formatarNomeTurma } from '../utils/formatText';
import globalStyles from '../../styles/globalStyles';

type Aluno = {
  id: number;
  nome: string;
  turma: {
    id: number;
    nome: string;
  };
};

export default function AlunosResponsavel() {
  const router = useRouter();
  const { responsavelId } = useLocalSearchParams();
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlunos = async () => {
      try {
        setLoading(true);
        const authToken = await AsyncStorage.getItem('@auth_token');
        
        if (!authToken) {
          Toast.show({
            type: 'error',
            text1: 'Erro de autenticação',
            text2: 'Sessão expirada. Por favor, faça login novamente.',
            visibilityTime: 3000
          });
          setTimeout(() => {
            router.replace('/');
          }, 3000);
          return;
        }

        // Verifica se o usuário tem o papel de RESPONSAVEL
        const userDataString = await AsyncStorage.getItem('@user_data');
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          const isResponsavel = userData.roles && userData.roles.includes('RESPONSAVEL');
          
          if (!isResponsavel) {
            Toast.show({
              type: 'error',
              text1: 'Acesso negado',
              text2: 'Você não possui permissão para acessar esta área',
              visibilityTime: 3000
            });
            setTimeout(() => {
              router.replace('/');
            }, 3000);
            return;
          }
        }

        const response = await fetch(`${config.API_URL}/responsaveis/${responsavelId}/alunos`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setAlunos(data);
        } else if (response.status === 401) {
          Toast.show({
            type: 'error',
            text1: 'Sessão expirada',
            text2: 'Por favor, faça login novamente',
            visibilityTime: 3000
          });
          setTimeout(() => {
            router.replace('/');
          }, 3000);
        } else {
          Toast.show({
            type: 'error',
            text1: 'Erro',
            text2: 'Não foi possível carregar os alunos',
            visibilityTime: 3000
          });
        }
      } catch (error) {
        console.error('Erro ao buscar alunos:', error);
        Toast.show({
          type: 'error',
          text1: 'Erro de conexão',
          text2: 'Não foi possível conectar ao servidor',
          visibilityTime: 3000
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAlunos();
  }, [responsavelId]);

  const handleAlunoPress = (alunoId: number, alunoNome: string) => {
    router.push({
      pathname: "/visualizarDiario",
      params: { 
        alunoId: alunoId,
        alunoNome: alunoNome
      }
    });
  };

  const renderItem = ({ item }: { item: Aluno }) => (
    <TouchableOpacity
      style={styles.alunoCard}
      onPress={() => handleAlunoPress(item.id, item.nome)}
    >
      <View style={styles.alunoInfo}>
        <Text style={styles.alunoNome}>{item.nome}</Text>
        <Text style={styles.alunoTurma}>
          Turma: {formatarNomeTurma(item.turma.nome)}
        </Text>
      </View>
      <View style={styles.diarioIcon}>
        <Text style={styles.diarioIconText}>📓</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[globalStyles.container, globalStyles.loadingContainer]}>
        <StatusBar hidden barStyle="light-content" />
        <ActivityIndicator size="large" color="#fff" />
        <Text style={globalStyles.loadingText}>Carregando alunos...</Text>
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <StatusBar hidden barStyle="light-content" />
      
      <View style={globalStyles.header}>
        <Text style={globalStyles.subtitle}>Meus Diários</Text>
      </View>
      
      {alunos.length > 0 ? (
        <FlatList
          data={alunos}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Você não possui alunos cadastrados.
          </Text>
        </View>
      )}
      
      <TouchableOpacity 
        style={globalStyles.backButton}
        onPress={() => router.back()}
      >
        <Text style={globalStyles.backButtonText}>Voltar</Text>
      </TouchableOpacity>
      
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
  },
  alunoCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  alunoInfo: {
    flex: 1,
  },
  alunoNome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  alunoTurma: {
    fontSize: 14,
    color: '#666',
  },
  diarioIcon: {
    marginLeft: 10,
  },
  diarioIconText: {
    fontSize: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
});

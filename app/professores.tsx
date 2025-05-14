import { Text, View, StyleSheet, StatusBar, TouchableOpacity, Platform, ScrollView, ActivityIndicator, RefreshControl } from "react-native";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import Toast from 'react-native-toast-message';
import Colors from "./constants/colors";
import config from '../config';
import { formatarNomeTurma } from "./utils/formatText";

interface Turma {
  id: number;
  nome: string;
}

interface Professor {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  turmas: Turma[];
}

export default function Professores() {
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const handleVoltar = () => {
    router.back();
  };

  const fetchProfessores = async () => {
    try {
      setIsLoading(true);
      const url = config.API_URL.endsWith('/')
        ? `${config.API_URL}professores/professor-turma`
        : `${config.API_URL}/professores/professor-turma`;
      
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        setProfessores(data);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Erro ao buscar professores',
          text2: 'Verifique sua conexão com o servidor',
          visibilityTime: 3000
        });
      }
    } catch (error) {
      console.error('Erro ao buscar professores:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro de conexão',
        text2: 'Não foi possível conectar ao servidor',
        visibilityTime: 3000
      });
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };
  
  useEffect(() => {
    fetchProfessores();
  }, []);
  
  const onRefresh = () => {
    setRefreshing(true);
    fetchProfessores();
  };
  
  return (
    <>
      <View style={styles.container}>
        <StatusBar hidden />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Lista de Professores</Text>
        </View>
        
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Carregando professores...</Text>
          </View>
        ) : (
          <ScrollView 
            style={styles.scrollContent} 
            contentContainerStyle={styles.scrollContentContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {professores.length === 0 ? (
              <View style={styles.emptyContainer}>
                <MaterialIcons name="person-search" size={60} color="#fff" />
                <Text style={styles.emptyText}>Nenhum professor encontrado</Text>
              </View>
            ) : (
              <View style={styles.professorList}>
                {professores.map((professor) => (
                  <View key={professor.id} style={styles.professorCard}>
                    <View style={styles.professorHeader}>
                      <View style={styles.avatarContainer}>
                        <Text style={styles.avatarText}>{professor.nome.charAt(0)}</Text>
                      </View>
                      <View style={styles.professorInfo}>
                        <Text style={styles.professorName}>{professor.nome}</Text>
                        <Text style={styles.professorEmail}>{professor.email}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.contactContainer}>
                      <MaterialIcons name="phone" size={16} color="#666" />
                      <Text style={styles.contactText}>{professor.telefone || "Sem telefone"}</Text>
                    </View>

                    {/* Seção de turmas associadas */}
                    <View style={styles.turmasContainer}>
                      <View style={styles.turmasHeader}>
                        <MaterialIcons name="class" size={16} color="#666" />
                        <Text style={styles.turmasTitle}>Turmas associadas:</Text>
                      </View>
                      
                      {professor.turmas && professor.turmas.length > 0 ? (
                        <View style={styles.turmasList}>
                          {professor.turmas.map(turma => (
                            <View key={turma.id} style={styles.turmaTag}>
                              <Text style={styles.turmaText}>{formatarNomeTurma(turma.nome)}</Text>
                            </View>
                          ))}
                        </View>
                      ) : (
                        <Text style={styles.noTurmasText}>Nenhuma turma associada</Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        )}
        
        <TouchableOpacity style={styles.backButton} onPress={handleVoltar}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
      <Toast />
    </>
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
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#fff',
    marginTop: 16,
    textAlign: 'center',
  },
  professorList: {
    marginTop: 10,
  },
  professorCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  professorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.blue_btn,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textTransform: 'uppercase',
  },
  professorInfo: {
    flex: 1,
  },
  professorName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  professorEmail: {
    fontSize: 14,
    color: '#666',
  },
  contactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  contactText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
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
  },
  turmasContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  turmasHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  turmasTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginLeft: 8,
  },
  turmasList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  turmaTag: {
    backgroundColor: Colors.blue_btn + '20', // 20 é a opacidade em hex (12.5%)
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.blue_btn + '40', // 40 é a opacidade em hex (25%)
  },
  turmaText: {
    color: Colors.blue_btn,
    fontSize: 12,
    fontWeight: '600',
  },
  noTurmasText: {
    color: '#999',
    fontStyle: 'italic',
    fontSize: 14,
    paddingLeft: 24,
  },
});
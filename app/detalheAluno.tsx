import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, ActivityIndicator, Modal, TextInput, FlatList } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatarNome, formatarNomeTurma } from "./utils/formatText";
import Colors from "./constants/colors";
import config from '../config';
import globalStyles from '../styles/globalStyles';

interface Usuario {
  id: number;
  nome: string;
  email: string;
  telefone?: string;
  roles: string[];
}

interface Responsavel {
  id: number;
  nome: string;
  usuario?: {
    id: number;
    nome: string;
    email: string;
    telefone?: string;
  };
}

interface Aluno {
  id: number;
  nome: string;
  dataNasc: string;
  isAtivo: boolean;
  mensalidade?: number;
  createdAt: string;
  updatedAt: string;
  turmaId: number;
  turma?: {
    id: number;
    nome: string;
  };
  responsaveis: Responsavel[];
}

export default function DetalheAluno() {
  const { id } = useLocalSearchParams();
  const [aluno, setAluno] = useState<Aluno | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [selectedResponsavel, setSelectedResponsavel] = useState<Responsavel | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [filteredUsuarios, setFilteredUsuarios] = useState<Usuario[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [adicionandoResponsavel, setAdicionandoResponsavel] = useState(false);
  const [removendoResponsavel, setRemovendoResponsavel] = useState(false);

  const fetchAlunoDetalhes = async () => {
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
        }, 2000);
        return;
      }

      const url = config.API_URL.endsWith('/')
        ? `${config.API_URL}alunos/${id}`
        : `${config.API_URL}/alunos/${id}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAluno(data);
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
          text1: 'Erro ao buscar detalhes do aluno',
          text2: 'Verifique sua conexão com o servidor',
          visibilityTime: 3000
        });
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes do aluno:', error);
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

  const fetchUsuariosResponsaveis = async () => {
    try {
      setLoadingUsuarios(true);
      
      const authToken = await AsyncStorage.getItem('@auth_token');
      
      if (!authToken) {
        Toast.show({
          type: 'error',
          text1: 'Erro de autenticação',
          text2: 'Sessão expirada. Por favor, faça login novamente.',
          visibilityTime: 3000
        });
        return;
      }
      
      const url = config.API_URL.endsWith('/')
        ? `${config.API_URL}usuarios/`
        : `${config.API_URL}/usuarios/`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const responsaveis = data.filter((usuario: Usuario) => 
          usuario.roles && usuario.roles.includes('RESPONSAVEL')
        );
        setUsuarios(responsaveis);
        setFilteredUsuarios(responsaveis);
      } else if (response.status === 401) {
        Toast.show({
          type: 'error',
          text1: 'Erro de autenticação',
          text2: 'Sessão expirada. Por favor, faça login novamente.',
          visibilityTime: 3000
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Erro ao buscar responsáveis',
          text2: 'Verifique sua conexão com o servidor',
          visibilityTime: 3000
        });
      }
    } catch (error) {
      console.error('Erro ao buscar responsáveis:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro de conexão',
        text2: 'Não foi possível conectar ao servidor',
        visibilityTime: 3000
      });
    } finally {
      setLoadingUsuarios(false);
    }
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    
    if (text.trim() === '') {
      setFilteredUsuarios(usuarios);
    } else {
      const filtered = usuarios.filter(
        usuario => usuario.nome.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredUsuarios(filtered);
    }
  };

  const adicionarResponsavel = async (usuario: Usuario) => {
    try {
      setAdicionandoResponsavel(true);
      
      const authToken = await AsyncStorage.getItem('@auth_token');
      
      if (!authToken || !aluno) {
        Toast.show({
          type: 'error',
          text1: 'Erro de autenticação',
          text2: 'Sessão expirada. Por favor, faça login novamente.',
          visibilityTime: 3000
        });
        return;
      }

      const jaEResponsavel = aluno.responsaveis.some(
        resp => resp.usuario && resp.usuario.id === usuario.id
      );
      
      if (jaEResponsavel) {
        Toast.show({
          type: 'info',
          text1: 'Usuário já é responsável',
          text2: 'Este usuário já é responsável por este aluno.',
          visibilityTime: 3000
        });
        setModalVisible(false);
        return;
      }
      
      const url = config.API_URL.endsWith('/')
        ? `${config.API_URL}alunos/${usuario.id}/responsavel`
        : `${config.API_URL}/alunos/${usuario.id}/responsavel`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ 
          alunoId: aluno.id,
          role: 'RESPONSAVEL'
        })
      });
      
      if (response.ok) {
        Toast.show({
          type: 'success',
          text1: 'Responsável adicionado',
          text2: `${usuario.nome} agora é responsável pelo aluno`,
          visibilityTime: 3000
        });

        fetchAlunoDetalhes();
        setModalVisible(false);
      } else {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { erro: "Erro ao processar resposta do servidor" };
          console.error("Erro ao processar resposta JSON:", e);
        }
        Toast.show({
          type: 'error',
          text1: 'Erro ao adicionar responsável',
          text2: errorData.erro || 'Ocorreu um erro desconhecido',
          visibilityTime: 3000
        });
      }
    } catch (error) {
      console.error('Erro ao adicionar responsável:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro de conexão',
        text2: 'Não foi possível conectar ao servidor',
        visibilityTime: 3000
      });
    } finally {
      setAdicionandoResponsavel(false);
    }
  };

  const removerResponsavel = (responsavel: Responsavel) => {
    if (!responsavel.usuario || !aluno) return;
    
    setSelectedResponsavel(responsavel);
    setConfirmModalVisible(true);
  };

  const confirmarRemocaoResponsavel = async () => {
    if (!selectedResponsavel?.usuario || !aluno) return;
    
    try {
      setRemovendoResponsavel(true);
      
      const authToken = await AsyncStorage.getItem('@auth_token');
      
      if (!authToken) {
        Toast.show({
          type: 'error',
          text1: 'Erro de autenticação',
          text2: 'Sessão expirada. Por favor, faça login novamente.',
          visibilityTime: 3000
        });
        return;
      }

      if (!selectedResponsavel.usuario || !selectedResponsavel.usuario.id) {
        Toast.show({
          type: 'error',
          text1: 'Erro ao remover responsável',
          text2: 'Dados do responsável incompletos',
          visibilityTime: 3000
        });
        return;
      }
      
      const url = config.API_URL.endsWith('/')
        ? `${config.API_URL}alunos/${aluno.id}/responsavel/${selectedResponsavel.usuario.id}`
        : `${config.API_URL}/alunos/${aluno.id}/responsavel/${selectedResponsavel.usuario.id}`;
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (response.ok) {
        const nomeResponsavel = selectedResponsavel.usuario?.nome || selectedResponsavel.nome || 'O responsável';
        Toast.show({
          type: 'success',
          text1: 'Responsável removido',
          text2: `${nomeResponsavel} foi removido como responsável do aluno`,
          visibilityTime: 3000
        });
        fetchAlunoDetalhes();
      } else {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { erro: "Erro ao processar resposta do servidor" };
          console.error("Erro ao processar resposta JSON:", e);
        }
        Toast.show({
          type: 'error',
          text1: 'Erro ao remover responsável',
          text2: errorData.erro || 'Ocorreu um erro desconhecido',
          visibilityTime: 3000
        });
      }
    } catch (error) {
      console.error('Erro ao remover responsável:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro de conexão',
        text2: 'Não foi possível conectar ao servidor',
        visibilityTime: 3000
      });
    } finally {
      setRemovendoResponsavel(false);
      setConfirmModalVisible(false);
      setSelectedResponsavel(null);
    }
  };

  const abrirModalResponsaveis = () => {
    setSearchQuery('');
    fetchUsuariosResponsaveis();
    setModalVisible(true);
  };

  useEffect(() => {
    if (id) {
      fetchAlunoDetalhes();
    }
  }, [id]);

  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };

  const formatarMoeda = (valor?: number) => {
    if (valor === undefined || valor === null) return '';
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    });
  };

  const handleVoltar = () => {
    router.back();
  };

  return (
    <View style={globalStyles.container}>
      <StatusBar backgroundColor={Colors.blue_btn} barStyle="light-content" />

      <View style={globalStyles.header}>
        <Text style={globalStyles.headerTitle}>Detalhes do Aluno</Text>
      </View>

      {loading ? (
        <View style={globalStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={globalStyles.loadingText}>Carregando informações...</Text>
        </View>
      ) : aluno ? (
        <ScrollView 
          style={globalStyles.scrollContent} 
          contentContainerStyle={globalStyles.scrollContentContainer}
        >
          <View style={styles.alunoCard}>
            <View style={styles.alunoHeader}>
              <View style={styles.alunoAvatar}>
                <Text style={styles.alunoAvatarText}>{aluno.nome.charAt(0)}</Text>
              </View>
              <Text style={styles.alunoNome}>{formatarNome(aluno.nome)}</Text>
            </View>
            
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Informações Gerais</Text>
              <View style={styles.infoItemColumn}>
                <View style={styles.infoLabelRow}>
                  <MaterialIcons name="event" size={20} color={Colors.blue_btn} />
                  <Text style={styles.infoLabel}>Data de Nascimento:</Text>
                </View>
                <Text style={styles.infoValueColumn}>{formatarData(aluno.dataNasc)}</Text>
              </View>
              <View style={styles.infoItemColumn}>
                <View style={styles.infoLabelRow}>
                  <MaterialIcons name="class" size={20} color={Colors.blue_btn} />
                  <Text style={styles.infoLabel}>Turma:</Text>
                </View>
                <Text style={styles.infoValueColumn}>
                  {aluno.turma ? formatarNomeTurma(aluno.turma.nome) : 'Não atribuída'}
                </Text>
              </View>
              <View style={styles.infoItemColumn}>
                <View style={styles.infoLabelRow}>
                  <MaterialIcons name="check-circle" size={20} color={aluno.isAtivo ? 'green' : 'red'} />
                  <Text style={styles.infoLabel}>Status:</Text>
                </View>
                <Text style={[styles.infoValueColumn, {color: aluno.isAtivo ? 'green' : 'red'}]}>
                  {aluno.isAtivo ? 'Ativo' : 'Inativo'}
                </Text>
              </View>
              {aluno.mensalidade !== undefined && aluno.mensalidade !== null && (
                <View style={styles.infoItemColumn}>
                  <View style={styles.infoLabelRow}>
                    <MaterialIcons name="payment" size={20} color={Colors.blue_btn} />
                    <Text style={styles.infoLabel}>Mensalidade:</Text>
                  </View>
                  <Text style={styles.infoValueColumn}>{formatarMoeda(aluno.mensalidade)}</Text>
                </View>
              )}
              <View style={styles.infoItemColumn}>
                <View style={styles.infoLabelRow}>
                  <MaterialIcons name="calendar-today" size={20} color={Colors.blue_btn} />
                  <Text style={styles.infoLabel}>Cadastrado em:</Text>
                </View>
                <Text style={styles.infoValueColumn}>{formatarData(aluno.createdAt)}</Text>
              </View>
            </View>
            
            <View style={styles.infoSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Responsáveis</Text>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={abrirModalResponsaveis}
                >
                  <MaterialIcons name="person-add" size={20} color="#fff" />
                  <Text style={styles.addButtonText}>Adicionar</Text>
                </TouchableOpacity>
              </View>
              {aluno.responsaveis && aluno.responsaveis.length > 0 ? (
                aluno.responsaveis.map((resp) => (
                  <View key={resp.id} style={styles.responsavelItem}>
                    <View style={styles.responsavelHeader}>
                      <MaterialIcons name="person" size={20} color={Colors.blue_btn} />
                      <Text style={styles.responsavelNome}>
                        {formatarNome(resp.usuario?.nome || resp.nome || 'Responsável')}
                      </Text>
                    </View>
                    {resp.usuario && (
                      <View style={styles.responsavelDetalhes}>
                        {resp.usuario.email && (
                          <View style={styles.infoItemColumn}>
                            <View style={styles.infoLabelRow}>
                              <MaterialIcons name="email" size={16} color="#666" />
                              <Text style={styles.responsavelInfo}>Email:</Text>
                            </View>
                            <Text style={styles.infoValueColumn}>{resp.usuario.email}</Text>
                          </View>
                        )}
                        {resp.usuario.telefone && (
                          <View style={styles.infoItemColumn}>
                            <View style={styles.infoLabelRow}>
                              <MaterialIcons name="phone" size={16} color="#666" />
                              <Text style={styles.responsavelInfo}>Telefone:</Text>
                            </View>
                            <Text style={styles.infoValueColumn}>{resp.usuario.telefone}</Text>
                          </View>
                        )}
                      </View>
                    )}
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removerResponsavel(resp)}
                      disabled={removendoResponsavel}
                    >
                      <MaterialIcons name="remove-circle" size={24} color="red" />
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>Nenhum responsável cadastrado</Text>
              )}
            </View>
          </View>
        </ScrollView>
      ) : (
        <View style={globalStyles.emptyContainer}>
          <MaterialIcons name="error" size={60} color="#fff" />
          <Text style={globalStyles.emptyText}>Aluno não encontrado</Text>
        </View>
      )}
      
      <TouchableOpacity style={globalStyles.backButton} onPress={handleVoltar}>
        <Text style={globalStyles.backButtonText}>Voltar</Text>
      </TouchableOpacity>
      
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecione um Responsável</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.searchContainer}>
              <MaterialIcons name="search" size={20} color="#666" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar por nome..."
                placeholderTextColor="#666"
                value={searchQuery}
                onChangeText={handleSearchChange}
                autoCapitalize="none"
              />
            </View>
            
            {loadingUsuarios ? (
              <ActivityIndicator size="large" color={Colors.blue_btn} style={{ marginTop: 20 }} />
            ) : (
              <FlatList
                data={filteredUsuarios}
                keyExtractor={(item) => item.id.toString()}
                style={styles.usuariosList}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>
                    {searchQuery.trim() ? 'Nenhum usuário encontrado' : 'Nenhum responsável disponível'}
                  </Text>
                }
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.usuarioItem}
                    onPress={() => adicionarResponsavel(item)}
                    disabled={adicionandoResponsavel}
                  >
                    <View style={styles.usuarioInfo}>
                      <View style={styles.usuarioAvatar}>
                        <Text style={styles.usuarioAvatarText}>{item.nome.charAt(0)}</Text>
                      </View>
                      <View style={styles.usuarioDetails}>
                        <Text style={styles.usuarioNome}>{formatarNome(item.nome)}</Text>
                        <Text style={styles.usuarioEmail}>{item.email}</Text>
                        {item.telefone && (
                          <Text style={styles.usuarioTelefone}>{item.telefone}</Text>
                        )}
                      </View>
                      <MaterialIcons name="add-circle" size={24} color={Colors.blue_btn} />
                    </View>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
      
      <Modal
        animationType="slide"
        transparent={true}
        visible={confirmModalVisible}
        onRequestClose={() => setConfirmModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, styles.confirmModalContent]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Remover Responsável</Text>
              <TouchableOpacity
                onPress={() => setConfirmModalVisible(false)}
                style={styles.closeButton}
                disabled={removendoResponsavel}
              >
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.confirmMessageContainer}>
              <MaterialIcons name="warning" size={40} color="#ff9800" style={styles.warningIcon} />
              <Text style={styles.confirmMessage}>
                {selectedResponsavel && aluno
                  ? `Tem certeza que deseja remover ${formatarNome(selectedResponsavel.usuario?.nome || selectedResponsavel.nome || 'este responsável')} como responsável de ${formatarNome(aluno.nome)}?`
                  : 'Tem certeza que deseja remover este responsável?'}
              </Text>
            </View>
            
            <View style={styles.confirmButtonsContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setConfirmModalVisible(false)}
                disabled={removendoResponsavel}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.removeConfirmButton}
                onPress={confirmarRemocaoResponsavel}
                disabled={removendoResponsavel}
              >
                {removendoResponsavel ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.removeConfirmButtonText}>Remover</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  alunoCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  alunoHeader: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 20,
  },
  alunoAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.blue_btn,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  alunoAvatarText: {
    fontFamily: "Roboto_Condensed-Bold",
    color: '#fff',
    fontSize: 36,
  },
  alunoNome: {
    fontFamily: "Roboto_Condensed-SemiBold",
    fontSize: 24,
    color: "#333",
    textAlign: 'center',
  },
  infoSection: {
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 2,
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Roboto_Condensed-SemiBold",
    color: '#333',
    paddingBottom: 0,
    marginBottom: 0,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.blue_btn,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    elevation: 1,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: "Roboto_Condensed-SemiBold",
    marginLeft: 4,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    flexWrap: 'nowrap',
  },
  infoItemColumn: {
    flexDirection: 'column',
    marginBottom: 10,
  },
  infoLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  infoLabel: {
    fontFamily: "Roboto_Condensed-SemiBold",
    fontSize: 15,
    color: '#555',
    marginLeft: 8,
    marginRight: 5,
    flexShrink: 0,
  },
  infoValue: {
    fontFamily: "Roboto_Condensed-Regular",
    fontSize: 12,
    color: '#333',
    flex: 1,
    flexShrink: 1,
  },
  infoValueColumn: {
    fontFamily: "Roboto_Condensed-Regular",
    fontSize: 12,
    color: '#333',
    marginLeft: 28,
  },
  responsavelItem: {
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#eee',
    position: 'relative',
  },
  responsavelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  responsavelNome: {
    fontFamily: "Roboto_Condensed-SemiBold",
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  responsavelDetalhes: {
    marginLeft: 28,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 20,
    padding: 5,
  },
  responsavelInfo: {
    fontFamily: "Roboto_Condensed-Regular",
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  emptyText: {
    fontFamily: "Roboto_Condensed-Regular",
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: "Roboto_Condensed-SemiBold",
    fontSize: 16,
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    fontFamily: "Roboto_Condensed-Regular",
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  usuarioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  usuarioInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  usuarioAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.blue_btn,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  usuarioAvatarText: {
    fontFamily: "Roboto_Condensed-SemiBold",
    color: '#fff',
    fontSize: 18,
  },
  usuarioDetails: {
    flex: 1,
  },
  usuarioNome: {
    fontSize: 16,
    fontFamily: "Roboto_Condensed-SemiBold",
    color: '#333',
    marginBottom: 4,
  },
  usuarioEmail: {
    fontFamily: "Roboto_Condensed-Regular",
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  usuarioTelefone: {
    fontFamily: "Roboto_Condensed-Regular",
    fontSize: 14,
    color: '#666',
  },
  usuariosList: {
    flexGrow: 0,
    maxHeight: '65%',
  },
  confirmModalContent: {
    maxHeight: 'auto',
    width: '85%',
  },
  confirmMessageContainer: {
    alignItems: 'center',
    padding: 16,
    marginBottom: 10,
  },
  warningIcon: {
    marginBottom: 16,
  },
  confirmMessage: {
    fontFamily: "Roboto_Condensed-Regular",
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    lineHeight: 22,
  },
  confirmButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    fontFamily: "Roboto_Condensed-SemiBold",
    fontSize: 16,
    color: '#555',
  },
  removeConfirmButton: {
    flex: 1,
    backgroundColor: '#d9534f',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  removeConfirmButtonText: {
    fontFamily: "Roboto_Condensed-SemiBold",
    fontSize: 16,
    color: '#fff',
  },
});

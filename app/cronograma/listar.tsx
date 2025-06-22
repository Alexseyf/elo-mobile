import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  RefreshControl, 
  StatusBar, 
  Modal,
  Alert,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import globalStyles from '../../styles/globalStyles';
import Colors from '../constants/colors';
import config from '../../config';

interface CronogramaItem {
  id: number;
  titulo: string;
  descricao: string;
  data: string;
  tipoEvento: string;
  isAtivo: boolean;
  criadorId: number;
  createdAt: string;
  updatedAt: string;
}

export default function ListarCronograma() {
  const router = useRouter();
  const [eventos, setEventos] = useState<CronogramaItem[]>([]);
  const [eventosFiltrados, setEventosFiltrados] = useState<CronogramaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mesSelecionado, setMesSelecionado] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [eventoSelecionado, setEventoSelecionado] = useState<CronogramaItem | null>(null);
  const [userType, setUserType] = useState<string>("readonly");
  
  const meses = [
    { valor: 0, texto: 'Janeiro' },
    { valor: 1, texto: 'Fevereiro' },
    { valor: 2, texto: 'Março' },
    { valor: 3, texto: 'Abril' },
    { valor: 4, texto: 'Maio' },
    { valor: 5, texto: 'Junho' },
    { valor: 6, texto: 'Julho' },
    { valor: 7, texto: 'Agosto' },
    { valor: 8, texto: 'Setembro' },
    { valor: 9, texto: 'Outubro' },
    { valor: 10, texto: 'Novembro' },
    { valor: 11, texto: 'Dezembro' }
  ];

  const fetchEventos = async () => {
    try {
      const authToken = await AsyncStorage.getItem('@auth_token');
      
      if (!authToken) {
        Toast.show({
          type: 'error',
          text1: 'Sessão expirada',
          text2: 'Faça login novamente',
          visibilityTime: 3000
        });
        setTimeout(() => {
          router.replace('/');
        }, 3000);
        return false;
      }
      
      const response = await fetch(`${config.API_URL}/cronogramas`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const eventosAtivos = data
          .filter((evento: CronogramaItem) => evento.isAtivo)
          .sort((a: CronogramaItem, b: CronogramaItem) => 
            new Date(a.data).getTime() - new Date(b.data).getTime()
          );
        
        setEventos(eventosAtivos);
        setEventosFiltrados(eventosAtivos);
        
        setMesSelecionado(null);
        return true;
      } else if (response.status === 401) {
        await AsyncStorage.multiRemove(['@auth_token', '@user_id', '@user_data']);
        Toast.show({
          type: 'error',
          text1: 'Sessão expirada',
          text2: 'Faça login novamente',
          visibilityTime: 3000
        });
        setTimeout(() => {
          router.replace('/');
        }, 3000);
        return false;
      } else {
        Toast.show({
          type: 'error',
          text1: 'Erro ao buscar eventos',
          text2: 'Verifique sua conexão',
          visibilityTime: 3000
        });
        return false;
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro de conexão',
        text2: 'Não foi possível conectar ao servidor',
        visibilityTime: 3000
      });
      return false;
    } finally {
      setRefreshing(false);
    }
  };

  const filtrarEventosPorMes = (listaEventos: CronogramaItem[], mes: number | null) => {
    if (mes === null) {
      setEventosFiltrados(listaEventos);
    } else {
      const filtrados = listaEventos.filter((evento) => {
        const dataEvento = new Date(evento.data);
        return dataEvento.getMonth() === mes;
      });
      setEventosFiltrados(filtrados);
    }
  };

  const handleChangeMes = (mes: number | null) => {
    setMesSelecionado(mes);
    filtrarEventosPorMes(eventos, mes);
  };

  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return `${data.getDate().toString().padStart(2, '0')}/${(data.getMonth() + 1).toString().padStart(2, '0')}/${data.getFullYear()}`;
  };

  const traduzirTipoEvento = (tipo: string) => {
    const traducoes: Record<string, string> = {
      'REUNIAO': 'Reunião',
      'FERIADO': 'Feriado',
      'RECESSO': 'Recesso',
      'EVENTO_ESCOLAR': 'Evento Escolar',
      'ATIVIDADE_PEDAGOGICA': 'Atividade Pedagógica',
      'OUTRO': 'Outro'
    };
    return traducoes[tipo] || tipo;
  };

  const getIconeEvento = (tipo: string) => {
    switch (tipo) {
      case 'REUNIAO':
        return 'people';
      case 'FERIADO':
        return 'celebration';
      case 'RECESSO':
        return 'home';
      case 'EVENTO_ESCOLAR':
        return 'school';
      case 'ATIVIDADE_PEDAGOGICA':
        return 'menu-book';
      default:
        return 'event';
    }
  };

  const abrirDetalhesEvento = (evento: CronogramaItem) => {
    setEventoSelecionado(evento);
    setModalVisible(true);
  };

  useEffect(() => {
    if (modalVisible && eventoSelecionado) {
      checkUserRole();
    }
  }, [modalVisible, eventoSelecionado]);

  const fecharModal = () => {
    setModalVisible(false);
    setEventoSelecionado(null);
  };

  const editarEvento = (id: number) => {
    fecharModal();
    router.push({
      pathname: '/cronograma/editar',
      params: { id: id.toString() }
    });
  };

  const deletarEvento = async (id: number) => {
    try {
      const authToken = await AsyncStorage.getItem('@auth_token');
      
      if (!authToken) {
        Toast.show({
          type: 'error',
          text1: 'Sessão expirada',
          text2: 'Faça login novamente',
          visibilityTime: 3000
        });
        setTimeout(() => {
          router.replace('/');
        }, 3000);
        return;
      }
      
      const response = await fetch(`${config.API_URL}/cronogramas/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });
      
      if (response.ok) {
        fecharModal();
        Toast.show({
          type: 'success',
          text1: 'Evento removido com sucesso!',
          text2: 'O evento foi excluído do cronograma',
          visibilityTime: 3000
        });
        fetchEventos();
      } else if (response.status === 401) {
        await AsyncStorage.multiRemove(['@auth_token', '@user_id', '@user_data']);
        Toast.show({
          type: 'error',
          text1: 'Sessão expirada',
          text2: 'Faça login novamente',
          visibilityTime: 3000
        });
        setTimeout(() => {
          router.replace('/');
        }, 3000);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Erro ao remover evento',
          text2: 'Verifique sua conexão',
          visibilityTime: 3000
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro de conexão',
        text2: 'Não foi possível conectar ao servidor',
        visibilityTime: 3000
      });
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await checkUserRole();
      await fetchEventos();
      setLoading(false);
    };
    
    init();
  }, []);

  const checkUserRole = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('@user_data');
      
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        
        if (userData.roles && Array.isArray(userData.roles)) {
          const isUserAdmin = userData.roles.includes('ADMIN');
          
          if (isUserAdmin) {
            setUserType("ADMIN");
            return;
          } else {
            setUserType("readonly");
            return;
          }
        }
      }
      
      const authToken = await AsyncStorage.getItem('@auth_token');
      
      if (!authToken) {
        setUserType("readonly");
        return;
      }
      
      const response = await fetch(`${config.API_URL}/usuario-logado`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });
      
      if (response.ok) {
        const userData = await response.json();
        
        await AsyncStorage.setItem('@user_data', JSON.stringify(userData));
        
        if (userData.roles && Array.isArray(userData.roles)) {
          const isUserAdmin = userData.roles.includes('ADMIN');
          
          if (isUserAdmin) {
            setUserType("ADMIN");
          } else {
            setUserType("readonly");
          }
        } else {
          setUserType("readonly");
        }
      } else {
        setUserType("readonly");
      }
    } catch (error) {
      setUserType("readonly");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await checkUserRole();
    await fetchEventos();
  };

  const renderModalButtons = () => {
    if (userType !== "ADMIN") {
      return (
        <View style={styles.modalFooterResponsavel}>
          <TouchableOpacity
            style={[styles.button, styles.buttonFechar]}
            onPress={fecharModal}
          >
            <Text style={styles.buttonText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    return (
      <View style={styles.modalFooter}>
        <TouchableOpacity
          style={[styles.button, styles.buttonEditar]}
          onPress={() => {
            if (eventoSelecionado) {
              editarEvento(eventoSelecionado.id);
            }
          }}
        >
          <MaterialIcons name="edit" size={20} color="#fff" />
          <Text style={styles.buttonText}>Editar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.buttonDeletar]}
          onPress={() => {
            if (eventoSelecionado) {
              Alert.alert(
                "Remover Evento",
                "Tem certeza que deseja remover este evento?",
                [
                  { text: "Cancelar", style: "cancel" },
                  { text: "Remover", onPress: () => deletarEvento(eventoSelecionado.id), style: "destructive" }
                ]
              );
            }
          }}
        >
          <MaterialIcons name="delete" size={20} color="#fff" />
          <Text style={styles.buttonText}>Excluir</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={globalStyles.container}>
      <StatusBar hidden barStyle="light-content" />
      <View style={globalStyles.header}>
        <Text style={globalStyles.headerTitle}>Cronograma Escolar Anual</Text>
      </View>
      
      {loading ? (
        <View style={globalStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={globalStyles.loadingText}>Carregando eventos...</Text>
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
            <Text style={styles.filterLabel}>Filtrar por Mês:</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={mesSelecionado}
                onValueChange={(itemValue) => handleChangeMes(itemValue)}
                style={styles.pickerInput}
                dropdownIconColor="#333"
                mode={Platform.OS === 'ios' ? 'dropdown' : 'dialog'}
                prompt="Selecione um mês"
              >
                <Picker.Item 
                  label="Todos os meses" 
                  value={null} 
                  color="#333" 
                />
                {meses.map((mes) => (
                  <Picker.Item
                    key={mes.valor}
                    label={mes.texto}
                    value={mes.valor}
                    color="#333"
                  />
                ))}
              </Picker>
            </View>
          </View>

          {eventos.length === 0 ? (
            <View style={globalStyles.emptyContainer}>
              <MaterialIcons name="event-busy" size={60} color="#fff" />
              <Text style={globalStyles.emptyText}>
                Nenhum evento encontrado no cronograma
              </Text>
            </View>
          ) : eventosFiltrados.length === 0 ? (
            <View style={globalStyles.emptyContainer}>
              <MaterialIcons name="filter-alt" size={60} color="#fff" />
              <Text style={globalStyles.emptyText}>
                Nenhum evento encontrado para este mês
              </Text>
            </View>
          ) : (
            <View>
              {eventosFiltrados.map((evento) => (
                <TouchableOpacity 
                  key={evento.id} 
                  style={globalStyles.card}
                  onPress={() => abrirDetalhesEvento(evento)}
                  activeOpacity={0.7}
                >
                  <View style={styles.eventoInfo}>
                    <View style={[styles.eventoIcone, getEstiloEvento(evento.tipoEvento)]}>
                      <MaterialIcons name={getIconeEvento(evento.tipoEvento)} size={24} color="#fff" />
                    </View>
                    <View style={styles.eventoDetails}>
                      <Text style={styles.eventoTitulo}>{evento.titulo}</Text>
                      <Text style={styles.eventoData}>{formatarData(evento.data)}</Text>
                      <Text style={styles.eventoTipo}>{traduzirTipoEvento(evento.tipoEvento)}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      )}
      
      {/* Modal de detalhes do evento */}
      {eventoSelecionado && modalVisible && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={true}
          onRequestClose={fecharModal}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{eventoSelecionado.titulo}</Text>
                <TouchableOpacity style={styles.closeButton} onPress={fecharModal}>
                  <MaterialIcons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.modalContent}>
                <View style={styles.modalIconContainer}>
                  <View style={[styles.modalEvento, getEstiloEvento(eventoSelecionado.tipoEvento)]}>
                    <MaterialIcons name={getIconeEvento(eventoSelecionado.tipoEvento)} size={36} color="#fff" />
                  </View>
                </View>
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Data:</Text>
                  <Text style={styles.infoValue}>{formatarData(eventoSelecionado.data)}</Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Tipo:</Text>
                  <Text style={styles.infoValue}>{traduzirTipoEvento(eventoSelecionado.tipoEvento)}</Text>
                </View>
                
                {eventoSelecionado.descricao ? (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Descrição:</Text>
                    <Text style={styles.infoValue}>{eventoSelecionado.descricao}</Text>
                  </View>
                ) : null}
              </ScrollView>
              
              {userType === "ADMIN" ? (
                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={[styles.button, styles.buttonEditar]}
                    onPress={() => {
                      if (eventoSelecionado) {
                        editarEvento(eventoSelecionado.id);
                      }
                    }}
                  >
                    <MaterialIcons name="edit" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Editar</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.button, styles.buttonDeletar]}
                    onPress={() => {
                      if (eventoSelecionado) {
                        Alert.alert(
                          "Remover Evento",
                          "Tem certeza que deseja remover este evento?",
                          [
                            { text: "Cancelar", style: "cancel" },
                            { text: "Remover", onPress: () => deletarEvento(eventoSelecionado.id), style: "destructive" }
                          ]
                        );
                      }
                    }}
                  >
                    <MaterialIcons name="delete" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Excluir</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.modalFooterResponsavel}>
                  <TouchableOpacity
                    style={[styles.button, styles.buttonFechar]}
                    onPress={fecharModal}
                  >
                    <Text style={styles.buttonText}>Fechar</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </Modal>
      )}
      
      <TouchableOpacity style={globalStyles.backButton} onPress={() => router.back()}>
        <Text style={globalStyles.backButtonText}>Voltar</Text>
      </TouchableOpacity>
      <Toast />
    </View>
  );
}

const getEstiloEvento = (tipo: string) => {
  switch (tipo) {
    case 'REUNIAO':
      return styles.reuniao;
    case 'FERIADO':
      return styles.feriado;
    case 'RECESSO':
      return styles.recesso;
    case 'EVENTO_ESCOLAR':
      return styles.eventoEscolar;
    case 'ATIVIDADE_PEDAGOGICA':
      return styles.atividadePedagogica;
    default:
      return styles.outro;
  }
};

const styles = StyleSheet.create({
  filterContainer: {
    backgroundColor: "#ffffff",
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
    color: "#333",
    marginBottom: 10,
  },
  pickerContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    overflow: 'hidden',
    marginBottom: 8,
  },
  pickerWrapper: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    overflow: 'hidden',
    ...Platform.select({
      android: {
        elevation: 0,
        paddingHorizontal: 0,
      }
    }),
  },
  pickerInput: {
    color: "#333",
    backgroundColor: "#fff",
    fontFamily: "Roboto_Condensed-Regular",
    fontSize: 16,
    height: 50,
    width: '100%',
    ...Platform.select({
      android: {
        color: "#333",
      },
    }),
  },
  
  eventoInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
  },
  eventoIcone: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  eventoDetails: {
    flex: 1,
  },
  eventoTitulo: {
    fontSize: 18,
    fontFamily: "Roboto_Condensed-SemiBold",
    color: "#333",
    marginBottom: 4,
  },
  eventoData: {
    fontFamily: "Roboto_Condensed-Regular",
    fontSize: 14,
    color: "#555",
    marginBottom: 2,
  },
  eventoTipo: {
    fontFamily: "Roboto_Condensed-SemiBold",
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontFamily: "Roboto_Condensed-SemiBold",
    fontSize: 20,
    color: "#333",
    flex: 1,
  },
  closeButton: {
    padding: 5,
  },
  modalContent: {
    padding: 16,
    maxHeight: 300,
  },
  modalIconContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  modalEvento: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
  },
  infoRow: {
    marginBottom: 15,
  },
  infoLabel: {
    fontFamily: "Roboto_Condensed-SemiBold",
    fontSize: 16,
    color: "#555",
    marginBottom: 5,
  },
  infoValue: {
    fontFamily: "Roboto_Condensed-Regular",
    fontSize: 16,
    color: "#333",
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    minWidth: 120,
  },
  buttonText: {
    fontFamily: "Roboto_Condensed-SemiBold",
    fontSize: 16,
    color: "#fff",
    marginLeft: 8,
  },
  buttonEditar: {
    backgroundColor: Colors.blue_btn,
  },
  buttonDeletar: {
    backgroundColor: "#e74c3c",
  },
  buttonFechar: {
    backgroundColor: Colors.blue_btn,
  },
  modalFooterResponsavel: {
    flexDirection: "row",
    justifyContent: "center",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  
  reuniao: {
    backgroundColor: "#4a90e2",
  },
  feriado: {
    backgroundColor: "#e74c3c",
  },
  recesso: {
    backgroundColor: "#8e44ad",
  },
  eventoEscolar: {
    backgroundColor: "#27ae60",
  },
  atividadePedagogica: {
    backgroundColor: "#f39c12",
  },
  outro: {
    backgroundColor: "#95a5a6",
  },
});

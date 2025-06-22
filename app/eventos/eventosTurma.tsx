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
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import globalStyles from '../../styles/globalStyles';
import Colors from '../constants/colors';
import config from '../../config';
import { formatarNomeTurma } from '../utils/formatText';

interface Aluno {
  id: number;
  nome: string;
  dataNasc: string;
  isAtivo: boolean;
  turmaId: number;
  turma: {
    id: number;
    nome: string;
  };
  
}

interface EventoItem {
  id: number;
  titulo: string;
  descricao: string;
  data: string;
  horaInicio: string;
  horaFim: string;
  tipoEvento: string;
  isAtivo: boolean;
  turmaId: number;
  turma?: {
    id: number;
    nome: string;
  };
  criadorId: number;
  createdAt: string;
  updatedAt: string;
}

export default function EventosTurma() {
  const router = useRouter();
  const [eventos, setEventos] = useState<EventoItem[]>([]);
  const [eventosFiltrados, setEventosFiltrados] = useState<EventoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mesSelecionado, setMesSelecionado] = useState<number | null>(null);
  const [turmaId, setTurmaId] = useState<number | null>(null);
  const [turmas, setTurmas] = useState<{id: number, nome: string}[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [eventoSelecionado, setEventoSelecionado] = useState<EventoItem | null>(null);
  const [userType, setUserType] = useState<string>("readonly");
  const [alunosDoResponsavel, setAlunosDoResponsavel] = useState<Aluno[]>([]);
  const [alunoSelecionadoId, setAlunoSelecionadoId] = useState<number | null>(null);
  
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

  useEffect(() => {
    const inicializar = async () => {
      setLoading(true);
      await fetchAlunosDoResponsavel();
      setLoading(false);
    };
    inicializar();
  }, []);

  useEffect(() => {
    if (alunosDoResponsavel.length > 0 && alunoSelecionadoId === null) {
      setAlunoSelecionadoId(alunosDoResponsavel[0].id);
      setTurmaId(alunosDoResponsavel[0].turmaId);
    }
  }, [alunosDoResponsavel]);

  useEffect(() => {
    if (alunoSelecionadoId !== null) {
      const alunoSelecionado = alunosDoResponsavel.find(aluno => aluno.id === alunoSelecionadoId);
      if (alunoSelecionado) {
        setTurmaId(alunoSelecionado.turmaId);
      }
    }
  }, [alunoSelecionadoId]);
  
  useEffect(() => {
    if (turmaId !== null) {
      fetchEventos();
    }
  }, [turmaId]);

  const fetchAlunosDoResponsavel = async () => {
    try {
      const authToken = await AsyncStorage.getItem('@auth_token');
      const userData = await AsyncStorage.getItem('@user_data');
      
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

      let userId = null;
      if (userData) {
        const user = JSON.parse(userData);
        userId = user.id;
      }

      if (!userId) {
        Toast.show({
          type: 'error',
          text1: 'Dados do usuário não encontrados',
          text2: 'Faça login novamente',
          visibilityTime: 3000
        });
        setTimeout(() => {
          router.replace('/');
        }, 3000);
        return false;
      }

      const url = config.API_URL.endsWith('/')
        ? `${config.API_URL}responsaveis/${userId}/alunos`
        : `${config.API_URL}/responsaveis/${userId}/alunos`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });
      
      if (response.ok) {
        const alunos = await response.json();
        setAlunosDoResponsavel(alunos);

        const turmasUnicas = alunos.reduce((acc: {id: number, nome: string}[], aluno: Aluno) => {
          if (aluno.turma && !acc.some(t => t.id === aluno.turma.id)) {
            acc.push({
              id: aluno.turma.id,
              nome: formatarNomeTurma(aluno.turma.nome)
            });
          }
          return acc;
        }, []);

        setTurmas(turmasUnicas);
        
        if (alunos.length > 0) {
          setAlunoSelecionadoId(alunos[0].id);
          if (alunos[0].turma) {
            setTurmaId(alunos[0].turmaId);
          }
          await fetchEventos();
        }
        
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
          text1: 'Erro ao buscar alunos',
          text2: 'Verifique sua conexão',
          visibilityTime: 3000
        });
        return false;
      }
    } catch (error) {
      console.error("Erro ao buscar alunos do responsável:", error);
      Toast.show({
        type: 'error',
        text1: 'Erro de conexão',
        text2: 'Não foi possível conectar ao servidor',
        visibilityTime: 3000
      });
      return false;
    }
  };

  const fetchEventos = async () => {
    try {
      if (!turmaId) {
        setEventos([]);
        setEventosFiltrados([]);
        setLoading(false);
        setRefreshing(false);
        return false;
      }
      
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
      const url = config.API_URL.endsWith('/')
        ? `${config.API_URL}eventos`
        : `${config.API_URL}/eventos`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        
        let eventosAtivos = data
          .filter((evento: EventoItem) => evento.isAtivo)
          .sort((a: EventoItem, b: EventoItem) => 
            new Date(a.data).getTime() - new Date(b.data).getTime()
          );
        
        setEventos(eventosAtivos);
        filtrarEventos(eventosAtivos, turmaId, mesSelecionado);

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
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAlunosDoResponsavel();
    await fetchEventos();
  };

  const filtrarEventos = (eventosLista = eventos, turmaFiltro = turmaId, mesFiltro = mesSelecionado) => {
    let filtrados = [...eventosLista];
    
    if (mesFiltro !== null) {
      filtrados = filtrados.filter((evento) => {
        const dataEvento = new Date(evento.data);
        return dataEvento.getMonth() === mesFiltro;
      });
    }

    if (turmaFiltro !== null) {
      filtrados = filtrados.filter((evento) => {
        return evento.turmaId === turmaFiltro;
      });
    }
    
    setEventosFiltrados(filtrados);
  };

  useEffect(() => {
    filtrarEventos();
  }, [mesSelecionado, turmaId, eventos]);

  const handleChangeMes = (mes: number | null) => {
    setMesSelecionado(mes);
  };

  const handleChangeAluno = (id: number | null) => {
    setAlunoSelecionadoId(id);
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

  const abrirDetalhesEvento = (evento: EventoItem) => {
    setEventoSelecionado(evento);
    setModalVisible(true);
  };

  const fecharModal = () => {
    setModalVisible(false);
    setEventoSelecionado(null);
  };

  return (
    <View style={globalStyles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.blue_btn} />
      
      <View style={globalStyles.header}>
        <Text style={globalStyles.headerTitle}>Eventos da Turma</Text>
        {alunosDoResponsavel.length > 0 && alunoSelecionadoId && (
          <Text style={globalStyles.headerSubtitle}>
            {alunosDoResponsavel.find(a => a.id === alunoSelecionadoId)?.turma?.nome 
              ? formatarNomeTurma(alunosDoResponsavel.find(a => a.id === alunoSelecionadoId)?.turma?.nome || '') 
              : 'Turma não encontrada'}
          </Text>
        )}
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
              tintColor={Colors.blue_btn}
            />
          }
        >
          <View style={styles.filterContainer}>
            {alunosDoResponsavel.length > 1 && (
              <View style={styles.filterRow}>
                <Text style={styles.filterLabel}>Aluno:</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={alunoSelecionadoId}
                    style={styles.picker}
                    onValueChange={(itemValue) => handleChangeAluno(itemValue)}
                    dropdownIconColor="#333"
                  >
                    {alunosDoResponsavel.map((aluno) => (
                      <Picker.Item
                        key={aluno.id}
                        label={aluno.nome ? aluno.nome.split(' ')[0] : `Aluno ${aluno.id}`}
                        value={aluno.id}
                      />
                    ))}
                  </Picker>
                </View>
              </View>
            )}
            
            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Mês:</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={mesSelecionado}
                  style={styles.picker}
                  onValueChange={(itemValue) => handleChangeMes(itemValue)}
                  dropdownIconColor="#333"
                >
                  <Picker.Item label="Todos os meses" value={null} />
                  {meses.map((mes) => (
                    <Picker.Item
                      key={mes.valor}
                      label={mes.texto}
                      value={mes.valor}
                    />
                  ))}
                </Picker>
              </View>
            </View>
          </View>
          
          {eventosFiltrados.length > 0 ? (
            eventosFiltrados.map((evento) => (
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
                    <Text style={styles.eventoTituloText}>{evento.titulo}</Text>
                    <Text style={styles.eventoDataText}>{formatarData(evento.data)}</Text>
                    <Text style={styles.eventoHorario}>{evento.horaInicio} - {evento.horaFim}</Text>
                    <Text style={styles.eventoTipoText}>{traduzirTipoEvento(evento.tipoEvento)}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={globalStyles.emptyContainer}>
              <MaterialIcons name="event-busy" size={60} color="#fff" />
              <Text style={globalStyles.emptyText}>
                {mesSelecionado !== null 
                  ? "Nenhum evento encontrado com os filtros atuais" 
                  : "Nenhum evento cadastrado para esta turma"}
              </Text>
            </View>
          )}
        </ScrollView>
      )}
      
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={fecharModal}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{eventoSelecionado?.titulo}</Text>
              <TouchableOpacity style={styles.closeButton} onPress={fecharModal}>
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              {eventoSelecionado && (
                <>
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
                    <Text style={styles.infoLabel}>Horário:</Text>
                    <Text style={styles.infoValue}>{eventoSelecionado.horaInicio} - {eventoSelecionado.horaFim}</Text>
                  </View>
                  
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Tipo:</Text>
                    <Text style={styles.infoValue}>{traduzirTipoEvento(eventoSelecionado.tipoEvento)}</Text>
                  </View>
                  
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Turma:</Text>
                    <Text style={styles.infoValue}>
                      {eventoSelecionado.turma ? formatarNomeTurma(eventoSelecionado.turma.nome) : `ID: ${eventoSelecionado.turmaId}`}
                    </Text>
                  </View>
                  
                  {eventoSelecionado.descricao ? (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Descrição:</Text>
                      <Text style={styles.infoValue}>{eventoSelecionado.descricao}</Text>
                    </View>
                  ) : null}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
            <TouchableOpacity style={globalStyles.backButton} onPress={() => router.back()}>
              <Text style={globalStyles.backButtonText}>Voltar</Text>
            </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  filterContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filterRow: {
    marginBottom: 10,
  },
  filterLabel: {
    fontFamily: 'Roboto_Condensed-SemiBold',
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    backgroundColor: '#f9f9f9',
  },
  eventoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  eventoIcone: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  eventoDetails: {
    flex: 1,
    paddingVertical: 5,
  },
  eventoTituloText: {
    fontSize: 18,
    fontFamily: "Roboto_Condensed-SemiBold",
    color: "#333",
    marginBottom: 4,
  },
  eventoDataText: {
    fontFamily: "Roboto_Condensed-Regular",
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
  },
  eventoHorario: {
    fontFamily: "Roboto_Condensed-Regular",
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
    fontStyle: 'italic',
  },
  eventoTipoText: {
    fontFamily: "Roboto_Condensed-SemiBold",
    fontSize: 13,
    color: "#666",
    marginBottom: 2,
    backgroundColor: 'rgba(240, 240, 240, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  // Estilos para tipos de evento
  reuniao: {
    backgroundColor: '#4A90E2',
  },
  feriado: {
    backgroundColor: '#E2574A',
  },
  recesso: {
    backgroundColor: '#50E3C2',
  },
  eventoEscolar: {
    backgroundColor: '#F5A623',
  },
  atividadePedagogica: {
    backgroundColor: '#9013FE',
  },
  outro: {
    backgroundColor: '#95A5A6',
  },
  // Estilos do Modal
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
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "Roboto_Condensed-SemiBold",
    color: "#333",
    flex: 1,
  },
  closeButton: {
    padding: 5,
  },
  modalContent: {
    padding: 16,
  },
  modalIconContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  modalEvento: {
    width: 70,
    height: 70,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  infoRow: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: "Roboto_Condensed-SemiBold",
    color: "#555",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontFamily: "Roboto_Condensed-Regular",
    color: "#333",
  },
});

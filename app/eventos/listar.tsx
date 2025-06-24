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

import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import globalStyles from '../../styles/globalStyles';
import Colors from '../constants/colors';
import config from '../../config';
import { formatarNomeTurma } from '../utils/formatText';

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

export default function ListarEventos() {
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
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isProfessor, setIsProfessor] = useState<boolean>(false);
  const [professorId, setProfessorId] = useState<number | null>(null);
  const [turmasProfessor, setTurmasProfessor] = useState<number[]>([]);
  const [filtroModalVisible, setFiltroModalVisible] = useState(false);
  const [filtroTurmaModalVisible, setFiltroTurmaModalVisible] = useState(false);
  
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
      const userRole = await checkUserRole();
      
      if (userRole.isProfessor && userRole.professorId) {
        await fetchTurmasProfessor(userRole.professorId);
      }
      
      await Promise.all([
        carregarTurmas(userRole),
        fetchEventos(userRole)
      ]);
      
      setLoading(false);
    };
    inicializar();
  }, []);


  
  const carregarTurmas = async (userRole?: { isAdmin: boolean, isProfessor: boolean, professorId: number | null }) => {
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

      const admin = userRole ? userRole.isAdmin : isAdmin;
      const professor = userRole ? userRole.isProfessor : isProfessor;
      const profId = userRole ? userRole.professorId : professorId;
      
      const response = await fetch(`${config.API_URL}/turmas`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const todasTurmas = data.map((turma: any) => ({
          ...turma,
          nome: formatarNomeTurma(turma.nome)
        }));
        
        if (admin) {
          setTurmas(todasTurmas);
          return true;
        } 

        else if (professor && profId) {
          if (turmasProfessor.length > 0) {
            const turmasFiltradas = todasTurmas.filter(
              (turma: any) => turmasProfessor.includes(turma.id)
            );
            setTurmas(turmasFiltradas);
            
            if (turmasFiltradas.length > 0 && turmaId === null) {
              setTurmaId(turmasFiltradas[0].id);
            }
            return true;
          } else {
            const url = config.API_URL.endsWith("/")
              ? `${config.API_URL}professores/${profId}/turmas`
              : `${config.API_URL}/professores/${profId}/turmas`;
            
            const responseProfessor = await fetch(url, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
              },
            });
            
            if (responseProfessor.ok) {
              const dataProfessor = await responseProfessor.json();
              const turmasProfessorFormatadas = dataProfessor.map((turma: any) => ({
                ...turma,
                nome: formatarNomeTurma(turma.nome)
              }));
              
              setTurmas(turmasProfessorFormatadas);
              
              const turmasIds = turmasProfessorFormatadas.map((turma: any) => turma.id);
              setTurmasProfessor(turmasIds);

              if (turmasProfessorFormatadas.length > 0 && turmaId === null) {
                setTurmaId(turmasProfessorFormatadas[0].id);
              }
              return true;
            }
          }
        } else {
          setTurmas(todasTurmas);
          return true;
        }
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
      }
      return false;
    } catch (error) {
      console.error("Erro ao carregar turmas:", error);
      return false;
    }
  };

  const fetchEventos = async (userRole?: { isAdmin: boolean, isProfessor: boolean, professorId: number | null }) => {
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

      const admin = userRole ? userRole.isAdmin : isAdmin;
      const professor = userRole ? userRole.isProfessor : isProfessor;
      
      
      const response = await fetch(`${config.API_URL}/eventos`, {
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
        
        if (professor && !admin && turmasProfessor.length > 0) {
          eventosAtivos.forEach((evento: EventoItem) => {
          });
          
          eventosAtivos = eventosAtivos.filter((evento: EventoItem) => {
            const pertenceAoProfessor = turmasProfessor.includes(evento.turmaId);
            if (!pertenceAoProfessor) {
            }
            return pertenceAoProfessor;
          });
        } else if (admin) {
        }
        
        setEventos(eventosAtivos);
        setEventosFiltrados(eventosAtivos);

        setMesSelecionado(null);

        if (professor && !admin && turmasProfessor.length > 0 && turmas.length > 0) {
          if (turmaId === null) {
            setTurmaId(turmas[0].id);
          }
        } else {
          setTurmaId(null);
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

  const onRefresh = async () => {
    setRefreshing(true);
    const userRole = await checkUserRole();
    
    if (userRole.isProfessor && userRole.professorId) {
      await fetchTurmasProfessor(userRole.professorId);
    }
    
    await Promise.all([
      carregarTurmas(userRole),
      fetchEventos(userRole)
    ]);
  };

  const filtrarEventos = () => {
    let filtrados = [...eventos];
    
    if (mesSelecionado !== null) {
      filtrados = filtrados.filter((evento) => {
        const dataEvento = new Date(evento.data);
        return dataEvento.getMonth() === mesSelecionado;
      });
    }

    if ((turmaId !== null) || (isProfessor && !isAdmin)) {
      filtrados = filtrados.filter((evento) => {
        if (isProfessor && !isAdmin && turmaId === null && turmas.length > 0) {
          return evento.turmaId === turmas[0].id;
        }
        return evento.turmaId === turmaId;
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

  const handleChangeTurma = (id: number | null) => {
    setTurmaId(id);
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

  const checkUserRole = async () => {
    try {
      const userDataStr = await AsyncStorage.getItem('@user_data');
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        
        let admin = false;
        let professor = false;
        let profId = null;

        if (userData.roles && Array.isArray(userData.roles)) {
          admin = userData.roles.includes('ADMIN');
          professor = userData.roles.includes('PROFESSOR');
          
          if (professor && userData.id) {
            profId = userData.id;
          }
        } 
        else if (userData.role) {
          admin = userData.role === 'ADMIN';
          professor = userData.role === 'PROFESSOR';
          
          if (professor && userData.id) {
            profId = userData.id;
          }
        }

        setIsAdmin(admin);
        setIsProfessor(professor);
        
        if (admin || professor) {
          setUserType('editor');
        } else {
          setUserType('readonly');
        }
        
        if (profId) {
          setProfessorId(profId);
        }
        
        return { 
          isAdmin: admin, 
          isProfessor: professor, 
          professorId: profId 
        };
      } else {
        setUserType('readonly');
        setIsAdmin(false);
        setIsProfessor(false);
        return { isAdmin: false, isProfessor: false, professorId: null };
      }
    } catch (error) {
      setUserType('readonly');
      setIsAdmin(false);
      setIsProfessor(false);
      return { isAdmin: false, isProfessor: false, professorId: null };
    }
  };

  useEffect(() => {
    checkUserRole();
  }, []);

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
      pathname: '/eventos/editar',
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
      
      const response = await fetch(`${config.API_URL}/eventos/${id}`, {
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
          text2: 'O evento foi excluído',
          visibilityTime: 3000
        });

        const userRole = await checkUserRole();
        if (userRole.isProfessor && userRole.professorId) {
          await fetchTurmasProfessor(userRole.professorId);
        }
        await fetchEventos(userRole);
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
      } else if (response.status === 403) {
        Toast.show({
          type: 'error',
          text1: 'Permissão negada',
          text2: 'Você não tem permissão para excluir este evento',
          visibilityTime: 3000
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Erro ao excluir',
          text2: 'Verifique sua conexão e tente novamente',
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

  const confirmarDelecao = (id: number) => {
    Alert.alert(
      "Excluir Evento",
      "Tem certeza que deseja excluir este evento?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", onPress: () => deletarEvento(id), style: "destructive" }
      ]
    );
  };

  // Funções para o modal de filtro
  const openFiltroModal = () => {
    setFiltroModalVisible(true);
  };

  const closeFiltroModal = () => {
    setFiltroModalVisible(false);
  };

  const selecionarMes = (mes: number | null) => {
    handleChangeMes(mes);
    closeFiltroModal();
  };

  // Funções para o modal de filtro de turmas
  const openFiltroTurmaModal = () => {
    setFiltroTurmaModalVisible(true);
  };

  const closeFiltroTurmaModal = () => {
    setFiltroTurmaModalVisible(false);
  };

  const selecionarTurma = (id: number | null) => {
    handleChangeTurma(id);
    closeFiltroTurmaModal();
  };

  const fetchTurmasProfessor = async (id?: number) => {
    try {
      const idToUse = id || professorId;

      if (!idToUse) {
        console.error("ID do professor não encontrado");
        return false;
      }

      const authToken = await AsyncStorage.getItem("@auth_token");

      if (!authToken) {
        Toast.show({
          type: "error",
          text1: "Sessão expirada",
          text2: "Por favor, faça login novamente",
          visibilityTime: 3000,
        });
        setTimeout(() => {
          router.replace("/");
        }, 3000);
        return false;
      }

      const url = config.API_URL.endsWith("/")
        ? `${config.API_URL}professores/${idToUse}/turmas`
        : `${config.API_URL}/professores/${idToUse}/turmas`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const turmasComNomesFormatados = data.map((turma: any) => ({
          ...turma,
          nome: formatarNomeTurma(turma.nome)
        }));
        
        const turmasIds = turmasComNomesFormatados.map((turma: any) => turma.id);
        setTurmasProfessor(turmasIds);
        return true;
      } else if (response.status === 401) {
        await AsyncStorage.removeItem("@auth_token");
        await AsyncStorage.removeItem("@user_id");

        Toast.show({
          type: "error",
          text1: "Sessão expirada",
          text2: "Por favor, faça login novamente",
          visibilityTime: 3000,
        });
        setTimeout(() => {
          router.replace("/");
        }, 3000);
        return false;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Erro ao buscar turmas do professor:", error);
      return false;
    }
  };

  return (
    <View style={globalStyles.container}>
      <StatusBar hidden barStyle="light-content" />
      <View style={globalStyles.header}>
        <Text style={globalStyles.headerTitle}>Lista de Eventos</Text>
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
            <TouchableOpacity 
              style={styles.filterButton}
              onPress={openFiltroModal}
            >
              <Text style={styles.filterButtonText}>
                {mesSelecionado !== null ? meses[mesSelecionado].texto : 'Todos os meses'}
              </Text>
              <MaterialIcons name="arrow-drop-down" size={24} color="#333" />
            </TouchableOpacity>
            
            <Text style={styles.filterLabel}>
              Filtrar por turma:
            </Text>
            <TouchableOpacity 
              style={styles.filterButton}
              onPress={openFiltroTurmaModal}
            >
              <Text style={styles.filterButtonText}>
                {turmaId !== null 
                  ? turmas.find(t => t.id === turmaId)?.nome || 'Turma não encontrada' 
                  : 'Todas as turmas'}
              </Text>
              <MaterialIcons name="arrow-drop-down" size={24} color="#333" />
            </TouchableOpacity>
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
                    <Text style={styles.eventoDataText}>
                      {evento.turma ? formatarNomeTurma(evento.turma.nome) : `Turma ID: ${evento.turmaId}`}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={globalStyles.emptyContainer}>
              <MaterialIcons name="event-busy" size={60} color="#fff" />
              <Text style={globalStyles.emptyText}>
                {mesSelecionado !== null || turmaId !== null 
                  ? "Nenhum evento encontrado com os filtros atuais" 
                  : "Nenhum evento cadastrado"}
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
            
            {userType === 'editor' ? (
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
                      confirmarDelecao(eventoSelecionado.id);
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
      
      {/* Modal de filtro de meses */}
      <Modal
        visible={filtroModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeFiltroModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.filtroModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtrar por Mês</Text>
              <TouchableOpacity style={styles.closeButton} onPress={closeFiltroModal}>
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.monthList}>
              <TouchableOpacity 
                style={[
                  styles.monthItem,
                  mesSelecionado === null && styles.monthItemSelected
                ]}
                onPress={() => selecionarMes(null)}
              >
                <MaterialIcons 
                  name={mesSelecionado === null ? "radio-button-checked" : "radio-button-unchecked"} 
                  size={22} 
                  color={mesSelecionado === null ? Colors.blue_btn : "#666"} 
                />
                <Text style={styles.monthText}>Todos os meses</Text>
              </TouchableOpacity>
              
              {meses.map((mes) => (
                <TouchableOpacity 
                  key={mes.valor}
                  style={[
                    styles.monthItem,
                    mesSelecionado === mes.valor && styles.monthItemSelected
                  ]}
                  onPress={() => selecionarMes(mes.valor)}
                >
                  <MaterialIcons 
                    name={mesSelecionado === mes.valor ? "radio-button-checked" : "radio-button-unchecked"} 
                    size={22} 
                    color={mesSelecionado === mes.valor ? Colors.blue_btn : "#666"} 
                  />
                  <Text style={styles.monthText}>{mes.texto}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
      
      {/* Modal de filtro de turmas */}
      <Modal
        visible={filtroTurmaModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeFiltroTurmaModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.filtroModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtrar por Turma</Text>
              <TouchableOpacity style={styles.closeButton} onPress={closeFiltroTurmaModal}>
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.monthList}>
              {/* Se não for professor, mostra a opção "Todas as turmas" */}
              {!isProfessor && (
                <TouchableOpacity 
                  style={[
                    styles.monthItem,
                    turmaId === null && styles.monthItemSelected
                  ]}
                  onPress={() => selecionarTurma(null)}
                >
                  <MaterialIcons 
                    name={turmaId === null ? "radio-button-checked" : "radio-button-unchecked"} 
                    size={22} 
                    color={turmaId === null ? Colors.blue_btn : "#666"} 
                  />
                  <Text style={styles.monthText}>Todas as turmas</Text>
                </TouchableOpacity>
              )}
              
              {turmas.map((turma) => (
                <TouchableOpacity 
                  key={turma.id}
                  style={[
                    styles.monthItem,
                    turmaId === turma.id && styles.monthItemSelected
                  ]}
                  onPress={() => selecionarTurma(turma.id)}
                >
                  <MaterialIcons 
                    name={turmaId === turma.id ? "radio-button-checked" : "radio-button-unchecked"} 
                    size={22} 
                    color={turmaId === turma.id ? Colors.blue_btn : "#666"} 
                  />
                  <Text style={styles.monthText}>{turma.nome}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
      
      <TouchableOpacity style={globalStyles.backButton} onPress={() => router.back()}>
        <Text style={globalStyles.backButtonText}>Voltar</Text>
      </TouchableOpacity>
      
      <Toast />
    </View>
  );
}

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
  filterSection: {
    marginBottom: 5,
  },
  filterLabel: {
    fontFamily: "Roboto_Condensed-SemiBold",
    fontSize: 16,
    color: "#333",
    marginBottom: 10,
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
    marginBottom: 2,
  },
  eventoHorario: {
    fontFamily: "Roboto_Condensed-Regular",
    fontSize: 14,
    color: "#555",
    marginBottom: 2,
  },
  eventoTipoText: {
    fontFamily: "Roboto_Condensed-SemiBold",
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },

  eventoCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 15,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  eventoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  eventoTitulo: {
    fontSize: 0,
    display: 'none',
  },
  eventoData: {
    fontSize: 0,
    display: 'none',
  },
  eventoTipo: {
    fontSize: 0,
    display: 'none',
  },
  noEventosContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  noEventosText: {
    fontSize: 18,
    fontFamily: 'Roboto_Condensed-SemiBold',
    color: '#666',
    marginTop: 15,
  },
  noEventosSubText: {
    fontSize: 14,
    fontFamily: 'Roboto_Condensed-Regular',
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
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
  filterButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  filterButtonText: {
    fontFamily: "Roboto_Condensed-Regular",
    fontSize: 15,
    color: '#333',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  filtroModalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    maxHeight: '80%',
  },
  monthList: {
    marginBottom: 15,
  },
  monthItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  monthItemSelected: {
    backgroundColor: Colors.blue_btn + '20',
  },
  monthText: {
    fontFamily: "Roboto_Condensed-Regular",
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  // Cores para os tipos de eventos
  reuniao: {
    backgroundColor: '#4a90e2',
  },
  feriado: {
    backgroundColor: '#e67e22',
  },
  recesso: {
    backgroundColor: '#2ecc71',
  },
  eventoEscolar: {
    backgroundColor: '#3498db',
  },
  atividadePedagogica: {
    backgroundColor: '#9b59b6',
  },
  outro: {
    backgroundColor: '#95a5a6',
  },
});

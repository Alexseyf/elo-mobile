import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, ActivityIndicator, StatusBar, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import globalStyles from '../../styles/globalStyles';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../../config';
import DatePickerModal from '../components/DatePickerModal';
import Colors from '../constants/colors';
import { formatarNomeTurma } from '../utils/formatText';

const TIPO_EVENTO = {
  REUNIAO: 'REUNIAO',
  FERIADO: 'FERIADO',
  RECESSO: 'RECESSO',
  EVENTO_ESCOLAR: 'EVENTO_ESCOLAR',
  ATIVIDADE_PEDAGOGICA: 'ATIVIDADE_PEDAGOGICA',
  OUTRO: 'OUTRO',
};

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

export default function EditarEvento() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { id } = params;
  
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [data, setData] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFim, setHoraFim] = useState('');
  const [tipoEvento, setTipoEvento] = useState(TIPO_EVENTO.OUTRO);
  const [turmaId, setTurmaId] = useState<number | null>(null);
  const [turmas, setTurmas] = useState<{id: number, nome: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [diaTemp, setDiaTemp] = useState('');
  const [mesTemp, setMesTemp] = useState('');
  const [anoTemp, setAnoTemp] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [eventoOriginal, setEventoOriginal] = useState<EventoItem | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isProfessor, setIsProfessor] = useState<boolean>(false);
  const [professorId, setProfessorId] = useState<number | null>(null);
  const [turmasProfessor, setTurmasProfessor] = useState<number[]>([]);

  const dias = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const meses = [
    { valor: '01', texto: 'Janeiro' },
    { valor: '02', texto: 'Fevereiro' },
    { valor: '03', texto: 'Março' },
    { valor: '04', texto: 'Abril' },
    { valor: '05', texto: 'Maio' },
    { valor: '06', texto: 'Junho' },
    { valor: '07', texto: 'Julho' },
    { valor: '08', texto: 'Agosto' },
    { valor: '09', texto: 'Setembro' },
    { valor: '10', texto: 'Outubro' },
    { valor: '11', texto: 'Novembro' },
    { valor: '12', texto: 'Dezembro' }
  ];
  const anoAtual = new Date().getFullYear();
  const anos = Array.from({ length: 20 }, (_, i) => (anoAtual - i).toString());

  useEffect(() => {
    verificarPermissoes();
  }, []);

  const verificarPermissoes = async () => {
    try {
      setCarregando(true);
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
        setUserRole(admin ? 'ADMIN' : professor ? 'PROFESSOR' : 'RESPONSAVEL');
        
        if (profId) {
          setProfessorId(profId);
        }
        
        if (!admin && !professor) {
          Toast.show({ 
            type: 'error', 
            text1: 'Acesso negado', 
            text2: 'Você não tem permissão para editar eventos', 
            visibilityTime: 3000 
          });
          setTimeout(() => router.back(), 3000);
          return;
        }

        if (professor && profId) {
          await buscarTurmasProfessor(profId);
        } 
        else if (admin) {
          await buscarTodasTurmas();
        }
        
        if (id) {
          await carregarEvento();
        } else {
          router.back();
        }
      } else {
        Toast.show({ 
          type: 'error', 
          text1: 'Erro de autenticação', 
          text2: 'Usuário não autenticado', 
          visibilityTime: 3000 
        });
        setTimeout(() => router.replace('/'), 3000);
      }
    } catch (error) {
      console.error('Erro ao verificar permissões:', error);
      Toast.show({ 
        type: 'error', 
        text1: 'Erro de autenticação', 
        text2: 'Não foi possível verificar suas permissões', 
        visibilityTime: 3000 
      });
      setTimeout(() => router.back(), 3000);
    } finally {
      setCarregando(false);
    }
  };

  const buscarTurmasProfessor = async (profId: number) => {
    try {
      const authToken = await AsyncStorage.getItem('@auth_token');
      
      if (!authToken) {
        Toast.show({ 
          type: 'error', 
          text1: 'Erro de autenticação', 
          text2: 'Usuário não autenticado', 
          visibilityTime: 3000 
        });
        setTimeout(() => router.back(), 3000);
        return;
      }

      const url = config.API_URL.endsWith("/")
        ? `${config.API_URL}professores/${profId}/turmas`
        : `${config.API_URL}/professores/${profId}/turmas`;
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const turmasProfessorFormatadas = data.map((turma: any) => ({
          ...turma,
          nome: formatarNomeTurma(turma.nome)
        }));

        setTurmas(turmasProfessorFormatadas);
        const turmasIds = turmasProfessorFormatadas.map((turma: any) => turma.id);
        setTurmasProfessor(turmasIds);
      } else if (response.status === 401) {
        await AsyncStorage.multiRemove(['@auth_token', '@user_id', '@user_data']);
        Toast.show({ 
          type: 'error', 
          text1: 'Sessão expirada', 
          text2: 'Faça login novamente', 
          visibilityTime: 3000 
        });
        setTimeout(() => router.replace('/'), 3000);
      } else {
        Toast.show({ 
          type: 'error', 
          text1: 'Erro ao carregar turmas', 
          text2: 'Verifique sua conexão', 
          visibilityTime: 3000 
        });
      }
    } catch (error) {
      console.error('Erro ao carregar turmas do professor:', error);
      Toast.show({ 
        type: 'error', 
        text1: 'Erro de conexão', 
        text2: 'Não foi possível conectar ao servidor', 
        visibilityTime: 3000 
      });
    }
  };

  const buscarTodasTurmas = async () => {
    try {
      const authToken = await AsyncStorage.getItem('@auth_token');
      
      if (!authToken) {
        Toast.show({ 
          type: 'error', 
          text1: 'Erro de autenticação', 
          text2: 'Usuário não autenticado', 
          visibilityTime: 3000 
        });
        setTimeout(() => router.back(), 3000);
        return;
      }

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

        setTurmas(todasTurmas);
      } else if (response.status === 401) {
        await AsyncStorage.multiRemove(['@auth_token', '@user_id', '@user_data']);
        Toast.show({ 
          type: 'error', 
          text1: 'Sessão expirada', 
          text2: 'Faça login novamente', 
          visibilityTime: 3000 
        });
        setTimeout(() => router.replace('/'), 3000);
      } else {
        Toast.show({ 
          type: 'error', 
          text1: 'Erro ao carregar turmas', 
          text2: 'Verifique sua conexão', 
          visibilityTime: 3000 
        });
      }
    } catch (error) {
      console.error('Erro ao carregar todas as turmas:', error);
      Toast.show({ 
        type: 'error', 
        text1: 'Erro de conexão', 
        text2: 'Não foi possível conectar ao servidor', 
        visibilityTime: 3000 
      });
    }
  };



  const carregarEvento = async () => {
    try {
      const authToken = await AsyncStorage.getItem('@auth_token');
      
      if (!authToken) {
        Toast.show({ 
          type: 'error', 
          text1: 'Erro de autenticação', 
          text2: 'Usuário não autenticado', 
          visibilityTime: 3000 
        });
        setTimeout(() => router.back(), 3000);
        return;
      }
      
      const response = await fetch(`${config.API_URL}/eventos/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });
      
      if (response.ok) {
        const evento = await response.json();
        setEventoOriginal(evento);

        if (isProfessor && !isAdmin && turmasProfessor.length > 0) {
          if (!turmasProfessor.includes(evento.turmaId)) {
            Toast.show({ 
              type: 'error', 
              text1: 'Permissão negada', 
              text2: 'Você não pode editar eventos de outras turmas', 
              visibilityTime: 3000 
            });
            setTimeout(() => router.back(), 3000);
            return;
          }
        }
        
        const dataObj = new Date(evento.data);
        const dataFormatada = `${dataObj.getFullYear()}-${String(dataObj.getMonth() + 1).padStart(2, '0')}-${String(dataObj.getDate()).padStart(2, '0')}`;
        
        setTitulo(evento.titulo);
        setDescricao(evento.descricao || '');
        setData(dataFormatada);
        setHoraInicio(evento.horaInicio);
        setHoraFim(evento.horaFim);
        setTipoEvento(evento.tipoEvento);
        setTurmaId(evento.turmaId);
      } else if (response.status === 404) {
        Toast.show({ 
          type: 'error', 
          text1: 'Evento não encontrado', 
          text2: 'O evento solicitado não existe ou foi removido', 
          visibilityTime: 3000 
        });
        setTimeout(() => router.back(), 3000);
      } else if (response.status === 401) {
        await AsyncStorage.multiRemove(['@auth_token', '@user_id', '@user_data']);
        Toast.show({ 
          type: 'error', 
          text1: 'Sessão expirada', 
          text2: 'Faça login novamente', 
          visibilityTime: 3000 
        });
        setTimeout(() => router.replace('/'), 3000);
      } else {
        Toast.show({ 
          type: 'error', 
          text1: 'Erro ao carregar evento', 
          text2: 'Verifique sua conexão', 
          visibilityTime: 3000 
        });
      }
    } catch (error) {
      console.error('Erro ao carregar evento:', error);
      Toast.show({ 
        type: 'error', 
        text1: 'Erro de conexão', 
        text2: 'Não foi possível conectar ao servidor', 
        visibilityTime: 3000 
      });
    } finally {
      setCarregando(false);
    }
  };

  const handleVoltar = () => router.back();

  const validateFields = () => {
    if (!titulo.trim() || titulo.length > 100) {
      Toast.show({ type: 'error', text1: 'Título inválido', text2: 'Máx. 100 caracteres', visibilityTime: 3000 });
      return false;
    }
    if (descricao.length > 500) {
      Toast.show({ type: 'error', text1: 'Descrição muito longa', text2: 'Máx. 500 caracteres', visibilityTime: 3000 });
      return false;
    }
    if (!data.match(/^\d{4}-\d{2}-\d{2}$/)) {
      Toast.show({ type: 'error', text1: 'Data inválida', text2: 'Formato: AAAA-MM-DD', visibilityTime: 3000 });
      return false;
    }
    if (!horaInicio.match(/^\d{2}:\d{2}$/)) {
      Toast.show({ type: 'error', text1: 'Hora de início inválida', text2: 'Formato: HH:MM', visibilityTime: 3000 });
      return false;
    }
    if (!horaFim.match(/^\d{2}:\d{2}$/)) {
      Toast.show({ type: 'error', text1: 'Hora de término inválida', text2: 'Formato: HH:MM', visibilityTime: 3000 });
      return false;
    }
    if (!turmaId) {
      Toast.show({ type: 'error', text1: 'Turma não selecionada', text2: 'Selecione uma turma', visibilityTime: 3000 });
      return false;
    }

    const dataObj = new Date(`${data}T00:00:00.000Z`);
    if (isNaN(dataObj.getTime())) {
      Toast.show({ type: 'error', text1: 'Data inválida', text2: 'A data informada não é válida', visibilityTime: 3000 });
      return false;
    }
    return true;
  };

  const formatarDataIso = (dataStr: string): string => {
    if (!dataStr) return '';
    const dataObj = new Date(`${dataStr}T00:00:00.000Z`);
    return dataObj.toISOString();
  };

  const getChangedFields = () => {
    if (!eventoOriginal) return null;
    
    const dataOriginal = new Date(eventoOriginal.data);
    const dataOriginalFormatada = `${dataOriginal.getFullYear()}-${String(dataOriginal.getMonth() + 1).padStart(2, '0')}-${String(dataOriginal.getDate()).padStart(2, '0')}`;
    
    const changes: { [key: string]: any } = {};
    
    if (titulo !== eventoOriginal.titulo) changes.titulo = titulo;
    if (descricao !== (eventoOriginal.descricao || '')) changes.descricao = descricao;
    if (data !== dataOriginalFormatada) changes.data = formatarDataIso(data);
    if (horaInicio !== eventoOriginal.horaInicio) changes.horaInicio = horaInicio;
    if (horaFim !== eventoOriginal.horaFim) changes.horaFim = horaFim;
    if (tipoEvento !== eventoOriginal.tipoEvento) changes.tipoEvento = tipoEvento;
    if (turmaId !== eventoOriginal.turmaId) changes.turmaId = turmaId;
    
    return Object.keys(changes).length > 0 ? changes : null;
  };

  const handleSubmit = async () => {
    if (!validateFields()) return;
    
    const changedFields = getChangedFields();
    
    if (!changedFields) {
      Toast.show({ 
        type: 'info', 
        text1: 'Sem alterações', 
        text2: 'Nenhum campo foi alterado', 
        visibilityTime: 3000 
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const authToken = await AsyncStorage.getItem('@auth_token');
      
      if (!authToken) {
        Toast.show({ type: 'error', text1: 'Erro de autenticação', text2: 'Usuário não autenticado', visibilityTime: 3000 });
        setIsLoading(false);
        return;
      }
      if (isProfessor && !isAdmin && turmasProfessor.length > 0) {
        if (!turmasProfessor.includes(eventoOriginal?.turmaId!)) {
          Toast.show({ 
            type: 'error', 
            text1: 'Permissão negada', 
            text2: 'Você só pode editar eventos de suas turmas', 
            visibilityTime: 3000 
          });
          setIsLoading(false);
          return;
        }
        if (changedFields.turmaId && !turmasProfessor.includes(changedFields.turmaId)) {
          Toast.show({ 
            type: 'error', 
            text1: 'Permissão negada', 
            text2: 'Você só pode mudar para turmas que você leciona', 
            visibilityTime: 3000 
          });
          setIsLoading(false);
          return;
        }
      }
      
      const response = await fetch(`${config.API_URL}/eventos/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(changedFields),
      });
      
      if (response.ok) {
        Toast.show({ 
          type: 'success', 
          text1: 'Evento atualizado com sucesso!', 
          text2: `${titulo} foi atualizado.`,
          visibilityTime: 3000,
          onHide: () => router.push('/eventos/listar')
        });
      } else if (response.status === 403) {
        Toast.show({ 
          type: 'error', 
          text1: 'Permissão negada', 
          text2: 'Você não tem permissão para editar este evento', 
          visibilityTime: 3000 
        });
      } else {
        const error = await response.json();
        let errorMessage = 'Erro desconhecido';

        if (error.erro && error.erro.issues && Array.isArray(error.erro.issues)) {
          errorMessage = error.erro.issues[0]?.message || 'Erro de validação';
        } else if (error.erro && error.erro.message) {
          errorMessage = error.erro.message;
        }
        
        Toast.show({ 
          type: 'error', 
          text1: 'Erro ao atualizar', 
          text2: errorMessage, 
          visibilityTime: 3000 
        });
      }
    } catch (e) {
      console.error('Erro ao atualizar evento:', e);
      Toast.show({ type: 'error', text1: 'Erro de conexão', text2: 'Tente novamente', visibilityTime: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExcluir = () => {
    Alert.alert(
      "Excluir Evento",
      "Tem certeza que deseja excluir este evento?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", onPress: excluirEvento, style: "destructive" }
      ]
    );
  };

  const excluirEvento = async () => {
    setIsLoading(true);
    try {
      const authToken = await AsyncStorage.getItem('@auth_token');
      
      if (!authToken) {
        Toast.show({ type: 'error', text1: 'Erro de autenticação', text2: 'Usuário não autenticado', visibilityTime: 3000 });
        setIsLoading(false);
        return;
      }

      if (isProfessor && !isAdmin && turmasProfessor.length > 0) {
        if (!turmasProfessor.includes(eventoOriginal?.turmaId!)) {
          Toast.show({ 
            type: 'error', 
            text1: 'Permissão negada', 
            text2: 'Você só pode excluir eventos de suas turmas', 
            visibilityTime: 3000 
          });
          setIsLoading(false);
          return;
        }
      }
      
      const response = await fetch(`${config.API_URL}/eventos/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });
      
      if (response.ok) {
        Toast.show({ 
          type: 'success', 
          text1: 'Evento excluído com sucesso!', 
          visibilityTime: 3000,
          onHide: () => router.push('/eventos/listar')
        });
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
          text1: 'Erro ao excluir evento', 
          text2: 'Tente novamente mais tarde', 
          visibilityTime: 3000 
        });
      }
    } catch (e) {
      console.error('Erro ao excluir evento:', e);
      Toast.show({ type: 'error', text1: 'Erro de conexão', text2: 'Tente novamente', visibilityTime: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  const openDatePicker = () => {
    setDiaTemp(data ? data.slice(8, 10) : dias[0]);
    setMesTemp(data ? data.slice(5, 7) : meses[0].valor);
    setAnoTemp(data ? data.slice(0, 4) : anos[0]);
    setModalVisible(true);
  };

  const confirmDate = () => {
    setData(`${anoTemp}-${mesTemp}-${diaTemp}`);
    setModalVisible(false);
  };

  const fetchTurmasProfessor = async (id?: number) => {
    const idToUse = id || professorId;
    if (!idToUse) {
      console.error("ID do professor não encontrado");
      return false;
    }
    await buscarTurmasProfessor(idToUse);
    return true;
  };

  return (
    <View style={globalStyles.container}>
      <StatusBar hidden barStyle="light-content" />
      <View style={globalStyles.header}>
        <Text style={globalStyles.headerTitle}>Editar Evento</Text>
      </View>
      
      {carregando ? (
        <View style={globalStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={globalStyles.loadingText}>Carregando evento...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.formContainer} keyboardShouldPersistTaps="handled">
          <TextInput
            style={globalStyles.input}
            placeholder="Título"
            value={titulo}
            onChangeText={setTitulo}
            maxLength={100}
          />
          <TextInput
            style={[globalStyles.input, { height: 80 }]}
            placeholder="Descrição (opcional)"
            value={descricao}
            onChangeText={setDescricao}
            maxLength={500}
            multiline
          />
          <TouchableOpacity style={[globalStyles.input, { justifyContent: 'center' }]} onPress={openDatePicker} activeOpacity={0.8}>
            <Text style={{ color: data ? '#222' : '#888', fontSize: 16, textAlignVertical: 'center', fontFamily: 'Roboto_Condensed-ExtraLight' }}>
              {data ? `${diaTemp || data.slice(8,10)}/${mesTemp || data.slice(5,7)}/${anoTemp || data.slice(0,4)}` : 'Data'}
            </Text>
          </TouchableOpacity>
          
          <View style={styles.timeInputsContainer}>
            <TextInput
              style={[globalStyles.input, styles.timeInput]}
              placeholder="Hora Início (HH:MM)"
              value={horaInicio}
              onChangeText={setHoraInicio}
              maxLength={5}
              keyboardType="numbers-and-punctuation"
            />
            <TextInput
              style={[globalStyles.input, styles.timeInput]}
              placeholder="Hora Fim (HH:MM)"
              value={horaFim}
              onChangeText={setHoraFim}
              maxLength={5}
              keyboardType="numbers-and-punctuation"
            />
          </View>
          
          <DatePickerModal
            visible={modalVisible}
            dias={dias}
            meses={meses}
            anos={anos}
            diaTemp={diaTemp}
            mesTemp={mesTemp}
            anoTemp={anoTemp}
            setDiaTemp={setDiaTemp}
            setMesTemp={setMesTemp}
            setAnoTemp={setAnoTemp}
            onCancel={() => setModalVisible(false)}
            onConfirm={confirmDate}
            title="Selecione a data"
          />
          
          <View style={styles.pickerContainer}>
            <Text style={globalStyles.formLabelLight}>Tipo de Evento</Text>
            <View style={styles.tiposContainer}>
              {Object.entries(TIPO_EVENTO).map(([key, tipo]) => (
                <TouchableOpacity
                  key={tipo}
                  style={[
                    styles.tipoButton,
                    tipoEvento === tipo && styles.tipoButtonSelected
                  ]}
                  onPress={() => setTipoEvento(tipo)}
                >
                  <Text style={[
                    styles.tipoButtonText,
                    tipoEvento === tipo && styles.tipoButtonTextSelected
                  ]}>
                    {key.replace(/_/g, ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.pickerContainer}>
            <Text style={globalStyles.formLabelLight}>Turma</Text>
            <View style={styles.tiposContainer}>
              {turmas.map((turma) => (
                <TouchableOpacity
                  key={turma.id}
                  style={[
                    styles.tipoButton,
                    turmaId === turma.id && styles.tipoButtonSelected
                  ]}
                  onPress={() => setTurmaId(turma.id)}
                >
                  <Text style={[
                    styles.tipoButtonText,
                    turmaId === turma.id && styles.tipoButtonTextSelected
                  ]}>
                    {turma.nome}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={globalStyles.submitButtonAlt} onPress={handleSubmit} disabled={isLoading}>
              {isLoading ? <ActivityIndicator color={Colors.blue_btn} /> : <Text style={globalStyles.submitButtonAltText}>Salvar Alterações</Text>}
            </TouchableOpacity>
            
            {(userRole === 'ADMIN' || userRole === 'PROFESSOR') && (
              <TouchableOpacity style={styles.deleteButton} onPress={handleExcluir} disabled={isLoading}>
                {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.deleteButtonText}>Excluir Evento</Text>}
              </TouchableOpacity>
            )}
          </View>
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
  formContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  pickerContainer: {
    marginVertical: 10,
  },
  tiposContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  tipoButton: {
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  tipoButtonSelected: {
    backgroundColor: '#4a90e2',
  },
  tipoButtonText: {
    color: '#333',
    fontFamily: 'Roboto_Condensed-Regular',
    fontSize: 14,
    textAlign: 'center',
  },
  tipoButtonTextSelected: {
    color: "#fff",
    fontFamily: "Roboto_Condensed-SemiBold",
  },
  timeInputsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  timeInput: {
    width: '48%',
  },
  buttonsContainer: {
    marginTop: 10,
  },
  deleteButton: {
    backgroundColor: '#e53935',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  deleteButtonText: {
    color: '#fff',
    fontFamily: 'Roboto_Condensed-SemiBold',
    fontSize: 16,
  }
});

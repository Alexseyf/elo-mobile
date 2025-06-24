import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, ActivityIndicator, Platform, Switch, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import globalStyles from '../../styles/globalStyles';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../../config';
import DatePickerModal from '../components/DatePickerModal';
import TimePickerModal from '../components/TimePickerModal';
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

export default function CadastrarEvento() {
  const router = useRouter();
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [data, setData] = useState('');
  const [horaInicio, setHoraInicio] = useState('08:00');
  const [horaFim, setHoraFim] = useState('09:00');
  const [tipoEvento, setTipoEvento] = useState(TIPO_EVENTO.OUTRO);
  const [isAtivo, setIsAtivo] = useState(true);
  const [turmaId, setTurmaId] = useState<number | null>(null);
  const [turmas, setTurmas] = useState<{id: number, nome: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTurmas, setIsLoadingTurmas] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [diaTemp, setDiaTemp] = useState('');
  const [mesTemp, setMesTemp] = useState('');
  const [anoTemp, setAnoTemp] = useState('');
  const [horaInicioModalVisible, setHoraInicioModalVisible] = useState(false);
  const [horaFimModalVisible, setHoraFimModalVisible] = useState(false);
  const [horaInicioTemp, setHoraInicioTemp] = useState('08');
  const [horaFimTemp, setHoraFimTemp] = useState('09');
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
  const horas = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));

  useEffect(() => {
    const inicializar = async () => {
      const userRole = await checkUserRole();
      if (userRole.isProfessor && userRole.professorId) {
        await fetchTurmasProfessor(userRole.professorId);
      }
      await carregarTurmas(userRole);
    };
    inicializar();
  }, []);

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
        
        if (profId) {
          setProfessorId(profId);
        }

        return { 
          isAdmin: admin, 
          isProfessor: professor, 
          professorId: profId 
        };
      } else {
        setIsAdmin(false);
        setIsProfessor(false);
        return { isAdmin: false, isProfessor: false, professorId: null };
      }
    } catch (error) {
      console.error('Erro ao verificar papel do usuário:', error);
      setIsAdmin(false);
      setIsProfessor(false);
      return { isAdmin: false, isProfessor: false, professorId: null };
    }
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
      } else {
        console.error(`Erro ao buscar turmas do professor ${idToUse}:`, response.status);
        return false;
      }
    } catch (error) {
      console.error("Erro ao buscar turmas do professor:", error);
      return false;
    }
  };

  const carregarTurmas = async (userRole?: { isAdmin: boolean, isProfessor: boolean, professorId: number | null }) => {
    try {
      setIsLoadingTurmas(true);
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
          if (todasTurmas.length > 0) {
            setTurmaId(todasTurmas[0].id);
          }
        } 
        else if (professor && profId) {
          if (turmasProfessor.length > 0) {

            const turmasFiltradas = todasTurmas.filter(
              (turma: any) => turmasProfessor.includes(turma.id)
            );
            setTurmas(turmasFiltradas);
            if (turmasFiltradas.length > 0) {
              setTurmaId(turmasFiltradas[0].id);
            }
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
              
              if (turmasProfessorFormatadas.length > 0) {
                setTurmaId(turmasProfessorFormatadas[0].id);
              }
              
              const turmasIds = turmasProfessorFormatadas.map((turma: any) => turma.id);
              setTurmasProfessor(turmasIds);
            }
          }
        } else {
          setTurmas(todasTurmas);
          if (todasTurmas.length > 0) {
            setTurmaId(todasTurmas[0].id);
          }
        }
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
      console.error('Erro ao carregar turmas:', error);
      Toast.show({ 
        type: 'error', 
        text1: 'Erro de conexão', 
        text2: 'Não foi possível conectar ao servidor', 
        visibilityTime: 3000 
      });
    } finally {
      setIsLoadingTurmas(false);
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
      Toast.show({ type: 'error', text1: 'Data inválida', text2: 'A data deve ser informada', visibilityTime: 3000 });
      return false;
    }
    if (!horaInicio) {
      Toast.show({ type: 'error', text1: 'Hora de início inválida', text2: 'Selecione uma hora de início', visibilityTime: 3000 });
      return false;
    }
    if (!horaFim) {
      Toast.show({ type: 'error', text1: 'Hora de término inválida', text2: 'Selecione uma hora de término', visibilityTime: 3000 });
      return false;
    }

    if (horaInicio >= horaFim) {
      Toast.show({ 
        type: 'error', 
        text1: 'Horário inválido', 
        text2: 'A hora de término deve ser posterior à hora de início', 
        visibilityTime: 3000 
      });
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

  const handleSubmit = async () => {
    if (!validateFields()) return;
    
    if (!tipoEvento) {
      setTipoEvento(TIPO_EVENTO.OUTRO);
    }
    
    setIsLoading(true);
    try {
      const authToken = await AsyncStorage.getItem('@auth_token');
      const userId = await AsyncStorage.getItem('@user_id');
      
      if (!authToken || !userId) {
        Toast.show({ type: 'error', text1: 'Erro de autenticação', text2: 'Usuário não autenticado', visibilityTime: 3000 });
        setIsLoading(false);
        return;
      }

      if (isProfessor && !isAdmin && turmasProfessor.length > 0) {
        if (!turmasProfessor.includes(turmaId!)) {
          Toast.show({ 
            type: 'error', 
            text1: 'Permissão negada', 
            text2: 'Você só pode cadastrar eventos para suas turmas', 
            visibilityTime: 3000 
          });
          setIsLoading(false);
          return;
        }
      }
      
      const formatarDataIso = (dataStr: string): string => {
        if (!dataStr) return '';
        const dataObj = new Date(`${dataStr}T00:00:00.000Z`);
        return dataObj.toISOString();
      };
      
      const body = {
        titulo,
        descricao,
        data: formatarDataIso(data),
        horaInicio,
        horaFim,
        tipoEvento: tipoEvento || TIPO_EVENTO.OUTRO,
        isAtivo,
        turmaId,
        criadorId: parseInt(userId, 10)
      };
      
      const response = await fetch(`${config.API_URL}/eventos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(body),
      });
      
      if (response.status === 201) {
        Toast.show({ 
          type: 'success', 
          text1: 'Evento cadastrado com sucesso!', 
          text2: `${titulo} foi adicionado ao sistema.`,
          visibilityTime: 3000,
          onHide: () => router.back()
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
          text1: 'Erro ao cadastrar', 
          text2: errorMessage, 
          visibilityTime: 3000 
        });
      }
    } catch (e) {
      console.error('Erro ao cadastrar evento:', e);
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

  const openHoraInicioPicker = () => {
    const horaAtual = horaInicio ? horaInicio.split(':')[0] : '08';
    setHoraInicioTemp(horaAtual);
    setHoraInicioModalVisible(true);
  };

  const confirmHoraInicio = (hora: string) => {
    setHoraInicioTemp(hora);
    setHoraInicio(`${hora}:00`);
    setHoraInicioModalVisible(false);
  };

  const openHoraFimPicker = () => {
    const horaAtual = horaFim ? horaFim.split(':')[0] : '09';
    setHoraFimTemp(horaAtual);
    setHoraFimModalVisible(true);
  };

  const confirmHoraFim = (hora: string) => {
    setHoraFimTemp(hora);
    setHoraFim(`${hora}:00`);
    setHoraFimModalVisible(false);
  };

  return (
    <View style={globalStyles.container}>
      <StatusBar hidden barStyle="light-content" />
      <View style={globalStyles.header}>
        <Text style={globalStyles.headerTitle}>Cadastrar Evento</Text>
      </View>
      
      {isLoadingTurmas ? (
        <View style={globalStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={globalStyles.loadingText}>Carregando turmas...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.formContainer} keyboardShouldPersistTaps="handled">
          <TextInput
            style={[globalStyles.input]}
            placeholder="Título"
            placeholderTextColor="#666"
            value={titulo}
            onChangeText={setTitulo}
            maxLength={100}
          />
          <TextInput
            style={[globalStyles.input, { height: 80 }]}
            placeholder="Descrição (opcional)"
            placeholderTextColor="#666"
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
            <TouchableOpacity 
              style={[globalStyles.input, styles.timeInput, { justifyContent: 'center' }]} 
              onPress={openHoraInicioPicker} 
              activeOpacity={0.8}
            >
              <Text style={{ color: horaInicio ? '#222' : '#888', fontSize: 16, textAlignVertical: 'center', fontFamily: 'Roboto_Condensed-ExtraLight' }}>
                {horaInicio || 'Hora Início (HH:MM)'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[globalStyles.input, styles.timeInput, { justifyContent: 'center' }]} 
              onPress={openHoraFimPicker} 
              activeOpacity={0.8}
            >
              <Text style={{ color: horaFim ? '#222' : '#888', fontSize: 16, textAlignVertical: 'center', fontFamily: 'Roboto_Condensed-ExtraLight' }}>
                {horaFim || 'Hora Fim (HH:MM)'}
              </Text>
            </TouchableOpacity>
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
          
          <TimePickerModal
            visible={horaInicioModalVisible}
            horas={horas}
            horaTemp={horaInicioTemp}
            setHoraTemp={setHoraInicioTemp}
            onCancel={() => setHoraInicioModalVisible(false)}
            onConfirm={confirmHoraInicio}
            title="Selecione a hora de início"
          />
          
          <TimePickerModal
            visible={horaFimModalVisible}
            horas={horas}
            horaTemp={horaFimTemp}
            setHoraTemp={setHoraFimTemp}
            onCancel={() => setHoraFimModalVisible(false)}
            onConfirm={confirmHoraFim}
            title="Selecione a hora de término"
          />
          
          <View style={styles.pickerContainer}>
            <Text style={globalStyles.formLabelDark}>Tipo de Evento</Text>
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
            <Text style={globalStyles.formLabelDark}>Turma</Text>
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
          
          <TouchableOpacity style={globalStyles.submitButtonAlt} onPress={handleSubmit} disabled={isLoading}>
            {isLoading ? <ActivityIndicator color={Colors.blue_btn} /> : <Text style={globalStyles.submitButtonAltText}>Cadastrar</Text>}
          </TouchableOpacity>
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
    marginVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f8f8f8',
    overflow: 'hidden',
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
  }
});

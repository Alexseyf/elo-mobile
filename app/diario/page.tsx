import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, SafeAreaView, Platform, ActivityIndicator, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import config from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CafeDaManha from '../components/DiarioSteps/CafeDaManha';
import Almoco from '../components/DiarioSteps/Almoco';
import LancheDaTarde from '../components/DiarioSteps/LancheDaTarde';
import Leite from '../components/DiarioSteps/Leite';
import Evacuacao from '../components/DiarioSteps/Evacuacao';
import Disposicao from '../components/DiarioSteps/Disposicao';
import Sono from '../components/DiarioSteps/Sono';
import ItemsRequest from '../components/DiarioSteps/ItemsRequest';
import ObservacoesInput from '../components/DiarioSteps/ObservacoesInput';
import DiarioSummary from '../components/DiarioSteps/DiarioSummary';
import SleepPeriod  from '../types/diario';
import globalStyles from '../../styles/globalStyles';

export default function DiarioPage() {
  const { alunoId, alunoNome, turmaId, nomeTurma, diarioId, modoEdicao } = useLocalSearchParams<{ 
    alunoId: string, 
    alunoNome: string, 
    turmaId: string,
    nomeTurma: string,
    diarioId?: string,
    modoEdicao?: string
  }>();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(modoEdicao === 'true');
  const [diarioData, setDiarioData] = useState({
    cafeDaManha: 'NAO_SE_APLICA',
    almoco: 'NAO_SE_APLICA',
    lancheDaTarde: 'NAO_SE_APLICA',
    leite: 'NAO_SE_APLICA',
    evacuacao: 'NORMAL',
    disposicao: 'NORMAL',
    sono: [] as SleepPeriod[],
    itensRequisitados: [] as string[],
    observacoes: ''
  });

  useEffect(() => {
    if (modoEdicao === 'true' && diarioId) {
      fetchDiarioData();
    }
  }, [modoEdicao, diarioId]);

  const fetchDiarioData = async () => {
    try {
      setIsLoading(true);

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
        if (userData.roles && Array.isArray(userData.roles)) {
          userRoles = userData.roles;
        }
      }
      
      const url = config.API_URL.endsWith('/')
        ? `${config.API_URL}diarios/${diarioId}`
        : `${config.API_URL}/diarios/${diarioId}`;
        
      const urlWithRoles = `${url}?roles=${encodeURIComponent(userRoles.join(','))}`;
      
      const response = await fetch(urlWithRoles, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const periodosSonoFormatados = data.periodosSono?.map((periodo: any) => {
          const [sleepHour, sleepMinute] = periodo.horaDormiu.split(':').map(Number);
          const [wakeHour, wakeMinute] = periodo.horaAcordou.split(':').map(Number);
          
          return {
            id: Date.now().toString() + Math.random().toString().slice(2, 8),
            sleepHour: sleepHour || 0,
            sleepMinute: sleepMinute || 0,
            wakeHour: wakeHour || 0,
            wakeMinute: wakeMinute || 0,
            horaDormiu: periodo.horaDormiu,
            horaAcordou: periodo.horaAcordou,
            tempoTotal: periodo.tempoTotal,
            saved: true
          };
        }) || [];
        
        const itensProvidencia = data.itensProvidencia?.map((item: any) => 
          item.itemProvidencia?.nome
        ).filter((nome: string) => nome) || [];
        
        setDiarioData({
          cafeDaManha: data.lancheManha || 'NAO_SE_APLICA',
          almoco: data.almoco || 'NAO_SE_APLICA',
          lancheDaTarde: data.lancheTarde || 'NAO_SE_APLICA',
          leite: data.leite || 'NAO_SE_APLICA',
          evacuacao: data.evacuacao || 'NORMAL',
          disposicao: data.disposicao || 'NORMAL',
          sono: periodosSonoFormatados,
          itensRequisitados: itensProvidencia,
          observacoes: data.observacoes || ''
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Erro ao carregar diário',
          text2: 'Não foi possível obter os dados do diário',
          visibilityTime: 3000
        });
      }
    } catch (error) {
      console.error('Erro ao carregar diário:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro de conexão',
        text2: 'Não foi possível conectar ao servidor',
        visibilityTime: 3000
      });
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { 
      title: 'Lanche da manhã',
      render: () => (
        <CafeDaManha 
          value={diarioData.cafeDaManha} 
          onChange={(value: string) => setDiarioData({...diarioData, cafeDaManha: value})} 
        />
      )
    },
    { 
      title: 'Almoço',
      render: () => (
        <Almoco 
          value={diarioData.almoco} 
          onChange={(value: string) => setDiarioData({...diarioData, almoco: value})} 
        />
      )
    },
    { 
      title: 'Lanche da tarde',
      render: () => (
        <LancheDaTarde 
          value={diarioData.lancheDaTarde} 
          onChange={(value: string) => setDiarioData({...diarioData, lancheDaTarde: value})} 
        />
      )
    },
    { 
      title: 'Leite',
      render: () => (
        <Leite 
          value={diarioData.leite} 
          onChange={(value: string) => setDiarioData({...diarioData, leite: value})} 
        />
      )
    },
    { 
      title: 'Evacuação',
      render: () => (
        <Evacuacao 
          value={diarioData.evacuacao} 
          onChange={(value: string) => setDiarioData({...diarioData, evacuacao: value})} 
        />
      )
    },
    { 
      title: 'Disposição',
      render: () => (
        <Disposicao 
          value={diarioData.disposicao} 
          onChange={(value: string) => setDiarioData({...diarioData, disposicao: value})} 
        />
      )
    },
    { 
      title: 'Sono',
      render: () => (
        <Sono 
          value={diarioData.sono} 
          onChange={(value: SleepPeriod[]) => setDiarioData({...diarioData, sono: value})} 
        />
      )
    },
    { 
      title: 'Itens a Solicitar',
      render: () => (
        <ItemsRequest 
          selectedItems={diarioData.itensRequisitados}
          onChange={(value: string[]) => setDiarioData({...diarioData, itensRequisitados: value})} 
        />
      )
    },
    { 
      title: 'Recados',
      render: () => (
        <ObservacoesInput 
          value={diarioData.observacoes} 
          onChange={(value: string) => setDiarioData({...diarioData, observacoes: value})} 
        />
      )
    },
    { 
      title: 'Resumo',
      render: () => (
        <DiarioSummary data={diarioData} />
      )
    },
  ];

  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      if (currentStep === 6) {
        const filteredSono = diarioData.sono.filter(period => period.saved);
        setDiarioData({...diarioData, sono: filteredSono});
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const formatPeriodosSono = (periodosSono: SleepPeriod[]) => {
    return periodosSono
      .filter(periodo => periodo.saved)
      .map(periodo => ({
        horaDormiu: periodo.horaDormiu,
        horaAcordou: periodo.horaAcordou,
        tempoTotal: periodo.tempoTotal
      }));
  };

  const handleSaveDiario = async () => {
    if (!alunoId) {
      Alert.alert('Erro', 'ID do aluno não encontrado');
      return;
    }
    
    try {
      setIsSaving(true);
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
        if (userData.roles && Array.isArray(userData.roles)) {
          userRoles = userData.roles;
        }
      }
      
      const dataFormatada = new Date().toISOString();
      
      const dadosParaEnviar = {
        alunoId: parseInt(alunoId),
        data: dataFormatada,
        lancheManha: diarioData.cafeDaManha,
        almoco: diarioData.almoco,
        lancheTarde: diarioData.lancheDaTarde,
        leite: diarioData.leite,
        evacuacao: diarioData.evacuacao,
        disposicao: diarioData.disposicao,
        periodosSono: formatPeriodosSono(diarioData.sono),
        itensProvidencia: diarioData.itensRequisitados,
        observacoes: diarioData.observacoes,
        roles: userRoles
      };
      
      let url: string;
      let method: string;
      let successMsg: string;
      
      if (modoEdicao === 'true' && diarioId) {
        url = config.API_URL.endsWith('/')
          ? `${config.API_URL}diarios/${diarioId}`
          : `${config.API_URL}/diarios/${diarioId}`;
        method = 'PATCH';
        successMsg = `O diário do aluno ${alunoNome} foi atualizado.`;
      } else {
        url = config.API_URL.endsWith('/')
          ? `${config.API_URL}diarios`
          : `${config.API_URL}/diarios`;
        method = 'POST';
        successMsg = `O diário do aluno ${alunoNome} foi registrado.`;
      }
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(dadosParaEnviar)
      });
      
      const responseData = await response.json();
      
      if (response.ok) {
        Toast.show({
          type: 'success',
          text1: 'Diário salvo com sucesso!',
          text2: successMsg,
          visibilityTime: 3000
        });
        setTimeout(() => {
          router.push({
            pathname: "../listaAlunos",
            params: {
              id: turmaId,
              nomeTurma: nomeTurma,
              diarioSalvo: 'true'
            }
          });
        }, 2000);
      } else {
        let errorMessage = 'Não foi possível salvar o diário.';
        if (responseData) {
          if (typeof responseData.erro === 'string') {
            errorMessage = responseData.erro;
          } else if (responseData.erro && typeof responseData.erro === 'object') {
            errorMessage = 'Erro de validação nos dados enviados.';
            console.error('Detalhes do erro:', responseData.erro);
          } else if (responseData.message) {
            errorMessage = responseData.message;
          } else if (responseData.detalhes) {
            errorMessage = responseData.detalhes;
          }
        }
        
        console.error('Erro ao salvar diário:', errorMessage);
        
        Toast.show({
          type: 'error',
          text1: 'Erro ao salvar diário',
          text2: errorMessage,
          visibilityTime: 3000
        });
      }
    } catch (error) {
      console.error('Erro inesperado:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro de conexão',
        text2: 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.',
        visibilityTime: 3000
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={globalStyles.container}>
        <StatusBar hidden />
        <View style={globalStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={globalStyles.loadingText}>Carregando dados do diário...</Text>
        </View>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={globalStyles.container}>
      <StatusBar hidden />
      
      <View style={styles.formContainer}>
        <Text style={styles.title}>
          {modoEdicao === 'true' ? 'Editar Diário' : 'Diário do Aluno'}
        </Text>
        {alunoNome && <Text style={styles.alunoNome}>{alunoNome}</Text>}
        <Text style={styles.stepTitle}>{steps[currentStep].title}</Text>
        
        <View style={styles.componentContainer}>
          {steps[currentStep].render()}
        </View>
          <View style={styles.buttonContainer}>
          <View style={styles.buttonRow}>
            {currentStep > 0 ? (
              <TouchableOpacity 
                style={[styles.navButton, styles.previousButton]} 
                onPress={goToPreviousStep}
                disabled={isSaving}
              >
                <MaterialIcons name="arrow-back" size={24} color="#fff" />
                <Text style={styles.buttonText}>Anterior</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={[styles.navButton, styles.previousButton]} 
                onPress={handleGoBack}
                disabled={isSaving}
              >
                <MaterialIcons name="arrow-back" size={24} color="#fff" />
                <Text style={styles.buttonText}>Voltar</Text>
              </TouchableOpacity>
            )}
            
            {currentStep < steps.length - 1 ? (
              <TouchableOpacity 
                style={[styles.navButton, styles.nextButton]} 
                onPress={goToNextStep}
                disabled={isSaving}
              >
                <Text style={styles.buttonText}>Próximo</Text>
                <MaterialIcons name="arrow-forward" size={24} color="#fff" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={[styles.navButton, styles.saveButton, isSaving && styles.disabledButton]} 
                onPress={handleSaveDiario}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Text style={styles.buttonText}>Salvar</Text>
                    <MaterialIcons name="check" size={24} color="#fff" />
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({  container: {
    flex: 1,
    backgroundColor: '#2a4674',
  },  formContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    backgroundColor: '#2a4674',
    marginTop: 40,
    marginHorizontal: 20,
    marginBottom: Platform.OS === 'ios' ? 30 : 20,
  },
  // loadingContainer: {
  //   flex: 1,
  //   justifyContent: 'center',
  //   alignItems: 'center',
  // },
  // loadingText: {
  //   marginTop: 16,
  //   fontSize: 18,
  //   color: '#fff',
  // },
  title: {
    fontSize: 24,
    fontFamily: "Roboto_Condensed-SemiBold",
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  alunoNome: {
    fontFamily: "Roboto_Condensed-SemiBold",
    fontSize: 20,
    color: '#e1e1e1',
    textAlign: 'center',
    marginBottom: 10,
  },
  stepTitle: {
    fontSize: 14,
    color: '#e1e1e1',
    textAlign: 'center',
    marginBottom: 10,
  },  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingHorizontal: 5,
  },navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    minWidth: 120,
    width: '49%',
    maxWidth: 180,
  },
  previousButton: {
    backgroundColor: '#5c6bc0',
  },
  nextButton: {
    backgroundColor: '#4a90e2',
    marginLeft: 'auto',
  },
  saveButton: {
    backgroundColor: '#4caf50',
    marginLeft: 'auto',
  },
  disabledButton: {
    backgroundColor: '#9e9e9e',
    opacity: 0.7,
  },
  buttonText: {
    fontFamily: "Roboto_Condensed-SemiBold",
    color: 'white',
    fontSize: 14,
    marginHorizontal: 8,
  },
  componentContainer: {
    flex: 1,
    paddingBottom: 10,
  },
  buttonContainer: {
    paddingBottom: Platform.OS === 'ios' ? 50 : 40,
    backgroundColor: 'transparent',
  },
});
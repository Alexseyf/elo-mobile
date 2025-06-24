import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, ActivityIndicator, Platform, Switch, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import globalStyles from '../../styles/globalStyles';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../../config';
import DatePickerModal from '../components/DatePickerModal';
import Colors from '../constants/colors';

const TIPO_EVENTO = {
  REUNIAO: 'REUNIAO',
  FERIADO: 'FERIADO',
  RECESSO: 'RECESSO',
  EVENTO_ESCOLAR: 'EVENTO_ESCOLAR',
  ATIVIDADE_PEDAGOGICA: 'ATIVIDADE_PEDAGOGICA',
  OUTRO: 'OUTRO',
};

export default function CadastrarCronograma() {
  const router = useRouter();
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [data, setData] = useState('');
  const [tipoEvento, setTipoEvento] = useState(TIPO_EVENTO.OUTRO);
  const [isAtivo, setIsAtivo] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [diaTemp, setDiaTemp] = useState('');
  const [mesTemp, setMesTemp] = useState('');
  const [anoTemp, setAnoTemp] = useState('');

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
      const userDataString = await AsyncStorage.getItem('@user_data');
      
      if (!authToken || !userId) {
        Toast.show({ type: 'error', text1: 'Erro de autenticação', text2: 'Usuário não autenticado', visibilityTime: 3000 });
        setIsLoading(false);
        return;
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
        tipoEvento: tipoEvento || TIPO_EVENTO.OUTRO,
        isAtivo,
        criadorId: parseInt(userId, 10)
      };
      const response = await fetch(`${config.API_URL}/cronogramas`, {
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
          text1: 'Cronograma cadastrado com sucesso!', 
          text2: `${titulo} foi adicionado ao calendário.`,
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

  return (
    <View style={globalStyles.container}>
      <StatusBar hidden barStyle="light-content" />
      <View style={globalStyles.header}>
        <Text style={globalStyles.headerTitle}>Cadastrar Evento do Cronograma Anual</Text>
      </View>
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
        <TouchableOpacity style={globalStyles.submitButtonAlt} onPress={handleSubmit} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color={Colors.blue_btn} /> : <Text style={globalStyles.submitButtonAltText}>Cadastrar</Text>}
        </TouchableOpacity>
      </ScrollView>
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
  label: {
    fontFamily: 'Roboto_Condensed-SemiBold',
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
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
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    gap: 10,
  },
});

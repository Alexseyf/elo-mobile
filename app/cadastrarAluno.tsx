import { Text, View, StyleSheet, StatusBar, TouchableOpacity, Platform, ScrollView, TextInput, ActivityIndicator, Modal } from "react-native";
import { router } from "expo-router";
import Colors from "./constants/colors";
import { useEffect, useState } from "react";
import Toast from 'react-native-toast-message';
import config from '../config';
import { formatarNome, formatarNomeTurma } from "./utils/formatText";

interface Turma {
  id: number;
  nome: string;
}

export default function CadastrarAluno() {
  const [nome, setNome] = useState("");
  const [dataNasc, setDataNasc] = useState(new Date());
  const [turmaId, setTurmaId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loadingTurmas, setLoadingTurmas] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

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

  const [diaTemp, setDiaTemp] = useState(dataNasc.getDate().toString().padStart(2, '0'));
  const [mesTemp, setMesTemp] = useState((dataNasc.getMonth() + 1).toString().padStart(2, '0'));
  const [anoTemp, setAnoTemp] = useState(dataNasc.getFullYear().toString());

  useEffect(() => {
    carregarTurmas();
  }, []);

  const carregarTurmas = async () => {
    setLoadingTurmas(true);
    try {
      const response = await fetch(`${config.API_URL}/turmas`);
      if (response.ok) {
        const data = await response.json();
        setTurmas(data);
        if (data && data.length > 0) {
          setTurmaId(data[0].id);
        }
      } else {
        Toast.show({
          type: 'error',
          text1: 'Erro',
          text2: 'Falha ao carregar turmas',
          visibilityTime: 3000
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Falha de conexão ao carregar turmas',
        visibilityTime: 3000
      });
    } finally {
      setLoadingTurmas(false);
    }
  };

  const handleVoltar = () => {
    router.back();
  };

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const openDatePicker = () => {
    setDiaTemp(dataNasc.getDate().toString().padStart(2, '0'));
    setMesTemp((dataNasc.getMonth() + 1).toString().padStart(2, '0'));
    setAnoTemp(dataNasc.getFullYear().toString());
    setModalVisible(true);
  };

  const confirmDate = () => {
    const newDate = new Date(`${anoTemp}-${mesTemp}-${diaTemp}T00:00:00`);
    setDataNasc(newDate);
    setModalVisible(false);
  };

  const validateFields = () => {
    if (nome.trim().length < 3 || nome.trim().length > 60) {
      Toast.show({
        type: 'error',
        text1: 'Erro de validação',
        text2: 'Nome deve ter entre 3 e 60 caracteres',
        visibilityTime: 3000
      });
      return false;
    }

    if (!dataNasc) {
      Toast.show({
        type: 'error',
        text1: 'Erro de validação',
        text2: 'Data de nascimento é obrigatória',
        visibilityTime: 3000
      });
      return false;
    }

    if (!turmaId) {
      Toast.show({
        type: 'error',
        text1: 'Erro de validação',
        text2: 'Selecione uma turma',
        visibilityTime: 3000
      });
      return false;
    }

    return true;
  };

  const handleCadastrar = async () => {
    if (!validateFields()) return;

    setIsLoading(true);

    try {
      const alunoData = {
        nome: formatarNome(nome.trim()),
        dataNasc: dataNasc.toISOString(),
        turmaId: turmaId,
      };

      const response = await fetch(`${config.API_URL}/alunos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(alunoData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao cadastrar aluno');
      }

      Toast.show({
        type: 'success',
        text1: 'Sucesso!',
        text2: 'Aluno cadastrado com sucesso',
        visibilityTime: 3000
      });

      setTimeout(() => {
        router.back();
      }, 1500);

    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: error instanceof Error ? error.message : 'Falha ao cadastrar aluno',
        visibilityTime: 3000
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <View style={styles.container}>
        <StatusBar hidden />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Cadastrar Novo Aluno</Text>
        </View>
        <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollContentContainer}>
          <View style={styles.formContainer}>
            <Text style={styles.formLabel}>Nome Completo</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Digite o nome completo do aluno"
              value={nome}
              onChangeText={setNome}
              maxLength={60}
              onBlur={() => setNome(formatarNome(nome))}
            />
            
            <Text style={styles.formLabel}>Data de Nascimento</Text>
            <TouchableOpacity 
              style={styles.dateInput}
              onPress={openDatePicker}
            >
              <Text style={styles.dateText}>{formatDate(dataNasc)}</Text>
            </TouchableOpacity>
            
            <Text style={styles.formLabel}>Turma</Text>
            {loadingTurmas ? (
              <ActivityIndicator size="small" color={Colors.blue_btn} />
            ) : (
              <View style={styles.turmasContainer}>
                {turmas.length === 0 ? (
                  <Text style={styles.noTurmasText}>Nenhuma turma cadastrada</Text>
                ) : (
                  turmas.map(turma => (
                    <TouchableOpacity 
                      key={turma.id}
                      style={[
                        styles.turmaOption,
                        turmaId === turma.id && styles.turmaOptionSelected
                      ]}
                      onPress={() => setTurmaId(turma.id)}
                    >
                      <Text style={[
                        styles.turmaText,
                        turmaId === turma.id && styles.turmaTextSelected
                      ]}>
                        {formatarNomeTurma(turma.nome)}
                      </Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            )}
            
            <TouchableOpacity 
              style={styles.submitButton} 
              onPress={handleCadastrar}
              disabled={isLoading || loadingTurmas}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Cadastrar Aluno</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
        
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Selecione a Data de Nascimento</Text>
              
              <View style={styles.dateSelectors}>
                <View style={styles.selectorContainer}>
                  <Text style={styles.selectorLabel}>Dia</Text>
                  <ScrollView style={styles.selector} showsVerticalScrollIndicator={false}>
                    {dias.map((dia) => (
                      <TouchableOpacity
                        key={dia}
                        style={[
                          styles.dateOption,
                          dia === diaTemp && styles.dateOptionSelected
                        ]}
                        onPress={() => setDiaTemp(dia)}
                      >
                        <Text style={[
                          styles.dateOptionText,
                          dia === diaTemp && styles.dateOptionTextSelected
                        ]}>
                          {dia}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
                
                <View style={styles.selectorContainer}>
                  <Text style={styles.selectorLabel}>Mês</Text>
                  <ScrollView style={styles.selector} showsVerticalScrollIndicator={false}>
                    {meses.map((mes) => (
                      <TouchableOpacity
                        key={mes.valor}
                        style={[
                          styles.dateOption,
                          mes.valor === mesTemp && styles.dateOptionSelected
                        ]}
                        onPress={() => setMesTemp(mes.valor)}
                      >
                        <Text style={[
                          styles.dateOptionText,
                          mes.valor === mesTemp && styles.dateOptionTextSelected
                        ]}>
                          {mes.texto}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
                
                <View style={styles.selectorContainer}>
                  <Text style={styles.selectorLabel}>Ano</Text>
                  <ScrollView style={styles.selector} showsVerticalScrollIndicator={false}>
                    {anos.map((ano) => (
                      <TouchableOpacity
                        key={ano}
                        style={[
                          styles.dateOption,
                          ano === anoTemp && styles.dateOptionSelected
                        ]}
                        onPress={() => setAnoTemp(ano)}
                      >
                        <Text style={[
                          styles.dateOptionText,
                          ano === anoTemp && styles.dateOptionTextSelected
                        ]}>
                          {ano}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalCancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalCancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalConfirmButton]}
                  onPress={confirmDate}
                >
                  <Text style={styles.modalConfirmButtonText}>Confirmar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleVoltar}
          disabled={isLoading}
        >
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
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 30,
  },
  formContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  dateInput: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    height: 48,
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  dateSelectors: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  selectorContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  selectorLabel: {
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 8,
  },
  selector: {
    height: 200,
  },
  dateOption: {
    padding: 10,
    alignItems: 'center',
    borderRadius: 5,
  },
  dateOptionSelected: {
    backgroundColor: Colors.blue_btn,
  },
  dateOptionText: {
    fontSize: 16,
  },
  dateOptionTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  modalCancelButton: {
    backgroundColor: '#f0f0f0',
  },
  modalConfirmButton: {
    backgroundColor: Colors.blue_btn,
  },
  modalCancelButtonText: {
    color: '#333',
    fontWeight: '600',
  },
  modalConfirmButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  turmasContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingVertical: 8,
    width: '100%',
  },
  turmaOption: {
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  turmaOptionSelected: {
    backgroundColor: Colors.blue_btn,
  },
  turmaText: {
    fontSize: 14,
    color: "#333",
  },
  turmaTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  noTurmasText: {
    fontStyle: 'italic',
    color: '#666',
    padding: 10,
  },
  submitButton: {
    backgroundColor: Colors.blue_btn,
    marginTop: 30,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
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
  }
});
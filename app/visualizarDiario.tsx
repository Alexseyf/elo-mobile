import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, StatusBar, Platform } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import Toast from 'react-native-toast-message';
import config from '../config';
import Colors from "./constants/colors";

interface PeriodoSono {
  id: number;
  horaDormiu: string;
  horaAcordou: string;
  tempoTotal: string;
  diarioId: number;
  createdAt: string;
  updatedAt: string;
}

interface ItemProvidencia {
  id: number;
  diarioId: number;
  itemProvidenciaId: number;
  itemProvidencia: {
    id: number;
    nome: string;
  };
}

interface Diario {
  id: number;
  data: string;
  lancheManha?: string;
  almoco?: string;
  lancheTarde?: string;
  leite?: string;
  disposicao?: string;
  evacuacao?: string;
  observacoes: string;
  createdAt: string;
  updatedAt: string;
  alunoId: number;
  periodosSono: PeriodoSono[];
  itensProvidencia: ItemProvidencia[];
}

export default function VisualizarDiario() {
  const { alunoId, alunoNome } = useLocalSearchParams<{ alunoId: string; alunoNome: string }>();
  const [diarios, setDiarios] = useState<Diario[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDiario, setSelectedDiario] = useState<Diario | null>(null);

  const fetchDiarios = async () => {
    try {
      setLoading(true);
      
      const url = config.API_URL.endsWith('/')
        ? `${config.API_URL}diarios/aluno/${alunoId}`
        : `${config.API_URL}/diarios/aluno/${alunoId}`;
      
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        setDiarios(data);
        if (data.length > 0) {
          setSelectedDiario(data[0]);
        }
      } else {
        Toast.show({
          type: 'error',
          text1: 'Erro ao buscar diários',
          text2: 'Verifique sua conexão com o servidor',
          visibilityTime: 3000
        });
      }
    } catch (error) {
      console.error('Erro ao buscar diários do aluno:', error);
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

  useEffect(() => {
    if (alunoId) {
      fetchDiarios();
    }
  }, [alunoId]);

  const handleVoltar = () => {
    router.back();
  };

  const formatarData = (dataString: string) => {
    try {
      const [ano, mes, dia] = dataString.split('T')[0].split('-');
      return `${dia}/${mes}/${ano}`;
    } catch (e) {
      return 'Data inválida';
    }
  };

  const traduzirDisposicao = (disposicao?: string) => {
    switch (disposicao) {
      case 'NORMAL': return 'Normal';
      case 'AGITADO': return 'Agitado';
      case 'CALMO': return 'Calmo';
      case 'CANSADO': return 'Cansado';
      case 'SONOLENTO': return 'Sonolento';
    }
  };

  const traduzirEvacuacao = (evacuacao?: string) => {
    switch (evacuacao) {
      case 'NORMAL': return 'Normal';
      case 'LIQUIDA': return 'Líquida';
      case 'NAO_EVACUOU': return 'Não evacuou';
      case 'DURA': return 'Endurecida';
    }
  };

  const traduzirRefeicao = (refeicao?: string) => {
    switch (refeicao) {
      case 'OTIMO': return 'Ótimo';
      case 'BOM': return 'Bom';
      case 'REGULAR': return 'Regular';
      case 'NAO_ACEITOU': return 'Não aceitou';
      case 'NAO_SE_APLICA': return 'Não se aplica';
    }
  };

  const traduzirItemProvidencia = (nome: string) => {
    switch (nome) {
      case 'FRALDA': return 'Fralda';
      case 'LENCO_UMEDECIDO': return 'Lenço Umedecido';
      case 'LEITE': return 'Leite';
      case 'CREME_DENTAL': return 'Creme Dental';
      case 'ESCOVA_DE_DENTE': return 'Escova de Dente';
      case 'POMADA': return 'Pomada';
    }
  };

  const selectDiario = (diario: Diario) => {
    setSelectedDiario(diario);
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Diário do Aluno</Text>
        <Text style={styles.headerSubtitle}>{alunoNome}</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Carregando diários...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollContent}
          contentContainerStyle={styles.scrollContentContainer}
        >
          {diarios.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="book" size={60} color="#fff" />
              <Text style={styles.emptyText}>Nenhum diário encontrado para este aluno</Text>
            </View>
          ) : (
            <>
              <ScrollView 
                horizontal={true} 
                showsHorizontalScrollIndicator={false}
                style={styles.diariosSelector}
              >
                {diarios.map((diario) => (
                  <TouchableOpacity
                    key={diario.id}
                    style={[
                      styles.diarioDateButton,
                      selectedDiario?.id === diario.id && styles.diarioDateButtonSelected
                    ]}
                    onPress={() => selectDiario(diario)}
                  >
                    <Text style={[
                      styles.diarioDateText,
                      selectedDiario?.id === diario.id && styles.diarioDateTextSelected
                    ]}>
                      {formatarData(diario.createdAt)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {selectedDiario && (
                <View style={styles.diarioContainer}>
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Alimentação</Text>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Lanche da manhã:</Text>
                      <Text style={styles.infoValue}>{traduzirRefeicao(selectedDiario.lancheManha)}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Almoço:</Text>
                      <Text style={styles.infoValue}>{traduzirRefeicao(selectedDiario.almoco)}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Lanche da tarde:</Text>
                      <Text style={styles.infoValue}>{traduzirRefeicao(selectedDiario.lancheTarde)}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Leite:</Text>
                      <Text style={styles.infoValue}>{traduzirRefeicao(selectedDiario.leite)}</Text>
                    </View>
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Evacuação</Text>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Condição:</Text>
                      <Text style={styles.infoValue}>{traduzirEvacuacao(selectedDiario.evacuacao)}</Text>
                    </View>
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Disposição</Text>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Estado:</Text>
                      <Text style={styles.infoValue}>{traduzirDisposicao(selectedDiario.disposicao)}</Text>
                    </View>
                  </View>

                  {selectedDiario.periodosSono && selectedDiario.periodosSono.length > 0 && (
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Períodos de Sono</Text>
                      {selectedDiario.periodosSono.map((periodo) => (
                        <View key={periodo.id} style={styles.periodoSono}>
                          <Text style={styles.periodoSonoText}>
                            <Text style={styles.boldText}>Dormiu:</Text> {periodo.horaDormiu} - 
                            <Text style={styles.boldText}> Acordou:</Text> {periodo.horaAcordou}
                          </Text>
                          <Text style={styles.periodoSonoTotal}>
                            <Text style={styles.boldText}>Tempo total:</Text> {periodo.tempoTotal}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {selectedDiario.itensProvidencia && selectedDiario.itensProvidencia.length > 0 && (
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Itens Solicitados</Text>
                      <View style={styles.itensContainer}>
                        {selectedDiario.itensProvidencia.map((item) => (
                          <View key={item.id} style={styles.itemTag}>
                            <Text style={styles.itemTagText}>
                              {traduzirItemProvidencia(item.itemProvidencia.nome)}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {selectedDiario.observacoes && selectedDiario.observacoes.trim() !== '' && (
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Observações</Text>
                      <View style={styles.observacoesBox}>
                        <Text style={styles.observacoesText}>{selectedDiario.observacoes}</Text>
                      </View>
                    </View>
                  )}

                  <View style={styles.section}>
                    <Text style={styles.registroText}>
                      Registro feito em: {formatarData(selectedDiario.createdAt)}
                    </Text>
                  </View>
                </View>
              )}
            </>
          )}
        </ScrollView>
      )}

      <TouchableOpacity style={styles.backButton} onPress={handleVoltar}>
        <Text style={styles.backButtonText}>Voltar</Text>
      </TouchableOpacity>
      <Toast />
    </View>
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
  headerSubtitle: {
    fontSize: 16,
    color: "#fff",
    marginTop: 4,
    opacity: 0.8,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingHorizontal: 16,
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
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#fff',
    marginTop: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  diariosSelector: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  diarioDateButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
    borderRadius: 20,
  },
  diarioDateButtonSelected: {
    backgroundColor: '#ffffff',
  },
  diarioDateText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  diarioDateTextSelected: {
    color: Colors.blue_btn,
    fontWeight: '700',
  },
  diarioContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.blue_btn,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
    paddingBottom: 5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoLabel: {
    width: '40%',
    fontSize: 15,
    color: '#555',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
  periodoSono: {
    backgroundColor: '#f8f8f8',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  periodoSonoText: {
    fontSize: 14,
    color: '#333',
  },
  periodoSonoTotal: {
    fontSize: 14,
    color: '#333',
    marginTop: 4,
  },
  boldText: {
    fontWeight: '600',
  },
  itensContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  itemTag: {
    backgroundColor: '#e8f4fd',
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#cce5ff',
  },
  itemTagText: {
    color: Colors.blue_btn,
    fontSize: 14,
  },
  observacoesBox: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
  },
  observacoesText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  registroText: {
    fontSize: 12,
    color: '#777',
    textAlign: 'right',
    fontStyle: 'italic',
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
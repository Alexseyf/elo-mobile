import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { formatarNome, formatarNomeTurma } from "./utils/formatText";
import Colors from "./constants/colors";
import config from "../config";
import globalStyles from "../styles/globalStyles";

interface Responsavel {
  id: number;
  nome: string;
}

interface Aluno {
  id: number;
  nome: string;
  dataNasc: string;
  isAtivo: boolean;
  createdAt: string;
  updatedAt: string;
  turmaId: number;
  turma?: {
    id: number;
    nome: string;
  };
  responsaveis: Responsavel[];
}

interface Turma {
  id: number;
  nome: string;
}

export default function ListaAlunosAtivos() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [alunosFiltrados, setAlunosFiltrados] = useState<Aluno[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [turmaSelecionada, setTurmaSelecionada] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingTurmas, setLoadingTurmas] = useState(true);

  const fetchAlunosAtivos = async () => {
    try {
      setLoading(true);

      const authToken = await AsyncStorage.getItem("@auth_token");
      const userDataString = await AsyncStorage.getItem("@user_data");

      if (!authToken) {
        alert("Sessão expirada. Faça login novamente.");
        setTimeout(() => {
          router.replace({ pathname: "/" });
        }, 2000);
        return;
      }

      let userRoles = [];
      try {
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          userRoles = userData.roles || [];
        }
      } catch (err) {
        console.error("Erro ao fazer parse do user_data", err);
      }

      const url = config.API_URL.endsWith("/")
        ? `${config.API_URL}alunos/ativos`
        : `${config.API_URL}/alunos/ativos`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        try {
          const data = await response.json();
          setAlunos(data);
          setAlunosFiltrados(data);
        } catch (err) {
          console.error("Erro ao fazer parse da resposta de alunos", err);
        }
      } else if (response.status === 401) {
        await AsyncStorage.multiRemove([
          "@auth_token",
          "@user_id",
          "@user_data",
        ]);
        alert("Sessão expirada. Faça login novamente.");
        setTimeout(() => {
          router.replace({ pathname: "/" });
        }, 2000);
      } else {
        alert("Erro ao buscar alunos. Verifique sua conexão.");
      }
    } catch (error) {
      console.error("Erro ao buscar alunos ativos:", error);
      alert("Erro de conexão. Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchTurmas = async () => {
    try {
      setLoadingTurmas(true);

      const authToken = await AsyncStorage.getItem("@auth_token");
      if (!authToken) return;

      const url = config.API_URL.endsWith("/")
        ? `${config.API_URL}turmas`
        : `${config.API_URL}/turmas`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        try {
          const data = await response.json();
          setTurmas(data);
        } catch (err) {
          console.error("Erro ao fazer parse das turmas", err);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar turmas:", error);
    } finally {
      setLoadingTurmas(false);
    }
  };

  const filtrarAlunos = (listaAlunos: Aluno[], turmaId: number | null) => {
    if (!turmaId) {
      setAlunosFiltrados(listaAlunos);
    } else {
      const filtrados = listaAlunos.filter(
        (aluno) => aluno.turmaId === turmaId
      );
      setAlunosFiltrados(filtrados);
    }
  };

  const handleChangeTurma = (value: number | null) => {
    setTurmaSelecionada(value);
    filtrarAlunos(alunos, value);
  };

  useEffect(() => {
    fetchAlunosAtivos();
    fetchTurmas();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAlunosAtivos();
  };

  const handleVoltar = () => {
    router.back();
  };

  return (
    <View style={globalStyles.container}>
      <StatusBar hidden barStyle="light-content" />

      <View style={globalStyles.header}>
        <Text style={globalStyles.headerTitle}>Alunos Ativos</Text>
      </View>

      {loading ? (
        <View style={globalStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={globalStyles.loadingText}>Carregando alunos...</Text>
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
          {turmas.length > 0 && (
            <View style={styles.filterContainer}>
              <Text style={styles.filterLabel}>Filtrar por Turma:</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={turmaSelecionada}
                  onValueChange={(itemValue) => handleChangeTurma(itemValue)}
                  style={styles.pickerInput}
                >
                  <Picker.Item style={styles.pickerInput} label="Todas as turmas" value={null} />
                  {turmas.map((turma) => (
                    <Picker.Item
                      key={turma.id}
                      label={formatarNomeTurma(turma.nome ?? "")}
                      value={turma.id}
                    />
                  ))}
                </Picker>
              </View>
            </View>
          )}

          {alunos.length === 0 ? (
            <View style={globalStyles.emptyContainer}>
              <MaterialIcons name="people" size={60} color="#fff" />
              <Text style={globalStyles.emptyText}>
                Nenhum aluno ativo encontrado
              </Text>
            </View>
          ) : alunosFiltrados.length === 0 ? (
            <View style={globalStyles.emptyContainer}>
              <MaterialIcons name="filter-alt" size={60} color="#fff" />
              <Text style={globalStyles.emptyText}>
                Nenhum aluno encontrado nesta turma
              </Text>
            </View>
          ) : (
            <View>
              {alunosFiltrados.map((aluno) => {
                const turmaDoAluno = turmas.find((t) => t.id === aluno.turmaId);
                return (
                  <View key={aluno.id} style={styles.alunoCard}>
                    <View style={styles.alunoInfo}>
                      <View style={styles.alunoAvatar}>
                        <Text style={styles.alunoAvatarText}>
                          {aluno.nome?.charAt(0)}
                        </Text>
                      </View>
                      <View style={styles.alunoDetails}>
                        <Text style={styles.alunoNome}>
                          {formatarNome(aluno.nome)}
                        </Text>
                        <Text style={styles.alunoTurma}>
                          {turmaDoAluno
                            ? `Turma: ${formatarNomeTurma(turmaDoAluno.nome)}`
                            : "Sem turma"}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() =>
                          router.push({
                            pathname: "/detalheAluno",
                            params: { id: aluno.id.toString() },
                          })
                        }
                      >
                        <MaterialIcons name="edit" size={20} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}

      <TouchableOpacity style={globalStyles.backButton} onPress={handleVoltar}>
        <Text style={globalStyles.backButtonText}>Voltar</Text>
      </TouchableOpacity>
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
  filterLabel: {
    fontFamily: "Roboto_Condensed-SemiBold",
    fontSize: 16,
    color: "#333",
    marginBottom: 10,
  },
  pickerContainer: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  pickerInput: {
    fontFamily: "Roboto_Condensed-Regular",
    fontSize: 16,
    paddingVertical: 6,
    paddingHorizontal: 10,
    color: "#333",
    backgroundColor: "transparent",
  },
  alunoCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  alunoInfo: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  alunoAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.blue_btn,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  alunoAvatarText: {
    fontFamily: "Roboto_Condensed-SemiBold",
    color: "#fff",
    fontSize: 20,
  },
  alunoDetails: {
    flex: 1,
  },
  alunoNome: {
    fontSize: 18,
    fontFamily: "Roboto_Condensed-Regular",
    color: "#333",
    marginBottom: 4,
  },
  alunoTurma: {
    fontFamily: "Roboto_Condensed-Regular",
    fontSize: 12,
    color: "#666",
  },
  editButton: {
    backgroundColor: Colors.blue_btn,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});

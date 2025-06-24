import {
  Text,
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Link, router } from "expo-router";
import { useEffect, useState } from "react";
import Colors from "../constants/colors";
import { formatarNomeTurma, obterPrimeiroNome } from "../utils/formatText";
import config from "@/config";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import globalStyles from "../../styles/globalStyles";

export default function ProfDash() {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState(false);
  const [professorId, setProfessorId] = useState<number | null>(null);
  const [nome, setNome] = useState<string>("");

  type Turma = {
    id: number;
    nome: string;
  };

  const fetchProfessorId = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem("@user_id");
      const authToken = await AsyncStorage.getItem("@auth_token");

      if (!authToken) {
        Toast.show({
          type: "error",
          text1: "Erro de autenticação",
          text2: "Sessão expirada. Por favor, faça login novamente.",
          visibilityTime: 3000,
        });
        setTimeout(() => {
          router.replace("/");
        }, 3000);
        return null;
      }

      if (storedUserId) {
        const userId = parseInt(storedUserId, 10);
        setProfessorId(userId);
        const userDataString = await AsyncStorage.getItem("@user_data");
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          setNome(obterPrimeiroNome(userData.nome));
        }

        return userId;
      }

      const response = await fetch(`${config.API_URL}/usuario-logado`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();

        if (
          userData.roles &&
          Array.isArray(userData.roles) &&
          !userData.roles.includes("PROFESSOR")
        ) {
          Toast.show({
            type: "error",
            text1: "Acesso negado",
            text2: "Você não possui permissão para acessar esta área",
            visibilityTime: 3000,
          });
          setTimeout(() => {
            router.replace("/");
          }, 3000);
          return null;
        }

        await AsyncStorage.setItem("@user_id", userData.id.toString());

        setProfessorId(userData.id);
        setNome(obterPrimeiroNome(userData.nome));
        return userData.id;
      } else if (response.status === 401) {
        await AsyncStorage.removeItem("@auth_token");
        await AsyncStorage.removeItem("@user_id");
        await AsyncStorage.removeItem("@user_data");

        Toast.show({
          type: "error",
          text1: "Sessão expirada",
          text2: "Por favor, faça login novamente",
          visibilityTime: 3000,
        });
        setTimeout(() => {
          router.replace("/");
        }, 3000);
        return null;
      } else {
        Toast.show({
          type: "error",
          text1: "Erro de autenticação",
          text2:
            "Não foi possível recuperar seus dados. Por favor, faça login novamente.",
          visibilityTime: 3000,
        });
        setTimeout(() => {
          router.replace("/");
        }, 3000);
        return null;
      }
    } catch (error) {
      console.error("Erro ao buscar dados do professor:", error);
      Toast.show({
        type: "error",
        text1: "Erro de conexão",
        text2: "Não foi possível conectar ao servidor",
        visibilityTime: 3000,
      });
      return null;
    }
  };

  const fetchTurmasProfessor = async (id?: number) => {
    try {
      setLoading(true);
      const idToUse = id || professorId;

      if (!idToUse) {
        Toast.show({
          type: "error",
          text1: "Erro de autenticação",
          text2: "ID do professor não encontrado",
          visibilityTime: 3000,
        });
        setLoading(false);
        return;
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
        return;
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
        setTurmas(data);
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
      } else {
        Toast.show({
          type: "error",
          text1: "Erro ao buscar turmas",
          text2: "Verifique sua conexão com o servidor",
          visibilityTime: 3000,
        });
      }
    } catch (error) {
      console.error("Erro ao buscar turmas do professor:", error);
      Toast.show({
        type: "error",
        text1: "Erro de conexão",
        text2: "Não foi possível conectar ao servidor",
        visibilityTime: 3000,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      const id = await fetchProfessorId();
      if (id) {
        fetchTurmasProfessor(id);
      }
    };

    initialize();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTurmasProfessor();
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("@auth_token");
      await AsyncStorage.removeItem("@user_id");
      await AsyncStorage.removeItem("@user_data");

      Toast.show({
        type: "success",
        text1: "Logout realizado com sucesso",
        visibilityTime: 2000,
      });

      router.replace("/");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  if (loading) {
    return (
      <View style={[globalStyles.container, globalStyles.loadingContainer]}>
        <StatusBar backgroundColor={Colors.blue_btn} barStyle="light-content" />
        <ActivityIndicator size="large" color="#fff" />
        <Text style={globalStyles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <StatusBar hidden barStyle="light-content" />

      <ScrollView
        style={globalStyles.scrollContent}
        contentContainerStyle={styles.scrollContentContainer}
      >
        <Text style={globalStyles.subtitle}>Olá, {nome}!</Text>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Minhas Turmas</Text>

          {turmas.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Você não tem turmas associadas
              </Text>
            </View>
          ) : (
            turmas.map((turma) => (
              <TouchableOpacity
                key={turma.id}
                style={globalStyles.card}
                onPress={() => {
                  router.push({
                    pathname: "../listaAlunos",
                    params: {
                      id: turma.id.toString(),
                      nomeTurma: formatarNomeTurma(turma.nome),
                    },
                  });
                }}
              >
                <View style={globalStyles.cardContent}>
                  <Text style={globalStyles.cardEmoji}>👩‍👧‍👦</Text>
                  <View style={globalStyles.cardTextContainer}>
                    <Text style={globalStyles.cardTitle}>
                      {formatarNomeTurma(turma.nome)}
                    </Text>
                    <Text style={globalStyles.cardDescription}>
                      Visualizar alunos desta turma
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Ferramentas</Text>

          {/* <Link href="../calendario/calendario" asChild>
            <TouchableOpacity style={globalStyles.card}>
              <View style={globalStyles.cardContent}>
                <Text style={globalStyles.cardEmoji}>📅</Text>
                <View style={globalStyles.cardTextContainer}>
                  <Text style={globalStyles.cardTitle}>Calendário</Text>
                  <Text style={globalStyles.cardDescription}>
                    Cronograma e eventos escolares
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </Link> */}

          <TouchableOpacity
            style={globalStyles.card}
            onPress={() => {
              router.push("/cronograma/listar");
            }}
          >
            <View style={globalStyles.cardContent}>
              <Text style={globalStyles.cardEmoji}>🗓️</Text>
              <View style={globalStyles.cardTextContainer}>
                <Text style={globalStyles.cardTitle}>Cronograma Anual</Text>
                <Text style={globalStyles.cardDescription}>
                  Visualizar cronograma escolar
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <Link href="../eventos" asChild>
            <TouchableOpacity style={globalStyles.card}>
              <View style={globalStyles.cardContent}>
                <Text style={globalStyles.cardEmoji}>🗓️</Text>
                <View style={globalStyles.cardTextContainer}>
                  <Text style={globalStyles.cardTitle}>Eventos da turma</Text>
                  <Text style={globalStyles.cardDescription}>
                    Acessar eventos das turmas
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={globalStyles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={globalStyles.logoutButtonText}>Sair</Text>
      </TouchableOpacity>
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContentContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 30,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: "Roboto_Condensed-SemiBold",
    fontSize: 18,
    color: "#fff",
    marginBottom: 12,
    textAlign: "center",
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    marginTop: 10,
  },
  emptyContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
});

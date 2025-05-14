import { Text, View, StyleSheet, StatusBar, TouchableOpacity, ScrollView, Platform, ActivityIndicator } from "react-native";
import { Link, router } from "expo-router";
import { useEffect, useState } from "react";
import Colors from "../constants/colors";
import { formatarNomeTurma } from "../utils/formatText";
import config from '@/config';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RespDash() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [responsavelId, setResponsavelId] = useState<number | null>(null);
 
  type Aluno = {
    id: number;
    nome: string;
    turma: {
      id: number;
      nome: string;
    };
  };

  const fetchResponsavelId = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem('@user_id');
      const authToken = await AsyncStorage.getItem('@auth_token');
      
      if (!authToken) {
        Toast.show({
          type: 'error',
          text1: 'Erro de autenticação',
          text2: 'Sessão expirada. Por favor, faça login novamente.',
          visibilityTime: 3000
        });
        setTimeout(() => {
          router.replace('/');
        }, 3000);
        return null;
      }
      
      if (storedUserId) {
        const userId = parseInt(storedUserId, 10);
        setResponsavelId(userId);
        return userId;
      }

      const response = await fetch(`${config.API_URL}/usuario-logado`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();

        if (userData.roles && Array.isArray(userData.roles) && !userData.roles.includes('RESPONSAVEL')) {
          Toast.show({
            type: 'error',
            text1: 'Acesso negado',
            text2: 'Você não possui permissão para acessar esta área',
            visibilityTime: 3000
          });
          setTimeout(() => {
            router.replace('/');
          }, 3000);
          return null;
        }
        
        await AsyncStorage.setItem('@user_id', userData.id.toString());
        
        setResponsavelId(userData.id);
        return userData.id;
      } else if (response.status === 401) {
        await AsyncStorage.removeItem('@auth_token');
        await AsyncStorage.removeItem('@user_id');
        await AsyncStorage.removeItem('@user_data');
        
        Toast.show({
          type: 'error',
          text1: 'Sessão expirada',
          text2: 'Por favor, faça login novamente',
          visibilityTime: 3000
        });
        setTimeout(() => {
          router.replace('/');
        }, 3000);
        return null;
      } else {
        Toast.show({
          type: 'error',
          text1: 'Erro de autenticação',
          text2: 'Não foi possível recuperar seus dados. Por favor, faça login novamente.',
          visibilityTime: 3000
        });
        setTimeout(() => {
          router.replace('/');
        }, 3000);
        return null;
      }
    } catch (error) {
      console.error('Erro ao buscar dados do responsável:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro de conexão',
        text2: 'Não foi possível conectar ao servidor',
        visibilityTime: 3000
      });
      return null;
    }
  };
 
  useEffect(() => {
    fetchResponsavelId();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <View style={styles.formContainer}>
        <Text style={styles.title}>Responsáveis Dashboard</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2a4674",
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1,
    padding: 10,
  },
  formContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: "#2a4674",
    marginTop: 10,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#e1e1e1",
    textAlign: "center",
    marginBottom: 30,
  },
  
  label: {
    fontSize: 14,
    color: "#fff",
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    height: 50,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e1e1e1",
  },
  button: {
    backgroundColor: "#4a90e2",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  forgotPassword: {
    marginTop: 15,
    width: "100%",
    textAlign: "center",
  },
  forgotPasswordText: {
    color: "#e1e1e1",
    fontSize: 14,
    textDecorationLine: "underline",
    textAlign: "center",
  },
  logo: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    marginBottom: 10,
  },
});
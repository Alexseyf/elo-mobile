import { Text, View, StyleSheet, StatusBar, TouchableOpacity, Platform, ScrollView, ActivityIndicator } from "react-native";
import { Link, router } from "expo-router";
import { useEffect, useState } from "react";
import Colors from "../constants/colors";
import config from '@/config';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import globalStyles from '../../styles/globalStyles';
import { obterPrimeiroNome } from '../utils/formatText';

export default function Index() {
  const [loading, setLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<number | null>(null);
  const [nome, setNome] = useState<string>("");

  const verifyAuthentication = async () => {
    try {
      setLoading(true);

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
        return;
      }

      if (storedUserId) {
        setUserId(parseInt(storedUserId, 10));
        
        const userDataString = await AsyncStorage.getItem('@user_data');
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          setNome(obterPrimeiroNome(userData.nome));
        }
      } else {
        const response = await fetch(`${config.API_URL}/usuario-logado`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          }
        });

        if (response.ok) {
          const userData = await response.json();

          if (userData.roles && Array.isArray(userData.roles) && !userData.roles.includes('ADMIN')) {
            Toast.show({
              type: 'error',
              text1: 'Acesso negado',
              text2: 'Você não possui permissão para acessar esta área',
              visibilityTime: 3000
            });
            setTimeout(() => {
              router.replace('/');
            }, 3000);
            return;
          }

          await AsyncStorage.setItem('@user_id', userData.id.toString());
          setUserId(userData.id);
          setNome(obterPrimeiroNome(userData.nome));
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
          return;
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
          return;
        }
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
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
    verifyAuthentication();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('@auth_token');
      await AsyncStorage.removeItem('@user_id');
      await AsyncStorage.removeItem('@user_data');

      Toast.show({
        type: 'success',
        text1: 'Logout realizado com sucesso',
        visibilityTime: 2000
      });

      router.replace('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro ao sair',
        text2: 'Tente novamente',
        visibilityTime: 3000
      });
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

      <View style={globalStyles.header}>
        <Text style={globalStyles.subtitle}>Olá, {nome}!</Text>
      </View>

      <ScrollView
        style={globalStyles.scrollContent}
        contentContainerStyle={styles.scrollContentContainer}
      >
        <View style={styles.cardsContainer}>
          <Link href="../usuarios" asChild>
            <TouchableOpacity style={globalStyles.card}>
              <View style={globalStyles.cardContent}>
                <Text style={globalStyles.cardEmoji}>👥</Text>
                <View style={globalStyles.cardTextContainer}>
                  <Text style={globalStyles.cardTitle}>Usuários</Text>
                  <Text style={globalStyles.cardDescription}>Gerenciar usuários do sistema</Text>
                </View>
              </View>
            </TouchableOpacity>
          </Link>

          <Link href="../turmas" asChild>
            <TouchableOpacity style={globalStyles.card}>
              <View style={globalStyles.cardContent}>
                <Text style={globalStyles.cardEmoji}>🏫</Text>
                <View style={globalStyles.cardTextContainer}>
                  <Text style={globalStyles.cardTitle}>Turmas</Text>
                  <Text style={globalStyles.cardDescription}>Administrar turmas e alunos</Text>
                </View>
              </View>
            </TouchableOpacity>
          </Link>

          <Link href="../listaAlunosAtivos" asChild>
            <TouchableOpacity style={globalStyles.card}>
              <View style={globalStyles.cardContent}>
                <Text style={globalStyles.cardEmoji}>👨‍👧‍👦</Text>
                <View style={globalStyles.cardTextContainer}>
                  <Text style={globalStyles.cardTitle}>Alunos</Text>
                  <Text style={globalStyles.cardDescription}>Visualizar todos os alunos ativos</Text>
                </View>
              </View>
            </TouchableOpacity>
          </Link>

          <Link href="../listaTurmasDiarios" asChild>
            <TouchableOpacity style={globalStyles.card}>
              <View style={globalStyles.cardContent}>
                <Text style={globalStyles.cardEmoji}>📓</Text>
                <View style={globalStyles.cardTextContainer}>
                  <Text style={globalStyles.cardTitle}>Diários</Text>
                  <Text style={globalStyles.cardDescription}>Visualizar diários dos alunos</Text>
                </View>
              </View>
            </TouchableOpacity>
          </Link>

          <Link href="../calendario/calendario" asChild>
            <TouchableOpacity style={globalStyles.card}>
              <View style={globalStyles.cardContent}>
                <Text style={globalStyles.cardEmoji}>📅</Text>
                <View style={globalStyles.cardTextContainer}>
                  <Text style={globalStyles.cardTitle}>Calendário</Text>
                  <Text style={globalStyles.cardDescription}>Cronograma anual e eventos</Text>
                </View>
              </View>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
      <TouchableOpacity style={globalStyles.logoutButton} onPress={handleLogout}>
        <Text style={globalStyles.logoutButtonText}>Sair</Text>
      </TouchableOpacity>
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContentContainer: {
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 30,
  },
  cardsContainer: {
    marginTop: 0,
  },
});

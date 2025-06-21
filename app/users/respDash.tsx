import { Text, View, StyleSheet, StatusBar, TouchableOpacity, ScrollView, Platform, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import Colors from "../constants/colors";
import config from '@/config';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import globalStyles from '../../styles/globalStyles';
import { obterPrimeiroNome } from '../utils/formatText';

export default function RespDash() {
  const [loading, setLoading] = useState(true);
  const [responsavelId, setResponsavelId] = useState<number | null>(null);
  const [nome, setNome] = useState("");

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
        
        const userDataString = await AsyncStorage.getItem('@user_data');
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          setNome(obterPrimeiroNome(userData.nome));
        }
        
        setLoading(false);
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
        setNome(obterPrimeiroNome(userData.nome));
        setLoading(false);
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
      setLoading(false);
      return null;
    }
  };
 
  useEffect(() => {
    fetchResponsavelId();
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
        <StatusBar hidden barStyle="light-content" />
        <ActivityIndicator size="large" color="#fff" />
        <Text style={globalStyles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <StatusBar hidden barStyle="light-content" />

      <View style={globalStyles.header}>
        <Text style={globalStyles.subtitle}>Olá, {nome || 'Responsável'}!</Text>
      </View>

      <ScrollView
        style={globalStyles.scrollContent}
        contentContainerStyle={styles.scrollContentContainer}
      >        
        <View style={styles.cardsContainer}>
          <TouchableOpacity 
            style={globalStyles.card}            
            onPress={() => {
              if (responsavelId) {
                router.push({
                  pathname: "/responsaveis/alunosDiarios",
                  params: { responsavelId: responsavelId }
                });
              } else {
                Toast.show({
                  type: 'error',
                  text1: 'Erro',
                  text2: 'Não foi possível identificar o responsável',
                  visibilityTime: 3000
                });
              }
            }}
          >
            <View style={globalStyles.cardContent}>
              <Text style={globalStyles.cardEmoji}>📓</Text>
              <View style={globalStyles.cardTextContainer}>
                <Text style={globalStyles.cardTitle}>Diários</Text>
                <Text style={globalStyles.cardDescription}>Visualizar diários</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={globalStyles.card}
            onPress={() => {
              router.push("/cronograma/listar");
            }}
          >
            <View style={globalStyles.cardContent}>
              <Text style={globalStyles.cardEmoji}>🗓️</Text>
              <View style={globalStyles.cardTextContainer}>
                <Text style={globalStyles.cardTitle}>Cronograma</Text>
                <Text style={globalStyles.cardDescription}>Visualizar cronograma escolar</Text>
              </View>
            </View>
          </TouchableOpacity>
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

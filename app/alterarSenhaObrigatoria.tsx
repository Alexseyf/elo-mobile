import { Text, View, StyleSheet, TextInput, TouchableOpacity, StatusBar, ActivityIndicator, Platform, Alert } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useState } from 'react';
import Toast from 'react-native-toast-message';
import { router } from "expo-router";
import Colors from "./constants/colors";
import config from '../config';
import { Feather } from '@expo/vector-icons';

export default function AlterarSenhaObrigatoria() {
  const params = useLocalSearchParams();
  
  let userIdNumber: number | null = null;
  if (params.userId) {
    if (typeof params.userId === 'number') {
      userIdNumber = params.userId;
    } 
    else if (typeof params.userId === 'string') {
      const parsed = parseInt(params.userId, 10);
      if (!isNaN(parsed)) {
        userIdNumber = parsed;
      }
    }
  }
  
  const senhaAtual = typeof params.senhaAtual === 'string' ? params.senhaAtual : '';
  
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showNovaSenha, setShowNovaSenha] = useState(false);
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [retryAttempt, setRetryAttempt] = useState(0);

  interface ErrorMessages {
    [key: string]: string;
  }

  const validarSenhas = () => {
    if (!novaSenha.trim() || !confirmarSenha.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Campos obrigatórios',
        text2: 'Preencha todos os campos de senha',
        position: 'top',
        visibilityTime: 3000
      });
      return false;
    }

    if (novaSenha !== confirmarSenha) {
      Toast.show({
        type: 'error',
        text1: 'Senhas não coincidem',
        text2: 'A nova senha e a confirmação devem ser idênticas',
        position: 'top',
        visibilityTime: 3000
      });
      return false;
    }

    return true;
  };

  const testApiConnection = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${config.API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({})
      });

      clearTimeout(timeoutId);
      return response.status < 500;
    } catch (error) {
      console.error("Erro na verificação de conexão:", error);
      return false;
    }
  };

  const handleAlterarSenha = async () => {
    if (!validarSenhas()) return;

    if (userIdNumber === null) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'ID do usuário inválido ou ausente',
        position: 'top',
        visibilityTime: 3000
      });
      return;
    }

    if (!senhaAtual) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Senha atual não informada',
        position: 'top',
        visibilityTime: 3000
      });
      return;
    }

    if (!novaSenha) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Nova senha não informada',
        position: 'top',
        visibilityTime: 3000
      });
      return;
    }

    setIsLoading(true);

    const isConnected = await testApiConnection();
    if (!isConnected) {
      setIsLoading(false);

      Alert.alert(
        'Problema de conexão',
        'Não foi possível conectar ao servidor. Deseja tentar novamente?',
        [
          {
            text: 'Cancelar',
            style: 'cancel'
          },
          {
            text: 'Tentar novamente',
            onPress: () => {
              setRetryAttempt(retryAttempt + 1);
              setTimeout(() => handleAlterarSenha(), 1000);
            }
          }
        ]
      );
      return;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const requestData = {
        userId: userIdNumber,
        senhaAtual,
        novaSenha
      };

      const response = await fetch(`${config.API_URL}/alterar-senha`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestData),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const contentType = response.headers.get("content-type");
      let data;

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const textResponse = await response.text();
        throw new Error('O servidor respondeu com um formato inesperado (não-JSON)');
      }

      if (response.ok) {
        Toast.show({
          type: 'success',
          text1: 'Sucesso',
          text2: 'Senha alterada com sucesso!',
          position: 'top',
          visibilityTime: 3000,
          onHide: () => {
            router.replace('/');
          }
        });
      } else {
        const errorMessage = data.erro || 'Erro ao alterar a senha';
        
        Toast.show({
          type: 'error',
          text1: 'Erro',
          text2: errorMessage,
          position: 'top',
          visibilityTime: 3000
        });
      }
    } catch (error) {
      if ((error as { name?: string }).name === 'AbortError') {
        Toast.show({
          type: 'error',
          text1: 'Tempo esgotado',
          text2: 'A requisição demorou muito para responder. Verifique sua conexão.',
          position: 'top',
          visibilityTime: 3000
        });
      } else if ((error as Error).message?.includes('JSON Parse error') ||
        (error as Error).message?.includes('formato inesperado')) {
        Toast.show({
          type: 'error',
          text1: 'Erro de comunicação',
          text2: 'O servidor respondeu em formato inválido. Tente novamente mais tarde.',
          position: 'top',
          visibilityTime: 4000
        });

        Alert.alert(
          'Erro de comunicação',
          'O servidor pode estar em manutenção ou offline. Deseja tentar novamente?',
          [
            {
              text: 'Cancelar',
              style: 'cancel',
              onPress: () => router.replace('/')
            },
            {
              text: 'Tentar novamente',
              onPress: () => {
                setRetryAttempt(retryAttempt + 1);
                setTimeout(() => handleAlterarSenha(), 1500);
              }
            }
          ]
        );
      } else {
        Toast.show({
          type: 'error',
          text1: 'Erro de conexão',
          text2: 'Falha ao conectar com o servidor. Verifique sua internet.',
          position: 'top',
          visibilityTime: 3000
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <View style={styles.container}>
        <StatusBar hidden />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Alteração de Senha Obrigatória</Text>
        </View>
        <View style={styles.formContainer}>
          <Text style={styles.explanation}>
            Você está usando uma senha temporária. É necessário criar uma nova senha para continuar.
          </Text>

          <Text style={styles.formLabel}>Nova Senha</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Digite sua nova senha"
              secureTextEntry={!showNovaSenha}
              value={novaSenha}
              onChangeText={setNovaSenha}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity onPress={() => setShowNovaSenha(!showNovaSenha)} style={styles.icon}>
              <Feather name={showNovaSenha ? 'eye' : 'eye-off'} size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <Text style={styles.formLabel}>Confirmar Nova Senha</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Confirme sua nova senha"
              secureTextEntry={!showConfirmarSenha}
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity onPress={() => setShowConfirmarSenha(!showConfirmarSenha)} style={styles.icon}>
              <Feather name={showConfirmarSenha ? 'eye' : 'eye-off'} size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleAlterarSenha}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Alterar Senha</Text>
            )}
          </TouchableOpacity>
        </View>
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
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: "Roboto_Condensed-SemiBold",
    fontSize: 22,
    color: "#fff",
  },
  formContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    margin: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    marginTop: 50,
  },
  explanation: {
    fontFamily: "Roboto_Condensed-Regular",
    fontSize: 16,
    color: "#333",
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
  },
  formLabel: {
    fontFamily: "Roboto_Condensed-SemiBold",
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    fontFamily: "Roboto_Condensed-Regular",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: Colors.blue_btn,
    marginTop: 30,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    fontFamily: "Roboto_Condensed-SemiBold",
    color: "#fff",
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  passwordInput: {
    fontFamily: "Roboto_Condensed-ExtraLight",
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#333',
  },
  icon: {
    marginLeft: 10,
  },
});
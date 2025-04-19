import { Text, View, StyleSheet, TextInput, TouchableOpacity, StatusBar, ActivityIndicator, Platform, Alert } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useState } from 'react';
import Toast from 'react-native-toast-message';
import { router } from "expo-router";
import Colors from "./constants/colors";

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
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch('https://elo-api-git-main-alexseyfs-projects.vercel.app/usuarios', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
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

      const response = await fetch('https://elo-api-git-main-alexseyfs-projects.vercel.app/alterar-senha', {
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
          visibilityTime: 3000
        });

        try {
          const userResponse = await fetch(`https://elo-api-git-main-alexseyfs-projects.vercel.app/usuarios/${userIdNumber}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            }
          });

          if (userResponse.ok) {
            const userData = await userResponse.json();

            if (userData.roles && Array.isArray(userData.roles)) {
              if (userData.roles.includes('ADMIN')) {
                router.replace('/users/adminDash');
              } else if (userData.roles.includes('RESPONSAVEL')) {
                router.replace('/users/respDash');
              } else if (userData.roles.includes('PROFESSOR')) {
                router.replace('/users/profDash');
              } else {
                router.replace('/');
              }
            } else {
              router.replace('/');
            }
          } else {
            router.replace('/');
          }
        } catch (error) {
          router.replace('/');
        }
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
          <TextInput
            style={styles.input}
            placeholder="Digite sua nova senha"
            secureTextEntry
            value={novaSenha}
            onChangeText={setNovaSenha}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.formLabel}>Confirmar Nova Senha</Text>
          <TextInput
            style={styles.input}
            placeholder="Confirme sua nova senha"
            secureTextEntry
            value={confirmarSenha}
            onChangeText={setConfirmarSenha}
            autoCapitalize="none"
            autoCorrect={false}
          />

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
    fontSize: 16,
    color: "#333",
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
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
});
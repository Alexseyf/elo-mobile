"use client";

import {
  Text,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  StatusBar,
} from "react-native";
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import Toast from "react-native-toast-message";
import config from "../config";
import globalStyles from '../styles/globalStyles';
import { Feather } from '@expo/vector-icons';

export default function Index() {
  const params = useLocalSearchParams();
  const email = typeof params.email === 'string' ? params.email : '';
  const [code, setCode] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);
  const router = useRouter();
  
  const handleVoltar = () => {
    router.back();
  };

  const handlePassword = async () => {
    if (senha !== confirmarSenha) {
      Toast.show({
        type: "error",
        text1: "As senhas não conferem",
        text2: "Por favor, verifique a nova senha e a confirmação.",
      });
      return;
    }

    try {
      if (code === "") {
        Toast.show({
          type: "error",
          text1: "Campo obrigatório",
          text2: "Preencha o campo de código",
        });
        return;
      }

      if (senha === "") {
        Toast.show({
          type: "error",
          text1: "Campo obrigatório",
          text2: "Preencha a nova senha",
        });
        return;
      }

      const response = await fetch(`${config.API_URL}/valida-senha`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          code: code,
          novaSenha: senha,
        }),
      });

      const responseText = await response.text();

      let data = null;
      let errorMessage = responseText || "Erro desconhecido";

      if (
        responseText &&
        (responseText.startsWith("{") || responseText.startsWith("["))
      ) {
        try {
          data = JSON.parse(responseText);

          if (data && typeof data === "object") {
            if (data.erro) {
              errorMessage = data.erro;
            } else if (data.mensagem) {
              errorMessage = data.mensagem;
            }
          }
        } catch (parseError) {
          errorMessage = "Erro ao processar a resposta do servidor";
        }
      }      if (response.status === 200) {
        Toast.show({
          type: "success",
          text1: "Senha alterada com sucesso!",
        });

        setTimeout(() => {
          router.push("/");
        }, 2000);
      } else if (response.status === 400) {
        Toast.show({
          type: "error",
          text1: "Erro de validação",
          text2: errorMessage,
        });
      } else if (response.status === 404) {
        Toast.show({
          type: "error",
          text1: "Usuário não encontrado",
          text2: errorMessage,
        });
      } else {
        Toast.show({
          type: "error",
          text1: `Erro ${response.status}`,
          text2: errorMessage,
        });
      }
    } catch (error) {
      let errorMessage = "Erro desconhecido";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      } else if (error && typeof error === "object") {
        try {
          errorMessage = JSON.stringify(error);
        } catch (e) {
          errorMessage = "Erro ao serializar o objeto de erro";
        }
      }
      Toast.show({
        type: "error",
        text1: "Erro ao conectar com o servidor",
        text2: errorMessage,
      });
    }
  };
  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <View style={styles.formContainer}>
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Digite o código"
            keyboardType="number-pad"
            placeholderTextColor="#666"
            value={code}
            onChangeText={setCode}
          />
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Digite a nova senha"
              placeholderTextColor="#666"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry={!showSenha}
            />
            <TouchableOpacity onPress={() => setShowSenha(!showSenha)} style={styles.icon}>
              <Feather name={showSenha ? 'eye' : 'eye-off'} size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Confirme a nova senha"
              placeholderTextColor="#666"
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
              secureTextEntry={!showConfirmarSenha}
            />
            <TouchableOpacity onPress={() => setShowConfirmarSenha(!showConfirmarSenha)} style={styles.icon}>
              <Feather name={showConfirmarSenha ? 'eye' : 'eye-off'} size={24} color="#666" />
            </TouchableOpacity>
          </View>
        </View>
        
        <TouchableOpacity style={styles.button} onPress={handlePassword}>
          <Text style={styles.buttonText}>Enviar</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity style={globalStyles.backButton} onPress={handleVoltar}>
        <Text style={globalStyles.backButtonText}>Voltar</Text>
      </TouchableOpacity>
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2a4674",
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 1,
  },
  formContainer: {
    flex: 1,
    // justifyContent: "center",
    paddingHorizontal: 40,
  },
  logo: {
    width: 200,
    height: 200,
    alignSelf: "center",
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
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
    fontFamily: "Roboto-Condesed-Regular",
    color: "white",
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    marginBottom: 15,
    height: 50,
    paddingHorizontal: 15,
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  icon: {
    marginLeft: 10,
  },
});

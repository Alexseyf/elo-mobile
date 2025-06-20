import { Text, View, StyleSheet, TextInput, TouchableOpacity, Image, StatusBar, ActivityIndicator } from "react-native";
import { Link, router } from "expo-router";
import { useState } from 'react';
import Toast from 'react-native-toast-message';
import config from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import globalStyles from '../styles/globalStyles';

export default function Index() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    try {
      if (!email || !senha) {
        Toast.show({
          type: 'error',
          text1: 'Campo obrigatório',
          text2: 'Preencha todos os campos',
          visibilityTime: 3000
        });
        return;
      }
      
      setIsLoading(true);
        const emailSemEspacos = email.trim();
      
      const response = await fetch(`${config.API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: emailSemEspacos,
          senha: senha
        }),
      });
      
      if (response.status === 200 || response.status === 201) {
        const data = await response.json();

        if (data.token) {
          await AsyncStorage.setItem('@auth_token', data.token);
          await AsyncStorage.setItem('@user_id', data.id.toString());
          await AsyncStorage.setItem('@user_data', JSON.stringify(data));
        }
        
        if (data.primeiroAcesso === true) {
          
          Toast.show({
            type: 'info',
            text1: 'Primeiro acesso',
            text2: 'É necessário alterar sua senha para continuar',
            visibilityTime: 3000
          });
          
          router.push({
            pathname: '../alterarSenhaObrigatoria',
            params: { userId: data.id, senhaAtual: senha }
          });
          setIsLoading(false);
          return;
        }
        
        if (data.roles && Array.isArray(data.roles)) {
          if (data.roles.includes('ADMIN')) {
            router.push('../users/adminDash');
          } 
          else if (data.roles.includes('RESPONSAVEL')) {
            router.push('/users/respDash');
          } else if (data.roles.includes('PROFESSOR')) {
            router.push('/users/profDash');
          } else {
            Toast.show({
              type: 'info',
              text1: 'Sem permissão',
              text2: 'Usuário sem perfil definido',
              visibilityTime: 3000
            });
          }
        } else {
          Toast.show({
            type: 'error',
            text1: 'Erro de perfil',
            text2: 'Nenhum perfil associado à conta',
            visibilityTime: 3000
          });
        }
      } else {
        Toast.show({
          type: 'error',
          text1: 'Erro ao fazer login',
          text2: 'Usuário ou senha inválidos',
          visibilityTime: 3000
        });
      }
    } catch (error) {
      console.error('Erro no login:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro ao conectar com o servidor',
        visibilityTime: 3000
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={globalStyles.container}>
      <StatusBar hidden barStyle="light-content" />
      
      <View style={globalStyles.formContainer}>
        <Image source={require("../assets/images/logo.png")} style={styles.logo} />
        <Text style={globalStyles.title}>Bem-vindo</Text>
        <View style={globalStyles.inputContainer}>
          <Text style={globalStyles.label}>Email</Text>
          <TextInput
            style={globalStyles.input}
            placeholder="Digite seu email"
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#666"            value={email}
            onChangeText={(text) => setEmail(text.trim())}
          />
          
          <Text style={globalStyles.label}>Senha</Text>
          <TextInput
            style={globalStyles.input}
            placeholder="Digite sua senha"
            secureTextEntry
            autoCapitalize="none"
            placeholderTextColor="#666"
            value={senha}
            onChangeText={setSenha}
          />
        </View>

        <TouchableOpacity 
          style={[globalStyles.button, isLoading && styles.buttonDisabled]} 
          onPress={handleLogin} 
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={globalStyles.buttonText}>Entrar</Text>
          )}
        </TouchableOpacity>

        <Link href="./recuperaSenha" style={styles.forgotPassword}>
          <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
        </Link>
      </View>
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  forgotPassword: {
    marginTop: 15,
    width: "100%",
    textAlign: "center",
  },
  forgotPasswordText: {
    fontFamily: "Roboto_Condensed-Regular",
    color: "#e1e1e1",
    fontSize: 16,
    textDecorationLine: "underline",
    textAlign: "center",
  },
  logo: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    marginBottom: 10,
    marginTop: 80
  },
  buttonDisabled: {
    backgroundColor: '#c8c8c8',
  },
});
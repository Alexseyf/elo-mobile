import { Text, View, StyleSheet, TextInput, TouchableOpacity, Image, StatusBar } from "react-native";
import { Link, router } from "expo-router";
import { useState } from 'react';
import Toast from 'react-native-toast-message';
import { API_URL } from '@env';

export default function Index() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

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
      
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          senha: senha
        }),
      });
      
      if (response.status === 200 || response.status === 201) {
        const data = await response.json();
        
        console.log('Resposta do login:', JSON.stringify(data));
        
        if (data.primeiroAcesso === true) {
          
          Toast.show({
            type: 'info',
            text1: 'Primeiro acesso',
            text2: 'É necessário alterar sua senha para continuar',
            visibilityTime: 3000
          });
          
          router.push({
            pathname: '/alterarSenhaObrigatoria',
            params: { userId: data.id, senhaAtual: senha }
          });
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
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <View style={styles.formContainer}>
      <Image 
          source={require('../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Bem-vindo</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite seu email"
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#666"
            value={email}
            onChangeText={setEmail}
          />
          
          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite sua senha"
            secureTextEntry
            placeholderTextColor="#666"
            value={senha}
            onChangeText={setSenha}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>

        <Link href="./recuperaSenha" style={styles.forgotPassword}>
          <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
        </Link>
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
    top: 40,
    left: 20,
    zIndex: 1,
    padding: 10,
  },
  formContainer: {
    flex: 1,
    justifyContent: "flex-start",
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
  inputContainer: {
    marginBottom: 20,
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
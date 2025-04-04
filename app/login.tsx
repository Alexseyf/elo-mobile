import { Text, View, StyleSheet, TextInput, TouchableOpacity, Image, Alert } from "react-native";
import { Link, router } from "expo-router";
import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';

export default function Index() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleLogin = async () => {
    try {
      const response = await fetch('https://backend-projeto-integrador-eta.vercel.app/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          senha: senha
        }),
      });

      if (response.status === 200) {
        const data = await response.json();
        if (data.usuarioTipo === 'ADMIN') {
          router.push('../users/adminDash');
        } else if (data.usuarioTipo === 'RESPONSAVEL') {
          router.push('/users/respDash');
        } else if (data.usuarioTipo === 'PROFESSOR') {
          router.push('/users/profDash');
        } else {
          console.log('Erro', 'Tipo de usuário inválido');
        }
      } else {
        console.log('Não foi possível logar');
      }
    } catch (error) {
      console.log('Erro', 'Erro ao conectar com o servidor');
    }
  };

  return (
    <View style={styles.container}>
      {/* <Link href="./" style={styles.backButton}>
        <MaterialIcons name="arrow-back" size={24} color="#fff" />
      </Link> */}
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
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 32,
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
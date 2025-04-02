import { Text, View, StyleSheet, TextInput, TouchableOpacity, Image, Alert } from "react-native";
import { Link, router } from "expo-router";
import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { useRouter } from "expo-router";

export default function Index() {
  const [email, setEmail] = useState('');
  const router = useRouter();

  const handleEmail = async () => {
    try {
    const response = await fetch('https://backend-projeto-integrador-eta.vercel.app/recupera-senha', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email
      }),
    });

      if (response.status === 200) {
        router.push({
          pathname: '../enviaCodigoSenha',
          params: { email },
        });
        console.log('email enviado com sucesso!');
      } else {
        console.log('Usuário não encontrado');
      }
    } catch (error) {
      console.log('Erro', 'Erro ao conectar com o servidor');
    }
  };

  return (
    <View style={styles.container}>
      <Link href="./login" style={styles.backButton}>
        <MaterialIcons name="arrow-back" size={24} color="#fff" />
      </Link>
      <View style={styles.formContainer}>
      <Image 
          source={require('../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Informe o e-mail</Text>
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
        </View>

        <TouchableOpacity style={styles.button} onPress={handleEmail}>
          <Text style={styles.buttonText}>Enviar</Text>
        </TouchableOpacity>
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
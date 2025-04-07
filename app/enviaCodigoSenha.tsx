import { Text, View, StyleSheet, TextInput, TouchableOpacity, Image, Alert } from "react-native";
import { Link, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";

export default function Index() {
  const { email } = useLocalSearchParams();
  const [code, setCode] = useState('');
  const [senha, setSenha] = useState('');
  const router = useRouter();

  const handlePassword = async () => {
    try {
    const response = await fetch('https://backend-projeto-integrador-eta.vercel.app/valida-senha', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        code: code,
        novaSenha: senha
      }),
    });

      if (response.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Senha alterada com sucesso!',
        });
        router.push('./login');
      } else if (response.status === 400) { 
        Toast.show({
          type: 'error',
          text1: 'Erro ao alterar senha',
          text2: 'Código inválido',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao conectar com o servidor',
      });
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
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Digite o código"
            keyboardType="number-pad"
            placeholderTextColor="#666"
            value={code}
            onChangeText={setCode}
          />
          <TextInput
            style={styles.input}
            placeholder="Digite a nova senha"
            keyboardType="visible-password"
            placeholderTextColor="#666"
            value={senha}
            onChangeText={setSenha}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handlePassword}>
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
    // borderRadius: 15,
    // shadowColor: "#000",
    // shadowOffset: {
    //   width: 0,
    //   height: 2,
    // },
    // shadowOpacity: 0.25,
    // shadowRadius: 3.84,
    // elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
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
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  logo: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    marginBottom: 10,
  },
});
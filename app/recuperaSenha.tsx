import {
  Text,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { useState } from 'react';
import Toast from "react-native-toast-message";
import config from '../config';
import globalStyles from '../styles/globalStyles';

export default function Index() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  const handleVoltar = () => {
    router.back();
  };

  const handleEmail = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${config.API_URL}/recupera-senha`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
          }),
        }
      );

      if (email.trim() === "") {
        Toast.show({
          type: "error",
          text1: "Campo obrigatório",
          text2: "Preencha o campo de email",
        });
        return;
      }      if (response.status === 200) {
        Toast.show({
          type: "success",
          text1: "Email enviado com sucesso!",
        });
        
        setTimeout(() => {
          router.push({
            pathname: "../enviaCodigoSenha",
            params: { email: email.trim() },
          });
        }, 2000);
      } else {
        Toast.show({
          type: "error",
          text1: "Erro ao enviar email",
          text2: "Usuário não encontrado",
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Erro ao conectar com o servidor",
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <View style={globalStyles.container}>
      <StatusBar hidden />
      <View style={globalStyles.formContainer}>
        <Image
          source={require("../assets/images/logo.png")}
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
        
        <TouchableOpacity 
          style={[globalStyles.button, isLoading && styles.buttonDisabled]} 
          onPress={handleEmail}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={globalStyles.buttonText}>Enviar</Text>
          )}
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
  title: {
    fontFamily: "Roboto-Condesed-SemiBold",
    fontSize: 24,
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: "Roboto-Condesed-SemiBold",
    fontSize: 16,
    color: "#e1e1e1",
    textAlign: "center",
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontFamily: "Roboto-Condesed-Regular",
    fontSize: 14,
    color: "#fff",
    marginBottom: 8,
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
  forgotPassword: {
    marginTop: 15,
    width: "100%",
    textAlign: "center",
  },
  forgotPasswordText: {
    fontFamily: "Roboto-Condesed-SemiBold",
    color: "#e1e1e1",
    fontSize: 14,
    textDecorationLine: "underline",
    textAlign: "center",
  },
  logo: {
    width: 200,
    height: 200,
    alignSelf: "center",
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#c8c8c8',
  },
});

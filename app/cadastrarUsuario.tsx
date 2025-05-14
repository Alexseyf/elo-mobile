import { Text, View, StyleSheet, StatusBar, TouchableOpacity, Platform, ScrollView, TextInput, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import Colors from "./constants/colors";
import { useState } from "react";
import Toast from 'react-native-toast-message';
import config from '../config';
import { formatarNome } from "./utils/formatText";

enum TIPO_USUARIO {
  ADMIN = "ADMIN",
  PROFESSOR = "PROFESSOR",
  RESPONSAVEL = "RESPONSAVEL"
}

interface SelectedProfiles {
  administrador: boolean;
  professor: boolean;
  responsavel: boolean;
}

export default function CadastrarUsuario() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const [selectedProfiles, setSelectedProfiles] = useState<SelectedProfiles>({
    administrador: false,
    professor: false,
    responsavel: false
  });
  
  const handleVoltar = () => {
    router.back();
  };
  
  const validateFields = () => {
    if (nome.trim().length < 3 || nome.trim().length > 60) {
      Toast.show({
        type: 'error',
        text1: 'Erro de validação',
        text2: 'Nome deve ter entre 3 e 60 caracteres',
        visibilityTime: 3000
      });
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) || email.length > 40) {
      Toast.show({
        type: 'error',
        text1: 'Erro de validação',
        text2: 'Email inválido ou muito longo (máx. 40 caracteres)',
        visibilityTime: 3000
      });
      return false;
    }
    
    if (telefone.trim().length < 10 || telefone.trim().length > 20) {
      Toast.show({
        type: 'error',
        text1: 'Erro de validação',
        text2: 'Telefone deve ter entre 10 e 20 caracteres',
        visibilityTime: 3000
      });
      return false;
    }
    
    const hasSelectedProfile = Object.values(selectedProfiles).some(isSelected => isSelected);
    if (!hasSelectedProfile) {
      Toast.show({
        type: 'error',
        text1: 'Erro de validação',
        text2: 'Selecione pelo menos um perfil de acesso',
        visibilityTime: 3000
      });
      return false;
    }
    
    return true;
  };
  
  const handleCadastrar = async () => {
    if (!validateFields()) return;
    
    setIsLoading(true);
    
    try {
      const roles: TIPO_USUARIO[] = [];
      
      if (selectedProfiles.administrador) {
        roles.push(TIPO_USUARIO.ADMIN);
      }
      if (selectedProfiles.professor) {
        roles.push(TIPO_USUARIO.PROFESSOR);
      }
      if (selectedProfiles.responsavel) {
        roles.push(TIPO_USUARIO.RESPONSAVEL);
      }
      
      const userData = {
        nome: formatarNome(nome.trim()),
        email: email.trim(),
        telefone: telefone.trim(),
        roles: roles
      };
      
      const response = await fetch(`${config.API_URL}/usuarios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao cadastrar usuário');
      }
      
      Toast.show({
        type: 'success',
        text1: 'Sucesso!',
        text2: 'Usuário cadastrado com sucesso',
        visibilityTime: 3000
      });
      
      setTimeout(() => {
        router.back();
      }, 500);
      
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: error instanceof Error ? error.message : 'Falha ao cadastrar usuário',
        visibilityTime: 3000
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleProfile = (profile: keyof SelectedProfiles): void => {
    setSelectedProfiles((prev: SelectedProfiles) => ({
      ...prev,
      [profile]: !prev[profile]
    }));
  };
  
  return (
    <>
      <View style={styles.container}>
        <StatusBar hidden />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Cadastrar Novo Usuário</Text>
        </View>
        <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollContentContainer}>
          <View style={styles.formContainer}>
            <Text style={styles.formLabel}>Nome Completo</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Digite o nome completo"
              value={nome}
              onChangeText={setNome}
              maxLength={60}
              onBlur={() => setNome(formatarNome(nome))}
            />
            
            <Text style={styles.formLabel}>E-mail</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Digite o e-mail"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              maxLength={40}
              autoCapitalize="none"
            />

            <Text style={styles.formLabel}>Telefone</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Digite o telefone"
              keyboardType="phone-pad"
              value={telefone}
              onChangeText={setTelefone}
              maxLength={20}
            />
            
            <Text style={styles.formLabel}>Perfil de Acesso</Text>
            <View style={styles.profileSelection}>
              <TouchableOpacity 
                style={[
                  styles.profileOption, 
                  selectedProfiles.administrador && styles.profileOptionActive
                ]}
                onPress={() => toggleProfile('administrador')}
              >
                <Text style={[
                  styles.profileOptionText,
                  selectedProfiles.administrador && styles.profileOptionTextActive
                ]}>Administrador</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.profileOption, 
                  selectedProfiles.professor && styles.profileOptionActive
                ]}
                onPress={() => toggleProfile('professor')}
              >
                <Text style={[
                  styles.profileOptionText,
                  selectedProfiles.professor && styles.profileOptionTextActive
                ]}>Professor</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.profileOption, 
                  selectedProfiles.responsavel && styles.profileOptionActive
                ]}
                onPress={() => toggleProfile('responsavel')}
              >
                <Text style={[
                  styles.profileOptionText,
                  selectedProfiles.responsavel && styles.profileOptionTextActive
                ]}>Responsável</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.submitButton} 
              onPress={handleCadastrar}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Cadastrar</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleVoltar}
          disabled={isLoading}
        >
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
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
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 30,
  },
  formContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
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
  profileSelection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  profileOption: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    padding: 8,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  profileOptionActive: {
    backgroundColor: Colors.blue_btn,
  },
  profileOptionText: {
    fontSize: 14,
    color: "#333",
  },
  profileOptionTextActive: {
    color: "#fff",
    fontWeight: "600",
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
  backButton: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingVertical: 14,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: Platform.OS === 'ios' ? 80 : 60,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.blue_btn,
  }
});
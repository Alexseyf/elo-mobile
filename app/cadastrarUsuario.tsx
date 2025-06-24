import { Text, View, StyleSheet, StatusBar, TouchableOpacity, Platform, ScrollView, TextInput, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import Colors from "./constants/colors";
import { useState } from "react";
import Toast from 'react-native-toast-message';
import config from '../config';
import { formatarNome } from "./utils/formatText";
import globalStyles from '../styles/globalStyles';

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
        email: email.trim().toLowerCase(),
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
      
      let responseData;
      try {
        const responseText = await response.text();
        if (responseText) {
          responseData = JSON.parse(responseText);
        }
      } catch (parseError) {
        console.log('Erro ao analisar resposta:', parseError);
      }
      
      if (!response.ok) {
        if (response.status === 409) {
          throw new Error(responseData?.erro || 'Email já cadastrado no sistema');
        } else {
          throw new Error(responseData?.message || 'Erro ao cadastrar usuário');
        }
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
      const errorTitle = 
        error instanceof Error && error.message.includes('Email já cadastrado') 
          ? 'Email já cadastrado' 
          : 'Erro';
      
      Toast.show({
        type: 'error',
        text1: errorTitle,
        text2: error instanceof Error ? error.message : 'Falha ao cadastrar usuário',
        visibilityTime: 4000
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
      <View style={globalStyles.container}>
        <StatusBar hidden />
        <View style={globalStyles.header}>
          <Text style={globalStyles.headerTitle}>Cadastrar Novo Usuário</Text>
        </View>
        <ScrollView style={globalStyles.scrollContent} contentContainerStyle={globalStyles.scrollContentContainer}>
          <View style={globalStyles.userFormContainer}>
            <Text style={globalStyles.userFormLabel}>Nome Completo</Text>
            <TextInput 
              style={[globalStyles.input]}
              placeholder="Digite o nome completo"
              placeholderTextColor="#666"
              value={nome}
              onChangeText={setNome}
              maxLength={60}
              onBlur={() => setNome(formatarNome(nome))}
            />
            
            <Text style={globalStyles.userFormLabel}>E-mail</Text>
            <TextInput 
              style={[globalStyles.input]}
              placeholder="Digite o e-mail"
              placeholderTextColor="#666"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              maxLength={40}
              autoCapitalize="none"
            />

            <Text style={globalStyles.userFormLabel}>Telefone</Text>
            <TextInput 
              style={[globalStyles.input]}
              placeholder="Digite o telefone"
              placeholderTextColor="#666"
              keyboardType="phone-pad"
              value={telefone}
              onChangeText={setTelefone}
              maxLength={20}
            />
            
            <Text style={globalStyles.userFormLabel}>Perfil de Acesso</Text>
            <View style={globalStyles.profileSelection}>
              <TouchableOpacity 
                style={[
                  globalStyles.profileOption, 
                  selectedProfiles.administrador && globalStyles.profileOptionActive
                ]}
                onPress={() => toggleProfile('administrador')}
              >
                <Text style={[
                  globalStyles.profileOptionText,
                  selectedProfiles.administrador && globalStyles.profileOptionTextActive
                ]}>Administrador</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  globalStyles.profileOption, 
                  selectedProfiles.professor && globalStyles.profileOptionActive
                ]}
                onPress={() => toggleProfile('professor')}
              >
                <Text style={[
                  globalStyles.profileOptionText,
                  selectedProfiles.professor && globalStyles.profileOptionTextActive
                ]}>Professor</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  globalStyles.profileOption, 
                  selectedProfiles.responsavel && globalStyles.profileOptionActive
                ]}
                onPress={() => toggleProfile('responsavel')}
              >
                <Text style={[
                  globalStyles.profileOptionText,
                  selectedProfiles.responsavel && globalStyles.profileOptionTextActive
                ]}>Responsável</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={globalStyles.submitButton} 
              onPress={handleCadastrar}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={globalStyles.submitButtonText}>Cadastrar</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
        <TouchableOpacity 
          style={globalStyles.backButton} 
          onPress={handleVoltar}
          disabled={isLoading}
        >
          <Text style={globalStyles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
      <Toast />
    </>
  );
}

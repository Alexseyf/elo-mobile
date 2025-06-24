import { Text, View, StyleSheet, StatusBar, TouchableOpacity, Platform, ScrollView } from "react-native";
import { Link, router } from "expo-router";
import Colors from "./constants/colors";
import globalStyles from '../styles/globalStyles';

export default function Usuarios() {
  
  const handleVoltar = () => {
    router.back();
  };
  
  return (
    <View style={globalStyles.container}>
      <StatusBar hidden />
      <View style={globalStyles.header}>
        <Text style={globalStyles.headerTitle}>Cadastro de Usuários</Text>
      </View>
      <ScrollView style={globalStyles.scrollContent} contentContainerStyle={globalStyles.scrollContentContainer}>
        <View style={globalStyles.cardsContainer}>
          <Link href="./cadastrarUsuario" asChild>
            <TouchableOpacity style={globalStyles.card}>
              <View style={globalStyles.cardContent}>
                <Text style={globalStyles.cardEmoji}>➕</Text>
                <View style={globalStyles.cardTextContainer}>
                  <Text style={globalStyles.cardTitle}>Cadastrar Usuário</Text>
                  <Text style={globalStyles.cardDescription}>Criar novas contas de usuário</Text>
                </View>
              </View>
            </TouchableOpacity>
          </Link>
          
          <Link href="./cadastrarAluno" asChild>
            <TouchableOpacity style={globalStyles.card}>
              <View style={globalStyles.cardContent}>
                <Text style={globalStyles.cardEmoji}>👨‍🎓</Text>
                <View style={globalStyles.cardTextContainer}>
                  <Text style={globalStyles.cardTitle}>Cadastrar Aluno</Text>
                  <Text style={globalStyles.cardDescription}>Adicionar novos alunos</Text>
                </View>
              </View>
            </TouchableOpacity>
          </Link>
          
          {/* Outros botões adicionados aqui posteriormente */}
          
        </View>
      </ScrollView>
      <TouchableOpacity style={globalStyles.backButton} onPress={handleVoltar}>
        <Text style={globalStyles.backButtonText}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: Colors.blue_btn,
//   },
//   header: {
//     backgroundColor: Colors.blue_btn,
//     paddingTop: Platform.OS === 'ios' ? 60 : 40,
//     paddingBottom: 20,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   headerTitle: {
//     fontFamily: "Roboto_Condensed-SemiBold",
//     fontSize: 22,
//     fontWeight: "bold",
//     color: "#fff",
//   },
//   scrollContent: {
//     flex: 1,
//   },
//   scrollContentContainer: {
//     paddingHorizontal: 16,
//     paddingTop: 20,
//     paddingBottom: Platform.OS === 'ios' ? 40 : 30,
//   },
//   cardsContainer: {
//     marginTop: 10,
//   },
//   card: {
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     marginBottom: 16,
//     elevation: 2,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 3,
//   },
//   cardContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 16,
//   },
//   cardEmoji: {
//     fontSize: 28,
//     marginRight: 16,
//   },
//   cardTextContainer: {
//     flex: 1,
//   },
//   cardTitle: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: "#333",
//     marginBottom: 4,
//   },
//   cardDescription: {
//     fontSize: 14,
//     color: "#666",
//   },
//   backButton: {
//     backgroundColor: "rgba(255, 255, 255, 0.9)",
//     paddingVertical: 14,
//     marginHorizontal: 16,
//     marginTop: 10,
//     marginBottom: Platform.OS === 'ios' ? 60 : 40,
//     borderRadius: 10,
//     alignItems: "center",
//     justifyContent: "center",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 3,
//     elevation: 2,
//   },
//   backButtonText: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: Colors.blue_btn,
//   }
// });
import { Text, View, StyleSheet, StatusBar, TouchableOpacity, Platform, ScrollView } from "react-native";
import { Link, router } from "expo-router";
import Colors from "../constants/colors";

export default function Index() {
  
  const handleLogout = () => {
    // Implementar o logout quando definir a questão do token
    router.replace('/'); 
  };
  
  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollContentContainer}>
        <View style={styles.cardsContainer}>
          <Link href="../usuarios" asChild>
            <TouchableOpacity style={styles.card}>
              <View style={styles.cardContent}>
                <Text style={styles.cardEmoji}>👥</Text>
                <View style={styles.cardTextContainer}>
                  <Text style={styles.cardTitle}>Usuários</Text>
                  <Text style={styles.cardDescription}>Gerenciar contas e perfis</Text>
                </View>
              </View>
            </TouchableOpacity>
          </Link>

          <Link href="../turmas" asChild>
            <TouchableOpacity style={styles.card}>
              <View style={styles.cardContent}>
                <Text style={styles.cardEmoji}>🏫</Text>
                <View style={styles.cardTextContainer}>
                  <Text style={styles.cardTitle}>Turmas</Text>
                  <Text style={styles.cardDescription}>Administrar turmas e alunos</Text>
                </View>
              </View>
            </TouchableOpacity>
          </Link>

          <Link href="../diario/page" asChild>
            <TouchableOpacity style={styles.card}>
              <View style={styles.cardContent}>
                <Text style={styles.cardEmoji}>📓</Text>
                <View style={styles.cardTextContainer}>
                  <Text style={styles.cardTitle}>Diário</Text>
                  <Text style={styles.cardDescription}>Registros diários e anotações</Text>
                </View>
              </View>
            </TouchableOpacity>
          </Link>

          <Link href="../calendar/calendar" asChild>
            <TouchableOpacity style={styles.card}>
              <View style={styles.cardContent}>
                <Text style={styles.cardEmoji}>📅</Text>
                <View style={styles.cardTextContainer}>
                  <Text style={styles.cardTitle}>Calendário</Text>
                  <Text style={styles.cardDescription}>Cronograma anual e eventos</Text>
                </View>
              </View>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Sair</Text>
      </TouchableOpacity>
    </View>
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
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 30,
    marginTop: 40
  },
  cardsContainer: {
    marginTop: 10,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  cardEmoji: {
    fontSize: 28,
    marginRight: 16,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: "#666",
  },
  logoutButton: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingVertical: 14,
    marginHorizontal: 16,
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
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#f05454",
  }
});

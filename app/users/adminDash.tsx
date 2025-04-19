import { Text, View, StyleSheet, StatusBar, TouchableOpacity, Platform } from "react-native";
import { Link } from "expo-router";
import Colors from "../constants/colors";

export default function Index() {
  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <View style={styles.formContainer}>
        <View style={styles.buttonGrid}>
          <Link href="../usuarios" asChild>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Usuários</Text>
            </TouchableOpacity>
          </Link>

          <Link href="../turmas" asChild>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Turmas</Text>
            </TouchableOpacity>
          </Link>

          <Link href="../diario/page" asChild>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Diario</Text>
            </TouchableOpacity>
          </Link>

          <Link href="../calendar/calendar" asChild>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Calendário</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.blue_btn,
  },
  formContainer: {
    flex: 1,
    backgroundColor: Colors.blue_btn,
    padding: 20,
    marginBottom: Platform.OS === 'ios' ? 30 : 40,
  },
  buttonGrid: {
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: 20,
  },
  button: {
    backgroundColor: "#4a90e2",
    borderRadius: 0,
    height: "22%",
    marginVertical: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
  },
});

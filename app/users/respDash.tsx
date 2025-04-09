import { Text, View, StyleSheet, StatusBar } from "react-native";
import { Link } from "expo-router";
import { MaterialIcons } from '@expo/vector-icons';



export default function Index() {
return (
  <View style={styles.container}>
    <StatusBar hidden />
    {/* <Link href="./" style={styles.backButton}>
      <MaterialIcons name="arrow-back" size={24} color="#fff" />
    {/* <Link href="./" style={styles.backButton}>
      <MaterialIcons name="arrow-back" size={24} color="#fff" />
    </Link> */}
    <View style={styles.formContainer}>
    <Text style={styles.title}>Responsáveis Dashboard</Text>
    {/* <Link href={"/"}><button style={styles.button}>Home</button></Link> */}
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
    top: 20,
    left: 20,
    zIndex: 1,
    padding: 10,
  },
  formContainer: {
    flex: 1,
    justifyContent: "center",
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
import { Text, View, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Link } from "expo-router";

export default function Index() {
  return (
    <>
    <Link href="./login" asChild>
      <TouchableOpacity style={styles.container}>
        <Image 
          source={require('../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </Link>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2a4674",
  },
  logo: {
    width: 300,
    height: 300,
  }
});
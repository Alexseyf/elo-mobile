import React from "react";
import { View, StyleSheet, StatusBar, Text, TouchableOpacity, Platform } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import CalendarComponent from "../components/Calendar";
import { router } from "expo-router";
import Colors from "../constants/colors";
import globalStyles from "../../styles/globalStyles";

export default function Calendario() {
  const handleGoBack = () => {
    router.back();
  };
  return (
    <>
      <StatusBar hidden />
      <View style={globalStyles.container}>
        <View style={globalStyles.header}>
          <Text style={globalStyles.headerTitle}>Calendário</Text>
        </View>
        <View style={styles.calendarWrapper}>
          <CalendarComponent />
        </View>
        <TouchableOpacity style={globalStyles.backButton} onPress={handleGoBack}>
          <Text style={globalStyles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
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
  calendarWrapper: {
    flex: 1,
    paddingHorizontal: 16,
  },
  backButton: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingVertical: 14,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: Platform.OS === 'ios' ? 30 : 40,
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

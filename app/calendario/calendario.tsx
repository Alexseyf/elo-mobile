import React from "react";
import { View, StyleSheet, StatusBar, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import CalendarComponent from "../components/Calendar";
import { router } from "expo-router";

export default function Calendario() {
  const handleGoBack = () => {
    router.back();
  };

  return (
    <>
      <StatusBar hidden />
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
        <MaterialIcons name="close" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={styles.calendarWrapper}>
          <CalendarComponent />
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2a4674",
    padding: 24,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1,
    padding: 10,
  },
  calendarWrapper: {
    marginTop: 40,
    flex: 1,
  },
});

import React from "react";
import { View, StyleSheet, StatusBar } from "react-native";
import CalendarComponent from "../components/Calendar";
import { Link } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

export default function Calendar() {
  return (
    <>
      <StatusBar hidden />
      <View style={styles.container}>
        <Link href="../users/adminDash" style={styles.backButton}>
          <MaterialIcons name="close" size={24} color="#fff" />
        </Link>
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

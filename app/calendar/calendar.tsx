import React from "react";
import { View, StyleSheet, StatusBar } from "react-native";
import { CalendarComponent } from "../components/Calendar";

export default function Calendar() {
  return (
    <>
    <StatusBar hidden />
    <View style={styles.container}>
    <CalendarComponent />
    </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:1,
    backgroundColor: "#2a4674",
    padding: 24
  },
});
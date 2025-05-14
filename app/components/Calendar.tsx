import { View } from "react-native";
import { Calendar, DateData, LocaleConfig } from "react-native-calendars";
import { StyleSheet } from "react-native";
import { useState } from "react";
import { Feather } from "@expo/vector-icons";
import { ptBR } from "../utils/localeCalendarConfig";

LocaleConfig.locales["pt-br"] = ptBR;
LocaleConfig.defaultLocale = "pt-br";

export default function CalendarComponent() {
    const [day, setDay] = useState<DateData>()
  return (
    <View style={{ flex: 1 }}>
      <Calendar style={styles.calendar}
      renderArrow={(direction: "right" | "left") => (
        <Feather name={`chevron-${direction}`} size={24} color="#E8E8E8"  />
      )}
      headerStyle={{
        borderBottomWidth: 0.5,
        borderBottomColor: "#E8E8E8",
        paddingBottom: 10,
        marginBottom: 10,
      }}
      theme={{
        textMonthFontSize: 20,
        monthTextColor: "#E8E8E8",
        todayTextColor: "#77DD77",
        selectedDayBackgroundColor: "#F05543",
        selectedDayTextColor: "#E8E8E8",
        arrowColor: "#E8E8E8",
        calendarBackground: "#transparent",
        textDayStyle: {
            color: "#E8E8E8",
        },
        textDisabledColor: "#717171",
        arrowStyle: {
            margin: 0,
            padding: 0,
        }
      }}
      minDate={new Date().toDateString()}
      hideExtraDays
      onDayPress={setDay}
      markedDates={day && {
        [day.dateString]: {
          selected: true,
        }
      }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
    calendar: {
        backgroundColor: "transparent",
    },
});
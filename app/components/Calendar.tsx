import { View } from "react-native";
import { Calendar, DateData, LocaleConfig } from "react-native-calendars";
import { StyleSheet } from "react-native";
import { useState } from "react";
import { Feather } from "@expo/vector-icons";
import { ptBR } from "../utils/localeCalendarConfig";
import Colors from "../constants/colors";

LocaleConfig.locales["pt-br"] = ptBR;
LocaleConfig.defaultLocale = "pt-br";

export default function CalendarComponent() {
    const [day, setDay] = useState<DateData>()
  return (
    <View style={{ flex: 1 }}>
      <Calendar style={styles.calendar}
      renderArrow={(direction: "right" | "left") => (
        <Feather name={`chevron-${direction}`} size={24} color={Colors.white} />
      )}
      headerStyle={{
        borderBottomWidth: 0.5,
        borderBottomColor: Colors.white,
        paddingBottom: 10,
        marginBottom: 10,
      }}
      theme={{
        textMonthFontSize: 20,
        textMonthFontFamily: "Roboto_Condensed-SemiBold",
        textDayFontFamily: "Roboto_Condensed-Regular",
        textDayHeaderFontFamily: "Roboto_Condensed-SemiBold",
        monthTextColor: Colors.white,
        todayTextColor: Colors.green_btn,
        selectedDayBackgroundColor: Colors.red_btn,
        selectedDayTextColor: Colors.white,
        arrowColor: Colors.white,
        calendarBackground: "transparent",
        textDayStyle: {
            color: Colors.white,
            fontFamily: "Roboto_Condensed-Regular",
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
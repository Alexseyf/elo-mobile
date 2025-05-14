import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

interface TimeSelectorProps {
  hour: number;
  minute: number;
  onHourChange: (hour: number) => void;
  onMinuteChange: (minute: number) => void;
  label: string;
  minHour?: number; 
  minMinute?: number;
}

const TimeSelector: React.FC<TimeSelectorProps> = ({
  hour,
  minute,
  onHourChange,
  onMinuteChange,
  label,
  minHour,
  minMinute
}) => {
  
  const hours = Array.from({ length: 13 }, (_, i) => i + 7);

  const minutes = [0, 15, 30, 45];

  
  const isTimeDisabled = (h: number, m: number): boolean => {
    if (minHour === undefined || minMinute === undefined) return false;    
    if (m === 0) {
      return h < minHour;
    }
    if (h === minHour) {
      return m <= minMinute;
    }
    return false;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.timePickerContainer}>
        <View style={styles.pickerColumn}>
          <Text style={styles.pickerLabel}>Hora</Text>
          <ScrollView 
            style={styles.picker} 
            showsVerticalScrollIndicator={true}
            persistentScrollbar={true}
            nestedScrollEnabled={true}
          >
            <View style={styles.scrollContent}>
              {hours.map((h) => {
                const disabled = isTimeDisabled(h, 0);
                return (
                  <TouchableOpacity
                    key={`hour-${h}`}
                    style={[
                      styles.pickerItem,
                      hour === h && styles.selectedPickerItem,
                      disabled && styles.disabledPickerItem
                    ]}
                    onPress={() => !disabled && onHourChange(h)}
                    disabled={disabled}
                  >
                    <Text 
                      style={[
                        styles.pickerItemText,
                        hour === h && styles.selectedPickerItemText,
                        disabled && styles.disabledPickerItemText
                      ]}
                    >
                      {h.toString().padStart(2, '0')}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>
        
        <Text style={styles.timeSeparator}>:</Text>
        
        <View style={styles.pickerColumn}>
          <Text style={styles.pickerLabel}>Minuto</Text>
          <ScrollView 
            style={styles.picker} 
            showsVerticalScrollIndicator={true}
            persistentScrollbar={true}
            nestedScrollEnabled={true}
          >
            <View style={styles.scrollContent}>
              {minutes.map((m) => {
                const disabled = isTimeDisabled(hour, m);
                return (
                  <TouchableOpacity
                    key={`minute-${m}`}
                    style={[
                      styles.pickerItem,
                      minute === m && styles.selectedPickerItem,
                      disabled && styles.disabledPickerItem
                    ]}
                    onPress={() => !disabled && onMinuteChange(m)}
                    disabled={disabled}
                  >
                    <Text 
                      style={[
                        styles.pickerItemText,
                        minute === m && styles.selectedPickerItemText,
                        disabled && styles.disabledPickerItemText
                      ]}
                    >
                      {m.toString().padStart(2, '0')}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#e1e1e1',
    marginBottom: 8,
  },
  timePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 10,
  },
  pickerColumn: {
    width: 80,
  },
  pickerLabel: {
    fontSize: 14,
    color: '#e1e1e1',
    textAlign: 'center',
    marginBottom: 8,
  },
  picker: {
    height: 120,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 5,
  },
  scrollContent: {
    paddingVertical: 4,
  },
  pickerItem: {
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedPickerItem: {
    backgroundColor: 'rgba(74, 144, 226, 0.3)',
    borderRadius: 5,
  },
  pickerItemText: {
    fontSize: 18,
    color: '#e1e1e1',
  },
  selectedPickerItemText: {
    color: '#4a90e2',
    fontWeight: 'bold',
  },
  timeSeparator: {
    fontSize: 20,
    color: '#e1e1e1',
    paddingHorizontal: 10,
    fontWeight: 'bold',
    marginTop: 20,
  },
  disabledPickerItem: {
    opacity: 0.3,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  disabledPickerItemText: {
    color: '#999999',
  },
});

export default TimeSelector;
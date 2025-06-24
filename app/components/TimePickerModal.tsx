import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../constants/colors';

interface TimePickerModalProps {
  visible: boolean;
  horas: string[];
  horaTemp: string;
  setHoraTemp: (hora: string) => void;
  onCancel: () => void;
  onConfirm: (hora: string) => void;
  title: string;
}

const TimePickerModal: React.FC<TimePickerModalProps> = ({
  visible,
  horas,
  horaTemp,
  setHoraTemp,
  onCancel,
  onConfirm,
  title
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.pickerContainer}>
            <View style={styles.column}>
              <Text style={styles.columnTitle}>Hora</Text>
              <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={true}>
                {horas.map(hora => (
                  <TouchableOpacity
                    key={`hora-${hora}`}
                    style={[
                      styles.option,
                      horaTemp === hora && styles.selectedOption
                    ]}
                    onPress={() => {
                      setHoraTemp(hora);
                      onConfirm(hora); // Passa a hora diretamente para a função onConfirm
                    }}
                  >
                    <Text style={[
                      styles.optionText,
                      horaTemp === hora && styles.selectedOptionText
                    ]}>
                      {hora}:00
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '80%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontFamily: 'Roboto_Condensed-SemiBold',
    fontSize: 18,
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  pickerContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  column: {
    width: '80%',
  },
  columnTitle: {
    textAlign: 'center',
    fontFamily: 'Roboto_Condensed-SemiBold',
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  scrollView: {
    height: 200,
  },
  option: {
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedOption: {
    backgroundColor: Colors.blue_btn + '20',
  },
  optionText: {
    fontFamily: 'Roboto_Condensed-Regular',
    fontSize: 16,
    color: '#333',
  },
  selectedOptionText: {
    fontFamily: 'Roboto_Condensed-SemiBold',
    color: Colors.blue_btn,
  },
});

export default TimePickerModal;

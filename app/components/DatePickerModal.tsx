import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

interface MonthOption {
  valor: string;
  texto: string;
}

interface DatePickerModalProps {
  visible: boolean;
  dias: string[];
  meses: MonthOption[];
  anos: string[];
  diaTemp: string;
  mesTemp: string;
  anoTemp: string;
  setDiaTemp: (dia: string) => void;
  setMesTemp: (mes: string) => void;
  setAnoTemp: (ano: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
  title?: string;
}

const DatePickerModal: React.FC<DatePickerModalProps> = ({
  visible,
  dias,
  meses,
  anos,
  diaTemp,
  mesTemp,
  anoTemp,
  setDiaTemp,
  setMesTemp,
  setAnoTemp,
  onCancel,
  onConfirm,
  title = 'Selecione a Data',
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{title}</Text>
          <View style={styles.dateSelectors}>
            <View style={styles.selectorContainer}>
              <Text style={styles.selectorLabel}>Dia</Text>
              <ScrollView style={styles.selector} showsVerticalScrollIndicator={false}>
                {dias.map((dia) => (
                  <TouchableOpacity
                    key={dia}
                    style={[
                      styles.dateOption,
                      dia === diaTemp && styles.dateOptionSelected
                    ]}
                    onPress={() => setDiaTemp(dia)}
                  >
                    <Text style={[
                      styles.dateOptionText,
                      dia === diaTemp && styles.dateOptionTextSelected
                    ]}>
                      {dia}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <View style={styles.selectorContainer}>
              <Text style={styles.selectorLabel}>Mês</Text>
              <ScrollView style={styles.selector} showsVerticalScrollIndicator={false}>
                {meses.map((mes) => (
                  <TouchableOpacity
                    key={mes.valor}
                    style={[
                      styles.dateOption,
                      mes.valor === mesTemp && styles.dateOptionSelected
                    ]}
                    onPress={() => setMesTemp(mes.valor)}
                  >
                    <Text style={[
                      styles.dateOptionText,
                      mes.valor === mesTemp && styles.dateOptionTextSelected
                    ]}>
                      {mes.texto}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <View style={styles.selectorContainer}>
              <Text style={styles.selectorLabel}>Ano</Text>
              <ScrollView style={styles.selector} showsVerticalScrollIndicator={false}>
                {anos.map((ano) => (
                  <TouchableOpacity
                    key={ano}
                    style={[
                      styles.dateOption,
                      ano === anoTemp && styles.dateOptionSelected
                    ]}
                    onPress={() => setAnoTemp(ano)}
                  >
                    <Text style={[
                      styles.dateOptionText,
                      ano === anoTemp && styles.dateOptionTextSelected
                    ]}>
                      {ano}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalCancelButton]}
              onPress={onCancel}
            >
              <Text style={styles.modalCancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalConfirmButton]}
              onPress={onConfirm}
            >
              <Text style={styles.modalConfirmButtonText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontFamily: "Roboto_Condensed-SemiBold",
    fontSize: 18,
    marginBottom: 15,
    textAlign: 'center',
  },
  dateSelectors: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  selectorContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  selectorLabel: {
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 8,
  },
  selector: {
    height: 200,
  },
  dateOption: {
    padding: 10,
    alignItems: 'center',
    borderRadius: 5,
  },
  dateOptionSelected: {
    backgroundColor: '#4a90e2',
  },
  dateOptionText: {
    fontFamily: "Roboto_Condensed-Regular",
    fontSize: 12,
  },
  dateOptionTextSelected: {
    fontFamily: "Roboto_Condensed-SemiBold",
    color: 'white',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  modalCancelButton: {
    backgroundColor: '#f0f0f0',
  },
  modalConfirmButton: {
    backgroundColor: '#4a90e2',
  },
  modalCancelButtonText: {
    fontFamily: "Roboto_Condensed-Regular",
    color: '#333',
  },
  modalConfirmButtonText: {
    color: 'white',
    fontFamily: "Roboto_Condensed-SemiBold",
  },
});

export default DatePickerModal;

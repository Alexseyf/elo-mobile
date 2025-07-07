import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import TimeSelector from './TimeSelector';
import Colors from '../../constants/colors';
import  SleepPeriod  from '../../types/diario';

interface SonoProps {
  value: SleepPeriod[];
  onChange: (value: SleepPeriod[]) => void;
}

const Sono: React.FC<SonoProps> = ({ value, onChange }) => {
  
  const generateId = () => {
    return Date.now().toString();
  };

  const formatTimeString = (hour: number, minute: number): string => {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  const calculateTotalTimeString = (sleepHour: number, sleepMinute: number, wakeHour: number, wakeMinute: number): string => {
    if (sleepHour === wakeHour && sleepMinute === wakeMinute) {
      return '00:00';
    }
    
    let sleepMinutes = sleepHour * 60 + sleepMinute;
    let wakeMinutes = wakeHour * 60 + wakeMinute;
    
    if (wakeMinutes < sleepMinutes) {
      wakeMinutes += 24 * 60;
    }
    const diffMinutes = wakeMinutes - sleepMinutes;
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const addSleepPeriod = () => {
    const now = new Date();
    const hour = now.getHours();
    const defaultHour = (hour >= 7 && hour <= 19) ? hour : 12;
    
    let wakeHour = defaultHour;
    let wakeMinute = 15;
    
    if (wakeMinute >= 60) {
      wakeHour = (wakeHour + 1) % 24;
      wakeMinute = 0;
    }
    
    const newPeriod: SleepPeriod = {
      id: generateId(),
      sleepHour: defaultHour,
      sleepMinute: 0,
      wakeHour: wakeHour,
      wakeMinute: wakeMinute,
      saved: false,
      horaDormiu: formatTimeString(defaultHour, 0),
      horaAcordou: formatTimeString(wakeHour, wakeMinute),
      tempoTotal: ''
    };
    onChange([...value, newPeriod]);
  };

  const removeSleepPeriod = (id: string) => {
    onChange(value.filter(period => period.id !== id));
  };

  const updateSleepPeriod = (id: string, field: keyof SleepPeriod, newValue: number) => {
    onChange(
      value.map(period => {
        if (period.id === id) {
          const updatedPeriod = {
            ...period,
            [field]: newValue
          };
          
          if (field === 'sleepHour' || field === 'sleepMinute') {
            const sleepHour = field === 'sleepHour' ? newValue : period.sleepHour;
            const sleepMinute = field === 'sleepMinute' ? newValue : period.sleepMinute;

            updatedPeriod.horaDormiu = formatTimeString(sleepHour, sleepMinute);

            const isWakeTimeBeforeSleep = 
              updatedPeriod.wakeHour < sleepHour || 
              (updatedPeriod.wakeHour === sleepHour && updatedPeriod.wakeMinute <= sleepMinute);

            if (isWakeTimeBeforeSleep) {
              updatedPeriod.wakeHour = sleepHour;
              updatedPeriod.wakeMinute = sleepMinute + 15;

              if (updatedPeriod.wakeMinute >= 60) {
                updatedPeriod.wakeHour = (updatedPeriod.wakeHour + 1) % 24;
                updatedPeriod.wakeMinute = updatedPeriod.wakeMinute - 60;
              }

              updatedPeriod.horaAcordou = formatTimeString(
                updatedPeriod.wakeHour,
                updatedPeriod.wakeMinute
              );
            }
          } 
          else if (field === 'wakeHour' || field === 'wakeMinute') {
            const wakeHour = field === 'wakeHour' ? newValue : period.wakeHour;
            const wakeMinute = field === 'wakeMinute' ? newValue : period.wakeMinute;
            
            updatedPeriod.horaAcordou = formatTimeString(wakeHour, wakeMinute);
          }
   
          return updatedPeriod;
        }
        return period;
      })
    );
  };

  const saveSleepPeriod = (id: string) => {
    onChange(
      value.map(period => {
        if (period.id === id) {
          const tempoTotal = calculateTotalTimeString(
            period.sleepHour,
            period.sleepMinute,
            period.wakeHour,
            period.wakeMinute
          );
          
          return {
            ...period,
            saved: true,
            tempoTotal: tempoTotal
          };
        }
        return period;
      })
    );
  };

  const editSleepPeriod = (id: string) => {
    onChange(
      value.map(period => {
        if (period.id === id) {
          return {
            ...period,
            saved: false
          };
        }
        return period;
      })
    );
  };

  const isTimesEqual = (period: SleepPeriod): boolean => {
    return period.sleepHour === period.wakeHour && 
           period.sleepMinute === period.wakeMinute;
  };

  const [modalVisible, setModalVisible] = useState(false);
  const [newSleepHour, setNewSleepHour] = useState(7);
  const [newSleepMinute, setNewSleepMinute] = useState(0);
  const [newWakeHour, setNewWakeHour] = useState(7);
  const [newWakeMinute, setNewWakeMinute] = useState(15);

  const openAddModal = () => {
    setNewSleepHour(7);
    setNewSleepMinute(0);
    setNewWakeHour(7);
    setNewWakeMinute(15);
    setModalVisible(true);
  };

  const closeAddModal = () => {
    setModalVisible(false);
  };

  const handleAddPeriod = () => {
    const newPeriod: SleepPeriod = {
      id: generateId(),
      sleepHour: newSleepHour,
      sleepMinute: newSleepMinute,
      wakeHour: newWakeHour,
      wakeMinute: newWakeMinute,
      saved: true,
      horaDormiu: formatTimeString(newSleepHour, newSleepMinute),
      horaAcordou: formatTimeString(newWakeHour, newWakeMinute),
      tempoTotal: calculateTotalTimeString(newSleepHour, newSleepMinute, newWakeHour, newWakeMinute)
    };
    onChange([...value, newPeriod]);
    setModalVisible(false);
  };

  return (
    <ScrollView style={styles.container} nestedScrollEnabled={true}>
      {value.length === 0 && (
        <Text style={styles.noPeriodsText}>
          Nenhum período de sono registrado. Clique no botão abaixo para adicionar.
        </Text>
      )}

      {value.map((period, index) => (
        <View key={period.id} style={styles.sleepPeriodCard}>
          {period.saved && (
            <View style={styles.periodHeader}>
              <Text style={styles.periodTitle}>Período {index + 1}</Text>
              
              <View style={styles.headerButtons}>
                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={() => editSleepPeriod(period.id)}
                >
                  <MaterialIcons name="edit" size={22} color={Colors.yellow_btn} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={() => removeSleepPeriod(period.id)}
                >
                  <MaterialIcons name="delete" size={24} color={Colors.red_btn} />
                </TouchableOpacity>
              </View>
            </View>
          )}
          
          {!period.saved ? (
            <>
              <View style={styles.periodHeaderEditing}>
                <Text style={styles.periodTitle}>
                  {index === value.length - 1 && !period.saved ? 'Novo período' : `Período ${index + 1}`}
                </Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => removeSleepPeriod(period.id)}
                >
                  <MaterialIcons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              
              {isTimesEqual(period) && (
                <Text style={styles.warningText}>
                  O horário de acordar deve ser diferente do horário que dormiu.
                </Text>
              )}

              <TouchableOpacity 
                style={[
                  styles.saveFullWidthButton,
                  isTimesEqual(period) && styles.disabledButton
                ]}
                onPress={() => saveSleepPeriod(period.id)}
                disabled={isTimesEqual(period)}
              >
                <MaterialIcons name="check-circle" size={24} color="#FFF" />
                <Text style={styles.saveButtonText}>Salvar Período</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.compactView}>
              <View style={styles.timeRow}>
                <Text style={styles.timeLabel}>Dormiu às:</Text>
                <Text style={styles.timeValue}>{period.horaDormiu}</Text>
              </View>
              
              <View style={styles.timeRow}>
                <Text style={styles.timeLabel}>Acordou às:</Text>
                <Text style={styles.timeValue}>{period.horaAcordou}</Text>
              </View>
            </View>
          )}

          {period.saved && (
            <View style={styles.durationContainer}>
              <Text style={styles.durationLabel}>Duração do sono:</Text>
              <Text style={styles.durationValue}>
                {formatDuration(period.tempoTotal)}
              </Text>
            </View>
          )}
        </View>
      ))}

      <TouchableOpacity 
        style={styles.addButton}
        onPress={openAddModal}
      >
        <MaterialIcons name="add" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Adicionar período de sono</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeAddModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Novo período de sono</Text>
            <TimeSelector
              label="Dormiu às:"
              hour={newSleepHour}
              minute={newSleepMinute}
              onHourChange={setNewSleepHour}
              onMinuteChange={setNewSleepMinute}
              theme="light"
            />
            <TimeSelector
              label="Acordou às:"
              hour={newWakeHour}
              minute={newWakeMinute}
              onHourChange={setNewWakeHour}
              onMinuteChange={setNewWakeMinute}
              minHour={newSleepHour}
              minMinute={newSleepMinute}
              theme="light"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={closeAddModal} style={[styles.modalButton, styles.modalCancelButton]}>
                <Text style={styles.modalCancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAddPeriod} style={[styles.modalButton, styles.modalConfirmButton]}>
                <Text style={styles.modalConfirmButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const formatDuration = (timeString: string): string => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return `${hours}h ${minutes.toString().padStart(2, '0')}min`;
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    flex: 1,
  },
  description: {
    fontFamily: "Roboto_Condensed-Regular",
    fontSize: 18,
    color: '#e1e1e1',
    marginBottom: 20,
    textAlign: 'center',
  },
  noPeriodsText: {
    fontFamily: "Roboto_Condensed-Regular",
    textAlign: 'center',
    color: '#e1e1e1',
    fontSize: 16,
    marginBottom: 20,
  },
  sleepPeriodCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  periodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },  periodTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'Roboto_Condensed-SemiBold',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  removeButton: {
    padding: 5,
  },
  saveButton: {
    padding: 5,
    marginRight: 10,
  },
  editButton: {
    padding: 5,
    marginRight: 10,
  },
  compactView: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },  timeLabel: {
    fontSize: 16,
    color: '#e1e1e1',
    fontFamily: 'Roboto_Condensed-Regular',
  },  timeValue: {
    fontSize: 16,
    color: '#e1e1e1',
    fontWeight: 'bold',
    fontFamily: 'Roboto_Condensed-SemiBold',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },  durationLabel: {
    fontSize: 16,
    color: '#e1e1e1',
    fontFamily: 'Roboto_Condensed-Regular',
  },  durationValue: {
    fontSize: 16,
    color: '#e1e1e1',
    fontWeight: 'bold',
    fontFamily: 'Roboto_Condensed-SemiBold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4a90e2',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 20,
  },  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: 'Roboto_Condensed-SemiBold',
  },
  saveFullWidthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: 'Roboto_Condensed-SemiBold',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
    opacity: 0.7,
  },  warningText: {
    color: '#ffaa00',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
    fontFamily: 'Roboto_Condensed-Regular',
  },
  periodHeaderEditing: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  closeButton: {
    padding: 5,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.red_btn,
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 5,
  },  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: 'Roboto_Condensed-SemiBold',
  },
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
    color: '#222',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
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

export default Sono;
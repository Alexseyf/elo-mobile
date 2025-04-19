import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, SafeAreaView, Platform } from 'react-native';
import { Link } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import CafeDaManha from '../components/DiarioSteps/CafeDaManha';
import Almoco from '../components/DiarioSteps/Almoco';
import LancheDaTarde from '../components/DiarioSteps/LancheDaTarde';
import Leite from '../components/DiarioSteps/Leite';
import Evacuacao from '../components/DiarioSteps/Evacuacao';
import Disposicao from '../components/DiarioSteps/Disposicao';
import Sono from '../components/DiarioSteps/Sono';
import ItemsRequest from '../components/DiarioSteps/ItemsRequest';
import ObservacoesInput from '../components/DiarioSteps/ObservacoesInput';
import DiarioSummary from '../components/DiarioSteps/DiarioSummary';

interface SleepPeriod {
  id: string;
  sleepHour: number;
  sleepMinute: number;
  wakeHour: number;
  wakeMinute: number;
  saved: boolean;
  horaDormiu: string;
  horaAcordou: string; 
  tempoTotal: string; 
}

export default function DiarioPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [diarioData, setDiarioData] = useState({
    cafeDaManha: 'nao_atende',
    almoco: 'nao_atende',
    lancheDaTarde: 'nao_atende',
    leite: 'nao_atende',
    evacuacao: 'normal',
    disposicao: 'normal',
    sono: [] as SleepPeriod[],
    itensRequisitados: [] as string[],
    observacoes: ''
  });

  const steps = [
    { 
      title: 'Lanche da manhã',
      render: () => (
        <CafeDaManha 
          value={diarioData.cafeDaManha} 
          onChange={(value: string) => setDiarioData({...diarioData, cafeDaManha: value})} 
        />
      )
    },
    { 
      title: 'Almoço',
      render: () => (
        <Almoco 
          value={diarioData.almoco} 
          onChange={(value: string) => setDiarioData({...diarioData, almoco: value})} 
        />
      )
    },
    { 
      title: 'Lanche da tarde',
      render: () => (
        <LancheDaTarde 
          value={diarioData.lancheDaTarde} 
          onChange={(value: string) => setDiarioData({...diarioData, lancheDaTarde: value})} 
        />
      )
    },
    { 
      title: 'Leite',
      render: () => (
        <Leite 
          value={diarioData.leite} 
          onChange={(value: string) => setDiarioData({...diarioData, leite: value})} 
        />
      )
    },
    { 
      title: 'Evacuação',
      render: () => (
        <Evacuacao 
          value={diarioData.evacuacao} 
          onChange={(value: string) => setDiarioData({...diarioData, evacuacao: value})} 
        />
      )
    },
    { 
      title: 'Disposição',
      render: () => (
        <Disposicao 
          value={diarioData.disposicao} 
          onChange={(value: string) => setDiarioData({...diarioData, disposicao: value})} 
        />
      )
    },
    { 
      title: 'Sono',
      render: () => (
        <Sono 
          value={diarioData.sono} 
          onChange={(value: SleepPeriod[]) => setDiarioData({...diarioData, sono: value})} 
        />
      )
    },
    { 
      title: 'Itens a Solicitar',
      render: () => (
        <ItemsRequest 
          selectedItems={diarioData.itensRequisitados}
          onChange={(value: string[]) => setDiarioData({...diarioData, itensRequisitados: value})} 
        />
      )
    },
    { 
      title: 'Recados',
      render: () => (
        <ObservacoesInput 
          value={diarioData.observacoes} 
          onChange={(value: string) => setDiarioData({...diarioData, observacoes: value})} 
        />
      )
    },
    { 
      title: 'Resumo',
      render: () => (
        <DiarioSummary data={diarioData} />
      )
    },
  ];

  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      if (currentStep === 6) {
        const filteredSono = diarioData.sono.filter(period => period.saved);
        setDiarioData({...diarioData, sono: filteredSono});
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveDiario = () => {
    console.log('Saving diario data:', diarioData);
    // Alterar para salvamento no banco quando este for atualizado
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden />
      <Link href="../users/adminDash" style={styles.backButton}>
        <MaterialIcons name="close" size={24} color="#fff" />
      </Link>
      
      <View style={styles.formContainer}>
        <Text style={styles.title}>Diário do Aluno</Text>
        <Text style={styles.stepTitle}>{steps[currentStep].title}</Text>
        
        <View style={styles.componentContainer}>
          {steps[currentStep].render()}
        </View>
        
        <View style={styles.buttonContainer}>
          <View style={styles.buttonRow}>
            {currentStep > 0 && (
              <TouchableOpacity 
                style={[styles.navButton, styles.previousButton]} 
                onPress={goToPreviousStep}
              >
                <MaterialIcons name="arrow-back" size={24} color="#fff" />
                <Text style={styles.buttonText}>Anterior</Text>
              </TouchableOpacity>
            )}
            
            {currentStep < steps.length - 1 ? (
              <TouchableOpacity 
                style={[styles.navButton, styles.nextButton]} 
                onPress={goToNextStep}
              >
                <Text style={styles.buttonText}>Próximo</Text>
                <MaterialIcons name="arrow-forward" size={24} color="#fff" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={[styles.navButton, styles.saveButton]} 
                onPress={handleSaveDiario}
              >
                <Text style={styles.buttonText}>Salvar</Text>
                <MaterialIcons name="check" size={24} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2a4674',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1,
    padding: 10,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    backgroundColor: '#2a4674',
    marginTop: 60,
    marginHorizontal: 20,
    marginBottom: Platform.OS === 'ios' ? 30 : 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 22,
    color: '#e1e1e1',
    textAlign: 'center',
    marginBottom: 30,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    minWidth: 120,
  },
  previousButton: {
    backgroundColor: '#5c6bc0',
  },
  nextButton: {
    backgroundColor: '#4a90e2',
    marginLeft: 'auto',
  },
  saveButton: {
    backgroundColor: '#4caf50',
    marginLeft: 'auto',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 8,
  },
  componentContainer: {
    flex: 1,
    paddingBottom: 10,
  },
  buttonContainer: {
    paddingBottom: Platform.OS === 'ios' ? 50 : 40,
    backgroundColor: 'transparent',
  },
});
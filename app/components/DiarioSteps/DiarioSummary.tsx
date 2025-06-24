import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { diarioStyles } from '../../../styles/globalStyles';

interface SleepPeriod {
  id: string;
  horaDormiu: string; 
  horaAcordou: string; 
  tempoTotal: string; 
  saved?: boolean;
}

interface DiarioSummaryProps {
  data: {
    cafeDaManha: string;
    almoco: string;
    lancheDaTarde: string;
    leite: string;
    evacuacao: string;
    disposicao: string;
    sono: SleepPeriod[];
    itensRequisitados: string[];
    observacoes: string;
  }
}

const DiarioSummary: React.FC<DiarioSummaryProps> = ({ data }) => {
  const getOptionLabel = (value: string) => {
    const options = {
      'OTIMO': 'Ótimo',
      'BOM': 'Bom',
      'REGULAR': 'Regular',
      'NAO_ACEITOU': 'Não aceitou',
      'NAO_SE_APLICA': '',
      
    };
    return options[value as keyof typeof options] || 'Não avaliado';
  };

  const getEvacuacaoLabel = (value: string) => {
    const options = {
      'NORMAL': 'Normal',
      'LIQUIDA': 'Líquida',
      'DURA': 'Dura',
      'NAO_EVACUOU': 'Não evacuou',
    };
    return options[value as keyof typeof options] || 'Não avaliado';
  };

  const getDisposicaoLabel = (value: string) => {
    const options = {
      'NORMAL': 'Normal',
      'AGITADO': 'Agitado',
      'CALMO': 'Calmo',
      'SONOLENTO': 'Sonolento',
      'CANSADO': 'Cansado'
    };
    return options[value as keyof typeof options] || 'Não avaliado';
  };

  const getItemLabel = (id: string) => {
    const items = {
      'LENCO_UMEDECIDO': 'Lenço Umedecido',
      'LEITE': 'Leite',
      'CREME_DENTAL': 'Creme Dental',
      'ESCOVA_DE_DENTE': 'Escova de Dente',
      'FRALDA': 'Fralda',
      'POMADA': 'Pomada',
    };
    return items[id as keyof typeof items] || id;
  };

  const calculateTotalSleepTime = (): string => {
    const savedPeriods = data.sono.filter(period => period.saved && period.tempoTotal);
    if (savedPeriods.length === 0) return "";
    
    let totalMinutes = 0;
    
    savedPeriods.forEach(period => {
      if (period.tempoTotal) {
        const [hours, minutes] = period.tempoTotal.split(':').map(Number);
        totalMinutes += (isNaN(hours) ? 0 : hours * 60) + (isNaN(minutes) ? 0 : minutes);
      }
    });
    
    if (totalMinutes === 0) return "";
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const formatDuration = (timeString: string): string => {
    if (!timeString || timeString === "00:00" || timeString === "") {
      return "Sem registro";
    }
    const [hours, minutes] = timeString.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) {
      return "Sem registro";
    }
    return `${hours}h ${minutes.toString().padStart(2, '0')}min`;
  };

  const totalSleepTime = calculateTotalSleepTime();

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollContainer} 
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>Resumo do Diário</Text>

        <View style={styles.summarySection}>
          <View style={styles.summaryItem}>
            <Text style={styles.label}>Café da manhã:</Text>
            <Text style={styles.value}>{getOptionLabel(data.cafeDaManha)}</Text>
          </View>
          
          <View style={styles.summaryItem}>
            <Text style={styles.label}>Almoço:</Text>
            <Text style={styles.value}>{getOptionLabel(data.almoco)}</Text>
          </View>
          
          <View style={styles.summaryItem}>
            <Text style={styles.label}>Lanche da tarde:</Text>
            <Text style={styles.value}>{getOptionLabel(data.lancheDaTarde)}</Text>
          </View>
          
          <View style={styles.summaryItem}>
            <Text style={styles.label}>Leite:</Text>
            <Text style={styles.value}>{getOptionLabel(data.leite)}</Text>
          </View>
          
          <View style={styles.summaryItem}>
            <Text style={styles.label}>Evacuação:</Text>
            <Text style={styles.value}>{getEvacuacaoLabel(data.evacuacao)}</Text>
          </View>
          
          <View style={styles.summaryItem}>
            <Text style={styles.label}>Disposição:</Text>
            <Text style={styles.value}>{getDisposicaoLabel(data.disposicao)}</Text>
          </View>
        </View>
        
        {data.sono && data.sono.length > 0 && (
          <View style={styles.sleepSection}>
            <Text style={styles.sectionTitle}>Períodos de Sono</Text>
            
            {data.sono.map((period, index) => (
              <View key={index} style={styles.sleepItem}>
                <Text style={styles.sleepPeriodTitle}>
                  Período {index + 1}
                </Text>
                <View style={styles.sleepTimeRow}>
                  <Text style={styles.sleepLabel}>Dormiu às:</Text>
                  <Text style={styles.sleepValue}>{period.horaDormiu}</Text>
                </View>
                <View style={styles.sleepTimeRow}>
                  <Text style={styles.sleepLabel}>Acordou às:</Text>
                  <Text style={styles.sleepValue}>{period.horaAcordou}</Text>
                </View>
                <View style={styles.sleepTimeRow}>
                  <Text style={styles.sleepLabel}>Duração:</Text>
                  <Text style={styles.sleepValue}>{period.tempoTotal}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
        
        {data.itensRequisitados && data.itensRequisitados.length > 0 && (
          <View style={styles.requestedItemsSection}>
            <Text style={styles.sectionTitle}>Itens Solicitados:</Text>
            {data.itensRequisitados.map((item, index) => (
              <Text key={index} style={styles.requestedItem}>• {getItemLabel(item)}</Text>
            ))}
          </View>
        )}
        
        {data.observacoes && data.observacoes.trim().length > 0 && (
          <View style={diarioStyles.observacoesSection}>
            <Text style={styles.sectionTitle}>Recados:</Text>
            <Text style={styles.observacoesText}>{data.observacoes}</Text>
          </View>
        )}
        
        <Text style={styles.note}>
          Confirme as informações acima e pressione "Salvar" para registrar o diário.
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e1e1e1',
    flex: 1,
  },
  value: {
    fontSize: 16,
    color: '#e1e1e1',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'right',
  },
  note: {
    fontSize: 14,
    color: '#e1e1e1',
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
  summarySection: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  sleepSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    padding: 15,
    marginTop: 15,
    marginBottom: 15,
  },
  sleepItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  sleepPeriodTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e1e1e1',
    marginBottom: 8,
  },
  sleepTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  sleepLabel: {
    fontSize: 14,
    color: '#e1e1e1',
  },
  sleepValue: {
    fontSize: 14,
    color: '#e1e1e1',
    fontWeight: '600',
  },
  noDataText: {
    fontSize: 14,
    color: '#e1e1e1',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 10,
  },
  requestedItemsSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 15,
    marginTop: 10,
    marginBottom: 10,
  },
  requestedItem: {
    fontSize: 16,
    color: '#e1e1e1',
    marginBottom: 5,
    paddingLeft: 10,
  },
  observacoesText: {
    fontSize: 16,
    color: '#e1e1e1',
    lineHeight: 22,
  },
});

export default DiarioSummary;
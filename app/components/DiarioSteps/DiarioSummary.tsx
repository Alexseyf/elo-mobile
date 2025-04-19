import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

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
      'otimo': 'Ótimo',
      'bom': 'Bom',
      'regular': 'Regular',
      'nao_aceitou': 'Não aceitou',
      'nao_atende': 'Não atende',
      '': 'Não avaliado'
    };
    return options[value as keyof typeof options] || 'Não avaliado';
  };

  const getEvacuacaoLabel = (value: string) => {
    const options = {
      'normal': 'Normal',
      'liquida': 'Líquida',
      'dura': 'Dura',
      'nao_evacuou': 'Não evacuou',
      '': 'Não avaliado'
    };
    return options[value as keyof typeof options] || 'Não avaliado';
  };

  const getDisposicaoLabel = (value: string) => {
    const options = {
      'normal': 'Normal',
      'agitado': 'Agitado',
      'calmo': 'Calmo',
      'sonolento': 'Sonolento',
      'cansado': 'Cansado',
      '': 'Não avaliado'
    };
    return options[value as keyof typeof options] || 'Não avaliado';
  };

  const getItemLabel = (id: string) => {
    const items = {
      'lencos_umedecidos': 'LENÇOS UMEDECIDOS',
      'leite': 'LEITE',
      'creme_dental': 'CREME DENTAL',
      'escova_dente': 'ESCOVA DE DENTE',
      'fralda': 'FRALDA',
      'pomada': 'POMADA',
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
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.summaryItem}>
          <Text style={styles.label}>Lanche da manhã:</Text>
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

        {totalSleepTime && (
          <View style={styles.summaryItem}>
            <Text style={styles.label}>Tempo Total de Sono:</Text>
            <Text style={styles.value}>
              {formatDuration(totalSleepTime)}
            </Text>
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
          <View style={styles.observacoesSection}>
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
    color: '#4a90e2',
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
    color: '#4a90e2',
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
  observacoesSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 15,
    marginTop: 10,
    marginBottom: 10,
  },
  observacoesText: {
    fontSize: 16,
    color: '#e1e1e1',
    lineHeight: 22,
  },
});

export default DiarioSummary;
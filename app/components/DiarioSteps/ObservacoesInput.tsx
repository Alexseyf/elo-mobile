import { View, Text, StyleSheet, TextInput } from 'react-native';

interface ObservacoesInputProps {
  value: string;
  onChange: (value: string) => void;
}

const MAX_CHARS = 500;

const ObservacoesInput: React.FC<ObservacoesInputProps> = ({ value, onChange }) => {
  const remainingChars = MAX_CHARS - value.length;
  
  const handleTextChange = (text: string) => {
    if (text.length <= MAX_CHARS) {
      onChange(text);
    }
  };

  return (
    <View style={styles.container}>
      
      <TextInput
        style={styles.textInput}
        value={value}
        onChangeText={handleTextChange}
        placeholder="Digite aqui sua observação ou recado..."
        placeholderTextColor="#999"
        multiline={true}
        numberOfLines={6}
        textAlignVertical="top"
        maxLength={MAX_CHARS}
      />
      
      <Text style={[
        styles.charCount, 
        remainingChars < 50 ? styles.charCountWarning : null,
        remainingChars < 10 ? styles.charCountDanger : null
      ]}>
        {remainingChars} caracteres restantes
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2a4674',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#e1e1e1',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    color: '#ffffff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    height: 150,
  },
  charCount: {
    fontSize: 12,
    color: '#e1e1e1',
    textAlign: 'right',
    marginTop: 5,
  },
  charCountWarning: {
    color: '#ffaa00',
  },
  charCountDanger: {
    color: '#ff4d4d',
  }
});

export default ObservacoesInput;
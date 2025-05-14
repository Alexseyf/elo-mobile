import { View, Text, StyleSheet, TextInput, TouchableWithoutFeedback, TouchableOpacity, Keyboard } from 'react-native';
import { useState } from 'react';

interface ObservacoesInputProps {
  value: string;
  onChange: (value: string) => void;
}

const MAX_CHARS = 500;

const ObservacoesInput: React.FC<ObservacoesInputProps> = ({ value, onChange }) => {
  const [isFocused, setIsFocused] = useState(false);
  const remainingChars = MAX_CHARS - value.length;
  
  const handleTextChange = (text: string) => {
    if (text.length <= MAX_CHARS) {
      onChange(text);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleDismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        
        <View style={styles.inputContainer}>
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
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
          
          {isFocused && (
            <TouchableOpacity 
              style={styles.okButton}
              onPress={handleDismissKeyboard}
            >
              <Text style={styles.okButtonText}>OK</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <Text style={[
          styles.charCount, 
          remainingChars < 50 ? styles.charCountWarning : null,
          remainingChars < 10 ? styles.charCountDanger : null
        ]}>
          {remainingChars} caracteres restantes
        </Text>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2a4674',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
  },
  inputContainer: {
    position: 'relative',
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
  okButton: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    backgroundColor: '#4caf50',
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  okButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
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
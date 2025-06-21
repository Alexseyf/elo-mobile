import { StyleSheet, Platform } from 'react-native';
import Colors from '../app/constants/colors';

export const globalStyles = StyleSheet.create({
  // Estrutura principal das telas
  container: {
    flex: 1,
    backgroundColor: Colors.blue_btn,
  },
  
  // Estilos do cabeçalho
  header: {
    backgroundColor: Colors.blue_btn,
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: "Roboto_Condensed-SemiBold",
    fontSize: 22,
    color: "#fff",
  },
  headerSubtitle: {
    fontFamily: "Roboto_Condensed-Regular",
    fontSize: 16,
    color: "#fff",
    marginTop: 4,
    opacity: 0.8,
  },
  
  // Estilos de conteúdo e rolagem
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 60 : 40,
  },
  
  // Estilos para estados de carregamento
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontFamily: "Roboto_Condensed-Regular",
    fontSize: 16,
    color: '#fff',
  },
  
  // Estilos para conteúdos vazios
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontFamily: "Roboto_Condensed-Regular",
    fontSize: 18,
    color: '#fff',
    marginTop: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  
  // Estilos de cards
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  cardEmoji: {
    fontSize: 28,
    marginRight: 16,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: "Roboto_Condensed-SemiBold",
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  cardDescription: {
    fontFamily: "Roboto_Condensed-Regular",
    fontSize: 14,
    color: "#666",
  },
    cardsContainer: {
    marginTop: 10,
  },
    turmaCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
    alunoCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  
  // Estilos para formulários
  formContainer: {
    flex: 1,
    justifyContent: "flex-start",
    paddingHorizontal: 20,
    backgroundColor: Colors.blue_btn,
    marginTop: 10,
    marginHorizontal: 20,
    marginBottom: 20,
  },
    userFormContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
    userFormLabel: {
    fontFamily: "Roboto_Condensed-SemiBold",
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    marginTop: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    height: 50,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontFamily: "Roboto_Condensed-ExtraLight",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e1e1e1",
  },
  label: {
    fontSize: 18,
    color: "#fff",
    marginBottom: 8,
    fontWeight: "500",
  },
  formLabelLight: {
    fontFamily: "Roboto_Condensed-SemiBold",
    fontSize: 16,
    color: "#fff",
    marginBottom: 8,
    marginTop: 16,
  },
    profileSelection: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 10,
    },
    profileOption: {
      flex: 1,
      backgroundColor: "#f0f0f0",
      padding: 8,
      borderRadius: 8,
      marginHorizontal: 4,
      alignItems: 'center',
    },
    profileOptionActive: {
      backgroundColor: Colors.blue_btn,
    },
    profileOptionText: {
      fontFamily: "Roboto_Condensed-Regular",
      fontSize: 16,
      color: "#333",
    },
    profileOptionTextActive: {
      color: "#fff",
      // fontWeight: "600",
    },
  
  // Estilos para botões
  button: {
    backgroundColor: "#4a90e2",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontFamily: "Roboto_Condensed-SemiBold",
    fontSize: 14,
  },
  backButton: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingVertical: 14,
    marginHorizontal: 15,
    marginTop: 10,
    marginBottom: Platform.OS === 'ios' ? 30 : 50,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  backButtonText: {
    fontFamily: "Roboto_Condensed-SemiBold",
    fontSize: 16,
    fontWeight: "600",
    color: Colors.blue_btn,
  },
  logoutButton: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingVertical: 14,
    marginHorizontal: 16,
    marginBottom: Platform.OS === 'ios' ? 30 : 50,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  logoutButtonText: {
    fontFamily: "Roboto_Condensed-SemiBold",
    fontSize: 16,
    fontWeight: "600",
    color: "#f05454",
  },
  submitButton: {
      backgroundColor: Colors.blue_btn,
      marginTop: 30,
      padding: 15,
      borderRadius: 8,
      alignItems: "center",
    },
    submitButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "600",
    },
    
    // Botão branco para uso em fundos azuis
    submitButtonAlt: {
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      marginTop: 30,
      padding: 15,
      borderRadius: 8,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    submitButtonAltText: {
      fontFamily: "Roboto_Condensed-SemiBold",
      fontSize: 16,
      fontWeight: "600",
      color: Colors.blue_btn,
    },

  // Estilos para títulos e textos
  title: {
    fontFamily: "Roboto_Condensed-SemiBold,",
    fontSize: 26,
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: "Roboto_Condensed-Regular",
    fontSize: 16,
    color: "#e1e1e1",
    textAlign: "center",
    marginBottom: 30,
    marginTop: 10,
  },
  
  // Estilos para diários
  diarioContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.blue_btn,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
    paddingBottom: 5,
  },
  
  // Estilos para seletores de opções
  optionContainer: {
    marginVertical: 10,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedOption: {
    backgroundColor: 'rgba(74, 144, 226, 0.3)',
    borderWidth: 1,    borderColor: '#4a90e2',
  },
  optionText: {
    fontSize: 16,
    color: '#e1e1e1',
    marginLeft: 10,
    fontFamily: "Roboto_Condensed-Regular",
  },
  selectedOptionText: {
    color: '#ffffff',
    fontWeight: '600',
    fontFamily: "Roboto_Condensed-SemiBold",
  },
  
  // Estilos para modais
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 5,
  },  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
});

// Estilos específicos para componentes de diário
export const diarioStyles = StyleSheet.create({
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
  radioContainer: {
    height: 24,
    width: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e1e1e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radio: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: 'transparent',
  },
  radioSelected: {
    backgroundColor: '#4a90e2',
  },
  sleepPeriodCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  periodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  timeLabel: {
    fontFamily: 'Roboto_Condensed-Regular',
    fontSize: 16,
    color: '#e1e1e1',
  },  timeValue: {
    fontSize: 16,
    color: '#4a90e2',
    fontWeight: 'bold',
    fontFamily: 'Roboto_Condensed-SemiBold',
  },
  observacoesSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 15,
    marginTop: 10,
    marginBottom: 10,
  },
});

export default globalStyles;
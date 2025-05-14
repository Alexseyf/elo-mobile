import { Text, View, StyleSheet, StatusBar, TouchableOpacity, Platform, ScrollView, ActivityIndicator, RefreshControl, Modal } from "react-native";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import Toast from 'react-native-toast-message';
import Colors from "./constants/colors";
import config from '../config';
import { formatarNomeTurma } from "./utils/formatText";
import globalStyles from '../styles/globalStyles';

interface Professor {
  id: number;
  nome?: string;
  usuarioId?: number;
  turmaId?: number;
  usuario?: {
    id: number;
    nome: string;
    email?: string;
  };
}

interface Turma {
  id: number;
  nome: string;
  professores: Professor[];
  alunos: any[];
}

export default function Turmas() {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTurma, setSelectedTurma] = useState<Turma | null>(null);
  const [selectedProfessorId, setSelectedProfessorId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [professorToDelete, setProfessorToDelete] = useState<any>(null);
  
  const handleVoltar = () => {
    router.back();
  };

  const fetchTurmas = async () => {
    try {
      setIsLoading(true);
      
      const url = config.API_URL.endsWith('/')
        ? `${config.API_URL}turmas`
        : `${config.API_URL}/turmas`;
      
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        setTurmas(data);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Erro ao buscar turmas',
          text2: 'Verifique sua conexão com o servidor',
          visibilityTime: 3000
        });
      }
    } catch (error) {
      console.error('Erro ao buscar turmas:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro de conexão',
        text2: 'Não foi possível conectar ao servidor',
        visibilityTime: 3000
      });
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const fetchProfessores = async () => {
    try {
      const url = config.API_URL.endsWith('/')
        ? `${config.API_URL}professores/professor-turma`
        : `${config.API_URL}/professores/professor-turma`;
      
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        setProfessores(data);
        return true;
      } else {
        console.error('Erro ao buscar professores');
        return false;
      }
    } catch (error) {
      console.error('Erro ao buscar professores:', error);
      return false;
    }
  };

  const handleOpenModal = async (turma: Turma) => {
    setSelectedTurma(turma);
    setSelectedProfessorId(null);
    setConfirmDelete(false);
    setProfessorToDelete(null);
    
    if (!turma.professores || turma.professores.length === 0) {
      if (professores.length === 0) {
        const success = await fetchProfessores();
        if (!success) {
          Toast.show({
            type: 'error',
            text1: 'Erro ao carregar professores',
            text2: 'Não foi possível obter a lista de professores',
            visibilityTime: 3000
          });
          return;
        }
      }
    }
    
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedProfessorId(null);
    setSelectedTurma(null);
    setConfirmDelete(false);
    setProfessorToDelete(null);
  };

  const vincularProfessorTurma = async () => {
    if (!selectedTurma || selectedProfessorId === null) {
      Toast.show({
        type: 'error',
        text1: 'Dados incompletos',
        text2: 'Selecione um professor para vincular à turma',
        visibilityTime: 3000
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const url = config.API_URL.endsWith('/')
        ? `${config.API_URL}turmas/${selectedProfessorId}/professor`
        : `${config.API_URL}/turmas/${selectedProfessorId}/professor`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          turmaId: selectedTurma.id
        })
      });
      
      if (response.ok) {
        Toast.show({
          type: 'success',
          text1: 'Sucesso!',
          text2: 'Professor vinculado à turma com sucesso',
          visibilityTime: 3000
        });
        
        handleCloseModal();
        fetchTurmas();
      } else {
        const errorText = await response.text();
        let errorMessage = 'Não foi possível vincular o professor à turma';
        
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.erro) {
            errorMessage = errorData.erro;
          }
        } catch (parseError) {
          console.error('Erro ao fazer parse da resposta:', errorText);
        }
        
        Toast.show({
          type: 'error',
          text1: 'Erro',
          text2: errorMessage,
          visibilityTime: 3000
        });
      }
    } catch (error) {
      console.error('Erro ao vincular professor à turma:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro de conexão',
        text2: 'Não foi possível conectar ao servidor',
        visibilityTime: 3000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProfessor = (professor: any) => {
    setProfessorToDelete(professor);
    setConfirmDelete(true);
  };

  const cancelDelete = () => {
    setProfessorToDelete(null);
    setConfirmDelete(false);
  };

  const confirmarRemocaoProfessor = async () => {
    if (!professorToDelete || !selectedTurma) return;
    
    try {
      setIsSubmitting(true);
      
      const professorId = professorToDelete.usuario?.id;
      const turmaId = selectedTurma.id;
      
      if (!professorId || !turmaId) {
        Toast.show({
          type: 'error',
          text1: 'Erro',
          text2: 'Dados incompletos para remover o professor',
          visibilityTime: 3000
        });
        setIsSubmitting(false);
        return;
      }
      
      const url = config.API_URL.endsWith('/')
        ? `${config.API_URL}professores/${professorId}/turma/${turmaId}`
        : `${config.API_URL}/professores/${professorId}/turma/${turmaId}`;
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        Toast.show({
          type: 'success',
          text1: 'Sucesso!',
          text2: 'Professor removido da turma com sucesso',
          visibilityTime: 3000
        });
        
        handleCloseModal();
        fetchTurmas();
      } else {
        const errorText = await response.text();
        let errorMessage = 'Não foi possível remover o professor da turma';
        
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.erro) {
            errorMessage = errorData.erro;
          }
        } catch (parseError) {
          console.error('Erro ao fazer parse da resposta:', errorText);
        }
        
        Toast.show({
          type: 'error',
          text1: 'Erro',
          text2: errorMessage,
          visibilityTime: 3000
        });
      }
    } catch (error) {
      console.error('Erro ao remover professor da turma:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro de conexão',
        text2: 'Não foi possível conectar ao servidor',
        visibilityTime: 3000
      });
    } finally {
      setIsSubmitting(false);
      setConfirmDelete(false);
      setProfessorToDelete(null);
    }
  };
  
  useEffect(() => {
    fetchTurmas();
    fetchProfessores();
  }, []);
  
  const onRefresh = () => {
    setRefreshing(true);
    fetchTurmas();
  };
  
  return (
    <View style={globalStyles.container}>
      <StatusBar backgroundColor={Colors.blue_btn} barStyle="light-content" />
      
      <View style={globalStyles.header}>
        <Text style={globalStyles.headerTitle}>Lista de Turmas</Text>
      </View>
      
      {isLoading ? (
        <View style={globalStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={globalStyles.loadingText}>Carregando turmas...</Text>
        </View>
      ) : (
        <ScrollView 
          style={globalStyles.scrollContent} 
          contentContainerStyle={globalStyles.scrollContentContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {turmas.length === 0 ? (
            <View style={globalStyles.emptyContainer}>
              <MaterialIcons name="school" size={60} color="#fff" />
              <Text style={globalStyles.emptyText}>Nenhuma turma encontrada</Text>
            </View>
          ) : (
            <View style={styles.turmasList}>
              {turmas.map((turma) => (
                <View key={turma.id} style={styles.turmaCard}>
                  <View style={styles.turmaNomeContainer}>
                    <MaterialIcons name="class" size={28} color={Colors.blue_btn} style={styles.turmaIcon} />
                    <Text style={styles.turmaNome}>{formatarNomeTurma(turma.nome)}</Text>
                    {turma.professores && turma.professores.length > 0 && (
                      <TouchableOpacity 
                        style={styles.editButton} 
                        onPress={() => handleOpenModal(turma)}
                      >
                        <MaterialIcons name="edit" size={24} color={Colors.blue_btn} />
                      </TouchableOpacity>
                    )}
                  </View>
                  
                  <View style={styles.professorContainer}>
                    <Text style={styles.professorTitle}>
                      {turma.professores && turma.professores.length > 0 
                        ? 'Professor' + (turma.professores.length > 1 ? 'es' : '') + ':'
                        : 'Sem professor designado'
                      }
                    </Text>
                    
                    {turma.professores && turma.professores.length > 0 ? (
                      <View style={styles.professoresList}>
                        {turma.professores.map((professor) => (
                          <View key={professor.id || 'prof-' + Math.random()} style={styles.professorItem}>
                            <MaterialIcons name="person" size={16} color="#666" />
                            <Text style={styles.professorNome}>
                              {professor.usuario?.nome || 'Professor'}
                            </Text>
                          </View>
                        ))}
                      </View>
                    ) : (
                      <View style={styles.addProfessorContainer}>
                        <TouchableOpacity 
                          style={styles.addProfessorButton}
                          onPress={() => handleOpenModal(turma)}
                        >
                          <MaterialIcons name="add" size={16} color="#fff" />
                          <Text style={styles.addProfessorText}>Vincular Professor</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.countContainer}>
                    <View style={styles.countItem}>
                      <MaterialIcons name="people" size={18} color="#666" />
                      <Text style={styles.countText}>
                        {turma.alunos.length} {turma.alunos.length === 1 ? 'aluno' : 'alunos'}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}
      
      <TouchableOpacity style={globalStyles.backButton} onPress={handleVoltar}>
        <Text style={globalStyles.backButtonText}>Voltar</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <View style={globalStyles.modalContainer}>
          <View style={globalStyles.modalContent}>
            <View style={globalStyles.modalHeader}>
              <Text style={globalStyles.modalTitle}>
                {selectedTurma?.professores && selectedTurma.professores.length > 0 
                  ? `Remover Professor de ${selectedTurma ? formatarNomeTurma(selectedTurma.nome) : ''}`
                  : selectedTurma ? `Vincular Professor à ${formatarNomeTurma(selectedTurma.nome)}` : 'Vincular Professor'}
              </Text>
              <TouchableOpacity onPress={handleCloseModal}>
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {confirmDelete ? (
              <View style={styles.confirmDeleteContainer}>
                <Text style={styles.confirmDeleteText}>
                  Tem certeza que deseja remover o professor {professorToDelete?.usuario?.nome} da turma {selectedTurma?.nome}?
                </Text>
                <View style={styles.confirmDeleteButtons}>
                  <TouchableOpacity 
                    style={styles.confirmDeleteCancelButton} 
                    onPress={cancelDelete}
                  >
                    <Text style={styles.confirmDeleteCancelText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.confirmDeleteConfirmButton} 
                    onPress={confirmarRemocaoProfessor}
                  >
                    <Text style={styles.confirmDeleteConfirmText}>Confirmar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <>
                {selectedTurma?.professores && selectedTurma.professores.length > 0 ? (
                  <>
                    <Text style={styles.professorVinculadoText}>Professor vinculado à turma:</Text>
                    {selectedTurma.professores.map((professor) => (
                      <View key={professor.id} style={styles.professorDetailItem}>
                        <View style={styles.professorSelectAvatar}>
                          <Text style={styles.professorSelectAvatarText}>
                            {professor.usuario?.nome?.charAt(0).toUpperCase() || professor.nome?.charAt(0).toUpperCase() || "P"}
                          </Text>
                        </View>
                        <Text style={styles.professorDetailName}>
                          {professor.usuario?.nome || professor.nome || "Professor"}
                        </Text>
                        <TouchableOpacity
                          style={styles.removeButton}
                          onPress={() => handleDeleteProfessor(professor)}
                        >
                          <MaterialIcons name="delete" size={22} color="red" />
                          <Text style={styles.removeButtonText}>Remover</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </>
                ) : professores.length === 0 ? (
                  <View style={styles.modalEmptyContainer}>
                    <MaterialIcons name="person-search" size={40} color="#666" />
                    <Text style={styles.modalEmptyText}>Nenhum professor disponível</Text>
                  </View>
                ) : (
                  <ScrollView style={styles.professorSelectList}>
                    {professores.map((professor) => (
                      <TouchableOpacity
                        key={professor.id}
                        style={[
                          styles.professorSelectItem,
                          selectedProfessorId === professor.id && styles.professorSelectItemActive
                        ]}
                        onPress={() => setSelectedProfessorId(professor.id)}
                      >
                        <View style={styles.professorSelectAvatar}>
                          <Text style={styles.professorSelectAvatarText}>
                            {professor.usuario?.nome?.charAt(0).toUpperCase() || professor.nome?.charAt(0).toUpperCase() || "P"}
                          </Text>
                        </View>
                        <Text 
                          style={[
                            styles.professorSelectName,
                            selectedProfessorId === professor.id && styles.professorSelectNameActive
                          ]}
                        >
                          {professor.usuario?.nome || professor.nome || "Professor"}
                        </Text>
                        {selectedProfessorId === professor.id && (
                          <MaterialIcons name="check-circle" size={24} color={Colors.blue_btn} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}

                <View style={styles.modalButtonContainer}>
                  <TouchableOpacity
                    style={styles.modalCancelButton}
                    onPress={handleCloseModal}
                  >
                    <Text style={styles.modalCancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.modalSaveButton,
                      (selectedProfessorId === null || isSubmitting) && styles.modalSaveButtonDisabled
                    ]}
                    onPress={vincularProfessorTurma}
                    disabled={selectedProfessorId === null || isSubmitting}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.modalSaveButtonText}>Vincular</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  turmasList: {
    marginTop: 10,
  },
  turmaCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  turmaNomeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  turmaIcon: {
    marginRight: 10,
  },
  turmaNome: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  editButton: {
    marginLeft: 'auto',
  },
  professorContainer: {
    marginTop: 4,
    marginBottom: 12,
  },
  professorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  professoresList: {
    marginTop: 4,
  },
  professorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    paddingLeft: 8,
  },
  professorNome: {
    marginLeft: 8,
    fontSize: 15,
    color: '#333',
  },
  addProfessorContainer: {
    marginTop: 8,
  },
  addProfessorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.blue_btn,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addProfessorText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#fff',
  },
  countContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  countItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  countText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#666',
  },
  modalEmptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  modalEmptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  professorSelectList: {
    maxHeight: 200,
  },
  professorSelectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  professorSelectItemActive: {
    backgroundColor: Colors.blue_btn,
  },
  professorSelectAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  professorSelectAvatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  professorSelectName: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  professorSelectNameActive: {
    color: '#fff',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalCancelButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    fontSize: 16,
    color: '#333',
  },
  modalSaveButton: {
    backgroundColor: Colors.blue_btn,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  modalSaveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  modalSaveButtonText: {
    fontSize: 16,
    color: '#fff',
  },
  confirmDeleteContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  confirmDeleteText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  confirmDeleteButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  confirmDeleteCancelButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  confirmDeleteCancelText: {
    fontSize: 16,
    color: '#333',
  },
  confirmDeleteConfirmButton: {
    backgroundColor: 'red',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  confirmDeleteConfirmText: {
    fontSize: 16,
    color: '#fff',
  },
  professorVinculadoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  professorDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  professorDetailName: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  removeButtonText: {
    fontSize: 14,
    color: 'red',
    marginLeft: 4,
  },
});
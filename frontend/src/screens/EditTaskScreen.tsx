import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTask } from '../context/TaskContext';
import TaskForm from '../components/TaskForm';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBoundary from '../components/ErrorBoundary';
import { Task, UpdateTaskData } from '../types/task';

interface EditTaskScreenProps {
  navigation: any;
  route: {
    params: {
      task: Task;
    };
  };
}

const EditTaskScreen: React.FC<EditTaskScreenProps> = ({ navigation, route }) => {
  const { task } = route.params;
  const { updateTask, state } = useTask();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task>(task);

  // Update current task when it changes in the global state
  useEffect(() => {
    const updatedTask = state.tasks.find(t => t.id === task.id);
    if (updatedTask) {
      setCurrentTask(updatedTask);
    }
  }, [state.tasks, task.id]);

  const handleSubmit = async (taskData: UpdateTaskData) => {
    setIsSubmitting(true);
    
    try {
      const updatedTask = await updateTask(currentTask.id, taskData, true); // Enable optimistic updates
      
      if (updatedTask) {
        Alert.alert(
          'Tarea Actualizada',
          'La tarea ha sido actualizada exitosamente',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        throw new Error('Error al actualizar la tarea');
      }
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Error al actualizar la tarea'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isSubmitting) {
      return;
    }

    navigation.goBack();
  };

  const handleToggleComplete = async () => {
    if (isSubmitting) {
      return;
    }

    Alert.alert(
      currentTask.completed ? 'Marcar como Pendiente' : 'Marcar como Completada',
      `¿Estás seguro de que deseas marcar esta tarea como ${currentTask.completed ? 'pendiente' : 'completada'}?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Confirmar',
          onPress: async () => {
            setIsSubmitting(true);
            try {
              await updateTask(currentTask.id, { completed: !currentTask.completed }, true);
            } catch (error) {
              Alert.alert(
                'Error',
                'Error al actualizar el estado de la tarea'
              );
            } finally {
              setIsSubmitting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleCancel}
            disabled={isSubmitting}
          >
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Editar Tarea</Text>
          
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={handleToggleComplete}
            disabled={isSubmitting}
          >
            <Ionicons
              name={currentTask.completed ? 'checkmark-circle' : 'ellipse-outline'}
              size={24}
              color={currentTask.completed ? '#4CAF50' : '#666'}
            />
          </TouchableOpacity>
        </View>

        {/* Task Status Indicator */}
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusBadge,
            currentTask.completed ? styles.completedBadge : styles.pendingBadge
          ]}>
            <Ionicons
              name={currentTask.completed ? 'checkmark' : 'time'}
              size={16}
              color="white"
            />
            <Text style={styles.statusText}>
              {currentTask.completed ? 'Completada' : 'Pendiente'}
            </Text>
          </View>
          
          {currentTask.completed && currentTask.completedBy && (
            <Text style={styles.completedByText}>
              Completada por {currentTask.completedBy.name}
            </Text>
          )}
        </View>

        <TaskForm
          task={currentTask}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={isSubmitting}
        />

        <LoadingSpinner
          visible={isSubmitting}
          message="Actualizando tarea..."
          overlay={true}
        />
      </SafeAreaView>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  toggleButton: {
    padding: 4,
  },
  statusContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
  },
  completedBadge: {
    backgroundColor: '#4CAF50',
  },
  pendingBadge: {
    backgroundColor: '#FF8C00',
  },
  statusText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  completedByText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default EditTaskScreen;
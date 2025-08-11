import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTask } from '../context/TaskContext';
import { useTheme } from '../context/ThemeContext';
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
  const { colors, isDark } = useTheme();
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

  const gradientColors = isDark 
    ? ['#1f2937', '#374151', '#4b5563']
    : ['#1e3a8a', '#3b82f6', '#60a5fa'];

  return (
    <ErrorBoundary>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <LinearGradient
          colors={gradientColors}
          style={styles.gradientHeader}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleCancel}
                disabled={isSubmitting}
              >
                <Ionicons name="arrow-back" size={24} color="white" />
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
                  color={currentTask.completed ? '#4CAF50' : 'rgba(255, 255, 255, 0.7)'}
                />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </LinearGradient>

        {/* Task Status Indicator */}
        <View style={[styles.statusContainer, { backgroundColor: colors.surface }]}>
          <View style={[
            styles.statusBadge,
            { backgroundColor: currentTask.completed ? colors.success : colors.warning }
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
            <Text style={[styles.completedByText, { color: colors.textSecondary }]}>
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
      </View>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientHeader: {
    paddingBottom: 20,
  },
  safeArea: {
    flex: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  toggleButton: {
    padding: 8,
    marginRight: -8,
  },
  statusContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  completedByText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
});

export default EditTaskScreen;
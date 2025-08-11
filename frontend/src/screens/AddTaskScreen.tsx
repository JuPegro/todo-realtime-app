import React, { useState } from 'react';
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
import { CreateTaskData } from '../types/task';

interface AddTaskScreenProps {
  navigation: any;
}

const AddTaskScreen: React.FC<AddTaskScreenProps> = ({ navigation }) => {
  const { createTask, state } = useTask();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (taskData: CreateTaskData) => {
    setIsSubmitting(true);
    
    try {
      const task = await createTask(taskData, true); // Enable optimistic updates
      
      if (task) {
        Alert.alert(
          'Tarea Creada',
          'La tarea ha sido creada exitosamente',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        throw new Error('Error al crear la tarea');
      }
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Error al crear la tarea'
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
          
          <Text style={styles.headerTitle}>Nueva Tarea</Text>
          
          <View style={styles.placeholder} />
        </View>

        <TaskForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={isSubmitting}
        />

        <LoadingSpinner
          visible={isSubmitting}
          message="Creando tarea..."
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
  placeholder: {
    width: 32, // Same width as back button for centering
  },
});

export default AddTaskScreen;
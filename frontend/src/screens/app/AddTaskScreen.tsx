import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { AppStackParamList } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { useTask } from '../../context/TaskContext';
import TaskForm from '../../components/TaskForm';
import { CreateTaskData } from '../../types/task';

type Props = StackScreenProps<AppStackParamList, 'AddTask'>;

const AddTaskScreen: React.FC<Props> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { createTask } = useTask();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const gradientColors = isDark 
    ? ['#1f2937', '#374151', '#4b5563']
    : ['#1e3a8a', '#3b82f6', '#60a5fa'];

  const handleSubmit = async (taskData: CreateTaskData) => {
    setIsSubmitting(true);
    
    try {
      const newTask = await createTask(taskData, true); // Enable optimistic updates
      
      if (newTask) {
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
      }
    } catch (error: any) {
      console.error('Error creating task:', error);
      Alert.alert(
        'Error',
        error.message || 'No se pudo crear la tarea. Inténtalo de nuevo.'
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <LinearGradient
        colors={gradientColors}
        style={styles.gradientHeader}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleCancel}
              disabled={isSubmitting}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            
            <Text style={styles.headerTitle}>Nueva Tarea</Text>
            
            <View style={styles.placeholder} />
          </View>
        </SafeAreaView>
      </LinearGradient>
      
      <TaskForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={isSubmitting}
      />
    </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
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
  placeholder: {
    width: 40, // Same width as back button for centering
  },
});

export default AddTaskScreen;
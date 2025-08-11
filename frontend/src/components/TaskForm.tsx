import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Task, CreateTaskData, UpdateTaskData } from '../types/task';

interface TaskFormProps {
  task?: Task;
  onSubmit: (data: CreateTaskData | UpdateTaskData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const TaskForm: React.FC<TaskFormProps> = ({
  task,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    priority: (task?.priority || 'LOW') as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
    type: (task?.type || 'FEATURE') as 'FEATURE' | 'BUG_FIX' | 'REFACTOR' | 'TESTING' | 'DOCUMENTATION' | 'CODE_REVIEW' | 'DEPLOYMENT' | 'RESEARCH' | 'OPTIMIZATION' | 'MAINTENANCE',
    taskDate: task?.taskDate ? new Date(task.taskDate) : null as Date | null,
    startTime: task?.startTime ? new Date(task.startTime) : null as Date | null,
    endTime: task?.endTime ? new Date(task.endTime) : null as Date | null,
  });


  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'El título es obligatorio';
    }

    if (formData.startTime && formData.endTime) {
      if (formData.startTime >= formData.endTime) {
        newErrors.time = 'La hora de inicio debe ser anterior a la hora de fin';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      // Si hay hora de inicio/fin, combinarlas con la fecha de la tarea
      let startTimeISO = undefined;
      let endTimeISO = undefined;
      
      if (formData.startTime && formData.taskDate) {
        const startDateTime = new Date(formData.taskDate);
        startDateTime.setHours(formData.startTime.getHours(), formData.startTime.getMinutes(), 0, 0);
        startTimeISO = startDateTime.toISOString();
      } else if (formData.startTime) {
        startTimeISO = formData.startTime.toISOString();
      }
      
      if (formData.endTime && formData.taskDate) {
        const endDateTime = new Date(formData.taskDate);
        endDateTime.setHours(formData.endTime.getHours(), formData.endTime.getMinutes(), 0, 0);
        endTimeISO = endDateTime.toISOString();
      } else if (formData.endTime) {
        endTimeISO = formData.endTime.toISOString();
      }

      const submitData = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        priority: formData.priority,
        type: formData.type,
        taskDate: formData.taskDate ? formData.taskDate.toISOString() : undefined,
        startTime: startTimeISO,
        endTime: endTimeISO,
      };

      await onSubmit(submitData);
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al guardar la tarea');
    }
  };

  const handleDateChange = (selectedDate: Date) => {
    setShowDatePicker(false);
    setFormData({ ...formData, taskDate: selectedDate });
  };

  const handleDateCancel = () => {
    setShowDatePicker(false);
  };

  // Helper to set time with today's date
  const setTimeWithToday = (date: Date) => {
    const today = new Date();
    return new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      date.getHours(),
      date.getMinutes(),
      0, 0
    );
  };

  const handleStartTimeChange = (selectedTime: Date) => {
    setShowStartTimePicker(false);
    setFormData({ ...formData, startTime: setTimeWithToday(selectedTime) });
  };

  const handleEndTimeChange = (selectedTime: Date) => {
    setShowEndTimePicker(false);
    setFormData({ ...formData, endTime: setTimeWithToday(selectedTime) });
  };

  const handleStartTimeCancel = () => {
    setShowStartTimePicker(false);
  };

  const handleEndTimeCancel = () => {
    setShowEndTimePicker(false);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Seleccionar fecha';
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (time: Date | null) => {
    if (!time) return 'Seleccionar hora';
    return time.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
      case 'high':
        return '#FF4444';
      case 'MEDIUM':
      case 'medium':
        return '#FF8C00';
      case 'LOW':
      case 'low':
        return '#4CAF50';
      case 'URGENT':
      case 'urgent':
        return '#FF0000';
      default:
        return '#666';
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.form}>
        {/* Title Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>
            Título <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[
              styles.input,
              errors.title && styles.inputError,
            ]}
            value={formData.title}
            onChangeText={(text) => {
              setFormData({ ...formData, title: text });
              if (errors.title) setErrors({ ...errors, title: '' });
            }}
            placeholder="Ingresa el título de la tarea"
            maxLength={100}
            editable={!loading}
          />
          {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
        </View>

        {/* Description Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Descripción</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            placeholder="Descripción opcional de la tarea"
            multiline
            numberOfLines={4}
            maxLength={500}
            editable={!loading}
          />
        </View>

        {/* Priority and Type Row */}
        <View style={styles.rowContainer}>
          <View style={styles.halfField}>
            <Text style={styles.label}>Prioridad</Text>
            <View style={[styles.pickerContainer, { borderColor: getPriorityColor(formData.priority) }]}>
              <Picker
                selectedValue={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
                enabled={!loading}
                style={styles.picker}
              >
                <Picker.Item label="Baja" value="LOW" />
                <Picker.Item label="Media" value="MEDIUM" />
                <Picker.Item label="Alta" value="HIGH" />
                <Picker.Item label="Urgente" value="URGENT" />

              </Picker>
            </View>
          </View>

          <View style={styles.halfField}>
            <Text style={styles.label}>Tipo</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
                enabled={!loading}
                style={styles.picker}
              >
                <Picker.Item label="Feature" value="FEATURE" />
                <Picker.Item label="Bug Fix" value="BUG_FIX" />
                <Picker.Item label="Refactor" value="REFACTOR" />
                <Picker.Item label="Testing" value="TESTING" />
                <Picker.Item label="Documentation" value="DOCUMENTATION" />
                <Picker.Item label="Code Review" value="CODE_REVIEW" />
                <Picker.Item label="Deployment" value="DEPLOYMENT" />
                <Picker.Item label="Research" value="RESEARCH" />
                <Picker.Item label="Optimization" value="OPTIMIZATION" />
                <Picker.Item label="Maintenance" value="MAINTENANCE" />

              </Picker>
            </View>
          </View>
        </View>

        {/* Date Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Fecha de la tarea</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
            disabled={loading}
          >
            <Ionicons name="calendar-outline" size={20} color="#666" />
            <Text style={[
              styles.dateButtonText,
              !formData.taskDate && styles.placeholderText
            ]}>
              {formatDate(formData.taskDate)}
            </Text>
            {formData.taskDate && (
              <TouchableOpacity
                onPress={() => setFormData({ ...formData, taskDate: null })}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        </View>

        {/* Time Fields */}
        <View style={styles.rowContainer}>
          <View style={styles.halfField}>
            <Text style={styles.label}>Hora de inicio</Text>
            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => setShowStartTimePicker(true)}
              disabled={loading}
            >
              <Ionicons name="time-outline" size={20} color="#666" />
              <Text style={[
                styles.timeButtonText,
                !formData.startTime && styles.placeholderText
              ]}>
                {formatTime(formData.startTime)}
              </Text>
              {formData.startTime && (
                <TouchableOpacity
                  onPress={() => setFormData({ ...formData, startTime: null })}
                  style={styles.clearButton}
                >
                  <Ionicons name="close-circle" size={16} color="#999" />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.halfField}>
            <Text style={styles.label}>Hora de fin</Text>
            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => setShowEndTimePicker(true)}
              disabled={loading}
            >
              <Ionicons name="time-outline" size={20} color="#666" />
              <Text style={[
                styles.timeButtonText,
                !formData.endTime && styles.placeholderText
              ]}>
                {formatTime(formData.endTime)}
              </Text>
              {formData.endTime && (
                <TouchableOpacity
                  onPress={() => setFormData({ ...formData, endTime: null })}
                  style={styles.clearButton}
                >
                  <Ionicons name="close-circle" size={16} color="#999" />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {errors.time && <Text style={styles.errorText}>{errors.time}</Text>}

        {/* Action Buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.submitButton]}
            onPress={handleSubmit}
            disabled={loading || !formData.title.trim()}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>
                {task ? 'Actualizar' : 'Crear'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Date Picker */}
      <DateTimePickerModal
        isVisible={showDatePicker}
        mode="date"
        onConfirm={handleDateChange}
        onCancel={handleDateCancel}
        minimumDate={new Date()}
      />

      {/* Start Time Picker */}
      <DateTimePickerModal
        isVisible={showStartTimePicker}
        mode="time"
        onConfirm={handleStartTimeChange}
        onCancel={handleStartTimeCancel}
      />

      {/* End Time Picker */}
      <DateTimePickerModal
        isVisible={showEndTimePicker}
        mode="time"
        onConfirm={handleEndTimeChange}
        onCancel={handleEndTimeCancel}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  form: {
    padding: 20,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#FF4444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  inputError: {
    borderColor: '#FF4444',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#FF4444',
    fontSize: 14,
    marginTop: 4,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  halfField: {
    flex: 0.48,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    backgroundColor: 'white',
  },
  picker: {
    height: 50,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'white',
  },
  dateButtonText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'white',
  },
  timeButtonText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  placeholderText: {
    color: '#999',
  },
  clearButton: {
    padding: 2,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    paddingBottom: 20,
  },
  button: {
    flex: 0.48,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#007AFF',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TaskForm;
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { AppStackParamList } from '../../types';

type Props = StackScreenProps<AppStackParamList, 'AddTask'>;

const AddTaskScreen: React.FC<Props> = ({ navigation }) => {
  const handleSave = () => {
    Alert.alert('Info', 'Add task functionality will be implemented next');
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Nueva Tarea</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveText}>Guardar</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.placeholder}>Formulario para crear tarea</Text>
        <Text style={styles.placeholderSub}>Se implementará en el siguiente módulo</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#343a40',
  },
  cancelText: {
    color: '#6c757d',
    fontSize: 16,
  },
  saveText: {
    color: '#007bff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  placeholder: {
    fontSize: 18,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 8,
  },
  placeholderSub: {
    fontSize: 14,
    color: '#adb5bd',
    textAlign: 'center',
  },
});

export default AddTaskScreen;
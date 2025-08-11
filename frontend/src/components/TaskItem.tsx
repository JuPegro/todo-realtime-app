import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Task } from '../types/task';
import { useTask } from '../context/TaskContext';

interface TaskItemProps {
  task: Task;
  onPress?: () => void;
  onEdit?: () => void;
  showActions?: boolean;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onPress,
  onEdit,
  showActions = true,
}) => {
  const { updateTask, deleteTask } = useTask();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleToggleComplete = async () => {
    setIsUpdating(true);
    try {
      await updateTask(task.id, { completed: !task.completed });
    } catch (error) {
      console.error('Error toggling task completion:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Eliminar Tarea',
      '¿Estás seguro de que deseas eliminar esta tarea?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              await deleteTask(task.id);
            } catch (error) {
              console.error('Error deleting task:', error);
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#FF4444';
      case 'medium':
        return '#FF8C00';
      case 'low':
        return '#4CAF50';
      default:
        return '#4CAF50';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'FEATURE':
        return 'FEATURE';
      case 'BUG_FIX':
        return 'BUG FIX';
      case 'REFACTOR':
        return 'REFACTOR';
      case 'TESTING':
        return 'TESTING';
      case 'DOCUMENTATION':
        return 'DOCS';
      case 'CODE_REVIEW':
        return 'REVIEW';
      case 'DEPLOYMENT':
        return 'DEPLOY';
      case 'RESEARCH':
        return 'RESEARCH';
      case 'OPTIMIZATION':
        return 'OPTIMIZE';
      case 'MAINTENANCE':
        return 'MAINTENANCE';
      default:
        return type || 'TASK';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'FEATURE':
        return '#3B82F6'; // Azul claro
      case 'BUG_FIX':
        return '#1D4ED8'; // Azul fuerte
      case 'REFACTOR':
        return '#1E40AF'; // Azul oscuro
      case 'TESTING':
        return '#6366F1'; // Índigo azul
      case 'DOCUMENTATION':
        return '#0EA5E9'; // Azul cielo
      case 'CODE_REVIEW':
        return '#1E3A8A'; // Azul marino
      case 'DEPLOYMENT':
        return '#0F172A'; // Azul muy oscuro
      case 'RESEARCH':
        return '#2563EB'; // Azul medio
      case 'OPTIMIZATION':
        return '#0284C7'; // Azul cian
      case 'MAINTENANCE':
        return '#475569'; // Azul grisáceo
      default:
        return '#3B82F6';
    }
  };

  const formatTime = (timeString: string | undefined) => {
    if (!timeString) return '10:00 AM';
    const time = new Date(timeString);
    return time.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getTimeRange = () => {
    if (task.startTime && task.endTime) {
      const startTime = formatTime(task.startTime);
      const endTime = formatTime(task.endTime);
      return `${startTime} - ${endTime}`;
    }
    return '11:30 - 9:30 AM';
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        task.completed && styles.completedContainer,
      ]}
      onPress={onPress}
      disabled={isUpdating || isDeleting}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          {showActions && (
            <TouchableOpacity
              style={styles.moreButton}
              onPress={onEdit}
              disabled={isUpdating || isDeleting}
            >
              <Ionicons name="ellipsis-vertical-outline" size={16} color="#999" />
            </TouchableOpacity>
          )}
          <Text style={[styles.priorityLabel, { color: getTypeColor(task.type) }]}>
            {getTypeLabel(task.type)}
          </Text>
        </View>
        
        <View style={styles.dividerLine} />

        <View style={styles.titleContainer}>
          <View style={[styles.colorLine, { backgroundColor: getTypeColor(task.type) }]} />
          <View style={styles.textContent}>
            <Text style={styles.title} numberOfLines={2}>
              {task.title}
            </Text>

            {task.description && (
              <Text style={styles.description} numberOfLines={2}>
                {task.description}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.timeContainer}>
            <Ionicons name="time-outline" size={14} color="#999" />
            <Text style={styles.timeText}>{getTimeRange()}</Text>
          </View>
          
          <View style={styles.personContainer}>
            <Ionicons name="person-outline" size={14} color="#999" />
            <Text style={styles.personText}>{task.user.name || 'Usuario'}</Text>
          </View>
        </View>

        {task.completed && (
          <View style={styles.completedOverlay}>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            <Text style={styles.completedText}>Completada</Text>
          </View>
        )}
      </View>

      {showActions && (
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={handleToggleComplete}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <ActivityIndicator size="small" color="#6366F1" />
          ) : (
            <Ionicons
              name={task.completed ? 'checkmark-circle' : 'ellipse-outline'}
              size={20}
              color={task.completed ? '#4CAF50' : '#CCC'}
            />
          )}
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginHorizontal: 20,
    marginVertical: 6,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  completedContainer: {
    opacity: 0.7,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  priorityLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  moreButton: {
    padding: 4,
    marginRight: 8,
  },
  dividerLine: {
    height: 1,
    width: '100%',
    backgroundColor: '#E5E7EB',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  colorLine: {
    width: 3,
    height: 60,
    borderRadius: 2,
    marginRight: 12,
  },
  textContent: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    lineHeight: 24,
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: '#9CA3AF',
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
    fontWeight: '500',
  },
  personContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  personText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
    fontWeight: '500',
  },
  completedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  completedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    marginLeft: 8,
  },
  toggleButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 4,
  },
});

export default TaskItem;
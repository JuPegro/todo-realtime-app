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
        return '#666';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'work':
        return 'briefcase-outline';
      case 'personal':
        return 'person-outline';
      default:
        return 'document-text-outline';
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (timeString: string | undefined) => {
    if (!timeString) return null;
    const time = new Date(timeString);
    return time.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        task.completed && styles.completedContainer,
        task.id.startsWith('temp-') && styles.optimisticContainer,
      ]}
      onPress={onPress}
      disabled={isUpdating || isDeleting}
    >
      <View style={styles.leftSection}>
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={handleToggleComplete}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : (
            <Ionicons
              name={task.completed ? 'checkmark-circle' : 'ellipse-outline'}
              size={24}
              color={task.completed ? '#4CAF50' : '#CCC'}
            />
          )}
        </TouchableOpacity>

        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Text
              style={[
                styles.title,
                task.completed && styles.completedText,
              ]}
              numberOfLines={2}
            >
              {task.title}
            </Text>
            <View style={styles.metadataRow}>
              <View
                style={[
                  styles.priorityBadge,
                  { backgroundColor: getPriorityColor(task.priority) },
                ]}
              >
                <Text style={styles.priorityText}>
                  {task.priority.toUpperCase()}
                </Text>
              </View>
              <Ionicons
                name={getTypeIcon(task.type)}
                size={16}
                color="#666"
                style={styles.typeIcon}
              />
            </View>
          </View>

          {task.description && (
            <Text
              style={[
                styles.description,
                task.completed && styles.completedText,
              ]}
              numberOfLines={2}
            >
              {task.description}
            </Text>
          )}

          <View style={styles.timeInfo}>
            {task.taskDate && (
              <Text style={styles.dateText}>
                📅 {formatDate(task.taskDate)}
              </Text>
            )}
            {task.startTime && task.endTime && (
              <Text style={styles.timeText}>
                🕐 {formatTime(task.startTime)} - {formatTime(task.endTime)}
              </Text>
            )}
          </View>

          <View style={styles.bottomRow}>
            <Text style={styles.authorText}>
              {task.user.name}
            </Text>
            {task.completed && task.completedBy && (
              <Text style={styles.completedByText}>
                ✓ {task.completedBy.name}
              </Text>
            )}
          </View>
        </View>
      </View>

      {showActions && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onEdit}
            disabled={isUpdating || isDeleting}
          >
            <Ionicons name="create-outline" size={20} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDelete}
            disabled={isUpdating || isDeleting}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color="#FF4444" />
            ) : (
              <Ionicons name="trash-outline" size={20} color="#FF4444" />
            )}
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  completedContainer: {
    opacity: 0.7,
    backgroundColor: '#F8F8F8',
  },
  optimisticContainer: {
    opacity: 0.6,
    borderWidth: 1,
    borderColor: '#DDD',
    borderStyle: 'dashed',
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
  },
  checkboxContainer: {
    paddingRight: 12,
    paddingTop: 2,
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 6,
  },
  priorityText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  typeIcon: {
    marginLeft: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  timeInfo: {
    marginBottom: 8,
  },
  dateText: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  timeText: {
    fontSize: 12,
    color: '#888',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  completedByText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    marginLeft: 12,
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  deleteButton: {
    // Additional styling for delete button if needed
  },
});

export default TaskItem;
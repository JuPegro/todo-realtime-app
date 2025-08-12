import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolateColor,
  withSequence,
  withDelay,
} from 'react-native-reanimated';
import { Task } from '../types/task';
import { useThemeColors } from '../hooks/useThemeColors';

interface AnimatedTaskItemProps {
  task: Task;
  onPress: () => void;
  onToggleComplete: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  index: number;
}

const AnimatedTaskItem: React.FC<AnimatedTaskItemProps> = ({
  task,
  onPress,
  onToggleComplete,
  onDelete,
  index,
}) => {
  const colors = useThemeColors();
  
  // Animation values
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);
  const scale = useSharedValue(0.9);
  const checkboxScale = useSharedValue(1);
  const completionProgress = useSharedValue(task.completed ? 1 : 0);
  const deleteScale = useSharedValue(1);
  const slideX = useSharedValue(0);

  // Initial entrance animation
  useEffect(() => {
    const delay = index * 100; // Stagger animation
    
    opacity.value = withDelay(delay, withTiming(1, { duration: 500 }));
    translateY.value = withDelay(delay, withSpring(0, { stiffness: 100, damping: 8 }));
    scale.value = withDelay(delay, withSpring(1, { stiffness: 150, damping: 10 }));
  }, []);

  // Completion animation
  useEffect(() => {
    completionProgress.value = withTiming(task.completed ? 1 : 0, { duration: 300 });
  }, [task.completed]);

  const handleToggleComplete = () => {
    // Animate checkbox
    checkboxScale.value = withSequence(
      withTiming(1.3, { duration: 150 }),
      withTiming(1, { duration: 150 })
    );
    
    // Trigger completion
    onToggleComplete(task.id, !task.completed);
  };

  const handleDelete = () => {
    Alert.alert(
      'Eliminar Tarea',
      '¿Estás seguro de que quieres eliminar esta tarea?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            // Animate deletion
            deleteScale.value = withTiming(0, { duration: 300 });
            slideX.value = withTiming(300, { duration: 300 }, (finished) => {
              if (finished) {
                runOnJS(onDelete)(task.id);
              }
            });
          },
        },
      ]
    );
  };

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value * deleteScale.value },
      { translateX: slideX.value },
    ],
  }));

  const checkboxStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkboxScale.value }],
    backgroundColor: interpolateColor(
      completionProgress.value,
      [0, 1],
      [colors.surface, colors.primary]
    ),
    borderColor: interpolateColor(
      completionProgress.value,
      [0, 1],
      [colors.outline, colors.primary]
    ),
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: interpolateColor(
      completionProgress.value,
      [0, 1],
      [1, 0.6]
    ),
    textDecorationLine: task.completed ? 'line-through' : 'none',
  }));

  const priorityStyle = useAnimatedStyle(() => ({
    opacity: withTiming(task.isOptimistic ? 0.5 : 1, { duration: 300 }),
  }));

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
      case 'high':
        return colors.error;
      case 'HIGH':
      case 'medium':
        return colors.warning;
      case 'MEDIUM':
      case 'low':
        return colors.success;
      case 'LOW':
      default:
        return colors.outline;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'URGENT':
      case 'high':
        return 'alert-circle';
      case 'HIGH':
      case 'medium':
        return 'warning';
      case 'MEDIUM':
      case 'low':
        return 'checkmark-circle';
      case 'LOW':
      default:
        return 'ellipse';
    }
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      marginHorizontal: 16,
      marginVertical: 6,
      padding: 16,
      elevation: 2,
      shadowColor: colors.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      borderLeftWidth: 4,
      borderLeftColor: getPriorityColor(task.priority),
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    },
    leftContent: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      marginRight: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 2,
    },
    taskContent: {
      flex: 1,
    },
    title: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.onSurface,
      marginBottom: 4,
    },
    description: {
      fontSize: 14,
      color: colors.onSurfaceVariant,
      marginBottom: 8,
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 8,
    },
    priority: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    priorityText: {
      fontSize: 12,
      fontWeight: '500',
      marginLeft: 4,
      textTransform: 'capitalize',
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    actionButton: {
      padding: 8,
      marginLeft: 8,
      borderRadius: 8,
    },
    optimisticOverlay: {
      position: 'absolute',
      top: 8,
      right: 8,
      backgroundColor: colors.warning,
      borderRadius: 10,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    optimisticText: {
      fontSize: 10,
      color: colors.onWarning,
      fontWeight: '600',
    },
    createdBy: {
      fontSize: 12,
      color: colors.onSurfaceVariant,
      fontStyle: 'italic',
      marginTop: 4,
    },
  });

  return (
    <Animated.View style={[containerStyle]}>
      <TouchableOpacity
        style={styles.container}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {task.isOptimistic && (
          <View style={styles.optimisticOverlay}>
            <Text style={styles.optimisticText}>SYNC</Text>
          </View>
        )}
        
        <View style={styles.header}>
          <View style={styles.leftContent}>
            <TouchableOpacity onPress={handleToggleComplete}>
              <Animated.View style={[styles.checkbox, checkboxStyle]}>
                {task.completed && (
                  <Ionicons name="checkmark" size={16} color={colors.onPrimary} />
                )}
              </Animated.View>
            </TouchableOpacity>
            
            <View style={styles.taskContent}>
              <Animated.Text style={[styles.title, titleStyle]}>
                {task.title}
              </Animated.Text>
              
              {task.description && (
                <Text style={styles.description} numberOfLines={2}>
                  {task.description}
                </Text>
              )}
              
              <View style={styles.footer}>
                <Animated.View style={[styles.priority, priorityStyle]}>
                  <Ionicons
                    name={getPriorityIcon(task.priority)}
                    size={14}
                    color={getPriorityColor(task.priority)}
                  />
                  <Text
                    style={[
                      styles.priorityText,
                      { color: getPriorityColor(task.priority) },
                    ]}
                  >
                    {task.priority?.toLowerCase()}
                  </Text>
                </Animated.View>
                
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={onPress}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="create-outline" size={18} color={colors.primary} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleDelete}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="trash-outline" size={18} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
              
              {task.createdBy && (
                <Text style={styles.createdBy}>
                  Por: {task.user?.name || task.createdBy}
                </Text>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default AnimatedTaskItem;
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, SafeAreaView, FlatList, RefreshControl } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { AppStackParamList } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useTask } from '../../context/TaskContext';

type Props = StackScreenProps<AppStackParamList, 'TaskList'>;

const TaskListScreen: React.FC<Props> = ({ navigation }) => {
  const { logout, user } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const { state, fetchTasks, refreshTasks, deleteTask } = useTask();

  // Load tasks when component mounts
  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAddTask = () => {
    navigation.navigate('AddTask');
  };

  const handleRefresh = async () => {
    try {
      await refreshTasks();
    } catch (error) {
      console.error('Error refreshing tasks:', error);
    }
  };

  const handleDeleteTask = (taskId: string, taskTitle: string) => {
    Alert.alert(
      'Eliminar Tarea',
      `¿Estás seguro de que deseas eliminar "${taskTitle}"?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTask(taskId, true); // Enable optimistic updates
            } catch (error: any) {
              Alert.alert('Error', error.message || 'No se pudo eliminar la tarea');
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert('Error', 'No se pudo cerrar la sesión');
            }
          },
        },
      ]
    );
  };

  const gradientColors = isDark 
    ? ['#1f2937', '#374151', '#4b5563']
    : ['#1e3a8a', '#3b82f6', '#60a5fa'];

  // Helper functions for task display
  const getPriorityColor = (priority: string, isDark: boolean) => {
    const colors = {
      LOW: isDark ? '#10b981' : '#059669',
      MEDIUM: isDark ? '#f59e0b' : '#d97706', 
      HIGH: isDark ? '#f97316' : '#ea580c',
      URGENT: isDark ? '#ef4444' : '#dc2626',
    };
    return colors[priority as keyof typeof colors] || colors.LOW;
  };

  const getPriorityLabel = (priority: string) => {
    const labels = {
      LOW: '●',
      MEDIUM: '●●', 
      HIGH: '●●●',
      URGENT: '🔥',
    };
    return labels[priority as keyof typeof labels] || '●';
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      FEATURE: 'star-outline',
      BUG_FIX: 'bug-outline',
      REFACTOR: 'code-slash-outline',
      TESTING: 'flask-outline',
      DOCUMENTATION: 'document-text-outline',
      CODE_REVIEW: 'eye-outline',
      DEPLOYMENT: 'rocket-outline',
      RESEARCH: 'search-outline',
      OPTIMIZATION: 'speedometer-outline',
      MAINTENANCE: 'construct-outline',
    };
    return icons[type as keyof typeof icons] || 'ellipse-outline';
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      FEATURE: 'Feature',
      BUG_FIX: 'Bug',
      REFACTOR: 'Refactor',
      TESTING: 'Test',
      DOCUMENTATION: 'Docs',
      CODE_REVIEW: 'Review',
      DEPLOYMENT: 'Deploy',
      RESEARCH: 'Research',
      OPTIMIZATION: 'Optimize',
      MAINTENANCE: 'Maintenance',
    };
    return labels[type as keyof typeof labels] || type;
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
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Mis Tareas</Text>
              {user && <Text style={styles.userName}>¡Hola, {user.name}!</Text>}
            </View>
            <TouchableOpacity style={[styles.logoutButton, { backgroundColor: colors.error }]} onPress={handleLogout}>
              <Text style={styles.logoutText}>Salir</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
      
      <View style={styles.content}>
        <FlatList
          data={state.tasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.taskCard, { backgroundColor: colors.surface, shadowColor: colors.text }]}>
              <View style={styles.taskContent}>
                {/* Top Row - Status indicator line */}
                <View style={[
                  styles.statusIndicator,
                  { backgroundColor: item.completed ? colors.success : colors.primary }
                ]} />
                
                {/* Header with title and completion icon */}
                <View style={styles.taskHeader}>
                  <View style={styles.titleRow}>
                    <View style={[
                      styles.completionIcon,
                      { 
                        backgroundColor: item.completed ? colors.success : colors.card,
                        borderColor: item.completed ? colors.success : colors.border,
                      }
                    ]}>
                      {item.completed && (
                        <Ionicons name="checkmark" size={14} color="white" />
                      )}
                    </View>
                    <Text 
                      style={[
                        styles.taskTitle, 
                        { 
                          color: item.completed ? colors.textSecondary : colors.text,
                          textDecorationLine: item.completed ? 'line-through' : 'none'
                        }
                      ]} 
                      numberOfLines={2}
                    >
                      {item.title}
                    </Text>
                  </View>
                  
                  {/* Actions row */}
                  <View style={styles.actionsRow}>
                    {/* Priority badge */}
                    <View style={[
                      styles.priorityBadge,
                      { 
                        backgroundColor: getPriorityColor(item.priority, isDark),
                      }
                    ]}>
                      <Text style={styles.priorityText}>
                        {getPriorityLabel(item.priority)}
                      </Text>
                    </View>
                    
                    {/* Edit button */}
                    <TouchableOpacity
                      style={[styles.editButton, { backgroundColor: colors.primary }]}
                      onPress={() => navigation.navigate('EditTask', { task: item })}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="pencil" size={14} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Description */}
                {item.description && (
                  <Text style={[styles.taskDescription, { color: colors.textSecondary }]} numberOfLines={3}>
                    {item.description}
                  </Text>
                )}

                {/* Footer with metadata */}
                <View style={styles.taskFooter}>
                  <View style={styles.metadataRow}>
                    {item.type && (
                      <View style={styles.typeTag}>
                        <Ionicons 
                          name={getTypeIcon(item.type)} 
                          size={12} 
                          color={colors.primary} 
                        />
                        <Text style={[styles.typeText, { color: colors.primary }]}>
                          {getTypeLabel(item.type)}
                        </Text>
                      </View>
                    )}
                    
                    {item.taskDate && (
                      <View style={styles.dateTag}>
                        <Ionicons name="calendar-outline" size={12} color={colors.placeholder} />
                        <Text style={[styles.dateText, { color: colors.placeholder }]}>
                          {new Date(item.taskDate).toLocaleDateString()}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
              
              {/* Delete button */}
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteTask(item.id, item.title)}
                activeOpacity={0.7}
              >
                <View style={[styles.deleteIconContainer, { backgroundColor: colors.error }]}>
                  <Ionicons name="trash-outline" size={16} color="white" />
                </View>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No hay tareas aún</Text>
              <Text style={[styles.emptySubtext, { color: colors.placeholder }]}>Agrega tu primera tarea para comenzar</Text>
            </View>
          )}
          refreshControl={
            <RefreshControl
              refreshing={state.loading}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      </View>
      
      <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary, shadowColor: colors.text }]} onPress={handleAddTask}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
      
      {/* Theme Button in Top-Right */}
      <TouchableOpacity
        style={[styles.topRightThemeButton, { backgroundColor: colors.primary, shadowColor: colors.text }]}
        onPress={toggleTheme}
      >
        <Ionicons 
          name={isDark ? 'sunny' : 'moon'} 
          size={20} 
          color="white" 
        />
      </TouchableOpacity>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  userName: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
    fontWeight: '500',
  },
  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  logoutText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexGrow: 1,
  },
  taskCard: {
    borderRadius: 16,
    marginBottom: 16,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
  },
  taskContent: {
    padding: 0,
  },
  statusIndicator: {
    height: 4,
    width: '100%',
  },
  taskHeader: {
    padding: 16,
    paddingBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  completionIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    lineHeight: 22,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  priorityText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  editButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  taskDescription: {
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  taskFooter: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  dateTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 12,
  },
  deleteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
  },
  deleteIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: {
    color: 'white',
    fontSize: 24,
    fontWeight: '600',
  },
  topRightThemeButton: {
    position: 'absolute',
    top: 10,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    zIndex: 1000,
  },
});

export default TaskListScreen;
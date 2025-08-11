import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTask } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import TaskItem from '../components/TaskItem';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import ErrorBoundary from '../components/ErrorBoundary';
import { Task } from '../types/task';

interface TaskListScreenProps {
  navigation: any;
}

const TaskListScreen: React.FC<TaskListScreenProps> = ({ navigation }) => {
  const {
    state,
    fetchTasks,
    refreshTasks,
    loadMoreTasks,
    setSearchQuery,
    setFilters,
    clearError,
    getAllTasks,
  } = useTask();
  
  const { logout, user } = useAuth();

  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [activePriorityFilter, setActivePriorityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // Debounced search
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      setSearchQuery(searchText);
    }, 300);

    setSearchTimeout(timeout);

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [searchText, setSearchQuery]);

  // Load tasks on screen focus
  useFocusEffect(
    useCallback(() => {
      if (state.tasks.length === 0) {
        fetchTasks();
      }
    }, [])
  );

  // Apply filters
  const filteredTasks = useMemo(() => {
    const allTasks = getAllTasks();
    
    return allTasks.filter(task => {
      // Completion filter
      if (activeFilter === 'completed' && !task.completed) return false;
      if (activeFilter === 'pending' && task.completed) return false;

      // Priority filter
      if (activePriorityFilter !== 'all' && task.priority !== activePriorityFilter) return false;

      return true;
    });
  }, [getAllTasks, activeFilter, activePriorityFilter]);

  const handleRefresh = async () => {
    try {
      await refreshTasks();
    } catch (error) {
      console.error('Error refreshing tasks:', error);
    }
  };

  const handleLoadMore = async () => {
    if (state.currentPage < state.totalPages && !state.loading) {
      await loadMoreTasks();
    }
  };

  const handleTaskPress = (task: Task) => {
    navigation.navigate('TaskDetail', { taskId: task.id });
  };

  const handleEditTask = (task: Task) => {
    navigation.navigate('EditTask', { task });
  };

  const handleAddTask = () => {
    navigation.navigate('AddTask');
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
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
              Alert.alert('Error', 'No se pudo cerrar sesión');
            }
          },
        },
      ]
    );
  };

  const handleFilterChange = (filter: 'all' | 'completed' | 'pending') => {
    setActiveFilter(filter);
    setFilters({
      completed: filter === 'all' ? undefined : filter === 'completed',
    });
  };

  const handlePriorityFilterChange = (priority: 'all' | 'low' | 'medium' | 'high') => {
    setActivePriorityFilter(priority);
    setFilters({
      priority: priority === 'all' ? undefined : priority,
    });
  };

  const renderTaskItem = ({ item }: { item: Task }) => (
    <TaskItem
      task={item}
      onPress={() => handleTaskPress(item)}
      onEdit={() => handleEditTask(item)}
      showActions={true}
    />
  );

  const renderEmpty = () => {
    if (state.loading && state.tasks.length === 0) {
      return null;
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="document-text-outline" size={64} color="#CCC" />
        <Text style={styles.emptyTitle}>
          {searchText ? 'No se encontraron tareas' : 'No tienes tareas aún'}
        </Text>
        <Text style={styles.emptyDescription}>
          {searchText 
            ? 'Intenta buscar con otros términos' 
            : 'Crea tu primera tarea tocando el botón +'
          }
        </Text>
        {!searchText && (
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={handleAddTask}
          >
            <Text style={styles.emptyButtonText}>Crear Tarea</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar tareas..."
          value={searchText}
          onChangeText={setSearchText}
          returnKeyType="search"
        />
        {searchText.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchText('')}
            style={styles.clearButton}
          >
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Status Filters */}
      <View style={styles.filtersContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === 'all' && styles.filterButtonActive
          ]}
          onPress={() => handleFilterChange('all')}
        >
          <Text style={[
            styles.filterButtonText,
            activeFilter === 'all' && styles.filterButtonTextActive
          ]}>
            Todas ({filteredTasks.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === 'pending' && styles.filterButtonActive
          ]}
          onPress={() => handleFilterChange('pending')}
        >
          <Text style={[
            styles.filterButtonText,
            activeFilter === 'pending' && styles.filterButtonTextActive
          ]}>
            Pendientes ({filteredTasks.filter(t => !t.completed).length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === 'completed' && styles.filterButtonActive
          ]}
          onPress={() => handleFilterChange('completed')}
        >
          <Text style={[
            styles.filterButtonText,
            activeFilter === 'completed' && styles.filterButtonTextActive
          ]}>
            Completadas ({filteredTasks.filter(t => t.completed).length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Priority Filters */}
      <View style={styles.priorityFiltersContainer}>
        {(['all', 'high', 'medium', 'low'] as const).map((priority) => (
          <TouchableOpacity
            key={priority}
            style={[
              styles.priorityFilterButton,
              activePriorityFilter === priority && styles.priorityFilterButtonActive,
              priority !== 'all' && { borderColor: getPriorityColor(priority) }
            ]}
            onPress={() => handlePriorityFilterChange(priority)}
          >
            <Text style={[
              styles.priorityFilterText,
              activePriorityFilter === priority && styles.priorityFilterTextActive
            ]}>
              {priority === 'all' ? 'Todas' : priority.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#FF4444';
      case 'medium': return '#FF8C00';
      case 'low': return '#4CAF50';
      default: return '#666';
    }
  };

  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.container}>
        <View style={styles.titleContainer}>
          <Text style={styles.screenTitle}>Mis Tareas</Text>
          <Text style={styles.welcomeText}>Hola, {user?.name || user?.email}</Text>
        </View>

        {state.error && (
          <ErrorMessage
            message={state.error}
            onRetry={() => {
              clearError();
              fetchTasks();
            }}
            onDismiss={clearError}
          />
        )}

        <FlatList
          data={filteredTasks}
          renderItem={renderTaskItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={state.loading && state.tasks.length > 0}
              onRefresh={handleRefresh}
              colors={['#007AFF']}
              tintColor="#007AFF"
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />

        {state.loading && state.tasks.length === 0 && (
          <LoadingSpinner visible={true} message="Cargando tareas..." />
        )}

        {state.loading && state.tasks.length > 0 && (
          <View style={styles.loadingMore}>
            <LoadingSpinner visible={true} message="Cargando más..." />
          </View>
        )}

        {/* Bottom Action Buttons */}
        <View style={styles.bottomButtons}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={24} color="white" />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.addTaskButton}
            onPress={handleAddTask}
          >
            <Ionicons name="add" size={28} color="white" />
            <Text style={styles.addTaskButtonText}>Nueva Tarea</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  titleContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  bottomButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    justifyContent: 'space-between',
  },
  logoutButton: {
    flex: 0.45,
    flexDirection: 'row',
    backgroundColor: '#FF4444',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  addTaskButton: {
    flex: 0.45,
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addTaskButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  header: {
    backgroundColor: 'white',
    paddingVertical: 16,
    marginBottom: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 4,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  priorityFiltersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    justifyContent: 'space-around',
  },
  priorityFilterButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#DDD',
    backgroundColor: 'white',
  },
  priorityFilterButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  priorityFilterText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
  },
  priorityFilterTextActive: {
    color: 'white',
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingMore: {
    paddingVertical: 16,
  },
});

export default TaskListScreen;
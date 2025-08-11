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
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <Ionicons name="search" size={20} color="#666" />
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
      <LinearGradient
        colors={['#10243D', '#159DD9', '#2E70E8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <StatusBar style="light" backgroundColor="transparent" translucent />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={handleLogout} style={styles.backButton}>
              <Ionicons name="menu" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Mis Tareas</Text>
            <TouchableOpacity onPress={handleAddTask} style={styles.menuButton}>
              <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        <View style={styles.content}>
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
            ListHeaderComponent={renderSearchBar}
            ListEmptyComponent={renderEmpty}
            refreshControl={
              <RefreshControl
                refreshing={state.loading && state.tasks.length > 0}
                onRefresh={handleRefresh}
                colors={['#159DD9']}
                tintColor="#159DD9"
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
        </View>
      </LinearGradient>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    paddingTop: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  menuButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -20,
    paddingTop: 30,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 4,
  },
  listContent: {
    paddingBottom: 100,
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
    backgroundColor: '#159DD9',
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
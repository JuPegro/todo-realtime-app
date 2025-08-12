import React, { Suspense, lazy } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ActivityIndicator } from 'react-native';
import TaskListScreen from '../screens/app/TaskListScreen';
import { AppStackParamList } from '../types';

// Lazy loaded screens
const AddTaskScreen = lazy(() => import('../screens/app/AddTaskScreen'));
const EditTaskScreen = lazy(() => import('../screens/EditTaskScreen'));

const Stack = createStackNavigator<AppStackParamList>();

// Loading component for lazy screens
const LazyScreenLoader: React.FC = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
    <ActivityIndicator size="large" color="#159DD9" />
  </View>
);

// HOC to wrap lazy screens with Suspense
const withLazyScreen = (Component: React.LazyExoticComponent<React.ComponentType<any>>) => {
  return (props: any) => (
    <Suspense fallback={<LazyScreenLoader />}>
      <Component {...props} />
    </Suspense>
  );
};

const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="TaskList"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="TaskList" component={TaskListScreen} />
      <Stack.Screen 
        name="AddTask" 
        component={withLazyScreen(AddTaskScreen)}
        options={{
          presentation: 'modal',
          animationTypeForReplace: 'push',
        }}
      />
      <Stack.Screen 
        name="EditTask" 
        component={withLazyScreen(EditTaskScreen)}
        options={{
          presentation: 'modal',
          animationTypeForReplace: 'push',
        }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
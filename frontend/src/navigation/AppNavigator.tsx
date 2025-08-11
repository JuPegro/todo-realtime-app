import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import TaskListScreen from '../screens/app/TaskListScreen';
import AddTaskScreen from '../screens/app/AddTaskScreen';
import EditTaskScreen from '../screens/EditTaskScreen';
import { AppStackParamList } from '../types';

const Stack = createStackNavigator<AppStackParamList>();

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
        component={AddTaskScreen}
        options={{
          presentation: 'modal',
          animationTypeForReplace: 'push',
        }}
      />
      <Stack.Screen 
        name="EditTask" 
        component={EditTaskScreen}
        options={{
          presentation: 'modal',
          animationTypeForReplace: 'push',
        }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TaskListScreen, AddTaskScreen } from '../screens';
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
      <Stack.Screen name="AddTask" component={AddTaskScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
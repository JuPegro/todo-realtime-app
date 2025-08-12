import React, { Suspense, lazy } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ActivityIndicator } from 'react-native';
import { AuthStackParamList } from '../types';

// Lazy loaded screens
const LoginScreen = lazy(() => import('../screens/auth/LoginScreen'));
const RegisterScreen = lazy(() => import('../screens/auth/RegisterScreen'));

const Stack = createStackNavigator<AuthStackParamList>();

// Loading component for lazy screens
const LazyScreenLoader: React.FC = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#10243D' }}>
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

const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="Login" 
        component={withLazyScreen(LoginScreen)} 
      />
      <Stack.Screen 
        name="Register" 
        component={withLazyScreen(RegisterScreen)} 
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
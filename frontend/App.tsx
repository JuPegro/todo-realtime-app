import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { TaskProvider } from './src/context/TaskContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import RootNavigator from './src/navigation/RootNavigator';
import LoadingScreen from './src/components/LoadingScreen';
import ErrorBoundary from './src/components/ErrorBoundary';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { isDark, colors } = useTheme();

  if (isLoading) {
    return <LoadingScreen />;
  }

  const navigationTheme = isDark ? {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: colors.background,
      card: colors.surface,
      border: colors.border,
      text: colors.text,
    },
  } : {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: colors.background,
      card: colors.surface,
      border: colors.border,
      text: colors.text,
    },
  };

  console.log('App - isDark:', isDark, 'navigationTheme.colors.background:', navigationTheme.colors.background);

  return (
    <NavigationContainer theme={navigationTheme}>
      <TaskProvider>
        <RootNavigator isAuthenticated={isAuthenticated} />
      </TaskProvider>
      <StatusBar style={isDark ? "light" : "dark"} />
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <ThemeProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

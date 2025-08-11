import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const LoadingScreen: React.FC = () => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Realtime Todo</Text>
        <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} />
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Verificando sesión...</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 32,
  },
  spinner: {
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default LoadingScreen;
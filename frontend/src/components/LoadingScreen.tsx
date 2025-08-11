import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

const LoadingScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Realtime Todo</Text>
        <ActivityIndicator size="large" color="#007bff" style={styles.spinner} />
        <Text style={styles.subtitle}>Verificando sesión...</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
    color: '#343a40',
    marginBottom: 32,
  },
  spinner: {
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#495057',
    textAlign: 'center',
  },
});

export default LoadingScreen;